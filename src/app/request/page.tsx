"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateRequestForm } from "@/components/features/requests/create-request-form";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Calendar, DollarSign, MapPin, UserCog, Package, Clock, Truck, Edit2, X, Save, UtensilsCrossed, PartyPopper, ChefHat, AlignLeft, Building2, User } from "lucide-react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Request = {
    id: string;
    request_type: string;
    title: string;
    description?: string;
    city_id: string;
    city_name?: string;
    city_state?: string;
    volume?: number;
    need_answer_by?: string;
    delivery_date?: string;
    company?: string;
    status: string;
    created_by: string;
    requester_id: string;
    created_on_behalf: boolean;
    created_at: string;
    creator_name?: string;
    requester_name?: string;
    assigned_bdr_id?: string;
    assigned_bdr_name?: string;
    assigned_bdr_avatar?: string;
    assigned_bdrs?: Array<{
        id: string;
        name: string;
        avatar?: string;
    }>;
};

const REQUEST_TYPE_COLORS: Record<string, string> = {
    RESTAURANT: "bg-emerald-500 text-white",
    EVENT: "bg-blue-500 text-white",
    CUISINE: "bg-purple-500 text-white",
};

const STATUS_COLORS: Record<string, string> = {
    "new": "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    "ongoing": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    "on hold": "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    "done": "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    // Legacy/fallback statuses
    NEW: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    PENDING: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    IN_PROGRESS: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    ON_PROGRESS: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    ON_HOLD: "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    DONE: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    COMPLETED: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    CANCELLED: "bg-gray-500/90 text-white",
    OPEN: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    CLOSED: "bg-slate-500/90 text-white",
};

const REQUEST_TYPE_CONFIG = {
    RESTAURANT: {
        icon: UtensilsCrossed,
    },
    EVENT: {
        icon: PartyPopper,
    },
    CUISINE: {
        icon: ChefHat,
    },
} as const;

function getDaysOld(dateString: string): number {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function RequestCard({ request, onClick }: { request: Request; onClick: () => void }) {
    const daysOld = getDaysOld(request.created_at);
    const isNew = daysOld === 0;

    return (
        <div className="widget">
            <Card
                className="bg-card rounded-xl p-6 flex flex-col shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full border-0"
                onClick={onClick}
            >
                <div className="space-y-4">
                    {/* Header with badges and avatar */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${REQUEST_TYPE_COLORS[request.request_type] || "bg-gray-500 text-white"}`}
                                >
                                    {request.request_type}
                                </span>
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[request.status] || "bg-gray-500 text-white"}`}
                                >
                                    {request.status}
                                </span>
                                {isNew && (
                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                                        New ✨
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-xl line-clamp-2 mb-2">{request.title}</h3>
                        </div>
                        {/* BDR Avatar(s) */}
                        <div className="flex flex-col items-center gap-1">
                            {request.assigned_bdrs && request.assigned_bdrs.length > 0 ? (
                                <>
                                    {request.assigned_bdrs.length === 1 ? (
                                        // Single BDR
                                        <>
                                            <div className="h-12 w-12 rounded-full border-2 border-primary overflow-hidden">
                                                {request.assigned_bdrs[0].avatar ? (
                                                    <img
                                                        src={request.assigned_bdrs[0].avatar}
                                                        alt={request.assigned_bdrs[0].name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-primary/20">
                                                        <UserCog className="h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium text-center">
                                                {request.assigned_bdrs[0].name}
                                            </span>
                                        </>
                                    ) : (
                                        // Multiple BDRs - Stacked avatars
                                        <>
                                            <div className="relative h-12 w-16">
                                                {request.assigned_bdrs.slice(0, 2).map((bdr, idx) => (
                                                    <div
                                                        key={bdr.id}
                                                        className="absolute h-10 w-10 rounded-full border-2 border-background overflow-hidden"
                                                        style={{
                                                            left: `${idx * 24}px`,
                                                            zIndex: 2 - idx,
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        {bdr.avatar ? (
                                                            <img
                                                                src={bdr.avatar}
                                                                alt={bdr.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-primary/20">
                                                                <UserCog className="h-5 w-5 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {request.assigned_bdrs.length > 2 && (
                                                    <div
                                                        className="absolute h-10 w-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground"
                                                        style={{
                                                            left: '48px',
                                                            zIndex: 0,
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        +{request.assigned_bdrs.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-primary font-semibold text-center bg-primary/10 px-2 py-0.5 rounded-full">
                                                Team ({request.assigned_bdrs.length})
                                            </span>
                                        </>
                                    )}
                                </>
                            ) : request.assigned_bdr_avatar ? (
                                // Fallback to single BDR fields (backward compatibility)
                                <>
                                    <div className="h-12 w-12 rounded-full border-2 border-primary overflow-hidden">
                                        <img
                                            src={request.assigned_bdr_avatar}
                                            alt={request.assigned_bdr_name || "BDR"}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    {request.assigned_bdr_name && (
                                        <span className="text-xs text-muted-foreground font-medium text-center">
                                            {request.assigned_bdr_name}
                                        </span>
                                    )}
                                </>
                            ) : (
                                // No BDR assigned
                                <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted">
                                    <UserCog className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {request.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {request.description}
                        </p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 text-sm">
                        {/* Requested for/by and Company */}
                        <div className="text-sm space-y-1">
                            {request.company && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-4 w-4 flex-shrink-0" />
                                    <span>Company: {request.company}</span>
                                </div>
                            )}
                            {request.requester_name && (
                                <div className="flex items-center gap-2 text-foreground">
                                    <User className="h-4 w-4 flex-shrink-0" />
                                    <span>Requested for: {request.requester_name}</span>
                                </div>
                            )}
                            {!request.requester_name && request.creator_name && (
                                <div className="flex items-center gap-2 text-foreground">
                                    <User className="h-4 w-4 flex-shrink-0" />
                                    <span>Requested by: {request.creator_name}</span>
                                </div>
                            )}
                            {request.city_name && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium">
                                        {request.city_name}
                                        {request.city_state && `, ${request.city_state}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {request.volume !== undefined && request.volume !== null && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                                    <Package className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="font-medium">{request.volume}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border text-xs space-y-2">
                        {/* Date badges */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {(() => {
                                const now = new Date();
                                const needAnswerByDate = request.need_answer_by ? new Date(request.need_answer_by) : null;
                                const isOverdueForReply = needAnswerByDate && now > needAnswerByDate;
                                const badgeColor = isOverdueForReply
                                    ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                    : "bg-primary/10 text-primary";

                                return (
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                            {isNew ? (
                                                <span>Just created</span>
                                            ) : (
                                                `${daysOld}d old`
                                            )}
                                        </span>
                                    </div>
                                );
                            })()}
                            {request.need_answer_by && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="font-medium">Reply: {format(new Date(request.need_answer_by), "MMM d")}</span>
                                </div>
                            )}
                            {request.delivery_date && (() => {
                                const now = new Date();
                                const deliveryDate = new Date(request.delivery_date);
                                const isOverdue = now > deliveryDate;
                                const badgeColor = isOverdue
                                    ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400";

                                return (
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                                        <Truck className="h-3.5 w-3.5" />
                                        <span className="font-medium">Due {format(deliveryDate, "MMM d")}</span>
                                    </div>
                                );
                            })()}
                        </div>

                        {request.created_on_behalf && request.requester_name && (
                            <div className="flex items-center gap-2 text-primary">
                                <UserCog className="h-3.5 w-3.5" />
                                <span className="font-medium">Created by admin for {request.requester_name}</span>
                            </div>
                        )}

                    </div>
                </div>
            </Card>
        </div>
    );
}

const RequestListCard = dynamic(
    () =>
        Promise.resolve(
            ({ requests, loading }: { requests: Request[]; loading: boolean }) => (
                <div className="widget">
                    <Card className="border border-white/15 p-6">
                        <h3 className="text-lg font-semibold mb-4">All Requests ({requests.length})</h3>
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2 p-3 border border-white/10 rounded-lg">
                                        <div className="flex gap-2">
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                        <Skeleton className="h-5 w-2/3" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No requests found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Create your first request to get started
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Click on a request card to view details
                            </p>
                        )}
                    </Card>
                </div>
            )
        ),
    { ssr: false }
);

export default function RequestPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [showDetailSheet, setShowDetailSheet] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        request_type: "",
        volume: undefined as number | undefined,
        need_answer_by: undefined as Date | undefined,
        delivery_date: undefined as Date | undefined,
        company: "",
    });
    const [saving, setSaving] = useState(false);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/requests", {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch requests");

            const data = await response.json();
            setRequests(data.requests || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRequestClick = (request: Request) => {
        setSelectedRequest(request);
        setEditFormData({
            title: request.title,
            description: request.description || "",
            request_type: request.request_type,
            volume: request.volume,
            need_answer_by: request.need_answer_by ? new Date(request.need_answer_by) : undefined,
            delivery_date: request.delivery_date ? new Date(request.delivery_date) : undefined,
            company: request.company || "",
        });
        setIsEditing(false);
        setShowDetailSheet(true);
    };

    const handleSave = async () => {
        if (!selectedRequest) return;

        if (!editFormData.title.trim()) {
            toast({
                title: "Validation Error",
                description: "Title is required",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const supabase = (window as any).supabase;
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/admin/update-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    request_id: selectedRequest.id,
                    updates: {
                        title: editFormData.title.trim(),
                        description: editFormData.description.trim() || null,
                        request_type: editFormData.request_type,
                        volume: editFormData.volume ?? null,
                        need_answer_by: editFormData.need_answer_by
                            ? format(editFormData.need_answer_by, "yyyy-MM-dd")
                            : null,
                        delivery_date: editFormData.delivery_date
                            ? format(editFormData.delivery_date, "yyyy-MM-dd")
                            : null,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update request");
            }

            toast({
                title: "Success",
                description: "Request updated successfully",
            });

            setIsEditing(false);
            loadRequests();
            handleCloseDetailSheet();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseDetailSheet = () => {
        setShowDetailSheet(false);
        setIsEditing(false);
        // Small delay before clearing selected request to allow sheet animation
        setTimeout(() => setSelectedRequest(null), 300);
    };

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    if (authLoading) return <SplashScreen />;
    if (!user) return <ErrorSplashScreen message="Please log in" actionText="Go to Login" onActionClick={() => window.location.href = '/'} />;

    return (
        <>
            {/* Page wordmark */}
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                Requests
            </div>
            <DashboardLayout title="">

                {/* Viewport wrapper with scaling */}
                <div className="relative w-full h-full">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: '5%' }}>
                            <div className="mx-auto max-w-7xl">
                                {/* Create Request Button */}
                                <div className="mb-6">
                                    <Button onClick={() => setShowCreateModal(true)} size="lg">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Create New Request
                                    </Button>
                                </div>

                                <div className="dashboard-grid">

                                    {loading ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="widget">
                                                <Card className="bg-card rounded-xl p-6 flex flex-col shadow-lg h-full border-0">
                                                    <div className="space-y-4">
                                                        {/* Header badges */}
                                                        <div className="flex gap-2 mb-3">
                                                            <Skeleton className="h-6 w-24 rounded-full" />
                                                            <Skeleton className="h-6 w-20 rounded-full" />
                                                        </div>
                                                        {/* Title */}
                                                        <Skeleton className="h-7 w-3/4" />
                                                        {/* Description */}
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-full" />
                                                            <Skeleton className="h-4 w-5/6" />
                                                            <Skeleton className="h-4 w-4/6" />
                                                        </div>
                                                        {/* Details */}
                                                        <div className="space-y-3">
                                                            <Skeleton className="h-4 w-32" />
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <Skeleton className="h-4 w-24" />
                                                                <Skeleton className="h-4 w-28" />
                                                            </div>
                                                        </div>
                                                        {/* Footer */}
                                                        <div className="pt-4 border-t border-border">
                                                            <div className="flex items-center justify-between">
                                                                <Skeleton className="h-3 w-24" />
                                                                <Skeleton className="h-3 w-20" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        ))
                                    ) : (
                                        requests.map((request) => (
                                            <RequestCard
                                                key={request.id}
                                                request={request}
                                                onClick={() => handleRequestClick(request)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Request Detail Sheet */}
                {selectedRequest && (
                    <Sheet open={showDetailSheet} onOpenChange={handleCloseDetailSheet}>
                        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                            <SheetHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <SheetTitle className="text-2xl">{selectedRequest.title}</SheetTitle>
                                        <SheetDescription className="mt-2">
                                            {isEditing ? "Edit request details" : "View request details"}
                                        </SheetDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            size="sm"
                                            className="ml-4"
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {!isEditing ? (
                                    // VIEW MODE
                                    <>
                                        {/* Type and Status Badges */}
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${REQUEST_TYPE_COLORS[selectedRequest.request_type] || "bg-gray-500 text-white"}`}>
                                                {selectedRequest.request_type}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedRequest.status] || "bg-gray-500 text-white"}`}>
                                                {selectedRequest.status}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {selectedRequest.description && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Description
                                                </h4>
                                                <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                                            </div>
                                        )}

                                        {/* Details Section */}
                                        <div className="space-y-4">
                                            {selectedRequest.company && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <Building2 className="h-4 w-4" />
                                                        Company
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">{selectedRequest.company}</p>
                                                </div>
                                            )}

                                            {(selectedRequest.requester_name || selectedRequest.creator_name) && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span className="text-sm font-semibold">Requested For:</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {selectedRequest.requester_name || selectedRequest.creator_name}
                                                    </span>
                                                </div>
                                            )}

                                            {selectedRequest.city_name && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="text-sm font-semibold">City:</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {selectedRequest.city_name}{selectedRequest.city_state && `, ${selectedRequest.city_state}`}
                                                    </span>
                                                </div>
                                            )}

                                            {selectedRequest.volume !== undefined && selectedRequest.volume !== null && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        Volume
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">{selectedRequest.volume}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Info with Badges */}
                                        <div className="pt-4 border-t space-y-3">
                                            {/* Date Badges Row */}
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const daysOld = getDaysOld(selectedRequest.created_at);
                                                    const isNew = daysOld === 0;
                                                    const now = new Date();
                                                    const needAnswerByDate = selectedRequest.need_answer_by ? new Date(selectedRequest.need_answer_by) : null;
                                                    const isOverdueForReply = needAnswerByDate && now > needAnswerByDate;
                                                    const badgeColor = isOverdueForReply
                                                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                                        : "bg-primary/10 text-primary";

                                                    return (
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span className="font-medium">
                                                                {isNew ? (
                                                                    <span>Just created</span>
                                                                ) : (
                                                                    `${daysOld}d old`
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                                {selectedRequest.need_answer_by && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="font-medium">Reply: {format(new Date(selectedRequest.need_answer_by), "MMM d")}</span>
                                                    </div>
                                                )}
                                                {selectedRequest.delivery_date && (() => {
                                                    const now = new Date();
                                                    const deliveryDate = new Date(selectedRequest.delivery_date);
                                                    const isOverdue = now > deliveryDate;
                                                    const badgeColor = isOverdue
                                                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                                        : "bg-blue-500/10 text-blue-700 dark:text-blue-400";

                                                    return (
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                                                            <Truck className="h-3.5 w-3.5" />
                                                            <span className="font-medium">Due {format(deliveryDate, "MMM d")}</span>
                                                        </div>
                                                    );
                                                })()}
                                                {selectedRequest.volume !== undefined && selectedRequest.volume !== null && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                                                        <Package className="h-3.5 w-3.5" />
                                                        <span className="font-medium">{selectedRequest.volume}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Creator/Requester Info */}
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {selectedRequest.creator_name && (
                                                    <p className="flex items-center gap-2">
                                                        <UserCog className="h-4 w-4" />
                                                        <span className="font-medium text-foreground">{selectedRequest.creator_name}</span>
                                                    </p>
                                                )}
                                                <p>Created: <span className="font-medium">{format(new Date(selectedRequest.created_at), "MMM d, yyyy 'at' h:mm a")}</span></p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // EDIT MODE
                                    <div className="space-y-6">
                                        {/* Request Type */}
                                        <div className="space-y-3">
                                            <Label>Request Type <span className="text-destructive">*</span></Label>
                                            <TooltipProvider>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {(["RESTAURANT", "EVENT", "CUISINE"] as const).map((type) => {
                                                        const config = REQUEST_TYPE_CONFIG[type];
                                                        const Icon = config.icon;
                                                        return (
                                                            <Tooltip key={type}>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant={editFormData.request_type === type ? "default" : "outline"}
                                                                        onClick={() => setEditFormData({ ...editFormData, request_type: type })}
                                                                        className="h-12 w-full flex items-center justify-center"
                                                                    >
                                                                        <Icon className="h-6 w-6" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{type}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </div>
                                            </TooltipProvider>
                                        </div>

                                        {/* Title */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <Label htmlFor="edit-title">Title <span className="text-destructive">*</span></Label>
                                            </div>
                                            <Input
                                                id="edit-title"
                                                value={editFormData.title}
                                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                                placeholder="Enter request title..."
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                                                <Label htmlFor="edit-description">Description <span className="text-muted-foreground">(optional)</span></Label>
                                            </div>
                                            <Textarea
                                                id="edit-description"
                                                value={editFormData.description}
                                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                placeholder="Provide additional details..."
                                                rows={3}
                                            />
                                        </div>

                                        <Separator />

                                        {/* Volume and Dates Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Volume */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <Label htmlFor="edit-volume">Volume <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                                </div>
                                                <Input
                                                    id="edit-volume"
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={editFormData.volume ?? ""}
                                                    onChange={(e) => setEditFormData({
                                                        ...editFormData,
                                                        volume: e.target.value ? Number(e.target.value) : undefined
                                                    })}
                                                    placeholder="0"
                                                />
                                            </div>

                                            {/* Dates Stacked */}
                                            <div className="space-y-4">
                                                {/* Company */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <Label>Company <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                                    </div>
                                                    <Input
                                                        value={editFormData.company || ""}
                                                        onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                                                        placeholder="Enter company name"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                onClick={() => setIsEditing(false)}
                                                variant="outline"
                                                className="flex-1"
                                                disabled={saving}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                className="flex-1"
                                                disabled={saving}
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {saving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                )}

                {/* Create Request Sheet */}
                <Sheet open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Create New Request</SheetTitle>
                            <SheetDescription>
                                Fill out the form below to create a new request
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                            <CreateRequestForm
                                onCancel={() => setShowCreateModal(false)}
                                onCreated={() => {
                                    setShowCreateModal(false);
                                    loadRequests();
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </DashboardLayout>
        </>
    );
}
