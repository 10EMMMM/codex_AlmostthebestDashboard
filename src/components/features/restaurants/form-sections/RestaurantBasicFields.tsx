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
import type { FormValues } from "../hooks/useCreateRestaurantForm";
import type { OptionItem } from "../hooks/useRestaurantOptions";

const OPTIONAL_VALUE = "__optional__";

interface RestaurantBasicFieldsProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
    cityOptions: OptionItem[];
    cuisineOptions: OptionItem[];
    bdrOptions: OptionItem[];
    cityOptionsLoading: boolean;
    isSuperAdmin: boolean;
}

export function RestaurantBasicFields({
    formValues,
    onChange,
    cityOptions,
    cuisineOptions,
    bdrOptions,
    cityOptionsLoading,
    isSuperAdmin,
}: RestaurantBasicFieldsProps) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                        id="restaurant-name"
                        value={formValues.name}
                        onChange={(event) => onChange("name", event.target.value)}
                        placeholder="e.g. The Golden Spoon"
                    />
                </div>
                <div className="space-y-2">
                    <Label>City</Label>
                    <Select
                        value={formValues.cityId}
                        onValueChange={(value) => onChange("cityId", value)}
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
                {isSuperAdmin && (
                    <div className="space-y-2">
                        <Label>Assign BDR (Optional)</Label>
                        <Select
                            value={formValues.bdrUserId || OPTIONAL_VALUE}
                            onValueChange={(value) =>
                                onChange("bdrUserId", value === OPTIONAL_VALUE ? "" : value)
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
                    onChange={(event) => onChange("description", event.target.value)}
                    placeholder="Additional notes about this restaurant..."
                    rows={3}
                />
            </div>
        </>
    );
}
