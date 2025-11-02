import { streamText, convertToModelMessages, type UIMessage, type LanguageModel } from "ai";
import { z } from "zod";
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
		const { messages }: { messages: UIMessage[] } = body;

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
			model: openai("gpt-5-mini") as unknown as LanguageModel,
			messages: convertToModelMessages(messages),
			tools: {
				getFinancialSummary: {
					description: "Get summary of financial data including short money, daily/monthly/yearly income",
					inputSchema: z.object({
						period: z.enum(["daily", "monthly", "yearly", "all"]).describe("The time period for the summary"),
					}),
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
					inputSchema: z.object({
						search: z.string().optional().describe("Search term"),
						category: z.string().optional().describe("Filter by category"),
						limit: z.number().optional().default(10).describe("Limit results"),
					}),
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
					inputSchema: z.object({
						type: z.enum(["kekal", "tidak_kekal"]).optional().describe("Filter by inventory type"),
						search: z.string().optional().describe("Search term"),
						limit: z.number().optional().default(50).describe("Limit results"),
					}),
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
					inputSchema: z.object({
						search: z.string().optional().describe("Search term"),
						category: z.string().optional().describe("Filter by category"),
						limit: z.number().optional().default(50).describe("Limit results"),
					}),
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
					inputSchema: z.object({
						title: z.string().describe("Receipt title"),
						amount: z.string().describe("Amount"),
						date: z.string().describe("Date (ISO format)"),
						category: z.string().describe("Category"),
						type: z.enum(["income", "expense"]).describe("Receipt type"),
						description: z.string().optional().describe("Description"),
					}),
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
					inputSchema: z.object({
						id: z.string().describe("Inventory item ID"),
						quantity: z.string().describe("New quantity"),
					}),
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

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Chat error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

