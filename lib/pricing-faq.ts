/**
 * The pricing FAQ lives here so the rendered accordion and the FAQPage
 * structured data on /plans are always the same text. Two copies would drift,
 * and a schema block that doesn't match the visible page is a markup penalty
 * rather than a win.
 */
export const PRICING_FAQ: { q: string; a: string }[] = [
    {
        q: "Is the yearly plan charged every month?",
        a: "No. Yearly is a single payment of $59.99. The $5.00 a month figure is that one payment divided across the twelve months, shown that way so it lines up against the monthly price.",
    },
    {
        q: "How does the 3-day free trial work?",
        a: "Monthly and yearly plans start with three free days and nothing is charged until they are up. Cancel inside those three days and you pay nothing. The trial is for first-time subscribers, so coming back after a cancellation starts billing straight away. The Week Pass has no trial.",
    },
    {
        q: "Can I switch between monthly and yearly?",
        a: "Yes. Open the billing portal from this page or from Settings and pick the other interval. Stripe credits whatever you already paid for against the new price, so you are never billed twice for the same days.",
    },
    {
        q: "What happens if I cancel?",
        a: "You keep everything until the end of the period you already paid for, then the account moves back to the free plan and its three matches a month. Nothing is deleted: your saved tones and gear presets stay in your collection.",
    },
    {
        q: "Does the free plan need a card?",
        a: "No card, no trial to cancel. You get three tone matches and three saved tones, and the match count resets on the first of each month.",
    },
]
