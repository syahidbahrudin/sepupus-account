import { pgTable, text, timestamp, decimal, uuid, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const receipts = pgTable("receipts", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	date: timestamp("date").notNull(),
	category: text("category").notNull(),
	type: text("type", { enum: ["income", "expense"] }).notNull().default("expense"),
	items: jsonb("items"), // List of purchased products: [{ product_id, quantity }]
	paymentMethod: text("payment_method"),
	description: text("description"),
	fileUrl: text("file_url"),
	createdById: text("created_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

