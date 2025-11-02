import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, products, productIngredients, inventory as inventoryTable } from "@sepupus-account/db";
import { eq, desc, and, ilike } from "drizzle-orm";

export const productsRouter = router({
	// Get all products with filters
	getAll: protectedProcedure
		.input(
			z.object({
				category: z.string().optional(),
				search: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			})
		)
		.query(async ({ input }) => {
			const conditions = [];

			if (input.category) {
				conditions.push(eq(products.category, input.category));
			}

			if (input.search) {
				conditions.push(ilike(products.name, `%${input.search}%`));
			}

			const allProducts = await db
				.select()
				.from(products)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(products.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			return allProducts;
		}),

	// Get product by ID with ingredients
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const product = await db
				.select()
				.from(products)
				.where(eq(products.id, input.id))
				.limit(1);

			if (!product[0]) {
				return null;
			}

			const ingredients = await db
				.select({
					id: productIngredients.id,
					inventoryId: productIngredients.inventoryId,
					quantity: productIngredients.quantity,
					inventoryName: inventoryTable.name,
					inventoryUnit: inventoryTable.unit,
				})
				.from(productIngredients)
				.innerJoin(inventoryTable, eq(productIngredients.inventoryId, inventoryTable.id))
				.where(eq(productIngredients.productId, input.id));

			return {
				...product[0],
				ingredients,
			};
		}),

	// Create product
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				price: z.string(),
				category: z.string().min(1),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const newProduct = await db
				.insert(products)
				.values(input)
				.returning();

			return newProduct[0];
		}),

	// Update product
	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().optional(),
				price: z.string().optional(),
				category: z.string().optional(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const updatedProduct = await db
				.update(products)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(products.id, id))
				.returning();

			return updatedProduct[0];
		}),

	// Delete product
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(products).where(eq(products.id, input.id));
			return { success: true };
		}),

	// Get ingredients for a product
	getIngredients: protectedProcedure
		.input(z.object({ productId: z.string().uuid() }))
		.query(async ({ input }) => {
			const ingredients = await db
				.select({
					id: productIngredients.id,
					inventoryId: productIngredients.inventoryId,
					quantity: productIngredients.quantity,
					inventoryName: inventoryTable.name,
					inventoryUnit: inventoryTable.unit,
					inventoryType: inventoryTable.type,
				})
				.from(productIngredients)
				.innerJoin(inventoryTable, eq(productIngredients.inventoryId, inventoryTable.id))
				.where(eq(productIngredients.productId, input.productId));

			return ingredients;
		}),

	// Add ingredient to product
	addIngredient: protectedProcedure
		.input(
			z.object({
				productId: z.string().uuid(),
				inventoryId: z.string().uuid(),
				quantity: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const newIngredient = await db
				.insert(productIngredients)
				.values({
					productId: input.productId,
					inventoryId: input.inventoryId,
					quantity: input.quantity,
				})
				.returning();

			return newIngredient[0];
		}),

	// Remove ingredient from product
	removeIngredient: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(productIngredients).where(eq(productIngredients.id, input.id));
			return { success: true };
		}),
});

