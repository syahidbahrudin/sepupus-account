import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, user } from "@sepupus-account/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Role-based procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Fetch user from database to get role
  const dbUser = await db
    .select()
    .from(user)
    .where(eq(user.id, ctx.session.user.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const usersRouter = router({
  // Get current user
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);

    return currentUser[0];
  }),

  // Get all users (admin only)
  getAll: adminProcedure.query(async () => {
    return await db.select().from(user);
  }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "finance", "viewer"]),
      })
    )
    .mutation(async ({ input }) => {
      const updatedUser = await db
        .update(user)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(user.id, input.userId))
        .returning();

      return updatedUser[0];
    }),

  // Get user by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const userRecord = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      return userRecord[0];
    }),
});
