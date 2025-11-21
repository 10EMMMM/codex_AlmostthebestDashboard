import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRestaurantForm } from "./hooks/useCreateRestaurantForm";
import { useRestaurantOptions } from "./hooks/useRestaurantOptions";
import { RestaurantBasicFields } from "./form-sections/RestaurantBasicFields";
import { RestaurantDetailsFields } from "./form-sections/RestaurantDetailsFields";

interface CreateRestaurantModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
    supabase: any;
}

export function CreateRestaurantModal({
    open,
    onOpenChange,
    onCreated,
    supabase,
}: CreateRestaurantModalProps) {
    const { isSuperAdmin } = useAuth();

    // Load dropdown options
    const {
        cityOptions,
        cuisineOptions,
        bdrOptions,
        cityOptionsLoading,
    } = useRestaurantOptions({ supabase, open });

    // Form state and handlers
    const {
        formValues,
        submitting,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
    } = useCreateRestaurantForm({
        supabase,
        onSuccess: onCreated,
        onClose: () => onOpenChange(false),
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>New Restaurant Onboarding</SheetTitle>
                    <SheetDescription>
                        Fill in the details to add a new restaurant
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <RestaurantBasicFields
                        formValues={formValues}
                        onChange={handleChange}
                        cityOptions={cityOptions}
                        cuisineOptions={cuisineOptions}
                        bdrOptions={bdrOptions}
                        cityOptionsLoading={cityOptionsLoading}
                        isSuperAdmin={isSuperAdmin}
                    />

                    <RestaurantDetailsFields
                        formValues={formValues}
                        onChange={handleChange}
                        onCheckboxChange={handleCheckboxChange}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Restaurant"
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
