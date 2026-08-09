"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"

interface SubscriptionCardProps {
    plan: string
    planName: string
    status: string
    matchesUsed: number
    matchLimit: number
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
}

function formatDate(iso: string | null): string | null {
    if (!iso) return null
    const d = new Date(iso)
    return Number.isNaN(d.getTime())
        ? null
        : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export function SubscriptionCard({
    plan,
    planName,
    status,
    matchesUsed,
    matchLimit,
    currentPeriodEnd,
    cancelAtPeriodEnd,
}: SubscriptionCardProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isPaid = plan !== "free"
    const unlimited = matchLimit === -1
    const renewDate = formatDate(currentPeriodEnd)
    const pct = unlimited || matchLimit === 0 ? 0 : Math.min(100, Math.round((matchesUsed / matchLimit) * 100))

    const openPortal = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/stripe/portal", { method: "POST" })
            const data = await res.json().catch(() => null)
            if (data?.url) window.location.href = data.url
            else setError(data?.error || "Couldn't open the billing portal. Try again in a moment.")
        } catch {
            setError("Couldn't open the billing portal. Check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>Subscription</CardTitle>
                        <CardDescription>
                            {isPaid ? "Your active plan" : "Current plan usage"}
                        </CardDescription>
                    </div>
                    {isPaid && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#08080C] bg-[#E8712A] px-2.5 py-1 rounded-full">
                            <Check className="h-3 w-3" /> Active
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-semibold text-[#F5A623]">{planName}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Matches used</span>
                        <span className="font-medium">
                            {matchesUsed} / {unlimited ? "∞" : matchLimit}
                        </span>
                    </div>

                    {!unlimited && (
                        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[#E8712A]"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    )}

                    {isPaid && renewDate && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {cancelAtPeriodEnd ? "Access until" : "Renews"}
                            </span>
                            <span className="font-medium">{renewDate}</span>
                        </div>
                    )}

                    {isPaid && status !== "active" && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium capitalize">{status}</span>
                        </div>
                    )}

                    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

                    {isPaid ? (
                        <>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={openPortal}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Manage billing
                            </Button>
                            {cancelAtPeriodEnd && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Cancels at the end of this period
                                </p>
                            )}
                        </>
                    ) : (
                        <Link href="/plans" className="w-full mt-4 block">
                            <Button variant="outline" className="w-full">Upgrade plan</Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
