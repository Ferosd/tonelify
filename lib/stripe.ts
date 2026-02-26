import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
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
