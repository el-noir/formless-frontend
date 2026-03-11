"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useOrgStore } from "@/stores/orgStore";
import { useFormCreationStore } from "@/stores/formCreationStore";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { CreateFormSelector } from "@/components/create-form/CreateFormSelector";
import { ScratchFormBuilder } from "@/components/create-form/ScratchFormBuilder";
import { TemplatePicker } from "@/components/create-form/TemplatePicker";
import { AiFormGenerator } from "@/components/create-form/AiFormGenerator";

export default function CreateFormPage() {
    const { orgId } = useParams() as { orgId: string };
    const router = useRouter();
    const { isLoading } = useRequireAuth();
    const { isAdminOfCurrentOrg } = useOrgStore();
    const { method, setMethod, reset } = useFormCreationStore();

    const isAdmin = isAdminOfCurrentOrg();

    // Reset store on mount & cleanup
    useEffect(() => {
        reset();
        return () => reset();
    }, []);

    const handleCreated = (formId: string) => {
        reset();
        router.push(`/dashboard/${orgId}/forms/${formId}/builder`);
    };

    const handleBackToForms = () => {
        reset();
        router.push(`/dashboard/${orgId}/forms`);
    };

    const handleBackToSelector = () => {
        setMethod(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
                <div className="text-center py-16">
                    <p className="text-gray-500 text-sm">You need admin access to create forms.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <DashboardBreadcrumbs
                backHref={`/dashboard/${orgId}/forms`}
                backLabel="Back to Forms"
            />

            <div className="mt-4">
                {!method && (
                    <CreateFormSelector
                        onSelect={setMethod}
                        onBack={handleBackToForms}
                    />
                )}

                {method === "scratch" && (
                    <ScratchFormBuilder
                        orgId={orgId}
                        onCreated={handleCreated}
                        onBack={handleBackToSelector}
                    />
                )}

                {method === "template" && (
                    <TemplatePicker
                        orgId={orgId}
                        onCreated={handleCreated}
                        onBack={handleBackToSelector}
                    />
                )}

                {method === "ai" && (
                    <AiFormGenerator
                        orgId={orgId}
                        onCreated={handleCreated}
                        onBack={handleBackToSelector}
                    />
                )}
            </div>
        </div>
    );
}
