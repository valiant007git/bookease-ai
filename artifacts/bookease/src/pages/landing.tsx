import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Check,
  Bot,
  BarChart3,
  Calendar,
  ArrowRight,
  Star,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Clock,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const FEATURES = [
  {
    icon: Bot,
    title: "AI Booking Assistant",
    desc: "A 24/7 intelligent chatbot embedded on your website. Customers describe what they need — the AI qualifies, schedules, and confirms, all without you lifting a finger.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Define your working hours once. BookEase AI enforces your availability in real time, eliminating double-bookings and scheduling outside your hours.",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    desc: "A clean view of every appointment — upcoming, pending, and completed. Confirm, reschedule, or cancel in one click from any device.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    desc: "Create your business profile, set your hours, and get a shareable booking link in under 10 minutes. No developer needed.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your customer data is encrypted and never shared. Compliant with modern privacy standards so your clients can book with confidence.",
  },
  {
    icon: Clock,
    title: "Always On",
    desc: "While you sleep, attend appointments, or take a day off, your booking assistant keeps working — capturing customers you'd otherwise miss.",
  },
];

const TIERS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Perfect for solo practitioners just getting started.",
    features: [
      "1 business profile",
      "Up to 30 appointments/month",
      "AI chat booking widget",
      "Email notifications",
      "Dashboard access",
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For growing businesses ready to scale.",
    features: [
      "Unlimited appointments",
      "Priority AI responses",
      "Custom branding",
      "Analytics & reports",
      "SMS reminders",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    desc: "For multi-location businesses and teams.",
    features: [
      "Everything in Pro",
      "Multiple staff & locations",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA uptime guarantee",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Chen",
    role: "General Practitioner",
    business: "Riverside Family Clinic, Austin TX",
    initials: "SC",
    text: "Before BookEase AI, my receptionist spent nearly two hours a day managing appointment calls. Now our booking widget handles it all — patients love that they can book at midnight if they need to. We've seen a 40% increase in new patient bookings since launch.",
  },
  {
    name: "Marco De Luca",
    role: "Owner",
    business: "Studio Marco Hair, Chicago IL",
    initials: "ML",
    text: "I was losing 3–4 clients a week to missed calls or voicemails that never got returned. After switching to BookEase AI, those ghost bookings are gone. The setup was shockingly simple — I was live in about 15 minutes. It pays for itself every single week.",
  },
  {
    name: "Priya Nair",
    role: "Founder",
    business: "Elevate Fitness Studio, San Jose CA",
    initials: "PN",
    text: "Running group classes means scheduling is a constant headache. BookEase AI manages my slot availability automatically and my members get instant confirmation. I've actually been able to take Sundays off again knowing the system has everything covered.",
  },
];

const FAQS = [
  {
    q: "How does the AI booking widget work?",
    a: "You get a shareable link to your AI booking page. Customers visit it, chat with the assistant, and it intelligently collects their details, checks your availability, and books a confirmed appointment — all in a natural conversation, no forms to fill out.",
  },
  {
    q: "Do I need technical skills to set this up?",
    a: "None at all. After signing up, you fill in your business name, category, and working hours. That's it — you get a live booking link immediately. Everything is point-and-click.",
  },
  {
    q: "Can I embed the booking assistant on my own website?",
    a: "Yes. You can share your booking link directly or embed it in your website. The widget works on any site — just link your customers to it from your homepage, Google Business listing, or social media bio.",
  },
  {
    q: "What happens when a customer tries to book outside my hours?",
    a: "The AI is aware of your exact availability at all times. If a customer requests a time you're not available, it politely explains and suggests the nearest open slot — no double bookings, ever.",
  },
  {
    q: "How will I know when a new appointment is booked?",
    a: "You'll receive an email notification for every new booking. All appointments appear in your dashboard instantly, where you can confirm, reschedule, or cancel with a single click.",
  },
  {
    q: "Is my customers' data kept private?",
    a: "Absolutely. Customer data is encrypted in transit and at rest. We never sell or share your data with third parties. You own your customer information and can export or delete it at any time.",
  },
  {
    q: "Can I cancel appointments or block off time?",
    a: "Yes — from your dashboard you can update any appointment's status, and from the Availability page you can disable specific time slots or entire days when you're unavailable.",
  },
  {
    q: "Which types of businesses does BookEase AI work best for?",
    a: "BookEase AI was designed for any service business that takes appointments: medical & dental clinics, hair and beauty salons, barbershops, gyms, fitness studios, spas, physiotherapists, tutors, and more.",
  },
];

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-foreground">BookEase AI</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 text-sm shadow-sm">
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border bg-background px-5 py-4 space-y-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "#testimonials", label: "Reviews" },
              { href: "#faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/sign-in" onClick={() => setMobileNavOpen(false)}>
                <Button variant="outline" className="w-full text-sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setMobileNavOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-5 pt-20 pb-16 md:pt-28 md:pb-24 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          AI-powered booking for local businesses
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-5 leading-[1.05]">
          Schedules managed.{" "}
          <span className="text-primary">Peace of mind</span>{" "}
          restored.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The intelligent booking assistant for clinics, salons, gyms, and service businesses.
          Let AI handle appointments 24/7 while you focus on delivering great service.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 gap-2"
            >
              Start for free <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">No credit card required &middot; Live in 10 minutes</p>
        </div>

        {/* Social proof bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {["SC", "ML", "PN", "RK"].map((i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-xs">500+ businesses onboarded</span>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400" />)}
            <span className="text-xs ml-1">4.9 / 5 rating</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Everything you need to run bookings
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Built specifically for service businesses that live and die by their schedule.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-sm group"
            >
              <div className="p-2.5 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-5 py-16 md:py-24 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              Trusted by local businesses
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Real results from real business owners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, business, initials, text }) => (
              <div key={name} className="p-6 rounded-2xl border border-border bg-card flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5 flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role} &middot; {business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-5 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Start free. Upgrade only when you need more.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start max-w-4xl mx-auto">
          {TIERS.map(({ name, price, period, desc, features, cta, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl border p-6 flex flex-col transition-all ${
                highlight
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 md:scale-[1.03]"
                  : "border-border bg-card"
              }`}
            >
              {highlight && (
                <span className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider text-primary bg-primary/15 rounded-full px-3 py-1 w-fit mb-4">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{name}</h3>
              <div className="mt-2 mb-1 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground">{price}</span>
                <span className="text-muted-foreground text-sm pb-1">{period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">{desc}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button
                  className={`w-full rounded-xl text-sm ${
                    highlight
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                  variant={highlight ? "default" : "outline"}
                >
                  {cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-16 md:py-24 bg-muted/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Everything you need to know before getting started.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 hover:bg-muted/40 transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-medium text-foreground">{q}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Ready to fill your schedule?
          </h2>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            Join hundreds of local businesses using BookEase AI to manage appointments effortlessly.
            Set up takes less than 10 minutes.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 gap-2"
            >
              Get started for free <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-7 w-7" />
                <span className="font-bold text-base tracking-tight text-foreground">BookEase AI</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                AI-powered appointment booking for local service businesses.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Product</p>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Company</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BookEase AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
