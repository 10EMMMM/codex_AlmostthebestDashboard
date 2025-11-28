import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

interface Step5OperatingProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
}

export function Step5Operating({
    formValues,
    onChange,
}: Step5OperatingProps) {
    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <Clock className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Operating Details</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Set pickup times and operating hours
                </p>
            </div>

            {/* Form Fields */}
            <div className="flex justify-center">
                <div className="space-y-2 w-48">
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
                        style={{ textAlign: 'center' }}
                    />
                </div>
            </div>
        </div>
    );
}
