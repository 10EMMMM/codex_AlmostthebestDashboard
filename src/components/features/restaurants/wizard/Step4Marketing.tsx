import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link2 } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

interface Step4MarketingProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
}

export function Step4Marketing({
    formValues,
    onChange,
}: Step4MarketingProps) {
    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <Link2 className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Marketing & Links</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Add online presence and promotional details
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
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

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formValues.description}
                        onChange={(event) => onChange("description", event.target.value)}
                        placeholder="Additional notes about this restaurant..."
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
}
