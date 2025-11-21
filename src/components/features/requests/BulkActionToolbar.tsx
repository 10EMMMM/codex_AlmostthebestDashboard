import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, X } from "lucide-react";

interface BulkActionToolbarProps {
    selectedCount: number;
    onAssignBDR: () => void;
    onClearSelection: () => void;
}

export function BulkActionToolbar({
    selectedCount,
    onAssignBDR,
    onClearSelection
}: BulkActionToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
            <Card className="px-6 py-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur">
                <div className="flex items-center gap-4">
                    <span className="font-medium text-sm">
                        <span className="text-primary font-semibold">{selectedCount}</span>
                        {' '}request{selectedCount > 1 ? 's' : ''} selected
                    </span>
                    <Button onClick={onAssignBDR} size="sm">
                        <UserCog className="mr-2 h-4 w-4" />
                        Assign BDR
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearSelection}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Clear Selection
                    </Button>
                </div>
            </Card>
        </div>
    );
}
