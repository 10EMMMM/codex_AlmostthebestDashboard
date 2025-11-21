import { useState } from "react";
import type { City } from "@/components/features/requests/types";

/**
 * Custom hook for managing city data loading
 * 
 * @returns Object containing cities array, loading state, and load function
 */
export function useCities() {
    const [cities, setCities] = useState<City[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const loadCities = async (userId: string) => {
        if (!userId) return;

        setCitiesLoading(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                console.error("Supabase client not initialized");
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`/api/admin/user-cities?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) {
                console.error("Error fetching cities from API:", await response.text());
                setCities([]);
                return;
            }

            const data = await response.json();

            if (data.cities && data.cities.length > 0) {
                setCities(data.cities);
            } else {
                setCities([]);
            }
        } catch (error) {
            console.error("Error loading cities:", error);
            setCities([]);
        } finally {
            setCitiesLoading(false);
        }
    };

    return {
        cities,
        citiesLoading,
        loadCities,
    };
}
