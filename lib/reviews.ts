import { getSupabaseAdmin } from "@/lib/supabase";

export type StoredReview = {
    id: string | number;
    name: string | null;
    rating: number;
    comment: string;
    created_at: string;
};

export type ReviewSummary = {
    /** The slice the page renders, newest first. */
    reviews: StoredReview[];
    /** Every valid row in the table, not just the rendered slice. */
    count: number;
    /** Averaged over the whole table, for the same reason. */
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
 *
 * The rendered slice and the aggregate are two separate reads on purpose. A page
 * that showed every row would be a wall of near-identical cards, but the count
 * and the average have to describe the whole table or the number in the markup
 * disagrees with the number Google can count, and an aggregate that undercounts
 * itself is the kind of mismatch that gets a rating block dropped.
 */
export async function getReviewSummary(displayLimit = 12): Promise<ReviewSummary> {
    try {
        const db = getSupabaseAdmin();
        const [page, all] = await Promise.all([
            db
                .from("reviews")
                .select("id, name, rating, comment, created_at")
                .order("created_at", { ascending: false })
                .limit(displayLimit),
            // One column, every row: cheap enough to average honestly.
            db.from("reviews").select("rating"),
        ]);

        if (page.error || !page.data) return { reviews: [], count: 0, average: 0 };

        // A malformed rating would skew the average that goes into schema.org,
        // and Google treats a rating it cannot verify as a reason to drop the
        // whole block, so anything out of range is discarded here.
        const valid = (r: { rating: number }) =>
            Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5;

        const reviews = (page.data as StoredReview[]).filter(valid);
        if (reviews.length === 0) return { reviews: [], count: 0, average: 0 };

        // Falling back to the rendered slice keeps the block honest rather than
        // empty if the second read is the one that failed.
        const ratings = (all.error || !all.data ? reviews : (all.data as { rating: number }[])).filter(valid);
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);

        return {
            reviews,
            count: ratings.length,
            average: Math.round((total / ratings.length) * 10) / 10,
        };
    } catch {
        return { reviews: [], count: 0, average: 0 };
    }
}
