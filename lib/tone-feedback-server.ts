import { getSupabaseAdmin } from "@/lib/supabase";
import {
    EMPTY_COUNTS,
    type FeedbackCounts,
    songKey,
    tallyVerdicts,
} from "@/lib/tone-feedback";

/**
 * Database reads for tone feedback. Server only, see lib/tone-feedback.ts for
 * the half that the result card is allowed to import.
 *
 * Every read swallows its failure and returns zeros. These counts are a line
 * of supporting copy on a page that has to render regardless, so a missing
 * counter must never be able to take a tone page down with it.
 */

type VerdictRow = { song_key: string; verdict: string };

export async function getFeedbackCounts(
    title: string,
    artist: string
): Promise<FeedbackCounts> {
    const key = songKey(title, artist);
    try {
        const { data, error } = await getSupabaseAdmin()
            .from("tone_feedback")
            .select("song_key, verdict")
            .eq("song_key", key);

        if (error || !data) return EMPTY_COUNTS;
        return tallyVerdicts(data as VerdictRow[]).get(key) ?? EMPTY_COUNTS;
    } catch {
        return EMPTY_COUNTS;
    }
}

/**
 * Counts for a batch of recordings in one round trip, for library pages that
 * render many cards at once. Keys absent from the result simply have no votes.
 */
export async function getFeedbackCountsFor(
    entries: { title: string; artist: string }[]
): Promise<Map<string, FeedbackCounts>> {
    const keys = entries.map((e) => songKey(e.title, e.artist));
    if (keys.length === 0) return new Map();

    try {
        const { data, error } = await getSupabaseAdmin()
            .from("tone_feedback")
            .select("song_key, verdict")
            .in("song_key", keys);

        if (error || !data) return new Map();
        return tallyVerdicts(data as VerdictRow[]);
    } catch {
        return new Map();
    }
}
