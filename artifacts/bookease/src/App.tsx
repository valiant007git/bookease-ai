import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import BookingsPage from "@/pages/bookings";
import AvailabilityPage from "@/pages/availability";
import BusinessPage from "@/pages/business";
import WidgetPage from "@/pages/widget";
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

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Show when="signed-in" fallback={<Redirect to="/sign-in" />}>
      {children}
    </Show>
  );
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
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
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

            <Route path="/widget/:businessId" component={WidgetPage} />

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
