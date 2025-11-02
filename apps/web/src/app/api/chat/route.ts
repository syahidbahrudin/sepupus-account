import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  type LanguageModel,
} from "ai";
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
      model: openai("gpt-4o-mini") as unknown as LanguageModel,
      messages: convertToModelMessages(messages),
      maxSteps: 5,
      tools: {
        getFinancialSummary: {
          description:
            "Get summary of financial data including short money, daily/monthly/yearly income",
          inputSchema: z.object({
            period: z
              .enum(["daily", "monthly", "yearly", "all"])
              .describe("The time period for the summary"),
          }),
          execute: async ({ period }) => {
            try {
              const result: any = {};
              if (period === "daily" || period === "all") {
                result.daily = await caller.analytics.getDailyIncome({});
              }
              if (period === "monthly" || period === "all") {
                result.monthly = await caller.analytics.getMonthlyIncome({
                  months: 12,
                });
              }
              if (period === "yearly" || period === "all") {
                result.yearly = await caller.analytics.getYearlyIncome({
                  years: 5,
                });
              }
              if (
                period !== "daily" &&
                period !== "monthly" &&
                period !== "yearly"
              ) {
                result.shortMoney = await caller.analytics.getShortMoney({});
              }
              console.log("getFinancialSummary result:", result);
              return result;
            } catch (error) {
              console.error("Error in getFinancialSummary:", error);
              return {
                error: `Failed to get financial summary: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
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
            try {
              const receipts = await caller.receipts.getAll({
                search,
                category,
                limit,
              });
              console.log("getReceipts result:", receipts);
              return { receipts };
            } catch (error) {
              console.error("Error in getReceipts:", error);
              return {
                error: `Failed to get receipts: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
          },
        },
        getExpenses: {
          description:
            "Get expenses with optional filters (for today, use startDate and endDate with today's date)",
          inputSchema: z.object({
            department: z.string().optional().describe("Filter by department"),
            category: z.string().optional().describe("Filter by category"),
            startDate: z
              .string()
              .optional()
              .describe("Start date (ISO format)"),
            endDate: z.string().optional().describe("End date (ISO format)"),
            search: z.string().optional().describe("Search term"),
            limit: z.number().optional().default(50).describe("Limit results"),
          }),
          execute: async ({
            department,
            category,
            startDate,
            endDate,
            search,
            limit = 50,
          }) => {
            try {
              const expenses = await caller.expenses.getAll({
                department,
                category,
                startDate,
                endDate,
                search,
                limit,
              });
              console.log("getExpenses result:", expenses);
              return { expenses };
            } catch (error) {
              console.error("Error in getExpenses:", error);
              return {
                error: `Failed to get expenses: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
          },
        },
        getInventory: {
          description: "Get inventory items with optional filters",
          inputSchema: z.object({
            type: z
              .enum(["kekal", "tidak_kekal"])
              .optional()
              .describe("Filter by inventory type"),
            search: z.string().optional().describe("Search term"),
            limit: z.number().optional().default(50).describe("Limit results"),
          }),
          execute: async ({ type, search, limit = 50 }) => {
            try {
              const inventory = await caller.inventory.getAll({
                type: type as any,
                search,
                limit,
              });
              console.log("getInventory result:", inventory);
              return { inventory };
            } catch (error) {
              console.error("Error in getInventory:", error);
              return {
                error: `Failed to get inventory: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
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
            try {
              const products = await caller.products.getAll({
                search,
                category,
                limit,
              });
              console.log("getProducts result:", products);
              return { products };
            } catch (error) {
              console.error("Error in getProducts:", error);
              return {
                error: `Failed to get products: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
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
          execute: async ({
            title,
            amount,
            date,
            category,
            type,
            description,
          }) => {
            try {
              const receipt = await caller.receipts.create({
                title,
                amount,
                date,
                category,
                type: type as "income" | "expense",
                description,
              });
              console.log("createReceipt result:", receipt);
              return { receipt };
            } catch (error) {
              console.error("Error in createReceipt:", error);
              return {
                error: `Failed to create receipt: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
          },
        },
        updateInventory: {
          description: "Update inventory item stock",
          inputSchema: z.object({
            id: z.string().describe("Inventory item ID"),
            quantity: z.string().describe("New quantity"),
          }),
          execute: async ({ id, quantity }) => {
            try {
              const item = await caller.inventory.update({
                id,
                quantity,
              });
              console.log("updateInventory result:", item);
              return { item };
            } catch (error) {
              console.error("Error in updateInventory:", error);
              return {
                error: `Failed to update inventory: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              };
            }
          },
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
