"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TONE_LIBRARY } from "@/lib/tone-library"

// Three records that between them cover the range: a scooped metal riff, a
// sustained rock lead, and a clean fingerstyle tone.
const FEATURED_IDS = ["master-of-puppets", "november-rain", "sultans-of-swing"]

const featured = FEATURED_IDS
    .map((id) => TONE_LIBRARY.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

const label: React.CSSProperties = {
    fontFamily: "'Satoshi', sans-serif",
    fontWeight: 500,
    fontSize: "0.6875rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#F5A623",
    display: "block",
    marginBottom: "8px",
}

/**
 * Stands in for a testimonial wall while the product is new. Everything shown
 * is checkable: the records are real, the rigs are the documented ones from
 * the tone library, and the count is TONE_LIBRARY.length. No invented people.
 */
export function ToneProof() {
    const [covers, setCovers] = useState<Record<string, string>>({})

    // Only three lookups, so this stays well clear of the search endpoint's limit
    useEffect(() => {
        let cancelled = false
        Promise.all(
            featured.map(async (tone) => {
                try {
                    const res = await fetch(
                        `/api/search-song?q=${encodeURIComponent(`${tone.title} ${tone.artist}`)}`
                    )
                    if (!res.ok) return null
                    const data = await res.json()
                    const art = Array.isArray(data) ? data[0]?.artworkUrl : null
                    return art ? ([tone.id, String(art).replace("60x60", "300x300")] as const) : null
                } catch {
                    return null
                }
            })
        ).then((pairs) => {
            if (cancelled) return
            setCovers(Object.fromEntries(pairs.filter(Boolean) as (readonly [string, string])[]))
        })
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="tn-proof-grid" style={{ display: "flex", gap: "24px", marginTop: "44px", flexWrap: "wrap" }}>
            {featured.map((tone) => (
                <div
                    key={tone.id}
                    className="testimonial-card"
                    style={{
                        flex: "1 1 300px",
                        background: "rgba(20,17,15,0.7)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        borderRadius: 16,
                        padding: 28,
                        border: "1px solid rgba(245,166,35,0.1)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Record */}
                    <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: 24 }}>
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                flexShrink: 0,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "linear-gradient(135deg, #E8712A 0%, #D14B32 100%)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            {covers[tone.id] && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={covers[tone.id]}
                                    alt={`${tone.title} by ${tone.artist} album artwork`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontFamily: "'Satoshi', sans-serif",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    color: "#FFFFFF",
                                    lineHeight: 1.25,
                                }}
                            >
                                {tone.title}
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Satoshi', sans-serif",
                                    fontSize: "0.8rem",
                                    color: "#A6A6AF",
                                    marginTop: 2,
                                }}
                            >
                                {tone.artist}
                            </div>
                            <div
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "0.65rem",
                                    color: "#F5A623",
                                    marginTop: 5,
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {tone.tone.toUpperCase()} · {tone.part.toUpperCase()} · {tone.era}
                            </div>
                        </div>
                    </div>

                    {/* What defines it */}
                    <div style={{ marginBottom: 20 }}>
                        <span style={label}>The sound</span>
                        <p
                            style={{
                                fontFamily: "'Satoshi', sans-serif",
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                                color: "#F2F0ED",
                                margin: 0,
                            }}
                        >
                            {tone.character}
                        </p>
                    </div>

                    {/* The documented rig */}
                    <div style={{ marginBottom: 24 }}>
                        <span style={label}>The rig behind it</span>
                        <p
                            style={{
                                fontFamily: "'Satoshi', sans-serif",
                                fontSize: "0.875rem",
                                lineHeight: 1.6,
                                color: "#A6A6AF",
                                margin: 0,
                            }}
                        >
                            {tone.originalGear}
                        </p>
                    </div>

                    <Link
                        href={`/tone-match?song=${encodeURIComponent(tone.title)}&artist=${encodeURIComponent(tone.artist)}`}
                        style={{
                            marginTop: "auto",
                            fontFamily: "'Satoshi', sans-serif",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "#F5A623",
                            textDecoration: "none",
                            // The only action on the card, and it was a 20px
                            // line box before this
                            display: "inline-flex", alignItems: "center", minHeight: "44px",
                        }}
                    >
                        Adapt it to your gear →
                    </Link>
                </div>
            ))}
        </div>
    )
}

export const TONE_COUNT = TONE_LIBRARY.length
