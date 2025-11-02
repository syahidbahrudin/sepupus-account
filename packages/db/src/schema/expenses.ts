import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const expenses = pgTable("expenses", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	department: text("department").notNull(),
	category: text("category").notNull(),
	date: timestamp("date").notNull(),
	description: text("description"),
	vendor: text("vendor"),
	paymentMethod: text("payment_method"),
	receiptUrl: text("receipt_url"),
	createdById: text("created_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

