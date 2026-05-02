import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Shield, Star, Zap } from "lucide-react";

import LandingPage from "@/pages/landing";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import BookingsPage from "@/pages/bookings";
import AvailabilityPage from "@/pages/availability";
import BusinessPage from "@/pages/business";
import WidgetPage from "@/pages/widget";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#6366f1",
    colorDanger: "#ef4444",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.625rem",
  },
  elements: {
    // overflow:visible is CRITICAL — Cloudflare Turnstile/captcha renders an
    // absolutely-positioned iframe that overflows the card bounds. overflow-hidden
    // clips it and makes the checkbox invisible / unclickable.
    rootBox: "w-full flex justify-center",
    cardBox:
      "rounded-2xl w-[440px] max-w-full shadow-xl shadow-black/10 border border-border/60 bg-card",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold tracking-tight",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButtonText: "font-medium",
    formFieldLabel: "text-sm font-medium",
    footerActionLink: "text-primary font-medium hover:text-primary/80",
    footerActionText: "text-muted-foreground text-sm",
    dividerText: "text-muted-foreground/60 bg-card px-2",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-emerald-600 text-sm",
    alertText: "text-destructive text-sm",
    logoBox: "h-10 w-auto mb-4",
    logoImage: "h-full w-full object-contain",
    socialButtonsBlockButton:
      "border-border hover:bg-muted/60 transition-colors font-medium",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm shadow-primary/20 transition-all",
    formFieldInput:
      "bg-muted/40 border-border focus:ring-primary focus:border-primary transition-colors",
    footerAction: "flex items-center justify-center gap-2",
    dividerLine: "bg-border",
    alert: "bg-destructive/8 border border-destructive/20 rounded-lg p-3",
    otpCodeFieldInput:
      "bg-muted/40 border-border focus:ring-primary focus:border-primary text-lg font-mono",
    formFieldRow: "mb-3",
    main: "flex flex-col gap-3",
  },
};

function LoadingSpinner() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const AUTH_TESTIMONIALS = [
  { text: "Set up in 10 minutes. Bookings came in the same day.", author: "Maria L.", role: "Salon owner" },
  { text: "We stopped losing clients to missed calls the moment we went live.", author: "Dr. James K.", role: "Clinic director" },
  { text: "My schedule fills itself. I just show up and do the work.", author: "Alex T.", role: "Personal trainer" },
];

function AuthBrand() {
  return (
    <div className="hidden lg:flex flex-col w-[420px] flex-shrink-0 min-h-[100dvh] bg-gradient-to-br from-primary via-violet-600 to-indigo-700 relative overflow-hidden px-12 py-12">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_-10%,rgba(255,255,255,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_110%,rgba(255,255,255,0.08),transparent)]" />
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <a href={basePath || "/"} className="flex items-center gap-2.5 mb-auto">
          <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/25">
            <img src={`${window.location.origin}${basePath}/logo.svg`} alt="BookEase AI" className="h-5 w-5" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">BookEase AI</span>
        </a>

        {/* Main pitch */}
        <div className="my-auto py-8">
          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Your AI front desk,<br />always open.
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-xs">
            Automate bookings 24/7 so you can focus on delivering great service — not answering calls.
          </p>

          {/* Rotating testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className="text-amber-300 fill-amber-300" />
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-3 italic">
              "{AUTH_TESTIMONIALS[0].text}"
            </p>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                {AUTH_TESTIMONIALS[0].author[0]}
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">{AUTH_TESTIMONIALS[0].author}</p>
                <p className="text-white/55 text-[10px] mt-0.5">{AUTH_TESTIMONIALS[0].role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom trust */}
        <div className="flex items-center gap-4 text-white/50 text-[11px]">
          <span className="flex items-center gap-1"><Shield size={10} className="text-white/40" /> SOC 2</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Shield size={10} className="text-white/40" /> GDPR</span>
          <span>·</span>
          <span>500+ businesses</span>
        </div>
      </div>
    </div>
  );
}

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh]">
      <AuthBrand />
      {/* Form side */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background relative px-6 py-10 min-h-[100dvh]">
        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.07),transparent)]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-[440px] space-y-5">
          {/* Mobile-only brand link */}
          <div className="lg:hidden text-center mb-2">
            <a href={basePath || "/"} className="inline-flex items-center gap-2">
              <img src={`${window.location.origin}${basePath}/logo.svg`} alt="BookEase AI" className="h-7 w-7" />
              <span className="font-bold text-base tracking-tight text-foreground">BookEase AI</span>
            </a>
          </div>

          {/* Clerk component — overflow-visible wrapper so Turnstile captcha isn't clipped */}
          <div className="overflow-visible">
            {children}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground/60 flex-wrap">
            <span className="flex items-center gap-1"><Shield size={10} /> 256-bit TLS</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Zap size={10} /> Instant setup</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Star size={10} /> 4.9/5 rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthPageWrapper>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/dashboard`}
      />
    </AuthPageWrapper>
  );
}

function SignUpPage() {
  return (
    <AuthPageWrapper>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/onboarding`}
      />
    </AuthPageWrapper>
  );
}

function HomeRedirect() {
  return <LandingPage />;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [location] = useLocation();

  if (!isLoaded) return <LoadingSpinner />;

  if (!isSignedIn) {
    // Clerk requires a fully-qualified URL for redirect_url — a bare
    // path is silently ignored and the fallbackRedirectUrl is used instead.
    const returnTo = encodeURIComponent(
      window.location.origin + basePath + location,
    );
    return <Redirect to={`/sign-in?redirect_url=${returnTo}`} />;
  }

  return <>{children}</>;
}

/**
 * Registers a Clerk session-token getter with the API client so every
 * generated fetch hook sends an Authorization: Bearer <token> header.
 * This is required in Replit's dev environment where Clerk's session cookie
 * is not forwarded to the /api server by the browser.
 */
function ClerkAuthTokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={`${basePath}/dashboard`}
      signUpFallbackRedirectUrl={`${basePath}/onboarding`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkAuthTokenSync />
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />

            <Route path="/dashboard">
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            </Route>

            <Route path="/bookings">
              <AuthGuard>
                <BookingsPage />
              </AuthGuard>
            </Route>

            <Route path="/availability">
              <AuthGuard>
                <AvailabilityPage />
              </AuthGuard>
            </Route>

            <Route path="/business">
              <AuthGuard>
                <BusinessPage />
              </AuthGuard>
            </Route>

            <Route path="/onboarding">
              <AuthGuard>
                <OnboardingPage />
              </AuthGuard>
            </Route>

            <Route path="/widget/:businessId" component={WidgetPage} />

            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/contact" component={ContactPage} />

            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
      <Toaster />
    </WouterRouter>
  );
}

export default App;
