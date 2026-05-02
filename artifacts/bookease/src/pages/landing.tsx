import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Bot, BarChart3, Calendar, ArrowRight, Star } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const FEATURES = [
  {
    icon: Bot,
    title: "AI Booking Assistant",
    desc: "A smart chatbot that handles bookings 24/7. Customers just chat — the AI does the rest.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Set your availability and let the system prevent double-bookings automatically.",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    desc: "See all your appointments at a glance. Confirm, reschedule, or cancel with one click.",
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
      "AI chat widget",
      "Email notifications",
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
      "Analytics dashboard",
      "SMS reminders",
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
      "Multiple staff/locations",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Chen",
    role: "Family Physician",
    text: "My front desk used to spend hours on the phone scheduling. BookEase AI handles it all now. Patients love it.",
  },
  {
    name: "Marco Deluca",
    role: "Salon Owner",
    text: "I went from 3 missed bookings a week to zero. The AI widget on my website is always on.",
  },
  {
    name: "Priya Nair",
    role: "Fitness Studio",
    text: "Super easy setup. Had my booking widget live in under 10 minutes. Highly recommend.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight text-foreground">BookEase AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-sm font-medium text-muted-foreground">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 text-sm shadow-sm">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-7">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          AI-powered booking for local businesses
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.05]">
          Schedules managed.{" "}
          <span className="text-primary">Peace of mind</span>{" "}
          restored.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The calm, confident layer between a chaotic schedule and a full appointment book.
          Let AI handle the bookings while you focus on your customers.
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
          <p className="text-xs text-muted-foreground">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Everything you need to run bookings
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built specifically for clinics, salons, gyms, and local service businesses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-sm group"
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-3">
              Trusted by local businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">{text}</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">Start free, upgrade when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {TIERS.map(({ name, price, period, desc, features, cta, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl border p-6 flex flex-col transition-all ${
                highlight
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card"
              }`}
            >
              {highlight && (
                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 block">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-extrabold text-foreground">{price}</span>
                <span className="text-muted-foreground text-sm">{period}</span>
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

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Ready to fill your schedule?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of local businesses using BookEase AI to manage appointments effortlessly.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 gap-2"
            >
              Get started for free <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BookEase AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
