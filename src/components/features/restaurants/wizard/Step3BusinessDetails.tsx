import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

const OPTIONAL_VALUE = "__optional__";

interface Step3BusinessDetailsProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
}

export function Step3BusinessDetails({
    formValues,
    onChange,
}: Step3BusinessDetailsProps) {
    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Business Details</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Set up business tracking and targets
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
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

                {/* Discount Percentage */}
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
            </div>
        </div>
    );
}
