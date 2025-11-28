import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface WizardNavigationProps {
    currentStep: number;
    totalSteps: number;
    canSkip: boolean;
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    isNextDisabled?: boolean;
}

export function WizardNavigation({
    currentStep,
    totalSteps,
    canSkip,
    onNext,
    onBack,
    onSkip,
    onSubmit,
    isSubmitting = false,
    isNextDisabled = false,
}: WizardNavigationProps) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="flex items-center justify-between pt-6 border-t">
            {/* Back Button */}
            <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isFirstStep || isSubmitting}
                className={cn(isFirstStep && "invisible")}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
            </Button>

            <div className="flex gap-3">
                {/* Skip Button */}
                {canSkip && !isLastStep && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSkip}
                        disabled={isSubmitting}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                        Skip
                    </Button>
                )}

                {/* Next/Submit Button */}
                {isLastStep ? (
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        {isSubmitting ? "Creating..." : "Create Restaurant"}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={onNext}
                        disabled={isNextDisabled || isSubmitting}
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
