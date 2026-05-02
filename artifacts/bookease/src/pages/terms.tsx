import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function TermsPage() {
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

      <main className="flex-1 max-w-3xl mx-auto px-5 py-12 md:py-16 w-full">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account or using BookEase AI (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and business accounts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              BookEase AI provides an AI-powered appointment booking platform for service businesses. The Service includes an intelligent booking widget, a business management dashboard, availability management tools, and associated features. We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the security of your account credentials.</li>
              <li>Promptly notify us of any unauthorised use of your account.</li>
              <li>Be responsible for all activities that occur under your account.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You must be at least 18 years old and have the authority to accept these terms on behalf of the business you register.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Violate any applicable laws or regulations.</li>
              <li>Collect or harvest customer data beyond what is necessary for legitimate booking purposes.</li>
              <li>Transmit spam, unsolicited communications, or malicious content.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
              <li>Misrepresent your identity or business in ways that could mislead customers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Customer Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              When customers book appointments through your widget, their personal data (name, email, phone) is collected and stored on your behalf. You are the data controller for this information. You are responsible for ensuring that your use of this data complies with applicable privacy laws and that customers are informed of how their data will be used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Billing and Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Starter plan is free with usage limits. Paid plans (Pro and Business) are billed monthly or annually. By subscribing to a paid plan, you authorise us to charge your payment method on a recurring basis.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>You may cancel your subscription at any time from your account settings.</li>
              <li>Cancellations take effect at the end of your current billing period.</li>
              <li>We do not offer refunds for partial billing periods except where required by law.</li>
              <li>We reserve the right to change pricing with 30 days' notice to current subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its software, design, and content, is owned by BookEase AI and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Service for its intended purpose. You retain all rights to your business data and customer information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Disclaimers and Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that the Service will be error-free, uninterrupted, or meet your specific requirements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, BookEase AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability for any claim shall not exceed the amount you paid us in the three months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time if you violate these Terms or engage in conduct that we deem harmful to other users or the Service. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes shall be resolved through binding arbitration or in the courts of Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of material changes via email or a prominent notice in the Service at least 14 days before the changes take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@bookease.ai" className="text-primary hover:underline">legal@bookease.ai</a>
              {" "}or through our{" "}
              <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BookEase AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-primary font-medium">Terms</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
