import { CheckCircle, PauseCircle, PlusCircle, RefreshCw } from "lucide-react";
import type { RestaurantStatus } from "./types";

// Restaurant status values
export const RESTAURANT_STATUSES: RestaurantStatus[] = [
    "new",
    "on progress",
    "on hold",
    "done"
];

// Status configuration with colors, labels, and icons
export const RESTAURANT_STATUS_CONFIG: Record<
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

// Default filter values
export const DEFAULT_RESTAURANT_FILTERS = {
    search: "",
    statuses: [] as RestaurantStatus[],
    cities: [] as string[],
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: "created_at" as const,
    sortDirection: "desc" as const,
};

// Sort options for dropdown
export const RESTAURANT_SORT_OPTIONS = [
    { value: "created_at", label: "Created Date" },
    { value: "updated_at", label: "Updated Date" },
    { value: "name", label: "Name" },
    { value: "bdr_target_per_week", label: "BDR Target" },
] as const;
