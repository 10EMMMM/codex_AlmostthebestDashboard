import { cn } from "@/lib/utils";

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
    return (
        <div className="flex items-center justify-center gap-2 py-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div
                    key={step}
                    className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        step === currentStep
                            ? "bg-orange-500 scale-125"
                            : step < currentStep
                                ? "bg-orange-300"
                                : "bg-gray-300"
                    )}
                />
            ))}
        </div>
    );
}
