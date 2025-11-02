import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, expenses } from "@sepupus-account/db";
import { eq, desc, and, gte, lte, ilike } from "drizzle-orm";

export const expensesRouter = router({
	// Get all expenses with filters
	getAll: protectedProcedure
		.input(
			z.object({
				department: z.string().optional(),
				category: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				search: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			})
		)
		.query(async ({ input }) => {
			const conditions = [];
			
			if (input.department) {
				conditions.push(eq(expenses.department, input.department));
			}
			
			if (input.category) {
				conditions.push(eq(expenses.category, input.category));
			}
			
			if (input.startDate) {
				conditions.push(gte(expenses.date, new Date(input.startDate)));
			}
			
			if (input.endDate) {
				conditions.push(lte(expenses.date, new Date(input.endDate)));
			}
			
			if (input.search) {
				conditions.push(ilike(expenses.title, `%${input.search}%`));
			}

			const allExpenses = await db
				.select()
				.from(expenses)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(expenses.date))
				.limit(input.limit)
				.offset(input.offset);

			return allExpenses;
		}),

	// Get expense by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const expense = await db
				.select()
				.from(expenses)
				.where(eq(expenses.id, input.id))
				.limit(1);

			return expense[0];
		}),

	// Create expense
	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				amount: z.string(),
				department: z.string().min(1),
				category: z.string().min(1),
				date: z.string(),
				description: z.string().optional(),
				vendor: z.string().optional(),
				paymentMethod: z.string().optional(),
				receiptUrl: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const newExpense = await db
				.insert(expenses)
				.values({
					...input,
					date: new Date(input.date),
					createdById: ctx.session.user.id,
				})
				.returning();

			return newExpense[0];
		}),

	// Update expense
	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				amount: z.string().optional(),
				department: z.string().optional(),
				category: z.string().optional(),
				date: z.string().optional(),
				description: z.string().optional(),
				vendor: z.string().optional(),
				paymentMethod: z.string().optional(),
				receiptUrl: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			
			const updateData: any = { ...data, updatedAt: new Date() };
			if (data.date) {
				updateData.date = new Date(data.date);
			}

			const updatedExpense = await db
				.update(expenses)
				.set(updateData)
				.where(eq(expenses.id, id))
				.returning();

			return updatedExpense[0];
		}),

	// Delete expense
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(expenses).where(eq(expenses.id, input.id));
			return { success: true };
		}),
});

