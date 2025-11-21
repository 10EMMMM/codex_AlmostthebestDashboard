import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Request, EditFormData } from "@/components/features/requests/types";

/**
 * Custom hook for managing request detail sheet and edit functionality
 * 
 * @param onRequestsChange - Callback to refresh requests after updates
 * @returns Object containing detail sheet state, form data, and handler functions
 */
export function useRequestDetail(onRequestsChange: () => Promise<void>) {
    const { toast } = useToast();
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [showDetailSheet, setShowDetailSheet] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<EditFormData>({
        selectedAM: "",
        cityId: "",
        title: "",
        description: "",
        request_type: "",
        volume: undefined,
        need_answer_by: undefined,
        delivery_date: undefined,
        company: "",
    });
    const [saving, setSaving] = useState(false);

    const handleRequestClick = (request: Request) => {
        setSelectedRequest(request);
        setEditFormData({
            selectedAM: request.requester_id,
            cityId: request.city_id,
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
                        city_id: editFormData.cityId,
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
            await onRequestsChange();
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

    return {
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
    };
}
