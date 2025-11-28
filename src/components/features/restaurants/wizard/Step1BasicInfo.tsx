import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Building2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { FormValues } from "../hooks/useCreateRestaurantForm";
import type { OptionItem } from "../hooks/useRestaurantOptions";

interface Step1BasicInfoProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: any) => void;
    cityOptions: OptionItem[];
    cuisineOptions: OptionItem[];
    bdrOptions: OptionItem[];
    cityOptionsLoading: boolean;
    isSuperAdmin: boolean;
}

// Fixed colors for cuisines - deterministic based on cuisine name
const getCuisineColor = (cuisineName: string): string => {
    const colors = [
        'bg-red-500 hover:bg-red-600',
        'bg-orange-500 hover:bg-orange-600',
        'bg-amber-500 hover:bg-amber-600',
        'bg-yellow-500 hover:bg-yellow-600',
        'bg-lime-500 hover:bg-lime-600',
        'bg-green-500 hover:bg-green-600',
        'bg-emerald-500 hover:bg-emerald-600',
        'bg-teal-500 hover:bg-teal-600',
        'bg-cyan-500 hover:bg-cyan-600',
        'bg-sky-500 hover:bg-sky-600',
        'bg-blue-500 hover:bg-blue-600',
        'bg-indigo-500 hover:bg-indigo-600',
        'bg-violet-500 hover:bg-violet-600',
        'bg-purple-500 hover:bg-purple-600',
        'bg-fuchsia-500 hover:bg-fuchsia-600',
        'bg-pink-500 hover:bg-pink-600',
        'bg-rose-500 hover:bg-rose-600',
    ];

    // Generate consistent hash from cuisine name
    let hash = 0;
    for (let i = 0; i < cuisineName.length; i++) {
        hash = cuisineName.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

export function Step1BasicInfo({
    formValues,
    onChange,
    cityOptions,
    cuisineOptions,
    bdrOptions,
    cityOptionsLoading,
    isSuperAdmin,
}: Step1BasicInfoProps) {
    // Get primary cuisine (first in array)
    const primaryCuisineId = formValues.cuisineIds && formValues.cuisineIds.length > 0
        ? formValues.cuisineIds[0]
        : "";

    // Get secondary cuisines (rest of array)
    const secondaryCuisineIds = formValues.cuisineIds && formValues.cuisineIds.length > 1
        ? formValues.cuisineIds.slice(1)
        : [];

    // Search state for primary and secondary cuisines
    const [primarySearchQuery, setPrimarySearchQuery] = useState("");
    const [secondarySearchQuery, setSecondarySearchQuery] = useState("");

    // Search state for BDR and City
    const [bdrSearchQuery, setBdrSearchQuery] = useState("");
    const [citySearchQuery, setCitySearchQuery] = useState("");
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState<string>("");

    // Fetch profile display name
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                const { getSupabaseClient } = await import("@/lib/supabaseClient");
                const supabase = getSupabaseClient();
                const { data } = await supabase
                    .from("profiles")
                    .select("display_name")
                    .eq("user_id", user.id)
                    .single();
                if (data) {
                    setDisplayName(data.display_name);
                }
            }
        };
        fetchProfile();
    }, [user?.id]);

    // Filter primary cuisines based on search
    const filteredPrimaryCuisines = useMemo(() => {
        if (!primarySearchQuery.trim()) return cuisineOptions;

        const query = primarySearchQuery.toLowerCase();
        return cuisineOptions.filter(c => c.label.toLowerCase().includes(query));
    }, [cuisineOptions, primarySearchQuery]);

    // Filter secondary cuisines based on search
    const filteredSecondaryCuisines = useMemo(() => {
        const available = cuisineOptions.filter(c => c.id !== primaryCuisineId);
        if (!secondarySearchQuery.trim()) return available;

        const query = secondarySearchQuery.toLowerCase();
        return available.filter(c => c.label.toLowerCase().includes(query));
    }, [cuisineOptions, primaryCuisineId, secondarySearchQuery]);

    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Basic Information</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Let's start with the essential details about your restaurant
                </p>

                {/* Debug Info */}
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono text-muted-foreground mt-2">
                    <p>Debug: Logged in as <span className="font-bold text-foreground">{displayName || user?.user_metadata?.full_name || user?.email || "Unknown"}</span></p>
                    <p>Role: <span className="font-bold text-foreground">{isSuperAdmin ? "Super Admin" : "BDR"}</span> (ID: {user?.id?.slice(0, 8)}...)</p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
                {/* BDR Assignment - Super Admin Only */}
                {isSuperAdmin && (
                    <div className="space-y-2">
                        <Label>Onboarded By BDR (Optional)</Label>
                        <p className="text-xs text-muted-foreground">
                            Select which BDR is onboarding this restaurant. If not selected, you will be marked as the onboarder.
                        </p>

                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Search BDR..."
                                value={bdrSearchQuery}
                                onChange={(e) => setBdrSearchQuery(e.target.value)}
                                className="w-full"
                            />

                            {/* Selected BDR Badge */}
                            {formValues.bdrUserId && (() => {
                                const bdr = bdrOptions.find(b => b.id === formValues.bdrUserId);
                                if (!bdr) return null;
                                return (
                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-destructive/20 transition-colors"
                                            onClick={() => onChange("bdrUserId", "")}
                                        >
                                            {bdr.label}
                                            <X className="ml-1 h-3 w-3" />
                                        </Badge>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Available BDRs */}
                        {bdrSearchQuery.trim() && (() => {
                            const filtered = bdrOptions.filter(b =>
                                b.label.toLowerCase().includes(bdrSearchQuery.toLowerCase()) &&
                                b.id !== formValues.bdrUserId
                            );

                            if (filtered.length > 0) {
                                return (
                                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                                        <div className="flex flex-wrap gap-2">
                                            {filtered.map((bdr) => (
                                                <Badge
                                                    key={bdr.id}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-primary/10 transition-all"
                                                    onClick={() => {
                                                        onChange("bdrUserId", bdr.id);
                                                        setBdrSearchQuery("");
                                                    }}
                                                >
                                                    {bdr.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}

                {/* Restaurant Name */}
                <div className="space-y-2">
                    <Label htmlFor="restaurant-name">
                        Restaurant Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="restaurant-name"
                        value={formValues.name}
                        onChange={(event) => onChange("name", event.target.value)}
                        placeholder="e.g. The Golden Spoon"
                    />
                </div>

                {/* City */}
                <div className="space-y-2">
                    <Label>
                        City <span className="text-red-500">*</span>
                    </Label>

                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Search city..."
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            disabled={cityOptionsLoading}
                            className="w-full"
                        />

                        {/* Selected City Badge */}
                        {formValues.cityId && (() => {
                            const city = cityOptions.find(c => c.id === formValues.cityId);
                            if (!city) return null;
                            return (
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-destructive/20 transition-colors"
                                        onClick={() => onChange("cityId", "")}
                                    >
                                        {city.label}
                                        <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Available Cities */}
                    {citySearchQuery.trim() && (() => {
                        const filtered = cityOptions.filter(c =>
                            c.label.toLowerCase().includes(citySearchQuery.toLowerCase()) &&
                            c.id !== formValues.cityId
                        );

                        if (cityOptionsLoading) {
                            return (
                                <div className="border rounded-md p-3">
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        Loading cities...
                                    </p>
                                </div>
                            );
                        }

                        if (cityOptions.length === 0) {
                            return (
                                <div className="border rounded-md p-3">
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        No city coverage. Ask a super admin to assign cities.
                                    </p>
                                </div>
                            );
                        }

                        if (filtered.length > 0) {
                            return (
                                <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {filtered.map((city) => (
                                            <Badge
                                                key={city.id}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-primary/10 transition-all"
                                                onClick={() => {
                                                    onChange("cityId", city.id);
                                                    setCitySearchQuery("");
                                                }}
                                            >
                                                {city.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Primary Cuisine */}
                <div className="space-y-2">
                    <Label>
                        Primary Cuisine <span className="text-red-500">*</span>
                    </Label>

                    {/* Search Input with Selected Badge Inline */}
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Search primary cuisine..."
                            value={primarySearchQuery}
                            onChange={(e) => setPrimarySearchQuery(e.target.value)}
                            className="w-full"
                        />

                        {/* Selected Primary Cuisine Badge - Inline Below Search */}
                        {primaryCuisineId && (
                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const cuisine = cuisineOptions.find(c => c.id === primaryCuisineId);
                                    if (!cuisine) return null;
                                    return (
                                        <Badge
                                            key={primaryCuisineId}
                                            className={`${getCuisineColor(cuisine.label)} text-white cursor-pointer transition-colors`}
                                            onClick={() => {
                                                onChange('cuisineIds', secondaryCuisineIds);
                                                setPrimarySearchQuery("");
                                            }}
                                        >
                                            {cuisine.label}
                                            <X className="ml-1 h-3 w-3" />
                                        </Badge>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Available Primary Cuisines - Clickable Badges */}
                    {primarySearchQuery.trim() && (
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                            {cuisineOptions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    No cuisines available
                                </p>
                            ) : filteredPrimaryCuisines.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    No cuisines match "{primarySearchQuery}"
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {filteredPrimaryCuisines.map((cuisine) => {
                                        const isSelected = cuisine.id === primaryCuisineId;
                                        if (isSelected) return null; // Hide selected
                                        return (
                                            <Badge
                                                key={cuisine.id}
                                                className={`${getCuisineColor(cuisine.label)} text-white cursor-pointer transition-all opacity-70 hover:opacity-100`}
                                                onClick={() => {
                                                    onChange('cuisineIds', [cuisine.id, ...secondaryCuisineIds]);
                                                    setPrimarySearchQuery("");
                                                }}
                                            >
                                                {cuisine.label}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Secondary Cuisines */}
                <div className="space-y-2">
                    <Label>Secondary Cuisines (Optional)</Label>

                    {/* Search Input with Selected Badges Inline */}
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Search to add secondary cuisines..."
                            value={secondarySearchQuery}
                            onChange={(e) => setSecondarySearchQuery(e.target.value)}
                            disabled={!primaryCuisineId}
                            className="w-full"
                        />

                        {/* Selected Secondary Cuisines - Inline Below Search */}
                        {secondaryCuisineIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {secondaryCuisineIds.map((cuisineId) => {
                                    const cuisine = cuisineOptions.find(c => c.id === cuisineId);
                                    if (!cuisine) return null;
                                    return (
                                        <Badge
                                            key={cuisineId}
                                            className={`${getCuisineColor(cuisine.label)} text-white cursor-pointer transition-colors`}
                                            onClick={() => {
                                                const updated = secondaryCuisineIds.filter(id => id !== cuisineId);
                                                onChange('cuisineIds', [primaryCuisineId, ...updated]);
                                            }}
                                        >
                                            {cuisine.label}
                                            <X className="ml-1 h-3 w-3" />
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Available Cuisines - Clickable Badges */}
                    {secondarySearchQuery.trim() && (() => {
                        // Filter out already selected cuisines
                        const unselectedCuisines = filteredSecondaryCuisines.filter(
                            cuisine => !secondaryCuisineIds.includes(cuisine.id)
                        );

                        // Only show the box if there are unselected cuisines or error states
                        if (!primaryCuisineId || cuisineOptions.length === 0 || unselectedCuisines.length > 0 || filteredSecondaryCuisines.length === 0) {
                            return (
                                <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                                    {!primaryCuisineId ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">
                                            Select a primary cuisine first
                                        </p>
                                    ) : cuisineOptions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">
                                            No cuisines available
                                        </p>
                                    ) : filteredSecondaryCuisines.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">
                                            No cuisines match "{secondarySearchQuery}"
                                        </p>
                                    ) : unselectedCuisines.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">
                                            All matching cuisines are already selected
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {unselectedCuisines.map((cuisine) => (
                                                <Badge
                                                    key={cuisine.id}
                                                    className={`${getCuisineColor(cuisine.label)} text-white cursor-pointer transition-all opacity-70 hover:opacity-100`}
                                                    onClick={() => {
                                                        const updated = [...secondaryCuisineIds, cuisine.id];
                                                        onChange('cuisineIds', [primaryCuisineId, ...updated]);
                                                    }}
                                                >
                                                    {cuisine.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {secondaryCuisineIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {secondaryCuisineIds.length} secondary cuisine{secondaryCuisineIds.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
