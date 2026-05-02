import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      {/* Header */}
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="prose prose-sm prose-slate max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              BookEase AI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our appointment booking platform and related services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Account information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong className="text-foreground">Business information:</strong> Business name, category, contact details, and availability settings you provide when configuring your profile.</li>
              <li><strong className="text-foreground">Appointment data:</strong> Customer names, contact details, and appointment times collected through the booking widget.</li>
              <li><strong className="text-foreground">Usage data:</strong> Pages visited, features used, and interactions with the platform, collected to improve the service.</li>
              <li><strong className="text-foreground">Communications:</strong> Messages you send us via contact forms or support channels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Provide, operate, and maintain the BookEase AI platform.</li>
              <li>Process and confirm appointment bookings on your behalf.</li>
              <li>Send email notifications about new, updated, or cancelled appointments.</li>
              <li>Improve and personalise your experience using the platform.</li>
              <li>Respond to your support requests and enquiries.</li>
              <li>Comply with legal obligations and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell, rent, or trade your personal data to third parties. We may share information in the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Service providers:</strong> Trusted third-party companies that help us deliver the service (e.g., cloud hosting, authentication, email delivery). They are contractually bound to handle your data securely.</li>
              <li><strong className="text-foreground">Legal requirements:</strong> If required by law, court order, or regulatory authority.</li>
              <li><strong className="text-foreground">Business transfers:</strong> In the event of a merger, acquisition, or sale of all or substantially all of our assets, your information may be transferred with appropriate notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encryption in transit (TLS) and at rest, access controls, and regular security reviews. While we take all reasonable precautions, no transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account and business data for as long as your account is active or as needed to provide services. Appointment records are retained for up to 3 years to support business continuity. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict certain processing of your data.</li>
              <li>Request a portable copy of your data.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@bookease.ai" className="text-primary hover:underline">privacy@bookease.ai</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use strictly necessary cookies to maintain your login session and provide core functionality. We do not use advertising or tracking cookies. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email and update the &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@bookease.ai" className="text-primary hover:underline">privacy@bookease.ai</a>
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
            <Link href="/privacy" className="text-xs text-primary font-medium">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
