import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUS_OPTIONS, getAllowedStatusTransitions } from "./constants";
import { useState, useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface StatusUpdateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: string;
    onStatusUpdate: (newStatus: string) => Promise<void>;
    loading: boolean;
}

export function StatusUpdateDialog({
    open,
    onOpenChange,
    currentStatus,
    onStatusUpdate,
    loading,
}: StatusUpdateDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    // Get allowed transitions based on current status
    const allowedTransitions = useMemo(() =>
        getAllowedStatusTransitions(currentStatus),
        [currentStatus]
    );

    const handleUpdate = async () => {
        if (selectedStatus === currentStatus) {
            onOpenChange(false);
            return;
        }

        await onStatusUpdate(selectedStatus);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Request Status</DialogTitle>
                    <DialogDescription>
                        Change the status of this request. The request will automatically move to the corresponding column.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium">Current Status:</label>
                        <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_OPTIONS.find(s => s.value === currentStatus)?.color || 'bg-gray-500 text-white'}`}>
                            {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
                        </div>
                    </div>

                    {allowedTransitions.length === 0 ? (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        No status changes available
                                    </p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                        This request is marked as "done" and cannot be changed to another status.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Status</label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allowedTransitions.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                                    <span>{status.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedStatus !== currentStatus && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Status will change from <span className="font-semibold">{STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}</span> to <span className="font-semibold">{STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}</span>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {allowedTransitions.length === 0 ? 'Close' : 'Cancel'}
                    </Button>
                    {allowedTransitions.length > 0 && (
                        <Button
                            onClick={handleUpdate}
                            disabled={loading || selectedStatus === currentStatus}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Status
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
