import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  businesses,
  whatsappSettings,
  whatsappConversations,
  whatsappMessages,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  getSettingsForBusiness,
  getSettingsByTwilioNumber,
  getSettingsByPhoneNumberId,
  buildProvider,
  findOrCreateConversation,
  saveMessage,
  processIncomingMessage,
} from "../lib/whatsapp/service.js";

const router = Router();

const getBusinessForUser = async (userId: string) => {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1);
  return business;
};

router.get("/businesses/me/whatsapp/settings", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const settings = await getSettingsForBusiness(business.id);
    if (!settings) return res.status(404).json({ error: "WhatsApp not configured" });

    res.json(settings);
  } catch (err) {
    req.log.error({ err }, "Failed to get WhatsApp settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/businesses/me/whatsapp/settings", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const body = req.body as Record<string, unknown>;

    const existing = await getSettingsForBusiness(business.id);
    if (existing) {
      const [updated] = await db
        .update(whatsappSettings)
        .set({ ...body, businessId: business.id, updatedAt: new Date() })
        .where(eq(whatsappSettings.businessId, business.id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db
      .insert(whatsappSettings)
      .values({ ...body, businessId: business.id } as any)
      .returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to upsert WhatsApp settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businesses/me/whatsapp/conversations", requireAuth, async (req: any, res) => {
  try {
    const business = await getBusinessForUser(req.userId);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const conversations = await db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.businessId, business.id))
      .orderBy(desc(whatsappConversations.lastMessageAt));

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const [last] = await db
          .select()
          .from(whatsappMessages)
          .where(eq(whatsappMessages.conversationId, conv.id))
          .orderBy(desc(whatsappMessages.createdAt))
          .limit(1);
        return { ...conv, lastMessage: last ?? null };
      }),
    );

    res.json(conversationsWithLastMessage);
  } catch (err) {
    req.log.error({ err }, "Failed to list WhatsApp conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/businesses/me/whatsapp/conversations/:conversationId/messages",
  requireAuth,
  async (req: any, res) => {
    try {
      const business = await getBusinessForUser(req.userId);
      if (!business) return res.status(404).json({ error: "Business not found" });

      const conversationId = Number(req.params.conversationId);
      const [conv] = await db
        .select()
        .from(whatsappConversations)
        .where(eq(whatsappConversations.id, conversationId))
        .limit(1);

      if (!conv || conv.businessId !== business.id)
        return res.status(404).json({ error: "Conversation not found" });

      const messages = await db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.conversationId, conversationId))
        .orderBy(whatsappMessages.createdAt);

      res.json(messages);
    } catch (err) {
      req.log.error({ err }, "Failed to list WhatsApp messages");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/businesses/me/whatsapp/conversations/:conversationId/send",
  requireAuth,
  async (req: any, res) => {
    try {
      const business = await getBusinessForUser(req.userId);
      if (!business) return res.status(404).json({ error: "Business not found" });

      const conversationId = Number(req.params.conversationId);
      const [conv] = await db
        .select()
        .from(whatsappConversations)
        .where(eq(whatsappConversations.id, conversationId))
        .limit(1);

      if (!conv || conv.businessId !== business.id)
        return res.status(404).json({ error: "Conversation not found" });

      const { body: messageBody } = req.body as { body: string };
      if (!messageBody?.trim()) return res.status(400).json({ error: "Message body required" });

      const settings = await getSettingsForBusiness(business.id);
      if (!settings?.enabled) return res.status(400).json({ error: "WhatsApp not enabled" });

      const provider = buildProvider(settings);
      if (!provider) return res.status(400).json({ error: "WhatsApp credentials incomplete" });

      const { externalId } = await provider.sendMessage(conv.customerPhone, messageBody.trim());

      await db
        .update(whatsappConversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(whatsappConversations.id, conversationId));

      const [msg] = await db
        .insert(whatsappMessages)
        .values({
          conversationId,
          direction: "outbound",
          body: messageBody.trim(),
          externalId,
          status: "sent",
        })
        .returning();

      res.status(201).json(msg);
    } catch (err) {
      req.log.error({ err }, "Failed to send WhatsApp message");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/whatsapp/webhook", async (req: any, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];
  const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN ?? "bookease-webhook-token";

  if (mode === "subscribe" && verifyToken === expectedToken) {
    return res.send(challenge);
  }
  res.status(403).json({ error: "Verification failed" });
});

router.post("/whatsapp/webhook", async (req: any, res) => {
  try {
    const body = req.body as Record<string, unknown>;

    // Meta Cloud API format
    if (body.object === "whatsapp_business_account") {
      const entry = (body.entry as unknown[])?.[0] as Record<string, unknown> | undefined;
      const change = (entry?.changes as unknown[])?.[0] as Record<string, unknown> | undefined;
      const value = change?.value as Record<string, unknown> | undefined;
      const phoneNumberId = value?.metadata
        ? (value.metadata as Record<string, string>).phone_number_id
        : undefined;

      if (phoneNumberId) {
        const settings = await getSettingsByPhoneNumberId(phoneNumberId);
        if (settings) {
          await processIncomingMessage(body, settings.businessId);
        }
      }
      return res.json({ status: "ok" });
    }

    // Twilio format (form-encoded parsed by express)
    const to = (body as Record<string, string>)?.To;
    if (to) {
      const settings = await getSettingsByTwilioNumber(to);
      if (settings) {
        await processIncomingMessage(body, settings.businessId);
      }
      return res.send("<Response/>");
    }

    res.json({ status: "ignored" });
  } catch (err) {
    req.log.error({ err }, "Webhook processing error");
    res.status(200).json({ status: "error" });
  }
});

export default router;
