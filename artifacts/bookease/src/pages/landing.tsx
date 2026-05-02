import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check, Bot, BarChart3, Calendar, ArrowRight, Star, Menu, X,
  ChevronDown, Shield, Zap, Clock, Scissors, Dumbbell, Stethoscope,
  Sparkles, GraduationCap, Bell, MessageSquare, Sun, Moon, TrendingUp,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Fade-in + slide-up on scroll ─────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const offsets = { up: [20, 0], left: [30, 0], right: [-30, 0], none: [0, 0] };
  const [yOff, ] = offsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: direction === "up" ? yOff : 0, x: direction !== "up" && direction !== "none" ? offsets[direction][0] : 0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger container ────────────────────────────────────────────────────────
const stagger = {
  visible: { transition: { staggerChildren: 0.09 } },
  hidden: {},
};
const fadeItem = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Bot, color: "from-violet-500 to-indigo-500", title: "AI Booking Assistant", desc: "A 24/7 conversational AI on your website. Customers describe what they need — the AI qualifies, schedules, and confirms without you lifting a finger." },
  { icon: Calendar, color: "from-indigo-500 to-blue-500", title: "Smart Scheduling", desc: "Set your hours once. BookEase enforces real-time availability, eliminating double-bookings and after-hours requests automatically." },
  { icon: BarChart3, color: "from-blue-500 to-cyan-500", title: "Business Dashboard", desc: "A clean view of every appointment — upcoming, pending, and completed. Confirm, reschedule, or cancel in one click from any device." },
  { icon: Bell, color: "from-amber-500 to-orange-500", title: "Instant Notifications", desc: "You and your customers receive instant confirmations. Never lose track of a booking with real-time email alerts." },
  { icon: Shield, color: "from-emerald-500 to-teal-500", title: "Secure & Private", desc: "Customer data is encrypted in transit and at rest. Fully compliant with modern privacy standards your clients can trust." },
  { icon: Zap, color: "from-pink-500 to-rose-500", title: "Live in 10 Minutes", desc: "Create your profile, set your hours, get a shareable booking link. No developers, no complex setup — just results." },
];

const INDUSTRIES = [
  {
    id: "salon",
    icon: Scissors,
    label: "Salons & Barbershops",
    headline: "Stop losing clients to missed calls",
    body: "Your chair is always booked, even while you're with a client. The AI handles new inquiries the moment they arrive — day or night.",
    bullets: ["Book walk-ins & appointments together", "Manage multiple stylists", "Reduce no-shows with auto-reminders"],
    stat: "40% more bookings",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "clinic",
    icon: Stethoscope,
    label: "Medical & Dental Clinics",
    headline: "Reclaim your front desk's time",
    body: "Patients book online in seconds. Your staff focuses on care instead of phone calls. Reduce admin overhead by 60%.",
    bullets: ["Collect patient details upfront", "Auto-confirm appointments", "HIPAA-aware data handling"],
    stat: "60% less admin time",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "gym",
    icon: Dumbbell,
    label: "Gyms & Fitness Studios",
    headline: "Fill every class, every session",
    body: "Members book PT sessions and classes instantly. Real-time slot management keeps capacity perfect.",
    bullets: ["Handle class & 1:1 bookings", "Manage trainer schedules", "Waitlists for popular slots"],
    stat: "95% capacity utilisation",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "spa",
    icon: Sparkles,
    label: "Spas & Wellness",
    headline: "A premium experience starts at first contact",
    body: "Your booking flow matches the serenity of your brand. Clients arrive relaxed, prepared, and on time.",
    bullets: ["Collect treatment preferences upfront", "Send preparation reminders", "Seamless rebooking"],
    stat: "35% repeat bookings",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "coaching",
    icon: GraduationCap,
    label: "Coaching & Tutoring",
    headline: "Focus on transformation, not logistics",
    body: "From discovery calls to recurring sessions, your entire calendar runs on autopilot so you focus on delivering results.",
    bullets: ["Automated discovery call booking", "Recurring session management", "Custom intake questions"],
    stat: "3× more discovery calls",
    color: "from-amber-500 to-orange-500",
  },
];

const TIERS = [
  {
    name: "Starter",
    monthly: 0,
    annual: 0,
    desc: "For solo practitioners just getting started.",
    features: ["1 business profile", "Up to 30 appointments / month", "AI booking widget", "Email notifications", "Dashboard access"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 29,
    annual: 19,
    desc: "For growing businesses ready to scale.",
    features: ["Unlimited appointments", "Priority AI responses", "Custom branding", "Analytics & reports", "SMS reminders", "Priority support"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Business",
    monthly: 79,
    annual: 59,
    desc: "For multi-location businesses and teams.",
    features: ["Everything in Pro", "Multiple staff & locations", "API access", "Dedicated account manager", "Custom integrations", "SLA uptime guarantee"],
    cta: "Contact sales",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Dr. Sarah Chen", role: "General Practitioner", biz: "Riverside Family Clinic — Austin, TX", avatar: "SC", color: "from-blue-500 to-indigo-500", text: "Before BookEase AI my receptionist spent two hours a day on appointment calls. Now the widget handles everything — patients love booking at midnight. We've seen a 40% increase in new patient bookings.", stars: 5 },
  { name: "Marco De Luca", role: "Owner", biz: "Studio Marco Hair — Chicago, IL", avatar: "MD", color: "from-pink-500 to-rose-500", text: "I was losing 3–4 clients a week to missed calls. After switching, those ghost bookings are gone. Setup took 15 minutes. It pays for itself every single week.", stars: 5 },
  { name: "Priya Nair", role: "Founder", biz: "Elevate Fitness Studio — San Jose, CA", avatar: "PN", color: "from-emerald-500 to-teal-500", text: "Running group classes means scheduling is a constant headache. BookEase manages slot availability automatically and members get instant confirmation. I actually take Sundays off now.", stars: 5 },
  { name: "James Kowalski", role: "Head Coach", biz: "Peak Performance Coaching — Denver, CO", avatar: "JK", color: "from-amber-500 to-orange-500", text: "Discovery calls used to eat my entire Monday. Now prospects book themselves and I get a prepared intake form before we even speak. My close rate went from 40% to 72%.", stars: 5 },
  { name: "Aisha Kamara", role: "Spa Director", biz: "Luminary Spa — Miami, FL", avatar: "AK", color: "from-violet-500 to-purple-500", text: "Our clients expect a premium experience from the very first interaction. BookEase AI delivers that. Bookings feel personal and effortless, and our repeat booking rate is up 35%.", stars: 5 },
  { name: "Tony Reyes", role: "Owner", biz: "The Barber Lounge — NYC", avatar: "TR", color: "from-cyan-500 to-blue-500", text: "I was sceptical AI could handle my regular clients' preferences. I was wrong. It remembers their usual services, suggests their last slot time, and they love it. Revenue up 28% in 3 months.", stars: 5 },
];

const FAQS = [
  { q: "How does the AI booking widget work?", a: "Customers visit your booking link, chat with the AI assistant, and it collects their details, checks your real-time availability, and confirms the appointment — all in a natural conversation. No forms to fill out." },
  { q: "Do I need any technical skills to set this up?", a: "None at all. Fill in your business name, category, and working hours — that's it. You get a live booking link in minutes. Everything is point-and-click." },
  { q: "Can I embed the assistant on my own website?", a: "Yes. Share your booking link directly or link to it from your homepage, Google Business listing, or social media bio. It works instantly on any site." },
  { q: "What happens if a customer requests an unavailable slot?", a: "The AI knows your exact availability at all times. If a requested time is taken, it politely explains and suggests the nearest open slot — no double-bookings, ever." },
  { q: "How will I know when a new appointment is booked?", a: "You receive an email notification instantly. All appointments appear in your dashboard in real time, where you can confirm, reschedule, or cancel in one click." },
  { q: "Is my customer data kept private?", a: "Absolutely. All data is encrypted in transit and at rest. We never sell or share it with third parties. You own your data and can export or delete it at any time." },
  { q: "Can I block off time or update my availability?", a: "Yes — from your Availability page you can disable specific time slots or entire days whenever you need. Changes take effect immediately for the AI." },
  { q: "Which business types does BookEase AI work best for?", a: "Any service business that takes appointments: clinics, dental practices, salons, barbershops, gyms, fitness studios, spas, physiotherapists, coaches, tutors, and more." },
];

const LOGOS = [
  "SunRise Clinic", "Studio Luxe", "FitCore Gym", "Serenity Spa", "Zenith Dental",
  "Momentum Health", "The Curl Bar", "Urban Shave Co.", "Peak Body Studio", "Bloom Aesthetics",
  "Canyon Med Group", "IronWill Fitness", "Gloss & Go", "Bright Smile Dental", "Nova Wellness",
];

// ─── Dark mode toggle (global) ────────────────────────────────────────────────
function useDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };
  return { dark, toggle };
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useDark();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#industries", label: "Industries" },
    { href: "#pricing", label: "Pricing" },
    { href: "#reviews", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-8 w-8" />
          <span className="font-bold text-lg tracking-tight">BookEase AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isLoaded && isSignedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-sm shadow-primary/25 gap-1.5">
                Dashboard <ArrowRight size={14} />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-sm shadow-primary/25">
                  Get started free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle dark mode">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-5 py-4 space-y-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                {isLoaded && isSignedIn ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full text-sm bg-primary text-primary-foreground gap-1.5">
                      Go to Dashboard <ArrowRight size={14} />
                    </Button>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/sign-in" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full text-sm">Sign in</Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setOpen(false)}>
                      <Button className="w-full text-sm bg-primary text-primary-foreground">Get started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Product mockup (live fake UI) ────────────────────────────────────────────
type ChatPhase = "user-typing" | "thinking" | "ai-typing" | "pausing" | "fading";

const USER_MSG = "Hi! I'd like to book a haircut for Saturday morning.";
const AI_MSG   = "I have Saturday 10:00 AM or 2:30 PM free. Which works for you? 😊";

function ProductMockup() {
  const [phase, setPhase]       = useState<ChatPhase>("user-typing");
  const [userText, setUserText] = useState("");
  const [aiText, setAiText]     = useState("");
  const phaseRef = useRef<ChatPhase>("user-typing");

  // Keep phaseRef in sync so timeouts can safely read current phase
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (phase === "user-typing") {
      if (userText.length < USER_MSG.length) {
        const delay = 38 + Math.random() * 42; // 38-80 ms — feels human
        t = setTimeout(() => setUserText(USER_MSG.slice(0, userText.length + 1)), delay);
      } else {
        t = setTimeout(() => setPhase("thinking"), 520);
      }
    } else if (phase === "thinking") {
      t = setTimeout(() => setPhase("ai-typing"), 1600);
    } else if (phase === "ai-typing") {
      if (aiText.length < AI_MSG.length) {
        const delay = 22 + Math.random() * 32; // 22-54 ms — AI types slightly faster
        t = setTimeout(() => setAiText(AI_MSG.slice(0, aiText.length + 1)), delay);
      } else {
        t = setTimeout(() => setPhase("pausing"), 2800);
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("fading"), 400);
    } else if (phase === "fading") {
      // Brief pause for fade-out, then hard reset
      t = setTimeout(() => {
        setUserText("");
        setAiText("");
        setPhase("user-typing");
      }, 600);
    }

    return () => clearTimeout(t);
  }, [phase, userText, aiText]);

  const showUserBubble  = phase !== "fading" && userText.length > 0;
  const showThinking    = phase === "thinking";
  const showAiBubble    = (phase === "ai-typing" || phase === "pausing") && aiText.length > 0;
  const isFading        = phase === "fading";
  const isUserTyping    = phase === "user-typing";

  const appointments = [
    { time: "9:00 AM",  name: "Sarah Johnson", service: "Balayage & Cut",    status: "confirmed",   color: "bg-emerald-400" },
    { time: "11:00 AM", name: "Mike Chen",      service: "Men's Cut & Style", status: "in progress", color: "bg-amber-400"   },
    { time: "2:00 PM",  name: "Emma Wilson",    service: "Full Highlights",   status: "pending",     color: "bg-indigo-400"  },
    { time: "4:30 PM",  name: "Aisha K.",        service: "Blowout",           status: "confirmed",   color: "bg-emerald-400" },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-violet-500/20 to-transparent rounded-3xl blur-2xl scale-110" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border/40">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-amber-400/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-3 bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground border border-border/30 truncate">
            bookease.ai/book/studio-marco
          </div>
        </div>

        {/* App content */}
        <div className="p-4 space-y-3">
          {/* Schedule header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Today's Schedule</p>
              <p className="text-xs text-muted-foreground">Monday, May 4</p>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
              <TrendingUp size={11} />
              4 bookings
            </div>
          </div>

          {/* Appointment list */}
          <div className="space-y-1.5">
            {appointments.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 cursor-default"
              >
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{a.service}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  <span className={cn(
                    "text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
                    a.status === "confirmed"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                    a.status === "in progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                                 "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                  )}>
                    {a.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Chat widget ── */}
          <motion.div
            animate={{ opacity: isFading ? 0 : 1 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="border border-primary/20 rounded-xl overflow-hidden bg-primary/5"
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-primary/10">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center flex-shrink-0">
                <Bot size={10} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-primary">AI Assistant — Online</span>
              <span className="ml-auto flex gap-[3px] items-center">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    className="h-[5px] w-[5px] rounded-full bg-emerald-400"
                  />
                ))}
              </span>
            </div>

            {/* Messages */}
            <div className="px-3 py-2.5 space-y-2 min-h-[72px]">
              <AnimatePresence>

                {/* User message bubble */}
                {showUserBubble && (
                  <motion.div
                    key="user-bubble"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-end"
                  >
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-1.5 max-w-[85%]">
                      <span className="text-[10px] leading-relaxed">
                        {userText}
                        {isUserTyping && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-block w-[2px] h-[10px] bg-primary-foreground/70 ml-0.5 align-middle rounded-full"
                          />
                        )}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* AI thinking indicator */}
                {showThinking && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-start"
                  >
                    <div className="bg-background/80 border border-border/50 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                          className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* AI reply bubble */}
                {showAiBubble && (
                  <motion.div
                    key="ai-bubble"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-start"
                  >
                    <div className="bg-background/80 border border-primary/20 rounded-2xl rounded-bl-sm px-3 py-1.5 max-w-[88%]">
                      <span className="text-[10px] leading-relaxed text-foreground">
                        {aiText}
                        {phase === "ai-typing" && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-block w-[2px] h-[10px] bg-primary/60 ml-0.5 align-middle rounded-full"
                          />
                        )}
                      </span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// ─── Marquee logos ─────────────────────────────────────────────────────────────
function LogoMarquee() {
  const logos = [...LOGOS, ...LOGOS];
  return (
    <div className="relative overflow-hidden py-8 border-y border-border/50">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent" />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 whitespace-nowrap"
      >
        {logos.map((logo, i) => (
          <span
            key={i}
            className="text-sm font-semibold text-muted-foreground/50 tracking-tight select-none"
          >
            {logo}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Industry tabs ─────────────────────────────────────────────────────────────
function IndustrySection() {
  const [active, setActive] = useState(0);
  const industry = INDUSTRIES[active];

  return (
    <section id="industries" className="py-24 md:py-32 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
            Every service business
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Built for your industry
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Whether you run a salon, clinic, gym, or coaching practice — BookEase AI speaks your language.
          </p>
        </FadeIn>

        {/* Tab buttons */}
        <FadeIn delay={0.1} className="flex flex-wrap justify-center gap-2 mb-12">
          {INDUSTRIES.map(({ id, icon: Icon, label }, i) => (
            <button
              key={id}
              onClick={() => setActive(i)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                active === i
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </FadeIn>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            {/* Text side */}
            <div>
              <div className={cn("inline-flex p-3 rounded-2xl mb-5 bg-gradient-to-br", industry.color)}>
                <industry.icon size={28} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                {industry.headline}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">{industry.body}</p>
              <ul className="space-y-3 mb-8">
                {industry.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-primary" />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full gap-2 shadow-sm shadow-primary/25">
                  Get started free <ArrowRight size={15} />
                </Button>
              </Link>
            </div>

            {/* Stat card side */}
            <div className="flex items-center justify-center">
              <div className={cn("relative w-64 h-64 rounded-3xl bg-gradient-to-br flex flex-col items-center justify-center shadow-2xl", industry.color)}>
                <div className="absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent)]" />
                <span className="text-5xl font-extrabold text-white tracking-tight mb-2">
                  {industry.stat.split(" ")[0]}
                </span>
                <span className="text-white/80 text-sm font-medium text-center px-8">
                  {industry.stat.split(" ").slice(1).join(" ")}
                </span>
                <industry.icon size={80} className="absolute bottom-4 right-4 text-white/10" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Feature cards ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 md:py-32 px-5 sm:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
            Everything included
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Your AI front desk, complete
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            All the tools a service business needs to run bookings on autopilot — in one simple platform.
          </p>
        </FadeIn>

        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative p-6 rounded-2xl border border-border bg-card overflow-hidden cursor-default"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent" />

              <div className={cn("inline-flex p-2.5 rounded-xl mb-4 bg-gradient-to-br", color)}>
                <Icon size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section id="reviews" className="py-24 md:py-32 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
            ★ 4.9 out of 5
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Loved by 500+ businesses
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Real results from real business owners.
          </p>
        </FadeIn>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map(({ name, role, biz, avatar, color, text, stars }, i) => (
            <FadeIn key={name} delay={i * 0.07} className="break-inside-avoid">
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, s) => (
                    <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className={cn("h-9 w-9 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white text-xs font-bold", color)}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role} · {biz}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 md:py-32 px-5 sm:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
            Simple pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Start free. Scale when ready.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
            No hidden fees. No credit card required to start.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", !annual ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2", annual ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
            >
              Annual
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                Save 35%
              </span>
            </button>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
          {TIERS.map(({ name, monthly, annual: annualPrice, desc, features, cta, highlight }, i) => (
            <FadeIn key={name} delay={i * 0.1}>
              <div
                className={cn(
                  "relative rounded-2xl border p-7 flex flex-col transition-all",
                  highlight
                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/15 md:-mt-4"
                    : "border-border bg-card"
                )}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider text-primary-foreground bg-primary rounded-full px-4 py-1.5 shadow-sm shadow-primary/40">
                      Most popular
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{desc}</p>

                <div className="flex items-end gap-1.5 mb-6">
                  <motion.span
                    key={`${name}-${annual}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold text-foreground"
                  >
                    ${annual ? annualPrice : monthly}
                  </motion.span>
                  <span className="text-muted-foreground text-sm pb-1">
                    {(annual ? annualPrice : monthly) === 0 ? "forever" : "/month"}
                  </span>
                </div>

                <ul className="space-y-3 mb-7 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check size={15} className="text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/sign-up">
                  <Button
                    className={cn(
                      "w-full rounded-xl text-sm font-medium",
                      highlight
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25"
                        : "bg-transparent border border-border text-foreground hover:bg-muted"
                    )}
                    variant={highlight ? "default" : "outline"}
                  >
                    {cta}
                  </Button>
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="text-center mt-10">
          <p className="text-xs text-muted-foreground">
            All plans include SSL, daily backups, and 99.9% uptime SLA. Cancel anytime.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Everything you need to know before getting started.
          </p>
        </FadeIn>

        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="border border-border rounded-2xl overflow-hidden bg-card">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground">{q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-24 md:py-32 px-5 sm:px-8">
      <FadeIn>
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-indigo-700 p-10 md:p-16 text-center shadow-2xl shadow-primary/30">
          {/* Background orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <MessageSquare size={40} className="text-white/80 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Your AI front desk is ready.
            </h2>
            <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto mb-9">
              Join 500+ businesses using BookEase AI to fill their schedule effortlessly — while they focus on delivering great service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-9 bg-white text-primary hover:bg-white/90 rounded-full text-base font-semibold shadow-xl gap-2"
                >
                  Start for free <ArrowRight size={16} />
                </Button>
              </Link>
              <p className="text-white/60 text-sm">No credit card · Live in 10 minutes</p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-7 w-7" />
              <span className="font-bold text-base tracking-tight text-foreground">BookEase AI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              AI-powered appointment booking for service businesses.
            </p>
            <div className="flex items-center gap-1 mt-4">
              {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
              <span className="text-xs text-muted-foreground ml-1.5">4.9 · 500+ businesses</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { href: "#features", label: "Features" },
                { href: "#industries", label: "Industries" },
                { href: "#pricing", label: "Pricing" },
                { href: "#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Use cases */}
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Use Cases</p>
            <ul className="space-y-2.5">
              {["Medical Clinics", "Salons & Barbershops", "Gyms & Fitness", "Spas & Wellness", "Coaching"].map((l) => (
                <li key={l}>
                  <a href="#industries" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BookEase AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for the world's best service businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Particle canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const COLORS = ["120,87,255", "139,92,246", "99,102,241", "168,85,247"];
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string };
    const pts: P[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 2.2 + 0.4,
      a: Math.random() * 0.45 + 0.08,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(120,87,255,${(1 - d / 115) * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -6) p.x = W + 6;
        if (p.x > W + 6) p.x = -6;
        if (p.y < -6) p.y = H + 6;
        if (p.y > H + 6) p.y = -6;
      }
      animId = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const avatars = ["SC", "MD", "PN", "JK", "AK", "TR"];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 38, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 38, damping: 22 });

  const blob1X = useTransform(smoothX, [-1, 1], [-35, 35]);
  const blob1Y = useTransform(smoothY, [-1, 1], [-22, 22]);
  const blob2X = useTransform(smoothX, [-1, 1], [22, -22]);
  const blob2Y = useTransform(smoothY, [-1, 1], [18, -18]);
  const blob3X = useTransform(smoothX, [-1, 1], [-14, 14]);
  const blob3Y = useTransform(smoothY, [-1, 1], [-28, 28]);
  const mockupX = useTransform(smoothX, [-1, 1], [14, -14]);
  const mockupY = useTransform(smoothY, [-1, 1], [8, -8]);
  const mockupRotY = useTransform(smoothX, [-1, 1], [8, -8]);
  const mockupRotX = useTransform(smoothY, [-1, 1], [-5, 5]);

  const floatingDots: { top: string; left?: string; right?: string; delay: number; size: string }[] = [
    { top: "18%", left: "7%",  delay: 0,   size: "w-1.5 h-1.5" },
    { top: "62%", left: "4%",  delay: 1.4, size: "w-2 h-2" },
    { top: "28%", right: "6%", delay: 0.7, size: "w-1.5 h-1.5" },
    { top: "74%", right: "9%", delay: 2.1, size: "w-2.5 h-2.5" },
    { top: "11%", left: "28%", delay: 1.0, size: "w-1 h-1" },
    { top: "84%", left: "44%", delay: 2.9, size: "w-1.5 h-1.5" },
    { top: "45%", left: "2%",  delay: 3.2, size: "w-1 h-1" },
    { top: "55%", right: "3%", delay: 0.4, size: "w-2 h-2" },
  ];

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left - r.width / 2) / (r.width / 2));
    mouseY.set((e.clientY - r.top - r.height / 2) / (r.height / 2));
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0); }

  return (
    <section
      className="relative min-h-[100dvh] flex items-center pt-16 overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Deep mesh glow backdrop ── */}
      <div className="absolute inset-0 -z-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,hsl(var(--primary)/0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_85%_85%,rgba(139,92,246,0.14),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_8%_55%,rgba(99,102,241,0.11),transparent)]" />
      </div>

      {/* ── Animated parallax orbs ── */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: blob1X, y: blob1Y }}
          animate={{ scale: [1, 1.14, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-44 -right-20 w-[720px] h-[720px] bg-primary/22 rounded-full blur-[110px]"
        />
        <motion.div
          style={{ x: blob2X, y: blob2Y }}
          animate={{ scale: [1, 0.88, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -left-52 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[90px]"
        />
        <motion.div
          style={{ x: blob3X, y: blob3Y }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4.5 }}
          className="absolute -bottom-28 right-1/4 w-[520px] h-[520px] bg-indigo-500/18 rounded-full blur-[85px]"
        />
        <motion.div
          animate={{ scale: [0.75, 1.15, 0.75], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-primary/10 rounded-full blur-[55px]"
        />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-65">
        <ParticleCanvas />
      </div>

      {/* ── Floating geometric shapes ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          className="absolute top-16 right-[14%] w-[88px] h-[88px] rounded-full border border-primary/18"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[4.5rem] right-[15%] w-14 h-14 rounded-full border border-violet-400/12"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 52, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-36 left-[7%] w-20 h-20 rounded-full border border-indigo-400/14"
        />
        <motion.div
          animate={{ rotate: [0, 18, 0], y: [0, -22, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[38%] right-[2.5%] w-12 h-12 rounded-xl bg-violet-500/7 blur-sm border border-violet-400/12"
        />
        <motion.div
          animate={{ rotate: [0, -22, 0], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[18%] left-[11%] w-9 h-9 rounded-xl bg-primary/7 blur-sm border border-primary/10"
        />
        {floatingDots.map((dot, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -16, 0], opacity: [0.25, 0.65, 0.25] }}
            transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
            className={cn("absolute rounded-full bg-primary/50", dot.size)}
            style={{ top: dot.top, left: dot.left, right: dot.right }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-wider mb-7"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              AI-powered · Always on · Zero setup
            </motion.div>

            {/* Headline — word-by-word blur reveal */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.04] mb-5">
              {(["Your", "AI"] as const).map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.58, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.22em]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              {/* Gradient highlight with underline draw + shimmer */}
              <motion.span
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.62, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative inline-block mr-[0.22em]"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  front desk
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-indigo-500 rounded-full origin-left"
                />
                <motion.span
                  initial={{ x: "-110%", opacity: 0 }}
                  animate={{ x: "210%", opacity: [0, 0.7, 0] }}
                  transition={{ delay: 1.55, duration: 0.75, ease: "easeOut" }}
                  className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
                />
              </motion.span>
              <br />
              {(["for", "bookings."] as const).map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.58, delay: 0.46 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.22em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.62, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg mb-9"
            >
              BookEase AI handles appointments 24/7 for clinics, salons, gyms, and service businesses — so you can focus on delivering great service.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.84, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-3 mb-9"
            >
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }}>
                  <Button
                    size="lg"
                    className="relative h-13 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base font-semibold overflow-hidden shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/45 transition-shadow gap-2"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-transparent rounded-full pointer-events-none" />
                    <span className="relative">Start for free</span>
                    <ArrowRight size={17} className="relative" />
                  </Button>
                </motion.div>
              </Link>
              <a href="#features">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-13 px-8 rounded-full text-base border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    See how it works
                  </Button>
                </motion.div>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2.5">
                  {avatars.map((av, i) => (
                    <div
                      key={av}
                      className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: `hsl(${220 + i * 25}, 70%, 55%)`, zIndex: avatars.length - i }}
                    >
                      {av}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">500+ businesses</p>
                  <p className="text-xs text-muted-foreground">already onboarded</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <span className="text-xs text-muted-foreground"><strong className="text-foreground">4.9</strong> / 5 · 200+ reviews</span>
              </div>
            </motion.div>
          </div>

          {/* Right — mockup with 3D mouse parallax */}
          <motion.div
            style={{ perspective: "1200px", x: mockupX, y: mockupY, rotateY: mockupRotY, rotateX: mockupRotX }}
            initial={{ opacity: 0, x: 64, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.05, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <ProductMockup />
          </motion.div>
        </div>

        {/* Mobile mockup */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="lg:hidden mt-12"
        >
          <ProductMockup />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "500+", label: "Businesses onboarded" },
    { value: "40%", label: "More bookings on average" },
    { value: "10 min", label: "Average setup time" },
    { value: "24/7", label: "AI availability" },
  ];

  return (
    <div className="border-y border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <FadeIn key={label} delay={i * 0.07} className="text-center">
              <p className="text-3xl font-extrabold text-foreground mb-1">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <NavBar />
      <HeroSection />
      <LogoMarquee />
      <StatsBar />
      <IndustrySection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
