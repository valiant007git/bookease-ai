import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, MessageSquare, CheckCircle2 } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight text-foreground">BookEase AI</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft size={14} /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-5 py-12 md:py-16 w-full">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Contact Us</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Have a question, feedback, or need help? We&rsquo;re happy to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12">
          {/* Left — info */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Email support</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                For general enquiries and technical support:
              </p>
              <a href="mailto:support@bookease.ai" className="text-sm text-primary hover:underline font-medium">
                support@bookease.ai
              </a>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Response time</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We aim to respond to all enquiries within <strong className="text-foreground">1 business day</strong>. Pro and Business plan subscribers receive priority support.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Other contacts</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <span className="text-foreground font-medium">Privacy concerns: </span>
                  <a href="mailto:privacy@bookease.ai" className="text-primary hover:underline">privacy@bookease.ai</a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Legal & billing: </span>
                  <a href="mailto:legal@bookease.ai" className="text-primary hover:underline">legal@bookease.ai</a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Press enquiries: </span>
                  <a href="mailto:press@bookease.ai" className="text-primary hover:underline">press@bookease.ai</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Message sent!</h2>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  Thanks for reaching out. We&rsquo;ll get back to you within one business day.
                </p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-xs font-medium text-foreground mb-1.5 block">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      className="border-border bg-card"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-foreground mb-1.5 block">
                      Email address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      className="border-border bg-card"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-xs font-medium text-foreground mb-1.5 block">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="border-border bg-card"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-xs font-medium text-foreground mb-1.5 block">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                  disabled={submitting || !form.name || !form.email || !form.message}
                >
                  {submitting ? "Sending..." : "Send message"}
                </Button>

                <p className="text-xs text-muted-foreground">
                  By submitting this form you agree to our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BookEase AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="text-xs text-primary font-medium">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
