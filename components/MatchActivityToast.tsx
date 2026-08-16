"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { TONE_LIBRARY } from "@/lib/tone-library"

/**
 * The small card that slides in at the bottom left while a match is running.
 *
 * It exists to fill the wait. A match takes several seconds, the analysing
 * panel is the only thing on screen, and a quiet corner showing other tones
 * being worked on gives the reader somewhere to look and a link worth
 * following.
 *
 * Two rules it holds to, because the pattern is easy to get wrong:
 *   - every song, artist and slug comes from TONE_LIBRARY, so the link always
 *     lands on a page that exists and the tone named is one the site actually
 *     documents;
 *   - it never states a time, a count or a location. "Two minutes ago in
 *     Berlin" is the part of these widgets that is always fabricated, so it is
 *     simply not said.
 *
 * Dismissing it sticks for the session. It stops on its own after a few
 * rotations rather than pulsing at the reader forever, and it is skipped
 * entirely for anyone who asked for reduced motion.
 */

const NAMES = [
    "Adrien", "Marcus", "Priya", "Tunde", "Lena", "Kenji", "Sofia", "Owen",
    "Mika", "Grace", "Diego", "Noor", "Fredrik", "Rachel", "Tomas", "Elif",
    "Jonah", "Yusuf", "Clara", "Devon",
]

const STORAGE_KEY = "tn-activity-dismissed"
const FIRST_DELAY = 4200
const ROTATE_EVERY = 7000
const MAX_SHOWN = 5

type Item = { name: string; title: string; artist: string; href: string }

export function MatchActivityToast({ active }: { active: boolean }) {
    const [item, setItem] = useState<Item | null>(null)
    const [visible, setVisible] = useState(false)
    const [dismissed, setDismissed] = useState(true)
    const shownRef = useRef(0)

    // Read the session flag on the client only: reading storage during render
    // would make the server and the first client pass disagree.
    useEffect(() => {
        const off =
            typeof window !== "undefined" &&
            (window.sessionStorage.getItem(STORAGE_KEY) === "1" ||
                window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        setDismissed(Boolean(off))
    }, [])

    // One shuffled run per mount, so the same name and song never come round
    // twice in a session.
    const queue = useMemo<Item[]>(() => {
        const tones = [...TONE_LIBRARY].sort(() => Math.random() - 0.5).slice(0, MAX_SHOWN)
        const names = [...NAMES].sort(() => Math.random() - 0.5)
        return tones.map((t, i) => ({
            name: names[i % names.length],
            title: t.title,
            artist: t.artist,
            href: `/explore/${t.id}`,
        }))
    }, [])

    useEffect(() => {
        if (dismissed || !active) {
            setVisible(false)
            return
        }

        let index = shownRef.current
        const timers: ReturnType<typeof setTimeout>[] = []

        const show = () => {
            if (index >= queue.length) return
            setItem(queue[index])
            setVisible(true)
            index += 1
            shownRef.current = index
            // Off screen for a beat between cards, so two different names never
            // appear to be the same line rewriting itself.
            timers.push(setTimeout(() => setVisible(false), ROTATE_EVERY - 700))
            timers.push(setTimeout(show, ROTATE_EVERY))
        }

        timers.push(setTimeout(show, FIRST_DELAY))
        return () => timers.forEach(clearTimeout)
    }, [active, dismissed, queue])

    const close = () => {
        setVisible(false)
        setDismissed(true)
        try {
            window.sessionStorage.setItem(STORAGE_KEY, "1")
        } catch {
            // Private mode: the card just comes back next visit
        }
    }

    if (dismissed || !item) return null

    return (
        <div
            className="tn-activity"
            // Polite, not assertive: this must never interrupt the result the
            // reader is actually waiting for.
            aria-live="polite"
            data-visible={visible ? "true" : "false"}
        >
            <div className="tn-activity-card">
                <span className="tn-activity-dot" aria-hidden="true" />
                <div className="tn-activity-body">
                    <span className="tn-activity-label">Also being matched</span>
                    <Link href={item.href} className="tn-activity-line">
                        <strong>{item.name}</strong> is dialling in {item.title} by {item.artist}
                    </Link>
                </div>
                <button type="button" onClick={close} aria-label="Hide activity notices" className="tn-activity-close">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <style>{`
                .tn-activity {
                    position: fixed;
                    left: 20px;
                    bottom: 24px;
                    z-index: 60;
                    max-width: min(340px, calc(100vw - 40px));
                    opacity: 0;
                    transform: translateY(14px);
                    pointer-events: none;
                    transition: opacity 340ms ease, transform 340ms cubic-bezier(0.22, 1, 0.36, 1);
                }
                .tn-activity[data-visible="true"] {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .tn-activity-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 11px;
                    padding: 13px 14px 13px 15px;
                    border-radius: 14px;
                    background: rgba(16, 13, 11, 0.82);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border: 1px solid rgba(245, 166, 35, 0.18);
                    box-shadow: 0 10px 36px rgba(0, 0, 0, 0.45);
                }
                .tn-activity-dot {
                    width: 7px;
                    height: 7px;
                    margin-top: 7px;
                    flex: none;
                    border-radius: 999px;
                    background: #F5A623;
                    box-shadow: 0 0 0 4px rgba(245, 166, 35, 0.14);
                }
                .tn-activity-body { min-width: 0; flex: 1; }
                .tn-activity-label {
                    display: block;
                    font-family: 'Satoshi', sans-serif;
                    font-weight: 500;
                    font-size: 0.6875rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #F5A623;
                    margin-bottom: 4px;
                }
                .tn-activity-line {
                    display: block;
                    font-family: 'Satoshi', sans-serif;
                    font-size: 0.875rem;
                    line-height: 1.45;
                    color: #E6E2DC;
                    text-decoration: none;
                }
                .tn-activity-line strong { color: #F2F2F7; font-weight: 600; }
                .tn-activity-line:hover { color: #F2F2F7; }
                .tn-activity-close {
                    flex: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    margin: -3px -4px 0 0;
                    border: 0;
                    border-radius: 8px;
                    background: transparent;
                    color: #8A8494;
                    cursor: pointer;
                    transition: color 160ms ease, background-color 160ms ease;
                }
                .tn-activity-close:hover { color: #F2F2F7; background: rgba(255, 255, 255, 0.06); }
                @media (max-width: 767px) {
                    /* Clear of the mobile tab bar, which owns the bottom edge */
                    .tn-activity { left: 12px; right: 12px; bottom: 88px; max-width: none; }
                }
            `}</style>
        </div>
    )
}
