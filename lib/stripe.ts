import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    typescript: true,
});

export type BillingInterval = "week" | "month" | "year";

type Plan = {
    name: string;
    matchLimit: number;
    savedToneLimit: number;
    /** 0 means the plan is sold without a trial. */
    trialDays: number;
    /** Price ids come from the environment so test and live can never be mixed up. */
    prices: Partial<Record<BillingInterval, string>>;
};

// Price ids live in env vars on purpose. They used to be hardcoded, which meant
// the same test-mode ids were used against a live key and every checkout failed
// with "No such price". Keeping them per-environment makes that impossible.
export const PLANS: Record<string, Plan> = {
    weekly: {
        name: "Week Pass",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        // No trial: a free trial on a 7-day plan gives the product away
        trialDays: 0,
        prices: {
            week: process.env.STRIPE_PRICE_WEEK_PASS || "",
        },
    },
    player: {
        name: "Player",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        // Seven days, matching the category. Three did not cover a weekend of
        // learning a song, which is the whole trial. Keep in step with
        // TRIAL_DAYS in lib/pricing.ts, which is what the pages say.
        trialDays: 7,
        prices: {
            month: process.env.STRIPE_PRICE_PLAYER_MONTHLY || "",
            year: process.env.STRIPE_PRICE_PLAYER_ANNUAL || "",
        },
    },

    // Retired plans. Not sold any more, kept so anyone already subscribed keeps
    // the limits they paid for and the webhook can still map their price back.
    beginner: {
        name: "Beginner",
        matchLimit: 20,
        savedToneLimit: 15,
        trialDays: 3,
        prices: {},
    },
    expert: {
        name: "Expert",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        trialDays: 3,
        prices: {},
    },
};

export type PlanId = keyof typeof PLANS;

/** Plans a visitor can actually buy today. */
export const PURCHASABLE_PLANS = ["weekly", "player"] as const;
export type PurchasablePlanId = (typeof PURCHASABLE_PLANS)[number];

export function isPurchasablePlan(id: unknown): id is PurchasablePlanId {
    return typeof id === "string" && (PURCHASABLE_PLANS as readonly string[]).includes(id);
}

export function getPriceId(planId: PurchasablePlanId, interval: BillingInterval): string | null {
    return PLANS[planId].prices[interval] || null;
}

// Helper to find plan by price ID
export function getPlanByPriceId(priceId: string): { planId: PlanId; plan: Plan } | null {
    for (const [planId, plan] of Object.entries(PLANS)) {
        if (Object.values(plan.prices).some((id) => id && id === priceId)) {
            return { planId, plan };
        }
    }
    return null;
}
