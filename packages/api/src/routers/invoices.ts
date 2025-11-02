import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, invoices } from "@sepupus-account/db";
import { eq, desc, and, gte, lte, ilike } from "drizzle-orm";

export const invoicesRouter = router({
	// Get all invoices with filters
	getAll: protectedProcedure
		.input(
			z.object({
				status: z.enum(["paid", "unpaid", "pending", "overdue"]).optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				search: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			})
		)
		.query(async ({ input }) => {
			const conditions = [];
			
			if (input.status) {
				conditions.push(eq(invoices.status, input.status));
			}
			
			if (input.startDate) {
				conditions.push(gte(invoices.dueDate, new Date(input.startDate)));
			}
			
			if (input.endDate) {
				conditions.push(lte(invoices.dueDate, new Date(input.endDate)));
			}
			
			if (input.search) {
				conditions.push(ilike(invoices.clientName, `%${input.search}%`));
			}

			const allInvoices = await db
				.select()
				.from(invoices)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(invoices.dueDate))
				.limit(input.limit)
				.offset(input.offset);

			return allInvoices;
		}),

	// Get invoice by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const invoice = await db
				.select()
				.from(invoices)
				.where(eq(invoices.id, input.id))
				.limit(1);

			return invoice[0];
		}),

	// Create invoice
	create: protectedProcedure
		.input(
			z.object({
				clientName: z.string().min(1),
				clientEmail: z.string().email().optional(),
				clientAddress: z.string().optional(),
				service: z.string().min(1),
				totalAmount: z.string(),
				dueDate: z.string(),
				status: z.enum(["paid", "unpaid", "pending", "overdue"]).default("pending"),
				notes: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const newInvoice = await db
				.insert(invoices)
				.values({
					...input,
					dueDate: new Date(input.dueDate),
					createdById: ctx.session.user.id,
				})
				.returning();

			return newInvoice[0];
		}),

	// Update invoice
	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				clientName: z.string().optional(),
				clientEmail: z.string().optional(),
				clientAddress: z.string().optional(),
				service: z.string().optional(),
				totalAmount: z.string().optional(),
				dueDate: z.string().optional(),
				status: z.enum(["paid", "unpaid", "pending", "overdue"]).optional(),
				notes: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			
			const updateData: any = { ...data, updatedAt: new Date() };
			if (data.dueDate) {
				updateData.dueDate = new Date(data.dueDate);
			}

			const updatedInvoice = await db
				.update(invoices)
				.set(updateData)
				.where(eq(invoices.id, id))
				.returning();

			return updatedInvoice[0];
		}),

	// Delete invoice
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await db.delete(invoices).where(eq(invoices.id, input.id));
			return { success: true };
		}),

	// Update invoice status
	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				status: z.enum(["paid", "unpaid", "pending", "overdue"]),
			})
		)
		.mutation(async ({ input }) => {
			const updatedInvoice = await db
				.update(invoices)
				.set({ status: input.status, updatedAt: new Date() })
				.where(eq(invoices.id, input.id))
				.returning();

			return updatedInvoice[0];
		}),
});

