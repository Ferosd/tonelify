import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    typescript: true,
});

/**
 * "week" is still in the union because the retired Week Pass rows and any
 * Stripe object that predates its withdrawal are typed against it. Nothing is
 * sold on it.
 */
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
    stage: {
        name: "Stage",
        // Metered, unlike the two plans either side of it. The caps are enforced
        // by lib/subscription from these numbers, so the card and the API can
        // never disagree about what was bought.
        matchLimit: 20,
        savedToneLimit: 15,
        trialDays: 7,
        prices: {
            month: process.env.STRIPE_PRICE_STAGE_MONTHLY || "",
            year: process.env.STRIPE_PRICE_STAGE_ANNUAL || "",
        },
    },
    player: {
        name: "Headliner",
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
    //
    // The entries stay even with empty `prices`: getPlanByPriceId only matches
    // on ids that are present, but user_subscriptions rows still carry these
    // plan names, and getUserSubscription checks `plan in PLANS` before it
    // grants anything. Delete the entry and an existing subscriber silently
    // drops to no plan.
    weekly: {
        name: "Week Pass",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        trialDays: 0,
        // Withdrawn August 2026. At $4.99 it read as the cheapest option in the
        // category while working out at $21.62 a month, so it undercut the plan
        // it was meant to feed. Archive the price in Stripe as well: an id left
        // live is an id a stale checkout link can still charge against.
        prices: {},
    },
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

/** Plans a visitor can actually buy today. Two, each on month and year. */
export const PURCHASABLE_PLANS = ["stage", "player"] as const;
export type PurchasablePlanId = (typeof PURCHASABLE_PLANS)[number];

export function isPurchasablePlan(id: unknown): id is PurchasablePlanId {
    return typeof id === "string" && (PURCHASABLE_PLANS as readonly string[]).includes(id);
}

/**
 * Whether every interval a plan is sold on has a real Stripe price behind it.
 *
 * A plan whose price ids are not in the environment must not reach a visitor:
 * the card would render, the button would post, and checkout would answer with
 * "No such price". Server components call this to decide what to show, so an
 * unconfigured tier is invisible rather than broken.
 *
 * Server only. Price ids are not public, so this cannot run in the browser.
 */
export function isPlanConfigured(planId: PlanId): boolean {
    const plan = PLANS[planId];
    const ids = Object.values(plan.prices);
    return ids.length > 0 && ids.every((id) => !!id);
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
