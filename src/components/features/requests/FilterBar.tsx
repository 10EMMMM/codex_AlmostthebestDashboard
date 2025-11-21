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
import { Search, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Plus, FileText, Loader2, Copy } from "lucide-react";
import { REQUEST_TYPE_CONFIG, STATUS_OPTIONS } from "./constants";
import type { RequestFilters } from "./types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterBarProps {
    onFilterChange: (filters: RequestFilters) => void;
    activeFilters: RequestFilters;
    // Selection mode props
    selectionMode?: boolean;
    onSelectionModeChange?: (enabled: boolean) => void;
    // Create request prop
    onCreateRequest?: () => void;
}

const REQUEST_TYPES = Object.keys(REQUEST_TYPE_CONFIG);

export function FilterBar({
    onFilterChange,
    activeFilters,
    selectionMode = false,
    onSelectionModeChange,
    onCreateRequest
}: FilterBarProps) {
    const [searchInput, setSearchInput] = useState(activeFilters.search);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportHtml, setReportHtml] = useState<string | null>(null);
    const [reportText, setReportText] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { supabase } = useAuth();
    const { toast } = useToast();

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

    const handleGenerateReport = async () => {
        try {
            setGeneratingReport(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "You must be logged in to generate a report",
                });
                return;
            }

            const params = new URLSearchParams();
            if (activeFilters.search) params.set("search", activeFilters.search);
            if (activeFilters.types.length) params.set("types", activeFilters.types.join(","));
            if (activeFilters.statuses.length) params.set("statuses", activeFilters.statuses.join(","));
            if (activeFilters.dateFrom) params.set("dateFrom", activeFilters.dateFrom.toISOString());
            if (activeFilters.dateTo) params.set("dateTo", activeFilters.dateTo.toISOString());
            params.set("sortBy", activeFilters.sortBy);
            params.set("sortDirection", activeFilters.sortDirection);

            const response = await fetch(`/api/reports?${params.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch report data");

            const data = await response.json();
            const requests = data.requests;

            if (!requests || requests.length === 0) {
                toast({
                    title: "No requests found",
                    description: "There are no requests matching the current filters.",
                });
                return;
            }

            // Generate HTML
            let html = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px;">
                    <h1 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                        Request Status Report - ${format(new Date(), "MMM d, yyyy")}
                    </h1>
            `;

            requests.forEach((req: any) => {
                const statusColor = STATUS_OPTIONS.find(s => s.value === req.status)?.color || "bg-gray-500";
                // Map tailwind bg colors to hex for email compatibility
                const hexColorMap: Record<string, string> = {
                    "bg-green-500": "#22c55e",
                    "bg-blue-500": "#3b82f6",
                    "bg-orange-500": "#f97316",
                    "bg-purple-500": "#a855f7",
                    "bg-gray-500": "#6b7280",
                };
                const badgeColor = hexColorMap[statusColor] || "#6b7280";

                html += `
                    <div style="margin-bottom: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">
                            ${req.title}
                        </h2>
                        <div style="margin-bottom: 15px; font-size: 14px;">
                            <span style="display: inline-block; padding: 4px 8px; background-color: ${badgeColor}; color: white; border-radius: 4px; font-weight: bold; font-size: 12px;">
                                ${req.status.toUpperCase()}
                            </span>
                            <span style="margin-left: 10px; color: #64748b;">
                                <strong>Company:</strong> ${req.company || 'N/A'}
                            </span>
                            <span style="margin-left: 10px; color: #64748b;">
                                <strong>City:</strong> ${req.city_name || 'N/A'}
                            </span>
                             <span style="margin-left: 10px; color: #64748b;">
                                <strong>Assigned:</strong> ${req.assigned_bdrs?.map((b: any) => b.name).join(", ") || 'Unassigned'}
                            </span>
                        </div>
                        
                        ${req.description ? `
                            <blockquote style="margin: 0 0 20px 0; padding-left: 15px; border-left: 4px solid #cbd5e1; color: #475569; font-style: italic;">
                                ${req.description}
                            </blockquote>
                        ` : ''}

                        ${req.comments && req.comments.length > 0 ? `
                            <div style="margin-top: 15px;">
                                <h3 style="font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Latest Updates</h3>
                                ${req.comments.map((comment: any) => renderComment(comment)).join('')}
                            </div>
                        ` : '<p style="color: #94a3b8; font-style: italic; font-size: 13px;">No comments yet.</p>'}
                    </div>
                `;
            });

            html += `</div>`;

            setReportHtml(html);
            setReportText(requests.map((r: any) => `${r.title} - ${r.status}`).join('\n'));
            setIsPreviewOpen(true);

        } catch (error) {
            console.error("Report generation failed", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to generate report",
            });
        } finally {
            setGeneratingReport(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (!reportHtml || !reportText) return;

        try {
            const blob = new Blob([reportHtml], { type: "text/html" });
            const textBlob = new Blob([reportText], { type: "text/plain" });

            const clipboardItem = new ClipboardItem({
                "text/html": blob,
                "text/plain": textBlob,
            });

            await navigator.clipboard.write([clipboardItem]);
            toast({
                title: "Success",
                description: "Report copied to clipboard!",
            });
            setIsPreviewOpen(false);
        } catch (error) {
            console.error("Copy failed", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy to clipboard",
            });
        }
    };

    // Helper to render threaded comments
    const renderComment = (comment: any, depth = 0) => {
        const paddingLeft = depth * 20;
        const dateStr = format(new Date(comment.created_at), "MMM d, h:mm a");

        let html = `
            <div style="margin-left: ${paddingLeft}px; margin-bottom: 10px; padding: 10px; background-color: white; border-radius: 6px; border: 1px solid #f1f5f9;">
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                    <strong style="color: #334155;">${comment.user_name}</strong> &bull; ${dateStr}
                </div>
                <div style="font-size: 13px; color: #1e293b; white-space: pre-wrap;">${comment.content}</div>
            </div>
        `;

        if (comment.replies && comment.replies.length > 0) {
            html += comment.replies.map((reply: any) => renderComment(reply, depth + 1)).join('');
        }

        return html;
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
                {/* Create Request Button */}
                {onCreateRequest && (
                    <Button onClick={onCreateRequest} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Request
                    </Button>
                )}

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

                {/* Generate Report Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="gap-2"
                    title="Generate report preview"
                >
                    {generatingReport ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileText className="h-4 w-4" />
                    )}
                    Report
                </Button>

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

            {/* Report Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Report Preview</DialogTitle>
                        <DialogDescription>
                            Review the report content before copying to clipboard.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 border rounded-md p-4 bg-white overflow-hidden">
                        <ScrollArea className="h-full w-full">
                            {reportHtml && (
                                <div
                                    dangerouslySetInnerHTML={{ __html: reportHtml }}
                                    className="prose prose-sm max-w-none"
                                />
                            )}
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCopyToClipboard} className="gap-2">
                            <Copy className="h-4 w-4" />
                            Copy to Clipboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}




