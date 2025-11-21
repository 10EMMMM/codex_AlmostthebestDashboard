"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreateRequestForm } from "./create-request/useCreateRequestForm";
import { LocationSelector } from "./create-request/LocationSelector";
import { RequestTypeSelector } from "./create-request/RequestTypeSelector";
import { RequestDetailsInputs } from "./create-request/RequestDetailsInputs";

export function CreateRequestForm({
    onCancel,
    onCreated,
}: {
    onCancel?: () => void;
    onCreated?: () => void;
}) {
    const {
        formData,
        updateFormData,
        cities,
        loading,
        accountManagers,
        amLoading,
        citiesLoading,
        canCreateForOthers,
        submitForm,
    } = useCreateRequestForm(onCreated);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitForm();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <LocationSelector
                canCreateForOthers={canCreateForOthers}
                selectedAM={formData.selectedAM}
                cityId={formData.cityId}
                accountManagers={accountManagers}
                cities={cities}
                amLoading={amLoading}
                citiesLoading={citiesLoading}
                onAMChange={(value) => updateFormData("selectedAM", value)}
                onCityChange={(value) => updateFormData("cityId", value)}
            />

            <Separator />

            <RequestTypeSelector
                selectedType={formData.requestType}
                onTypeChange={(value) => updateFormData("requestType", value)}
            />

            <Separator />

            <RequestDetailsInputs
                formData={formData}
                onUpdate={updateFormData}
            />

            <Separator />

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? "Creating..." : "Create Request"}
                </Button>
            </div>
        </form>
    );
}

