import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { appRouter } from "@sepupus-account/api/routers/index";
import { createContext } from "@sepupus-account/api/context";
import { auth } from "@sepupus-account/auth";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: req.headers });

		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const body = await req.json();
		const { messages } = body;

		// Create tRPC context - create a NextRequest from the Request
		const { NextRequest } = await import("next/server");
		const url = new URL(req.url);
		const nextReq = new NextRequest(url, {
			method: req.method,
			headers: new Headers(req.headers),
		});
		const ctx = await createContext(nextReq);

		// Create tRPC caller
		const caller = appRouter.createCaller(ctx);

		const result = streamText({
			model: openai("gpt-4o-mini"),
			messages,
			maxSteps: 5,
			tools: {
				getFinancialSummary: {
					description: "Get summary of financial data including short money, daily/monthly/yearly income",
					parameters: {
						type: "object",
						properties: {
							period: {
								type: "string",
								enum: ["daily", "monthly", "yearly", "all"],
								description: "The time period for the summary",
							},
						},
					},
					execute: async ({ period }) => {
						if (period === "daily" || period === "all") {
							const daily = await caller.analytics.getDailyIncome({});
							return { daily };
						}
						if (period === "monthly" || period === "all") {
							const monthly = await caller.analytics.getMonthlyIncome({ months: 12 });
							return { monthly };
						}
						if (period === "yearly" || period === "all") {
							const yearly = await caller.analytics.getYearlyIncome({ years: 5 });
							return { yearly };
						}
						const shortMoney = await caller.analytics.getShortMoney({});
						return { shortMoney };
					},
				},
				getReceipts: {
					description: "Get receipts with optional filters",
					parameters: {
						type: "object",
						properties: {
							search: { type: "string", description: "Search term" },
							category: { type: "string", description: "Filter by category" },
							limit: { type: "number", description: "Limit results" },
						},
					},
					execute: async ({ search, category, limit = 10 }) => {
						const receipts = await caller.receipts.getAll({
							search,
							category,
							limit,
						});
						return { receipts };
					},
				},
				getInventory: {
					description: "Get inventory items with optional filters",
					parameters: {
						type: "object",
						properties: {
							type: {
								type: "string",
								enum: ["kekal", "tidak_kekal"],
								description: "Filter by inventory type",
							},
							search: { type: "string", description: "Search term" },
							limit: { type: "number", description: "Limit results" },
						},
					},
					execute: async ({ type, search, limit = 50 }) => {
						const inventory = await caller.inventory.getAll({
							type: type as any,
							search,
							limit,
						});
						return { inventory };
					},
				},
				getProducts: {
					description: "Get products with optional filters",
					parameters: {
						type: "object",
						properties: {
							search: { type: "string", description: "Search term" },
							category: { type: "string", description: "Filter by category" },
							limit: { type: "number", description: "Limit results" },
						},
					},
					execute: async ({ search, category, limit = 50 }) => {
						const products = await caller.products.getAll({
							search,
							category,
							limit,
						});
						return { products };
					},
				},
				createReceipt: {
					description: "Create a new receipt",
					parameters: {
						type: "object",
						properties: {
							title: { type: "string", description: "Receipt title" },
							amount: { type: "string", description: "Amount" },
							date: { type: "string", description: "Date (ISO format)" },
							category: { type: "string", description: "Category" },
							type: {
								type: "string",
								enum: ["income", "expense"],
								description: "Receipt type",
							},
							description: { type: "string", description: "Description" },
						},
						required: ["title", "amount", "date", "category", "type"],
					},
					execute: async ({ title, amount, date, category, type, description }) => {
						const receipt = await caller.receipts.create({
							title,
							amount,
							date,
							category,
							type: type as "income" | "expense",
							description,
						});
						return { receipt };
					},
				},
				updateInventory: {
					description: "Update inventory item stock",
					parameters: {
						type: "object",
						properties: {
							id: { type: "string", description: "Inventory item ID" },
							quantity: { type: "string", description: "New quantity" },
						},
						required: ["id", "quantity"],
					},
					execute: async ({ id, quantity }) => {
						const item = await caller.inventory.update({
							id,
							quantity,
						});
						return { item };
					},
				},
			},
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Chat error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

