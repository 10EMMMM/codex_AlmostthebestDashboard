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
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare } from "lucide-react";
import { REQUEST_TYPE_CONFIG, STATUS_OPTIONS } from "./constants";
import type { RequestFilters } from "./types";

interface FilterBarProps {
    onFilterChange: (filters: RequestFilters) => void;
    activeFilters: RequestFilters;
    // Selection mode props
    selectionMode?: boolean;
    onSelectionModeChange?: (enabled: boolean) => void;
}

const REQUEST_TYPES = Object.keys(REQUEST_TYPE_CONFIG);

export function FilterBar({
    onFilterChange,
    activeFilters,
    selectionMode = false,
    onSelectionModeChange
}: FilterBarProps) {
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

    const toggleType = (type: string) => {
        const newTypes = activeFilters.types.includes(type)
            ? activeFilters.types.filter(t => t !== type)
            : [...activeFilters.types, type];
        onFilterChange({ ...activeFilters, types: newTypes });
    };

    const toggleStatus = (status: string) => {
        const newStatuses = activeFilters.statuses.includes(status)
            ? activeFilters.statuses.filter(s => s !== status)
            : [...activeFilters.statuses, status];
        onFilterChange({ ...activeFilters, statuses: newStatuses });
    };

    const clearAllFilters = () => {
        setSearchInput('');
        onFilterChange({
            search: '',
            types: [],
            statuses: [],
            dateFrom: undefined,
            dateTo: undefined,
            sortBy: 'created_at',
            sortDirection: 'desc',
        });
    };

    const hasActiveFilters =
        activeFilters.search ||
        activeFilters.types.length > 0 ||
        activeFilters.statuses.length > 0 ||
        activeFilters.dateFrom ||
        activeFilters.dateTo;

    return (
        <div className="space-y-4">
            {/* Filter Controls - Compact Inline */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, company, or requester..."
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchInput && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Type Filter */}
                <Select
                    value={activeFilters.types.length === 1 ? activeFilters.types[0] : "all"}
                    onValueChange={(value) => {
                        if (value === "all") {
                            onFilterChange({ ...activeFilters, types: [] });
                        } else {
                            toggleType(value);
                        }
                    }}
                >
                    <SelectTrigger className="w-[160px]">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Type" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {REQUEST_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={activeFilters.statuses.length === 1 ? activeFilters.statuses[0] : "all"}
                    onValueChange={(value) => {
                        if (value === "all") {
                            onFilterChange({ ...activeFilters, statuses: [] });
                        } else {
                            toggleStatus(value);
                        }
                    }}
                >
                    <SelectTrigger className="w-[160px]">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                    {status.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort Control */}
                <div className="flex items-center gap-1">
                    <Select
                        value={activeFilters.sortBy}
                        onValueChange={(value: any) => {
                            onFilterChange({ ...activeFilters, sortBy: value });
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4" />
                                <SelectValue placeholder="Sort by" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at">Created Date</SelectItem>
                            <SelectItem value="updated_at">Updated Date</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Direction Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onFilterChange({
                                ...activeFilters,
                                sortDirection: activeFilters.sortDirection === 'asc' ? 'desc' : 'asc'
                            });
                        }}
                        className="px-2"
                        title={activeFilters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        {activeFilters.sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Selection Mode Toggle */}
                {onSelectionModeChange && (
                    <Button
                        variant={selectionMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectionModeChange(!selectionMode)}
                        className="gap-2"
                    >
                        <CheckSquare className="h-4 w-4" />
                        {selectionMode ? "Exit Selection" : "Select"}
                    </Button>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-1 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.search && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 px-3 py-1.5 text-sm font-normal bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                            <Search className="h-3 w-3" />
                            {activeFilters.search}
                            <button
                                onClick={() => handleSearchChange('')}
                                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    {activeFilters.types.map((type) => (
                        <Badge
                            key={type}
                            variant="secondary"
                            className="gap-1.5 px-3 py-1.5 text-sm font-normal bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        >
                            <Filter className="h-3 w-3" />
                            {type}
                            <button
                                onClick={() => toggleType(type)}
                                className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-900 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}

                    {activeFilters.statuses.map((status) => {
                        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
                        return (
                            <Badge
                                key={status}
                                variant="secondary"
                                className="gap-1.5 px-3 py-1.5 text-sm font-normal bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                            >
                                <div className={`w-2 h-2 rounded-full ${statusOption?.color}`} />
                                {statusOption?.label}
                                <button
                                    onClick={() => toggleStatus(status)}
                                    className="ml-1 hover:bg-green-200 dark:hover:bg-green-900 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
