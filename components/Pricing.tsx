"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Sparkles, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

type Interval = "week" | "month" | "year"

const intervals: { id: Interval; label: string }[] = [
    { id: "week", label: "Weekly" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Yearly" },
]

// Mirrors the Stripe prices. Amounts here are display only; checkout always
// resolves the real price id on the server.
const paid: Record<Interval, {
    planId: "weekly" | "player"
    name: string
    price: string
    per: string
    note: string
    cta: string
    trial: boolean
}> = {
    week: {
        planId: "weekly",
        name: "Week Pass",
        price: "$4.99",
        per: "/week",
        note: "Renews weekly until you cancel",
        cta: "Get the week pass",
        trial: false,
    },
    month: {
        planId: "player",
        name: "Player",
        price: "$12.99",
        per: "/month",
        note: "Cancel anytime",
        cta: "Start 3-day free trial",
        trial: true,
    },
    year: {
        planId: "player",
        name: "Player",
        price: "$59.99",
        per: "/year",
        note: "Works out at $5.00 a month. Save $95.89 against monthly.",
        cta: "Start 3-day free trial",
        trial: true,
    },
}

const paidFeatures = [
    "Unlimited tone matches",
    "Unlimited saved tones",
    "Gear presets for each of your rigs",
    "Full amp settings: gain, bass, mids, treble, master",
    "Effects chain and signal order",
    "Tone tips for every match",
    "Priority support",
]

const freeFeatures = [
    "3 tone matches per month",
    "3 saved tones",
    "Full amp settings on every match",
    "No card required",
]

export function Pricing() {
    const [interval, setInterval] = useState<Interval>("month")
    const [loading, setLoading] = useState(false)
    const [portalLoading, setPortalLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const { isSignedIn } = useUser()

    const plan = paid[interval]

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

    const openPortal = async () => {
        setPortalLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/stripe/portal", { method: "POST" })
            const data = await res.json()
            if (data.url) window.location.href = data.url
            else setError(data.error || "Couldn't open the billing portal. Try again in a moment.")
        } catch {
            setError("Couldn't open the billing portal. Check your connection and try again.")
        } finally {
            setPortalLoading(false)
        }
    }

    const handleCheckout = async () => {
        if (!isSignedIn) {
            window.location.href = "/sign-up"
            return
        }

        setLoading(true)
        setError(null)
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.planId, interval }),
            })

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                setError(data.error || "Checkout didn't open. Try again in a moment.")
            }
        } catch {
            setError("Checkout didn't open. Check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="py-16 md:py-24 bg-[#08080C]" id="pricing">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

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
                        Start free with three tone matches a month. Unlimited matching costs $4.99 for a
                        week, $12.99 a month, or $59.99 a year.
                    </p>
                </div>

                {/* Interval toggle */}
                <div className="flex justify-center mb-10 md:mb-12">
                    <div className="flex items-center bg-[#12121A] p-1.5 rounded-full border border-white/8">
                        {intervals.map((i) => (
                            <button
                                key={i.id}
                                onClick={() => setInterval(i.id)}
                                aria-pressed={interval === i.id}
                                className={cn(
                                    "px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200",
                                    interval === i.id
                                        ? "bg-[#E8712A] text-[#08080C] shadow-md"
                                        : "text-[#A6A29B] hover:text-[#F2F0ED]"
                                )}
                            >
                                {i.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                    {/* Free */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="relative flex flex-col rounded-2xl bg-[#12121A] p-6 sm:p-8 border border-white/8"
                    >
                        <h3 className="text-2xl font-bold text-[#F2F0ED]">Free</h3>
                        <p className="text-sm text-[#8A8494] font-medium mt-0.5">For trying it out</p>

                        <div className="flex items-baseline gap-1 mt-6 mb-6">
                            <span className="font-display text-5xl font-bold text-[#F2F0ED]">$0</span>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {freeFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check className="h-4 w-4 text-[#8A8494] shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#A6A29B]">{f}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/tone-match"
                            className="w-full h-12 rounded-xl border border-white/12 text-[#F2F0ED] font-bold flex items-center justify-center hover:border-[#E8712A] transition-colors"
                        >
                            Start matching free
                        </Link>
                    </motion.div>

                    {/* Paid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="relative flex flex-col rounded-2xl bg-[#12121A] p-6 sm:p-8 border border-[#E8712A] shadow-xl shadow-[#E8712A]/10"
                    >
                        {interval === "year" && (
                            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-5 py-1.5 rounded-full bg-[#E8712A] text-[#08080C] text-xs font-bold tracking-wide shadow-lg">
                                BEST VALUE
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                                <h3 className="text-2xl font-bold text-[#F2F0ED]">{plan.name}</h3>
                                <p className="text-sm text-[#8A8494] font-medium mt-0.5">Everything, no caps</p>
                            </div>
                            {plan.trial && !isSubscribed && (
                                <span className="shrink-0 bg-[#E8712A]/10 text-[#E8712A] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                                    3-day free trial
                                </span>
                            )}
                        </div>

                        <div className="flex items-baseline gap-1 mt-6">
                            <span className="font-display text-5xl font-bold text-[#F2F0ED]">{plan.price}</span>
                            <span className="text-[#8A8494] font-medium">{plan.per}</span>
                        </div>
                        <p className="text-xs text-[#A6A29B] mt-2 mb-6">{plan.note}</p>

                        <ul className="space-y-3 mb-8 flex-1">
                            {paidFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check className="h-4 w-4 text-[#F5A623] shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#F2F0ED]">{f}</span>
                                </li>
                            ))}
                        </ul>

                        {error && (
                            <p role="alert" className="text-sm text-red-400 mb-3">{error}</p>
                        )}

                        {isSubscribed ? (
                            <div className="space-y-3">
                                <div className="w-full h-12 rounded-xl bg-[#E8712A]/10 border border-[#E8712A]/30 text-[#E8712A] font-bold flex items-center justify-center gap-2">
                                    <Check className="h-5 w-5" />
                                    You're on this plan
                                </div>
                                <button
                                    onClick={openPortal}
                                    disabled={portalLoading}
                                    className="w-full h-11 rounded-xl border border-white/12 text-[#F2F0ED] font-bold flex items-center justify-center gap-2 hover:border-[#E8712A] disabled:opacity-60 transition-colors"
                                >
                                    {portalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Manage billing"}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full h-12 rounded-xl text-[#08080C] font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
                                style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : plan.cta}
                            </button>
                        )}
                    </motion.div>
                </div>

                <p className="text-center text-xs text-[#8A8494] mt-8">
                    Payments handled by Stripe. Cancel from Settings at any time.
                </p>
            </div>
        </section>
    )
}
