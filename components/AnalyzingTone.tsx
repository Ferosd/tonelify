"use client"

import { useEffect, useState } from "react"

// The research call takes 10-25 seconds. A bare spinner made that feel broken,
// so the wait shows a valve warming up plus the step the request is actually on.
const STEPS = [
    "Pulling the original signal chain apart",
    "Reading the amp and pickups used on the record",
    "Working out how that translates to your rig",
    "Setting gain, EQ and effect order",
    "Checking the numbers",
]

const STEP_MS = 4200
const SLOW_MS = 22_000

export function AnalyzingTone({ gear }: { gear?: string }) {
    const [step, setStep] = useState(0)
    const [slow, setSlow] = useState(false)

    useEffect(() => {
        const tick = window.setInterval(
            () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
            STEP_MS
        )
        const slowTimer = window.setTimeout(() => setSlow(true), SLOW_MS)
        return () => { window.clearInterval(tick); window.clearTimeout(slowTimer) }
    }, [])

    return (
        <div
            className="flex flex-col items-center text-center py-6"
            role="status"
            aria-live="polite"
        >
            <div className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-2xl overflow-hidden border border-[#E8712A]/20 shadow-[0_0_60px_rgba(232,113,42,0.12)]">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster="/videos/analyzing-poster.jpg"
                    className="h-full w-full object-cover"
                >
                    <source src="/videos/analyzing.webm" type="video/webm" />
                    <source src="/videos/analyzing.mp4" type="video/mp4" />
                </video>
            </div>

            <p className="mt-6 text-lg font-bold text-[#F2F0ED]">
                {STEPS[step]}
                <span className="text-[#E8712A]">…</span>
            </p>
            <p className="mt-2 text-sm text-[#8A8494] max-w-sm">
                {slow
                    ? "Still working. Dense, layered tones take a little longer to pin down."
                    : gear
                        ? `Matching the record against ${gear}.`
                        : "This usually takes about fifteen seconds."}
            </p>

            <div className="mt-6 flex items-center gap-2" aria-hidden="true">
                {STEPS.map((s, i) => (
                    <span
                        key={s}
                        className="h-1.5 rounded-full transition-colors duration-500"
                        style={{
                            width: i === step ? 28 : 8,
                            background: i <= step ? "#E8712A" : "rgba(255,255,255,0.12)",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
