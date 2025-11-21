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

export const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: STATUS_COLORS['new'] },
    { value: 'ongoing', label: 'Ongoing', color: STATUS_COLORS['ongoing'] },
    { value: 'on hold', label: 'On Hold', color: STATUS_COLORS['on hold'] },
    { value: 'done', label: 'Done', color: STATUS_COLORS['done'] },
] as const;

// Status transition rules - defines valid status changes
export const STATUS_TRANSITIONS: Record<string, string[]> = {
    'new': ['ongoing', 'on hold'],           // New can go to ongoing or on hold
    'ongoing': ['on hold', 'done'],          // Ongoing can go to on hold or done
    'on hold': ['ongoing', 'done'],          // On hold can resume or complete
    'done': [],                              // Done is final (no transitions)
};

// Helper function to get allowed status transitions
export function getAllowedStatusTransitions(currentStatus: string): typeof STATUS_OPTIONS[number][] {
    const allowedValues = STATUS_TRANSITIONS[currentStatus] || [];
    return STATUS_OPTIONS.filter(option => allowedValues.includes(option.value));
}

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
