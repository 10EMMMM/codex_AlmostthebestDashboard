"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, MapPin, User, Check, ChevronsUpDown, UtensilsCrossed, PartyPopper, ChefHat, FileText, AlignLeft, Package, Clock, Truck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type City = {
    id: string;
    name: string;
    state_code: string;
};

type AccountManager = {
    id: string;
    email: string;
    display_name: string;
    city_count: number;
};

const REQUEST_TYPES = ["RESTAURANT", "EVENT", "CUISINE"] as const;

const REQUEST_TYPE_CONFIG = {
    RESTAURANT: {
        icon: UtensilsCrossed,
        example: "New Italian restaurant in Downtown Miami",
    },
    EVENT: {
        icon: PartyPopper,
        example: "Corporate holiday party for 100 guests",
    },
    CUISINE: {
        icon: ChefHat,
        example: "Authentic Thai cuisine for catering menu",
    },
} as const;

type FormData = {
    selectedAM: string;
    requestType: string;
    title: string;
    description: string;
    cityId: string;
    volume?: number;
    need_answer_by?: Date;
    delivery_date?: Date;
};

export function CreateRequestForm({
    onCancel,
    onCreated,
}: {
    onCancel?: () => void;
    onCreated?: () => void;
}) {
    const [formData, setFormData] = useState<FormData>({
        selectedAM: "",
        requestType: "",
        title: "",
        description: "",
        cityId: "",
        volume: undefined,
        need_answer_by: undefined,
        delivery_date: undefined,
    });

    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
    const [amSearchOpen, setAmSearchOpen] = useState(false);
    const [amLoading, setAmLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [needAnswerByOpen, setNeedAnswerByOpen] = useState(false);
    const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);

    const { toast } = useToast();
    const { user } = useAuth();
    const canCreateForOthers = useFeatureFlag('proxy_request_creation');

    // Load Account Managers (only for users with proxy request creation feature)
    useEffect(() => {
        if (!canCreateForOthers) return;

        const loadAccountManagers = async () => {
            setAmLoading(true);
            try {
                const supabase = (window as any).supabase;
                if (!supabase) return;

                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch('/api/admin/account-managers', {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAccountManagers(data.accountManagers || []);
                }
            } catch (error) {
                console.error('Error loading account managers:', error);
            } finally {
                setAmLoading(false);
            }
        };

        loadAccountManagers();
    }, [canCreateForOthers]);

    // Load cities when AM is selected or user changes
    useEffect(() => {
        if (!user) return;

        const targetUserId = canCreateForOthers && formData.selectedAM ? formData.selectedAM : user.id;

        if (canCreateForOthers && !formData.selectedAM) {
            setCities([]);
            return;
        }

        const loadCitiesForUser = async (userId: string) => {
            setCitiesLoading(true);
            try {
                const supabase = (window as any).supabase;
                if (!supabase) {
                    console.error("Supabase client not initialized");
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch(`/api/admin/user-cities?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching cities from API:", await response.text());
                    setCities([]);
                    return;
                }

                const data = await response.json();

                if (data.cities && data.cities.length > 0) {
                    setCities(data.cities);
                } else {
                    setCities([]);
                }
            } catch (error) {
                console.error("Error loading cities:", error);
                setCities([]);
            } finally {
                setCitiesLoading(false);
            }
        };

        loadCitiesForUser(targetUserId);
    }, [user, formData.selectedAM, canCreateForOthers]);

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === "selectedAM") {
            setFormData(prev => ({ ...prev, cityId: "" }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.requestType) {
            toast({
                title: "Request Type Required",
                description: "Please select a request type",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.title.trim()) {
            toast({
                title: "Title Required",
                description: "Please enter a request title",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.cityId) {
            toast({
                title: "City Required",
                description: "Please select a city",
                variant: "destructive",
            });
            return false;
        }

        if (canCreateForOthers && !formData.selectedAM) {
            toast({
                title: "Account Manager Required",
                description: "Please select an Account Manager",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const supabase = (window as any).supabase;
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/admin/create-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    request_type: formData.requestType,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    city_id: formData.cityId,
                    volume: formData.volume,
                    need_answer_by: formData.need_answer_by ? format(formData.need_answer_by, "yyyy-MM-dd") : undefined,
                    delivery_date: formData.delivery_date ? format(formData.delivery_date, "yyyy-MM-dd") : undefined,
                    requested_by: canCreateForOthers && formData.selectedAM ? formData.selectedAM : undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create request");
            }

            toast({
                title: "Request Created",
                description: `Successfully created ${formData.requestType} request`,
            });

            setFormData({
                selectedAM: "",
                requestType: "",
                title: "",
                description: "",
                cityId: "",
                volume: undefined,
                need_answer_by: undefined,
                delivery_date: undefined,
            });

            onCreated?.();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedAMData = accountManagers.find(am => am.id === formData.selectedAM);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Conditional: Show Account Manager & City for users with feature */}
            {canCreateForOthers ? (
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
                                        {selectedAMData ? selectedAMData.display_name : "Search Account Manager..."}
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
                                                            updateFormData("selectedAM", am.id);
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
                            {selectedAMData && (
                                <p className="text-xs text-muted-foreground">
                                    Creating request for <strong>{selectedAMData.display_name}</strong>
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Label>City <span className="text-destructive">*</span></Label>
                            </div>
                            <Select
                                value={formData.cityId}
                                onValueChange={(value) => updateFormData("cityId", value)}
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
                    <Select value={formData.cityId} onValueChange={(value) => updateFormData("cityId", value)}>
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
                                            variant={formData.requestType === type ? "default" : "outline"}
                                            onClick={() => updateFormData("requestType", type)}
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

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                </div>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
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
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Provide additional details..."
                    rows={3}
                />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="volume">Volume <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    </div>
                    <Input
                        id="volume"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.volume ?? ""}
                        onChange={(e) => updateFormData("volume", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Label>Need Answer By <span className="text-muted-foreground text-xs">(optional)</span></Label>
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
                                        updateFormData("need_answer_by", date);
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
                            <Label>Delivery Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
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
                                        updateFormData("delivery_date", date);
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

            <Separator />

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? "Creating..." : "Create Request"}
                </Button>
            </div>
        </form>
    );
}
