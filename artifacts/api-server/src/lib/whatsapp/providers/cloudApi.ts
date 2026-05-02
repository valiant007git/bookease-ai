import crypto from "crypto";
import type { WhatsAppProvider, IncomingMessage } from "../types.js";

export class CloudApiProvider implements WhatsAppProvider {
  constructor(
    private readonly phoneNumberId: string,
    private readonly accessToken: string,
  ) {}

  async sendMessage(to: string, body: string): Promise<{ externalId: string }> {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`WhatsApp Cloud API send failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { messages: Array<{ id: string }> };
    return { externalId: data.messages?.[0]?.id ?? "" };
  }

  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    secret: string,
  ): boolean {
    const signatureHeader = headers["x-hub-signature-256"];
    if (!signatureHeader) return false;
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    const expected =
      "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseIncoming(body: unknown): IncomingMessage | null {
    try {
      const b = body as Record<string, unknown>;
      const entry = (b?.entry as unknown[])?.[0] as Record<string, unknown> | undefined;
      const change = (entry?.changes as unknown[])?.[0] as Record<string, unknown> | undefined;
      const value = change?.value as Record<string, unknown> | undefined;
      const message = (value?.messages as unknown[])?.[0] as
        | Record<string, unknown>
        | undefined;
      if (!message) return null;
      const contact = (value?.contacts as unknown[])?.[0] as
        | Record<string, unknown>
        | undefined;
      const profile = contact?.profile as Record<string, unknown> | undefined;
      const textBody = (message.text as Record<string, string> | undefined)?.body ?? "";
      if (!textBody) return null;
      return {
        from: String(message.from),
        body: textBody,
        externalId: String(message.id),
        customerName: profile?.name ? String(profile.name) : undefined,
      };
    } catch {
      return null;
    }
  }
}
