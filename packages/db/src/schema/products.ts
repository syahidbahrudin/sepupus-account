import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	category: text("category").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

