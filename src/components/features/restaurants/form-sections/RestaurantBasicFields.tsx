import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { FormValues } from "../hooks/useCreateRestaurantForm";
import type { OptionItem } from "../hooks/useRestaurantOptions";

const OPTIONAL_VALUE = "__optional__";

interface RestaurantBasicFieldsProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
    onCheckboxChange: (field: 'offersBoxMeals' | 'offersTrays', checked: boolean) => void;
    cityOptions: OptionItem[];
    cuisineOptions: OptionItem[];
    bdrOptions: OptionItem[];
    cityOptionsLoading: boolean;
    isSuperAdmin: boolean;
}

export function RestaurantBasicFields({
    formValues,
    onChange,
    onCheckboxChange,
    cityOptions,
    cuisineOptions,
    bdrOptions,
    cityOptionsLoading,
    isSuperAdmin,
}: RestaurantBasicFieldsProps) {
    return (
        <div className="space-y-4">
            {/* BDR Assignment - Always on top for super admin */}
            {isSuperAdmin && (
                <div className="space-y-2">
                    <Label>Assign BDR (Optional)</Label>
                    <SearchableSelect
                        value={formValues.bdrUserId}
                        onValueChange={(value) => onChange("bdrUserId", value)}
                        options={bdrOptions}
                        placeholder="Select BDR"
                        searchPlaceholder="Search BDRs..."
                        emptyMessage="No BDRs found."
                        disabled={!bdrOptions.length}
                    />
                </div>
            )}

            {/* Restaurant Name */}
            <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                    id="restaurant-name"
                    value={formValues.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    placeholder="e.g. The Golden Spoon"
                />
            </div>

            {/* Cuisine */}
            <div className="space-y-2">
                <Label>Cuisine</Label>
                <Select
                    value={formValues.cuisineId || OPTIONAL_VALUE}
                    onValueChange={(value) =>
                        onChange("cuisineId", value === OPTIONAL_VALUE ? "" : value)
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

            {/* City */}
            <div className="space-y-2">
                <Label>City</Label>
                <SearchableSelect
                    value={formValues.cityId}
                    onValueChange={(value) => onChange("cityId", value)}
                    options={cityOptions}
                    placeholder="Select city"
                    searchPlaceholder="Search cities..."
                    emptyMessage="No cities found."
                    disabled={cityOptionsLoading || !cityOptions.length}
                    loading={cityOptionsLoading}
                />
                {!cityOptionsLoading && !cityOptions.length && (
                    <p className="text-xs text-muted-foreground">
                        No city coverage. Ask a super admin to assign cities.
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formValues.description}
                    onChange={(event) => onChange("description", event.target.value)}
                    placeholder="Additional notes about this restaurant..."
                    rows={3}
                />
            </div>

            {/* Discount % / Box Meals / Trays - Single Row */}
            <div className="grid grid-cols-3 gap-3">
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
                            onChange("discountPercentage", event.target.value)
                        }
                        placeholder="e.g. 15"
                    />
                </div>
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

            {/* Earliest Pickup Time - Centered */}
            <div className="flex justify-center">
                <div className="space-y-2 w-64">
                    <Label htmlFor="pickup-time" className="text-center block">
                        Earliest Pickup Time
                    </Label>
                    <Input
                        id="pickup-time"
                        type="time"
                        value={formValues.earliestPickupTime}
                        onChange={(event) =>
                            onChange("earliestPickupTime", event.target.value)
                        }
                        className="text-center"
                    />
                </div>
            </div>
        </div>
    );
}
