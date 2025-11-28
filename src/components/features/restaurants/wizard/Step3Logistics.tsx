import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, User, Clock } from "lucide-react";
import type { FormValues } from "../hooks/useCreateRestaurantForm";

interface Step3LogisticsProps {
    formValues: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
}

export function Step3Logistics({
    formValues,
    onChange,
}: Step3LogisticsProps) {
    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-orange-600">Logistics</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Essential pickup and contact details
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 max-w-md mx-auto">
                {/* Pickup Time */}
                <div className="space-y-2">
                    <Label htmlFor="pickup-time" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Earliest Pickup Time
                    </Label>
                    <Input
                        id="pickup-time"
                        type="time"
                        value={formValues.earliestPickupTime}
                        onChange={(event) =>
                            onChange("earliestPickupTime", event.target.value)
                        }
                        className="w-30"
                    />
                </div>

                {/* Street Address */}
                <div className="space-y-2">
                    <Label htmlFor="pickup-street" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Street Address
                    </Label>
                    <Input
                        id="pickup-street"
                        value={formValues.pickupStreet}
                        onChange={(event) =>
                            onChange("pickupStreet", event.target.value)
                        }
                        placeholder="123 Main St"
                    />
                    <p className="text-xs text-muted-foreground">
                        Additional address details can be added later
                    </p>
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                    <Label htmlFor="contact-name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Point of Contact - Full Name
                    </Label>
                    <Input
                        id="contact-name"
                        value={formValues.contactName}
                        onChange={(event) =>
                            onChange("contactName", event.target.value)
                        }
                        placeholder="John Doe"
                    />
                    <p className="text-xs text-muted-foreground">
                        Phone and email can be added later
                    </p>
                </div>
            </div>
        </div>
    );
}
