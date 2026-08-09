/**
 * Provenance for a tone match: where the original rig information came from.
 *
 * The design point here is that a fabricated citation is worse than no
 * citation. A language model will happily invent a plausible URL, and a reader
 * who clicks it and lands on a 404 trusts the whole result less than if we had
 * shown nothing. So model-supplied provenance is deliberately URL-free: the
 * model names the kind of source and what it documented, and the reader gets a
 * search link built from that text, which cannot 404 on a made-up path.
 *
 * Real links only come from `song_gear.source_url`, which is entered by hand
 * against a source someone actually opened.
 */

export const SOURCE_KINDS = [
    "rig-rundown",
    "interview",
    "manufacturer",
    "forum",
    "documentary",
    "album-credits",
    "model-knowledge",
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export type ToneSource = {
    /** Publication or programme, e.g. "Premier Guitar Rig Rundown" */
    title: string;
    kind: SourceKind;
    /** What this source established, one short sentence */
    detail?: string;
    /**
     * Only ever set from curated database rows. Model output never populates
     * this, so a link on the page is always a link a human checked.
     */
    url?: string;
};

/** How the original-rig block was established. */
export type Provenance = "verified" | "model";

const KIND_SET = new Set<string>(SOURCE_KINDS);

function clean(value: unknown, max: number): string {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

/**
 * Only http(s) links survive, so a `javascript:` or `data:` URL cannot reach
 * an href even if a bad row makes it into the table.
 */
export function safeHttpUrl(value: unknown): string | undefined {
    const raw = clean(value, 500);
    if (!raw) return undefined;
    try {
        const url = new URL(raw);
        if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
        return url.toString();
    } catch {
        return undefined;
    }
}

/**
 * Normalizes whatever the model returned into a bounded, typed list. Anything
 * unrecognized is dropped rather than rendered, and `url` is stripped
 * unconditionally: model output is not allowed to produce a clickable link.
 */
export function sanitizeModelSources(raw: unknown, limit = 4): ToneSource[] {
    if (!Array.isArray(raw)) return [];

    const seen = new Set<string>();
    const out: ToneSource[] = [];

    for (const entry of raw) {
        if (!entry || typeof entry !== "object") continue;
        // The model decides these key names, so the shape is unknown by
        // definition; every field is read through `clean`, which only ever
        // returns a bounded string.
        const row = entry as Record<string, unknown>;
        const title = clean(row.title ?? row.name, 120);
        if (!title) continue;

        const key = title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const kindRaw = clean(row.kind ?? row.type, 40).toLowerCase();
        out.push({
            title,
            kind: (KIND_SET.has(kindRaw) ? kindRaw : "model-knowledge") as SourceKind,
            detail: clean(row.detail ?? row.description, 220) || undefined,
        });

        if (out.length >= limit) break;
    }

    return out;
}

/** Builds the curated source entry attached to a verified song_gear row. */
export function curatedSource(
    title: unknown,
    url: unknown,
    detail?: unknown
): ToneSource | null {
    const cleanTitle = clean(title, 120);
    if (!cleanTitle) return null;
    return {
        title: cleanTitle,
        kind: "rig-rundown",
        detail: clean(detail, 220) || undefined,
        url: safeHttpUrl(url),
    };
}

const KIND_LABELS: Record<SourceKind, string> = {
    "rig-rundown": "Rig rundown",
    interview: "Interview",
    manufacturer: "Manufacturer spec",
    forum: "Player community",
    documentary: "Documentary",
    "album-credits": "Album credits",
    "model-knowledge": "Tone engine knowledge",
};

export function sourceKindLabel(kind: SourceKind): string {
    return KIND_LABELS[kind] ?? KIND_LABELS["model-knowledge"];
}

/**
 * A search URL rather than a direct link, for the reason in the file header:
 * this cannot point somewhere that does not exist.
 */
export function sourceSearchUrl(source: ToneSource, song: string, artist: string): string {
    const query = [source.title, artist, song].filter(Boolean).join(" ");
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
