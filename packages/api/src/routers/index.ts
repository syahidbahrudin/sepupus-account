import { protectedProcedure, publicProcedure, router } from "../index";
import { receiptsRouter } from "./receipts";
import { invoicesRouter } from "./invoices";
import { expensesRouter } from "./expenses";
import { categoriesRouter } from "./categories";
import { reportsRouter } from "./reports";
import { usersRouter } from "./users";
import { productsRouter } from "./products";
import { inventoryRouter } from "./inventory";
import { analyticsRouter } from "./analytics";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	receipts: receiptsRouter,
	invoices: invoicesRouter,
	expenses: expensesRouter,
	categories: categoriesRouter,
	reports: reportsRouter,
	users: usersRouter,
	products: productsRouter,
	inventory: inventoryRouter,
	analytics: analyticsRouter,
});
export type AppRouter = typeof appRouter;
