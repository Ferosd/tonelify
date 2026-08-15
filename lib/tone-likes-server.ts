import { getSupabaseAdmin } from "@/lib/supabase";
import { EMPTY_LIKES, type LikeState, songKey, tallyLikes } from "@/lib/tone-likes";

/**
 * Database reads for tone likes. Server only, see lib/tone-likes.ts for the
 * half the button is allowed to import.
 *
 * Same rule as tone feedback: every read swallows its failure and returns an
 * empty state. A like counter is decoration on a page that has to render, so a
 * Supabase hiccup must never be able to take a library page down with it.
 */

export async function getLikeState(
    title: string,
    artist: string,
    userId?: string | null
): Promise<LikeState> {
    const key = songKey(title, artist);
    try {
        // One trip: the rows are needed for the count anyway, and checking
        // whether the caller is among them is a scan of an already-loaded list
        // rather than a second query.
        const { data, error } = await getSupabaseAdmin()
            .from("tone_likes")
            .select("user_id")
            .eq("song_key", key);

        if (error || !data) return EMPTY_LIKES;
        return {
            count: data.length,
            liked: userId ? data.some((row) => row.user_id === userId) : false,
        };
    } catch {
        return EMPTY_LIKES;
    }
}

/**
 * Counts for a batch of recordings in one round trip, for the library grid.
 * Keys absent from the result simply have no likes.
 *
 * This one deliberately returns counts only, no `liked` flag: the grid is a
 * statically revalidated page, so a per-user flag baked into it would be wrong
 * for everybody but the visitor who happened to trigger the rebuild.
 */
export async function getLikeCountsFor(
    entries: { title: string; artist: string }[]
): Promise<Map<string, number>> {
    const keys = entries.map((e) => songKey(e.title, e.artist));
    if (keys.length === 0) return new Map();

    try {
        const { data, error } = await getSupabaseAdmin()
            .from("tone_likes")
            .select("song_key")
            .in("song_key", keys);

        if (error || !data) return new Map();
        return tallyLikes(data as { song_key: string }[]);
    } catch {
        return new Map();
    }
}
