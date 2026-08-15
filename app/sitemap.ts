import type { MetadataRoute } from "next";
import { TONE_LIBRARY } from "@/lib/tone-library";
import { GEAR_CATALOG } from "@/lib/gear-catalog";
import { GUIDES, GUIDES_UPDATED } from "@/lib/guides";
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
    about: "2026-08-15",
    feedback: "2026-08-15",
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

    // Guides carry their own date: the library and the guides move for
    // different reasons and should not share a lastmod.
    const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
        url: `${baseUrl}/guides/${guide.id}`,
        lastModified: guide.updated,
    }));

    return [
        { url: baseUrl, lastModified: LAST_UPDATED.home },
        { url: `${baseUrl}/tone-match`, lastModified: LAST_UPDATED.toneMatch },
        { url: `${baseUrl}/explore`, lastModified: LAST_UPDATED.explore },
        { url: `${baseUrl}/plans`, lastModified: LAST_UPDATED.plans },
        { url: `${baseUrl}/faq`, lastModified: LAST_UPDATED.faq },
        { url: `${baseUrl}/feedback`, lastModified: LAST_UPDATED.feedback },
        { url: `${baseUrl}/privacy`, lastModified: LAST_UPDATED.privacy },
        { url: `${baseUrl}/terms`, lastModified: LAST_UPDATED.terms },
        { url: `${baseUrl}/gear`, lastModified: LAST_UPDATED.gear },
        { url: `${baseUrl}/guides`, lastModified: GUIDES_UPDATED },
        { url: `${baseUrl}/about`, lastModified: LAST_UPDATED.about },
        ...tonePages,
        ...gearPages,
        ...guidePages,
    ];
}
