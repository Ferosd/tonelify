"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Review = {
    id: string | number
    name: string | null
    rating: number
    comment: string
}

/**
 * A narrow band of real reviews, placed high on the page so the social proof
 * lands before the pricing table rather than after it. The full list and the
 * posting form stay at #reviews further down.
 *
 * Renders nothing at all when the table is empty. The bottom of the page
 * already carries an honest empty state, and an empty strip up here would only
 * imply an audience that is not there yet.
 */
export function ReviewStrip({ initialReviews }: { initialReviews?: Review[] }) {
    // Seeded from the server render, so the quotes are in the HTML an engine
    // reads. The refetch below still runs: it costs one request and it picks up
    // anything posted since the page was last revalidated.
    const [reviews, setReviews] = useState<Review[] | null>(initialReviews ?? null)

    useEffect(() => {
        let cancelled = false
        fetch("/api/reviews")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => { if (!cancelled) setReviews(Array.isArray(d) ? d : []) })
            .catch(() => { if (!cancelled) setReviews([]) })
        return () => { cancelled = true }
    }, [])

    if (!reviews || reviews.length === 0) return null

    const average = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    // Short entries read as quotes at a glance; long ones belong in the full list
    const quotes = [...reviews]
        .filter((r) => r.comment && r.comment.trim().length > 20)
        .sort((a, b) => a.comment.length - b.comment.length)
        .slice(0, 3)

    return (
        <section
            aria-label="What players say"
            style={{
                position: "relative",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "linear-gradient(180deg, #100D0B 0%, #0B0A09 100%)",
                padding: "56px clamp(24px, 5vw, 80px)",
            }}
        >
            <div style={{ maxWidth: 1120, margin: "0 auto" }}>
                <div className="tn-strip-head" style={{
                    display: "flex", alignItems: "baseline", gap: 18,
                    flexWrap: "wrap", marginBottom: 28,
                }}>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                        fontSize: "2.5rem", lineHeight: 1, color: "#FFD700",
                    }}>
                        {average.toFixed(1)}
                    </span>
                    <span aria-hidden="true" style={{ color: "#E8712A", fontSize: "1.05rem", letterSpacing: "0.1em" }}>
                        {"★".repeat(Math.round(average))}
                    </span>
                    <span style={{
                        fontFamily: "'Satoshi', sans-serif", fontSize: "0.95rem", color: "#A6A6AF",
                    }}>
                        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}, each one posted from a Tonelify account
                    </span>
                    <Link
                        href="/#reviews"
                        style={{
                            fontFamily: "'Satoshi', sans-serif", fontWeight: 500, fontSize: "0.9rem",
                            color: "#F5A623", textDecoration: "none", marginLeft: "auto",
                            // A standalone link on its own line, so the 22px line
                            // box was the whole tap area on a phone
                            display: "inline-flex", alignItems: "center", minHeight: "44px",
                        }}
                    >
                        Read them all
                    </Link>
                </div>

                <div className="tn-strip-grid" style={{
                    display: "grid", gridTemplateColumns: `repeat(${quotes.length || 1}, 1fr)`, gap: 20,
                }}>
                    {quotes.map((r) => (
                        <figure key={r.id} style={{
                            margin: 0, padding: "22px 24px", borderRadius: 14,
                            background: "rgba(20,17,15,0.7)",
                            border: "1px solid rgba(245,166,35,0.1)",
                        }}>
                            <blockquote style={{
                                margin: 0,
                                fontFamily: "'Satoshi', sans-serif", fontSize: "0.95rem",
                                lineHeight: 1.6, color: "#F2F0ED",
                            }}>
                                &ldquo;{r.comment.length > 190 ? r.comment.slice(0, 187).trimEnd() + "…" : r.comment}&rdquo;
                            </blockquote>
                            <figcaption style={{
                                marginTop: 14,
                                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
                                letterSpacing: "0.04em", color: "#F5A623",
                            }}>
                                {(r.name?.trim() || "Anonymous").toUpperCase()}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 860px) {
                    .tn-strip-grid { grid-template-columns: 1fr !important; }
                    .tn-strip-head a { margin-left: 0 !important; }
                }
            `}</style>
        </section>
    )
}
