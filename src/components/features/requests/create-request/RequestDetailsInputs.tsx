import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, AlignLeft, Package, Clock, Truck, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { REQUEST_TYPE_CONFIG, CreateRequestFormData } from "./types";

interface RequestDetailsInputsProps {
    formData: CreateRequestFormData;
    onUpdate: (field: keyof CreateRequestFormData, value: any) => void;
}

export function RequestDetailsInputs({ formData, onUpdate }: RequestDetailsInputsProps) {
    const [needAnswerByOpen, setNeedAnswerByOpen] = useState(false);
    const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                </div>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => onUpdate("title", e.target.value)}
                    placeholder={
                        formData.requestType
                            ? REQUEST_TYPE_CONFIG[formData.requestType as keyof typeof REQUEST_TYPE_CONFIG].example
                            : "Enter request title..."
                    }
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
                </div>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => onUpdate("description", e.target.value)}
                    placeholder="Provide additional details..."
                    rows={3}
                />
            </div>

            {/* Company */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="company">Company <span className="text-muted-foreground">- Optional</span></Label>
                </div>
                <Input
                    id="company"
                    value={formData.company || ""}
                    onChange={(e) => onUpdate("company", e.target.value)}
                    placeholder="Enter company name"
                />
            </div>

            {/* Volume */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="volume">Volume <span className="text-muted-foreground">- Optional</span></Label>
                </div>
                <Input
                    id="volume"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.volume ?? ""}
                    onChange={(e) => onUpdate("volume", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                />
            </div>

            {/* Dates in one row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label>Need Answer By <span className="text-muted-foreground">- Optional</span></Label>
                    </div>
                    <Popover open={needAnswerByOpen} onOpenChange={setNeedAnswerByOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.need_answer_by && "text-muted-foreground"
                                )}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                {formData.need_answer_by ? format(formData.need_answer_by, "MMM d") : "Pick date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.need_answer_by}
                                onSelect={(date) => {
                                    onUpdate("need_answer_by", date);
                                    setNeedAnswerByOpen(false);
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <Label>Delivery Date <span className="text-muted-foreground">- Optional</span></Label>
                    </div>
                    <Popover open={deliveryDateOpen} onOpenChange={setDeliveryDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.delivery_date && "text-muted-foreground"
                                )}
                            >
                                <Truck className="mr-2 h-4 w-4" />
                                {formData.delivery_date ? format(formData.delivery_date, "MMM d") : "Pick date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.delivery_date}
                                onSelect={(date) => {
                                    onUpdate("delivery_date", date);
                                    setDeliveryDateOpen(false);
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
