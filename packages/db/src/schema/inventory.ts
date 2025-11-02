import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";

export const inventory = pgTable("inventory", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	type: text("type", { enum: ["kekal", "tidak_kekal"] }).notNull(),
	quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("0"),
	unit: text("unit").notNull(), // e.g., 'gram', 'pcs', 'kg'
	costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull().default("0"),
	description: text("description"),
	lastUpdated: timestamp("last_updated").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

