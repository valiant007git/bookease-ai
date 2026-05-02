import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";

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
    colorForeground: "#0f172a",
    colorMutedForeground: "#64748b",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInput: "#f8fafc",
    colorInputForeground: "#0f172a",
    colorNeutral: "#e2e8f0",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-gray-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold tracking-tight text-gray-900",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButtonText: "font-medium text-gray-700",
    formFieldLabel: "text-sm font-medium text-gray-700",
    footerActionLink: "text-indigo-600 font-medium hover:text-indigo-700",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400 bg-white px-2",
    identityPreviewEditButton: "text-indigo-600 hover:text-indigo-700",
    formFieldSuccessText: "text-green-600",
    alertText: "text-red-600 text-sm",
    logoBox: "h-12 w-auto mb-6",
    logoImage: "h-full w-full object-contain",
    socialButtonsBlockButton:
      "border-gray-200 hover:bg-gray-50 transition-colors",
    formButtonPrimary:
      "bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all",
    formFieldInput:
      "bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600",
    footerAction: "flex items-center justify-center gap-2",
    dividerLine: "bg-gray-200",
    alert: "bg-red-50 border-red-200 rounded-md p-3",
    otpCodeFieldInput:
      "bg-gray-50 border-gray-200 focus:ring-indigo-600 focus:border-indigo-600 text-lg",
    formFieldRow: "mb-4",
    main: "flex flex-col gap-4",
  },
};

function LoadingSpinner() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 px-4 py-8">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/dashboard`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 px-4 py-8">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/onboarding`}
      />
    </div>
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
