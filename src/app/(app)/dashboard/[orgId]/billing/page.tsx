"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrgStore } from "@/stores/orgStore";
import { Check, CreditCard, Rocket, Shield, Wand2 } from "lucide-react";
import { createStripeCheckoutSession, createStripePortalSession } from "@/lib/api/organizations";
import { useState } from "react";
import { toast } from "sonner";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function BillingPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();
  const { getCurrentOrg } = useOrgStore();
  const currentOrg = getCurrentOrg();
  const [loading, setLoading] = useState<string | null>(null);

  const plan = currentOrg?.plan || "standard";

  const handleUpgrade = async (priceId: string) => {
    try {
      setLoading(priceId);
      const { url } = await createStripeCheckoutSession(
        orgId,
        priceId,
        window.location.href,
        window.location.href
      );
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate checkout");
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      setLoading("portal");
      const { url } = await createStripePortalSession(orgId, window.location.href);
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || "Failed to open billing portal");
    } finally {
      setLoading(null);
    }
  };

  const PLANS = [
    {
      id: "standard",
      name: "Starter",
      price: "$0",
      description: "Perfect for personal projects",
      features: ["10 Active Forms", "Unlimited Submissions", "Basic AI Extraction", "Community Support"],
      buttonText: "Current Plan",
      disabled: plan === "standard",
    },
    {
      id: "pro",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      name: "Pro",
      price: "$29",
      description: "For growing businesses",
      features: ["Unlimited Forms", "Advanced AI (Context-Aware)", "Custom Branding", "Priority Support"],
      buttonText: plan === "pro" ? "Manage Subscription" : "Upgrade to Pro",
      isPopular: true,
    },
  ];

  return (
    <div className="p-6 md:p-8 xl:p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-1">
            Billing & Plans
          </h2>
          <p className="text-gray-500 text-sm">Manage your subscription and organization limits.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative p-6 rounded-md border ${p.isPopular ? "border-emerald-500/50 bg-[#0B0B0F]" : "border-gray-800/80 bg-[#0B0B0F]"
              } flex flex-col hover:border-gray-700 transition-colors shadow-sm`}
          >
            {p.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="mb-8 mt-2">
              <h3 className="text-lg font-semibold text-gray-100 mb-1">{p.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{p.description}</p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-3xl font-bold text-gray-100 tabular-nums tracking-tight">{p.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>

            {p.id === "standard" ? (
              <button
                disabled
                className="w-full py-2 rounded-md bg-gray-800/50 text-gray-500 text-sm font-medium cursor-default"
              >
                Current Plan
              </button>
            ) : (
              <MagneticButton
                onClick={() => (plan === "pro" ? handlePortal() : handleUpgrade(p.priceId!))}
                disabled={loading === p.priceId || loading === "portal"}
                className={`w-full py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${p.isPopular
                    ? "bg-emerald-500 hover:bg-[#0da372] text-white"
                    : "bg-[#1C1C22] hover:bg-[#25252c] border border-gray-800 text-gray-200"
                  }`}
              >
                {loading === p.priceId || (loading === "portal" && p.id === "pro") ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  p.buttonText
                )}
              </MagneticButton>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-md p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative shadow-sm">
        <div className="flex items-start gap-4 z-10">
          <div className="p-2.5 bg-[#1C1C22] border border-gray-800 text-gray-400 rounded-md shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-gray-200 font-medium text-sm mb-0.5">Enterprise Needs?</h4>
            <p className="text-gray-500 text-xs max-w-xl">Custom limits, tailored AI, and dedicated support for organizations at scale.</p>
          </div>
        </div>
        <button
          className="shrink-0 bg-[#111116] hover:bg-[#1C1C22] border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white font-medium text-xs py-2 px-5 rounded-md transition-all shadow-sm z-10 w-full md:w-auto"
        >
          Contact Sales
        </button>
      </div>
    </div>
  );
}
