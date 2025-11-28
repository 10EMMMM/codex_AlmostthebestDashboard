import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface FormValues {
    // Step 1: Basic Information
    name: string;
    cityId: string;
    cuisineIds: string[]; // Multiple cuisines, first is primary (required)
    bdrUserId: string; // Super admin only

    // Step 2: Service Details
    description: string;
    offersBoxMeals: boolean;
    offersTrays: boolean;
    discountPercentage: string; // Free-form text

    // Step 3: Logistics
    earliestPickupTime: string;
    pickupStreet: string;
    pickupSuite: string;
    pickupCity: string;
    pickupState: string;
    pickupPostalCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
}

const initialFormValues: FormValues = {
    name: "",
    cityId: "",
    cuisineIds: [],
    bdrUserId: "",
    description: "",
    offersBoxMeals: false,
    offersTrays: false,
    discountPercentage: "",
    earliestPickupTime: "",
    pickupStreet: "",
    pickupSuite: "",
    pickupCity: "",
    pickupState: "",
    pickupPostalCode: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
};

interface UseCreateRestaurantFormProps {
    supabase: any;
    onSuccess: () => void;
    onClose: () => void;
}

export function useCreateRestaurantForm({
    supabase,
    onSuccess,
    onClose,
}: UseCreateRestaurantFormProps) {
    const { toast } = useToast();
    const { user, isSuperAdmin } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

    const handleChange = (field: keyof FormValues, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field: 'offersBoxMeals' | 'offersTrays', checked: boolean) => {
        setFormValues((prev) => ({ ...prev, [field]: checked }));
    };

    const resetForm = () => {
        setFormValues(initialFormValues);
    };

    const validateForm = (): boolean => {
        // Required: name
        if (!formValues.name.trim()) {
            toast({
                title: "Restaurant name required",
                description: "Please provide a name.",
                variant: "destructive",
            });
            return false;
        }

        // Required: city
        if (!formValues.cityId) {
            toast({
                title: "City required",
                description: "Select one of your covered cities.",
                variant: "destructive",
            });
            return false;
        }

        // Required: at least one cuisine (primary)
        if (!formValues.cuisineIds || formValues.cuisineIds.length === 0) {
            toast({
                title: "Primary cuisine required",
                description: "Please select at least one cuisine.",
                variant: "destructive",
            });
            return false;
        }

        // Validate email format if provided
        if (formValues.contactEmail && !isValidEmail(formValues.contactEmail)) {
            toast({
                title: "Invalid email format",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return false;
        }

        // Validate discount length
        if (formValues.discountPercentage && formValues.discountPercentage.length > 200) {
            toast({
                title: "Discount text too long",
                description: "Please keep discount description under 200 characters.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    // Simple email validation
    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            // Ensure cuisineIds is valid
            if (!formValues.cuisineIds || formValues.cuisineIds.length === 0) {
                throw new Error("Primary cuisine is required");
            }

            // Generate slug from restaurant name (URL-friendly)
            const slug = formValues.name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
                .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens

            // Determine onboarded_by:
            // - If admin selected a BDR, use that BDR's ID
            // - Otherwise, use current user's ID (for BDR creating their own)
            const onboardedBy = (isSuperAdmin && formValues.bdrUserId)
                ? formValues.bdrUserId
                : user?.id || null;

            // Create restaurant
            const { data, error } = await supabase
                .from("restaurants")
                .insert({
                    name: formValues.name.trim(),
                    slug: slug,
                    city_id: formValues.cityId,
                    primary_cuisine_id: formValues.cuisineIds[0],
                    description: formValues.description || null,
                    discount_percentage: formValues.discountPercentage || null,
                    offers_box_meals: formValues.offersBoxMeals,
                    offers_trays: formValues.offersTrays,
                    earliest_pickup_time: formValues.earliestPickupTime || null,
                    onboarded_by: onboardedBy,  // BDR who onboarded this restaurant
                    created_by: user?.id || null, // User who physically created the record
                })
                .select("id")
                .single();

            if (error) throw error;
            const restaurantId = data?.id;

            // Insert cuisines into junction table
            if (restaurantId && formValues.cuisineIds && formValues.cuisineIds.length > 0) {
                // Deduplicate cuisine IDs to prevent unique constraint violations
                const uniqueCuisineIds = Array.from(new Set(formValues.cuisineIds));

                const cuisineInserts = uniqueCuisineIds.map((cuisineId, index) => ({
                    restaurant_id: restaurantId,
                    cuisine_id: cuisineId,
                    is_primary: index === 0, // First one is primary
                    display_order: index,
                }));

                const { error: cuisineError } = await supabase
                    .from("restaurant_cuisines")
                    .insert(cuisineInserts);

                if (cuisineError) throw cuisineError;
            }

            // Create primary contact if contact name provided
            if (restaurantId && formValues.contactName.trim()) {
                const { error: contactError } = await supabase
                    .from("restaurant_contacts")
                    .insert({
                        restaurant_id: restaurantId,
                        full_name: formValues.contactName.trim(),
                        email: formValues.contactEmail || null,
                        phone: formValues.contactPhone || null,
                        // Pickup address fields
                        street: formValues.pickupStreet || null,
                        suite: formValues.pickupSuite || null,
                        city: formValues.pickupCity || null,
                        state: formValues.pickupState || null,
                        postal_code: formValues.pickupPostalCode || null,
                        is_primary: true,
                    });

                if (contactError) throw contactError;
            }

            // Assign BDR if super admin and BDR selected
            if (restaurantId && isSuperAdmin && formValues.bdrUserId) {
                const { error: assignmentError } = await supabase
                    .from("restaurant_assignments")
                    .upsert({
                        restaurant_id: restaurantId,
                        user_id: formValues.bdrUserId,
                        role: "BDR",
                    });
                if (assignmentError) throw assignmentError;
            }

            toast({
                title: "Restaurant added",
                description: "Onboarding started."
            });

            resetForm();
            onClose();
            onSuccess();
        } catch (error) {
            // Log to browser console
            console.error("Error creating restaurant:", error);

            // Log Supabase-specific error details
            if (error && typeof error === 'object') {
                console.error("Error message:", (error as any).message);
                console.error("Error code:", (error as any).code);
                console.error("Error details:", (error as any).details);
                console.error("Error hint:", (error as any).hint);

                // Also log to terminal (server-side)
                console.log("\n========== RESTAURANT CREATION ERROR ==========");
                console.log("Message:", (error as any).message);
                console.log("Code:", (error as any).code);
                console.log("Details:", (error as any).details);
                console.log("Hint:", (error as any).hint);
                console.log("Full error:", JSON.stringify(error, null, 2));
                console.log("===============================================\n");
            }

            // Extract error message
            let errorMessage = "Please try again later.";
            if (error && typeof error === 'object') {
                const err = error as any;
                errorMessage = err.message || err.details || err.hint || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                title: "Unable to create restaurant",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        formValues,
        submitting,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
        resetForm,
    };
}
