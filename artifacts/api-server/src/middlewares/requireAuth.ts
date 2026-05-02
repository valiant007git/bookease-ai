import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Express middleware that requires a valid Clerk session.
 * Reads the bearer token (Authorization header) or session cookie set by
 * clerkMiddleware, then attaches req.userId.
 * Returns 401 if not authenticated.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).userId = userId;
  next();
}
