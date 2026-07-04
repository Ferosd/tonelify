import { getSupabaseAdmin } from "@/lib/supabase";
import { PLANS, PlanId } from "./stripe";

export interface UserSubscription {
    plan: PlanId | "free";
    status: string;
    matchLimit: number;
    matchesUsed: number;
    matchesRemaining: number;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
}

// Free tier defaults (no subscription)
const FREE_MATCH_LIMIT = 3;
const FREE_SAVED_TONE_LIMIT = 3;

// Grace period after current_period_end before an "active" subscription
// is treated as expired (covers missed/delayed webhooks)
const EXPIRY_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

// Get current month string (e.g. "2026-02")
function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Get user's subscription info
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
    // Get subscription
    const { data: sub } = await getSupabaseAdmin()
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

    const plan = (sub?.plan as PlanId) || null;

    // Check if subscription is expired.
    // Non-active subs expire right at period end; "active" subs get a short
    // grace window so a missed renewal webhook doesn't grant access forever.
    if (sub && sub.current_period_end) {
        const endDate = new Date(sub.current_period_end);
        const pastPeriodEnd = endDate < new Date();
        const pastGrace = endDate.getTime() + EXPIRY_GRACE_MS < Date.now();
        if ((pastPeriodEnd && sub.status !== "active") || pastGrace) {
            // Subscription expired, downgrade to free
            await getSupabaseAdmin()
                .from("user_subscriptions")
                .update({ plan: "free", status: "expired" })
                .eq("user_id", userId);

            return {
                plan: "free",
                status: "expired",
                matchLimit: FREE_MATCH_LIMIT,
                matchesUsed: 0,
                matchesRemaining: FREE_MATCH_LIMIT,
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            };
        }
    }

    // If no valid plan, return free tier
    if (!plan || !(plan in PLANS)) {
        // Get current month usage
        const month = getCurrentMonth();
        const { data: usage } = await getSupabaseAdmin()
            .from("match_usage")
            .select("match_count")
            .eq("user_id", userId)
            .eq("month", month)
            .single();

        const matchesUsed = usage?.match_count || 0;

        return {
            plan: "free",
            status: sub?.status || "active",
            matchLimit: FREE_MATCH_LIMIT,
            matchesUsed,
            matchesRemaining: Math.max(0, FREE_MATCH_LIMIT - matchesUsed),
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
        };
    }

    const planConfig = PLANS[plan];

    // Get current month usage
    const month = getCurrentMonth();
    const { data: usage } = await getSupabaseAdmin()
        .from("match_usage")
        .select("match_count")
        .eq("user_id", userId)
        .eq("month", month)
        .single();

    const matchesUsed = usage?.match_count || 0;
    const matchLimit = planConfig.matchLimit === Infinity ? 999999 : planConfig.matchLimit;
    const matchesRemaining = Math.max(0, matchLimit - matchesUsed);

    return {
        plan,
        status: sub?.status || "active",
        matchLimit: planConfig.matchLimit === Infinity ? -1 : planConfig.matchLimit, // -1 = unlimited
        matchesUsed,
        matchesRemaining: planConfig.matchLimit === Infinity ? -1 : matchesRemaining,
        currentPeriodEnd: sub?.current_period_end || null,
        cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
    };
}

// Check if user can perform a match
export async function canUserMatch(userId: string): Promise<{ allowed: boolean; subscription: UserSubscription }> {
    const subscription = await getUserSubscription(userId);

    // Unlimited plan
    if (subscription.matchLimit === -1) {
        return { allowed: true, subscription };
    }

    // Check limit
    const allowed = subscription.matchesRemaining > 0;
    return { allowed, subscription };
}

// Check if user can save another tone (enforces plan savedToneLimit)
export async function canUserSaveTone(userId: string): Promise<{ allowed: boolean; limit: number; used: number }> {
    const subscription = await getUserSubscription(userId);

    const planLimit = subscription.plan === "free"
        ? FREE_SAVED_TONE_LIMIT
        : PLANS[subscription.plan as PlanId]?.savedToneLimit ?? FREE_SAVED_TONE_LIMIT;

    if (planLimit === Infinity) {
        return { allowed: true, limit: -1, used: 0 };
    }

    const { count } = await getSupabaseAdmin()
        .from("tone_matches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

    const used = count ?? 0;
    return { allowed: used < planLimit, limit: planLimit as number, used };
}

// Increment match usage
export async function incrementMatchUsage(userId: string): Promise<void> {
    const month = getCurrentMonth();

    // Prefer the atomic DB function (see scripts/sql/increment_match_usage.sql);
    // fall back to read-modify-write if it isn't installed yet.
    const { error: rpcError } = await getSupabaseAdmin()
        .rpc("increment_match_usage", { p_user_id: userId, p_month: month });
    if (!rpcError) return;

    const { data: existing } = await getSupabaseAdmin()
        .from("match_usage")
        .select("id, match_count")
        .eq("user_id", userId)
        .eq("month", month)
        .single();

    if (existing) {
        await getSupabaseAdmin()
            .from("match_usage")
            .update({ match_count: existing.match_count + 1, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
    } else {
        await getSupabaseAdmin()
            .from("match_usage")
            .insert({ user_id: userId, month, match_count: 1 });
    }
}

// Set user subscription
export async function setUserSubscription(
    userId: string,
    plan: PlanId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date
): Promise<void> {
    const { data: existing } = await getSupabaseAdmin()
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (existing) {
        await getSupabaseAdmin()
            .from("user_subscriptions")
            .update({
                plan,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                status: "active",
                current_period_end: currentPeriodEnd.toISOString(),
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
    } else {
        await getSupabaseAdmin()
            .from("user_subscriptions")
            .insert({
                user_id: userId,
                plan,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                status: "active",
                current_period_end: currentPeriodEnd.toISOString(),
            });
    }
}
