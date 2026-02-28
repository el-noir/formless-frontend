"use client";

import React from "react";
import { FormsView } from "@/components/dashboard/FormsView";
import { useOrgStore } from "@/stores/orgStore";

export default function DashboardFormsPage() {
    const { currentOrgId } = useOrgStore();

    if (!currentOrgId) {
        return (
            <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
                <div className="bg-[#111116] border border-gray-800 rounded-2xl p-8 text-center max-w-xl mx-auto mt-12">
                    <p className="text-gray-400 text-sm mb-5">Please select or create an organization first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
            <FormsView currentOrgId={currentOrgId} />
        </div>
    );
}
