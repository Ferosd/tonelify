"use client"

import { useMemo, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Bug, Lightbulb, Wrench, Heart, MessageSquare, Check, Sliders } from "lucide-react"
import {
    FEEDBACK_KINDS,
    FEEDBACK_MIN,
    FEEDBACK_MAX,
    type FeedbackKind,
} from "@/lib/validations/feedback"

const ICONS: Record<FeedbackKind, typeof Bug> = {
    bug: Bug,
    gear: Sliders,
    feature: Lightbulb,
    improvement: Wrench,
    praise: Heart,
    other: MessageSquare,
}

const KIND_VALUES = FEEDBACK_KINDS.map((k) => k.value) as readonly FeedbackKind[]

/**
 * The feedback form.
 *
 * It knows nothing about where the message ends up. The destination address is
 * read on the server in lib/mail.ts and is deliberately absent from this file,
 * from the props, and from the page: an address printed anywhere in the client
 * is an address in the HTML and in every scraper's list.
 */
export function FeedbackForm() {
    const { user } = useUser()
    const pathname = usePathname()
    const params = useSearchParams()

    // /request-gear redirects here as ?kind=gear, so somebody who followed an
    // old link lands on the tile they were looking for rather than on "Bug".
    const requested = params.get("kind") as FeedbackKind | null
    const initialKind: FeedbackKind =
        requested && KIND_VALUES.includes(requested) ? requested : "bug"

    const [kind, setKind] = useState<FeedbackKind>(initialKind)
    const [message, setMessage] = useState("")
    const [gearName, setGearName] = useState("")
    const [email, setEmail] = useState("")
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isGear = kind === "gear"
    const trimmed = message.trim()
    const short = Math.max(0, FEEDBACK_MIN - trimmed.length)
    // A gear request also has to name the gear, or the queue fills with rows
    // nobody can act on.
    const valid =
        trimmed.length >= FEEDBACK_MIN &&
        trimmed.length <= FEEDBACK_MAX &&
        (!isGear || gearName.trim().length >= 2)

    // Signed-in senders are already identified, so the field is only asked for
    // when there is no account behind the message.
    const askEmail = useMemo(() => !user, [user])

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!valid || sending) return
        setSending(true)
        setError(null)

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kind,
                    message: trimmed,
                    gearName: isGear ? gearName.trim() : "",
                    email: askEmail ? email.trim() : "",
                    pagePath: pathname || "",
                }),
            })
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                setError(data?.error || "That didn't send. Please try again.")
                return
            }
            setSent(true)
            setMessage("")
        } catch {
            setError("That didn't send. Check your connection and try again.")
        } finally {
            setSending(false)
        }
    }

    if (sent) {
        return (
            <div className="rounded-2xl border border-[#F5A623]/25 bg-[#12121A] p-8 text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
                    <Check className="h-6 w-6 text-[#F5A623]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Sent</h2>
                <p className="text-sm text-[#A6A29B] leading-relaxed max-w-md mx-auto">
                    That went straight to the person who builds this. If you left an address, expect
                    a reply rather than an autoresponder.
                </p>
                <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="inline-flex items-center h-11 px-6 rounded-full border border-white/10 text-sm font-bold text-[#A6A29B] hover:text-[#F2F2F7] hover:border-[#F5A623]/40 transition-colors"
                >
                    Send something else
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <fieldset className="space-y-3">
                <legend className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#F5A623] mb-3">
                    What kind of feedback is this?
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FEEDBACK_KINDS.map((k) => {
                        const Icon = ICONS[k.value]
                        const active = kind === k.value
                        return (
                            <button
                                key={k.value}
                                type="button"
                                onClick={() => setKind(k.value)}
                                aria-pressed={active}
                                className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-[background-color,border-color,color] duration-200 ${active
                                    ? "bg-[#F5A623]/10 border-[#F5A623]/50"
                                    : "bg-[#12121A] border-white/8 hover:border-[#F5A623]/30"
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${active ? "text-[#F5A623]" : "text-[#8A8494]"}`} />
                                <span className={`text-sm font-bold ${active ? "text-[#F2F2F7]" : "text-[#A6A29B]"}`}>
                                    {k.label}
                                </span>
                                <span className="text-[11px] text-[#8A8494] leading-snug">{k.hint}</span>
                            </button>
                        )
                    })}
                </div>
            </fieldset>

            {isGear && (
                <div className="space-y-2">
                    <label
                        htmlFor="feedback-gear"
                        className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#F5A623]"
                    >
                        Which amp, guitar or pedal?
                    </label>
                    <input
                        id="feedback-gear"
                        value={gearName}
                        onChange={(e) => setGearName(e.target.value.slice(0, 160))}
                        placeholder="Boss Katana 50 MkII"
                        className="w-full h-12 rounded-xl bg-[#12121A] border border-white/8 px-4 text-sm text-[#F2F0ED] placeholder:text-[#8A8494] focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 transition-colors"
                    />
                    <p className="text-[11px] text-[#8A8494]">
                        Make and model. The more exact it is, the sooner it can be added.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <label
                    htmlFor="feedback-message"
                    className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#F5A623]"
                >
                    {isGear ? "Anything else about it" : "Tell us what happened"}
                </label>
                <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, FEEDBACK_MAX))}
                    rows={7}
                    placeholder="The more specific the better. Which page, which amp, what you expected, what you got."
                    className="w-full rounded-xl bg-[#12121A] border border-white/8 p-4 text-sm text-[#F2F0ED] leading-relaxed placeholder:text-[#8A8494] focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 transition-colors resize-y"
                />
                <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-[#8A8494]">
                        {short > 0
                            ? `${short} more ${short === 1 ? "character" : "characters"} needed`
                            : "Ready to send"}
                    </span>
                    <span className="font-mono text-[#8A8494]">
                        {trimmed.length.toLocaleString()}/{FEEDBACK_MAX.toLocaleString()}
                    </span>
                </div>
            </div>

            {askEmail && (
                <div className="space-y-2">
                    <label
                        htmlFor="feedback-email"
                        className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#F5A623]"
                    >
                        Your email, if you want a reply
                    </label>
                    <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-12 rounded-xl bg-[#12121A] border border-white/8 px-4 text-sm text-[#F2F0ED] placeholder:text-[#8A8494] focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 transition-colors"
                    />
                    <p className="text-[11px] text-[#8A8494]">
                        Optional. Leave it blank and the message still arrives, we just cannot answer it.
                    </p>
                </div>
            )}

            {error && (
                <p className="text-sm font-semibold text-[#D14B32]" role="alert">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={!valid || sending}
                className="inline-flex items-center justify-center h-12 px-8 rounded-full font-bold text-sm text-[#08080C] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }}
            >
                {sending ? "Sending" : "Send feedback"}
            </button>
        </form>
    )
}
