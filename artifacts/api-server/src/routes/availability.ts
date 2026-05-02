import { Router } from "express";
import { getAuth } from "@clerk/express";
import { eq, and } from "drizzle-orm";
import { db, businesses, availabilitySlots } from "@workspace/db";
import {
  CreateAvailabilitySlotBody,
  UpdateAvailabilitySlotBody,
  UpdateAvailabilitySlotParams,
  DeleteAvailabilitySlotParams,
  ListBusinessAvailabilityParams,
} from "@workspace/api-zod";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

const getBusinessForUser = async (userId: string) => {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1);
  return business;
};

router.get("/businesses/me/availability", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const slots = await db
      .select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.businessId, business.id))
      .orderBy(availabilitySlots.dayOfWeek, availabilitySlots.startTime);

    res.json(slots);
  } catch (err) {
    req.log.error({ err }, "Failed to list availability");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses/me/availability", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const body = CreateAvailabilitySlotBody.parse(req.body);

    const [slot] = await db
      .insert(availabilitySlots)
      .values({ ...body, businessId: business.id, isActive: body.isActive ?? true })
      .returning();

    res.status(201).json(slot);
  } catch (err) {
    req.log.error({ err }, "Failed to create availability slot");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/businesses/me/availability/:slotId", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const { slotId } = UpdateAvailabilitySlotParams.parse({ slotId: Number(req.params.slotId) });
    const body = UpdateAvailabilitySlotBody.parse(req.body);

    const [updated] = await db
      .update(availabilitySlots)
      .set(body)
      .where(
        and(
          eq(availabilitySlots.id, slotId),
          eq(availabilitySlots.businessId, business.id)
        )
      )
      .returning();

    if (!updated) return res.status(404).json({ error: "Slot not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update availability slot");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/businesses/me/availability/:slotId", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const { slotId } = DeleteAvailabilitySlotParams.parse({ slotId: Number(req.params.slotId) });

    await db
      .delete(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.id, slotId),
          eq(availabilitySlots.businessId, business.id)
        )
      );

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete availability slot");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/:businessId/availability", async (req: any, res) => {
  try {
    const { businessId } = ListBusinessAvailabilityParams.parse({
      businessId: Number(req.params.businessId),
    });

    const slots = await db
      .select()
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.businessId, businessId),
          eq(availabilitySlots.isActive, true)
        )
      )
      .orderBy(availabilitySlots.dayOfWeek, availabilitySlots.startTime);

    res.json(slots);
  } catch (err) {
    req.log.error({ err }, "Failed to list business availability");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
