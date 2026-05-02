import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetDashboardSummary,
  useGetUpcomingAppointments,
  useGetMyBusiness,
  getGetDashboardSummaryQueryKey,
  getGetUpcomingAppointmentsQueryKey,
  getGetMyBusinessQueryKey,
} from "@workspace/api-client-react";
import { CalendarDays, Clock, CheckCircle2, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { format, parseISO } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  // Gate: redirect users who signed up but never finished onboarding.
  // The API returns 404 when the authenticated user has no business yet.
  const { error: bizError, isError: bizIsError } = useGetMyBusiness({
    query: {
      queryKey: getGetMyBusinessQueryKey(),
      retry: false,
      staleTime: Infinity,
    },
  });

  useEffect(() => {
    if (bizIsError && (bizError as any)?.status === 404) {
      setLocation("/onboarding", { replace: true });
    }
  }, [bizIsError, bizError, setLocation]);

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: upcoming, isLoading: upcomingLoading } = useGetUpcomingAppointments({
    query: { queryKey: getGetUpcomingAppointmentsQueryKey() },
  });

  const stats = [
    {
      label: "Total Appointments",
      value: summary?.totalAppointments ?? 0,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: "Pending Review",
      value: summary?.pendingAppointments ?? 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Confirmed",
      value: summary?.confirmedAppointments ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Today",
      value: summary?.todayAppointments ?? 0,
      icon: CalendarDays,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-border shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {label}
                    </p>
                    {summaryLoading ? (
                      <Skeleton className="h-8 w-14" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{value}</p>
                    )}
                  </div>
                  <div className={`p-2.5 rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* This week stat */}
        {!summaryLoading && summary && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/15 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">This week</p>
                <p className="text-xs text-muted-foreground">{summary.thisWeekAppointments} appointments scheduled</p>
              </div>
            </div>
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary gap-1 text-xs">
                View all <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
        )}

        {/* Upcoming Appointments */}
        <Card className="border-border shadow-none">
          <CardHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                Upcoming Appointments
              </CardTitle>
              <Link href="/bookings">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                  View all <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-36 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : upcoming && upcoming.length > 0 ? (
              <div className="divide-y divide-border">
                {upcoming.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">
                        {appt.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{appt.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.service || "Appointment"} &middot;{" "}
                        {format(parseISO(appt.appointmentDate), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[appt.status]}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="p-4 bg-muted rounded-2xl mb-4">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No upcoming appointments</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Share your booking link with customers to get started
                </p>
                <Link href="/business">
                  <Button size="sm" variant="outline" className="text-xs">
                    Set up your business
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
