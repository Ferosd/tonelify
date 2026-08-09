import { TONE_LIBRARY, type LibraryTone } from "@/lib/tone-library";

const DAY = 86400;

/**
 * Album artwork straight from iTunes at render time.
 *
 * Server-only on purpose. The client used to resolve covers one-by-one through
 * /api/search-song, which meant 25 sequential round-trips against a 30-req/min
 * rate limit — the grid usually rendered bare gradients. Fetching here puts the
 * covers in the first paint and costs the visitor nothing.
 */
export async function getArtwork(
    title: string,
    artist: string,
    size = 600
): Promise<string | null> {
    try {
        // Without a deadline this fetch has no upper bound, and getLibraryArtwork
        // fires 24 of them at once against an API with an undocumented rate
        // limit. One slow reply used to hold the whole /explore response open
        // for minutes; a crawler gives up long before that and the page simply
        // goes unindexed. A missing cover is a far cheaper failure, and that
        // fallback already exists below.
        const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(
                `${title} ${artist}`
            )}&media=music&entity=song&limit=1`,
            { next: { revalidate: DAY }, signal: AbortSignal.timeout(3000) }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const art: string | undefined = data.results?.[0]?.artworkUrl100;
        return art ? art.replace("100x100", `${size}x${size}`) : null;
    } catch {
        return null;
    }
}

/** Resolve every library cover in parallel, keyed by tone id. */
export async function getLibraryArtwork(
    tones: LibraryTone[] = TONE_LIBRARY
): Promise<Record<string, string>> {
    const entries = await Promise.all(
        tones.map(async (tone) => [tone.id, await getArtwork(tone.title, tone.artist, 400)] as const)
    );
    return Object.fromEntries(entries.filter(([, art]) => art)) as Record<string, string>;
}
