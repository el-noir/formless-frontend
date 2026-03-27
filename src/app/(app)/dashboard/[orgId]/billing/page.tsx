"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useOrgStore } from "@/stores/orgStore";
import { createStripeCheckoutSession, createStripePortalSession, getMyOrganizations } from "@/lib/api/organizations";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// High-level strategy based on business model
const PLANS = [
  {
    id: "standard",
    name: "Starter",
    price: "$0",
    description: "Perfect for trying things out.",
    limits: "1 Form, 50 AI Conversations/mo",
    priceId: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    description: "For small businesses and solo agencies.",
    limits: "10 Forms, 500 AI Conversations/mo",
    priceId: "price_1TEw2aRz2Cw1jDmVTtatJcGu",
  },
  {
    id: "enterprise",
    name: "Business",
    price: "$149",
    description: "High volume lead gen.",
    limits: "Unlimited Forms, 3000 AI Conversations/mo",
    priceId: "price_1TEw3DRz2Cw1jDmVAvIwGReA",
  }
];

export default function BillingPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { getCurrentOrg, setOrganizations } = useOrgStore();
  const currentOrg = getCurrentOrg();
  const [loading, setLoading] = useState<string | null>(null);

  // When returning from Stripe Checkout, refresh the org to sync the new active plan
  useEffect(() => {
    getMyOrganizations().then(setOrganizations).catch(console.error);
  }, [setOrganizations]);

  const handleUpgrade = async (priceId: string) => {
    try {
      setLoading(priceId);
      const res = await createStripeCheckoutSession(
        orgId,
        priceId,
        window.location.href, // success
        window.location.href  // cancel
      );
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout. Check Stripe API keys.");
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      setLoading("manage");
      const res = await createStripePortalSession(orgId, window.location.href);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open portal. Need an active subscription.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Billing & Plans</h1>
        <p className="text-gray-400 mt-2 text-sm max-w-2xl">
          Manage your subscription and usage limits for <strong className="text-gray-200 font-medium">{currentOrg?.name}</strong>. upgrading to a higher tier instantly grants you additional forms and capacity.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {PLANS.map((plan, index) => {
          const currentPlanIndex = PLANS.findIndex(p => p.id === (currentOrg?.plan || 'standard'));
          const isActive = currentOrg?.plan === plan.id || (!currentOrg?.plan && plan.id === "standard");
          const isDowngrade = index < currentPlanIndex;

          return (
            <div 
              key={plan.id} 
              className={`relative flex flex-col rounded-xl border transition-all duration-300 overflow-hidden ${
                isActive 
                  ? 'border-brand-purple/50 bg-[#1C1C22]/50 shadow-[0_0_30px_-10px_rgba(109,40,217,0.15)] ring-1 ring-brand-purple/20' 
                  : 'border-gray-800 bg-[#111116] hover:border-gray-700/80 hover:bg-[#15151A]'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4">
                  <span className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-gray-200 font-medium text-xl mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                    <span className="text-sm font-medium text-gray-500 ml-1">/mo</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-brand-purple' : 'text-gray-400'}`} />
                    <span className="text-gray-300 text-sm leading-snug">{plan.limits}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-800/40">
                  {isActive ? (
                    plan.id !== "standard" ? (
                      <button 
                        className="w-full flex items-center justify-center bg-[#1C1C22] hover:bg-white/[0.04] border border-gray-700 hover:border-gray-600 text-gray-200 py-2.5 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={handleManage} 
                        disabled={loading !== null}
                      >
                        {loading === "manage" ? "Loading..." : "Manage Subscription"}
                      </button>
                    ) : (
                      <button 
                        className="w-full bg-[#111116] border border-gray-800/50 text-gray-600 py-2.5 px-4 rounded-lg text-sm font-medium cursor-not-allowed" 
                        disabled
                      >
                        Active
                      </button>
                    )
                  ) : (
                    <button 
                      className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDowngrade
                          ? "bg-[#111116] border border-gray-800 hover:bg-white/[0.04] text-gray-400"
                          : plan.id === "enterprise" 
                          ? "bg-[#1C1C22] hover:bg-white/[0.04] border border-gray-700 hover:border-gray-600 text-gray-200" 
                          : "bg-brand-purple hover:bg-brand-purple/90 text-white shadow-sm shadow-brand-purple/20 border border-brand-purple"
                      }`}
                      onClick={() => isDowngrade ? handleManage() : (plan.priceId && handleUpgrade(plan.priceId))}
                      disabled={loading !== null || (!plan.priceId && !isDowngrade)}
                    >
                      {(loading === plan.priceId) || (loading === "manage" && isDowngrade) 
                        ? "Redirecting..." 
                        : (isDowngrade ? "Downgrade" : "Upgrade")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
