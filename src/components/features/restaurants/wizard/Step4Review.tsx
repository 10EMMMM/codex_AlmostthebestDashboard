import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

interface Step4ReviewProps {
    formValues: FormValues;
    cityOptions: Array<{ id: string; label: string }>;
    cuisineOptions: Array<{ id: string; label: string }>;
    bdrOptions: Array<{ id: string; label: string }>;
    onEdit: (step: number) => void;
}

export function Step4Review({
    formValues,
    cityOptions,
    cuisineOptions,
    bdrOptions,
    onEdit,
}: Step4ReviewProps) {
    const cityName = cityOptions.find(c => c.id === formValues.cityId)?.label || "Not set";
    const bdrName = bdrOptions.find(b => b.id === formValues.bdrUserId)?.label || "Not assigned";

    // Get primary cuisine (first in array)
    const primaryCuisineName = formValues.cuisineIds && formValues.cuisineIds.length > 0
        ? cuisineOptions.find(c => c.id === formValues.cuisineIds[0])?.label || "Not set"
        : "Not set";

    // Get secondary cuisines (rest of array)
    const secondaryCuisineNames = formValues.cuisineIds && formValues.cuisineIds.length > 1
        ? formValues.cuisineIds
            .slice(1)
            .map(id => cuisineOptions.find(c => c.id === id)?.label)
            .filter(Boolean)
            .join(", ")
        : "None";

    // Format pickup address
    const formatAddress = () => {
        const parts = [];
        if (formValues.pickupStreet) parts.push(formValues.pickupStreet);
        if (formValues.pickupSuite) parts.push(formValues.pickupSuite);

        const cityStateZip = [];
        if (formValues.pickupCity) cityStateZip.push(formValues.pickupCity);
        if (formValues.pickupState) cityStateZip.push(formValues.pickupState);
        if (formValues.pickupPostalCode) cityStateZip.push(formValues.pickupPostalCode);

        if (cityStateZip.length > 0) {
            parts.push(cityStateZip.join(", "));
        }

        return parts.length > 0 ? parts.join(", ") : "Not provided";
    };

    // Format contact info
    const formatContact = () => {
        if (!formValues.contactName) return "Not provided";

        const parts = [formValues.contactName];
        if (formValues.contactPhone) parts.push(formValues.contactPhone);
        if (formValues.contactEmail) parts.push(formValues.contactEmail);

        return parts.join(" • ");
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
                    <ReviewItem label="Restaurant Name" value={formValues.name || "Not set"} />
                    <ReviewItem label="City" value={cityName} />
                    <ReviewItem
                        label="Primary Cuisine"
                        value={primaryCuisineName}
                        highlight
                    />
                    <ReviewItem label="Secondary Cuisines" value={secondaryCuisineNames} />
                    {bdrName !== "Not assigned" && (
                        <ReviewItem label="Onboarded By" value={bdrName} />
                    )}
                </ReviewSection>

                {/* Service Details */}
                <ReviewSection title="Service Details" onEdit={() => onEdit(2)}>
                    <ReviewItem label="Description" value={formValues.description || "Not provided"} />
                    <ReviewItem label="Box Meals" value={formValues.offersBoxMeals ? "Yes" : "No"} />
                    <ReviewItem label="Trays" value={formValues.offersTrays ? "Yes" : "No"} />
                    <ReviewItem label="Discount" value={formValues.discountPercentage || "Not provided"} />
                </ReviewSection>

                {/* Logistics */}
                <ReviewSection title="Logistics" onEdit={() => onEdit(3)}>
                    <ReviewItem
                        label="Earliest Pickup Time"
                        value={formValues.earliestPickupTime || "Not set"}
                    />
                    <ReviewItem
                        label="Pickup Address"
                        value={formatAddress()}
                        multiline
                    />
                    <ReviewItem
                        label="Point of Contact"
                        value={formatContact()}
                        multiline
                    />
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
    highlight = false,
    multiline = false,
}: {
    label: string;
    value: string;
    truncate?: boolean;
    highlight?: boolean;
    multiline?: boolean;
}) {
    return (
        <div className="grid grid-cols-[140px_1fr] gap-4 text-sm">
            <span className="text-muted-foreground text-right">{label}:</span>
            <span className={`font-medium ${truncate ? "truncate" : ""} ${highlight ? "text-orange-600 font-semibold" : ""}`}>
                {value}
            </span>
        </div>
    );
}
