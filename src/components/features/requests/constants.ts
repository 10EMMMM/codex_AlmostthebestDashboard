import { UtensilsCrossed, PartyPopper, ChefHat } from "lucide-react";

export const REQUEST_TYPE_COLORS: Record<string, string> = {
    RESTAURANT: "bg-emerald-500 text-white",
    EVENT: "bg-blue-500 text-white",
    CUISINE: "bg-purple-500 text-white",
};

export const STATUS_COLORS: Record<string, string> = {
    "new": "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    "ongoing": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    "on hold": "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    "done": "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    // Legacy/fallback statuses
    NEW: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    PENDING: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    IN_PROGRESS: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    ON_PROGRESS: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    ON_HOLD: "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    DONE: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    COMPLETED: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    CANCELLED: "bg-gray-500/90 text-white",
    OPEN: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    CLOSED: "bg-slate-500/90 text-white",
};

export const REQUEST_TYPE_CONFIG = {
    RESTAURANT: {
        icon: UtensilsCrossed,
    },
    EVENT: {
        icon: PartyPopper,
    },
    CUISINE: {
        icon: ChefHat,
    },
} as const;
