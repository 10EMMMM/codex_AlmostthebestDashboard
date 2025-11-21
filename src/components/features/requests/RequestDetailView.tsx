"use client";

import { useState } from "react";
import { FileText, Building2, User, MapPin, Package, UserCog, Calendar, RefreshCw, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { REQUEST_TYPE_COLORS, STATUS_COLORS } from "./constants";
import type { Request } from "./types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentsSection } from "./CommentsSection";
import { BDRAssignmentDialog } from "./BDRAssignmentDialog";
import { useBDRManagement } from "./hooks/useBDRManagement";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RequestDetailViewProps {
    request: Request;
    onRefresh?: () => Promise<void>;
    onClose?: () => void;
}

export function RequestDetailView({ request, onRefresh, onClose }: RequestDetailViewProps) {
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [bdrToUnassign, setBdrToUnassign] = useState<string | null>(null);
    const { updateBdrAssignments, assigningBdr, bdrs, bdrLoading, loadBdrs } = useBDRManagement();

    const handleSaveAssignments = async (newBdrIds: string[]) => {
        const currentBdrIds = request.assigned_bdrs?.map(b => b.id) || [];
        await updateBdrAssignments(request.id, currentBdrIds, newBdrIds, async () => {
            setIsAssignDialogOpen(false);
            if (onRefresh) await onRefresh();
            if (onClose) onClose();
            // Fallback if no callbacks provided (though they should be)
            if (!onRefresh && !onClose) window.location.reload();
        });
    };

    const confirmUnassign = async () => {
        if (!bdrToUnassign) return;

        const currentBdrIds = request.assigned_bdrs?.map(b => b.id) || [];
        const newBdrIds = currentBdrIds.filter(id => id !== bdrToUnassign);

        await updateBdrAssignments(request.id, currentBdrIds, newBdrIds, async () => {
            if (onRefresh) await onRefresh();
            // We intentionally DO NOT call onClose() here to keep the sheet open
            setBdrToUnassign(null);
        });
    };

    return (
        <>
            {/* Type and Status Badges */}
            <div className="flex gap-2 items-center flex-wrap mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${REQUEST_TYPE_COLORS[request.request_type] || "bg-gray-500 text-white"}`}>
                    {request.request_type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status] || "bg-gray-500 text-white"}`}>
                    {request.status}
                </span>
            </div>

            {/* Description */}
            {request.description && (
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                    </h4>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
            )}

            {/* Details Section - All Inline */}
            <div className="space-y-2">
                {request.company && (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-semibold">Company:</span>
                        <span className="text-sm text-muted-foreground">{request.company}</span>
                    </div>
                )}

                {(request.requester_name || request.creator_name) && (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-semibold">Requested For:</span>
                        <span className="text-sm text-muted-foreground">
                            {request.requester_name || request.creator_name}
                        </span>
                    </div>
                )}

                {request.city_name && (
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-semibold">City:</span>
                        <span className="text-sm text-muted-foreground">
                            {request.city_name}{request.city_state && `, ${request.city_state}`}
                        </span>
                    </div>
                )}

                {request.volume !== undefined && request.volume !== null && (
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-semibold">Volume:</span>
                        <span className="text-sm text-muted-foreground">{request.volume}</span>
                    </div>
                )}

                {/* Assigned BDR Badges */}
                <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    <span className="text-sm font-semibold">Assigned BDRs:</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {request.assigned_bdrs && request.assigned_bdrs.length > 0 ? (
                            request.assigned_bdrs.map((bdr) => (
                                <span key={bdr.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 group relative pr-6">
                                    {bdr.name}
                                    <button
                                        onClick={() => setBdrToUnassign(bdr.id)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                                        title="Unassign BDR"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                        )}

                    </div>
                </div>

                {/* Footer Info with Badges */}
                <div className="pt-4 border-t space-y-3"></div>
                {/* Creator Info - Inline */}
                <div className="text-sm text-muted-foreground space-y-1">
                    {request.creator_name && (
                        <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            <span className="font-medium text-foreground">Created by:</span>
                            <span className="font-medium text-foreground">{request.creator_name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium text-foreground">Created:</span>
                        <span className="font-medium">{format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <Separator className="my-6" />
            <CommentsSection request={request} onRefresh={onRefresh} />

            {/* BDR Assignment Dialog */}
            <BDRAssignmentDialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                selectedRequest={request}
                bdrs={bdrs}
                bdrLoading={bdrLoading}
                onLoadBdrs={loadBdrs}
                onSave={handleSaveAssignments}
                assigningBdr={assigningBdr}
            />

            {/* Unassign Confirmation Dialog */}
            <AlertDialog open={!!bdrToUnassign} onOpenChange={(open) => !open && setBdrToUnassign(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unassign BDR?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unassign this BDR from the request?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUnassign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Unassign
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

