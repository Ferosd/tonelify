import type { MetadataRoute } from "next";
import { TONE_LIBRARY } from "@/lib/tone-library";
import { GEAR_CATALOG } from "@/lib/gear-catalog";
import { SITE_URL } from "@/lib/site";

/**
 * Real edit dates, bumped by hand when the content actually changes.
 *
 * These used to be `new Date()`, which stamped all 31 URLs with the same
 * millisecond on every deploy. Google distrusts lastmod site-wide once it spots
 * dates that don't track real changes, and losing that signal would hurt most
 * as the tone library grows.
 */
const LAST_UPDATED = {
    home: "2026-07-26",
    toneMatch: "2026-07-26",
    explore: "2026-07-26",
    plans: "2026-07-26",
    faq: "2026-07-26",
    toneLibrary: "2026-07-26",
    gear: "2026-08-09",
    requestGear: "2026-05-11",
    privacy: "2026-02-21",
    terms: "2026-07-26",
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = SITE_URL;

    const tonePages: MetadataRoute.Sitemap = TONE_LIBRARY.map((tone) => ({
        url: `${baseUrl}/explore/${tone.id}`,
        lastModified: LAST_UPDATED.toneLibrary,
    }));

    const gearPages: MetadataRoute.Sitemap = GEAR_CATALOG.map((entry) => ({
        url: `${baseUrl}/gear/${entry.id}`,
        lastModified: LAST_UPDATED.gear,
    }));

    return [
        { url: baseUrl, lastModified: LAST_UPDATED.home },
        { url: `${baseUrl}/tone-match`, lastModified: LAST_UPDATED.toneMatch },
        { url: `${baseUrl}/explore`, lastModified: LAST_UPDATED.explore },
        { url: `${baseUrl}/plans`, lastModified: LAST_UPDATED.plans },
        { url: `${baseUrl}/faq`, lastModified: LAST_UPDATED.faq },
        { url: `${baseUrl}/request-gear`, lastModified: LAST_UPDATED.requestGear },
        { url: `${baseUrl}/privacy`, lastModified: LAST_UPDATED.privacy },
        { url: `${baseUrl}/terms`, lastModified: LAST_UPDATED.terms },
        { url: `${baseUrl}/gear`, lastModified: LAST_UPDATED.gear },
        ...tonePages,
        ...gearPages,
    ];
}
