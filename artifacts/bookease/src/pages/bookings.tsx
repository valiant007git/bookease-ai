import { useState } from "react";
import {
  useListMyAppointments,
  useUpdateAppointmentStatus,
  getListMyAppointmentsQueryKey,
} from "@workspace/api-client-react";
import type { AppointmentStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronDown,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string; icon: React.ComponentType<{ size?: number }> }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

const statusActions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: ["pending"],
};

export default function BookingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: appointments, isLoading } = useListMyAppointments(
    statusFilter !== "all" ? { status: statusFilter } : {},
    {
      query: {
        queryKey: getListMyAppointmentsQueryKey(
          statusFilter !== "all" ? { status: statusFilter } : {}
        ),
      },
    }
  );

  const { mutateAsync: updateStatus } = useUpdateAppointmentStatus();

  const filtered = (appointments ?? []).filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.customerName.toLowerCase().includes(q) ||
      (a.customerEmail ?? "").toLowerCase().includes(q) ||
      (a.service ?? "").toLowerCase().includes(q)
    );
  });

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await updateStatus({ id, data: { status } });
      await queryClient.invalidateQueries({ queryKey: getListMyAppointmentsQueryKey({}) });
      await queryClient.invalidateQueries({ queryKey: getListMyAppointmentsQueryKey({ status: statusFilter as AppointmentStatus }) });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and review all your appointments
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  statusFilter === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="border-border shadow-none overflow-hidden">
          {isLoading ? (
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </CardContent>
          ) : filtered.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 bg-muted rounded-2xl mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No appointments found</p>
              <p className="text-xs text-muted-foreground">
                {search ? "Try a different search term" : "No appointments match this filter"}
              </p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((appt) => {
                const cfg = statusConfig[appt.status];
                const StatusIcon = cfg.icon;
                const actions = statusActions[appt.status];
                return (
                  <div
                    key={appt.id}
                    className="flex items-start sm:items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors flex-col sm:flex-row"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">
                        {appt.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{appt.customerName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {appt.service || "General appointment"} &middot;{" "}
                        {format(parseISO(appt.appointmentDate), "MMM d, yyyy h:mm a")}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {appt.customerEmail && (
                          <a
                            href={`mailto:${appt.customerEmail}`}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mail size={11} />
                            {appt.customerEmail}
                          </a>
                        )}
                        {appt.customerPhone && (
                          <a
                            href={`tel:${appt.customerPhone}`}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Phone size={11} />
                            {appt.customerPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${cfg.className}`}>
                        <StatusIcon size={11} />
                        {cfg.label}
                      </span>
                      {actions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1 border-border"
                              disabled={updatingId === appt.id}
                            >
                              {updatingId === appt.id ? (
                                <RotateCcw size={12} className="animate-spin" />
                              ) : (
                                <>
                                  Update <ChevronDown size={11} />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {actions.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => handleStatusChange(appt.id, s)}
                                className="text-xs capitalize"
                              >
                                {statusConfig[s].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
