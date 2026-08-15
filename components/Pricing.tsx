"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Gift, Lock, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { PRICING_FAQ } from "@/lib/pricing-faq"
import {
    PRICING,
    PLAN_NAMES,
    TRIAL_DAYS,
    FREE_MATCHES,
    FREE_SAVED_TONES,
    STAGE_MATCHES,
    STAGE_SAVED_TONES,
} from "@/lib/pricing"

type Interval = "week" | "month" | "year"
/** Both paid tiers are sold monthly and yearly, so the toggle is binary. */
type Billing = "month" | "year"
type PaidPlanId = "weekly" | "stage" | "player"

/** One feature line: a claim, and the qualifier that keeps it honest. */
type Feature = { label: string; note?: string }

type Tier = {
    id: "free" | "stage" | "player"
    name: string
    tagline: string
    features: Feature[]
    /** Struck through under the features. Free only. */
    locked?: string[]
    highlight?: boolean
}

// Display only. Checkout posts the plan id and interval and the server resolves
// the real Stripe price, so nothing here can put a customer on a price they did
// not see. Every figure comes from lib/pricing so they cannot drift.
const TIERS: Record<"free" | "stage" | "player", Tier> = {
    free: {
        id: "free",
        name: PLAN_NAMES.free,
        tagline: "For trying it on one song",
        features: [
            { label: `${FREE_MATCHES} tone matches`, note: "per month" },
            { label: `${FREE_SAVED_TONES} saved tones`, note: "Keep them as long as you like" },
            { label: "Full amp settings", note: "Gain, bass, mids, treble, master" },
            { label: "Effects chain and gear presets", note: "Nothing held back" },
        ],
        locked: ["More than 3 matches a month", "More than 3 saved tones"],
    },
    stage: {
        id: "stage",
        name: PLAN_NAMES.stage,
        tagline: "For working up a setlist",
        features: [
            { label: `${STAGE_MATCHES} tone matches`, note: "per month" },
            { label: `${STAGE_SAVED_TONES} saved tones`, note: "Access them anytime" },
            { label: "Gear presets for each rig", note: "Quick setup for your gear" },
            { label: "Effects chain and signal order", note: "Where each pedal sits" },
            { label: "Sources on every match", note: "See where the settings came from" },
        ],
    },
    player: {
        id: "player",
        name: PLAN_NAMES.player,
        tagline: "For playing week in, week out",
        features: [
            { label: "Unlimited tone matches", note: "No monthly counter" },
            { label: "Unlimited saved tones", note: "Save as many as you want" },
            { label: "Gear presets for each rig", note: "Quick setup for your gear" },
            { label: "Effects chain and signal order", note: "Where each pedal sits" },
            { label: "Sources on every match", note: "See where the settings came from" },
            { label: "Tone tips for every match", note: "Technique the knobs cannot cover" },
            { label: "Priority support", note: "Get help when you need it" },
        ],
        highlight: true,
    },
}

/** What each paid tier shows for the selected interval. */
const BILLING: Record<"stage" | "player", Record<Billing, {
    /** Headline number, always per month so the two intervals compare directly. */
    price: string
    /** The real charge, set beside the headline the way a receipt would read it. */
    annual?: string
    /** What Stripe actually charges, spelled out under the headline. */
    billed: string
    /** Struck-through anchor. Only set where the comparison is a real one. */
    compare?: string
    off?: string
    saving?: string
}>> = {
    stage: {
        month: {
            price: PRICING.stage.month.price,
            billed: "Billed monthly, cancel anytime",
        },
        year: {
            price: PRICING.stage.year.perMonth,
            annual: `${PRICING.stage.year.price} a year`,
            billed: `${PRICING.stage.year.price} billed once a year`,
            compare: PRICING.stage.month.yearTotal,
            off: `${PRICING.stage.year.percentOff}% OFF`,
            saving: `Save ${PRICING.stage.year.saving} a year`,
        },
    },
    player: {
        month: {
            price: PRICING.month.price,
            billed: "Billed monthly, cancel anytime",
        },
        year: {
            price: PRICING.year.perMonth,
            annual: `${PRICING.year.price} a year`,
            billed: `${PRICING.year.price} billed once a year`,
            compare: PRICING.month.yearTotal,
            off: `${PRICING.year.percentOff}% OFF`,
            saving: `Save ${PRICING.year.saving} a year`,
        },
    },
}

/**
 * The pricing table, on /plans and on the signed-in half of the landing page.
 *
 * `stageAvailable` is resolved on the server from whether the Stage tier has
 * real Stripe price ids behind it. The card is not rendered without them: a
 * plan a visitor can see but cannot buy is worse than one tier fewer.
 *
 * Layout note: every card is the same stack of fixed-height slots (ribbon,
 * heading, price, trial, features, CTA) so the three columns line up row for
 * row whichever interval is picked. The slots that only one tier fills, the
 * struck-through anchor and the saving line, still reserve their height on the
 * cards that leave them empty. Without that the price numbers sat at three
 * different heights and the eye had to hunt for the comparison.
 */
export function Pricing({ stageAvailable = false }: { stageAvailable?: boolean }) {
    const [billing, setBilling] = useState<Billing>("year")
    const [loading, setLoading] = useState<string | null>(null)
    const [portalLoading, setPortalLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const { isSignedIn } = useUser()

    const tiers: Tier[] = stageAvailable
        ? [TIERS.free, TIERS.stage, TIERS.player]
        : [TIERS.free, TIERS.player]

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
    const handleCheckout = async (planId: PaidPlanId, interval: Interval) => {
        if (!isSignedIn) {
            // Come back to pricing after signing up, otherwise the checkout
            // intent is lost on Clerk's default landing page
            window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/plans")}`
            return
        }

        setLoading(`${planId}:${interval}`)
        setError(null)
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, interval }),
            })

            // A 500 from the platform comes back as an HTML page, and parsing
            // that threw before the error state could be set: the button just
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

                {/* ── HEADER ── */}
                <div className="text-center mb-10 md:mb-12">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#E8712A]/10 border border-[#E8712A]/25 mb-6">
                        <Gift className="h-4 w-4 text-[#F5A623] shrink-0" />
                        <span className="text-[#F5A623] text-xs sm:text-sm font-bold tracking-wide">
                            {TRIAL_DAYS}-DAY FREE TRIAL
                        </span>
                        <span aria-hidden="true" className="text-[#E8712A]/50">&bull;</span>
                        <span className="text-[#F2F0ED] text-xs sm:text-sm font-semibold">
                            Cancel before it ends, pay nothing
                        </span>
                    </div>

                    {/* This component owns the H1 on /plans. On the landing page it
                        sits under that page's H1, which is why it is styled as a
                        display line rather than trusted to be the only one. */}
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F2F0ED] mb-4">
                        Plans that fit how you play
                    </h1>
                    <p className="text-[#A6A29B] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                        Name a song and the gear you already own. Get the knob positions that
                        get you there.
                    </p>
                    <p className="text-[#8A8494] text-sm mt-3">
                        Join 1,000+ guitarists dialing in their own rigs
                    </p>
                </div>

                {/* ── BILLING TOGGLE ── */}
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
                                    "flex items-center gap-2 px-5 sm:px-7 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200",
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
                    <p className="text-xs text-[#8A8494]">
                        Sets how the paid plans are billed
                    </p>
                </div>

                {error && (
                    <p role="alert" className="text-center text-sm text-red-400 mb-6">{error}</p>
                )}

                {/* ── PLAN CARDS ──
                    A ladder read left to right: free, metered, unlimited. The
                    grid stretches every card to a common height and each card is
                    the same slot stack inside, so headings, prices, trial boxes
                    and buttons all land on one line. */}
                <div className={cn(
                    "grid grid-cols-1 gap-5 items-stretch",
                    tiers.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 md:max-w-3xl md:mx-auto"
                )}>
                    {tiers.map((tier, i) => {
                        const paid = tier.id !== "free"
                        const b = paid ? BILLING[tier.id as "stage" | "player"][billing] : null
                        const onThisPlan = currentPlan === tier.id
                        const busy = loading === `${tier.id}:${billing}`
                        // The ribbon is only earned while the tier can still be
                        // bought. Badging a plan someone already pays for reads
                        // as a sales pitch aimed at a customer.
                        const ribbon = tier.highlight && !isSubscribed
                            ? (billing === "year" ? "BEST VALUE" : "MOST POPULAR")
                            : null

                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className={cn(
                                    "relative flex flex-col overflow-hidden rounded-2xl bg-[#12121A]",
                                    tier.highlight
                                        ? "border border-[#E8712A] shadow-xl shadow-[#E8712A]/10"
                                        : "border border-white/8"
                                )}
                            >
                                {/* Slot 1: the ribbon rail. Empty on the other
                                    cards rather than absent, so all three card
                                    headings start at the same y. */}
                                <div
                                    className={cn(
                                        "h-8 flex items-center justify-center shrink-0",
                                        ribbon && "text-[#08080C] text-[10px] font-black tracking-[0.14em]"
                                    )}
                                    style={ribbon
                                        ? { background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }
                                        : undefined}
                                >
                                    {ribbon}
                                </div>

                                <div className="flex flex-col flex-1 p-6 sm:p-7 pt-5">
                                    {/* Slot 2: heading. Two fixed lines, so a
                                        one-word name and a long tagline still
                                        push the price to the same place. */}
                                    <div className="flex items-start justify-between gap-3 min-h-[52px]">
                                        <div>
                                            <h3 className="text-xl font-bold leading-tight text-[#F2F0ED]">{tier.name}</h3>
                                            <p className="text-sm text-[#8A8494] font-medium mt-1 leading-snug">{tier.tagline}</p>
                                        </div>
                                        {paid && !isSubscribed && (
                                            <span className="shrink-0 bg-[#E8712A]/10 text-[#E8712A] text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                                                {TRIAL_DAYS}-day trial
                                            </span>
                                        )}
                                    </div>

                                    {/* Slot 3: price. Keyed on the interval so
                                        switching the toggle animates the number
                                        instead of silently swapping it. Each
                                        line reserves its height whether or not
                                        this tier fills it. */}
                                    <motion.div
                                        key={billing}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="mt-5"
                                    >
                                        {/* Anchor sits on its own line above the
                                            headline so the discount pill never
                                            wraps under the price */}
                                        <div className="flex items-center gap-2 h-7">
                                            {b?.compare && (
                                                <>
                                                    <span className="text-base font-bold text-[#8A8494] line-through decoration-[#D14B32] decoration-2">
                                                        {b.compare}
                                                    </span>
                                                    {b.off && (
                                                        <span className="bg-[#D14B32] text-[#F2F0ED] text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider">
                                                            {b.off}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-baseline flex-wrap gap-x-2">
                                            <span className="font-display text-[2.75rem] leading-none font-bold text-[#F2F0ED]">
                                                {paid ? b!.price : "$0"}
                                            </span>
                                            <span className="text-[#8A8494] font-medium">
                                                {paid ? "/mo" : "forever"}
                                            </span>
                                            {b?.annual && (
                                                <span className="text-sm text-[#8A8494] font-medium">
                                                    ({b.annual})
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#A6A29B] mt-2.5 h-5">
                                            {paid ? b!.billed : `${FREE_MATCHES} songs a month, no card`}
                                        </p>
                                        <p className="text-sm text-[#F5A623] font-semibold mt-1 h-5">
                                            {b?.saving ?? ""}
                                        </p>
                                    </motion.div>

                                    <div className="mt-5 mb-5 border-t border-white/8" />

                                    {/* Slot 4: what the money does before it is
                                        money. Free fills the same box so the
                                        feature lists below start level. */}
                                    <div className={cn(
                                        "mb-5 rounded-xl border px-4 py-3 min-h-[84px]",
                                        paid && !isSubscribed
                                            ? "border-[#E8712A]/20 bg-[#E8712A]/[0.06]"
                                            : "border-white/8 bg-white/[0.02]"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <Gift className={cn(
                                                "h-4 w-4 shrink-0",
                                                paid && !isSubscribed ? "text-[#F5A623]" : "text-[#8A8494]"
                                            )} />
                                            <span className="text-sm font-bold text-[#F2F0ED]">
                                                {paid
                                                    ? (isSubscribed ? "Your plan, in full" : `${TRIAL_DAYS}-day free trial`)
                                                    : "No card required"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#A6A29B] mt-1 leading-relaxed">
                                            {paid
                                                ? (isSubscribed
                                                    ? "Switch between plans whenever you like. Stripe credits the days you already paid for."
                                                    : `The whole plan for ${TRIAL_DAYS} days. Cancel before it ends and your card is never charged.`)
                                                : "Start matching in a minute. The count resets on the first of each month."}
                                        </p>
                                    </div>

                                    {/* Slot 5: features. Takes the slack, which
                                        is what pins every button to the same
                                        line despite four, five or seven rows. */}
                                    <div className="flex-1">
                                        <ul className="space-y-3">
                                            {tier.features.map((f) => (
                                                <li key={f.label} className="flex items-start gap-3">
                                                    <span className={cn(
                                                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                                        paid ? "bg-[#F5A623]/12" : "bg-white/6"
                                                    )}>
                                                        <Check className={cn(
                                                            "h-3 w-3",
                                                            paid ? "text-[#F5A623]" : "text-[#8A8494]"
                                                        )} />
                                                    </span>
                                                    <span>
                                                        <span className={cn(
                                                            "block text-sm font-semibold leading-snug",
                                                            paid ? "text-[#F2F0ED]" : "text-[#A6A29B]"
                                                        )}>
                                                            {f.label}
                                                        </span>
                                                        {f.note && (
                                                            <span className="block text-xs text-[#8A8494] mt-0.5">{f.note}</span>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {tier.locked && (
                                            <div className="mt-5 pt-5 border-t border-white/6">
                                                <ul className="space-y-2.5">
                                                    {tier.locked.map((f) => (
                                                        <li key={f} className="flex items-start gap-3">
                                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/4">
                                                                <Lock className="h-3 w-3 text-[#5C5862]" />
                                                            </span>
                                                            <span className="text-sm text-[#5C5862] line-through leading-snug">{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {/* The caps are the only difference, and
                                                    saying so is the point: the paid plans
                                                    are the same product without a
                                                    counter, not a better one. */}
                                                <p className="text-xs text-[#8A8494] mt-4 leading-relaxed">
                                                    Those counters are the only difference. Every match is the same
                                                    on every plan.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Slot 6: CTA, flush to the bottom edge of
                                        every card. */}
                                    <div className="mt-6">
                                        {tier.id === "free" ? (
                                            <>
                                                <Link
                                                    href="/tone-match"
                                                    className="w-full h-12 rounded-xl border border-white/12 text-[#F2F0ED] font-bold flex items-center justify-center gap-2 hover:border-[#E8712A] transition-colors"
                                                >
                                                    {isSubscribed ? "Go to tone matching" : "Start matching free"}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                                <p className="text-center text-xs text-[#8A8494] mt-3">
                                                    No card, nothing to cancel
                                                </p>
                                            </>
                                        ) : onThisPlan ? (
                                            <div className="space-y-3">
                                                <div className="w-full h-12 rounded-xl bg-[#E8712A]/10 border border-[#E8712A]/30 text-[#E8712A] font-bold flex items-center justify-center gap-2">
                                                    <Check className="h-5 w-5" />
                                                    You&apos;re on this plan
                                                </div>
                                                {manageBilling}
                                                <p className="text-center text-xs text-[#8A8494]">
                                                    Switch between monthly and yearly from the billing portal.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleCheckout(tier.id as PaidPlanId, billing)}
                                                    disabled={loading !== null}
                                                    className={cn(
                                                        "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity",
                                                        tier.highlight
                                                            ? "text-[#08080C] hover:opacity-90"
                                                            : "border border-white/12 text-[#F2F0ED] hover:border-[#E8712A] transition-colors"
                                                    )}
                                                    style={tier.highlight
                                                        ? { background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }
                                                        : undefined}
                                                >
                                                    {busy ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : isSubscribed ? (
                                                        <>
                                                            {`Switch to ${tier.name}`}
                                                            <ArrowRight className="h-4 w-4" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            {`Start ${TRIAL_DAYS}-day free trial`}
                                                            <ArrowRight className="h-4 w-4" />
                                                        </>
                                                    )}
                                                </button>
                                                <p className="text-center text-xs text-[#8A8494] mt-3">
                                                    {onWeekPass
                                                        ? "Stripe credits what you already paid on the week pass."
                                                        : "Cancel anytime. No hidden fees."}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* The week pass stays on sale without taking a card. It costs
                    more per month than either plan if it keeps renewing, so it is
                    offered as flexibility rather than ranked as value. */}
                <p className="text-center text-sm text-[#A6A29B] mt-10 max-w-xl mx-auto leading-relaxed">
                    Only need it for one song? The{" "}
                    <span className="text-[#F5A623] font-semibold">{PLAN_NAMES.weekly}</span> gives you
                    everything unlimited for {PRICING.week.price} a week, no trial.{" "}
                    <button
                        onClick={() => handleCheckout("weekly", "week")}
                        disabled={loading !== null}
                        className="text-[#F5A623] font-semibold underline underline-offset-4 hover:text-[#FFD700] disabled:opacity-60 transition-colors"
                    >
                        {loading === "weekly:week" ? "Opening checkout…" : "Get the week pass"}
                    </button>
                </p>

                <p className="text-center text-xs text-[#8A8494] mt-4">
                    Payments handled by Stripe. Cancel from Settings at any time.
                </p>

                {/* ── FAQ. Native details so the answers are in the markup for
                    anything that doesn't run JavaScript. ── */}
                <div className="max-w-3xl mx-auto mt-16 md:mt-20">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F0ED] text-center mb-8">
                        Before you pay
                    </h2>
                    <div className="space-y-3">
                        {PRICING_FAQ.map((f) => (
                            <details
                                key={f.q}
                                className="group rounded-xl border border-white/8 bg-[#12121A] px-5 py-4 open:border-[#E8712A]/25"
                            >
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
