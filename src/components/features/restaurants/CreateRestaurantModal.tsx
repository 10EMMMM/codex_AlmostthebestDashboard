import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface CreateRestaurantModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
    supabase: any;
}

interface FormValues {
    name: string;
    cityId: string;
    cuisineId: string;
    description: string;
    bdrUserId: string;
    priceRange: string;
    yelpUrl: string;
    primaryPhotoUrl: string;
    discountPercentage: string;
    offersBoxMeals: boolean;
    offersTrays: boolean;
    earliestPickupTime: string;
}

const OPTIONAL_VALUE = "__optional__";

export function CreateRestaurantModal({
    open,
    onOpenChange,
    onCreated,
    supabase,
}: CreateRestaurantModalProps) {
    const { toast } = useToast();
    const { isSuperAdmin } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [cityOptions, setCityOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [cuisineOptions, setCuisineOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [bdrOptions, setBdrOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [cityOptionsLoading, setCityOptionsLoading] = useState(true);

    const [formValues, setFormValues] = useState<FormValues>({
        name: "",
        cityId: "",
        cuisineId: "",
        description: "",
        bdrUserId: "",
        priceRange: "",
        yelpUrl: "",
        primaryPhotoUrl: "",
        discountPercentage: "",
        offersBoxMeals: false,
        offersTrays: false,
        earliestPickupTime: "",
    });

    const handleChange = (field: keyof FormValues, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormValues({
            name: "",
            cityId: "",
            cuisineId: "",
            description: "",
            bdrUserId: "",
            priceRange: "",
            yelpUrl: "",
            primaryPhotoUrl: "",
            discountPercentage: "",
            offersBoxMeals: false,
            offersTrays: false,
            earliestPickupTime: "",
        });
    };

    // Load options when modal opens
    useEffect(() => {
        console.log('🔍 DEBUG - useEffect triggered. open:', open, 'isSuperAdmin:', isSuperAdmin);

        if (!open) {
            console.log('🔍 DEBUG - Modal not open, skipping load');
            return;
        }

        const loadOptions = async () => {
            console.log('🔍 DEBUG - loadOptions() started');
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error('🔍 DEBUG - Error getting user:', userError);
                    return;
                }
                if (!user) {
                    console.log('🔍 DEBUG - No user found');
                    return;
                }

                console.log('🔍 DEBUG - User email:', user.email);
                console.log('🔍 DEBUG - Using isSuperAdmin from useAuth:', isSuperAdmin);

                // Load cities
                console.log('🔍 DEBUG - Loading cities...');
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
                        console.log('🔍 DEBUG - No city coverage for non-super-admin');
                        return;
                    }
                }

                const { data: cities, error: citiesError } = await citiesQuery;
                if (citiesError) {
                    console.error('🔍 DEBUG - Error loading cities:', citiesError);
                }
                console.log('🔍 DEBUG - Cities loaded:', cities?.length || 0);
                setCityOptions(
                    cities?.map((c: any) => ({
                        id: c.id,
                        label: `${c.name}, ${c.state_code}`,
                    })) || []
                );
                setCityOptionsLoading(false);

                // Load cuisines
                console.log('🔍 DEBUG - Loading cuisines...');
                const { data: cuisines, error: cuisinesError } = await supabase
                    .from("cuisines")
                    .select("id, name")
                    .order("name");

                if (cuisinesError) {
                    console.error('🔍 DEBUG - Error loading cuisines:', cuisinesError);
                }
                console.log('🔍 DEBUG - Cuisines loaded:', cuisines?.length || 0);
                setCuisineOptions(
                    cuisines?.map((c: any) => ({
                        id: c.id,
                        label: c.name,
                    })) || []
                );

                console.log('🔍 DEBUG - About to check isSuperAdmin:', isSuperAdmin);

                // Load BDRs if super admin
                if (isSuperAdmin) {
                    console.log('🔍 DEBUG - Loading BDRs for super admin');
                    const { data: bdrRoles, error: bdrRolesError } = await supabase
                        .from("user_roles")
                        .select("user_id")
                        .eq("role", "BDR");

                    if (bdrRolesError) {
                        console.error('🔍 DEBUG - Error loading BDR roles:', bdrRolesError);
                    }
                    console.log('🔍 DEBUG - BDR roles found:', bdrRoles);

                    const bdrUserIds = bdrRoles?.map((r: any) => r.user_id) || [];
                    console.log('🔍 DEBUG - BDR user IDs:', bdrUserIds);

                    if (bdrUserIds.length > 0) {
                        const { data: profiles, error: profilesError } = await supabase
                            .from("profiles")
                            .select("user_id, display_name")
                            .in("user_id", bdrUserIds)
                            .order("display_name");

                        if (profilesError) {
                            console.error('🔍 DEBUG - Error loading BDR profiles:', profilesError);
                        }
                        console.log('🔍 DEBUG - BDR profiles found:', profiles);

                        setBdrOptions(
                            profiles?.map((p: any) => ({
                                id: p.user_id,
                                label: p.display_name || "Unknown",
                            })) || []
                        );
                    } else {
                        console.log('🔍 DEBUG - No BDR user IDs found, setting empty array');
                        setBdrOptions([]);
                    }
                } else {
                    console.log('🔍 DEBUG - Not super admin, skipping BDR load');
                }

                console.log('🔍 DEBUG - loadOptions() completed successfully');
            } catch (error) {
                console.error("🔍 DEBUG - Error in loadOptions:", error);
            }
        };

        loadOptions();
    }, [open, supabase, isSuperAdmin]);

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
                    price_range: formValues.priceRange ? parseInt(formValues.priceRange) : null,
                    yelp_url: formValues.yelpUrl || null,
                    primary_photo_url: formValues.primaryPhotoUrl || null,
                    discount_percentage: formValues.discountPercentage ? parseFloat(formValues.discountPercentage) : null,
                    offers_box_meals: formValues.offersBoxMeals,
                    offers_trays: formValues.offersTrays,
                    earliest_pickup_time: formValues.earliestPickupTime || null,
                })
                .select("id")
                .single();

            if (error) throw error;
            const restaurantId = data?.id;

            if (restaurantId && isSuperAdmin && formValues.bdrUserId) {
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
            onOpenChange(false);
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>New Restaurant Onboarding</SheetTitle>
                    <SheetDescription>
                        Fill in the details to add a new restaurant
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-name">Restaurant Name</Label>
                            <Input
                                id="restaurant-name"
                                value={formValues.name}
                                onChange={(event) => handleChange("name", event.target.value)}
                                placeholder="e.g. The Golden Spoon"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Select
                                value={formValues.cityId}
                                onValueChange={(value) => handleChange("cityId", value)}
                                disabled={cityOptionsLoading || !cityOptions.length}
                            >
                                <SelectTrigger>
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
                                <SelectTrigger>
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
                        {isSuperAdmin && (
                            <div className="space-y-2">
                                <Label>Assign BDR (Optional)</Label>
                                <Select
                                    value={formValues.bdrUserId || OPTIONAL_VALUE}
                                    onValueChange={(value) =>
                                        handleChange("bdrUserId", value === OPTIONAL_VALUE ? "" : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select BDR" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={OPTIONAL_VALUE}>Not assigned</SelectItem>
                                        {bdrOptions.map((bdr) => (
                                            <SelectItem key={bdr.id} value={bdr.id}>
                                                {bdr.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formValues.description}
                            onChange={(event) => handleChange("description", event.target.value)}
                            placeholder="Additional notes about this restaurant..."
                            rows={3}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Restaurant Details (Optional)</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Price Range</Label>
                                <Select
                                    value={formValues.priceRange || OPTIONAL_VALUE}
                                    onValueChange={(value) =>
                                        handleChange("priceRange", value === OPTIONAL_VALUE ? "" : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select price range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={OPTIONAL_VALUE}>Not set</SelectItem>
                                        <SelectItem value="1">$ (Inexpensive)</SelectItem>
                                        <SelectItem value="2">$$ (Moderate)</SelectItem>
                                        <SelectItem value="3">$$$ (Pricey)</SelectItem>
                                        <SelectItem value="4">$$$$ (Ultra High-End)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount %</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formValues.discountPercentage}
                                    onChange={(event) =>
                                        handleChange("discountPercentage", event.target.value)
                                    }
                                    placeholder="e.g. 15"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="yelp-url">Yelp URL</Label>
                                <Input
                                    id="yelp-url"
                                    value={formValues.yelpUrl}
                                    onChange={(event) => handleChange("yelpUrl", event.target.value)}
                                    placeholder="https://www.yelp.com/biz/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="photo-url">Primary Photo URL</Label>
                                <Input
                                    id="photo-url"
                                    value={formValues.primaryPhotoUrl}
                                    onChange={(event) =>
                                        handleChange("primaryPhotoUrl", event.target.value)
                                    }
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pickup-time">Earliest Pickup Time</Label>
                                <Input
                                    id="pickup-time"
                                    type="time"
                                    value={formValues.earliestPickupTime}
                                    onChange={(event) =>
                                        handleChange("earliestPickupTime", event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="offers-box-meals"
                                    checked={formValues.offersBoxMeals}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            offersBoxMeals: event.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="offers-box-meals" className="font-normal">
                                    Offers Box Meals
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="offers-trays"
                                    checked={formValues.offersTrays}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            offersTrays: event.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="offers-trays" className="font-normal">
                                    Offers Trays
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Restaurant"
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
