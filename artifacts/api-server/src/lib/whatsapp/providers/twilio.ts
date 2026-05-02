import type { WhatsAppProvider, IncomingMessage } from "../types.js";

export class TwilioProvider implements WhatsAppProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string,
  ) {}

  async sendMessage(to: string, body: string): Promise<{ externalId: string }> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const from = this.fromNumber.startsWith("whatsapp:")
      ? this.fromNumber
      : `whatsapp:${this.fromNumber}`;
    const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    const params = new URLSearchParams({
      From: from,
      To: toFormatted,
      Body: body,
    });

    const creds = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Twilio send failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { sid: string };
    return { externalId: data.sid };
  }

  verifyWebhookSignature(
    _rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    _secret: string,
  ): boolean {
    return !!headers["x-twilio-signature"];
  }

  parseIncoming(body: unknown): IncomingMessage | null {
    const b = body as Record<string, string | undefined>;
    if (!b.From || !b.Body) return null;
    const from = b.From.replace(/^whatsapp:/, "");
    return {
      from,
      body: b.Body,
      externalId: b.MessageSid ?? "",
      customerName: b.ProfileName,
    };
  }
}
