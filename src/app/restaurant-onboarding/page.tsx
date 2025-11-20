"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Calendar,
  CheckCircle,
  ClipboardList,
  FilePlus,
  MapPin,
  PauseCircle,
  Phone,
  PlusCircle,
  RefreshCw,
  Target,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SplashScreen } from "@/components/ui/splash-screen";

const RESTAURANT_STATUSES = ["new", "on progress", "on hold", "done"] as const;
type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];

const statusConfig: Record<
  RestaurantStatus,
  { badgeClass: string; label: string; icon: typeof PlusCircle }
> = {
  new: {
    badgeClass: "bg-sky-900/30 border-sky-400/60 text-sky-50",
    label: "New intake",
    icon: PlusCircle,
  },
  "on progress": {
    badgeClass: "bg-amber-900/30 border-amber-300/60 text-amber-100",
    label: "Active onboarding",
    icon: RefreshCw,
  },
  "on hold": {
    badgeClass: "bg-slate-900/40 border-slate-500/60 text-slate-100",
    label: "On hold",
    icon: PauseCircle,
  },
  done: {
    badgeClass: "bg-emerald-900/30 border-emerald-300/60 text-emerald-50",
    label: "Completed",
    icon: CheckCircle,
  },
};

type RestaurantRecord = {
  id: string;
  name: string;
  status: RestaurantStatus | null;
  city_id: string | null;
  primary_cuisine_id: string | null;
  onboarding_stage: string | null;
  description: string | null;
  bdr_target_per_week: number | null;
  created_at: string;
};

type RestaurantContactRecord = {
  restaurant_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
};

type RestaurantAssignmentRecord = {
  restaurant_id: string;
  user_id: string;
};

type CityOption = { id: string; label: string };
type CuisineOption = { id: string; label: string };
type BdrOption = { id: string; label: string };

type EnrichedRestaurant = {
  id: string;
  name: string;
  status: RestaurantStatus;
  cityLabel: string;
  cuisineLabel: string;
  onboardingStage: string;
  description: string;
  createdAt: string;
  bdrTarget: number;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  assignedBdr?: string | null;
};

type FilterOption = { value: string; label: string };

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">
      {label}
    </span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[190px] rounded-full border-white/20 bg-white/10 text-white shadow">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-xl">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="capitalize">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

type KanbanColumn = {
  title: string;
  accent: string;
  containerClass: string;
  cardClass: string;
  items: {
    title: string;
    subtitle: string;
    meta: string;
  }[];
};

const kanbanDemoColumns: KanbanColumn[] = [
  {
    title: "Intake",
    accent: "text-sky-200",
    containerClass: "bg-gradient-to-b from-sky-500/30 via-sky-500/10 to-transparent border-sky-400/40",
    cardClass: "bg-white/10 border-sky-300/40",
    items: [
      {
        title: "Monarch Bistro",
        subtitle: "Awaiting documents",
        meta: "Chicago • 4 attachments",
      },
      {
        title: "Pasta Nova",
        subtitle: "Needs compliance form",
        meta: "Atlanta • 2 tasks",
      },
    ],
  },
  {
    title: "Onboarding",
    accent: "text-amber-200",
    containerClass: "bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent border-amber-400/40",
    cardClass: "bg-white/10 border-amber-300/40",
    items: [
      {
        title: "Sunset Tacos",
        subtitle: "Menu shoot scheduled",
        meta: "Austin • Due Friday",
      },
      {
        title: "Velvet Sushi",
        subtitle: "Taste review in progress",
        meta: "Seattle • 6 tasks",
      },
    ],
  },
  {
    title: "Ready",
    accent: "text-emerald-200",
    containerClass: "bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent border-emerald-400/40",
    cardClass: "bg-white/10 border-emerald-300/40",
    items: [
      {
        title: "Garden Bowl",
        subtitle: "QA complete",
        meta: "Denver • Launch Monday",
      },
      {
        title: "Cafe Aurora",
        subtitle: "Awaiting final sign-off",
        meta: "NYC • 1 blocker",
      },
    ],
  },
];

const DemoKanbanBoard = () => (
  <div className="flex flex-col gap-4 md:flex-row">
    {kanbanDemoColumns.map((column) => (
      <div
        key={column.title}
        className={cn(
          "flex-1 min-w-[220px] space-y-3 rounded-2xl border p-3",
          column.containerClass
        )}
      >
        <p className={cn("text-xs font-semibold uppercase tracking-[0.3em]", column.accent)}>
          {column.title}
        </p>
        {column.items.map((item) => (
          <div
            key={item.title}
            className={cn(
              "rounded-xl bg-white/10 p-3 shadow-[0_10px_25px_rgba(0,0,0,0.25)]",
              column.cardClass
            )}
          >
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-xs text-white/70">{item.subtitle}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
              {item.meta}
            </p>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const OPTIONAL_VALUE = "__none__";

const normalizeStatus = (value: string | null | undefined): RestaurantStatus =>
  RESTAURANT_STATUSES.includes(value as RestaurantStatus)
    ? (value as RestaurantStatus)
    : "new";

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "—";

const initials = (value: string) =>
  value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3">
    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
      {label}
    </p>
    <div className="text-white/90">{value}</div>
  </div>
);

const RestaurantCard = ({
  restaurant,
  onSelect,
}: {
  restaurant: EnrichedRestaurant;
  onSelect: () => void;
}) => {
  const config = statusConfig[restaurant.status];
  return (
    <div className="widget">
      <Card
        className="h-full cursor-pointer border-white/15 bg-white/5 transition hover:-translate-y-1 hover:border-white/40"
        onClick={onSelect}
      >
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg text-white">
              {restaurant.name}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 border px-2 py-1 text-xs capitalize",
                config.badgeClass
              )}
            >
              <config.icon className="h-3.5 w-3.5" />
              {restaurant.status}
            </Badge>
          </div>
          <p className="text-xs text-white/60">{config.label}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/75">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-white/40" />
              <span>{restaurant.cityLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-3.5 w-3.5 text-white/40" />
              <span>{restaurant.cuisineLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-white/40" />
              <span>{restaurant.bdrTarget} targets / week</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-white/40" />
              <span>{restaurant.assignedBdr ?? "BDR pending"}</span>
            </div>
          </div>
          <p className="line-clamp-3 text-white/70">
            {restaurant.description || "No onboarding notes yet."}
          </p>
          <p className="text-xs text-white/40">
            Added {formatDate(restaurant.createdAt)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const RestaurantDetail = ({ restaurant }: { restaurant: EnrichedRestaurant }) => {
  const config = statusConfig[restaurant.status];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">{restaurant.name}</h2>
          <p className="text-sm text-white/60">{restaurant.cityLabel}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1 border px-3 py-1 text-sm capitalize",
            config.badgeClass
          )}
        >
          <config.icon className="h-4 w-4" />
          {restaurant.status}
        </Badge>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Onboarding Stage
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
          <ClipboardList className="h-4 w-4 text-white/40" />
          {restaurant.onboardingStage}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoRow label="Cuisine" value={restaurant.cuisineLabel} />
        <InfoRow label="BDR target" value={`${restaurant.bdrTarget} per week`} />
        <InfoRow
          label="Assigned BDR"
          value={restaurant.assignedBdr ?? "Unassigned"}
        />
        <InfoRow
          label="Created"
          value={
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/40" />
              {formatDate(restaurant.createdAt)}
            </div>
          }
        />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Notes</p>
        <p className="mt-2 text-sm text-white/80">
          {restaurant.description || "No onboarding notes yet."}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Primary Contact
        </p>
        <div className="mt-3 flex flex-col gap-2 text-white/75">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/20 bg-white/10">
              <AvatarFallback className="text-xs text-white/60">
                {initials(restaurant.contactName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white/90">{restaurant.contactName}</p>
              <p className="text-xs text-white/50">Point of contact</p>
            </div>
          </div>
          {restaurant.contactEmail && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-white/40" />
              {restaurant.contactEmail}
            </div>
          )}
          {restaurant.contactPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-white/40" />
              {restaurant.contactPhone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type CreateRestaurantFormProps = {
  supabase: SupabaseClient;
  onCancel: () => void;
  onCreated: () => void;
  cityOptions: CityOption[];
  cuisineOptions: CuisineOption[];
  bdrOptions: BdrOption[];
  cityOptionsLoading: boolean;
  bdrOptionsLoading: boolean;
  canAssignBdr: boolean;
};

const CreateRestaurantForm = ({
  supabase,
  onCancel,
  onCreated,
  cityOptions,
  cuisineOptions,
  bdrOptions,
  cityOptionsLoading,
  bdrOptionsLoading,
  canAssignBdr,
}: CreateRestaurantFormProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const rounded = "rounded-[12px]";
  const [formValues, setFormValues] = useState({
    name: "",
    cityId: "",
    cuisineId: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    bdrUserId: "",
  });

  useEffect(() => {
    if (!formValues.cityId && cityOptions.length === 1) {
      setFormValues((prev) => ({ ...prev, cityId: cityOptions[0].id }));
    }
  }, [cityOptions, formValues.cityId]);

  const handleChange = (key: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () =>
    setFormValues({
      name: "",
      cityId: "",
      cuisineId: "",
      description: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      bdrUserId: "",
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValues.name.trim()) {
      toast({
        title: "Restaurant name required",
        description: "Please provide a name.",
        variant: "destructive",
      });
      return;
    }
    if (!formValues.cityId) {
      toast({
        title: "City required",
        description: "Select one of your covered cities.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .insert({
          name: formValues.name.trim(),
          city_id: formValues.cityId,
          primary_cuisine_id: formValues.cuisineId || null,
          description: formValues.description || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      const restaurantId = data?.id;

      if (
        restaurantId &&
        (formValues.contactName ||
          formValues.contactEmail ||
          formValues.contactPhone)
      ) {
        const { error: contactError } = await supabase
          .from("restaurant_contacts")
          .insert({
            restaurant_id: restaurantId,
            full_name: formValues.contactName || "Primary Contact",
            email: formValues.contactEmail || null,
            phone: formValues.contactPhone || null,
            is_primary: true,
          });
        if (contactError) throw contactError;
      }

      if (restaurantId && canAssignBdr && formValues.bdrUserId) {
        const { error: assignmentError } = await supabase
          .from("restaurant_assignments")
          .upsert({
            restaurant_id: restaurantId,
            user_id: formValues.bdrUserId,
            role: "BDR",
          });
        if (assignmentError) throw assignmentError;
      }

      toast({ title: "Restaurant added", description: "Onboarding started." });
      resetForm();
      onCreated();
    } catch (error) {
      console.error("Error creating restaurant", error);
      toast({
        title: "Unable to create restaurant",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>New Restaurant Onboarding</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="restaurant-name">Restaurant Name</Label>
          <Input
            id="restaurant-name"
            value={formValues.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="e.g. The Golden Spoon"
            className={rounded}
          />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Select
            value={formValues.cityId}
            onValueChange={(value) => handleChange("cityId", value)}
            disabled={cityOptionsLoading || !cityOptions.length}
          >
            <SelectTrigger className={rounded}>
              <SelectValue
                placeholder={
                  cityOptionsLoading ? "Loading cities..." : "Select city"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!cityOptionsLoading && !cityOptions.length && (
            <p className="text-xs text-muted-foreground">
              No city coverage. Ask a super admin to assign cities.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Cuisine</Label>
          <Select
            value={formValues.cuisineId || OPTIONAL_VALUE}
            onValueChange={(value) =>
              handleChange("cuisineId", value === OPTIONAL_VALUE ? "" : value)
            }
          >
            <SelectTrigger className={rounded}>
              <SelectValue placeholder="Select cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={OPTIONAL_VALUE}>Not set</SelectItem>
              {cuisineOptions.map((cuisine) => (
                <SelectItem key={cuisine.id} value={cuisine.id}>
                  {cuisine.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description / Notes</Label>
        <Textarea
          value={formValues.description}
          onChange={(event) => handleChange("description", event.target.value)}
          placeholder="Share onboarding context, blockers..."
          className={cn("min-h-[140px]", rounded)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Primary Contact</Label>
          <Input
            placeholder="Full name"
            value={formValues.contactName}
            onChange={(event) => handleChange("contactName", event.target.value)}
            className={rounded}
          />
          <Input
            placeholder="Email"
            type="email"
            value={formValues.contactEmail}
            onChange={(event) =>
              handleChange("contactEmail", event.target.value)
            }
            className={rounded}
          />
          <Input
            placeholder="Phone"
            value={formValues.contactPhone}
            onChange={(event) =>
              handleChange("contactPhone", event.target.value)
            }
            className={rounded}
          />
        </div>
        <div className="space-y-2">
          <Label>Assigned BDR</Label>
          <Select
            value={formValues.bdrUserId || OPTIONAL_VALUE}
            onValueChange={(value) =>
              handleChange("bdrUserId", value === OPTIONAL_VALUE ? "" : value)
            }
            disabled={bdrOptionsLoading || !canAssignBdr}
          >
            <SelectTrigger className={rounded}>
              <SelectValue placeholder="Select BDR (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={OPTIONAL_VALUE}>Unassigned</SelectItem>
              {bdrOptions.map((bdr) => (
                <SelectItem key={bdr.id} value={bdr.id}>
                  {bdr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!canAssignBdr && (
            <p className="text-xs text-muted-foreground">
              Only super admins can assign BDRs during intake.
            </p>
          )}
          {canAssignBdr && !bdrOptionsLoading && !bdrOptions.length && (
            <p className="text-xs text-muted-foreground">
              No BDR profiles found. Add BDR roles first.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default function RestaurantOnboardingPage() {
  const { supabase, user, roles, isSuperAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [restaurants, setRestaurants] = useState<EnrichedRestaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<EnrichedRestaurant | null>(null);

  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [cityOptionsLoading, setCityOptionsLoading] = useState(true);
  const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);
  const [bdrOptions, setBdrOptions] = useState<BdrOption[]>([]);
  const [bdrOptionsLoading, setBdrOptionsLoading] = useState(true);

  const [filters, setFilters] = useState({ status: "all", city: "all" });

  const isAccountManager = roles.includes("ACCOUNT_MANAGER");

  const loadRestaurants = useCallback(async () => {
    setRestaurantsLoading(true);
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select(
          "id, name, status, city_id, primary_cuisine_id, onboarding_stage, description, bdr_target_per_week, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const records = (data ?? []) as RestaurantRecord[];
      if (!records.length) {
        setRestaurants([]);
        return;
      }

      const cityIds = Array.from(
        new Set(records.map((record) => record.city_id).filter(Boolean))
      ) as string[];
      const cuisineIds = Array.from(
        new Set(
          records.map((record) => record.primary_cuisine_id).filter(Boolean)
        )
      ) as string[];
      const restaurantIds = records.map((record) => record.id);

      const [cityRows, cuisineRows, contactRows, assignmentRows] =
        await Promise.all([
          cityIds.length
            ? supabase
              .from("cities")
              .select("id, name, state_code")
              .in("id", cityIds)
            : Promise.resolve({ data: [], error: null }),
          cuisineIds.length
            ? supabase
              .from("cuisines")
              .select("id, name")
              .in("id", cuisineIds)
            : Promise.resolve({ data: [], error: null }),
          supabase
            .from("restaurant_contacts")
            .select("restaurant_id, full_name, email, phone, is_primary")
            .in("restaurant_id", restaurantIds),
          supabase
            .from("restaurant_assignments")
            .select("restaurant_id, user_id, role")
            .eq("role", "BDR")
            .in("restaurant_id", restaurantIds),
        ]);

      if (cityRows.error) throw cityRows.error;
      if (cuisineRows.error) throw cuisineRows.error;
      if (contactRows.error) throw contactRows.error;
      if (assignmentRows.error) throw assignmentRows.error;

      const cityLookup: Record<string, string> = {};
      (cityRows.data ?? []).forEach((city: any) => {
        cityLookup[city.id] = `${city.name}, ${city.state_code ?? ""}`.trim();
      });

      const cuisineLookup: Record<string, string> = {};
      (cuisineRows.data ?? []).forEach((cuisine) => {
        cuisineLookup[cuisine.id] = cuisine.name;
      });

      const contactLookup: Record<string, RestaurantContactRecord | undefined> =
        {};
      contactRows.data?.forEach((contact) => {
        if (!contactLookup[contact.restaurant_id] || contact.is_primary) {
          contactLookup[contact.restaurant_id] = contact;
        }
      });

      const assignments = assignmentRows.data as RestaurantAssignmentRecord[];
      const bdrUserIds = Array.from(
        new Set(assignments.map((assignment) => assignment.user_id))
      );

      const { data: profileRows, error: profileError } = bdrUserIds.length
        ? await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", bdrUserIds)
        : { data: [], error: null };
      if (profileError) throw profileError;

      const profileLookup: Record<string, string> = {};
      profileRows?.forEach((profile) => {
        profileLookup[profile.user_id] =
          profile.display_name ?? "Assigned BDR";
      });

      const assignmentLookup: Record<string, string | undefined> = {};
      assignments.forEach((assignment) => {
        assignmentLookup[assignment.restaurant_id] =
          profileLookup[assignment.user_id];
      });

      const enriched: EnrichedRestaurant[] = records.map((record) => {
        const contact = contactLookup[record.id];
        return {
          id: record.id,
          name: record.name,
          status: normalizeStatus(record.status),
          cityLabel:
            (record.city_id && cityLookup[record.city_id]) ||
            "Pending city assignment",
          cuisineLabel:
            (record.primary_cuisine_id &&
              cuisineLookup[record.primary_cuisine_id]) ||
            "No cuisine set",
          onboardingStage: record.onboarding_stage || "Awaiting kickoff",
          description: record.description || "",
          createdAt: record.created_at,
          bdrTarget: record.bdr_target_per_week ?? 4,
          contactName: contact?.full_name || "Primary contact TBD",
          contactEmail: contact?.email,
          contactPhone: contact?.phone,
          assignedBdr: assignmentLookup[record.id],
        };
      });

      setRestaurants(enriched);
    } catch (error) {
      console.error("Error loading restaurants", error);
      toast({
        title: "Unable to load restaurants",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  }, [supabase, toast]);

  const loadCityOptions = useCallback(async () => {
    if (!user) {
      setCityOptions([]);
      setCityOptionsLoading(false);
      return;
    }

    setCityOptionsLoading(true);
    try {
      if (isAccountManager) {
        const { data, error } = await supabase
          .from("account_manager_cities")
          .select("city_id, cities!inner(id, name, state_code)")
          .eq("user_id", user.id);
        if (error) throw error;
        setCityOptions(
          data?.map((row: any) => ({
            id: row.city_id,
            label: `${row.cities.name}, ${row.cities.state_code}`,
          })) ?? []
        );
      } else {
        const { data, error } = await supabase
          .from("cities")
          .select("id, name, state_code")
          .order("name");
        if (error) throw error;
        setCityOptions(
          data?.map((city) => ({
            id: city.id,
            label: `${city.name}, ${city.state_code}`,
          })) ?? []
        );
      }
    } catch (error) {
      console.error("Error loading cities", error);
      toast({
        title: "Unable to load cities",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setCityOptions([]);
    } finally {
      setCityOptionsLoading(false);
    }
  }, [user, isAccountManager, supabase, toast]);

  const loadCuisineOptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("cuisines")
        .select("id, name")
        .order("name");
      if (error) throw error;
      setCuisineOptions(
        data?.map((cuisine) => ({ id: cuisine.id, label: cuisine.name })) ?? []
      );
    } catch (error) {
      console.error("Error loading cuisines", error);
      toast({
        title: "Unable to load cuisines",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setCuisineOptions([]);
    }
  }, [supabase, toast]);

  const loadBdrOptions = useCallback(async () => {
    if (!isSuperAdmin) {
      setBdrOptions([]);
      setBdrOptionsLoading(false);
      return;
    }

    setBdrOptionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "BDR");
      if (error) throw error;

      const ids = Array.from(new Set(data?.map((row) => row.user_id) ?? []));
      if (!ids.length) {
        setBdrOptions([]);
        return;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      if (profileError) throw profileError;

      setBdrOptions(
        profileRows?.map((profile) => ({
          id: profile.user_id,
          label: profile.display_name ?? "BDR",
        })) ?? []
      );
    } catch (error) {
      console.error("Error loading BDR options", error);
      toast({
        title: "Unable to load BDR directory",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setBdrOptions([]);
    } finally {
      setBdrOptionsLoading(false);
    }
  }, [isSuperAdmin, supabase, toast]);

  useEffect(() => {
    if (!authLoading) {
      loadRestaurants();
      loadCityOptions();
      loadCuisineOptions();
      loadBdrOptions();
    }
  }, [
    authLoading,
    loadRestaurants,
    loadCityOptions,
    loadCuisineOptions,
    loadBdrOptions,
  ]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const statusMatch =
        filters.status === "all" || restaurant.status === filters.status;
      const cityMatch =
        filters.city === "all" || restaurant.cityLabel === filters.city;
      return statusMatch && cityMatch;
    });
  }, [restaurants, filters]);

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: "all", label: "All statuses" },
      ...RESTAURANT_STATUSES.map((status) => ({
        value: status,
        label: status,
      })),
    ],
    []
  );

  const cityOptionsForFilter = useMemo<FilterOption[]>(() => {
    const unique = Array.from(new Set(restaurants.map((res) => res.cityLabel)));
    return [
      { value: "all", label: "All cities" },
      ...unique.map((city) => ({ value: city, label: city })),
    ];
  }, [restaurants]);

  const summaryStats = useMemo(() => {
    const active = restaurants.filter(
      (restaurant) =>
        restaurant.status === "new" || restaurant.status === "on progress"
    ).length;
    const completed = restaurants.filter(
      (restaurant) => restaurant.status === "done"
    ).length;
    const cities = new Set(restaurants.map((restaurant) => restaurant.cityLabel))
      .size;
    return [
      { label: "Active pipelines", value: active },
      { label: "Completed onboardings", value: completed },
      { label: "Cities covered", value: cities },
    ];
  }, [restaurants]);

  const handleRestaurantCreated = () => {
    setCreateDialogOpen(false);
    loadRestaurants();
  };

  if (authLoading) {
    return <SplashScreen loading />;
  }

  return (
    <>
      <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
        Onboarding
      </div>
      <DashboardLayout
        title=""
        actionButton={
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full border-transparent hover:border-primary"
                  >
                    <FilePlus className="h-4 w-4" />
                    <span className="sr-only">New Onboarding</span>
                  </Button>
                </DialogTrigger>
                <TooltipContent>
                  <p>New Onboarding</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-lg">
              <CreateRestaurantForm
                supabase={supabase}
                onCancel={() => setCreateDialogOpen(false)}
                onCreated={handleRestaurantCreated}
                cityOptions={cityOptions}
                cuisineOptions={cuisineOptions}
                bdrOptions={bdrOptions}
                cityOptionsLoading={cityOptionsLoading}
                bdrOptionsLoading={bdrOptionsLoading}
                canAssignBdr={isSuperAdmin}
              />
            </DialogContent>
          </Dialog>
        }
      >
        <div
          style={{ transform: "scale(0.8)", transformOrigin: "top center" }}
          className="w-full"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <DemoKanbanBoard />
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
              {summaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-black/25 p-4 text-center text-white"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/15 bg-white/5 px-6 py-3 backdrop-blur-2xl">
              <FilterSelect
                label="Status"
                value={filters.status}
                options={statusOptions}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              />
              <FilterSelect
                label="City"
                value={filters.city}
                options={cityOptionsForFilter}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, city: value }))
                }
              />
            </div>
            <div className="dashboard-grid">
              {restaurantsLoading && (
                <div className="widget">
                  <Card className="p-4 text-center text-sm text-muted-foreground">
                    Loading restaurant onboardings…
                  </Card>
                </div>
              )}
              {!restaurantsLoading && !filteredRestaurants.length && (
                <div className="widget">
                  <Card className="p-6 text-center text-sm text-white/70">
                    {restaurants.length
                      ? "No restaurants match your filters."
                      : "No restaurants have been onboarded yet."}
                  </Card>
                </div>
              )}
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSelect={() => {
                    setSelectedRestaurant(restaurant);
                    setDetailDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgба(0,0,0,0.5)]">
            <DialogHeader>
              <DialogTitle className="sr-only">Restaurant Details</DialogTitle>
            </DialogHeader>
            {selectedRestaurant && (
              <div className="px-4 sm:px-6 pb-4">
                <RestaurantDetail restaurant={selectedRestaurant} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}



