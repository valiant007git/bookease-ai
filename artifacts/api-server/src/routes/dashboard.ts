import { Router } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, businesses, appointments } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router = Router();

const getBusinessForUser = async (userId: string) => {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1);
  return business;
};

router.get("/dashboard/summary", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) {
      return res.json({
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        todayAppointments: 0,
        thisWeekAppointments: 0,
      });
    }

    const allAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.businessId, business.id));

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const summary = {
      totalAppointments: allAppointments.length,
      pendingAppointments: allAppointments.filter(a => a.status === "pending").length,
      confirmedAppointments: allAppointments.filter(a => a.status === "confirmed").length,
      completedAppointments: allAppointments.filter(a => a.status === "completed").length,
      cancelledAppointments: allAppointments.filter(a => a.status === "cancelled").length,
      todayAppointments: allAppointments.filter(a => {
        const d = new Date(a.appointmentDate);
        return d >= startOfToday && d <= endOfToday;
      }).length,
      thisWeekAppointments: allAppointments.filter(a => {
        const d = new Date(a.appointmentDate);
        return d >= startOfWeek && d <= endOfWeek;
      }).length,
    };

    res.json(summary);
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/upcoming", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.json([]);

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcoming = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, business.id),
          gte(appointments.appointmentDate, now),
          lte(appointments.appointmentDate, nextWeek)
        )
      )
      .orderBy(appointments.appointmentDate)
      .limit(20);

    res.json(upcoming);
  } catch (err) {
    req.log.error({ err }, "Failed to get upcoming appointments");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
