import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRestaurantForm } from "./hooks/useCreateRestaurantForm";
import { useRestaurantOptions } from "./hooks/useRestaurantOptions";
import { WizardProgress } from "./wizard/WizardProgress";
import { WizardNavigation } from "./wizard/WizardNavigation";
import { Step1BasicInfo } from "./wizard/Step1BasicInfo";
import { Step2ServiceDetails } from "./wizard/Step2ServiceDetails";
import { Step3Logistics } from "./wizard/Step3Logistics";
import { Step4Review } from "./wizard/Step4Review";

interface CreateRestaurantModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
    supabase: any;
}

const TOTAL_STEPS = 4;

export function CreateRestaurantModal({
    open,
    onOpenChange,
    onCreated,
    supabase,
}: CreateRestaurantModalProps) {
    const { isSuperAdmin } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);

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
        handleSubmit: submitForm,
        resetForm,
    } = useCreateRestaurantForm({
        supabase,
        onSuccess: () => {
            onCreated();
            setCurrentStep(1); // Reset to first step
        },
        onClose: () => {
            onOpenChange(false);
            setCurrentStep(1); // Reset to first step
        },
    });

    // Navigation handlers
    const handleNext = () => {
        // Validate step 1 (required fields)
        if (currentStep === 1) {
            if (!formValues.name.trim() || !formValues.cityId || !formValues.cuisineIds || formValues.cuisineIds.length === 0) {
                return; // Don't proceed if validation fails
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSkip = () => {
        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const handleSubmit = async () => {
        await submitForm({ preventDefault: () => { } } as React.FormEvent);
    };

    // Reset step when modal closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setCurrentStep(1);
            resetForm();
        }
        onOpenChange(open);
    };

    // Determine if current step can be skipped (steps 2-3 are optional)
    const canSkip = currentStep >= 2 && currentStep <= 3;

    // Determine if Next button should be disabled
    const isNextDisabled = currentStep === 1 && (
        !formValues.name.trim() ||
        !formValues.cityId ||
        !formValues.cuisineIds ||
        formValues.cuisineIds.length === 0
    );

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>New Restaurant Onboarding</SheetTitle>
                    <SheetDescription>
                        Step {currentStep} of {TOTAL_STEPS}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Progress Indicator */}
                    <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                    {/* Step Content */}
                    <div className="min-h-[400px]">
                        {currentStep === 1 && (
                            <Step1BasicInfo
                                formValues={formValues}
                                onChange={handleChange}
                                cityOptions={cityOptions}
                                cuisineOptions={cuisineOptions}
                                bdrOptions={bdrOptions}
                                cityOptionsLoading={cityOptionsLoading}
                                isSuperAdmin={isSuperAdmin}
                            />
                        )}
                        {currentStep === 2 && (
                            <Step2ServiceDetails
                                formValues={formValues}
                                onChange={handleChange}
                                onCheckboxChange={handleCheckboxChange}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step3Logistics
                                formValues={formValues}
                                onChange={handleChange}
                            />
                        )}
                        {currentStep === 4 && (
                            <Step4Review
                                formValues={formValues}
                                cityOptions={cityOptions}
                                cuisineOptions={cuisineOptions}
                                bdrOptions={bdrOptions}
                                onEdit={goToStep}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <WizardNavigation
                        currentStep={currentStep}
                        totalSteps={TOTAL_STEPS}
                        canSkip={canSkip}
                        onNext={handleNext}
                        onBack={handleBack}
                        onSkip={handleSkip}
                        onSubmit={handleSubmit}
                        isSubmitting={submitting}
                        isNextDisabled={isNextDisabled}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
