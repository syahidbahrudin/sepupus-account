import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, receipts, invoices, expenses } from "@sepupus-account/db";
import { sql, gte, lte, and, eq } from "drizzle-orm";

export const reportsRouter = router({
	// Get summary statistics
	getSummary: protectedProcedure
		.input(
			z.object({
				startDate: z.string().optional(),
				endDate: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const dateConditions = [];
			
			if (input.startDate) {
				dateConditions.push(gte(receipts.date, new Date(input.startDate)));
			}
			
			if (input.endDate) {
				dateConditions.push(lte(receipts.date, new Date(input.endDate)));
			}

			// Total income from invoices
			const invoiceStats = await db
				.select({
					totalIncome: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
					paidInvoices: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END)`,
					unpaidInvoices: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'unpaid' THEN 1 END)`,
					pendingInvoices: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'pending' THEN 1 END)`,
				})
				.from(invoices)
				.where(dateConditions.length > 0 ? and(...dateConditions.map(dc => {
					// Replace receipts.date with invoices.dueDate
					const condition = dc.toString().replace('receipts.date', 'invoices.due_date');
					return sql.raw(condition);
				})) : undefined);

			// Total expenses
			const expenseStats = await db
				.select({
					totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
					count: sql<number>`COUNT(*)`,
				})
				.from(expenses)
				.where(dateConditions.length > 0 ? and(...dateConditions.map(dc => {
					const condition = dc.toString().replace('receipts.date', 'expenses.date');
					return sql.raw(condition);
				})) : undefined);

			// Total receipts
			const receiptStats = await db
				.select({
					totalReceipts: sql<string>`COALESCE(SUM(${receipts.amount}), 0)`,
					count: sql<number>`COUNT(*)`,
				})
				.from(receipts)
				.where(dateConditions.length > 0 ? and(...dateConditions) : undefined);

			return {
				totalIncome: invoiceStats[0]?.totalIncome || "0",
				totalExpenses: expenseStats[0]?.totalExpenses || "0",
				totalReceipts: receiptStats[0]?.totalReceipts || "0",
				netIncome: (parseFloat(invoiceStats[0]?.totalIncome || "0") - parseFloat(expenseStats[0]?.totalExpenses || "0")).toString(),
				invoiceStats: {
					paid: invoiceStats[0]?.paidInvoices || 0,
					unpaid: invoiceStats[0]?.unpaidInvoices || 0,
					pending: invoiceStats[0]?.pendingInvoices || 0,
				},
				expenseCount: expenseStats[0]?.count || 0,
				receiptCount: receiptStats[0]?.count || 0,
			};
		}),

	// Get expenses by category
	getExpensesByCategory: protectedProcedure
		.input(
			z.object({
				startDate: z.string().optional(),
				endDate: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const dateConditions = [];
			
			if (input.startDate) {
				dateConditions.push(gte(expenses.date, new Date(input.startDate)));
			}
			
			if (input.endDate) {
				dateConditions.push(lte(expenses.date, new Date(input.endDate)));
			}

			const expensesByCategory = await db
				.select({
					category: expenses.category,
					total: sql<string>`SUM(${expenses.amount})`,
					count: sql<number>`COUNT(*)`,
				})
				.from(expenses)
				.where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
				.groupBy(expenses.category);

			return expensesByCategory;
		}),

	// Get expenses by department
	getExpensesByDepartment: protectedProcedure
		.input(
			z.object({
				startDate: z.string().optional(),
				endDate: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const dateConditions = [];
			
			if (input.startDate) {
				dateConditions.push(gte(expenses.date, new Date(input.startDate)));
			}
			
			if (input.endDate) {
				dateConditions.push(lte(expenses.date, new Date(input.endDate)));
			}

			const expensesByDepartment = await db
				.select({
					department: expenses.department,
					total: sql<string>`SUM(${expenses.amount})`,
					count: sql<number>`COUNT(*)`,
				})
				.from(expenses)
				.where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
				.groupBy(expenses.department);

			return expensesByDepartment;
		}),

	// Get monthly breakdown
	getMonthlyBreakdown: protectedProcedure
		.input(
			z.object({
				year: z.number().optional(),
			})
		)
		.query(async ({ input }) => {
			const year = input.year || new Date().getFullYear();

			const monthlyIncome = await db
				.select({
					month: sql<number>`EXTRACT(MONTH FROM ${invoices.dueDate})`,
					total: sql<string>`SUM(${invoices.totalAmount})`,
				})
				.from(invoices)
				.where(sql`EXTRACT(YEAR FROM ${invoices.dueDate}) = ${year}`)
				.groupBy(sql`EXTRACT(MONTH FROM ${invoices.dueDate})`);

			const monthlyExpenses = await db
				.select({
					month: sql<number>`EXTRACT(MONTH FROM ${expenses.date})`,
					total: sql<string>`SUM(${expenses.amount})`,
				})
				.from(expenses)
				.where(sql`EXTRACT(YEAR FROM ${expenses.date}) = ${year}`)
				.groupBy(sql`EXTRACT(MONTH FROM ${expenses.date})`);

			// Combine data
			const monthlyData = Array.from({ length: 12 }, (_, i) => {
				const month = i + 1;
				const income = monthlyIncome.find(m => m.month === month);
				const expense = monthlyExpenses.find(m => m.month === month);

				return {
					month,
					income: income?.total || "0",
					expenses: expense?.total || "0",
					net: (parseFloat(income?.total || "0") - parseFloat(expense?.total || "0")).toString(),
				};
			});

			return monthlyData;
		}),
});

