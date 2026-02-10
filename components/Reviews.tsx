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
    id: string;
    name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export function Reviews() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        fetchReviews();
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
        if (!isSignedIn) {
            alert("Please sign in to leave a review.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                body: JSON.stringify({
                    rating,
                    comment,
                    name: name || "Anonymous",
                }),
            });

            if (!res.ok) throw new Error("Failed to submit");

            setComment("");
            fetchReviews(); // Refresh list
            alert("Review submitted!");

        } catch (error) {
            console.error(error);
            alert("Failed to save review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <section className="bg-white py-24 border-t border-slate-100" id="reviews">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Reviews</h2>
                    <p className="text-slate-500 mt-2">Real feedback from guitarists using Tonelify</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">

                    {/* Left: Review List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <span className="text-5xl font-black text-slate-900">{averageRating}</span>
                                <div className="space-y-1">
                                    <div className="flex text-yellow-500">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-sm text-slate-500">{reviews.length} reviews</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
                            ) : (
                                reviews.map((review) => (
                                    <Card key={review.id} className="border border-slate-100 shadow-sm bg-white">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex text-yellow-400 text-xs">
                                                    {Array.from({ length: review.rating }).map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-current" />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                                                <User className="h-3 w-3 text-slate-400" />
                                                {review.name}
                                            </h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">
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
                        <Card className="border-none shadow-xl shadow-blue-900/5 bg-white sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900">Leave a review</CardTitle>
                                <CardDescription>Share what worked (song, guitar, amp). It helps the community.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Your rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`transition-colors ${star <= rating ? "text-yellow-400" : "text-slate-200"}`}
                                                >
                                                    <Star className="w-8 h-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Name (optional)</label>
                                        <Input
                                            placeholder="Anonymous"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-slate-50 border-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Your review</label>
                                        <Textarea
                                            placeholder="Example: 'This worked perfectly for my Strat into a Deluxe Reverb...'"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={5}
                                            className="bg-slate-50 border-slate-200 resize-none"
                                            required
                                            minLength={10}
                                        />
                                        <p className="text-xs text-slate-400 text-right">Minimum 10 characters</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
                                        disabled={isSubmitting || !isSignedIn}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : !isSignedIn ? "Sign in to Review" : "Submit Review"}
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
