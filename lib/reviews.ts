import { getSupabaseAdmin } from "@/lib/supabase";

export type StoredReview = {
    id: string | number;
    name: string | null;
    rating: number;
    comment: string;
    created_at: string;
};

export type ReviewSummary = {
    reviews: StoredReview[];
    count: number;
    average: number;
};

/**
 * Reviews read on the server, for markup that has to exist before any
 * JavaScript runs.
 *
 * The review components all fetch /api/reviews from a useEffect, which is fine
 * for the interactive list but means answer engines and any crawler that does
 * not execute JavaScript see an empty placeholder where the social proof is.
 * Rating data is one of the stronger trust signals for a product entity, so it
 * needs to be in the first HTML payload.
 *
 * Failures return an empty summary rather than throwing: a missing rating block
 * is recoverable, a build or a render that dies over one is not.
 */
export async function getReviewSummary(limit = 20): Promise<ReviewSummary> {
    try {
        const { data, error } = await getSupabaseAdmin()
            .from("reviews")
            .select("id, name, rating, comment, created_at")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error || !data) return { reviews: [], count: 0, average: 0 };

        // A malformed rating would skew the average that goes into schema.org,
        // and Google treats a rating it cannot verify as a reason to drop the
        // whole block, so anything out of range is discarded here.
        const reviews = (data as StoredReview[]).filter(
            (r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5
        );
        if (reviews.length === 0) return { reviews: [], count: 0, average: 0 };

        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        return {
            reviews,
            count: reviews.length,
            average: Math.round((total / reviews.length) * 10) / 10,
        };
    } catch {
        return { reviews: [], count: 0, average: 0 };
    }
}
