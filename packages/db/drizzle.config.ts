import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
	path: "../../apps/web/.env",
});

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		// Use DIRECT_URL for migrations if available, otherwise fall back to DATABASE_URL
		url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
	},
});
