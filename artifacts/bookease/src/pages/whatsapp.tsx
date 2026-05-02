import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetWhatsAppSettings,
  useUpsertWhatsAppSettings,
  useListWhatsAppConversations,
  useListWhatsAppMessages,
  useSendWhatsAppMessage,
  getGetWhatsAppSettingsQueryKey,
  getListWhatsAppConversationsQueryKey,
  getListWhatsAppMessagesQueryKey,
} from "@workspace/api-client-react";
import type { WhatsAppConversation, WhatsAppMessage, WhatsAppSettings } from "@workspace/api-client-react";
import {
  MessageSquare,
  Settings,
  Search,
  Send,
  Phone,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  Clock,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, parseISO } from "date-fns";

const WEBHOOK_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/whatsapp/webhook`
    : "/api/whatsapp/webhook";

function ConversationAvatar({ name, phone }: { name?: string | null; phone: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : phone.slice(-2);
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const idx = phone.charCodeAt(phone.length - 1) % colors.length;
  return (
    <div
      className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${colors[idx]}`}
    >
      {initials}
    </div>
  );
}

function MessageBubble({ msg }: { msg: WhatsAppMessage }) {
  const isOut = msg.direction === "outbound";
  return (
    <div className={cn("flex mb-2", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
          isOut
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm border border-border",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOut ? "justify-end" : "justify-start",
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isOut ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {format(parseISO(msg.createdAt as unknown as string), "h:mm a")}
          </span>
          {isOut && (
            <span className="text-[10px] text-primary-foreground/70">
              {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationThread({
  conversation,
  onBack,
}: {
  conversation: WhatsAppConversation;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useListWhatsAppMessages(conversation.id, {
    query: { queryKey: getListWhatsAppMessagesQueryKey(conversation.id), refetchInterval: 8000 },
  });

  const { mutate: sendMsg, isPending: sending } = useSendWhatsAppMessage({
    mutation: {
      onSuccess: () => {
        setInput("");
        qc.invalidateQueries({ queryKey: getListWhatsAppMessagesQueryKey(conversation.id) });
        qc.invalidateQueries({ queryKey: getListWhatsAppConversationsQueryKey() });
      },
      onError: () =>
        toast({ title: "Failed to send", description: "Check your WhatsApp credentials.", variant: "destructive" }),
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const body = input.trim();
    if (!body || sending) return;
    sendMsg({ conversationId: conversation.id, data: { body } });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={onBack}
        >
          <ChevronLeft size={18} />
        </Button>
        <ConversationAvatar name={conversation.customerName} phone={conversation.customerPhone} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {conversation.customerName ?? "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone size={10} /> {conversation.customerPhone}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] capitalize hidden sm:flex">
          {conversation.status}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-muted/20">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Send the first message below
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send box */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 h-10"
            disabled={sending}
          />
          <Button
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90"
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsForm({ settings }: { settings: WhatsAppSettings | undefined | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    provider: (settings?.provider ?? "twilio") as "twilio" | "cloud_api",
    enabled: settings?.enabled ?? false,
    twilioAccountSid: settings?.twilioAccountSid ?? "",
    twilioAuthToken: settings?.twilioAuthToken ?? "",
    twilioPhoneNumber: settings?.twilioPhoneNumber ?? "",
    phoneNumberId: settings?.phoneNumberId ?? "",
    wabaId: settings?.wabaId ?? "",
    accessToken: settings?.accessToken ?? "",
    webhookSecret: settings?.webhookSecret ?? "",
    sendConfirmations: settings?.sendConfirmations ?? true,
    sendReminders: settings?.sendReminders ?? true,
    reminderHoursBefore: settings?.reminderHoursBefore ?? 24,
  });

  const { mutate: save, isPending } = useUpsertWhatsAppSettings({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetWhatsAppSettingsQueryKey() });
        toast({ title: "Settings saved", description: "WhatsApp integration updated." });
      },
      onError: () =>
        toast({ title: "Save failed", description: "Please try again.", variant: "destructive" }),
    },
  });

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => save({ data: form });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Provider + Enable */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "twilio", label: "Twilio", sub: "Easy setup, global coverage" },
              { value: "cloud_api", label: "Meta Cloud API", sub: "Official WhatsApp API" },
            ].map(({ value, label, sub }) => (
              <button
                key={value}
                onClick={() => setForm((f) => ({ ...f, provider: value as "twilio" | "cloud_api" }))}
                className={cn(
                  "flex flex-col items-start gap-0.5 border rounded-xl p-4 text-left transition-all",
                  form.provider === value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="text-[11px] text-muted-foreground">{sub}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-2 px-1">
            <div>
              <Label className="text-sm font-medium">Enable WhatsApp</Label>
              <p className="text-xs text-muted-foreground">Activate messaging for this business</p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {form.provider === "twilio" ? "Twilio Credentials" : "Meta Cloud API Credentials"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.provider === "twilio" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Account SID</Label>
                <Input
                  placeholder="AC..."
                  value={form.twilioAccountSid}
                  onChange={(e) => setForm((f) => ({ ...f, twilioAccountSid: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Auth Token</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.twilioAuthToken}
                  onChange={(e) => setForm((f) => ({ ...f, twilioAuthToken: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  WhatsApp Phone Number (e.g. +15551234567)
                </Label>
                <Input
                  placeholder="+1..."
                  value={form.twilioPhoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, twilioPhoneNumber: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
                <Input
                  placeholder="1234567890"
                  value={form.phoneNumberId}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumberId: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">WABA ID</Label>
                <Input
                  placeholder="1234567890"
                  value={form.wabaId}
                  onChange={(e) => setForm((f) => ({ ...f, wabaId: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Access Token</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.accessToken}
                  onChange={(e) => setForm((f) => ({ ...f, accessToken: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Webhook Secret (optional)</Label>
            <Input
              placeholder="A secret token for signature verification"
              value={form.webhookSecret}
              onChange={(e) => setForm((f) => ({ ...f, webhookSecret: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Automation */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Booking Confirmations</Label>
              <p className="text-xs text-muted-foreground">
                Auto-send confirmation when a booking is made
              </p>
            </div>
            <Switch
              checked={form.sendConfirmations}
              onCheckedChange={(v) => setForm((f) => ({ ...f, sendConfirmations: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Appointment Reminders</Label>
              <p className="text-xs text-muted-foreground">
                Auto-send reminder before upcoming appointments
              </p>
            </div>
            <Switch
              checked={form.sendReminders}
              onCheckedChange={(v) => setForm((f) => ({ ...f, sendReminders: v }))}
            />
          </div>
          {form.sendReminders && (
            <div className="space-y-1.5 pl-1">
              <Label className="text-xs text-muted-foreground">Remind how many hours before?</Label>
              <div className="flex gap-2">
                {[2, 6, 12, 24, 48].map((h) => (
                  <button
                    key={h}
                    onClick={() => setForm((f) => ({ ...f, reminderHoursBefore: h }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      form.reminderHoursBefore === h
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook URL */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Webhook URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Configure this URL in your Twilio / Meta dashboard to receive incoming messages:
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 font-mono text-xs text-muted-foreground truncate">
              {WEBHOOK_URL}
            </div>
            <Button variant="outline" size="sm" onClick={copyWebhook} className="gap-1.5 text-xs">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
        Save Settings
      </Button>
    </div>
  );
}

export default function WhatsAppPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const qc = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useGetWhatsAppSettings({
    query: {
      queryKey: getGetWhatsAppSettingsQueryKey(),
      retry: false,
    },
  });

  const { data: conversations = [], isLoading: convsLoading } = useListWhatsAppConversations({
    query: {
      queryKey: getListWhatsAppConversationsQueryKey(),
      refetchInterval: 15000,
    },
  });

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.customerName?.toLowerCase().includes(q) ?? false) ||
      c.customerPhone.includes(q)
    );
  });

  const statsData = [
    { label: "Conversations", value: conversations.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Open", value: conversations.filter((c) => c.status === "open").length, icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Provider", value: settings ? (settings.provider === "twilio" ? "Twilio" : "Cloud API") : "—", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Status", value: settings?.enabled ? "Active" : "Inactive", icon: settings?.enabled ? CheckCircle2 : AlertCircle, color: settings?.enabled ? "text-green-500" : "text-muted-foreground", bg: settings?.enabled ? "bg-green-50 dark:bg-green-900/20" : "bg-muted" },
  ];

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Page header */}
        <div className="px-6 py-5 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-green-500 flex items-center justify-center">
                  <MessageSquare size={14} className="text-white" />
                </div>
                WhatsApp
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage customer conversations and booking notifications
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => qc.invalidateQueries({ queryKey: getListWhatsAppConversationsQueryKey() })}
            >
              <RefreshCw size={15} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="inbox" className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 border-b border-border flex-shrink-0 bg-background">
            <div className="max-w-6xl mx-auto">
              <TabsList className="h-10 bg-transparent p-0 gap-6">
                <TabsTrigger
                  value="inbox"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none h-10 px-0 text-sm font-medium"
                >
                  Inbox
                  {conversations.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">
                      {conversations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none h-10 px-0 text-sm font-medium"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Inbox tab */}
          <TabsContent value="inbox" className="flex-1 overflow-hidden mt-0 flex flex-col">
            {/* Stats */}
            <div className="px-6 py-4 flex-shrink-0 border-b border-border/50 bg-background">
              <div className="max-w-6xl mx-auto grid grid-cols-4 gap-3">
                {statsData.map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="flex items-center gap-3 bg-card border border-border/60 rounded-xl px-3 py-2.5">
                    <div className={`p-1.5 rounded-lg ${bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                      <p className="text-sm font-semibold text-foreground leading-tight">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split pane */}
            <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-6 py-4 gap-4">
              {/* Conversation list */}
              <div
                className={cn(
                  "w-full md:w-80 flex-shrink-0 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card",
                  mobileShowThread && selected ? "hidden md:flex" : "flex",
                )}
              >
                <div className="p-3 border-b border-border/60">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations…"
                      className="pl-8 h-8 text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {convsLoading ? (
                    <div className="p-3 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {search ? "No results" : "No conversations yet"}
                      </p>
                      {!search && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Messages will appear here when customers reply
                        </p>
                      )}
                    </div>
                  ) : (
                    filtered.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setSelectedId(conv.id);
                          setMobileShowThread(true);
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0",
                          selectedId === conv.id && "bg-primary/5 border-l-2 border-l-primary",
                        )}
                      >
                        <ConversationAvatar name={conv.customerName} phone={conv.customerPhone} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-sm font-medium text-foreground truncate">
                              {conv.customerName ?? conv.customerPhone}
                            </p>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              {formatDistanceToNow(parseISO(conv.lastMessageAt as unknown as string), {
                                addSuffix: false,
                              })}
                            </span>
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage.direction === "outbound" ? "You: " : ""}
                              {conv.lastMessage.body}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Thread pane */}
              <div
                className={cn(
                  "flex-1 border border-border/60 rounded-xl overflow-hidden bg-card flex flex-col",
                  mobileShowThread && selected ? "flex" : "hidden md:flex",
                )}
              >
                {selected ? (
                  <ConversationThread
                    conversation={selected}
                    onBack={() => {
                      setMobileShowThread(false);
                      setSelectedId(null);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      WhatsApp Inbox
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Select a conversation to read messages or reply to customers
                    </p>
                    {!settings?.enabled && (
                      <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mt-4 max-w-xs">
                        WhatsApp is not configured. Go to Settings to connect your account.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto mt-0">
            <div className="px-6 py-6">
              {settingsLoading ? (
                <div className="max-w-2xl mx-auto space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <SettingsForm settings={settings} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
