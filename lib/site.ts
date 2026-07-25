/**
 * Canonical origin, always without a trailing slash.
 *
 * NEXT_PUBLIC_SITE_URL is set with a trailing slash in production, which was
 * producing "https://tonelify.com//explore" in the sitemap and the robots.txt
 * sitemap line. Search engines treat // as a separate path, so every entry was
 * pointing at a URL that only resolves by accident.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://tonelify.com").replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
    return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}
