/**
 * Re-reads every subscription from Stripe and repairs user_subscriptions.
 *
 * The webhook wrote a made-up billing period for a long time (see
 * lib/stripe-events.ts), so the rows on record do not describe what anyone
 * actually bought. This asks Stripe for the truth and writes it back.
 *
 * Stripe is the source of truth here; the table is only a cache of it.
 *
 *   Preview (writes nothing):
 *     node scripts/reconcile_subscriptions.js
 *   Apply:
 *     node scripts/reconcile_subscriptions.js --apply
 *
 * Run it against the SAME Stripe mode the rows were created in. Production rows
 * came from the live key, so use the live key or the script will report every
 * subscription as missing.
 */
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");
require("dotenv").config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Mirrors lib/stripe.ts. Kept as ids only — this script never needs the limits.
// Only useful when the price ids for this Stripe mode are in the environment;
// checkout stamps the plan into subscription metadata, so that comes first.
const PRICE_TO_PLAN = {
    [process.env.STRIPE_PRICE_WEEK_PASS]: "weekly",
    [process.env.STRIPE_PRICE_PLAYER_MONTHLY]: "player",
    [process.env.STRIPE_PRICE_PLAYER_ANNUAL]: "player",
};

const KNOWN_PLANS = ["weekly", "player", "beginner", "expert"];

function planFor(sub, priceId, currentPlan) {
    const fromMetadata = sub?.metadata?.planId;
    if (KNOWN_PLANS.includes(fromMetadata)) return fromMetadata;
    return PRICE_TO_PLAN[priceId] || currentPlan;
}

const ACTIVE = ["active", "trialing", "past_due", "unpaid"];

function periodEnd(sub) {
    const seconds = sub?.items?.data?.[0]?.current_period_end ?? sub?.current_period_end;
    return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

async function main() {
    console.log(APPLY ? "=== APPLY ===" : "=== PREVIEW (no writes) ===");
    console.log("Stripe mode:", process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "LIVE" : "TEST");

    const { data: rows, error } = await supabase.from("user_subscriptions").select("*");
    if (error) throw error;

    for (const row of rows) {
        const label = row.user_id.slice(0, 18) + "..";

        if (!row.stripe_subscription_id) {
            console.log(`${label} no stripe_subscription_id, skipped`);
            continue;
        }

        let sub;
        try {
            sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
        } catch (e) {
            console.log(`${label} ${row.stripe_subscription_id}: ${e.message}`);
            continue;
        }

        const end = periodEnd(sub);
        const priceId = sub.items?.data?.[0]?.price?.id;
        const live = ACTIVE.includes(sub.status);
        // A subscription Stripe no longer considers live drops to free, whatever
        // the row says. An active one keeps the plan its current price maps to.
        const plan = live ? planFor(sub, priceId, row.plan) : "free";
        const status = live ? (sub.status === "trialing" ? "active" : sub.status) : sub.status;

        const update = {
            plan,
            status,
            current_period_end: end ? end.toISOString() : row.current_period_end,
            cancel_at_period_end: !!sub.cancel_at_period_end,
            stripe_customer_id:
                (typeof sub.customer === "string" ? sub.customer : sub.customer?.id) ||
                row.stripe_customer_id,
            updated_at: new Date().toISOString(),
        };

        const changed = ["plan", "status", "current_period_end", "cancel_at_period_end"]
            .filter((k) => String(row[k]) !== String(update[k]));

        console.log(`${label} stripe=${sub.status} interval=${sub.items?.data?.[0]?.price?.recurring?.interval}`);
        if (!changed.length) {
            console.log("   already correct");
            continue;
        }
        changed.forEach((k) => console.log(`   ${k}: ${row[k]}  ->  ${update[k]}`));

        if (APPLY) {
            const { error: upErr } = await supabase
                .from("user_subscriptions")
                .update(update)
                .eq("user_id", row.user_id);
            console.log(upErr ? "   WRITE FAILED " + upErr.message : "   written");
        }
    }

    if (!APPLY) console.log("\nNothing was written. Re-run with --apply to commit these changes.");
}

main().catch((e) => {
    console.error("FATAL", e.message);
    process.exit(1);
});
