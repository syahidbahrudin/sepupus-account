import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, inventory as inventoryTable } from "@sepupus-account/db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export const inventoryRouter = router({
	// Get all inventory items with filters
	getAll: protectedProcedure
		.input(
			z.object({
				type: z.enum(["kekal", "tidak_kekal"]).optional(),
				search: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			})
		)
		.query(async ({ input }) => {
			const conditions = [];

			if (input.type) {
				conditions.push(eq(inventoryTable.type, input.type));
			}

			if (input.search) {
				conditions.push(ilike(inventoryTable.name, `%${input.search}%`));
			}

			const allInventory = await db
				.select()
				.from(inventoryTable)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(inventoryTable.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			return allInventory;
		}),

	// Get inventory item by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const item = await db
				.select()
				.from(inventoryTable)
				.where(eq(inventoryTable.id, input.id))
				.limit(1);

			return item[0];
		}),

	// Create inventory item
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				type: z.enum(["kekal", "tidak_kekal"]),
				quantity: z.string(),
				unit: z.string().min(1),
				costPerUnit: z.string(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const newItem = await db
				.insert(inventoryTable)
				.values({
					name: input.name,
					type: input.type,
					quantity: input.quantity,
					unit: input.unit,
					costPerUnit: input.costPerUnit,
					description: input.description,
				})
				.returning();

			return newItem[0];
		}),

	// Update inventory item
	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().optional(),
				type: z.enum(["kekal", "tidak_kekal"]).optional(),
				quantity: z.string().optional(),
				unit: z.string().optional(),
				costPerUnit: z.string().optional(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const updateData: any = { ...data, updatedAt: new Date() };
			if (data.quantity !== undefined) {
				updateData.lastUpdated = new Date();
			}

			const updatedItem = await db
				.update(inventoryTable)
				.set(updateData)
				.where(eq(inventoryTable.id, id))
				.returning();

			return updatedItem[0];
		}),

	// Delete inventory item
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(inventoryTable).where(eq(inventoryTable.id, input.id));
			return { success: true };
		}),

	// Deduct quantity (used when products are sold)
	deduct: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				quantity: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			// Get current quantity
			const currentItem = await db
				.select()
				.from(inventoryTable)
				.where(eq(inventoryTable.id, input.id))
				.limit(1);

			if (!currentItem[0]) {
				throw new Error("Inventory item not found");
			}

			const currentQty = parseFloat(currentItem[0].quantity);
			const deductQty = parseFloat(input.quantity);

			if (currentQty < deductQty) {
				throw new Error("Insufficient stock");
			}

			const newQuantity = (currentQty - deductQty).toString();

			const updatedItem = await db
				.update(inventoryTable)
				.set({
					quantity: newQuantity,
					lastUpdated: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(inventoryTable.id, input.id))
				.returning();

			return updatedItem[0];
		}),

	// Add stock quantity
	addStock: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				quantity: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			// Get current quantity
			const currentItem = await db
				.select()
				.from(inventoryTable)
				.where(eq(inventoryTable.id, input.id))
				.limit(1);

			if (!currentItem[0]) {
				throw new Error("Inventory item not found");
			}

			const currentQty = parseFloat(currentItem[0].quantity);
			const addQty = parseFloat(input.quantity);
			const newQuantity = (currentQty + addQty).toString();

			const updatedItem = await db
				.update(inventoryTable)
				.set({
					quantity: newQuantity,
					lastUpdated: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(inventoryTable.id, input.id))
				.returning();

			return updatedItem[0];
		}),
});

