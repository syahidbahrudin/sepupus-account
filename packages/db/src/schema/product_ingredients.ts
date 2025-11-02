import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { inventory } from "./inventory";

export const productIngredients = pgTable("product_ingredients", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	inventoryId: uuid("inventory_id")
		.notNull()
		.references(() => inventory.id, { onDelete: "cascade" }),
	quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

