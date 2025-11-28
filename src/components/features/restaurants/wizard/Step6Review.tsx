import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

interface Step6ReviewProps {
    formValues: FormValues;
    cityOptions: Array<{ id: string; label: string }>;
    cuisineOptions: Array<{ id: string; label: string }>;
    bdrOptions: Array<{ id: string; label: string }>;
    onEdit: (step: number) => void;
}

export function Step6Review({
    formValues,
    cityOptions,
    cuisineOptions,
    bdrOptions,
    onEdit,
}: Step6ReviewProps) {
    const cityName = cityOptions.find(c => c.id === formValues.cityId)?.label || "Not set";
    const bdrName = bdrOptions.find(b => b.id === formValues.bdrUserId)?.label || "Not assigned";

    // Get cuisine names for selected IDs
    const cuisineNames = formValues.cuisineIds && formValues.cuisineIds.length > 0
        ? formValues.cuisineIds
            .map(id => cuisineOptions.find(c => c.id === id)?.label)
            .filter(Boolean)
            .join(", ")
        : "Not set";

    const priceRangeMap: Record<string, string> = {
        "1": "$",
        "2": "$$",
        "3": "$$$",
        "4": "$$$$",
    };

    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Review & Submit</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Review your information before creating the restaurant
                </p>
            </div>

            {/* Review Sections */}
            <div className="space-y-4 max-w-2xl mx-auto">
                {/* Basic Information */}
                <ReviewSection title="Basic Information" onEdit={() => onEdit(1)}>
                    <ReviewItem label="Restaurant Name" value={formValues.name} />
                    <ReviewItem label="City" value={cityName} />
                    <ReviewItem label="Onboarded By" value={bdrName} />
                </ReviewSection>

                {/* Restaurant Type */}
                <ReviewSection title="Restaurant Type" onEdit={() => onEdit(2)}>
                    <ReviewItem label="Cuisines" value={cuisineNames} />
                    <ReviewItem label="Price Range" value={priceRangeMap[formValues.priceRange] || "Not set"} />
                    <ReviewItem label="Box Meals" value={formValues.offersBoxMeals ? "Yes" : "No"} />
                    <ReviewItem label="Trays" value={formValues.offersTrays ? "Yes" : "No"} />
                </ReviewSection>

                {/* Business Details */}
                <ReviewSection title="Business Details" onEdit={() => onEdit(3)}>
                    <ReviewItem label="Status" value={formValues.status || "Not set"} />
                    <ReviewItem label="Onboarding Stage" value={formValues.onboardingStage || "Not set"} />
                    <ReviewItem label="Weekly BDR Target" value={formValues.bdrTargetPerWeek || "Not set"} />
                    <ReviewItem label="Discount %" value={formValues.discountPercentage ? `${formValues.discountPercentage}%` : "Not set"} />
                </ReviewSection>

                {/* Marketing & Links */}
                <ReviewSection title="Marketing & Links" onEdit={() => onEdit(4)}>
                    <ReviewItem label="Yelp URL" value={formValues.yelpUrl || "Not set"} truncate />
                    <ReviewItem label="Photo URL" value={formValues.primaryPhotoUrl || "Not set"} truncate />
                    <ReviewItem label="Description" value={formValues.description || "Not set"} />
                </ReviewSection>

                {/* Operating Details */}
                <ReviewSection title="Operating Details" onEdit={() => onEdit(5)}>
                    <ReviewItem label="Earliest Pickup Time" value={formValues.earliestPickupTime || "Not set"} />
                </ReviewSection>
            </div>
        </div>
    );
}

function ReviewSection({
    title,
    onEdit,
    children,
}: {
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{title}</h4>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                </Button>
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function ReviewItem({
    label,
    value,
    truncate = false,
}: {
    label: string;
    value: string;
    truncate?: boolean;
}) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}:</span>
            <span className={`font-medium ${truncate ? "truncate max-w-xs" : ""}`}>
                {value}
            </span>
        </div>
    );
}
