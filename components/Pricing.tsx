"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Lock, Sparkles, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { PRICING_FAQ } from "@/lib/pricing-faq"
import { PRICING, PRICING_SENTENCE, TRIAL_DAYS, FREE_MATCHES, FREE_SAVED_TONES } from "@/lib/pricing"

type Interval = "week" | "month" | "year"
/** Only the Player plan is sold on two intervals, so the toggle is binary. */
type Billing = "month" | "year"

// Display only. Checkout posts the plan id and interval and the server resolves
// the real Stripe price, so nothing here can put a customer on a price they
// didn't see. The figures come from lib/pricing so they cannot drift.
const PLAYER_BILLING: Record<Billing, {
    /** Headline number, always per month so the two options compare directly. */
    price: string
    /** What Stripe actually charges, spelled out under the headline. */
    billed: string
    /** Struck-through anchor. Only set where the comparison is a real one. */
    compare?: string
    off?: string
    /** Line under the button, pointing at the cheaper way to buy. */
    footnote: string
}> = {
    month: {
        price: PRICING.month.price,
        billed: "Billed monthly, cancel anytime",
        footnote: `Pay yearly instead and this drops to ${PRICING.year.perMonth} a month.`,
    },
    year: {
        price: PRICING.year.perMonth,
        billed: `${PRICING.year.price} billed once a year`,
        compare: PRICING.month.yearTotal,
        off: `${PRICING.year.percentOff}% OFF`,
        footnote: `You save ${PRICING.year.saving} a year against paying month to month.`,
    },
}

const paidFeatures = [
    "Unlimited tone matches",
    "Unlimited saved tones",
    "Gear presets for each of your rigs",
    "Full amp settings: gain, bass, mids, treble, master",
    "Effects chain and signal order",
    "Every match shows where the settings came from",
    "Tone tips for every match",
]

const freeFeatures = [
    `${FREE_MATCHES} tone matches per month`,
    `${FREE_SAVED_TONES} saved tones`,
    "Full amp settings on every match",
    "Effects chain, tone tips and gear presets",
    "No card required",
]

// Shown struck through on the Free card. Only the two caps that the API
// actually enforces belong here: matchLimit in app/api/tone-match and
// savedToneLimit in app/api/save-tone. Gear presets, the effects chain and
// the tone tips were listed here too, and nothing in the codebase gates any
// of them, so the page was talking free users out of features they already had.
const freeLocked = [
    "Unlimited matches",
    "Unlimited saved tones",
]

export function Pricing() {
    const [billing, setBilling] = useState<Billing>("year")
    const [loading, setLoading] = useState<Interval | null>(null)
    const [portalLoading, setPortalLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const { isSignedIn } = useUser()

    const player = PLAYER_BILLING[billing]

    // Subscribers shouldn't be sold a plan they already pay for
    useEffect(() => {
        if (!isSignedIn) {
            setCurrentPlan(null)
            return
        }
        fetch("/api/subscription")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d && typeof d.plan === "string") setCurrentPlan(d.plan)
            })
            .catch(() => { })
    }, [isSignedIn])

    const isSubscribed = !!currentPlan && currentPlan !== "free"
    const onWeekPass = currentPlan === "weekly"
    const onPlayer = currentPlan === "player"

    const openPortal = async () => {
        setPortalLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/stripe/portal", { method: "POST" })
            const data = await res.json().catch(() => null)
            if (data?.url) window.location.href = data.url
            else setError(data?.error || "Couldn't open the billing portal. Try again in a moment.")
        } catch {
            setError("Couldn't open the billing portal. Check your connection and try again.")
        } finally {
            setPortalLoading(false)
        }
    }

    // A subscriber hitting checkout is answered with a billing portal link
    // rather than a second subscription, so the same call covers upgrades.
    const handleCheckout = async (planId: "weekly" | "player", interval: Interval) => {
        if (!isSignedIn) {
            // Come back to pricing after signing up, otherwise the checkout
            // intent is lost on Clerk's default landing page
            window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/plans")}`
            return
        }

        setLoading(interval)
        setError(null)
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, interval }),
            })

            // A 500 from the platform comes back as an HTML page, and parsing
            // that threw before the error state could be set — the button just
            // went quiet.
            const data = await response.json().catch(() => null)
            if (data?.url) {
                window.location.href = data.url
            } else {
                setError(data?.error || "Checkout didn't open. Try again in a moment, or email contact@tonelify.com.")
            }
        } catch {
            setError("Checkout didn't open. Check your connection and try again.")
        } finally {
            setLoading(null)
        }
    }

    const manageBilling = (
        <button
            onClick={openPortal}
            disabled={portalLoading}
            className="w-full h-11 rounded-xl border border-white/12 text-[#F2F0ED] font-bold flex items-center justify-center gap-2 hover:border-[#E8712A] disabled:opacity-60 transition-colors"
        >
            {portalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Manage billing"}
        </button>
    )

    return (
        <section className="py-16 md:py-24 bg-[#08080C]" id="pricing">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-8 md:mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8712A]/10 text-[#E8712A] text-xs font-semibold mb-4">
                        <Sparkles className="h-3 w-3" />
                        Simple, transparent pricing
                    </div>
                    {/* This component only renders on /plans, so it owns the H1 */}
                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F0ED] mb-3">
                        Tonelify pricing
                    </h1>
                    <p className="text-[#A6A29B] text-base md:text-lg max-w-xl mx-auto">
                        {PRICING_SENTENCE}
                    </p>
                </div>

                {/* Billing toggle. Only the Player card moves with it, so the
                    label says so rather than leaving the Week Pass ambiguous. */}
                <div className="flex flex-col items-center gap-2 mb-10 md:mb-12">
                    <div className="flex items-center bg-[#12121A] p-1.5 rounded-full border border-white/8">
                        {([
                            { id: "month" as const, label: "Monthly" },
                            { id: "year" as const, label: "Yearly", badge: `SAVE ${PRICING.year.percentOff}%` },
                        ]).map((b) => (
                            <button
                                key={b.id}
                                onClick={() => setBilling(b.id)}
                                aria-pressed={billing === b.id}
                                className={cn(
                                    "flex items-center gap-2 px-5 sm:px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200",
                                    billing === b.id
                                        ? "bg-[#E8712A] text-[#08080C] shadow-md"
                                        : "text-[#A6A29B] hover:text-[#F2F0ED]"
                                )}
                            >
                                {b.label}
                                {b.badge && (
                                    <span
                                        className={cn(
                                            "text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap",
                                            billing === b.id
                                                ? "bg-[#08080C]/20 text-[#08080C]"
                                                : "bg-[#F5A623]/15 text-[#F5A623]"
                                        )}
                                    >
                                        {b.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-[#8A8494]">Sets how the Player plan is billed</p>
                </div>

                {error && (
                    <p role="alert" className="text-center text-sm text-red-400 mb-6">{error}</p>
                )}

                {/* Ordered by what a month actually costs: $0, then Player at
                    the Player range, then the week pass, which costs the most per
                    month of the three if you keep renewing it. That puts the plan
                    we want people on in the
                    middle, which is where a three-option set gets picked from,
                    and it makes the pass read as flexibility rather than value.
                    On phones Player comes first so it is not below the fold. */}
                {/* No items-start: the cards stretch to a common height so the
                    three buttons land on one line whichever interval is picked */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* ── FREE ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="order-3 md:order-1 relative flex flex-col rounded-2xl bg-[#12121A] p-6 sm:p-7 border border-white/8"
                    >
                        <h3 className="text-xl font-bold text-[#F2F0ED]">Free</h3>
                        <p className="text-sm text-[#8A8494] font-medium mt-0.5">For trying it out</p>

                        <div className="mt-5 mb-5">
                            <div className="flex items-baseline gap-1">
                                <span className="font-display text-4xl font-bold text-[#F2F0ED]">$0</span>
                            </div>
                            <p className="text-sm text-[#A6A29B] mt-2">
                                {FREE_MATCHES} songs a month, free forever
                            </p>
                        </div>

                        <ul className="space-y-2.5 mb-5">
                            {freeFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check className="h-4 w-4 text-[#8A8494] shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#A6A29B]">{f}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mb-6 flex-1 pt-5 border-t border-white/6">
                            <ul className="space-y-2.5">
                                {freeLocked.map((f) => (
                                    <li key={f} className="flex items-start gap-3">
                                        <Lock className="h-3.5 w-3.5 text-[#5C5862] shrink-0 mt-1" />
                                        <span className="text-sm text-[#5C5862] line-through">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            {/* The caps are the only difference, and saying so is
                                the point: the paid plans are the same product
                                without a counter, not a better one. */}
                            <p className="text-xs text-[#8A8494] mt-4 leading-relaxed">
                                Those two counters are the only difference. Every match is the
                                same on every plan.
                            </p>
                        </div>

                        <Link
                            href="/tone-match"
                            className="w-full h-12 rounded-xl border border-white/12 text-[#F2F0ED] font-bold flex items-center justify-center hover:border-[#E8712A] transition-colors"
                        >
                            {isSubscribed ? "Go to tone matching" : "Start matching free"}
                        </Link>
                    </motion.div>

                    {/* ── WEEK PASS ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="order-2 md:order-3 relative flex flex-col rounded-2xl bg-[#12121A] p-6 sm:p-7 border border-white/8"
                    >
                        <h3 className="text-xl font-bold text-[#F2F0ED]">Week Pass</h3>
                        <p className="text-sm text-[#8A8494] font-medium mt-0.5">For one song or one gig</p>

                        <div className="mt-5 mb-5">
                            <div className="flex items-baseline gap-1">
                                <span className="font-display text-4xl font-bold text-[#F2F0ED]">{PRICING.week.price}</span>
                                <span className="text-[#8A8494] font-medium">{PRICING.week.per}</span>
                            </div>
                            <p className="text-sm text-[#A6A29B] mt-2">
                                {PRICING.week.monthlyEquivalent} a month if you keep renewing
                            </p>
                        </div>

                        <ul className="space-y-2.5 mb-6 flex-1">
                            {paidFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check className="h-4 w-4 text-[#F5A623] shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#F2F0ED]">{f}</span>
                                </li>
                            ))}
                        </ul>

                        {onWeekPass ? (
                            <div className="space-y-3">
                                <div className="w-full h-12 rounded-xl bg-[#E8712A]/10 border border-[#E8712A]/30 text-[#E8712A] font-bold flex items-center justify-center gap-2">
                                    <Check className="h-5 w-5" />
                                    You're on this plan
                                </div>
                                {manageBilling}
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => handleCheckout("weekly", "week")}
                                    disabled={loading !== null || onPlayer}
                                    className="w-full h-12 rounded-xl border border-white/12 text-[#F2F0ED] font-bold flex items-center justify-center gap-2 hover:border-[#E8712A] disabled:opacity-40 transition-colors"
                                >
                                    {loading === "week" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get the week pass"}
                                </button>
                                <p className="text-center text-xs text-[#8A8494] mt-3">
                                    {onPlayer
                                        ? "Your Player plan already covers this."
                                        : `No free trial. Renewed all year it comes to ${PRICING.week.yearTotal}.`}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* ── PLAYER ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="order-1 md:order-2 relative flex flex-col rounded-2xl bg-[#12121A] p-6 sm:p-7 border border-[#E8712A] shadow-xl shadow-[#E8712A]/10"
                    >
                        <div className="absolute -top-3.5 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-[#E8712A] text-[#08080C] text-[10px] font-black tracking-widest shadow-lg">
                            {billing === "year" ? "BEST VALUE" : "MOST POPULAR"}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-xl font-bold text-[#F2F0ED]">Player</h3>
                                <p className="text-sm text-[#8A8494] font-medium mt-0.5">For playing week in, week out</p>
                            </div>
                            {!isSubscribed && (
                                <span className="shrink-0 bg-[#E8712A]/10 text-[#E8712A] text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                                    {TRIAL_DAYS}-day trial
                                </span>
                            )}
                        </div>

                        {/* Keyed on the interval so switching the toggle animates
                            the number instead of silently swapping it */}
                        <motion.div
                            key={billing}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-5 mb-5"
                        >
                            {/* Anchor sits on its own line above the headline so
                                the discount pill never wraps under the price */}
                            {player.compare && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-[#8A8494] line-through decoration-[#D14B32] decoration-2">
                                        {player.compare}
                                    </span>
                                    {player.off && (
                                        <span className="bg-[#D14B32] text-[#F2F0ED] text-[11px] font-black px-2.5 py-1 rounded-full tracking-wider">
                                            {player.off}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className="font-display text-4xl font-bold text-[#F2F0ED]">{player.price}</span>
                                <span className="text-[#8A8494] font-medium">/month</span>
                            </div>
                            <p className="text-sm text-[#A6A29B] mt-2">{player.billed}</p>
                        </motion.div>

                        <ul className="space-y-2.5 mb-6 flex-1">
                            {paidFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check className="h-4 w-4 text-[#F5A623] shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#F2F0ED]">{f}</span>
                                </li>
                            ))}
                        </ul>

                        {onPlayer ? (
                            <div className="space-y-3">
                                <div className="w-full h-12 rounded-xl bg-[#E8712A]/10 border border-[#E8712A]/30 text-[#E8712A] font-bold flex items-center justify-center gap-2">
                                    <Check className="h-5 w-5" />
                                    You're on this plan
                                </div>
                                {manageBilling}
                                <p className="text-center text-xs text-[#8A8494]">
                                    Switch between monthly and yearly from the billing portal.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => handleCheckout("player", billing)}
                                    disabled={loading !== null}
                                    className="w-full h-12 rounded-xl text-[#08080C] font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
                                    style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }}
                                >
                                    {loading === billing ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : onWeekPass ? (
                                        billing === "year" ? "Switch to yearly" : "Switch to monthly"
                                    ) : (
                                        `Start ${TRIAL_DAYS}-day free trial`
                                    )}
                                </button>
                                {/* On monthly the footnote is the upsell, so it
                                    doubles as the way to take it */}
                                {billing === "year" ? (
                                    <p className="text-center text-xs text-[#F5A623] font-semibold mt-3">
                                        {onWeekPass
                                            ? "Stripe credits what you already paid on the week pass."
                                            : player.footnote}
                                    </p>
                                ) : (
                                    <button
                                        onClick={() => setBilling("year")}
                                        className="block w-full text-center text-xs text-[#A6A29B] mt-3 hover:text-[#F5A623] transition-colors"
                                    >
                                        {player.footnote}
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                <p className="text-center text-xs text-[#8A8494] mt-8">
                    Payments handled by Stripe. Cancel from Settings at any time.
                </p>

                {/* ── FAQ. Native details so the answers are in the markup for
                    anything that doesn't run JavaScript. ── */}
                <div className="max-w-2xl mx-auto mt-16 md:mt-20">
                    <h2 className="font-display text-2xl font-bold text-[#F2F0ED] text-center mb-6">
                        Before you pay
                    </h2>
                    <div className="divide-y divide-white/8 border-y border-white/8">
                        {PRICING_FAQ.map((f) => (
                            <details key={f.q} className="group py-4">
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[#F2F0ED] font-semibold text-sm sm:text-base">
                                    {f.q}
                                    <span className="text-[#E8712A] text-xl leading-none shrink-0 group-open:hidden">+</span>
                                    <span className="text-[#E8712A] text-xl leading-none shrink-0 hidden group-open:inline">&minus;</span>
                                </summary>
                                <p className="text-sm text-[#A6A29B] leading-relaxed mt-3">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
