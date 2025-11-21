import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { REQUEST_TYPES, REQUEST_TYPE_CONFIG } from "./types";

interface RequestTypeSelectorProps {
    selectedType: string;
    onTypeChange: (type: string) => void;
}

export function RequestTypeSelector({ selectedType, onTypeChange }: RequestTypeSelectorProps) {
    return (
        <div className="space-y-3">
            <Label>Request Type <span className="text-destructive">*</span></Label>
            <TooltipProvider>
                <div className="grid grid-cols-3 gap-3">
                    {REQUEST_TYPES.map((type) => {
                        const config = REQUEST_TYPE_CONFIG[type];
                        const Icon = config.icon;
                        return (
                            <Tooltip key={type}>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={selectedType === type ? "default" : "outline"}
                                        onClick={() => onTypeChange(type)}
                                        className="h-12 w-full flex items-center justify-center"
                                    >
                                        <Icon className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{type}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
        </div>
    );
}
