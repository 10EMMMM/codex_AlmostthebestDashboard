"use client";

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserCog, Check } from "lucide-react";
import type { Request, BDR } from './types';

interface BDRAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRequest: Request | null;
    bdrs: BDR[];
    bdrLoading: boolean;
    assigningBdr: boolean;
    onLoadBdrs: () => void;
    onSave: (selectedBdrIds: string[]) => void;
}

export function BDRAssignmentDialog({
    open,
    onOpenChange,
    selectedRequest,
    bdrs,
    bdrLoading,
    assigningBdr,
    onLoadBdrs,
    onSave,
}: BDRAssignmentDialogProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Load BDRs when dialog opens and sync selected IDs
    useEffect(() => {
        if (open) {
            onLoadBdrs();
            // Initialize selected IDs from request
            const currentIds = selectedRequest?.assigned_bdrs?.map(b => b.id) || [];
            setSelectedIds(currentIds);
            setSearchQuery(""); // Reset search on open
        }
    }, [open, onLoadBdrs, selectedRequest]);

    const toggleSelection = (bdrId: string) => {
        setSelectedIds(prev => {
            if (prev.includes(bdrId)) {
                return prev.filter(id => id !== bdrId);
            } else {
                return [...prev, bdrId];
            }
        });
    };

    const handleSave = () => {
        onSave(selectedIds);
    };

    // Filter BDRs: Show if selected OR (search query is not empty)
    // Note: cmdk handles the actual fuzzy matching against the search query for the items we render.
    // We just decide which items are *eligible* to be rendered.
    const visibleBdrs = bdrs.filter(bdr =>
        selectedIds.includes(bdr.id) || searchQuery.trim().length > 0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Assign BDRs</DialogTitle>
                    <DialogDescription>
                        Select BDRs to assign to this request. Changes are saved when you click Save.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden min-h-[300px]">
                    <Command className="rounded-lg border h-full" shouldFilter={true}>
                        <CommandInput
                            placeholder="Search BDRs..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandEmpty>No BDR found.</CommandEmpty>
                        <CommandGroup className="overflow-y-auto max-h-[300px]">
                            {bdrLoading ? (
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            ) : visibleBdrs.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    {searchQuery.trim().length === 0
                                        ? (selectedIds.length > 0 ? "No other BDRs found" : "Type to search BDRs...")
                                        : "No BDRs found"}
                                </div>
                            ) : (
                                visibleBdrs.map((bdr) => {
                                    const isSelected = selectedIds.includes(bdr.id);
                                    return (
                                        <CommandItem
                                            key={bdr.id}
                                            value={bdr.label || bdr.name}
                                            onSelect={() => toggleSelection(bdr.id)}
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <div className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                <span>{bdr.name}</span>
                                            </div>
                                        </CommandItem>
                                    );
                                })
                            )}
                        </CommandGroup>
                    </Command>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assigningBdr}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={assigningBdr || bdrLoading}>
                        {assigningBdr ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
