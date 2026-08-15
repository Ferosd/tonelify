"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ReviewAvatar } from "@/components/ReviewAvatar"

type Review = {
    id: string | number
    name: string | null
    rating: number
    comment: string
    created_at: string
}

/** "2 days ago" style stamp, matching what a reader expects on a review card. */
function timeAgo(iso: string) {
    const then = new Date(iso).getTime()
    if (!Number.isFinite(then)) return ""
    const days = Math.floor((Date.now() - then) / 86_400_000)
    if (days <= 0) return "today"
    if (days === 1) return "1 day ago"
    if (days < 7) return `${days} days ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
    const months = Math.floor(days / 30)
    if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`
    const years = Math.floor(days / 365)
    return years === 1 ? "1 year ago" : `${years} years ago`
}

/**
 * Card headlines are the reviewer's own opening sentence, promoted rather than
 * written for them. Anything long or unpunctuated stays in the body, so nobody
 * ends up with words on the card they did not type.
 */
function splitHeadline(comment: string): { headline: string | null; body: string } {
    const text = comment.trim()
    // [\s\S] rather than the /s flag: the build targets an older ES level
    const match = text.match(/^([\s\S]{12,68}?)([.!?])\s+([\s\S]*)$/)
    if (!match || !match[3].trim()) return { headline: null, body: text }
    return { headline: match[1].trim(), body: match[3].trim() }
}

function Stars({ count, size = 20 }: { count: number; size?: number }) {
    const safe = Math.max(1, Math.min(5, Math.round(count)))
    return (
        <div style={{ display: "flex", gap: 3 }} aria-label={`${safe} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <span
                    key={i}
                    aria-hidden="true"
                    style={{
                        width: size,
                        height: size,
                        borderRadius: 4,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: i < safe ? "linear-gradient(135deg, #E8712A 0%, #D14B32 100%)" : "rgba(255,255,255,0.07)",
                        color: i < safe ? "#0B0A09" : "rgba(255,255,255,0.25)",
                        fontSize: size * 0.62,
                        lineHeight: 1,
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    )
}

/**
 * Reviews on the landing page come from the `reviews` table, written by
 * signed-in accounts through /api/reviews. Nothing here is seeded or written on
 * the product's behalf: until real reviews land, the section says so.
 */
export function LandingTestimonials({ initialReviews }: { initialReviews?: Review[] }) {
    // Seeded from the server render. Without it the first paint here is the
    // aria-hidden spacer below, which is what a crawler that skips JavaScript
    // would have taken for the whole section.
    const [reviews, setReviews] = useState<Review[] | null>(initialReviews ?? null)

    // Skipped when the server already supplied the list. See the note in
    // ReviewStrip: three copies of this fetch ran on every landing page load.
    const needsFetch = !initialReviews

    useEffect(() => {
        if (!needsFetch) return
        let cancelled = false
        fetch("/api/reviews")
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => {
                if (!cancelled) setReviews(Array.isArray(data) ? data : [])
            })
            .catch(() => {
                if (!cancelled) setReviews([])
            })
        return () => {
            cancelled = true
        }
    }, [needsFetch])

    // Still loading — hold the space rather than flashing the empty state
    if (reviews === null) {
        return <div style={{ minHeight: 220 }} aria-hidden="true" />
    }

    if (reviews.length === 0) {
        return (
            <div
                style={{
                    background: "rgba(20,17,15,0.7)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderRadius: 16,
                    padding: 32,
                    border: "1px solid rgba(245,166,35,0.1)",
                    maxWidth: 680,
                }}
            >
                <p
                    style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "1.0625rem",
                        lineHeight: 1.65,
                        color: "#F2F0ED",
                        margin: "0 0 16px",
                    }}
                >
                    Tonelify is new, so there&apos;s nothing here yet.
                </p>
                <p
                    style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "0.95rem",
                        lineHeight: 1.65,
                        color: "#A6A6AF",
                        margin: "0 0 24px",
                    }}
                >
                    Every review on this page is written by someone with an account, and posted
                    under their own name. Run a match on the free plan, three a month with no card,
                    and tell us whether the settings held up on your rig.
                </p>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <Link href="/tone-match" className="cta-btn">
                        Match a tone free
                    </Link>
                    <Link href="/#reviews" className="ghost-btn">
                        Write a review
                    </Link>
                </div>
            </div>
        )
    }

    const average = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length

    return (
        <div style={{ width: "100%" }}>
            {/* Summary line, the way a ratings page opens: score first, then the
                sample it rests on. */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    flexWrap: "wrap",
                    marginBottom: 36,
                    textAlign: "center",
                }}
            >
                <Stars count={average} size={26} />
                <p
                    style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "0.95rem",
                        color: "#A6A6AF",
                        margin: 0,
                    }}
                >
                    Rated{" "}
                    <strong style={{ color: "#F5A623", fontWeight: 600 }}>
                        {average.toFixed(1)} out of 5
                    </strong>{" "}
                    from{" "}
                    <strong style={{ color: "#F2F2F7", fontWeight: 600 }}>
                        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </strong>
                    , each posted from a Tonelify account
                </p>
            </div>

            <div
                className="tn-review-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 20,
                }}
            >
                {reviews.slice(0, 6).map((review) => {
                    const name = review.name?.trim() || "Anonymous"
                    const { headline, body } = splitHeadline(review.comment)
                    return (
                        <article
                            key={review.id}
                            className="js-testimonial testimonial-card"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                background: "rgba(20,17,15,0.7)",
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                borderRadius: 16,
                                padding: 24,
                                border: "1px solid rgba(245,166,35,0.1)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    marginBottom: 16,
                                }}
                            >
                                <Stars count={review.rating} />
                                <span
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: "0.68rem",
                                        color: "#8A8494",
                                        letterSpacing: "0.02em",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {timeAgo(review.created_at)}
                                </span>
                            </div>

                            {headline && (
                                <h3
                                    style={{
                                        fontFamily: "'Satoshi', sans-serif",
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        lineHeight: 1.35,
                                        color: "#F2F2F7",
                                        margin: "0 0 10px",
                                    }}
                                >
                                    {headline}
                                </h3>
                            )}

                            <p
                                style={{
                                    fontFamily: "'Satoshi', sans-serif",
                                    fontWeight: 400,
                                    fontSize: "0.9375rem",
                                    lineHeight: 1.6,
                                    color: "#A6A6AF",
                                    margin: "0 0 20px",
                                }}
                            >
                                {body}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    marginTop: "auto",
                                    paddingTop: 20,
                                    borderTop: "1px solid rgba(255,255,255,0.07)",
                                    marginBottom: -4,
                                }}
                            >
                                <ReviewAvatar name={name} size={40} />
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontFamily: "'Satoshi', sans-serif",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            color: "#F2F2F7",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {name}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontWeight: 500,
                                            fontSize: "0.68rem",
                                            color: "#F5A623",
                                            marginTop: 3,
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Verified account
                                    </div>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </div>
    )
}
