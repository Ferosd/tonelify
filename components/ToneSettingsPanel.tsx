"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Lock } from "lucide-react"
// Deliberately the public half, not lib/tone-settings: that module holds the
// per-genre table of every locked value, and importing it here would ship the
// whole thing to the browser.
import {
    SETTING_ROWS,
    isOpenSetting,
    type AmpSettings,
} from "@/lib/tone-settings-public"

type Unlocked = {
    settings: AmpSettings
    effects: string[]
    keyControl: string
}

type Props = {
    slug: string
    /** Only the knobs that are public. The rest never reach the browser unlocked. */
    openSettings: Partial<AmpSettings>
}

/**
 * The knob panel, with the locked half fetched rather than rendered.
 *
 * The page around this is statically generated, so anything printed here at
 * build time is in the HTML for everyone, crawlers included. The locked values
 * are therefore not in the page at all: a subscriber's browser asks
 * /api/tone-unlock for them after hydration, and that route is the only place
 * the gate is enforced.
 *
 * They are also absent rather than zeroed. Rendering a hidden knob as "0" is
 * how a paywall turns into misinformation, because an answer engine reads the
 * zero as a real setting and quotes it.
 */
export function ToneSettingsPanel({ slug, openSettings }: Props) {
    const { isSignedIn, isLoaded } = useUser()
    const [data, setData] = useState<Unlocked | null>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) {
            setChecked(true)
            return
        }
        let cancelled = false
        fetch(`/api/tone-unlock?slug=${encodeURIComponent(slug)}`)
            .then(async (res) => (res.ok ? await res.json() : null))
            .then((json) => {
                if (cancelled) return
                if (json && json.locked === false) setData(json as Unlocked)
                setChecked(true)
            })
            .catch(() => {
                if (!cancelled) setChecked(true)
            })
        return () => {
            cancelled = true
        }
    }, [isLoaded, isSignedIn, slug])

    const unlocked = Boolean(data)

    return (
        <div className="space-y-5" data-tone-locked={unlocked ? "false" : "true"}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SETTING_ROWS.map((row) => {
                    const open = isOpenSetting(row.key)
                    const value = open ? openSettings[row.key] : data?.settings[row.key]
                    const showValue = value !== undefined

                    return (
                        <div
                            key={row.key}
                            className={`rounded-xl px-3 py-3 text-center border ${showValue
                                ? "bg-[#08080C] border-white/8"
                                : "bg-[#0C0A0E] border-[#F5A623]/20"
                                }`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A8494]">
                                {row.label}
                            </div>
                            {showValue ? (
                                <div className="font-mono text-xl font-medium text-[#FFD700] mt-1">{value}</div>
                            ) : (
                                <div className="h-7 mt-1 flex items-center justify-center" aria-label={`${row.label} is part of a plan`}>
                                    <Lock className="h-4 w-4 text-[#F5A623]/70" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="space-y-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-[#8A8494]">Signal chain</dt>
                    <dd className="text-[#A6A29B] leading-relaxed">
                        {unlocked ? (
                            data!.effects.join(" → ")
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#8A8494]">
                                <Lock className="h-3.5 w-3.5 text-[#F5A623]/70" />
                                Pedal order comes with a plan
                            </span>
                        )}
                    </dd>
                </div>
                <div className="space-y-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-[#8A8494]">The control that matters most</dt>
                    <dd className="text-[#A6A29B] leading-relaxed">
                        {unlocked ? (
                            data!.keyControl
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#8A8494]">
                                <Lock className="h-3.5 w-3.5 text-[#F5A623]/70" />
                                One control decides this tone, and it is not the gain knob on every style
                            </span>
                        )}
                    </dd>
                </div>
            </dl>

            {/* Held back until the check resolves, so a subscriber never sees a
                "get a plan" prompt flash on a page they already paid for */}
            {checked && !unlocked && (
                <div className="rounded-2xl border border-[#F5A623]/25 bg-[#08080C] p-5 space-y-3">
                    <p className="text-sm text-[#F2F0ED] leading-relaxed">
                        Gain and bass are open on every tone in the library. The middle, treble, presence
                        and reverb positions, the pedal order and the one control that decides this style
                        come with a plan, along with the same settings rewritten for the amp you own.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/plans"
                            className="inline-flex items-center h-11 px-6 rounded-full font-bold text-sm text-[#08080C]"
                            style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }}
                        >
                            See plans
                        </Link>
                        {!isSignedIn && (
                            <Link
                                href="/sign-in"
                                className="inline-flex items-center h-11 px-6 rounded-full font-bold text-sm text-[#A6A29B] border border-white/10 hover:text-[#F2F2F7] hover:border-[#F5A623]/40 transition-colors"
                            >
                                I already have one
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
