import { useState } from "react";
import {
  useListMyAvailability,
  useCreateAvailabilitySlot,
  useUpdateAvailabilitySlot,
  useDeleteAvailabilitySlot,
  getListMyAvailabilityQueryKey,
} from "@workspace/api-client-react";
import type { AvailabilitySlot } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Check, X, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

type SlotForm = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
};

const defaultForm = (day: number): SlotForm => ({
  dayOfWeek: day,
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
  isActive: true,
});

export default function AvailabilityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: slots, isLoading } = useListMyAvailability({
    query: { queryKey: getListMyAvailabilityQueryKey() },
  });

  const { mutateAsync: createSlot } = useCreateAvailabilitySlot();
  const { mutateAsync: updateSlot } = useUpdateAvailabilitySlot();
  const { mutateAsync: deleteSlot } = useDeleteAvailabilitySlot();

  const [adding, setAdding] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SlotForm>(defaultForm(1));
  const [editForm, setEditForm] = useState<SlotForm>(defaultForm(1));
  const [saving, setSaving] = useState(false);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListMyAvailabilityQueryKey() });

  const slotsByDay = DAYS.map((_, i) =>
    (slots ?? []).filter((s) => s.dayOfWeek === i)
  );

  const handleAdd = async () => {
    setSaving(true);
    try {
      await createSlot({ data: form });
      await invalidate();
      setAdding(null);
    } catch {
      toast({ title: "Failed to add slot", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      await updateSlot({ id, data: editForm });
      await invalidate();
      setEditingId(null);
    } catch {
      toast({ title: "Failed to update slot", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSlot({ id });
      await invalidate();
    } catch {
      toast({ title: "Failed to delete slot", variant: "destructive" });
    }
  };

  const handleToggle = async (slot: AvailabilitySlot) => {
    try {
      await updateSlot({
        id: slot.id,
        data: {
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDurationMinutes: slot.slotDurationMinutes,
          isActive: !slot.isActive,
        },
      });
      await invalidate();
    } catch {
      toast({ title: "Failed to toggle slot", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Availability</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set your weekly working hours and appointment durations
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day, dayIdx) => {
              const daySlots = slotsByDay[dayIdx];
              const isAddingThis = adding === dayIdx;

              return (
                <Card key={day} className="border-border shadow-none overflow-hidden">
                  <CardHeader className="px-5 py-4 border-b border-border flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {DAYS_SHORT[dayIdx]}
                      </span>
                      <CardTitle className="text-sm font-semibold text-foreground">{day}</CardTitle>
                      {daySlots.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {daySlots.filter((s) => s.isActive).length} active
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setAdding(isAddingThis ? null : dayIdx);
                        setForm(defaultForm(dayIdx));
                      }}
                    >
                      <Plus size={13} />
                      Add slot
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Existing slots */}
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        {editingId === slot.id ? (
                          <div className="flex-1 flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={editForm.startTime}
                                onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                                className="w-32 h-7 text-xs border-border"
                              />
                              <span className="text-muted-foreground text-xs">to</span>
                              <Input
                                type="time"
                                value={editForm.endTime}
                                onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                                className="w-32 h-7 text-xs border-border"
                              />
                            </div>
                            <select
                              value={editForm.slotDurationMinutes}
                              onChange={(e) => setEditForm((f) => ({ ...f, slotDurationMinutes: +e.target.value }))}
                              className="h-7 text-xs rounded-md border border-border bg-background px-2 text-foreground"
                            >
                              {DURATION_OPTIONS.map((d) => (
                                <option key={d} value={d}>{d} min slots</option>
                              ))}
                            </select>
                            <div className="flex gap-1 ml-auto">
                              <Button
                                size="icon"
                                className="h-7 w-7 bg-primary hover:bg-primary/90"
                                onClick={() => handleUpdate(slot.id)}
                                disabled={saving}
                              >
                                <Check size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setEditingId(null)}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Clock size={14} className="text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-foreground">
                                {slot.startTime} – {slot.endTime}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {slot.slotDurationMinutes} min slots
                              </span>
                            </div>
                            <Switch
                              checked={slot.isActive}
                              onCheckedChange={() => handleToggle(slot)}
                              className="data-[state=checked]:bg-primary"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setEditingId(slot.id);
                                setEditForm({
                                  dayOfWeek: slot.dayOfWeek,
                                  startTime: slot.startTime,
                                  endTime: slot.endTime,
                                  slotDurationMinutes: slot.slotDurationMinutes,
                                  isActive: slot.isActive,
                                });
                              }}
                            >
                              <Pencil size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add new slot form */}
                    {isAddingThis && (
                      <div className="px-5 py-3 bg-muted/30 flex items-center gap-2 flex-wrap border-t border-border">
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                            className="w-32 h-8 text-xs border-border"
                          />
                          <span className="text-muted-foreground text-xs">to</span>
                          <Input
                            type="time"
                            value={form.endTime}
                            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                            className="w-32 h-8 text-xs border-border"
                          />
                        </div>
                        <select
                          value={form.slotDurationMinutes}
                          onChange={(e) => setForm((f) => ({ ...f, slotDurationMinutes: +e.target.value }))}
                          className="h-8 text-xs rounded-md border border-border bg-background px-2 text-foreground"
                        >
                          {DURATION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d} min slots</option>
                          ))}
                        </select>
                        <div className="flex gap-1 ml-auto">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary hover:bg-primary/90 px-3"
                            onClick={handleAdd}
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setAdding(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {daySlots.length === 0 && !isAddingThis && (
                      <div className="px-5 py-3 text-xs text-muted-foreground">
                        No availability set for {day}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
