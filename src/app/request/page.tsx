"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateRequestForm } from "@/components/features/requests/create-request-form";
import { RequestCard } from "@/components/features/requests/RequestCard";
import { KanbanColumn } from "@/components/features/requests/KanbanColumn";
import { RequestDetailView } from "@/components/features/requests/RequestDetailView";
import { RequestEditForm } from "@/components/features/requests/RequestEditForm";
import { BDRAssignmentDialog } from "@/components/features/requests/BDRAssignmentDialog";
import { StatusUpdateDialog } from "@/components/features/requests/StatusUpdateDialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useRequests } from "@/hooks/useRequests";
import { useRequestDetail } from "@/hooks/useRequestDetail";
import { useBdrAssignment } from "@/hooks/useBdrAssignment";
import { useCities } from "@/hooks/useCities";
import { useAccountManagers } from "@/hooks/useAccountManagers";
import { FileText, Plus, UserCog, Edit2 } from "lucide-react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";
import { format } from "date-fns";
import type { Request, BDR } from "@/components/features/requests/types";





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
    const canEditForOthers = useFeatureFlag('proxy_request_creation');

    // UI state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bdrSearchOpen, setBdrSearchOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Custom hooks for business logic
    const { requests, loading, loadRequests } = useRequests();
    const {
        selectedRequest,
        showDetailSheet,
        isEditing,
        editFormData,
        saving,
        handleRequestClick,
        handleCloseDetailSheet,
        setIsEditing,
        setEditFormData,
        handleSave,
    } = useRequestDetail(loadRequests);

    const { bdrs, bdrLoading, assigningBdr, loadBdrs, assignBdr, unassignBdr } =
        useBdrAssignment(selectedRequest, loadRequests);

    const { cities, citiesLoading, loadCities } = useCities();
    const { accountManagers, amLoading, loadAccountManagers } = useAccountManagers();

    // Load requests on mount
    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    // Load cities when entering edit mode or changing AM
    useEffect(() => {
        if (isEditing && editFormData.selectedAM) {
            loadCities(editFormData.selectedAM);
        }
    }, [isEditing, editFormData.selectedAM]);

    // Load account managers when entering edit mode (for super admins)
    useEffect(() => {
        if (!canEditForOthers || !isEditing) return;
        loadAccountManagers();
    }, [canEditForOthers, isEditing]);

    // Status update handler
    const updateStatus = async (newStatus: string) => {
        if (!selectedRequest) return;

        setUpdatingStatus(true);
        try {
            const supabase = (window as any).supabase;
            if (!supabase) {
                throw new Error("Supabase client not initialized");
            }

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
                        status: newStatus,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update status");
            }

            toast({
                title: "Success",
                description: "Status updated successfully",
            });

            // Reload requests to get updated data
            await loadRequests();
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update status",
                variant: "destructive",
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Load BDRs when detail sheet opens
    useEffect(() => {
        if (showDetailSheet && selectedRequest) {
            loadBdrs();
        }
    }, [showDetailSheet, selectedRequest]);

    // Load BDRs when BDR assignment dialog opens
    useEffect(() => {
        if (bdrSearchOpen) {
            loadBdrs();
        }
    }, [bdrSearchOpen]);

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
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: '5%' }}>
                            <div className="mx-auto max-w-[1600px] relative z-20">
                                {/* Create Request Button */}
                                <div className="mb-6">
                                    <Button onClick={() => setShowCreateModal(true)} size="lg">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Create New Request
                                    </Button>
                                </div>

                                {/* Kanban Board - Responsive 4 Columns with min 300px width */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {/* Column 1: NEW */}
                                    <KanbanColumn
                                        title="NEW"
                                        borderColor="border-green-500"
                                        textColor="text-green-600 dark:text-green-400"
                                        count={requests.filter(r => r.status === 'new').length}
                                        loading={loading}
                                        requests={requests.filter(request => request.status === 'new')}
                                        onRequestClick={handleRequestClick}
                                    />

                                    {/* Column 2: ONGOING */}
                                    <KanbanColumn
                                        title="ONGOING"
                                        borderColor="border-blue-500"
                                        textColor="text-blue-600 dark:text-blue-400"
                                        count={requests.filter(r => r.status === 'ongoing').length}
                                        loading={loading}
                                        requests={requests.filter(request => request.status === 'ongoing')}
                                        onRequestClick={handleRequestClick}
                                    />

                                    {/* Column 3: ON HOLD */}
                                    <KanbanColumn
                                        title="ON HOLD"
                                        borderColor="border-orange-500"
                                        textColor="text-orange-600 dark:text-orange-400"
                                        count={requests.filter(r => r.status === 'on hold').length}
                                        loading={loading}
                                        requests={requests.filter(request => request.status === 'on hold')}
                                        onRequestClick={handleRequestClick}
                                    />

                                    {/* Column 4: DONE */}
                                    <KanbanColumn
                                        title="DONE"
                                        borderColor="border-purple-500"
                                        textColor="text-purple-600 dark:text-purple-400"
                                        count={requests.filter(r => r.status === 'done').length}
                                        loading={loading}
                                        requests={requests.filter(request => request.status === 'done')}
                                        onRequestClick={handleRequestClick}
                                    />
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
                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                onClick={() => setBdrSearchOpen(true)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <UserCog className="h-4 w-4 mr-2" />
                                                Assign BDR
                                            </Button>
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="outline"
                                                size="icon"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {!isEditing ? (
                                    // VIEW MODE
                                    <RequestDetailView
                                        request={selectedRequest}
                                        onStatusUpdateClick={() => setStatusDialogOpen(true)}
                                    />
                                ) : (
                                    // EDIT MODE
                                    <RequestEditForm
                                        formData={editFormData}
                                        onChange={setEditFormData}
                                        onSave={handleSave}
                                        onCancel={() => setIsEditing(false)}
                                        saving={saving}
                                        canEditForOthers={canEditForOthers}
                                        accountManagers={accountManagers}
                                        cities={cities}
                                        amLoading={amLoading}
                                        citiesLoading={citiesLoading}
                                    />
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

                {/* BDR Assignment Dialog */}
                <BDRAssignmentDialog
                    open={bdrSearchOpen}
                    onOpenChange={setBdrSearchOpen}
                    selectedRequest={selectedRequest}
                    bdrs={bdrs}
                    bdrLoading={bdrLoading}
                    assigningBdr={assigningBdr}
                    onLoadBdrs={loadBdrs}
                    onAssign={assignBdr}
                    onUnassign={unassignBdr}
                />

                {/* Status Update Dialog */}
                {selectedRequest && (
                    <StatusUpdateDialog
                        open={statusDialogOpen}
                        onOpenChange={setStatusDialogOpen}
                        currentStatus={selectedRequest.status}
                        onStatusUpdate={updateStatus}
                        loading={updatingStatus}
                    />
                )}
            </DashboardLayout>
        </>
    );
}
