import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Utensils } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

interface Step2ServiceDetailsProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: any) => void;
    onCheckboxChange: (field: 'offersBoxMeals' | 'offersTrays', checked: boolean) => void;
}

export function Step2ServiceDetails({
    formValues,
    onChange,
    onCheckboxChange,
}: Step2ServiceDetailsProps) {
    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <Utensils className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Service Details</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Tell us about the services and offerings
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Brief Summary</Label>
                    <Textarea
                        id="description"
                        value={formValues.description}
                        onChange={(event) => onChange("description", event.target.value)}
                        placeholder="Brief description of the restaurant..."
                        rows={4}
                        maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {formValues.description.length}/1000 characters
                    </p>
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

                {/* Discount */}
                <div className="space-y-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                        id="discount"
                        value={formValues.discountPercentage}
                        onChange={(event) =>
                            onChange("discountPercentage", event.target.value)
                        }
                        placeholder="e.g., 15% off first order, 20% for orders over $100"
                        maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                        Enter any discount details or promotional offers
                    </p>
                </div>
            </div>
        </div>
    );
}
