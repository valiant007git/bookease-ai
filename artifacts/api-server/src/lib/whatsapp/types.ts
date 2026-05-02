export interface IncomingMessage {
  from: string;
  body: string;
  externalId: string;
  customerName?: string;
}

export interface WhatsAppProvider {
  sendMessage(to: string, body: string): Promise<{ externalId: string }>;
  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    secret: string,
  ): boolean;
  parseIncoming(body: unknown): IncomingMessage | null;
}
