import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantCardSkeleton() {
    return (
        <Card className="bg-card rounded-xl p-6 flex flex-col shadow-lg border-0">
            <div className="space-y-3">
                {/* Header with badges */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Details Grid */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/5" />
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-border/50">
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </Card>
    );
}
