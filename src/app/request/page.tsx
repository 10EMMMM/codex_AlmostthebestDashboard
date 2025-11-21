"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateRequestForm } from "@/components/features/requests/create-request-form";
import { RequestCard } from "@/components/features/requests/RequestCard";
import { KanbanColumn } from "@/components/features/requests/KanbanColumn";
import { RequestDetailView } from "@/components/features/requests/RequestDetailView";
import { RequestEditForm } from "@/components/features/requests/RequestEditForm";
import { BDRAssignmentDialog } from "@/components/features/requests/BDRAssignmentDialog";
import { StatusUpdateDialog } from "@/components/features/requests/StatusUpdateDialog";
import { FilterBar } from "@/components/features/requests/FilterBar";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useRequests } from "@/hooks/useRequests";
import { useRequestDetail } from "@/hooks/useRequestDetail";
import { useBDRManagement } from "@/components/features/requests/hooks/useBDRManagement";
import { useCities } from "@/hooks/useCities";
import { useAccountManagers } from "@/hooks/useAccountManagers";
import { useRequestFilters } from "@/hooks/useRequestFilters";
import { Plus, UserCog, Edit2, RefreshCw, MoreHorizontal } from "lucide-react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";
import type { Request, RequestFilters } from "@/components/features/requests/types";

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
    const { filters, setFilters, filteredRequests } = useRequestFilters(requests);

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
    } = useRequestDetail(loadRequests, requests);

    const { bdrs, bdrLoading, assigningBdr, loadBdrs, updateBdrAssignments } = useBDRManagement();

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

    // Handle status update
    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedRequest) return;

        try {
            setUpdatingStatus(true);
            const response = await fetch("/api/admin/update-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedRequest.id,
                    status: newStatus,
                }),
            });

            if (!response.ok) throw new Error("Failed to update status");

            toast({
                title: "Status Updated",
                description: `Request status changed to ${newStatus}`,
                variant: "success",
            });

            setStatusDialogOpen(false);
            await loadRequests();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update request status",
                variant: "destructive",
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

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
                                {/* Filter Bar with Create Button */}
                                <div className="mb-6">
                                    <FilterBar
                                        onFilterChange={setFilters}
                                        activeFilters={filters}
                                        onCreateRequest={() => setShowCreateModal(true)}
                                    />
                                </div>

                                {/* Kanban Board - Responsive 4 Columns with min 300px width */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {/* Column 1: NEW */}
                                    <KanbanColumn
                                        title="NEW"
                                        borderColor="border-green-500"
                                        textColor="text-green-600 dark:text-green-400"
                                        count={filteredRequests.filter(r => r.status === 'new').length}
                                        loading={loading}
                                        requests={filteredRequests.filter(request => request.status === 'new')}
                                        onRequestClick={handleRequestClick}
                                    />

                                    {/* Column 2: ONGOING */}
                                    <KanbanColumn
                                        title="ONGOING"
                                        borderColor="border-blue-500"
                                        textColor="text-blue-600 dark:text-blue-400"
                                        count={filteredRequests.filter(r => r.status === 'ongoing').length}
                                        loading={loading}
                                        requests={filteredRequests.filter(request => request.status === 'ongoing')}
                                        onRequestClick={handleRequestClick}
                                    />

                                    {/* Column 3: ON HOLD */}
                                    <KanbanColumn
                                        title="ON HOLD"
                                        borderColor="border-orange-500"
                                        textColor="text-orange-600 dark:text-orange-400"
                                        count={filteredRequests.filter(r => r.status === 'on hold').length}
                                        loading={loading}
                                        requests={filteredRequests.filter(request => request.status === 'on hold')}
                                        onRequestClick={handleRequestClick}
                                    />

                                    {/* Column 4: DONE */}
                                    <KanbanColumn
                                        title="DONE"
                                        borderColor="border-purple-500"
                                        textColor="text-purple-600 dark:text-purple-400"
                                        count={filteredRequests.filter(r => r.status === 'done').length}
                                        loading={loading}
                                        requests={filteredRequests.filter(request => request.status === 'done')}
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                                        Actions
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Change Status
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setBdrSearchOpen(true)}>
                                                        <UserCog className="h-4 w-4 mr-2" />
                                                        Assign BDR
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                        <Edit2 className="h-4 w-4 mr-2" />
                                                        Edit Request
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </SheetHeader>

                            <div className="mt-6">
                                {isEditing ? (
                                    <RequestEditForm
                                        formData={editFormData}
                                        onChange={setEditFormData}
                                        onSave={handleSave}
                                        onCancel={() => setIsEditing(false)}
                                        saving={saving}
                                        cities={cities}
                                        citiesLoading={citiesLoading}
                                        accountManagers={accountManagers}
                                        amLoading={amLoading}
                                        canEditForOthers={canEditForOthers}
                                    />
                                ) : (
                                    <RequestDetailView
                                        request={selectedRequest}
                                        onRefresh={loadRequests}
                                        onClose={handleCloseDetailSheet}
                                    />
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                )}

                {/* BDR Assignment Dialog */}
                <BDRAssignmentDialog
                    open={bdrSearchOpen}
                    onOpenChange={setBdrSearchOpen}
                    selectedRequest={selectedRequest}
                    bdrs={bdrs}
                    bdrLoading={bdrLoading}
                    assigningBdr={assigningBdr}
                    onLoadBdrs={loadBdrs}
                    onSave={async (newBdrIds) => {
                        if (!selectedRequest) return;
                        const currentBdrIds = selectedRequest.assigned_bdrs?.map(b => b.id) || [];
                        await updateBdrAssignments(selectedRequest.id, currentBdrIds, newBdrIds, async () => {
                            setBdrSearchOpen(false);
                            await loadRequests();
                        });
                    }}
                />

                {/* Status Update Dialog */}
                {selectedRequest && (
                    <StatusUpdateDialog
                        open={statusDialogOpen}
                        onOpenChange={setStatusDialogOpen}
                        currentStatus={selectedRequest.status}
                        onStatusUpdate={async (newStatus) => {
                            await handleStatusUpdate(newStatus);
                        }}
                        loading={updatingStatus}
                    />
                )}

                {/* Create Request Modal */}
                {showCreateModal && (
                    <Sheet open={showCreateModal} onOpenChange={setShowCreateModal}>
                        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Create New Request</SheetTitle>
                                <SheetDescription>
                                    Fill in the details to create a new request
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                                <CreateRequestForm
                                    onCancel={() => setShowCreateModal(false)}
                                    onCreated={() => {
                                        loadRequests();
                                        setShowCreateModal(false);
                                    }}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </DashboardLayout>
        </>
    );
}
