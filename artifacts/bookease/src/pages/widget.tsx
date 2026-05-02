import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import {
  useGetBusinessById,
  getGetBusinessByIdQueryKey,
} from "@workspace/api-client-react";
import { Send, Bot, User, CalendarCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  booking?: BookingData;
};

type BookingData = {
  customerName: string;
  customerEmail?: string;
  service?: string;
  appointmentDate: string;
  id?: number;
};

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function WidgetPage() {
  const params = useParams<{ businessId: string }>();
  const businessId = parseInt(params.businessId ?? "0", 10);

  const { data: business, isLoading: bizLoading } = useGetBusinessById(businessId, {
    query: { queryKey: getGetBusinessByIdQueryKey(businessId) },
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message
  useEffect(() => {
    if (business) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I'm the booking assistant for **${business.name}**. I can help you schedule an appointment.\n\nJust tell me what service you're looking for and when you'd like to come in, and I'll get you set up!`,
        },
      ]);
    }
  }, [business?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch(`/api/chat/${businessId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, sessionId }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let bookingData: BookingData | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              fullContent += json.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              );
            }
            if (json.done && json.booking) {
              bookingData = json.booking;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullContent, booking: bookingData }
                    : m
                )
              );
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Sorry, I had trouble connecting. Please try again in a moment.",
              }
            : m
        )
      );
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const renderContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={i > 0 ? "mt-1" : ""}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 bg-card border-b border-border shadow-sm">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          {bizLoading ? (
            <div className="h-4 w-36 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground truncate">
                {business?.name ?? "Booking Assistant"}
              </p>
              <p className="text-xs text-muted-foreground">AI booking assistant</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2.5 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border text-foreground rounded-tl-sm",
                  msg.content === "" && "min-w-[60px]"
                )}
              >
                {msg.content === "" && streaming ? (
                  <div className="flex items-center gap-1 py-0.5">
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  </div>
                ) : (
                  <div className="space-y-0.5">{renderContent(msg.content)}</div>
                )}
              </div>
              {msg.booking && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                      Appointment Booked!
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                    <p><span className="font-medium">Name:</span> {msg.booking.customerName}</p>
                    {msg.booking.service && (
                      <p><span className="font-medium">Service:</span> {msg.booking.service}</p>
                    )}
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {format(parseISO(msg.booking.appointmentDate), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 bg-card border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            disabled={streaming || bizLoading}
            className="flex-1 border-border bg-background text-sm"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || streaming || bizLoading}
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            {streaming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        <div className="mt-2.5 text-center">
          <Link href="/sign-up">
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Get this AI booking assistant for your business{" "}
              <ArrowRight size={10} className="inline" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
