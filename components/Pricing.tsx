"use client"

import { useState } from "react"
import { Check, Sparkles, Loader2, Calendar, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

interface PlanFeature {
    title: string
    description: string
}

const plans = [
    {
        name: "Beginner",
        id: "beginner",
        price: { monthly: "$5.99", annual: "$2.50" },
        period: { monthly: "/mo", annual: "/mo" },
        billing: { monthly: "", annual: "($29.99/year)" },
        save: { monthly: "", annual: "Save $41.89 per year" },
        trial: { adaptations: 6 },
        featured: false,
        features: [
            { title: "20 custom tone adaptations", description: "per month" },
            { title: "15 saved tones", description: "per month • Access them anytime" },
            { title: "Create gear presets", description: "Quick setup for your rig" },
        ] as PlanFeature[],
    },
    {
        name: "Expert",
        id: "expert",
        price: { monthly: "$9.99", annual: "$3.75" },
        period: { monthly: "/mo", annual: "/mo" },
        billing: { monthly: "", annual: "($44.99/year)" },
        save: { monthly: "", annual: "Save $74.89 per year" },
        trial: { adaptations: 9 },
        featured: true,
        features: [
            { title: "Unlimited custom tone adaptations", description: "per month" },
            { title: "Unlimited saved tones", description: "Save as many as you want" },
            { title: "Create gear presets", description: "Quick setup for your rig" },
            { title: "Priority support", description: "Get help when you need it" },
        ] as PlanFeature[],
    },
]

export function Pricing() {
    const [annual, setAnnual] = useState(false)
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const { isSignedIn } = useUser()

    const handleCheckout = async (planId: string) => {
        if (!isSignedIn) {
            window.location.href = "/sign-up"
            return
        }

        setLoadingPlan(planId)
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, annual }),
            })

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert("Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error("Checkout error:", error)
            alert("Something went wrong. Please try again.")
        } finally {
            setLoadingPlan(null)
        }
    }

    return (
        <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-300" id="pricing">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
                        <Sparkles className="h-3 w-3" />
                        Simple, transparent pricing
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                        Choose your plan
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                        All plans include a 7-day free trial. Cancel anytime.
                    </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex justify-center mb-12">
                    <div className="relative flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setAnnual(false)}
                            className={cn(
                                "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-200",
                                !annual
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={cn(
                                "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-200",
                                annual
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            Annual
                        </button>
                        <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                            Insane Deal!
                        </span>
                    </div>
                </div>

                {/* Plans Grid — 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={cn(
                                "relative flex flex-col rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 sm:p-8 border",
                                plan.featured && annual
                                    ? "border-blue-500 dark:border-blue-500 shadow-xl shadow-blue-100/50 dark:shadow-blue-900/20"
                                    : "border-slate-200 dark:border-white/10 shadow-lg"
                            )}
                        >
                            {/* MOST POPULAR Badge */}
                            {plan.featured && annual && (
                                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            {/* 7-DAY FREE TRIAL Badge */}
                            <div className="flex items-center justify-between mb-1">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                    <p className="text-sm text-slate-400 font-medium mt-0.5">
                                        {annual ? "Annual" : "Monthly"}
                                    </p>
                                </div>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    7-Day Free Trial
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mt-4 flex items-baseline gap-x-1.5">
                                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {annual ? plan.price.annual : plan.price.monthly}
                                </span>
                                <span className="text-lg font-bold text-slate-400">/mo</span>
                                {annual && plan.billing.annual && (
                                    <span className="text-sm text-slate-400 font-medium ml-1">
                                        {plan.billing.annual}
                                    </span>
                                )}
                            </div>
                            {annual && plan.save.annual && (
                                <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {plan.save.annual}
                                </p>
                            )}

                            {/* Trial Box */}
                            <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/70 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                                <div className="flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">7-Day Free Trial</p>
                                    <p className="text-xs text-blue-500 font-medium">
                                        {plan.trial.adaptations} total adaptations during trial
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="mt-6 space-y-4 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature.title} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 flex-none text-blue-500 mt-0.5" />
                                        <div>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{feature.title}</span>
                                            <p className="text-xs text-slate-400">{feature.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <div className="mt-8">
                                <Button
                                    onClick={() => handleCheckout(plan.id)}
                                    disabled={loadingPlan === plan.id}
                                    className={cn(
                                        "w-full h-14 rounded-full text-base font-bold transition-all duration-200",
                                        plan.featured
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                                    )}
                                >
                                    {loadingPlan === plan.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Start 7-Day Free Trial
                                            <span className="ml-2">→</span>
                                        </>
                                    )}
                                </Button>
                                <p className="mt-3 text-xs text-center text-slate-400 font-medium">
                                    Cancel anytime • No hidden fees
                                </p>
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
        </section>
    )
}
