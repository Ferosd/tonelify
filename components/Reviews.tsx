"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Loader2, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
// import { toast } from "sonner" // Removed to fix build error

interface Review {
    id: string | number;
    name: string | null;
    rating: number;
    comment: string;
    created_at: string;
}

export function Reviews({
    initialReviews,
    totalCount,
    averageRating,
}: { initialReviews?: Review[]; totalCount?: number; averageRating?: number }) {
    const { user, isLoaded, isSignedIn } = useUser();
    // Seeded from the server render so the list is in the HTML before any
    // JavaScript runs. That also means no spinner on first paint when the
    // reviews are already known.
    const [reviews, setReviews] = useState<Review[]>(initialReviews ?? []);
    // Keyed on whether the server answered at all, not on whether it found
    // anything: an empty array is a complete answer, and treating it as "still
    // loading" left a spinner up forever once the mount fetch stopped running.
    const [isLoading, setIsLoading] = useState(!initialReviews);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");

    // Two separate concerns that were sharing one effect keyed on `user`. Clerk
    // hands over null before it hands over the account, so the list was being
    // refetched on every one of those transitions, and it was refetched at all
    // even when the server render had already supplied it.
    useEffect(() => {
        if (initialReviews) return;
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user) {
            setName(user.fullName || user.firstName || "Anonymous");
        }
    }, [user]);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/reviews");
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // The endpoint needs an account, and an alert saying so was a dead end:
        // it named the requirement and then left the reader to find sign-in
        // themselves. Send them there and bring them back to this section.
        if (!isSignedIn) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent("/#reviews")}`;
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    comment,
                    name: name || "Anonymous",
                }),
            });

            // The daily cap and the rating checks both explain themselves in
            // the response body; "Failed to save review." told the user nothing
            // about what to change.
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Failed to submit");
            }

            setComment("");
            fetchReviews(); // Refresh list
            alert("Review submitted!");

        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Failed to save review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // The list is the newest slice, deliberately: seventy-odd near-identical
    // cards in one scroller is not social proof, it is a wall. The score and
    // the count still describe every row, which is also what the page markup
    // claims, so the two cannot disagree.
    const displayAverage = averageRating
        ?? (reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0);
    const displayCount = totalCount ?? reviews.length;
    const averageLabel = displayAverage.toFixed(1);

    return (
        <section className="py-20 md:py-24 border-t border-white/8 bg-[#0B0A09]" id="reviews">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.01em" }}>
                        Reviews
                    </h2>
                    <p className="text-[#A6A29B] mt-2">
                        What players said after running a match on their own rig
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 md:gap-12 max-w-5xl mx-auto">

                    {/* Left: Review List */}
                    <div className="space-y-6">
                        {/* No aggregate until there is something real to average */}
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-4 mb-8">
                                <span className="font-mono text-5xl font-bold text-[#FFD700]">{averageLabel}</span>
                                <div className="space-y-1">
                                    <div className="flex text-[#E8712A]">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i <= Math.round(displayAverage) ? "fill-current" : "opacity-25"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-[#8A8494]">
                                        {displayCount} {displayCount === 1 ? "review" : "reviews"}
                                        {displayCount > reviews.length && `, showing the latest ${reviews.length}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#8A8494]" /></div>
                            ) : reviews.length === 0 ? (
                                <div className="rounded-2xl border border-white/8 bg-[#12121A] p-6">
                                    <p className="text-[#F2F0ED] font-medium mb-2">No reviews yet.</p>
                                    <p className="text-sm text-[#A6A29B] leading-relaxed">
                                        Nothing to show right now. Run a match on your own rig and tell
                                        us whether the settings held up.
                                    </p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <Card key={review.id} className="border border-white/8 bg-[#12121A] shadow-none">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex text-[#E8712A] text-xs">
                                                    {/* Clamped: the row length comes from stored data, and one
                                                        bad row should not be able to render a million stars */}
                                                    {Array.from({ length: Math.max(0, Math.min(5, Math.round(review.rating) || 0)) }).map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-current" />
                                                    ))}
                                                </div>
                                                {/* Pinned to a fixed locale and UTC: the list is
                                                    rendered on the server now, and a date that
                                                    formats one way there and another way in the
                                                    reader's browser is a hydration mismatch. */}
                                                <span className="font-mono text-xs text-[#8A8494]">
                                                    {new Date(review.created_at).toLocaleDateString("en-US", { timeZone: "UTC" })}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-[#F2F2F7] text-sm mb-2 flex items-center gap-2">
                                                <User className="h-3 w-3 text-[#8A8494]" />
                                                {review.name?.trim() || "Anonymous"}
                                            </h3>
                                            <p className="text-[#A6A29B] text-sm leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Submission Form */}
                    <div className="relative">
                        <Card className="border border-white/8 bg-[#0E0E14] sticky top-24">
                            <CardHeader>
                                <CardTitle className="font-display text-xl font-bold text-[#F2F2F7]">Leave a review</CardTitle>
                                <CardDescription className="text-[#A6A29B]">
                                    Name the song, the guitar, and the amp. That&apos;s what other players need to know.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[#F2F0ED]">Your rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                                    aria-pressed={star === rating}
                                                    className={`transition-colors ${star <= rating ? "text-[#E8712A]" : "text-white/15"}`}
                                                >
                                                    <Star className="w-8 h-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {/* htmlFor/id, not just a styled line of
                                            text above the field: without the
                                            pairing a screen reader announces
                                            "edit text, blank" and the label is
                                            not a tap target for the input. */}
                                        <label htmlFor="review-name" className="text-sm font-semibold text-[#F2F0ED]">Name (optional)</label>
                                        <Input
                                            id="review-name"
                                            placeholder="Anonymous"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-[#12121A] border-white/8 text-[#F2F0ED] placeholder:text-[#8A8494]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="review-comment" className="text-sm font-semibold text-[#F2F0ED]">Your review</label>
                                        <Textarea
                                            id="review-comment"
                                            placeholder="Sultans of Swing on a Squier Strat into a Blues Junior. The neck pickup tone finally sat right."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={5}
                                            className="bg-[#12121A] border-white/8 text-[#F2F0ED] placeholder:text-[#8A8494] resize-none"
                                            required
                                            minLength={10}
                                        />
                                        <p className="font-mono text-xs text-[#8A8494] text-right">Minimum 10 characters</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full text-[#08080C] font-bold h-12 rounded-xl hover:opacity-90 transition-opacity"
                                        style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }}
                                        disabled={isSubmitting || !isSignedIn}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : !isSignedIn ? "Sign in to review" : "Post review"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </section>
    );
}
