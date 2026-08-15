"use client"

import { ReviewAvatar } from "@/components/ReviewAvatar"

type Review = { rating: number }

/**
 * The strip of faces that sits under the hero CTA.
 *
 * Two halves. The left one carries the 1,000+ audience figure the rest of the
 * site already states. The right one is the rating, and it is drawn from the
 * reviews table: no count is shown unless there are reviews behind it, so the
 * block quietly loses its right half rather than inventing one.
 *
 * Faces come from public/avatars/stack-1.jpg through stack-5.jpg. Each falls
 * back to an initials disc, so the row is complete whether or not the files are
 * in place.
 */

const STACK = [
    { name: "Guitarist one", src: "/avatars/stack-1.jpg" },
    { name: "Guitarist two", src: "/avatars/stack-2.jpg" },
    { name: "Guitarist three", src: "/avatars/stack-3.jpg" },
    { name: "Guitarist four", src: "/avatars/stack-4.jpg" },
    { name: "Guitarist five", src: "/avatars/stack-5.jpg" },
]

export function SocialProofBar({ reviews = [] }: { reviews?: Review[] }) {
    const count = reviews.length
    const average = count > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / count : 0
    const rounded = Math.round(average)

    return (
        <div
            className="tn-proofbar"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
                marginTop: 28,
                padding: "10px 18px 10px 12px",
                borderRadius: 999,
                background: "rgba(16,13,11,0.66)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(245,166,35,0.16)",
                pointerEvents: "auto",
                alignSelf: "flex-start",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center" }} aria-hidden="true">
                    {STACK.map((face, i) => (
                        <div key={face.src} style={{ marginLeft: i === 0 ? 0 : -12, lineHeight: 0 }}>
                            <ReviewAvatar name={face.name} src={face.src} size={34} ring="#100D0B" />
                        </div>
                    ))}
                </div>
                <div>
                    <div
                        style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            color: "#F2F2F7",
                            lineHeight: 1.2,
                        }}
                    >
                        1,000+ guitarists
                    </div>
                    <div
                        style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "0.8125rem",
                            color: "#A6A6AF",
                            lineHeight: 1.3,
                            marginTop: 2,
                        }}
                    >
                        Dialed in on their own rigs
                    </div>
                </div>
            </div>

            {count > 0 && (
                <>
                    <span
                        aria-hidden="true"
                        className="tn-proofbar-rule"
                        style={{ width: 1, height: 30, background: "rgba(255,255,255,0.1)" }}
                    />
                    <div>
                        <div
                            style={{ display: "flex", alignItems: "center", gap: 7, lineHeight: 1.2 }}
                            aria-label={`Rated ${average.toFixed(1)} out of 5 from ${count} reviews`}
                        >
                            <span aria-hidden="true" style={{ color: "#F5A623", fontSize: "0.85rem", letterSpacing: "0.08em" }}>
                                {"★".repeat(rounded)}
                                <span style={{ color: "rgba(245,166,35,0.25)" }}>{"★".repeat(5 - rounded)}</span>
                            </span>
                            <span
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: 500,
                                    fontSize: "0.85rem",
                                    color: "#FFD700",
                                }}
                            >
                                {average.toFixed(1)}
                            </span>
                        </div>
                        <div
                            style={{
                                fontFamily: "'Satoshi', sans-serif",
                                fontSize: "0.8125rem",
                                color: "#A6A6AF",
                                lineHeight: 1.3,
                                marginTop: 2,
                            }}
                        >
                            from {count} {count === 1 ? "review" : "reviews"}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
