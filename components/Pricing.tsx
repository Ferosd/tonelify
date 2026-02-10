"use client"

import { useState } from "react"
import { Check, Sparkles, Guitar, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

const plans = [
    {
        name: "Hobby",
        id: "hobby",
        emoji: "🎸",
        subtitle: "Perfect for casual players",
        price: { monthly: "$0", annual: "$0" },
        bill: { monthly: "", annual: "" },
        description: { monthly: "Free forever", annual: "Free forever" },
        save: { monthly: "", annual: "" },
        matchLimit: "5 tone matches / month",
        features: [
            "5 tone matches per month",
            "Basic amp settings",
            "Save up to 3 tones",
            "Community access",
        ],
        featured: false,
        cta: "Get Started Free",
        ctaLink: "/sign-up",
        cardStyle: "ring-slate-200 shadow-sm",
        buttonStyle: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
    },
    {
        name: "Guitarist",
        id: "guitarist",
        emoji: "⚡",
        subtitle: "For serious musicians",
        price: { monthly: "$8.99", annual: "$5.99" },
        bill: { monthly: "/mo", annual: "/mo" },
        description: { monthly: "Billed monthly", annual: "Billed as $71.88/year" },
        save: { monthly: "", annual: "Save $36.00 per year" },
        matchLimit: "100 tone matches / month",
        features: [
            "100 tone matches per month",
            "Advanced amp & pedal settings",
            "Unlimited saved tones",
            "Gear presets",
            "Priority support",
        ],
        featured: false,
        cta: "Start Free Trial →",
        ctaLink: "/sign-up",
        cardStyle: "ring-slate-200 shadow-sm",
        buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200",
    },
    {
        name: "Pro",
        id: "pro",
        emoji: "👑",
        subtitle: "For professionals & studios",
        price: { monthly: "$15.99", annual: "$10.99" },
        bill: { monthly: "/mo", annual: "/mo" },
        description: { monthly: "Billed monthly", annual: "Billed as $131.88/year" },
        save: { monthly: "", annual: "Save $60.00 per year" },
        matchLimit: "Unlimited tone matches",
        features: [
            "Unlimited tone matches",
            "Premium AI tone analysis",
            "Advanced pickup & EQ recommendations",
            "Unlimited saved tones & presets",
            "Early access to new features",
            "Priority support & direct feedback",
        ],
        featured: true,
        cta: "Start Free Trial →",
        ctaLink: "/sign-up",
        cardStyle: "ring-2 ring-blue-500 shadow-xl shadow-blue-100",
        buttonStyle: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300",
    },
]

export function Pricing() {
    const [annual, setAnnual] = useState(true)

    return (
        <div className="bg-slate-50 py-12 sm:py-24" id="pricing">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4">
                        <Sparkles className="h-3 w-3" />
                        Simple, transparent pricing
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                        Choose your plan
                    </h2>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        Start free, upgrade when you need more. All paid plans include a 7-day free trial.
                    </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex justify-center mb-12">
                    <div className="relative flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`relative z-10 px-5 sm:px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${!annual ? "text-slate-900 bg-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`relative z-10 px-5 sm:px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${annual ? "text-slate-900 bg-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Annual
                        </button>
                        {annual && (
                            <span className="absolute -top-3 -right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-in fade-in zoom-in duration-300">
                                SAVE 33%
                            </span>
                        )}
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="isolate mx-auto grid max-w-sm grid-cols-1 gap-6 md:max-w-none md:grid-cols-3">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`relative flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 ring-1 ${plan.cardStyle}`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg flex items-center gap-1.5">
                                    <Crown className="h-3 w-3" />
                                    MOST POPULAR
                                </div>
                            )}

                            <div>
                                {/* Plan Header */}
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl">{plan.emoji}</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{plan.subtitle}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mt-5 flex items-baseline gap-x-1">
                                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
                                        {annual ? plan.price.annual : plan.price.monthly}
                                    </span>
                                    {plan.bill.monthly && (
                                        <span className="text-lg font-bold text-slate-400">/mo</span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-slate-400 font-medium h-5">
                                    {annual ? plan.description.annual : plan.description.monthly}
                                </p>
                                {annual && plan.save.annual && (
                                    <p className="mt-1 text-sm font-bold text-emerald-600">
                                        {plan.save.annual}
                                    </p>
                                )}

                                {/* Match Limit Badge */}
                                <div className="mt-5 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <Zap className="h-4 w-4 text-blue-500 flex-none" />
                                    <span className="text-sm font-bold text-slate-700">{plan.matchLimit}</span>
                                </div>

                                {/* Features */}
                                <ul role="list" className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3 items-center">
                                            <Check className="h-4 w-4 flex-none text-blue-500" aria-hidden="true" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="mt-8">
                                <Link href={plan.ctaLink}>
                                    <Button
                                        className={`w-full h-12 sm:h-14 rounded-xl text-base sm:text-lg font-bold transition-all duration-200 ${plan.buttonStyle}`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                                {plan.id !== "hobby" && (
                                    <p className="mt-3 text-xs text-center text-slate-400 font-medium">
                                        7-day free trial • Cancel anytime
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Trust */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-400">
                        Secure payments via Stripe • No hidden fees • Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    )
}
