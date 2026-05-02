import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@clerk/react";
import {
  useGetMyBusiness,
  useUpsertMyBusiness,
  useCreateAvailabilitySlot,
  getGetMyBusinessQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Scissors,
  Dumbbell,
  Stethoscope,
  UtensilsCrossed,
  Sparkles,
  Smile,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  { value: "clinic", label: "Medical Clinic", icon: Stethoscope },
  { value: "dental", label: "Dental Practice", icon: Smile },
  { value: "salon", label: "Hair Salon", icon: Scissors },
  { value: "barber", label: "Barbershop", icon: Scissors },
  { value: "spa", label: "Spa & Wellness", icon: Sparkles },
  { value: "gym", label: "Gym / Fitness", icon: Dumbbell },
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { value: "other", label: "Other Business", icon: Building2 },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

const DAYS = [
  { label: "Monday", short: "Mon", index: 1 },
  { label: "Tuesday", short: "Tue", index: 2 },
  { label: "Wednesday", short: "Wed", index: 3 },
  { label: "Thursday", short: "Thu", index: 4 },
  { label: "Friday", short: "Fri", index: 5 },
  { label: "Saturday", short: "Sat", index: 6 },
  { label: "Sunday", short: "Sun", index: 0 },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
  { value: 120, label: "2 hours" },
];

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

const defaultSchedule = (): Record<number, DaySchedule> => {
  const s: Record<number, DaySchedule> = {};
  DAYS.forEach(({ index }) => {
    s[index] = {
      enabled: index !== 0 && index !== 6,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    };
  });
  return s;
};

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  // Only run once Clerk has confirmed the user is signed in so the request
  // goes out with a valid Bearer token. Without this guard the query fires
  // unauthenticated, gets a 401, and never retries — leaving the page stuck.
  const { data: existingBusiness, isSuccess: hasExistingBusiness } =
    useGetMyBusiness({
      query: {
        queryKey: getGetMyBusinessQueryKey(),
        retry: false,
        enabled: isLoaded && !!isSignedIn,
      },
    });

  const { mutateAsync: upsertBusiness } = useUpsertMyBusiness();
  const { mutateAsync: createSlot } = useCreateAvailabilitySlot();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(
    defaultSchedule
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation("/sign-in");
    }
  }, [isLoaded, isSignedIn, setLocation]);

  useEffect(() => {
    if (hasExistingBusiness && existingBusiness) {
      setLocation("/dashboard");
    }
  }, [hasExistingBusiness, existingBusiness, setLocation]);

  const updateDay = (
    dayIndex: number,
    field: keyof DaySchedule,
    value: string | number | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], [field]: value },
    }));
  };

  const step1Valid = businessName.trim().length > 0 && category !== "";

  const handleFinish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await upsertBusiness({
        data: {
          name: businessName.trim(),
          category: category as Category,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
      });

      const enabledDays = DAYS.filter((d) => schedule[d.index]?.enabled);
      await Promise.all(
        enabledDays.map((d) =>
          createSlot({
            data: {
              dayOfWeek: d.index,
              startTime: schedule[d.index].startTime,
              endTime: schedule[d.index].endTime,
              slotDurationMinutes: schedule[d.index].slotDurationMinutes,
              isActive: true,
            },
          })
        )
      );

      await queryClient.invalidateQueries({
        queryKey: getGetMyBusinessQueryKey(),
      });

      setLocation("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-muted/40 to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <img src={`${basePath}/logo.svg`} alt="BookEase AI" className="h-8 w-8" />
          <span className="font-bold text-lg tracking-tight text-foreground">BookEase AI</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Step {step} of 2
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted mx-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <main className="flex-1 flex items-start justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-2xl">
          {/* ── Step 1: Business details ─────────────────────────── */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                  Tell us about your business
                </h1>
                <p className="text-muted-foreground">
                  This info is shown to customers when they book an appointment.
                </p>
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-name" className="text-sm font-medium text-foreground">
                  Business name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="biz-name"
                  placeholder="e.g. Riverside Family Clinic"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 border-border bg-card text-base"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Business type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 text-center transition-all hover:border-primary/50 hover:bg-primary/5",
                        category === value
                          ? "border-primary bg-primary/8 text-primary shadow-sm"
                          : "border-border bg-card text-muted-foreground"
                      )}
                    >
                      <Icon
                        size={22}
                        className={category === value ? "text-primary" : "text-muted-foreground"}
                      />
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone number <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 border-border bg-card"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm font-medium text-foreground">
                  Address <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="address"
                  placeholder="123 Main St, Austin TX 78701"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 border-border bg-card"
                />
              </div>

              <Button
                className="w-full sm:w-auto gap-2 h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setStep(2)}
                disabled={!step1Valid}
              >
                Continue <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* ── Step 2: Working hours ────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                  Set your working hours
                </h1>
                <p className="text-muted-foreground">
                  Customers can only book during these times. You can change these anytime.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                {DAYS.map(({ label, short, index }) => {
                  const day = schedule[index];
                  return (
                    <div
                      key={index}
                      className={cn(
                        "px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors",
                        !day.enabled && "bg-muted/30"
                      )}
                    >
                      {/* Day toggle */}
                      <div className="flex items-center gap-3 sm:w-36 flex-shrink-0">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={day.enabled}
                          onClick={() => updateDay(index, "enabled", !day.enabled)}
                          className={cn(
                            "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                            day.enabled ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform",
                              day.enabled ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                        <span
                          className={cn(
                            "text-sm font-medium w-24",
                            day.enabled ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          <span className="hidden sm:inline">{label}</span>
                          <span className="sm:hidden">{short}</span>
                        </span>
                      </div>

                      {day.enabled ? (
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={day.startTime}
                              onChange={(e) =>
                                updateDay(index, "startTime", e.target.value)
                              }
                              className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <input
                              type="time"
                              value={day.endTime}
                              onChange={(e) =>
                                updateDay(index, "endTime", e.target.value)
                              }
                              className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <select
                            value={day.slotDurationMinutes}
                            onChange={(e) =>
                              updateDay(
                                index,
                                "slotDurationMinutes",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                          >
                            {DURATION_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label} slots
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Closed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="gap-2 h-11 px-6"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                >
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button
                  className="gap-2 h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground sm:flex-1"
                  onClick={handleFinish}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Finish Setup
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                You can update your schedule anytime from the Availability page.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
