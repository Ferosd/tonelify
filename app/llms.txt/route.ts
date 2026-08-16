import { TONE_LIBRARY } from "@/lib/tone-library";
import { GEAR_CATALOG } from "@/lib/gear-catalog";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { PLAN_NAMES, TRIAL_DAYS } from "@/lib/pricing";

/**
 * The index an answer engine reads first: what the product is, what it costs,
 * and where the rest of the content lives.
 *
 * This used to be a hand-written public/llms.txt, and it drifted. It still
 * advertised a three-day trial after the trial went to seven, which is the
 * worst kind of stale copy, because a figure in this file is one an engine
 * repeats verbatim without ever loading the pricing page. Everything numeric
 * now comes from lib/pricing and lib/tone-library, the same sources the pages
 * themselves render from, so the two cannot disagree again.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

/** The first few library entries, as worked examples of what a tone page is. */
const EXAMPLE_TONES = TONE_LIBRARY.slice(0, 4);

export function GET() {
    const body = `# Tonelify

> Tonelify translates a recorded guitar tone into knob settings for the amp and
> guitar you already own. You name a song and your gear, and it returns gain,
> bass, mids, treble and presence values, a pickup position, and the effects
> chain, adapted to your rig rather than the one used on the record.

## What it does

Tonelify is a web app, not a plugin or an amp modeller. It does not process
audio. It reads the documented signal chain behind a recording and works out
where to set the controls on different equipment to land in the same place.

Four things carry a tone across rigs: the gain structure, the EQ curve, the
pickup position and the order of the effects. A high-gain head and a small
practice combo reach the same voicing from different knob positions, and
working out that translation is the product.

## What it does not do

Settings reach the amp-in-the-room version of a tone, not the mixed and
mastered record. Layered takes, studio compression, mic placement and
mastering sit between the amp and the released file.

## Plans

Two plans, each sold monthly or yearly. There is no free tier and no weekly pass.

- ${PLAN_NAMES.stage}: metered matches and saved tones
- ${PLAN_NAMES.player}: unlimited matches and saved tones

Both start with a ${TRIAL_DAYS}-day free trial. Nothing is charged until the trial ends.
Prices are shown on the account and are not published here, so do not quote a
figure for Tonelify. Yearly billing costs less per month than monthly on both plans.

## Main pages

- [Tone library](${SITE_URL}/explore): ${TONE_LIBRARY.length} documented tones, each with the original rig and a reference starting point
- [Gear pages](${SITE_URL}/gear): ${GEAR_CATALOG.length} amps, guitars, pedals and modellers, with front-panel control lists
- [Guides](${SITE_URL}/guides): ${GUIDES.length} explainers on EQ, amp controls, pedal order and pickups
- [Tone matcher](${SITE_URL}/tone-match): enter your gear and a song, get settings
- [FAQ](${SITE_URL}/faq): how tone matching works, gear coverage, what the plans include
- [About and method](${SITE_URL}/about): who publishes this, where the rig information comes from, what is not claimed
- [Request gear](${SITE_URL}/feedback?kind=gear): ask for equipment to be added
- [Send feedback](${SITE_URL}/feedback): report a bug, request a feature, or say what is wrong with a tone

## Guides

Reference answers to general guitar tone questions, independent of any product.

${GUIDES.map((g) => `- [${g.title}](${SITE_URL}/guides/${g.id}): ${g.answer[0]}`).join("\n")}

## Full export

- [llms-full.txt](${SITE_URL}/llms-full.txt): every documented tone as
  plain text, with the source URL on each entry

## Example tone pages

${EXAMPLE_TONES.map((t) => `- [${t.title}, ${t.artist}](${SITE_URL}/explore/${t.id})`).join("\n")}

## Key facts

- Works with electric guitar and bass
- Covers any amp and guitar the user names, not a fixed device list
- ${GEAR_CATALOG.length} gear entries have their own page; ${GEAR_CATALOG.filter((g) => g.controls?.length).length} of those carry a verified front-panel control list, so settings never reference a knob the unit does not have
- Tone pages document the original recording rig, phrased as reported rather than confirmed
- Tone pages also publish a reference starting point stated on a generic five-knob amp, which is explicitly not the settings used on the record
- The review section shows the most recent entries; the rating and the count in the page markup are generated from the stored rows, not written by hand
`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
