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
import { Check } from "lucide-react";
import type { BDR } from '@/hooks/useRestaurantBDRManagement';

interface RestaurantBDRAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentBdrId: string | null;
    bdrs: BDR[];
    bdrLoading: boolean;
    assigningBdr: boolean;
    onLoadBdrs: () => void;
    onSave: (selectedBdrId: string | null) => void;
}

export function RestaurantBDRAssignmentDialog({
    open,
    onOpenChange,
    currentBdrId,
    bdrs,
    bdrLoading,
    assigningBdr,
    onLoadBdrs,
    onSave,
}: RestaurantBDRAssignmentDialogProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Load BDRs when dialog opens and sync selected ID
    useEffect(() => {
        if (open) {
            onLoadBdrs();
            setSelectedId(currentBdrId);
            setSearchQuery(""); // Reset search on open
        }
    }, [open, onLoadBdrs, currentBdrId]);

    const handleSelect = (bdrId: string) => {
        // Toggle: if already selected, unselect (set to null)
        setSelectedId(prev => prev === bdrId ? null : bdrId);
    };

    const handleSave = () => {
        onSave(selectedId);
    };

    // Filter BDRs based on search
    const visibleBdrs = searchQuery.trim().length > 0 ? bdrs : bdrs;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Assign BDR</DialogTitle>
                    <DialogDescription>
                        Select a BDR to assign to this restaurant. Only one BDR can be assigned.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden min-h-[300px]">
                    <Command className="rounded-lg border h-full" shouldFilter={true}>
                        <CommandInput
                            placeholder="Search BDRs..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        {searchQuery.length > 0 && <CommandEmpty>No BDR found.</CommandEmpty>}
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
                                        ? "Type to search BDRs..."
                                        : "No BDRs found"}
                                </div>
                            ) : (
                                <>
                                    {/* Option to unassign */}
                                    <CommandItem
                                        value="__none__"
                                        onSelect={() => setSelectedId(null)}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${selectedId === null ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span className="text-muted-foreground italic">No BDR assigned</span>
                                        </div>
                                    </CommandItem>

                                    {visibleBdrs.map((bdr) => {
                                        const isSelected = selectedId === bdr.id;
                                        return (
                                            <CommandItem
                                                key={bdr.id}
                                                value={bdr.label || bdr.name}
                                                onSelect={() => handleSelect(bdr.id)}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    <span>{bdr.name}</span>
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </>
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
