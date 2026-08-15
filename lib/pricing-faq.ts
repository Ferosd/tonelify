import { PRICING, PLAN_NAMES, TRIAL_DAYS, STAGE_MATCHES, STAGE_SAVED_TONES } from "./pricing";

/**
 * The pricing FAQ lives here so the rendered accordion and the FAQPage
 * structured data on /plans are always the same text. Two copies would drift,
 * and a schema block that doesn't match the visible page is a markup penalty
 * rather than a win. The prices come from lib/pricing so an answer can never
 * quote a figure the cards no longer show.
 *
 * The free-plan and Week Pass questions were removed with the plans they
 * described. A FAQ answer outlives the page it sits on, because engines quote
 * it for months, so a question about a withdrawn plan is worse than no question
 * at all.
 */
export const PRICING_FAQ: { q: string; a: string }[] = [
    {
        q: `What is the difference between ${PLAN_NAMES.stage} and ${PLAN_NAMES.player}?`,
        a: `How much you can do, not what you get. ${PLAN_NAMES.stage} covers ${STAGE_MATCHES} tone matches and ${STAGE_SAVED_TONES} saved tones a month. ${PLAN_NAMES.player} lifts both to unlimited. A match returns exactly the same settings, effects chain and sources on either plan, so nothing about the answer is held back on the cheaper one.`,
    },
    {
        q: "Is the yearly plan charged every month?",
        a: `No. Yearly is a single payment of ${PRICING.year.price}. The ${PRICING.year.perMonth} a month figure is that one payment divided across the twelve months, shown that way so it lines up against the monthly price.`,
    },
    {
        q: `How does the ${TRIAL_DAYS}-day free trial work?`,
        a: `Both plans start with ${TRIAL_DAYS} free days on either interval, and nothing is charged until they are up. Cancel inside those ${TRIAL_DAYS} days and you pay nothing. The trial is for first-time subscribers, so coming back after a cancellation starts billing straight away.`,
    },
    {
        q: "Can I switch between monthly and yearly?",
        a: "Yes, and between the two plans as well. Open the billing portal from this page or from Settings and pick the other one. Stripe credits whatever you already paid for against the new price, so you are never billed twice for the same days.",
    },
    {
        q: "What happens if I cancel?",
        a: "You keep everything until the end of the period you already paid for, then matching and saving stop. Nothing is deleted: your saved tones and gear presets stay in your collection, and they come back as soon as you subscribe again.",
    },
    {
        q: "Is there a free plan?",
        a: `No. There is a ${TRIAL_DAYS}-day free trial on both plans instead, which is a full week of unlimited use rather than a handful of matches a month. Browsing the tone library, the gear pages and the guides needs no account at all.`,
    },
];
