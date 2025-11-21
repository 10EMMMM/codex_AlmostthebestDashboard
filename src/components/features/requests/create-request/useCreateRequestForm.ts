import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { format } from "date-fns";
import { CreateRequestFormData, City, AccountManager } from "./types";

export function useCreateRequestForm(onCreated?: () => void) {
    const [formData, setFormData] = useState<CreateRequestFormData>({
        selectedAM: "",
        requestType: "",
        title: "",
        description: "",
        cityId: "",
        volume: undefined,
        need_answer_by: undefined,
        delivery_date: undefined,
        company: undefined,
    });

    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
    const [amLoading, setAmLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const { toast } = useToast();
    const { user } = useAuth();
    const canCreateForOthers = useFeatureFlag('proxy_request_creation');

    // Load Account Managers
    useEffect(() => {
        if (!canCreateForOthers) return;

        const loadAccountManagers = async () => {
            setAmLoading(true);
            try {
                const supabase = (window as any).supabase;
                if (!supabase) return;

                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch('/api/admin/account-managers', {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAccountManagers(data.accountManagers || []);
                }
            } catch (error) {
                console.error('Error loading account managers:', error);
            } finally {
                setAmLoading(false);
            }
        };

        loadAccountManagers();
    }, [canCreateForOthers]);

    // Load cities
    useEffect(() => {
        if (!user) return;

        const targetUserId = canCreateForOthers && formData.selectedAM ? formData.selectedAM : user.id;

        if (canCreateForOthers && !formData.selectedAM) {
            setCities([]);
            return;
        }

        const loadCitiesForUser = async (userId: string) => {
            setCitiesLoading(true);
            try {
                const supabase = (window as any).supabase;
                if (!supabase) {
                    console.error("Supabase client not initialized");
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch(`/api/admin/user-cities?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching cities from API:", await response.text());
                    setCities([]);
                    return;
                }

                const data = await response.json();

                if (data.cities && data.cities.length > 0) {
                    setCities(data.cities);
                } else {
                    setCities([]);
                }
            } catch (error) {
                console.error("Error loading cities:", error);
                setCities([]);
            } finally {
                setCitiesLoading(false);
            }
        };

        loadCitiesForUser(targetUserId);
    }, [user, formData.selectedAM, canCreateForOthers]);

    const updateFormData = (field: keyof CreateRequestFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === "selectedAM") {
            setFormData(prev => ({ ...prev, cityId: "" }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.requestType) {
            toast({
                title: "Request Type Required",
                description: "Please select a request type",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.title.trim()) {
            toast({
                title: "Title Required",
                description: "Please enter a request title",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.cityId) {
            toast({
                title: "City Required",
                description: "Please select a city",
                variant: "destructive",
            });
            return false;
        }

        if (canCreateForOthers && !formData.selectedAM) {
            toast({
                title: "Account Manager Required",
                description: "Please select an Account Manager",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const submitForm = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const supabase = (window as any).supabase;
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/admin/create-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    request_type: formData.requestType,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    city_id: formData.cityId,
                    volume: formData.volume,
                    need_answer_by: formData.need_answer_by ? format(formData.need_answer_by, "yyyy-MM-dd") : undefined,
                    delivery_date: formData.delivery_date ? format(formData.delivery_date, "yyyy-MM-dd") : undefined,
                    company: formData.company?.trim() || undefined,
                    requested_by: canCreateForOthers && formData.selectedAM ? formData.selectedAM : undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create request");
            }

            toast({
                title: "Request Created",
                description: `Successfully created ${formData.requestType} request`,
                variant: "success",
            });

            setFormData({
                selectedAM: "",
                requestType: "",
                title: "",
                description: "",
                cityId: "",
                volume: undefined,
                need_answer_by: undefined,
                delivery_date: undefined,
                company: undefined,
            });

            onCreated?.();
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

    return {
        formData,
        updateFormData,
        cities,
        loading,
        accountManagers,
        amLoading,
        citiesLoading,
        canCreateForOthers,
        submitForm,
    };
}
