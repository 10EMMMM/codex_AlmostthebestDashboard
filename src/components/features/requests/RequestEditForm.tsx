import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FileText,
    MapPin,
    User,
    Package,
    Clock,
    Truck,
    AlignLeft,
    Building2,
    Check,
    ChevronsUpDown,
    X,
    Save,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { REQUEST_TYPE_CONFIG } from "./constants";

interface EditFormData {
    selectedAM: string;
    cityId: string;
    title: string;
    description: string;
    request_type: string;
    volume: number | undefined;
    need_answer_by: Date | undefined;
    delivery_date: Date | undefined;
    company: string;
}

interface RequestEditFormProps {
    formData: EditFormData;
    onChange: (data: EditFormData) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    canEditForOthers: boolean;
    accountManagers: Array<{ id: string; email: string; display_name: string; city_count: number }>;
    cities: Array<{ id: string; name: string; state_code: string }>;
    amLoading: boolean;
    citiesLoading: boolean;
}

export function RequestEditForm({
    formData,
    onChange,
    onSave,
    onCancel,
    saving,
    canEditForOthers,
    accountManagers,
    cities,
    amLoading,
    citiesLoading,
}: RequestEditFormProps) {
    const [amSearchOpen, setAmSearchOpen] = useState(false);
    const [needAnswerByOpen, setNeedAnswerByOpen] = useState(false);
    const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Conditional: Show Account Manager & City for users with feature */}
            {canEditForOthers ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Label>Requested By <span className="text-destructive">*</span></Label>
                            </div>
                            <Popover open={amSearchOpen} onOpenChange={setAmSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={amSearchOpen}
                                        className="w-full justify-between"
                                    >
                                        {accountManagers.find(am => am.id === formData.selectedAM)?.display_name || "Search Account Manager..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search account manager..." />
                                        {!amLoading && <CommandEmpty>No account manager found.</CommandEmpty>}
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {amLoading ? (
                                                <div className="p-2 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-sm" />
                                                        <div className="flex-1 space-y-1">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-16" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-sm" />
                                                        <div className="flex-1 space-y-1">
                                                            <Skeleton className="h-4 w-40" />
                                                            <Skeleton className="h-3 w-20" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-sm" />
                                                        <div className="flex-1 space-y-1">
                                                            <Skeleton className="h-4 w-36" />
                                                            <Skeleton className="h-3 w-14" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                accountManagers.map((am) => (
                                                    <CommandItem
                                                        key={am.id}
                                                        value={am.display_name}
                                                        onSelect={() => {
                                                            onChange({ ...formData, selectedAM: am.id, cityId: "" });
                                                            setAmSearchOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.selectedAM === am.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{am.display_name}</span>
                                                            <span className="text-xs text-muted-foreground">{am.city_count} cities</span>
                                                        </div>
                                                    </CommandItem>
                                                ))
                                            )}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Label>City <span className="text-destructive">*</span></Label>
                            </div>
                            <Select
                                value={formData.cityId}
                                onValueChange={(value) => onChange({ ...formData, cityId: value })}
                                disabled={!formData.selectedAM}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={formData.selectedAM ? "Select city..." : "Select AM first..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {citiesLoading ? (
                                        <div className="p-2 space-y-2">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-3/4" />
                                        </div>
                                    ) : cities.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">
                                            {formData.selectedAM ? "No cities assigned to this AM" : "Select an Account Manager first"}
                                        </div>
                                    ) : (
                                        cities.map((city) => (
                                            <SelectItem key={city.id} value={city.id}>
                                                {city.name}, {city.state_code}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            ) : (
                // Regular users only see City (defaults to their assigned cities)
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Label>City <span className="text-destructive">*</span></Label>
                    </div>
                    <Select value={formData.cityId} onValueChange={(value) => onChange({ ...formData, cityId: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select city..." />
                        </SelectTrigger>
                        <SelectContent>
                            {citiesLoading ? (
                                <div className="p-2 space-y-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-3/4" />
                                </div>
                            ) : cities.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                    No cities available
                                </div>
                            ) : (
                                cities.map((city) => (
                                    <SelectItem key={city.id} value={city.id}>
                                        {city.name}, {city.state_code}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Separator />

            {/* Request Type */}
            <div className="space-y-3">
                <Label>Request Type <span className="text-destructive">*</span></Label>
                <TooltipProvider>
                    <div className="grid grid-cols-3 gap-3">
                        {(["RESTAURANT", "EVENT", "CUISINE"] as const).map((type) => {
                            const config = REQUEST_TYPE_CONFIG[type];
                            const Icon = config.icon;
                            return (
                                <Tooltip key={type}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={formData.request_type === type ? "default" : "outline"}
                                            onClick={() => onChange({ ...formData, request_type: type })}
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

            <Separator />

            {/* Title */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="edit-title">Title <span className="text-destructive">*</span></Label>
                </div>
                <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => onChange({ ...formData, title: e.target.value })}
                    placeholder="Enter request title..."
                />
            </div>

            {/* Description */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="edit-description">Description <span className="text-muted-foreground">(optional)</span></Label>
                </div>
                <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => onChange({ ...formData, description: e.target.value })}
                    placeholder="Provide additional details..."
                    rows={3}
                />
            </div>

            <Separator />

            {/* Company */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Label>Company <span className="text-muted-foreground">- Optional</span></Label>
                </div>
                <Input
                    value={formData.company || ""}
                    onChange={(e) => onChange({ ...formData, company: e.target.value })}
                    placeholder="Enter company name"
                />
            </div>

            {/* Volume */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="edit-volume">Volume <span className="text-muted-foreground">- Optional</span></Label>
                </div>
                <Input
                    id="edit-volume"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.volume ?? ""}
                    onChange={(e) => onChange({
                        ...formData,
                        volume: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="0"
                />
            </div>

            {/* Dates in one row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Need Answer By */}
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
                            <CalendarComponent
                                mode="single"
                                selected={formData.need_answer_by}
                                onSelect={(date) => {
                                    onChange({ ...formData, need_answer_by: date });
                                    setNeedAnswerByOpen(false);
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Delivery Date */}
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
                            <CalendarComponent
                                mode="single"
                                selected={formData.delivery_date}
                                onSelect={(date) => {
                                    onChange({ ...formData, delivery_date: date });
                                    setDeliveryDateOpen(false);
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
                <Button
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
                <Button
                    onClick={onSave}
                    className="flex-1"
                    disabled={saving}
                >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
