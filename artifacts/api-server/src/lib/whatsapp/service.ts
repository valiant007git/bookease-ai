import { eq, and } from "drizzle-orm";
import {
  db,
  businesses,
  whatsappSettings,
  whatsappConversations,
  whatsappMessages,
  whatsappNotifications,
  appointments,
  type WhatsappSettings,
} from "@workspace/db";
import { TwilioProvider } from "./providers/twilio.js";
import { CloudApiProvider } from "./providers/cloudApi.js";
import type { WhatsAppProvider } from "./types.js";
import { logger } from "../logger.js";

export function buildProvider(settings: WhatsappSettings): WhatsAppProvider | null {
  if (!settings.enabled) return null;
  if (settings.provider === "twilio") {
    if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber)
      return null;
    return new TwilioProvider(
      settings.twilioAccountSid,
      settings.twilioAuthToken,
      settings.twilioPhoneNumber,
    );
  }
  if (settings.provider === "cloud_api") {
    if (!settings.phoneNumberId || !settings.accessToken) return null;
    return new CloudApiProvider(settings.phoneNumberId, settings.accessToken);
  }
  return null;
}

export async function getSettingsForBusiness(
  businessId: number,
): Promise<WhatsappSettings | null> {
  const [s] = await db
    .select()
    .from(whatsappSettings)
    .where(eq(whatsappSettings.businessId, businessId))
    .limit(1);
  return s ?? null;
}

export async function getSettingsByTwilioNumber(
  phone: string,
): Promise<WhatsappSettings | null> {
  const normalized = phone.replace(/^whatsapp:/, "");
  const [s] = await db
    .select()
    .from(whatsappSettings)
    .where(eq(whatsappSettings.twilioPhoneNumber, normalized))
    .limit(1);
  return s ?? null;
}

export async function getSettingsByPhoneNumberId(
  phoneNumberId: string,
): Promise<WhatsappSettings | null> {
  const [s] = await db
    .select()
    .from(whatsappSettings)
    .where(eq(whatsappSettings.phoneNumberId, phoneNumberId))
    .limit(1);
  return s ?? null;
}

export async function getAllEnabledReminderSettings(): Promise<WhatsappSettings[]> {
  return db
    .select()
    .from(whatsappSettings)
    .where(and(eq(whatsappSettings.enabled, true), eq(whatsappSettings.sendReminders, true)));
}

export async function findOrCreateConversation(
  businessId: number,
  customerPhone: string,
  customerName?: string,
) {
  const [existing] = await db
    .select()
    .from(whatsappConversations)
    .where(
      and(
        eq(whatsappConversations.businessId, businessId),
        eq(whatsappConversations.customerPhone, customerPhone),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(whatsappConversations)
      .set({
        lastMessageAt: new Date(),
        ...(customerName && !existing.customerName ? { customerName } : {}),
      })
      .where(eq(whatsappConversations.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(whatsappConversations)
    .values({
      businessId,
      customerPhone,
      customerName: customerName ?? null,
      status: "open",
      lastMessageAt: new Date(),
    })
    .returning();
  return created;
}

export async function saveMessage(
  conversationId: number,
  direction: "inbound" | "outbound",
  body: string,
  externalId?: string,
) {
  const [msg] = await db
    .insert(whatsappMessages)
    .values({
      conversationId,
      direction,
      body,
      externalId: externalId ?? null,
      status: direction === "outbound" ? "sent" : "received",
    })
    .returning();
  return msg;
}

export async function sendMessage(
  businessId: number,
  customerPhone: string,
  body: string,
  customerName?: string,
) {
  const settings = await getSettingsForBusiness(businessId);
  if (!settings) throw new Error("WhatsApp not configured for this business");
  const provider = buildProvider(settings);
  if (!provider) throw new Error("WhatsApp provider credentials incomplete or disabled");

  const conversation = await findOrCreateConversation(businessId, customerPhone, customerName);
  const { externalId } = await provider.sendMessage(customerPhone, body);
  const message = await saveMessage(conversation.id, "outbound", body, externalId);
  return { conversation, message };
}

export async function sendAppointmentConfirmation(
  businessId: number,
  appointment: {
    id: number;
    customerName: string;
    customerPhone: string | null;
    service: string | null;
    appointmentDate: Date;
  },
) {
  if (!appointment.customerPhone) return;
  try {
    const settings = await getSettingsForBusiness(businessId);
    if (!settings?.enabled || !settings.sendConfirmations) return;
    const provider = buildProvider(settings);
    if (!provider) return;

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    const dateStr = appointment.appointmentDate.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const body = [
      `Hi ${appointment.customerName}! ✅ Your appointment`,
      appointment.service ? ` for *${appointment.service}*` : "",
      ` at *${business?.name ?? "us"}* is confirmed for ${dateStr}.`,
      `\n\nReply *RESCHEDULE* or *CANCEL* to make changes.`,
    ].join("");

    const conversation = await findOrCreateConversation(
      businessId,
      appointment.customerPhone,
      appointment.customerName,
    );
    const { externalId } = await provider.sendMessage(appointment.customerPhone, body);
    await saveMessage(conversation.id, "outbound", body, externalId);

    await db
      .insert(whatsappNotifications)
      .values({ appointmentId: appointment.id, type: "confirmation" });
  } catch (err) {
    logger.error({ err }, "Failed to send WhatsApp appointment confirmation");
  }
}

export async function processIncomingMessage(body: unknown, businessId: number) {
  try {
    const settings = await getSettingsForBusiness(businessId);
    if (!settings) return;
    const provider = buildProvider(settings);
    if (!provider) return;

    const msg = provider.parseIncoming(body);
    if (!msg || !msg.body.trim()) return;

    const conversation = await findOrCreateConversation(
      businessId,
      msg.from,
      msg.customerName,
    );
    await saveMessage(conversation.id, "inbound", msg.body, msg.externalId);

    const keyword = msg.body.toLowerCase().trim();
    if (keyword === "reschedule" || keyword === "cancel") {
      const responseBody =
        keyword === "cancel"
          ? `We've received your cancellation request for ${msg.customerName ?? "your appointment"}. Our team will confirm shortly. You can also call us directly.`
          : `We've received your reschedule request. Our team will reach out shortly to find a new time that works for you.`;

      const { externalId: outId } = await provider.sendMessage(msg.from, responseBody);
      await saveMessage(conversation.id, "outbound", responseBody, outId);
    }
  } catch (err) {
    logger.error({ err }, "Failed to process incoming WhatsApp message");
  }
}

export async function getAppointmentsAlreadyNotified(
  appointmentIds: number[],
  type: string,
): Promise<Set<number>> {
  if (appointmentIds.length === 0) return new Set();
  const rows = await db
    .select({ appointmentId: whatsappNotifications.appointmentId })
    .from(whatsappNotifications)
    .where(
      and(
        eq(whatsappNotifications.type, type),
      ),
    );
  const notifiedIds = new Set(rows.map((r) => r.appointmentId));
  return new Set(appointmentIds.filter((id) => notifiedIds.has(id)));
}

export async function sendAppointmentReminders(settings: WhatsappSettings) {
  try {
    const provider = buildProvider(settings);
    if (!provider) return;

    const hoursMs = settings.reminderHoursBefore * 60 * 60 * 1000;
    const bufferMs = 30 * 60 * 1000;
    const now = new Date();
    const windowStart = new Date(now.getTime() + hoursMs - bufferMs);
    const windowEnd = new Date(now.getTime() + hoursMs + bufferMs);

    const { gte, lte, inArray } = await import("drizzle-orm");

    const candidates = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, settings.businessId),
          gte(appointments.appointmentDate, windowStart),
          lte(appointments.appointmentDate, windowEnd),
        ),
      );

    if (candidates.length === 0) return;

    const alreadyNotified = await getAppointmentsAlreadyNotified(
      candidates.map((a) => a.id),
      "reminder",
    );

    const toRemind = candidates.filter(
      (a) =>
        !alreadyNotified.has(a.id) &&
        a.customerPhone &&
        (a.status === "pending" || a.status === "confirmed"),
    );

    if (toRemind.length === 0) return;

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, settings.businessId))
      .limit(1);

    for (const appt of toRemind) {
      try {
        if (!appt.customerPhone) continue;
        const dateStr = appt.appointmentDate.toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const timeLabel =
          settings.reminderHoursBefore === 24
            ? "tomorrow"
            : `in ${settings.reminderHoursBefore} hours`;

        const body = [
          `📅 Hi ${appt.customerName}! Just a reminder — you have an appointment`,
          appt.service ? ` for *${appt.service}*` : "",
          ` at *${business?.name ?? "us"}* ${timeLabel}: *${dateStr}*.`,
          `\n\nReply *RESCHEDULE* or *CANCEL* if you need to make changes.`,
        ].join("");

        const conversation = await findOrCreateConversation(
          settings.businessId,
          appt.customerPhone,
          appt.customerName,
        );
        const { externalId } = await provider.sendMessage(appt.customerPhone, body);
        await saveMessage(conversation.id, "outbound", body, externalId);
        await db
          .insert(whatsappNotifications)
          .values({ appointmentId: appt.id, type: "reminder" });
      } catch (err) {
        logger.error({ err, appointmentId: appt.id }, "Failed to send reminder");
      }
    }
  } catch (err) {
    logger.error({ err, businessId: settings.businessId }, "Reminder batch failed");
  }
}
