"use client";

import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
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
    onAssign: (bdrId: string) => void;
    onUnassign: (bdrId: string) => void;
}

export function BDRAssignmentDialog({
    open,
    onOpenChange,
    selectedRequest,
    bdrs,
    bdrLoading,
    assigningBdr,
    onLoadBdrs,
    onAssign,
    onUnassign,
}: BDRAssignmentDialogProps) {
    // Load BDRs when dialog opens
    useEffect(() => {
        if (open) {
            onLoadBdrs();
        }
    }, [open, onLoadBdrs]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign BDR</DialogTitle>
                    <DialogDescription>
                        Search and select a BDR to assign to this request
                    </DialogDescription>
                </DialogHeader>
                <Command className="rounded-lg border">
                    <CommandInput placeholder="Search BDRs..." />
                    <CommandEmpty>No BDR found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
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
                        ) : bdrs.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                No BDRs available
                            </div>
                        ) : (
                            bdrs.map((bdr) => {
                                const isAssigned = selectedRequest?.assigned_bdrs?.some(
                                    (assignedBdr) => assignedBdr.id === bdr.id
                                );
                                return (
                                    <CommandItem
                                        key={bdr.id}
                                        value={bdr.label || bdr.name}
                                        onSelect={() => {
                                            if (isAssigned) {
                                                onUnassign(bdr.id);
                                            } else {
                                                onAssign(bdr.id);
                                            }
                                        }}
                                        disabled={assigningBdr}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${isAssigned ? "opacity-100 text-green-600" : "opacity-0"
                                                }`}
                                        />
                                        <UserCog className="mr-2 h-4 w-4" />
                                        <span className={isAssigned ? "font-semibold" : ""}>
                                            {bdr.label || bdr.name}
                                        </span>
                                        {isAssigned && (
                                            <span className="ml-auto text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                                Assigned
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })
                        )}
                    </CommandGroup>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
