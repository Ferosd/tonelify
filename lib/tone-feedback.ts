/**
 * Shared, dependency-free half of the tone feedback feature.
 *
 * Kept apart from lib/tone-feedback-server.ts on purpose: the result card is a
 * client component and needs the key, the type and the sentence, but pulling
 * in the Supabase admin client to get them would drag server-only code into
 * the browser bundle.
 */

export type Verdict = "up" | "down";

export type FeedbackCounts = {
    up: number;
    down: number;
    total: number;
};

export const EMPTY_COUNTS: FeedbackCounts = { up: 0, down: 0, total: 0 };

/**
 * How many confirmations before a count is worth showing.
 *
 * One person saying a tone worked is noise, and printing "1 player confirmed
 * this" reads worse than printing nothing at all. The floor also keeps the
 * number from meaning anything before enough people have voted to make it
 * mean something.
 */
export const MIN_VISIBLE_CONFIRMATIONS = 3;

/**
 * The aggregation key for a recording.
 *
 * Matches are run against free text, so "Sultans of Swing" and "sultans of
 * swing " have to land in the same bucket. Normalizing here rather than in SQL
 * keeps the key identical whether it is written by the API or read by a page.
 */
export function songKey(title: string, artist: string): string {
    const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
    return `${norm(artist)}|${norm(title)}`;
}

export function tallyVerdicts(rows: { song_key: string; verdict: string }[]) {
    const map = new Map<string, FeedbackCounts>();
    for (const row of rows) {
        const current = map.get(row.song_key) ?? { up: 0, down: 0, total: 0 };
        if (row.verdict === "up") current.up += 1;
        else if (row.verdict === "down") current.down += 1;
        else continue;
        current.total = current.up + current.down;
        map.set(row.song_key, current);
    }
    return map;
}

/**
 * The sentence shown under a tone. Returns null below the visibility floor so
 * callers render nothing rather than a hedged, meaningless number.
 */
export function confirmationLine(counts: FeedbackCounts | null | undefined): string | null {
    if (!counts || counts.up < MIN_VISIBLE_CONFIRMATIONS) return null;
    const player = counts.up === 1 ? "player" : "players";
    return `${counts.up} ${player} confirmed these settings on their own rig`;
}
