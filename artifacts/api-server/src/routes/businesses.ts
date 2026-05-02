import { Router } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, businesses } from "@workspace/db";
import {
  UpsertMyBusinessBody,
  GetBusinessByIdParams,
} from "@workspace/api-zod";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/businesses/me", requireAuth, async (req: any, res) => {
  try {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, req.userId))
      .limit(1);

    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json(business);
  } catch (err) {
    req.log.error({ err }, "Failed to get business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/businesses/me", requireAuth, async (req: any, res) => {
  try {
    const body = UpsertMyBusinessBody.parse(req.body);

    const existing = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, req.userId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(businesses)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(businesses.ownerId, req.userId))
        .returning();
      return res.json(updated);
    }

    const [created] = await db
      .insert(businesses)
      .values({ ...body, ownerId: req.userId })
      .returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to upsert business");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/:businessId", async (req: any, res) => {
  try {
    const { businessId } = GetBusinessByIdParams.parse({ businessId: Number(req.params.businessId) });

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json(business);
  } catch (err) {
    req.log.error({ err }, "Failed to get business by id");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
