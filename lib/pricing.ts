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
 * Two plans, each sold monthly or yearly. That is the whole range.
 *
 * The week pass and the free tier were both removed in August 2026. The week
 * pass had the ladder upside down: at $4.99 it was the cheapest thing in the
 * category while working out at $21.62 a month, so the plan nobody should buy
 * was the one that looked cheapest, and every visitor comparing prices was
 * comparing the wrong two numbers.
 *
 * The free tier was worse: it was advertised everywhere as three matches a
 * month while lib/subscription had granted zero since the trial replaced it.
 * The site was promising something the API refused. A seven-day trial on both
 * plans does the same job honestly.
 *
 * Set against the category as it stood in August 2026. ToneAdapt sells
 * $6.99/mo capped and $10.99/mo unlimited on the web, $14.99/mo on iOS, and
 * annual plans at $39.99 and $49.99. Ultimate Guitar Pro, the anchor every
 * guitarist already has a feel for, is $39.99/yr.
 */
const PLAYER_MONTHLY = 12.99;
const PLAYER_YEARLY = 59.99;

/**
 * The Stage tier: the metered plan that sits between Practice and Headliner.
 *
 * Set against the same category the block above describes. ToneAdapt's lower
 * tier is $6.99 a month and $39.99 a year, and matching it puts a real ladder
 * under the range for the first time: $0, then $6.99, then $12.99. The old
 * shape had one paid price and a week pass that cost more per month than
 * either, so there was nothing to step up from.
 *
 * Nothing here can charge anyone. Checkout resolves the Stripe price from
 * STRIPE_PRICE_STAGE_MONTHLY and STRIPE_PRICE_STAGE_ANNUAL, and the tier stays
 * hidden until both exist, so these figures cannot advertise a price the
 * environment would not charge.
 */
const STAGE_MONTHLY = 6.99;
const STAGE_YEARLY = 39.99;

/** Matches and saved tones the Stage tier meters each calendar month. */
export const STAGE_MATCHES = 20;
export const STAGE_SAVED_TONES = 15;

/**
 * Days of free trial. Both plans, both intervals.
 *
 * Must stay in step with trialDays in lib/stripe.ts, which is what Stripe is
 * actually told. This is now the only way to use the product without paying,
 * so it carries the weight the free tier used to.
 *
 * Three days was the shortest in the category and did not cover a weekend of
 * working a song up. ToneAdapt gives seven.
 */
export const TRIAL_DAYS = 7;

const usd = (n: number) => `$${n.toFixed(2)}`;

/** A year of paying month to month. The anchor the yearly price is sold against. */
const YEARLY_ANCHOR = PLAYER_MONTHLY * 12;

export const PRICING = {
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
    /** The Stage tier, on both intervals it is sold on. */
    stage: {
        month: {
            amount: STAGE_MONTHLY,
            price: usd(STAGE_MONTHLY),
            yearTotal: usd(STAGE_MONTHLY * 12),
        },
        year: {
            amount: STAGE_YEARLY,
            price: usd(STAGE_YEARLY),
            perMonth: usd(STAGE_YEARLY / 12),
            compare: usd(STAGE_MONTHLY * 12),
            saving: usd(STAGE_MONTHLY * 12 - STAGE_YEARLY),
            percentOff: Math.round((1 - STAGE_YEARLY / (STAGE_MONTHLY * 12)) * 100),
        },
    },
} as const;

/**
 * Plan names.
 *
 * A ladder a guitarist can feel rather than a rank they have to decode:
 * playing out, then headlining. "Beginner" and "Expert" were the old labels and
 * they graded the player instead of describing the plan, which made the cheaper
 * card read as an insult.
 */
export const PLAN_NAMES = {
    stage: "Stage",
    player: "Headliner",
} as const;

/** One sentence covering the whole range, for meta descriptions and llms.txt. */
export const PRICING_SENTENCE =
    `${PLAN_NAMES.stage} is ${PRICING.stage.month.price} a month or ` +
    `${PRICING.stage.year.price} a year. ${PLAN_NAMES.player} is ` +
    `${PRICING.month.price} a month or ${PRICING.year.price} a year, ` +
    `which works out at ${PRICING.year.perMonth} a month. ` +
    `Both start with a ${TRIAL_DAYS}-day free trial and no charge until it ends.`;
