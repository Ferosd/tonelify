import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            typescript: true,
        });
    }
    return _stripe;
}

// Keep backward-compatible export (lazy)
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripe() as any)[prop];
    },
});

// Plan definitions – Beginner & Expert
export const PLANS = {
    beginner: {
        name: "Beginner",
        matchLimit: 20,
        savedToneLimit: 15,
        stripePriceIdMonthly: "price_1T4z7kEan7dFAO9mEdv0qWLZ",
        stripePriceIdAnnual: "price_1T4zBSEan7dFAO9m8VXRXFNY",
    },
    expert: {
        name: "Expert",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        stripePriceIdMonthly: "price_1T4z9mEan7dFAO9mx9qcogHg",
        stripePriceIdAnnual: "price_1T4zCGEan7dFAO9mOKPzMlJy",
    },
} as const;

export type PlanId = keyof typeof PLANS;

// Helper to find plan by price ID
export function getPlanByPriceId(priceId: string): { planId: PlanId; plan: typeof PLANS[PlanId] } | null {
    for (const [planId, plan] of Object.entries(PLANS)) {
        if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdAnnual === priceId) {
            return { planId: planId as PlanId, plan };
        }
    }
    return null;
}
