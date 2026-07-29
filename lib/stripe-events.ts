/**
 * Reading Stripe webhook payloads.
 *
 * Two fields the webhook depended on were moved by Stripe and silently became
 * `undefined` against the API version this SDK pins (v20 → 2026-01-28.clover):
 *
 *   Subscription.current_period_end  →  Subscription.items.data[n].current_period_end
 *   Invoice.subscription             →  Invoice.parent.subscription_details.subscription
 *
 * Neither one throws when it disappears, so the damage was quiet. Every billing
 * period written to user_subscriptions was the "one month from now" fallback —
 * all six rows in the table sit exactly 30 or 31 days after the write, whatever
 * the customer actually bought. A $4.99 Week Pass granted a month, an annual
 * plan granted a month, and because the renewal handler bailed on a missing
 * subscription id, no renewal ever extended anything: a paying subscriber was
 * downgraded to free after ~34 days while Stripe kept charging them.
 *
 * The helpers read the current shape first and the old one second, so events
 * replayed from before the change still resolve. Everything arrives as `unknown`
 * because these payloads are whatever Stripe sent, not whatever the SDK's types
 * claim the current version sends — that gap is the bug being fixed.
 */

type Payload = Record<string, unknown>;

function asObject(value: unknown): Payload | null {
    return typeof value === "object" && value !== null ? (value as Payload) : null;
}

/** The subscription item carrying the billing period and the price. */
function firstItem(sub: unknown): Payload | null {
    const data = asObject(asObject(sub)?.items)?.data;
    return Array.isArray(data) ? asObject(data[0]) : null;
}

/** Stripe hands back references as either a bare id or an expanded object. */
export function idOf(value: unknown): string | null {
    if (typeof value === "string") return value;
    const id = asObject(value)?.id;
    return typeof id === "string" ? id : null;
}

/** Billing period end for a subscription, or null if the payload didn't carry one. */
export function subscriptionPeriodEnd(sub: unknown): Date | null {
    const seconds =
        firstItem(sub)?.current_period_end ??
        asObject(sub)?.current_period_end;

    return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

/**
 * Period end derived from the price's own recurring interval, for the rare
 * event that arrives without one. Still far better than assuming a month:
 * a weekly price lands a week out, an annual price a year out.
 */
export function periodEndFromPrice(sub: unknown): Date {
    const recurring = asObject(asObject(firstItem(sub)?.price)?.recurring);
    const rawCount = recurring?.interval_count;
    const count = typeof rawCount === "number" && rawCount > 0 ? rawCount : 1;
    const end = new Date();

    switch (recurring?.interval) {
        case "day":
            end.setDate(end.getDate() + count);
            break;
        case "week":
            end.setDate(end.getDate() + 7 * count);
            break;
        case "year":
            end.setFullYear(end.getFullYear() + count);
            break;
        case "month":
        default:
            end.setMonth(end.getMonth() + count);
            break;
    }

    return end;
}

/** Subscription id an invoice belongs to, or null for one-off invoices. */
export function invoiceSubscriptionId(invoice: unknown): string | null {
    const details = asObject(asObject(asObject(invoice)?.parent)?.subscription_details);
    return idOf(details?.subscription ?? asObject(invoice)?.subscription);
}
