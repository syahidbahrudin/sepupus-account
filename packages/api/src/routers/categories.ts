import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, categories } from "@sepupus-account/db";
import { eq, desc } from "drizzle-orm";

export const categoriesRouter = router({
	// Get all categories
	getAll: protectedProcedure
		.input(
			z.object({
				type: z.enum(["receipt", "expense", "both"]).optional(),
			})
		)
		.query(async ({ input }) => {
			let query = db.select().from(categories).orderBy(desc(categories.name));
			
			if (input.type) {
				query = query.where(eq(categories.type, input.type));
			}

			return await query;
		}),

	// Get category by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const category = await db
				.select()
				.from(categories)
				.where(eq(categories.id, input.id))
				.limit(1);

			return category[0];
		}),

	// Create category
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				type: z.enum(["receipt", "expense", "both"]).default("both"),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const newCategory = await db
				.insert(categories)
				.values(input)
				.returning();

			return newCategory[0];
		}),

	// Update category
	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().optional(),
				type: z.enum(["receipt", "expense", "both"]).optional(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const updatedCategory = await db
				.update(categories)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(categories.id, id))
				.returning();

			return updatedCategory[0];
		}),

	// Delete category
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(categories).where(eq(categories.id, input.id));
			return { success: true };
		}),
});

