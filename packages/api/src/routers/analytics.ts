import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, receipts, invoices, expenses, inventory as inventoryTable } from "@sepupus-account/db";
import { sql, eq, and, gte, lte } from "drizzle-orm";

export const analyticsRouter = router({
	// Get Short Money (total income minus expenses)
	getShortMoney: protectedProcedure
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

			// Total income from receipts where type='income'
			const incomeWhere = dateConditions.length > 0
				? and(eq(receipts.type, "income"), ...dateConditions)
				: eq(receipts.type, "income");

			const incomeResult = await db
				.select({
					total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
				})
				.from(receipts)
				.where(incomeWhere);

			// Total expenses from receipts where type='expense'
			const expenseWhere = dateConditions.length > 0
				? and(eq(receipts.type, "expense"), ...dateConditions)
				: eq(receipts.type, "expense");

			const expenseResult = await db
				.select({
					total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
				})
				.from(receipts)
				.where(expenseWhere);

			try {
				const totalIncome = parseFloat(incomeResult[0]?.total || "0");
				const totalExpenses = parseFloat(expenseResult[0]?.total || "0");
				const shortMoney = totalIncome - totalExpenses;

				return {
					totalIncome: totalIncome.toString(),
					totalExpenses: totalExpenses.toString(),
					shortMoney: shortMoney.toString(),
				};
			} catch (error) {
				console.error("Error in getShortMoney:", error);
				return {
					totalIncome: "0",
					totalExpenses: "0",
					shortMoney: "0",
				};
			}
		}),

	// Get Daily Income (today's income vs expenses)
	getDailyIncome: protectedProcedure
		.input(
			z.object({
				date: z.string().optional(), // Default to today
			})
		)
		.query(async ({ input }) => {
			const targetDate = input.date ? new Date(input.date) : new Date();
			const startOfDay = new Date(targetDate);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(targetDate);
			endOfDay.setHours(23, 59, 59, 999);

			try {
				const incomeResult = await db
					.select({
						total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
					})
					.from(receipts)
					.where(
						and(
							eq(receipts.type, "income"),
							gte(receipts.date, startOfDay),
							lte(receipts.date, endOfDay)
						)
					);

				const expenseResult = await db
					.select({
						total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
					})
					.from(receipts)
					.where(
						and(
							eq(receipts.type, "expense"),
							gte(receipts.date, startOfDay),
							lte(receipts.date, endOfDay)
						)
					);

				return {
					date: targetDate.toISOString().split("T")[0],
					income: incomeResult[0]?.total || "0",
					expenses: expenseResult[0]?.total || "0",
					net: (
						parseFloat(incomeResult[0]?.total || "0") -
						parseFloat(expenseResult[0]?.total || "0")
					).toString(),
				};
			} catch (error) {
				console.error("Error in getDailyIncome:", error);
				return {
					date: targetDate.toISOString().split("T")[0],
					income: "0",
					expenses: "0",
					net: "0",
				};
			}
		}),

	// Get Monthly Income (last 12 months)
	getMonthlyIncome: protectedProcedure
		.input(
			z.object({
				months: z.number().default(12),
			})
		)
		.query(async ({ input }) => {
			const monthlyData = [];

			for (let i = input.months - 1; i >= 0; i--) {
				const date = new Date();
				date.setMonth(date.getMonth() - i);
				const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
				const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

				const incomeResult = await db
					.select({
						total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
					})
					.from(receipts)
					.where(
						and(
							eq(receipts.type, "income"),
							gte(receipts.date, startOfMonth),
							lte(receipts.date, endOfMonth)
						)
					);

				const expenseResult = await db
					.select({
						total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
					})
					.from(receipts)
					.where(
						and(
							eq(receipts.type, "expense"),
							gte(receipts.date, startOfMonth),
							lte(receipts.date, endOfMonth)
						)
					);

				monthlyData.push({
					month: date.getMonth() + 1,
					year: date.getFullYear(),
					monthName: date.toLocaleString("default", { month: "long" }),
					income: incomeResult[0]?.total || "0",
					expenses: expenseResult[0]?.total || "0",
					net: (
						parseFloat(incomeResult[0]?.total || "0") -
						parseFloat(expenseResult[0]?.total || "0")
					).toString(),
				});
			}

			return monthlyData;
		}),

	// Get Yearly Income (last 5 years)
	getYearlyIncome: protectedProcedure
		.input(
			z.object({
				years: z.number().default(5),
			})
		)
		.query(async ({ input }) => {
			const yearlyData = [];

			for (let i = input.years - 1; i >= 0; i--) {
				const date = new Date();
				date.setFullYear(date.getFullYear() - i);
				const startOfYear = new Date(date.getFullYear(), 0, 1);
				const endOfYear = new Date(date.getFullYear(), 11, 31, 23, 59, 59);

				const incomeResult = await db
					.select({
						total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
					})
					.from(receipts)
					.where(
						and(
							eq(receipts.type, "income"),
							gte(receipts.date, startOfYear),
							lte(receipts.date, endOfYear)
						)
					);

				const expenseResult = await db
					.select({
						total: sql<string>`COALESCE(SUM(${receipts.amount}::numeric), 0)`,
					})
					.from(receipts)
					.where(
						and(
							eq(receipts.type, "expense"),
							gte(receipts.date, startOfYear),
							lte(receipts.date, endOfYear)
						)
					);

				yearlyData.push({
					year: date.getFullYear(),
					income: incomeResult[0]?.total || "0",
					expenses: expenseResult[0]?.total || "0",
					net: (
						parseFloat(incomeResult[0]?.total || "0") -
						parseFloat(expenseResult[0]?.total || "0")
					).toString(),
				});
			}

			return yearlyData;
		}),

	// Get Total Fixed Assets (sum of inventory where type='kekal')
	getTotalFixedAssets: protectedProcedure.query(async () => {
		const result = await db
			.select({
				count: sql<number>`COUNT(*)`,
				totalValue: sql<string>`COALESCE(SUM((${inventoryTable.quantity}::numeric * ${inventoryTable.costPerUnit}::numeric)), 0)`,
			})
			.from(inventoryTable)
			.where(eq(inventoryTable.type, "kekal"));

		return {
			count: result[0]?.count || 0,
			totalValue: result[0]?.totalValue || "0",
		};
	}),
});

