"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

/**
 * Stripe sends the customer back here the moment the card clears, but the plan
 * only exists in our database once the webhook lands — usually a second or two
 * later, occasionally longer. Until then the dashboard rendered "Free", so a
 * paying customer's first view of the product told them they hadn't paid.
 *
 * This polls the subscription endpoint until the plan flips, then refreshes the
 * server components so every card on the page reflects the new plan.
 */
export function CheckoutSuccessBanner() {
    const params = useSearchParams()
    const router = useRouter()
    const isSuccess = params.get("checkout") === "success"
    const [state, setState] = useState<"pending" | "active" | "slow">("pending")

    useEffect(() => {
        if (!isSuccess) return
        let cancelled = false
        let attempts = 0

        const poll = async () => {
            attempts += 1
            try {
                const res = await fetch("/api/subscription", { cache: "no-store" })
                const data = res.ok ? await res.json() : null
                if (!cancelled && data && data.plan && data.plan !== "free") {
                    setState("active")
                    router.refresh()
                    return
                }
            } catch {
                // keep polling; a dropped request isn't a failed payment
            }
            if (cancelled) return
            // ~30 seconds of retries, then stop asking and say something useful
            if (attempts >= 15) {
                setState("slow")
                return
            }
            setTimeout(poll, 2000)
        }

        poll()
        return () => { cancelled = true }
    }, [isSuccess, router])

    if (!isSuccess) return null

    return (
        <div className="rounded-2xl border border-[#F5A623]/25 bg-[#F5A623]/8 px-5 py-4 flex items-start gap-3">
            {state === "active" ? (
                <CheckCircle2 className="h-5 w-5 text-[#FFD700] shrink-0 mt-0.5" />
            ) : (
                <Loader2 className="h-5 w-5 text-[#F5A623] shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="text-sm">
                {state === "active" && (
                    <>
                        <div className="font-bold text-[#F2F0ED]">Payment confirmed. Your plan is live.</div>
                        <div className="text-[#A6A29B] mt-0.5">Unlimited matching is unlocked. Go dial in a tone.</div>
                    </>
                )}
                {state === "pending" && (
                    <>
                        <div className="font-bold text-[#F2F0ED]">Payment received. Activating your plan…</div>
                        <div className="text-[#A6A29B] mt-0.5">This usually takes a couple of seconds.</div>
                    </>
                )}
                {state === "slow" && (
                    <>
                        <div className="font-bold text-[#F2F0ED]">Payment received.</div>
                        <div className="text-[#A6A29B] mt-0.5">
                            Your plan is taking longer than usual to switch over. Refresh in a minute. If it still
                            shows Free, email contact@tonelify.com and we&apos;ll sort it out straight away.
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
