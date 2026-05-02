import { Router } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, businesses, appointments } from "@workspace/db";
import {
  ListMyAppointmentsQueryParams,
  GetMyAppointmentParams,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusParams,
  CreateAppointmentBody,
  CreateAppointmentParams,
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

router.get("/businesses/me/appointments", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const query = ListMyAppointmentsQueryParams.parse(req.query);

    let conditions: any[] = [eq(appointments.businessId, business.id)];

    if (query.status) {
      conditions.push(eq(appointments.status, query.status as any));
    }

    if (query.date) {
      const date = new Date(query.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      conditions.push(gte(appointments.appointmentDate, startOfDay));
      conditions.push(lte(appointments.appointmentDate, endOfDay));
    }

    const results = await db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(desc(appointments.appointmentDate));

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list appointments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/me/appointments/:appointmentId", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const { appointmentId } = GetMyAppointmentParams.parse({
      appointmentId: Number(req.params.appointmentId),
    });

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.businessId, business.id)
        )
      )
      .limit(1);

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    req.log.error({ err }, "Failed to get appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/businesses/me/appointments/:appointmentId", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const { appointmentId } = UpdateAppointmentStatusParams.parse({
      appointmentId: Number(req.params.appointmentId),
    });
    const body = UpdateAppointmentStatusBody.parse(req.body);

    const [updated] = await db
      .update(appointments)
      .set({ status: body.status as any })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.businessId, business.id)
        )
      )
      .returning();

    if (!updated) return res.status(404).json({ error: "Appointment not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update appointment status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses/:businessId/appointments", async (req: any, res) => {
  try {
    const { businessId } = CreateAppointmentParams.parse({
      businessId: Number(req.params.businessId),
    });
    const body = CreateAppointmentBody.parse(req.body);

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business) return res.status(404).json({ error: "Business not found" });

    const [appointment] = await db
      .insert(appointments)
      .values({
        ...body,
        businessId,
        appointmentDate: new Date(body.appointmentDate),
        status: "pending",
      })
      .returning();

    res.status(201).json(appointment);
  } catch (err) {
    req.log.error({ err }, "Failed to create appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
