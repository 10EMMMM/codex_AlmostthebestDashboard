import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, User, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountManager, City } from "./types";

interface LocationSelectorProps {
    canCreateForOthers: boolean;
    selectedAM: string;
    cityId: string;
    accountManagers: AccountManager[];
    cities: City[];
    amLoading: boolean;
    citiesLoading: boolean;
    onAMChange: (value: string) => void;
    onCityChange: (value: string) => void;
}

export function LocationSelector({
    canCreateForOthers,
    selectedAM,
    cityId,
    accountManagers,
    cities,
    amLoading,
    citiesLoading,
    onAMChange,
    onCityChange,
}: LocationSelectorProps) {
    const [amSearchOpen, setAmSearchOpen] = useState(false);
    const selectedAMData = accountManagers.find(am => am.id === selectedAM);

    if (!canCreateForOthers) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label>City <span className="text-destructive">*</span></Label>
                </div>
                <Select value={cityId} onValueChange={onCityChange}>
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
        );
    }

    return (
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
                                                    onAMChange(am.id);
                                                    setAmSearchOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedAM === am.id ? "opacity-100" : "opacity-0"
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
                        value={cityId}
                        onValueChange={onCityChange}
                        disabled={!selectedAM}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={selectedAM ? "Select city..." : "Select AM first..."} />
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
                                    {selectedAM ? "No cities assigned to this AM" : "Select an Account Manager first"}
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
    );
}
