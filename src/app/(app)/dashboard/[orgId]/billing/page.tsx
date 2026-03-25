"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useOrgStore } from "@/stores/orgStore";
import { createStripeCheckoutSession, createStripePortalSession } from "@/lib/api/organizations";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    priceId: "price_1ProFakeId", 
  },
  {
    id: "enterprise",
    name: "Business",
    price: "$149",
    description: "High volume lead gen.",
    limits: "Unlimited Forms, 3000 AI Conversations/mo",
    priceId: "price_1BusinessFakeId",
  }
];

export default function BillingPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { getCurrentOrg } = useOrgStore();
  const currentOrg = getCurrentOrg();
  const [loading, setLoading] = useState<string | null>(null);

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
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and usage limits for <strong>{currentOrg?.name}</strong>.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {PLANS.map((plan) => {
          const isActive = currentOrg?.plan === plan.id || (!currentOrg?.plan && plan.id === "standard");

          return (
            <Card key={plan.id} className={`relative flex flex-col ${isActive ? 'border-primary ring-2 ring-primary/20 shadow-md' : ''}`}>
              {isActive && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>{plan.limits}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                {isActive ? (
                  plan.id !== "standard" ? (
                    <Button variant="outline" className="w-full" onClick={handleManage} disabled={loading !== null}>
                      {loading === "manage" ? "Loading..." : "Manage Subscription"}
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>Active</Button>
                  )
                ) : (
                  <Button 
                    className="w-full" 
                    variant={plan.id === "enterprise" ? "outline" : "default"}
                    onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
                    disabled={!plan.priceId || loading !== null}
                  >
                    {loading === plan.priceId ? "Redirecting..." : "Upgrade"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
