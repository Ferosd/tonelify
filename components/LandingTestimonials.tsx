"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Review = {
    id: string | number
    name: string | null
    rating: number
    comment: string
    created_at: string
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
}

const cardStyle: React.CSSProperties = {
    flex: "1 1 300px",
    background: "rgba(20,17,15,0.7)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 16,
    padding: 32,
    border: "1px solid rgba(245,166,35,0.1)",
    position: "relative",
}

function Stars({ count }: { count: number }) {
    const safe = Math.max(1, Math.min(5, Math.round(count)))
    return (
        <div style={{ display: "flex", gap: "4px", marginBottom: 20 }} aria-label={`${safe} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <span key={i} aria-hidden="true" style={{ color: i < safe ? "#E8712A" : "rgba(245,166,35,0.2)", fontSize: "1rem" }}>
                    ★
                </span>
            ))}
        </div>
    )
}

/**
 * Reviews on the landing page come from the `reviews` table — written by
 * signed-in accounts through /api/reviews. Nothing here is seeded or written
 * on the product's behalf: until real reviews land, the section says so.
 */
export function LandingTestimonials() {
    const [reviews, setReviews] = useState<Review[] | null>(null)

    useEffect(() => {
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
    }, [])

    // Still loading — hold the space rather than flashing the empty state
    if (reviews === null) {
        return <div style={{ minHeight: 220 }} aria-hidden="true" />
    }

    if (reviews.length === 0) {
        return (
            <div style={{ ...cardStyle, flex: "1 1 100%", maxWidth: 680 }}>
                <p
                    style={{
                        fontFamily: "'General Sans', sans-serif",
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
                        fontFamily: "'General Sans', sans-serif",
                        fontSize: "0.95rem",
                        lineHeight: 1.65,
                        color: "#A6A6AF",
                        margin: "0 0 24px",
                    }}
                >
                    Every review on this page is written by someone with an account, and posted
                    under their own name. Run a match on the free plan — three a month, no card —
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

    return (
        <>
            {reviews.slice(0, 6).map((review) => {
                const name = review.name?.trim() || "Anonymous"
                return (
                    <div key={review.id} className="js-testimonial testimonial-card" style={cardStyle}>
                        <span
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                top: 16,
                                left: 20,
                                fontFamily: "Georgia, serif",
                                fontSize: "3rem",
                                color: "#E8712A",
                                opacity: 0.3,
                                lineHeight: 1,
                                pointerEvents: "none",
                                userSelect: "none",
                            }}
                        >
                            &ldquo;
                        </span>
                        <Stars count={review.rating} />
                        <p
                            style={{
                                fontFamily: "'General Sans', sans-serif",
                                fontWeight: 400,
                                fontSize: "0.95rem",
                                color: "#F2F0ED",
                                lineHeight: 1.6,
                                margin: "0 0 20px",
                            }}
                        >
                            &ldquo;{review.comment}&rdquo;
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 20 }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                    background: "linear-gradient(135deg, #E8712A 0%, #D14B32 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'General Sans', sans-serif",
                                    fontWeight: 600,
                                    fontSize: "15px",
                                    color: "#FFFFFF",
                                }}
                            >
                                {getInitials(name) || "?"}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "'General Sans', sans-serif",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        color: "#FFFFFF",
                                    }}
                                >
                                    {name}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        color: "#F5A623",
                                        marginTop: "4px",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Verified account
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}
