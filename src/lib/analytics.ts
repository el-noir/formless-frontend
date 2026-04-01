/**
 * Minimal analytics wrapper for future integration (e.g. PostHog, Mixpanel, GA)
 */

import { useAuthStore } from "@/stores/authStore";

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
        console.log(`[Analytics] ${eventName}`, properties || {});
    }

    // Capture orgId from properties if provided, or caller can pass it in properties
    const orgId = properties?.orgId;
    const token = useAuthStore.getState().accessToken;

    if (orgId && token) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            fetch(`${baseUrl}/organizations/${orgId}/telemetry/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    event: eventName,
                    properties: properties
                })
            }).catch(err => console.error('[Analytics] Failed to track event', err));
        } catch (err) {
            // Silently fail analytics
        }
    }
};
