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
}

export function RestaurantDetailsFields({
    formValues,
    onChange,
}: RestaurantDetailsFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {/* Status */}
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formValues.status || OPTIONAL_VALUE}
                        onValueChange={(value) =>
                            onChange("status", value === OPTIONAL_VALUE ? "" : value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={OPTIONAL_VALUE}>Not set</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="on progress">On Progress</SelectItem>
                            <SelectItem value="on hold">On Hold</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Onboarding Stage */}
                <div className="space-y-2">
                    <Label htmlFor="onboarding-stage">Onboarding Stage</Label>
                    <Input
                        id="onboarding-stage"
                        value={formValues.onboardingStage}
                        onChange={(event) => onChange("onboardingStage", event.target.value)}
                        placeholder="e.g. Menu Collection"
                    />
                </div>

                {/* Weekly BDR Target */}
                <div className="space-y-2">
                    <Label htmlFor="bdr-target">Weekly BDR Target</Label>
                    <Input
                        id="bdr-target"
                        type="number"
                        min="0"
                        value={formValues.bdrTargetPerWeek}
                        onChange={(event) => onChange("bdrTargetPerWeek", event.target.value)}
                        placeholder="e.g. 5"
                    />
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

                {/* Yelp URL */}
                <div className="space-y-2">
                    <Label htmlFor="yelp-url">Yelp URL</Label>
                    <Input
                        id="yelp-url"
                        value={formValues.yelpUrl}
                        onChange={(event) => onChange("yelpUrl", event.target.value)}
                        placeholder="https://www.yelp.com/biz/..."
                    />
                </div>

                {/* Primary Photo URL */}
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
            </div>
        </div>
    );
}
