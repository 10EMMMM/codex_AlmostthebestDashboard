import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateRestaurantModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
    supabase: any;
}

interface FormValues {
    name: string;
    cityId: string;
    cuisineId: string;
    description: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    bdrUserId: string;
}

const OPTIONAL_VALUE = "__optional__";

export function CreateRestaurantModal({
    open,
    onOpenChange,
    onCreated,
    supabase,
}: CreateRestaurantModalProps) {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [cityOptions, setCityOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [cuisineOptions, setCuisineOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [bdrOptions, setBdrOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [cityOptionsLoading, setCityOptionsLoading] = useState(true);
    const [canAssignBdr, setCanAssignBdr] = useState(false);

    const [formValues, setFormValues] = useState<FormValues>({
        name: "",
        cityId: "",
        cuisineId: "",
        description: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        bdrUserId: "",
    });

    const handleChange = (field: keyof FormValues, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormValues({
            name: "",
            cityId: "",
            cuisineId: "",
            description: "",
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            bdrUserId: "",
        });
    };

    // Load options when modal opens
    useEffect(() => {
        if (!open) return;

        const loadOptions = async () => {
            try {
                // Get current user
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;

                const isSuperAdmin = user.app_metadata?.is_super_admin === true;
                setCanAssignBdr(isSuperAdmin);

                // Load cities
                setCityOptionsLoading(true);
                let citiesQuery = supabase
                    .from("cities")
                    .select("id, name, state_code")
                    .order("name");

                if (!isSuperAdmin) {
                    // For non-super admins, only show their assigned cities
                    const { data: userCities } = await supabase
                        .from("user_city_coverage")
                        .select("city_id")
                        .eq("user_id", user.id);

                    const cityIds = userCities?.map((uc: any) => uc.city_id) || [];
                    if (cityIds.length > 0) {
                        citiesQuery = citiesQuery.in("id", cityIds);
                    } else {
                        setCityOptions([]);
                        setCityOptionsLoading(false);
                        return;
                    }
                }

                const { data: cities } = await citiesQuery;
                setCityOptions(
                    cities?.map((c: any) => ({
                        id: c.id,
                        label: `${c.name}, ${c.state_code}`,
                    })) || []
                );
                setCityOptionsLoading(false);

                // Load cuisines
                const { data: cuisines } = await supabase
                    .from("cuisines")
                    .select("id, name")
                    .order("name");

                setCuisineOptions(
                    cuisines?.map((c: any) => ({
                        id: c.id,
                        label: c.name,
                    })) || []
                );

                // Load BDRs if super admin
                if (isSuperAdmin) {
                    const { data: bdrRoles } = await supabase
                        .from("user_roles")
                        .select("user_id")
                        .eq("role", "BDR");

                    const bdrUserIds = bdrRoles?.map((r: any) => r.user_id) || [];

                    if (bdrUserIds.length > 0) {
                        const { data: profiles } = await supabase
                            .from("profiles")
                            .select("user_id, display_name")
                            .in("user_id", bdrUserIds)
                            .order("display_name");

                        setBdrOptions(
                            profiles?.map((p: any) => ({
                                id: p.user_id,
                                label: p.display_name || "Unknown",
                            })) || []
                        );
                    }
                }
            } catch (error) {
                console.error("Error loading options:", error);
            }
        };

        loadOptions();
    }, [open, supabase]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formValues.name.trim()) {
            toast({
                title: "Restaurant name required",
                description: "Please provide a name.",
                variant: "destructive",
            });
            return;
        }
        if (!formValues.cityId) {
            toast({
                title: "City required",
                description: "Select one of your covered cities.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from("restaurants")
                .insert({
                    name: formValues.name.trim(),
                    city_id: formValues.cityId,
                    primary_cuisine_id: formValues.cuisineId || null,
                    description: formValues.description || null,
                })
                .select("id")
                .single();

            if (error) throw error;
            const restaurantId = data?.id;

            if (
                restaurantId &&
                (formValues.contactName ||
                    formValues.contactEmail ||
                    formValues.contactPhone)
            ) {
                const { error: contactError } = await supabase
                    .from("restaurant_contacts")
                    .insert({
                        restaurant_id: restaurantId,
                        full_name: formValues.contactName || "Primary Contact",
                        email: formValues.contactEmail || null,
                        phone: formValues.contactPhone || null,
                        is_primary: true,
                    });
                if (contactError) throw contactError;
            }

            if (restaurantId && canAssignBdr && formValues.bdrUserId) {
                const { error: assignmentError } = await supabase
                    .from("restaurant_assignments")
                    .upsert({
                        restaurant_id: restaurantId,
                        user_id: formValues.bdrUserId,
                        role: "BDR",
                    });
                if (assignmentError) throw assignmentError;
            }

            toast({ title: "Restaurant added", description: "Onboarding started." });
            resetForm();
            onOpenChange(false);
            onCreated();
        } catch (error) {
            console.error("Error creating restaurant", error);
            toast({
                title: "Unable to create restaurant",
                description:
                    error instanceof Error ? error.message : "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>New Restaurant Onboarding</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="restaurant-name">Restaurant Name</Label>
                            <Input
                                id="restaurant-name"
                                value={formValues.name}
                                onChange={(event) => handleChange("name", event.target.value)}
                                placeholder="e.g. The Golden Spoon"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Select
                                value={formValues.cityId}
                                onValueChange={(value) => handleChange("cityId", value)}
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
                                    handleChange("cuisineId", value === OPTIONAL_VALUE ? "" : value)
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
                        {canAssignBdr && (
                            <div className="space-y-2">
                                <Label>Assign BDR (Optional)</Label>
                                <Select
                                    value={formValues.bdrUserId || OPTIONAL_VALUE}
                                    onValueChange={(value) =>
                                        handleChange("bdrUserId", value === OPTIONAL_VALUE ? "" : value)
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
                            onChange={(event) => handleChange("description", event.target.value)}
                            placeholder="Additional notes about this restaurant..."
                            rows={3}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Primary Contact (Optional)</h4>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Full Name</Label>
                                <Input
                                    id="contact-name"
                                    value={formValues.contactName}
                                    onChange={(event) =>
                                        handleChange("contactName", event.target.value)
                                    }
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Email</Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    value={formValues.contactEmail}
                                    onChange={(event) =>
                                        handleChange("contactEmail", event.target.value)
                                    }
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-phone">Phone</Label>
                                <Input
                                    id="contact-phone"
                                    type="tel"
                                    value={formValues.contactPhone}
                                    onChange={(event) =>
                                        handleChange("contactPhone", event.target.value)
                                    }
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Restaurant
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
