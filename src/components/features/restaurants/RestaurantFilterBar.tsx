import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X, CheckSquare, Plus } from "lucide-react";
import type { RestaurantFilters } from "@/components/features/restaurants/types";

interface RestaurantFilterBarProps {
    onFilterChange: (filters: RestaurantFilters) => void;
    activeFilters: RestaurantFilters;
    // Selection mode props
    selectionMode?: boolean;
    onSelectionModeChange?: (enabled: boolean) => void;
    // Create restaurant prop
    onCreateRestaurant?: () => void;
}


export function RestaurantFilterBar({
    onFilterChange,
    activeFilters,
    selectionMode = false,
    onSelectionModeChange,
    onCreateRestaurant,
}: RestaurantFilterBarProps) {
    const [searchInput, setSearchInput] = useState(activeFilters.search);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        // Simple debounce with setTimeout
        const timeoutId = setTimeout(() => {
            onFilterChange({ ...activeFilters, search: value });
        }, 300);
        return () => clearTimeout(timeoutId);
    };



    const clearAllFilters = () => {
        setSearchInput("");
        onFilterChange({
            search: "",
            cityIds: [],
            cuisineIds: [],
            sortBy: "created_at",
            sortDirection: "desc",
        });
    };

    const hasActiveFilters =
        activeFilters.search ||
        activeFilters.cityIds.length > 0 ||
        activeFilters.cuisineIds.length > 0;

    return (
        <div className="space-y-4">
            {/* Top Row: Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search restaurants..."
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchInput && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {/* Selection Mode Toggle */}
                    {onSelectionModeChange && (
                        <Button
                            variant={selectionMode ? "default" : "outline"}
                            size="default"
                            onClick={() => onSelectionModeChange(!selectionMode)}
                        >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Select
                        </Button>
                    )}

                    {/* Create Restaurant */}
                    {onCreateRestaurant && (
                        <Button onClick={onCreateRestaurant} size="default">
                            <Plus className="h-4 w-4 mr-2" />
                            New Restaurant
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Row: Sort only (status removed) */}
            <div className="flex flex-wrap items-center gap-3">

                {/* Sort */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm font-medium text-muted-foreground">Sort:</span>
                    <Select
                        value={activeFilters.sortBy}
                        onValueChange={(value) =>
                            onFilterChange({ ...activeFilters, sortBy: value as any })
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at">Created Date</SelectItem>
                            <SelectItem value="updated_at">Updated Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="city_name">City</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={activeFilters.sortDirection}
                        onValueChange={(value) =>
                            onFilterChange({
                                ...activeFilters,
                                sortDirection: value as "asc" | "desc",
                            })
                        }
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="ml-2"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
