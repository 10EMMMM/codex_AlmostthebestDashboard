"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "./types";
import { RESTAURANT_STATUS_CONFIG, RESTAURANT_STATUSES } from "./constants";

interface RestaurantEditFormProps {
    restaurant: Restaurant;
    onSave: () => Promise<void>;
    onCancel: () => void;
    supabase: any;
}

const OPTIONAL_VALUE = "__optional__";


export function RestaurantEditForm({
    restaurant,
    onSave,
    onCancel,
    supabase,
}: RestaurantEditFormProps) {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [cityOptions, setCityOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [cuisineOptions, setCuisineOptions] = useState<Array<{ id: string; label: string }>>([]);

    const [formValues, setFormValues] = useState({
        name: restaurant.name,
        status: restaurant.status,
        cityId: restaurant.city_id || "",
        cuisineId: restaurant.primary_cuisine_id || "",
        description: restaurant.description || "",
        onboardingStage: restaurant.onboarding_stage || "",
        bdrTargetPerWeek: restaurant.bdr_target_per_week?.toString() || "4",
        priceRange: restaurant.price_range?.toString() || "",
        yelpUrl: restaurant.yelp_url || "",
        primaryPhotoUrl: restaurant.primary_photo_url || "",
        discountPercentage: restaurant.discount_percentage?.toString() || "",
        offersBoxMeals: restaurant.offers_box_meals || false,
        offersTrays: restaurant.offers_trays || false,
        earliestPickupTime: restaurant.earliest_pickup_time || "",
    });

    const handleChange = (field: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    // Load options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                // Load cities
                const { data: cities } = await supabase
                    .from("cities")
                    .select("id, name, state_code")
                    .order("name");

                setCityOptions(
                    cities?.map((c: any) => ({
                        id: c.id,
                        label: `${c.name}, ${c.state_code}`,
                    })) || []
                );

                // Load cuisines
                const { data: cuisines } = await supabase
                    .from("cuisines")
                    .select("id, name")
                    .order("name");

                setCuisineOptions(
                    cuisines?.map((c: any) => ({
                        id: c.id,
                        label: c.name,
                    })) || []
                );
            } catch (error) {
                console.error("Error loading options:", error);
            }
        };

        loadOptions();
    }, [supabase]);

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
                description: "Please select a city.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from("restaurants")
                .update({
                    name: formValues.name.trim(),
                    status: formValues.status,
                    city_id: formValues.cityId,
                    primary_cuisine_id: formValues.cuisineId || null,
                    description: formValues.description || null,
                    onboarding_stage: formValues.onboardingStage || null,
                    bdr_target_per_week: parseInt(formValues.bdrTargetPerWeek) || 4,
                    price_range: formValues.priceRange ? parseInt(formValues.priceRange) : null,
                    yelp_url: formValues.yelpUrl || null,
                    primary_photo_url: formValues.primaryPhotoUrl || null,
                    discount_percentage: formValues.discountPercentage ? parseFloat(formValues.discountPercentage) : null,
                    offers_box_meals: formValues.offersBoxMeals,
                    offers_trays: formValues.offersTrays,
                    earliest_pickup_time: formValues.earliestPickupTime || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", restaurant.id);

            if (error) throw error;

            toast({
                title: "Restaurant updated",
                description: "Changes saved successfully.",
            });

            await onSave();
        } catch (error) {
            console.error("Error updating restaurant:", error);
            toast({
                title: "Unable to update restaurant",
                description:
                    error instanceof Error ? error.message : "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                        id="restaurant-name"
                        value={formValues.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g. The Golden Spoon"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formValues.status}
                        onValueChange={(value) => handleChange("status", value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {RESTAURANT_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {RESTAURANT_STATUS_CONFIG[status].label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>City</Label>
                    <Select
                        value={formValues.cityId}
                        onValueChange={(value) => handleChange("cityId", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                            {cityOptions.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                    {city.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

                <div className="space-y-2">
                    <Label htmlFor="onboarding-stage">Onboarding Stage</Label>
                    <Input
                        id="onboarding-stage"
                        value={formValues.onboardingStage}
                        onChange={(e) => handleChange("onboardingStage", e.target.value)}
                        placeholder="e.g. Menu Review"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bdr-target">BDR Target per Week</Label>
                    <Input
                        id="bdr-target"
                        type="number"
                        min="1"
                        value={formValues.bdrTargetPerWeek}
                        onChange={(e) => handleChange("bdrTargetPerWeek", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price-range">Price Range</Label>
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
                    <Label htmlFor="yelp-url">Yelp URL</Label>
                    <Input
                        id="yelp-url"
                        type="url"
                        value={formValues.yelpUrl}
                        onChange={(e) => handleChange("yelpUrl", e.target.value)}
                        placeholder="https://www.yelp.com/biz/..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="primary-photo">Primary Photo URL</Label>
                    <Input
                        id="primary-photo"
                        type="url"
                        value={formValues.primaryPhotoUrl}
                        onChange={(e) => handleChange("primaryPhotoUrl", e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formValues.discountPercentage}
                        onChange={(e) => handleChange("discountPercentage", e.target.value)}
                        placeholder="e.g., 10.5"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="earliest-pickup">Earliest Pickup Time</Label>
                    <Input
                        id="earliest-pickup"
                        type="time"
                        value={formValues.earliestPickupTime}
                        onChange={(e) => handleChange("earliestPickupTime", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formValues.offersBoxMeals}
                            onChange={(e) => setFormValues(prev => ({ ...prev, offersBoxMeals: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Offers Box Meals
                    </Label>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formValues.offersTrays}
                            onChange={(e) => setFormValues(prev => ({ ...prev, offersTrays: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Offers Trays/Catering
                    </Label>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formValues.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Additional notes about this restaurant..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
