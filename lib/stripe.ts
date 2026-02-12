import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    typescript: true,
});

// Plan definitions matching our Pricing component
export const PLANS = {
    hobby: {
        name: "Hobby",
        matchLimit: 5,
        stripePriceIdMonthly: null,
        stripePriceIdAnnual: null,
    },
    guitarist: {
        name: "Guitarist",
        matchLimit: 100,
        stripePriceIdMonthly: "price_1SzcteIpH3A3WvtIKkzRvxLe",
        stripePriceIdAnnual: "price_1SzctfIpH3A3WvtIrKKXIUcO",
    },
    pro: {
        name: "Pro",
        matchLimit: Infinity,
        stripePriceIdMonthly: "price_1SzctfIpH3A3WvtIyFH3iK0u",
        stripePriceIdAnnual: "price_1SzctgIpH3A3WvtIIeF2VIdZ",
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
