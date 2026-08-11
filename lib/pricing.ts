/**
 * Every price a visitor can read, in one place.
 *
 * The numbers used to be typed out in eight files: the pricing page, the
 * landing section, the FAQ, the terms, the explore pages, the plans schema and
 * llms-full.txt. Changing a price meant finding all of them, and the ones that
 * got missed were the worst kind of wrong, because a stale price in the terms
 * or in the schema is the copy a customer or an answer engine quotes back.
 *
 * These are display figures only. Checkout resolves the real Stripe price id
 * from the environment (see lib/stripe.ts), so nothing here can charge anyone.
 * If you change a number here, change the matching Stripe price too.
 */

/**
 * Base amounts in dollars. Everything else on this page is derived.
 *
 * Set against the category as it stood in August 2026. ToneAdapt sells
 * $6.99/mo capped and $10.99/mo unlimited on the web, $14.99/mo on iOS, and
 * annual plans at $39.99 and $49.99. Guitar Tone Match AI sells $6.99/wk,
 * $14.99/mo, $39.99/yr. Ultimate Guitar Pro, the anchor every guitarist
 * already has a feel for, is $39.99/yr.
 *
 * The week pass was the cheapest in a category that charges $5.99 to $9.99 for
 * the same thing, and it is the one plan bought on impulse for a specific
 * weekend, which is the least price-sensitive purchase on the page. $6.99.
 *
 * The yearly plan goes the other way, to $89.99, and that is a deliberate break
 * with the category. Everyone else discounts annual by 60% to 78%, which reads
 * as a bargain but quietly says the monthly price was never real, and it caps
 * what a subscriber is worth at three or four dollars a month. A 42% discount
 * is the kind a customer believes, and it leaves the yearly plan worth $7.26 a
 * month net instead of $3.62, which halves how many subscribers a given revenue
 * target needs.
 *
 * The cost is real and worth writing down: at $89.99 this is roughly twice
 * ToneAdapt's $49.99, so anyone who arrives already comparing the two is lost
 * on the number they compare. The bet is that they mostly do not arrive that
 * way. Acquisition here is organic search from queries like "master of puppets
 * amp settings", where the visitor has no price anchor in mind and no rival
 * listing one scroll away, which is the opposite of an App Store shelf.
 *
 * If that bet is wrong it shows up as a fall in the yearly share of checkouts,
 * not as anything subtle. Watch the plan mix in Stripe.
 *
 * Monthly stays at $12.99, between the $10.99 and $14.99 charged elsewhere.
 */
const WEEK_PASS = 6.99;
const PLAYER_MONTHLY = 12.99;
const PLAYER_YEARLY = 89.99;

/**
 * Matches and saved tones a free account gets each calendar month.
 *
 * Deliberately unchanged. The loudest complaint in ToneAdapt's App Store
 * reviews is that you cannot do anything without paying, and they have no
 * permanent free tier at all. A free plan that actually returns full settings
 * is the wedge. Raising the cap would blunt the only thing that makes anyone
 * subscribe, so the generosity goes into the trial instead, where it converts.
 */
export const FREE_MATCHES = 3;
export const FREE_SAVED_TONES = 3;

/**
 * Days of free trial on the monthly and yearly plans. Must stay in step with
 * PLANS.player.trialDays in lib/stripe.ts, which is what Stripe is told.
 *
 * Three days was the shortest in the category and did not cover a weekend of
 * working a song up. ToneAdapt gives seven.
 */
export const TRIAL_DAYS = 7;

const usd = (n: number) => `$${n.toFixed(2)}`;

/** A year of paying month to month. The anchor the yearly price is sold against. */
const YEARLY_ANCHOR = PLAYER_MONTHLY * 12;
/** A year of renewing the week pass. Never a saving, only flexibility. */
const WEEK_PASS_YEAR = WEEK_PASS * 52;

export const PRICING = {
    week: {
        amount: WEEK_PASS,
        price: usd(WEEK_PASS),
        per: "/week",
        /** What a year of renewals costs, so the pass is never mistaken for value. */
        yearTotal: usd(WEEK_PASS_YEAR),
        /** The same pass expressed per month, for comparing against Player. */
        monthlyEquivalent: usd((WEEK_PASS * 52) / 12),
    },
    month: {
        amount: PLAYER_MONTHLY,
        price: usd(PLAYER_MONTHLY),
        per: "/month",
        yearTotal: usd(YEARLY_ANCHOR),
    },
    year: {
        amount: PLAYER_YEARLY,
        /** Charged once. Shown per month everywhere so it compares to monthly. */
        price: usd(PLAYER_YEARLY),
        perMonth: usd(PLAYER_YEARLY / 12),
        /** Struck-through anchor: twelve monthly payments. */
        compare: usd(YEARLY_ANCHOR),
        saving: usd(YEARLY_ANCHOR - PLAYER_YEARLY),
        percentOff: Math.round((1 - PLAYER_YEARLY / YEARLY_ANCHOR) * 100),
    },
} as const;

/** One sentence covering all three prices, for meta descriptions and llms.txt. */
export const PRICING_SENTENCE =
    `Free covers ${FREE_MATCHES} tone matches a month with no card. ` +
    `Unlimited matching costs ${PRICING.week.price} for a week, ` +
    `${PRICING.month.price} a month, or ${PRICING.year.price} a year, ` +
    `which works out at ${PRICING.year.perMonth} a month.`;
