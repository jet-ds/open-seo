import { createMiddleware } from "@tanstack/react-start";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  authenticateRequest,
  getAuthConfig,
} from "@every-app/sdk/tanstack/server";
import { AppError } from "@/server/lib/errors";
import { logServerError } from "@/server/lib/logger";

export const ensureUserMiddleware = createMiddleware({
  type: "function",
}).server(async (c) => {
  const { next } = c;

  const authConfig = getAuthConfig();

  const session = await authenticateRequest(authConfig);

  if (!session) {
    throw new AppError("UNAUTHENTICATED");
  }

  if (!session.email) {
    throw new AppError("UNAUTHENTICATED");
  }

  const userId = session.sub;

  // Check if user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    try {
      await db.insert(users).values({
        id: userId,
        email: session.email,
      });
    } catch (error) {
      logServerError("auth.ensure-user.create", error, { userId });
      throw new AppError("INTERNAL_ERROR");
    }
  }

  const userEmail = user?.email || session.email;

  return next({
    context: {
      userId,
      userEmail,
      session,
    },
  });
});
