/**
 * Shared, dependency-free half of the tone likes feature.
 *
 * Split for the same reason lib/tone-feedback.ts is split: the like button is a
 * client component and needs the key and the sentence, but importing the
 * Supabase admin client to get them would pull server-only code into the
 * browser bundle. The database reads live in lib/tone-likes-server.ts.
 *
 * The aggregation key is deliberately the one tone_feedback already uses, so a
 * like left on /explore/enter-sandman and a like left on a match result for the
 * same recording count once, together.
 */

export { songKey } from "./tone-feedback";

export type LikeState = {
    count: number;
    /** Whether the signed-in caller is one of the likes. False when signed out. */
    liked: boolean;
};

export const EMPTY_LIKES: LikeState = { count: 0, liked: false };

/**
 * How many likes before the number is worth showing.
 *
 * Below this the button renders with no count at all. "1 like" reads as an
 * empty room, and a fresh page showing zero is worse than a page showing
 * nothing, which is exactly the trap a like counter sets for a young library.
 */
export const MIN_VISIBLE_LIKES = 5;

/** The count as it appears next to the button, or null below the floor. */
export function likeLabel(state: LikeState | null | undefined): string | null {
    if (!state || state.count < MIN_VISIBLE_LIKES) return null;
    return state.count >= 1000
        ? `${(state.count / 1000).toFixed(1).replace(/\.0$/, "")}k`
        : String(state.count);
}

export function tallyLikes(rows: { song_key: string }[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const row of rows) {
        map.set(row.song_key, (map.get(row.song_key) ?? 0) + 1);
    }
    return map;
}
