import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * One Stripe customer per Clerk user, found the same way every time.
 *
 * The double billing in July was not a missing guard on the subscription, it
 * was a missing guard on the customer. Checkout created a brand new customer
 * whenever the database had no id stored yet, so one person ended up on three
 * customer records (cus_USZTt1, cus_USZPnC, cus_USZO4a, all
 * reinvos2709@gmail.com, all with empty metadata) carrying three live
 * subscriptions. Nothing that looked at "the" subscription could ever see the
 * other two.
 *
 * So the customer is resolved from three places, cheapest first, and stamped
 * with the Clerk user id on the way out. Records created before this existed
 * carry no metadata, which is why the email sweep stays in place.
 */

/** Statuses that mean the customer is still holding a paid seat. */
const LIVE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

type LiveSubscription = {
    id: string;
    status: string;
    customerId: string;
};

function customerIdOf(value: unknown): string | null {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "id" in value) {
        const id = (value as { id: unknown }).id;
        return typeof id === "string" ? id : null;
    }
    return null;
}

/**
 * Every Stripe customer that could belong to this user: the stored one, the
 * ones tagged with their Clerk id, and the ones sharing their email. Returned
 * newest-known first, deduplicated, with deleted records dropped.
 */
export async function findCustomerIds(userId: string, email?: string | null): Promise<string[]> {
    const ids: string[] = [];
    const add = (id: string | null) => {
        if (id && !ids.includes(id)) ids.push(id);
    };

    const { data: row } = await getSupabaseAdmin()
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (row?.stripe_customer_id) {
        try {
            const stored = await stripe.customers.retrieve(row.stripe_customer_id);
            if (!stored.deleted) add(stored.id);
        } catch {
            // Stored against another account, or deleted in the dashboard.
        }
    }

    // Search is eventually consistent, roughly a minute behind a write, so it
    // finds established customers and misses one created seconds ago. That gap
    // is covered by the idempotency key in ensureCustomer.
    try {
        const tagged = await stripe.customers.search({
            query: `metadata['userId']:'${userId}'`,
            limit: 20,
        });
        tagged.data.forEach((c) => add(c.id));
    } catch (error) {
        console.error("[stripe-customer] metadata search failed:", error);
    }

    if (email) {
        try {
            const byEmail = await stripe.customers.list({ email, limit: 100 });
            byEmail.data.forEach((c) => {
                if (!c.deleted) add(c.id);
            });
        } catch (error) {
            console.error("[stripe-customer] email lookup failed:", error);
        }
    }

    return ids;
}

/**
 * The customer to bill, creating one only when the user genuinely has none.
 *
 * The idempotency key is what stops a double-submitted checkout from opening a
 * second customer inside the window where the search index has not caught up:
 * Stripe replays the first result for 24 hours instead of creating again.
 */
export async function ensureCustomer(userId: string, email?: string | null): Promise<string> {
    const existing = await findCustomerIds(userId, email);
    if (existing.length > 0) {
        await tagCustomer(existing[0], userId);
        return existing[0];
    }

    const created = await stripe.customers.create(
        {
            ...(email ? { email } : {}),
            metadata: { userId },
        },
        { idempotencyKey: `customer:${userId}` }
    );

    return created.id;
}

/** Stamps the Clerk id on a customer that predates the metadata, best effort. */
async function tagCustomer(customerId: string, userId: string): Promise<void> {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || customer.metadata?.userId === userId) return;
        await stripe.customers.update(customerId, { metadata: { ...customer.metadata, userId } });
    } catch (error) {
        console.error("[stripe-customer] could not tag customer:", error);
    }
}

/**
 * The user's live subscription across every customer record they own, so a
 * second checkout can never stack on top of one bought under an older record.
 */
export async function findLiveSubscription(customerIds: string[]): Promise<LiveSubscription | null> {
    for (const customerId of customerIds) {
        let subs;
        try {
            subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
        } catch (error) {
            console.error("[stripe-customer] subscription list failed:", error);
            continue;
        }

        const live = subs.data.find((s) => LIVE_STATUSES.has(s.status));
        if (live) {
            return {
                id: live.id,
                status: live.status,
                customerId: customerIdOf(live.customer) ?? customerId,
            };
        }
    }

    return null;
}

/**
 * Whether the user has ever held a subscription. Read from Stripe rather than
 * from the presence of a database row, because the row is now written before
 * the first purchase completes and would otherwise cancel the free trial for
 * someone who has never paid.
 */
export async function hasPriorSubscription(customerIds: string[]): Promise<boolean> {
    for (const customerId of customerIds) {
        try {
            const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
            if (subs.data.length > 0) return true;
        } catch (error) {
            console.error("[stripe-customer] prior subscription check failed:", error);
        }
    }
    return false;
}
