import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, receipts, productIngredients, products, inventory as inventoryTable } from "@sepupus-account/db";
import { eq, desc, and, gte, lte, ilike } from "drizzle-orm";

export const receiptsRouter = router({
	// Get all receipts with filters
	getAll: protectedProcedure
		.input(
			z.object({
				category: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				search: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			})
		)
		.query(async ({ input, ctx }) => {
			const conditions = [];
			
			if (input.category) {
				conditions.push(eq(receipts.category, input.category));
			}
			
			if (input.startDate) {
				conditions.push(gte(receipts.date, new Date(input.startDate)));
			}
			
			if (input.endDate) {
				conditions.push(lte(receipts.date, new Date(input.endDate)));
			}
			
			if (input.search) {
				conditions.push(ilike(receipts.title, `%${input.search}%`));
			}

			const allReceipts = await db
				.select()
				.from(receipts)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(receipts.date))
				.limit(input.limit)
				.offset(input.offset);

			return allReceipts;
		}),

	// Get receipt by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const receipt = await db
				.select()
				.from(receipts)
				.where(eq(receipts.id, input.id))
				.limit(1);

			return receipt[0];
		}),

	// Create receipt
	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				amount: z.string(),
				date: z.string(),
				category: z.string(),
				type: z.enum(["income", "expense"]).default("expense"),
				items: z.array(z.object({
					productId: z.string().uuid(),
					quantity: z.number(),
				})).optional(),
				paymentMethod: z.string().optional(),
				description: z.string().optional(),
				fileUrl: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			// Wrap in transaction for atomicity
			return await db.transaction(async (tx) => {
				// Create the receipt
				const newReceipt = await tx
					.insert(receipts)
					.values({
						title: input.title,
						amount: input.amount,
						date: new Date(input.date),
						category: input.category,
						type: input.type,
						items: input.items ? JSON.stringify(input.items) : null,
						paymentMethod: input.paymentMethod,
						description: input.description,
						fileUrl: input.fileUrl,
						createdById: ctx.session.user.id,
					})
					.returning();

				// If income type with items, deduct inventory
				if (input.type === "income" && input.items && input.items.length > 0) {
					// Process each product sold
					for (const item of input.items) {
						// Get product ingredients
						const ingredients = await tx
							.select()
							.from(productIngredients)
							.where(eq(productIngredients.productId, item.productId));

						// For each ingredient, deduct from inventory
						for (const ingredient of ingredients) {
							// Calculate quantity to deduct (ingredient.quantity * item.quantity)
							const quantityToDeduct = (
								parseFloat(ingredient.quantity) * item.quantity
							).toString();

							// Get current inventory item
							const invItem = await tx
								.select()
								.from(inventoryTable)
								.where(eq(inventoryTable.id, ingredient.inventoryId))
								.limit(1);

							if (!invItem[0]) {
								throw new Error(`Inventory item ${ingredient.inventoryId} not found`);
							}

							const currentQty = parseFloat(invItem[0].quantity);
							const deductQty = parseFloat(quantityToDeduct);

							if (currentQty < deductQty) {
								throw new Error(
									`Insufficient stock for ${invItem[0].name}. Required: ${deductQty}, Available: ${currentQty}`
								);
							}

							const newQuantity = (currentQty - deductQty).toString();

							// Deduct from inventory
							await tx
								.update(inventoryTable)
								.set({
									quantity: newQuantity,
									lastUpdated: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(inventoryTable.id, ingredient.inventoryId));
						}
					}
				}

				return newReceipt[0];
			});
		}),

	// Update receipt
	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				amount: z.string().optional(),
				date: z.string().optional(),
				category: z.string().optional(),
				type: z.enum(["income", "expense"]).optional(),
				items: z.array(z.object({
					productId: z.string().uuid(),
					quantity: z.number(),
				})).optional(),
				paymentMethod: z.string().optional(),
				description: z.string().optional(),
				fileUrl: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			
			const updateData: any = { ...data, updatedAt: new Date() };
			if (data.date) {
				updateData.date = new Date(data.date);
			}
			if (data.items !== undefined) {
				updateData.items = data.items ? JSON.stringify(data.items) : null;
			}

			const updatedReceipt = await db
				.update(receipts)
				.set(updateData)
				.where(eq(receipts.id, id))
				.returning();

			return updatedReceipt[0];
		}),

	// Delete receipt
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(receipts).where(eq(receipts.id, input.id));
			return { success: true };
		}),
});

