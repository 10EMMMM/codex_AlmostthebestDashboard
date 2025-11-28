import type { RestaurantStatus, RestaurantFilters } from "./types";
import { RESTAURANT_STATUSES } from "./constants";

/**
 * Format a date string to a readable format
 */
export const formatDate = (value: string | null | undefined): string => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

/**
 * Format a time string to AM/PM format
 */
export const formatTime = (time: string | null | undefined): string => {
    if (!time) return "";

    try {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return time;
    }
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 */
export const formatRelativeDate = (value: string | null | undefined): string => {
    if (!value) return "—";

    const date = new Date(value);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
        return "just now";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
        return formatDate(value);
    }
};

/**
 * Normalize status value to ensure it's valid
 */
export const normalizeStatus = (value: string | null | undefined): RestaurantStatus => {
    return RESTAURANT_STATUSES.includes(value as RestaurantStatus)
        ? (value as RestaurantStatus)
        : "new";
};

/**
 * Get initials from a full name
 */
export const getInitials = (value: string): string => {
    return value
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

/**
 * Build query parameters for restaurant filtering
 */
export const buildRestaurantFilters = (filters: RestaurantFilters): URLSearchParams => {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append("search", filters.search);
    }

    if (filters.statuses.length > 0) {
        params.append("statuses", filters.statuses.join(","));
    }

    if (filters.cities.length > 0) {
        params.append("cities", filters.cities.join(","));
    }

    if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
        params.append("dateTo", filters.dateTo.toISOString());
    }

    params.append("sortBy", filters.sortBy);
    params.append("sortDirection", filters.sortDirection);

    return params;
};
