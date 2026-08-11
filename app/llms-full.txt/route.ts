import { TONE_LIBRARY, LIBRARY_UPDATED } from "@/lib/tone-library";
import { SITE_URL } from "@/lib/site";
import { PRICING, TRIAL_DAYS, FREE_MATCHES, FREE_SAVED_TONES } from "@/lib/pricing";

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
        ``,
        `The ${tone.title} guitar tone is ${tone.character.charAt(0).toLowerCase()}${tone.character.slice(1)}, from ${tone.artist}'s ${tone.era} ${tone.genre.toLowerCase()} catalogue. It is a ${tone.tone.toLowerCase()} ${tone.part.toLowerCase()} tone. There is no single set of amp numbers for it, because the correct knob positions depend on the amp in front of you; Tonelify returns gain, bass, mids, treble and presence values for the specific rig a player enters at ${url}.`,
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

- Free: ${FREE_MATCHES} tone matches a month, ${FREE_SAVED_TONES} saved tones, full settings, no card required
- Week Pass: ${PRICING.week.price} a week, unlimited matches, renews weekly, no trial
- Player: ${PRICING.month.price} a month or ${PRICING.year.price} a year (${PRICING.year.perMonth} a month), unlimited matches, gear presets, effects chain and tone tips, ${TRIAL_DAYS}-day free trial

The paid plans lift the two counters on the free plan. A match itself is
identical on every plan: the same settings, the same effects chain, the same
sources. Nothing about the answer is held back for paying accounts.

Subscriptions are handled by Stripe and can be cancelled from account settings.
Cancelling stops the next renewal and access runs to the end of the paid period.

## Pages

- ${SITE_URL}/ : what the product does
- ${SITE_URL}/explore : the tone library, ${TONE_LIBRARY.length} documented tones
- ${SITE_URL}/tone-match : enter your gear and a song, get settings
- ${SITE_URL}/faq : how tone matching works, gear coverage, pricing
- ${SITE_URL}/plans : plan comparison
- ${SITE_URL}/request-gear : ask for equipment to be added

## Tone library

${TONE_LIBRARY.map(toneBlock).join("\n")}
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
