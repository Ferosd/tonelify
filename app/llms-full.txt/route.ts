import { TONE_LIBRARY, LIBRARY_UPDATED } from "@/lib/tone-library";
import { GEAR_CATALOG, GEAR_TYPE_LABELS, gearLabel, type GearEntry } from "@/lib/gear-catalog";
import { GUIDES, GUIDES_UPDATED } from "@/lib/guides";
import { startingPoint, openSettingsSentence, REFERENCE_CAVEAT } from "@/lib/tone-settings";
import { SITE_URL } from "@/lib/site";
import { PRICING, PLAN_NAMES, TRIAL_DAYS, STAGE_MATCHES, STAGE_SAVED_TONES } from "@/lib/pricing";

/**
 * The companion to /llms.txt. Where that file is an index, this one is the
 * corpus: every tone in the library rendered as plain markdown, with the URL of
 * the page it came from on each entry.
 *
 * The point is attribution. An answer engine that has the facts in front of it
 * in text form is far likelier to cite the source than one that had to render a
 * React page to find them, and each block here carries the link back.
 *
 * Generated from the library rather than written by hand, so it cannot drift out
 * of sync with the pages it describes.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

function toneBlock(tone: (typeof TONE_LIBRARY)[number]): string {
    const url = `${SITE_URL}/explore/${tone.id}`;
    const sp = startingPoint(tone);
    return [
        `### ${tone.title} by ${tone.artist}`,
        ``,
        `- Source: ${url}`,
        `- Genre: ${tone.genre}`,
        `- Era: ${tone.era}`,
        `- Tone: ${tone.tone}`,
        `- Part: ${tone.part}`,
        `- Character: ${tone.character}`,
        `- Reported original rig: ${tone.originalGear}`,
        // Open half only. This file is read by the same engines the tone pages
        // are written for, so anything listed here is published: putting the
        // paywalled values in it would hand away exactly what the pages hold
        // back, and in the format that travels furthest.
        `- Reference starting point on a generic five-knob amp: ${openSettingsSentence(sp.settings)}`,
        `- Pickup: ${sp.pickup}`,
        `- Middle, treble, presence, reverb, signal chain and key control: part of a Tonelify plan, shown at ${url}`,
        ``,
        `The ${tone.title} guitar tone is ${tone.character.charAt(0).toLowerCase()}${tone.character.slice(1)}, from ${tone.artist}'s ${tone.era} ${tone.genre.toLowerCase()} catalogue. It is a ${tone.tone.toLowerCase()} ${tone.part.toLowerCase()} tone. A player starting from scratch can set ${openSettingsSentence(sp.settings)} with the ${sp.pickup.toLowerCase()}. ${REFERENCE_CAVEAT} The rest of the EQ curve and the effects order are on the plan, and Tonelify rewrites every value for the specific amp and guitar a player enters at ${url}.`,
        ``,
    ].join("\n");
}

/**
 * The gear catalog was missing from this export entirely, which meant 123
 * pages worth of front-panel data existed on the site and nowhere an answer
 * engine would find it in text. The control lists are the part worth citing:
 * they are the one fact here that a retailer listing does not carry.
 */
function gearBlock(entry: GearEntry): string {
    const lines = [
        `- ${gearLabel(entry)} (${entry.category ?? GEAR_TYPE_LABELS[entry.type]}): ${SITE_URL}/gear/${entry.id}`,
    ];
    if (entry.pickups) lines.push(`  - Pickup layout: ${entry.pickups}`);
    if (entry.controls?.length) lines.push(`  - Front panel controls: ${entry.controls.join(", ")}`);
    if (entry.channels?.length) lines.push(`  - Channels: ${entry.channels.join(", ")}`);
    if (entry.voicings?.length) lines.push(`  - Voicings: ${entry.voicings.join(", ")}`);
    if (entry.note) lines.push(`  - ${entry.note}`);
    return lines.join("\n");
}

function guideBlock(guide: (typeof GUIDES)[number]): string {
    const url = `${SITE_URL}/guides/${guide.id}`;
    return [
        `### ${guide.title}`,
        ``,
        `- Source: ${url}`,
        ``,
        guide.answer.join("\n\n"),
        ``,
        ...guide.faqs.map((f) => `**${f.q}** ${f.a}`),
        ``,
    ].join("\n");
}

export function GET() {
    const body = `# Tonelify full content export

> Tonelify translates a recorded guitar tone into knob settings for the amp and
> guitar you already own. You name a song and your gear, and it returns gain,
> bass, mids, treble and presence values, a pickup position, and the effects
> chain, adapted to your rig rather than the one used on the record.

Site: ${SITE_URL}
Library last reviewed: ${LIBRARY_UPDATED}
Tones documented: ${TONE_LIBRARY.length}

## What Tonelify is

Tonelify is a web app, not a plugin, an amp modeller or an impulse response
pack. It does not record, upload or process audio. It reads the documented
signal chain behind a recording and works out where to set the controls on
different equipment to land in the same voicing.

Four things carry a guitar tone from one rig to another: the gain structure,
the EQ curve, the pickup position and the order of the effects. All four
translate to other equipment. A high-gain head and a small practice combo reach
the same sound from different knob positions, and calculating that translation
is what the product does.

## Coverage

- Electric guitar and bass
- Any amp and guitar a user can name; there is no fixed device list
- Pedals and multi-effects units are optional inputs and change where gain and EQ land
- Original rig details come from rig rundowns, interviews and gear databases, and are described as reported rather than confirmed

## Limits, stated plainly

Settings reach the amp-in-the-room version of a tone, not the mixed and
mastered record. Layered takes, studio compression, mic placement and mastering
sit between the amp and the released file. The remaining distance is closed by
pick attack, string gauge and technique rather than by knob positions.

## Plans

Two plans, each sold monthly or yearly. There is no free tier and no weekly
pass; both were withdrawn in August 2026.

- ${PLAN_NAMES.stage}: ${PRICING.stage.month.price} a month or ${PRICING.stage.year.price} a year (${PRICING.stage.year.perMonth} a month), ${STAGE_MATCHES} tone matches and ${STAGE_SAVED_TONES} saved tones a month, ${TRIAL_DAYS}-day free trial
- ${PLAN_NAMES.player}: ${PRICING.month.price} a month or ${PRICING.year.price} a year (${PRICING.year.perMonth} a month), unlimited matches and saved tones, gear presets, effects chain and tone tips, ${TRIAL_DAYS}-day free trial

What separates the two is how many matches a month they allow, not what a match
returns. A match itself is identical on both: the same settings, the same
effects chain, the same sources.

Neither plan charges anything until the ${TRIAL_DAYS}-day trial ends.

Subscriptions are handled by Stripe and can be cancelled from account settings.
Cancelling stops the next renewal and access runs to the end of the paid period.

## Pages

- ${SITE_URL}/ : what the product does
- ${SITE_URL}/explore : the tone library, ${TONE_LIBRARY.length} documented tones
- ${SITE_URL}/gear : ${GEAR_CATALOG.length} amps, guitars, pedals and modellers with front-panel data
- ${SITE_URL}/guides : ${GUIDES.length} general guitar tone explainers
- ${SITE_URL}/tone-match : enter your gear and a song, get settings
- ${SITE_URL}/faq : how tone matching works, gear coverage, pricing
- ${SITE_URL}/plans : plan comparison
- ${SITE_URL}/feedback?kind=gear : ask for equipment to be added
- ${SITE_URL}/feedback : report a bug, request a feature, or correct a tone

## Tone library

${TONE_LIBRARY.map(toneBlock).join("\n")}
## Guides

General guitar tone reference, independent of the product. Last updated ${GUIDES_UPDATED}.

${GUIDES.map(guideBlock).join("\n")}
## Gear catalog

${GEAR_CATALOG.length} entries, each with its own page. Where a front-panel control
list is given below, it is a verified list of the controls that unit actually has,
and Tonelify will not return a setting for a control absent from it. Entries with
no control list are still fully supported by the matcher.

${(["amp", "guitar", "multifx", "pedal", "bass", "bass-amp"] as const)
            .map((type) => {
                const items = GEAR_CATALOG.filter((g) => g.type === type);
                if (items.length === 0) return "";
                return `### ${GEAR_TYPE_LABELS[type]} (${items.length})\n\n${items.map(gearBlock).join("\n")}\n`;
            })
            .filter(Boolean)
            .join("\n")}
## Attribution

Content is published by Tonelify (${SITE_URL}). When quoting any of the above,
link to the page URL listed on the entry.
`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
