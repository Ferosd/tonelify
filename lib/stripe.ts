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
        stripePriceIdMonthly: "price_1T2sAAIpH3A3WvtIWJrE1aDx",
        stripePriceIdAnnual: "price_1T2sAAIpH3A3WvtIsPzBpXlW",
    },
    expert: {
        name: "Expert",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        stripePriceIdMonthly: "price_1T2sABIpH3A3WvtIkOiuEl2x",
        stripePriceIdAnnual: "price_1T2sABIpH3A3WvtIMF0rd4MA",
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
