import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface FormValues {
    name: string;
    cityId: string;
    cuisineId: string;
    description: string;
    bdrUserId: string;
    priceRange: string;
    yelpUrl: string;
    primaryPhotoUrl: string;
    discountPercentage: string;
    offersBoxMeals: boolean;
    offersTrays: boolean;
    earliestPickupTime: string;
}

const initialFormValues: FormValues = {
    name: "",
    cityId: "",
    cuisineId: "",
    description: "",
    bdrUserId: "",
    priceRange: "",
    yelpUrl: "",
    primaryPhotoUrl: "",
    discountPercentage: "",
    offersBoxMeals: false,
    offersTrays: false,
    earliestPickupTime: "",
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
    const { isSuperAdmin } = useAuth();
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
        if (!formValues.name.trim()) {
            toast({
                title: "Restaurant name required",
                description: "Please provide a name.",
                variant: "destructive",
            });
            return false;
        }
        if (!formValues.cityId) {
            toast({
                title: "City required",
                description: "Select one of your covered cities.",
                variant: "destructive",
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            // Create restaurant
            const { data, error } = await supabase
                .from("restaurants")
                .insert({
                    name: formValues.name.trim(),
                    city_id: formValues.cityId,
                    primary_cuisine_id: formValues.cuisineId || null,
                    description: formValues.description || null,
                    price_range: formValues.priceRange ? parseInt(formValues.priceRange) : null,
                    yelp_url: formValues.yelpUrl || null,
                    primary_photo_url: formValues.primaryPhotoUrl || null,
                    discount_percentage: formValues.discountPercentage
                        ? parseFloat(formValues.discountPercentage)
                        : null,
                    offers_box_meals: formValues.offersBoxMeals,
                    offers_trays: formValues.offersTrays,
                    earliest_pickup_time: formValues.earliestPickupTime || null,
                })
                .select("id")
                .single();

            if (error) throw error;
            const restaurantId = data?.id;

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

    return {
        formValues,
        submitting,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
        resetForm,
    };
}
