"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getOrgForm } from "@/lib/api/organizations";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { Loader2 } from "lucide-react";

export default function BuilderPage() {
    const { orgId, formId } = useParams() as { orgId: string; formId: string };
    const { accessToken } = useAuthStore();
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken || !orgId || !formId) return;
        getOrgForm(orgId, formId)
            .then(setForm)
            .catch((e) => setError(e.message || "Failed to load form"))
            .finally(() => setLoading(false));
    }, [accessToken, orgId, formId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#9A6BFF]" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-sm">{error || "Form not found"}</p>
            </div>
        );
    }

    return <FormBuilder form={form} orgId={orgId} formId={formId} />;
}
