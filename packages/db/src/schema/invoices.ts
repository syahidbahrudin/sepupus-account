import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const invoices = pgTable("invoices", {
	id: uuid("id").primaryKey().defaultRandom(),
	clientName: text("client_name").notNull(),
	clientEmail: text("client_email"),
	clientAddress: text("client_address"),
	service: text("service").notNull(),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	dueDate: timestamp("due_date").notNull(),
	status: text("status", { enum: ["paid", "unpaid", "pending", "overdue"] })
		.notNull()
		.default("pending"),
	notes: text("notes"),
	createdById: text("created_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

