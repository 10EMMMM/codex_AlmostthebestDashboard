import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface OptionItem {
    id: string;
    label: string;
}

interface UseRestaurantOptionsProps {
    supabase: any;
    open: boolean;
}

export function useRestaurantOptions({ supabase, open }: UseRestaurantOptionsProps) {
    const { isSuperAdmin } = useAuth();
    const [cityOptions, setCityOptions] = useState<OptionItem[]>([]);
    const [cuisineOptions, setCuisineOptions] = useState<OptionItem[]>([]);
    const [bdrOptions, setBdrOptions] = useState<OptionItem[]>([]);
    const [cityOptionsLoading, setCityOptionsLoading] = useState(true);

    useEffect(() => {
        if (!open) return;

        const loadOptions = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error('Error getting user:', userError);
                    return;
                }
                if (!user) return;

                // Load cities
                setCityOptionsLoading(true);
                let citiesQuery = supabase
                    .from("cities")
                    .select("id, name, state_code")
                    .order("name");

                if (!isSuperAdmin) {
                    const { data: userCities } = await supabase
                        .from("user_city_coverage")
                        .select("city_id")
                        .eq("user_id", user.id);

                    const cityIds = userCities?.map((uc: any) => uc.city_id) || [];
                    if (cityIds.length > 0) {
                        citiesQuery = citiesQuery.in("id", cityIds);
                    } else {
                        setCityOptions([]);
                        setCityOptionsLoading(false);
                        return;
                    }
                }

                const { data: cities, error: citiesError } = await citiesQuery;
                if (citiesError) {
                    console.error('Error loading cities:', citiesError);
                }
                setCityOptions(
                    cities?.map((c: any) => ({
                        id: c.id,
                        label: `${c.name}, ${c.state_code}`,
                    })) || []
                );
                setCityOptionsLoading(false);

                // Load cuisines
                const { data: cuisines, error: cuisinesError } = await supabase
                    .from("cuisines")
                    .select("id, name")
                    .order("name");

                if (cuisinesError) {
                    console.error('Error loading cuisines:', cuisinesError);
                }
                setCuisineOptions(
                    cuisines?.map((c: any) => ({
                        id: c.id,
                        label: c.name,
                    })) || []
                );

                // Load BDRs if super admin
                if (isSuperAdmin) {
                    const { data: bdrRoles, error: bdrRolesError } = await supabase
                        .from("user_roles")
                        .select("user_id")
                        .eq("role", "BDR");

                    if (bdrRolesError) {
                        console.error('Error loading BDR roles:', bdrRolesError);
                    }

                    const bdrUserIds = bdrRoles?.map((r: any) => r.user_id) || [];

                    if (bdrUserIds.length > 0) {
                        const { data: profiles, error: profilesError } = await supabase
                            .from("profiles")
                            .select("user_id, display_name")
                            .in("user_id", bdrUserIds)
                            .order("display_name");

                        if (profilesError) {
                            console.error('Error loading BDR profiles:', profilesError);
                        }

                        setBdrOptions(
                            profiles?.map((p: any) => ({
                                id: p.user_id,
                                label: p.display_name || "Unknown",
                            })) || []
                        );
                    }
                }
            } catch (error) {
                console.error("Error loading options:", error);
            }
        };

        loadOptions();
    }, [open, supabase, isSuperAdmin]);

    return {
        cityOptions,
        cuisineOptions,
        bdrOptions,
        cityOptionsLoading,
    };
}
