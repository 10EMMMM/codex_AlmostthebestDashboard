import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

const OPTIONAL_VALUE = "__optional__";

interface RestaurantDetailsFieldsProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
    onCheckboxChange: (field: 'offersBoxMeals' | 'offersTrays', checked: boolean) => void;
}

export function RestaurantDetailsFields({
    formValues,
    onChange,
    onCheckboxChange,
}: RestaurantDetailsFieldsProps) {
    return (
        <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Restaurant Details (Optional)</h4>
            <div className="grid gap-4 md:grid-cols-2">
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
                    <Label htmlFor="yelp-url">Yelp URL</Label>
                    <Input
                        id="yelp-url"
                        value={formValues.yelpUrl}
                        onChange={(event) => onChange("yelpUrl", event.target.value)}
                        placeholder="https://www.yelp.com/biz/..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="photo-url">Primary Photo URL</Label>
                    <Input
                        id="photo-url"
                        value={formValues.primaryPhotoUrl}
                        onChange={(event) =>
                            onChange("primaryPhotoUrl", event.target.value)
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
                            onChange("earliestPickupTime", event.target.value)
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
                            onCheckboxChange('offersBoxMeals', event.target.checked)
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
                            onCheckboxChange('offersTrays', event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="offers-trays" className="font-normal">
                        Offers Trays
                    </Label>
                </div>
            </div>
        </div>
    );
}
