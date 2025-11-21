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
