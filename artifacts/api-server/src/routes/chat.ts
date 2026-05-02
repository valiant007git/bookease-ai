import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, businesses, availabilitySlots, appointments } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SendChatMessageBody, SendChatMessageParams } from "@workspace/api-zod";

const router = Router();

const chatSessions = new Map<string, Array<{ role: "user" | "assistant" | "system"; content: string }>>();

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

router.post("/chat/:businessId", async (req: any, res) => {
  try {
    const { businessId } = SendChatMessageParams.parse({
      businessId: Number(req.params.businessId),
    });
    const body = SendChatMessageBody.parse(req.body);

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business) return res.status(404).json({ error: "Business not found" });

    const slots = await db
      .select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.businessId, businessId));

    const availabilityText = slots
      .filter(s => s.isActive)
      .map(s => `${DAY_NAMES[s.dayOfWeek]}: ${s.startTime} - ${s.endTime} (${s.slotDurationMinutes} min slots)`)
      .join("\n") || "No availability set yet.";

    const systemPrompt = `You are an AI booking assistant for ${business.name}, a ${business.category} business.

Business details:
- Name: ${business.name}
- Category: ${business.category}
${business.description ? `- Description: ${business.description}` : ""}
${business.phone ? `- Phone: ${business.phone}` : ""}
${business.email ? `- Email: ${business.email}` : ""}
${business.address ? `- Address: ${business.address}` : ""}

Available booking times:
${availabilityText}

Your job is to help customers book appointments. Be friendly, professional, and concise.

When a customer wants to book:
1. Ask for their name, preferred date/time, and any specific service or notes
2. Confirm the details before finalizing
3. When you have all the details and the customer confirms, respond with a JSON booking object at the end of your message in this exact format:
   BOOKING_JSON:{"customerName":"...","customerEmail":"...","customerPhone":"...","service":"...","appointmentDate":"ISO8601 datetime","notes":"..."}

Only include the BOOKING_JSON marker when you have confirmed all required details and the customer has agreed to book.
Required fields: customerName, appointmentDate.

Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
Current time: ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}.`;

    if (!chatSessions.has(body.sessionId)) {
      chatSessions.set(body.sessionId, []);
    }

    const history = chatSessions.get(body.sessionId)!;
    history.push({ role: "user", content: body.message });

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.slice(-20),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    history.push({ role: "assistant", content: fullResponse });

    if (fullResponse.includes("BOOKING_JSON:")) {
      const jsonMatch = fullResponse.match(/BOOKING_JSON:(\{.*?\})/s);
      if (jsonMatch) {
        try {
          const bookingData = JSON.parse(jsonMatch[1]);
          const [appointment] = await db
            .insert(appointments)
            .values({
              businessId,
              customerName: bookingData.customerName,
              customerEmail: bookingData.customerEmail || null,
              customerPhone: bookingData.customerPhone || null,
              service: bookingData.service || null,
              appointmentDate: new Date(bookingData.appointmentDate),
              notes: bookingData.notes || null,
              status: "pending",
            })
            .returning();

          res.write(`data: ${JSON.stringify({ booking: appointment, done: true })}\n\n`);
        } catch (parseErr) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        }
      } else {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      }
    } else {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }

    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to process chat message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
