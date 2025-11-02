import { pgTable, text, timestamp, decimal, uuid, date } from "drizzle-orm/pg-core";

export const analyticsSnapshots = pgTable("analytics_snapshots", {
	id: uuid("id").primaryKey().defaultRandom(),
	date: date("date").notNull().unique(),
	dailyIncome: decimal("daily_income", { precision: 10, scale: 2 }).notNull().default("0"),
	monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }).notNull().default("0"),
	yearlyIncome: decimal("yearly_income", { precision: 10, scale: 2 }).notNull().default("0"),
	shortMoney: decimal("short_money", { precision: 10, scale: 2 }).notNull().default("0"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

