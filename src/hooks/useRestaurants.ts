import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant, RestaurantFilters } from "@/components/features/restaurants/types";

/**
 * Custom hook for managing restaurant data fetching and state
 * 
 * @param filters - Optional filters to apply to restaurants
 * @returns Object containing restaurants array, filtered restaurants, loading state, and fetch function
 */
export function useRestaurants(filters?: RestaurantFilters) {
    const { toast } = useToast();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/restaurants", {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch restaurants");

            const data = await response.json();
            setRestaurants(data.restaurants || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    const filteredRestaurants = useMemo(() => {
        if (!filters) return restaurants;

        return restaurants.filter((restaurant) => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    restaurant.name.toLowerCase().includes(searchLower) ||
                    restaurant.city_name?.toLowerCase().includes(searchLower) ||
                    restaurant.cuisine_name?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.statuses.length > 0 && !filters.statuses.includes(restaurant.status)) {
                return false;
            }

            // Onboarding stage filter
            if (filters.onboardingStages.length > 0 && restaurant.onboarding_stage) {
                if (!filters.onboardingStages.includes(restaurant.onboarding_stage)) {
                    return false;
                }
            }

            // City filter
            if (filters.cityIds.length > 0 && !filters.cityIds.includes(restaurant.city_id)) {
                return false;
            }

            // Cuisine filter
            if (filters.cuisineIds.length > 0 && restaurant.primary_cuisine_id) {
                if (!filters.cuisineIds.includes(restaurant.primary_cuisine_id)) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => {
            const direction = filters.sortDirection === 'asc' ? 1 : -1;
            const aVal = a[filters.sortBy as keyof Restaurant] || '';
            const bVal = b[filters.sortBy as keyof Restaurant] || '';

            if (aVal < bVal) return -1 * direction;
            if (aVal > bVal) return 1 * direction;
            return 0;
        });
    }, [restaurants, filters]);

    return {
        restaurants,
        filteredRestaurants,
        loading,
        loadRestaurants,
        refreshRestaurants: loadRestaurants, // Alias for clarity
    };
}
