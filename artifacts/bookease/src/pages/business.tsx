import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetMyBusiness,
  useUpsertMyBusiness,
  getGetMyBusinessQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const CATEGORIES = [
  { value: "clinic", label: "Medical Clinic" },
  { value: "salon", label: "Hair Salon" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "restaurant", label: "Restaurant" },
  { value: "spa", label: "Spa & Wellness" },
  { value: "dental", label: "Dental Practice" },
  { value: "barber", label: "Barbershop" },
  { value: "other", label: "Other" },
] as const;

const schema = z.object({
  name: z.string().min(1, "Business name is required"),
  category: z.enum(["clinic", "salon", "gym", "restaurant", "spa", "dental", "barber", "other"]),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BusinessPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: business, isLoading } = useGetMyBusiness({
    query: { queryKey: getGetMyBusinessQueryKey() },
  });
  const { mutateAsync: upsert, isPending: saving } = useUpsertMyBusiness();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "other",
      description: "",
      phone: "",
      email: "",
      address: "",
      website: "",
    },
  });

  useEffect(() => {
    if (business) {
      form.reset({
        name: business.name,
        category: business.category as FormData["category"],
        description: business.description ?? "",
        phone: business.phone ?? "",
        email: business.email ?? "",
        address: business.address ?? "",
        website: business.website ?? "",
      });
    }
  }, [business]);

  const onSubmit = async (data: FormData) => {
    try {
      await upsert({
        data: {
          name: data.name,
          category: data.category,
          description: data.description || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          website: data.website || undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMyBusinessQueryKey() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    }
  };

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const widgetUrl = business
    ? `${window.location.origin}${basePath}/widget/${business.id}`
    : null;

  const copyWidgetUrl = () => {
    if (!widgetUrl) return;
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Business Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your business details and booking preferences
          </p>
        </div>

        {/* Widget link card */}
        {business && (
          <Card className="border-primary/30 bg-primary/5 shadow-none mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/15 rounded-lg flex-shrink-0">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Customer Booking Link</p>
                <p className="text-xs text-muted-foreground truncate">{widgetUrl}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/10"
                  onClick={copyWidgetUrl}
                >
                  {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/10"
                  onClick={() => window.open(widgetUrl!, "_blank")}
                >
                  <ExternalLink size={12} /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border shadow-none">
          <CardHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Business Details
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  This information will be shared with your AI booking assistant
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name" className="text-xs font-medium text-foreground mb-1.5 block">
                      Business Name *
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="e.g. Harmony Wellness Clinic"
                      className="border-border bg-card"
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium text-foreground mb-1.5 block">
                      Category *
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map(({ value, label }) => {
                        const selected = form.watch("category") === value;
                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => form.setValue("category", value)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="description" className="text-xs font-medium text-foreground mb-1.5 block">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Tell customers what services you offer..."
                      className="border-border bg-card resize-none h-20 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium text-foreground mb-1.5 block">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="+1 (555) 000-0000"
                      className="border-border bg-card"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-foreground mb-1.5 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="hello@yourbusiness.com"
                      className="border-border bg-card"
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-xs font-medium text-foreground mb-1.5 block">
                      Address
                    </Label>
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder="123 Main St, City, State"
                      className="border-border bg-card"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-xs font-medium text-foreground mb-1.5 block">
                      Website
                    </Label>
                    <Input
                      id="website"
                      {...form.register("website")}
                      placeholder="https://yourbusiness.com"
                      className="border-border bg-card"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
                  </Button>
                  {saved && (
                    <div className="flex items-center gap-1.5 text-green-600 text-sm">
                      <CheckCircle2 size={15} />
                      <span className="font-medium">Changes saved</span>
                    </div>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
