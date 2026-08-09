"use client"

import { useEffect, useRef, useState } from "react"

// A real amp knob sweeps roughly 270 degrees, dead centre at 5
const MIN_ANGLE = -135
const MAX_ANGLE = 135
const SWEEP_MS = 800

function angleFor(value: number) {
    const clamped = Math.max(0, Math.min(10, value))
    return MIN_ANGLE + (clamped / 10) * (MAX_ANGLE - MIN_ANGLE)
}

export function AmpKnob({
    label,
    value,
    size = 96,
    delay = 0,
    start,
}: {
    label: string
    value: number
    size?: number
    delay?: number
    /** Sweep when this flips true. Left undefined, the knob waits until it
     *  scrolls into view — the landing page drives it from its own timeline
     *  because the section is on screen long before it is visible. */
    start?: boolean
}) {
    const target = angleFor(value)
    const [angle, setAngle] = useState(MIN_ANGLE)
    const [display, setDisplay] = useState(0)
    const hostRef = useRef<HTMLDivElement>(null)
    const started = useRef(false)

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (reduced) {
            setAngle(target)
            setDisplay(value)
            return
        }

        let raf = 0
        let timer = 0

        const sweep = () => {
            const start = performance.now()
            const step = (now: number) => {
                // easeOutCubic — a knob settles, it does not arrive at speed
                const t = Math.min(1, (now - start) / SWEEP_MS)
                const eased = 1 - Math.pow(1 - t, 3)
                setAngle(MIN_ANGLE + (target - MIN_ANGLE) * eased)
                setDisplay(value * eased)
                if (t < 1) raf = requestAnimationFrame(step)
            }
            raf = requestAnimationFrame(step)
        }

        const begin = () => {
            if (started.current) return
            started.current = true
            timer = window.setTimeout(sweep, delay)
        }

        if (start !== undefined) {
            if (start) begin()
            return () => { cancelAnimationFrame(raf); window.clearTimeout(timer) }
        }

        const io = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return
            begin()
            io.disconnect()
        }, { threshold: 0.4 })

        io.observe(host)
        return () => { io.disconnect(); cancelAnimationFrame(raf); window.clearTimeout(timer) }
    }, [target, value, delay, start])

    const r = size / 2

    return (
        <div ref={hostRef} className="flex flex-col items-center gap-3">
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                role="img"
                aria-label={`${label} at ${value.toFixed(1)} out of 10`}
                style={{ width: size, height: size }}
            >
                <defs>
                    <radialGradient id={`body-${label}`} cx="38%" cy="30%">
                        <stop offset="0%" stopColor="#3A342E" />
                        <stop offset="55%" stopColor="#1C1815" />
                        <stop offset="100%" stopColor="#0C0A09" />
                    </radialGradient>
                    <linearGradient id={`rim-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.55" />
                        <stop offset="45%" stopColor="#F5A623" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#D14B32" stopOpacity="0.3" />
                    </linearGradient>
                </defs>

                {/* Scale ticks — every whole number across the sweep */}
                {Array.from({ length: 11 }).map((_, i) => {
                    const a = (angleFor(i) - 90) * (Math.PI / 180)
                    const inner = 44, outer = i % 5 === 0 ? 49 : 47
                    return (
                        <line
                            key={i}
                            x1={50 + Math.cos(a) * inner}
                            y1={50 + Math.sin(a) * inner}
                            x2={50 + Math.cos(a) * outer}
                            y2={50 + Math.sin(a) * outer}
                            stroke={i <= value ? "#F5A623" : "#4A443D"}
                            strokeOpacity={i <= value ? 0.75 : 0.5}
                            strokeWidth={i % 5 === 0 ? 1.6 : 1}
                            strokeLinecap="round"
                        />
                    )
                })}

                <circle cx="50" cy="50" r="38" fill={`url(#body-${label})`} />
                <circle cx="50" cy="50" r="38" fill="none" stroke={`url(#rim-${label})`} strokeWidth="1.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="0.8" />

                {/* Pointer */}
                <g transform={`rotate(${angle} 50 50)`}>
                    <line x1="50" y1="50" x2="50" y2="18" stroke="#F5A623" strokeWidth="3.2" strokeLinecap="round" />
                    <circle cx="50" cy="20" r="2.2" fill="#FFD700" />
                </g>
            </svg>

            <div className="text-center">
                <div
                    className="leading-none text-[#FFD700]"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: r * 0.42 }}
                >
                    {display.toFixed(1)}
                </div>
                <div
                    className="mt-1.5 text-[#A6A6AF]"
                    style={{
                        fontFamily: "'Satoshi', sans-serif", fontWeight: 500,
                        fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.12em",
                    }}
                >
                    {label}
                </div>
            </div>
        </div>
    )
}
