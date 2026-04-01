/**
 * Minimal analytics wrapper for future integration (e.g. PostHog, Mixpanel, GA)
 */

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Determine environment (skip in tests, etc)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In development or until pipeline is ready, log to console
    if (isDevelopment || true) {
        console.log(`[Analytics] ${eventName}`, properties || {});
    }

    // TODO: Wire up to actual analytics provider here:
    // window.posthog?.capture(eventName, properties);
};
