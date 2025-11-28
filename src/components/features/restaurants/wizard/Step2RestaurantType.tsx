import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UtensilsCrossed } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";
import type { OptionItem } from "../hooks/useRestaurantOptions";

const OPTIONAL_VALUE = "__optional__";

interface Step2RestaurantTypeProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: any) => void;
    onCheckboxChange: (field: 'offersBoxMeals' | 'offersTrays', checked: boolean) => void;
    cuisineOptions: OptionItem[];
}

export function Step2RestaurantType({
    formValues,
    onChange,
    onCheckboxChange,
    cuisineOptions,
}: Step2RestaurantTypeProps) {
    const handleCuisineToggle = (cuisineId: string) => {
        const current = formValues.cuisineIds || [];
        const updated = current.includes(cuisineId)
            ? current.filter(id => id !== cuisineId)
            : [...current, cuisineId];
        onChange('cuisineIds', updated);
    };

    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <UtensilsCrossed className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Restaurant Type</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Tell us about the cuisine and service options
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
                {/* Multiple Cuisine Selection */}
                <div className="space-y-2">
                    <Label>Cuisines (Select multiple)</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                        {cuisineOptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                                No cuisines available
                            </p>
                        ) : (
                            cuisineOptions.map((cuisine) => (
                                <div key={cuisine.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`cuisine-${cuisine.id}`}
                                        checked={formValues.cuisineIds?.includes(cuisine.id) || false}
                                        onChange={() => handleCuisineToggle(cuisine.id)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label
                                        htmlFor={`cuisine-${cuisine.id}`}
                                        className="font-normal cursor-pointer flex-1"
                                    >
                                        {cuisine.label}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                    {formValues.cuisineIds && formValues.cuisineIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {formValues.cuisineIds.length} cuisine{formValues.cuisineIds.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Select
                        value={formValues.priceRange || OPTIONAL_VALUE}
                        onValueChange={(value) =>
                            onChange("priceRange", value === OPTIONAL_VALUE ? "" : value)
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

                {/* Box Meals & Trays */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label>Box Meals</Label>
                        <Select
                            value={formValues.offersBoxMeals ? "yes" : "no"}
                            onValueChange={(value) =>
                                onCheckboxChange('offersBoxMeals', value === "yes")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Trays</Label>
                        <Select
                            value={formValues.offersTrays ? "yes" : "no"}
                            onValueChange={(value) =>
                                onCheckboxChange('offersTrays', value === "yes")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
