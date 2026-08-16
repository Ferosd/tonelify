// Per-gear page copy, varied by what the thing actually is.
//
// The gear pages were one template with the model name substituted in, which
// is the shape Google's scaled-content guidance is written about: 123 URLs
// whose only difference is a proper noun read as one page repeated, and pages
// like that get crawled, classified as near-duplicates and dropped from the
// index rather than ranked.
//
// The fix is not more words. It is words that are only true of this row: a
// tube head and a modelling combo are dialled in differently, a single coil
// and a humbucker drive the front of an amp differently, and a fuzz sits
// somewhere a delay does not. Everything below keys on `type` and `category`,
// which are already in the catalog, so the variation costs no new hand-written
// content and cannot go stale against the entry it describes.

import { GEAR_TYPE_LABELS, gearLabel, type GearEntry } from "./gear-catalog";
import type { LibraryTone } from "./tone-library";
import { TONE_LIBRARY } from "./tone-library";

/** Broad behaviour class, which is what actually changes the advice. */
type Family =
    | "tube-amp"
    | "solid-state-amp"
    | "modelling-amp"
    | "guitar"
    | "bass"
    | "bass-amp"
    | "drive-pedal"
    | "time-pedal"
    | "multifx";

const DRIVE_CATEGORIES = new Set(["Overdrive", "Distortion", "Fuzz", "Boost", "Preamp"]);

export function familyOf(entry: GearEntry): Family {
    switch (entry.type) {
        case "guitar":
            return "guitar";
        case "bass":
            return "bass";
        case "bass-amp":
            return "bass-amp";
        case "multifx":
            return "multifx";
        case "pedal":
            return DRIVE_CATEGORIES.has(entry.category ?? "") ? "drive-pedal" : "time-pedal";
        default: {
            const c = entry.category ?? "";
            if (c.includes("Modelling")) return "modelling-amp";
            if (c.includes("Solid state")) return "solid-state-amp";
            return "tube-amp";
        }
    }
}

/**
 * The paragraph under the h1. One per family, so a Dual Rectifier page and a
 * Katana page do not open with the same sentence.
 */
export function leadParagraph(entry: GearEntry): string {
    const label = gearLabel(entry);
    switch (familyOf(entry)) {
        case "tube-amp":
            return `A valve amp does not respond to a knob the way a number on a page suggests. Where the ${label} sits in its own gain range changes what every other control does: the same treble setting is bright at low volume and harsh once the power section is working. That is why copying an artist's numbers onto this amp gives the wrong answer, and why the settings here are written against this amp's behaviour rather than the one the record was cut on.`;
        case "solid-state-amp":
            return `Solid-state amps hold their voicing steady across the volume range, which makes the ${label} far more predictable to dial in than a valve amp and is exactly why some of the most aggressive rhythm tones ever recorded came off solid-state heads. The trade is headroom before the EQ starts to sound brittle, so on this amp the treble and presence controls do more damage than the gain control does.`;
        case "modelling-amp":
            return `The ${label} is a modelling amp, so a tone match here has two halves: which model or voicing to select, and where to set the controls once it is selected. Getting the second right on the wrong model gets you nowhere. Tonelify picks the voicing first and writes the knob positions against it, using the front panel this unit actually has.`;
        case "guitar":
            return `Pickup output and position decide how hard the front of an amp gets driven, which means the ${label} needs different amp settings from a guitar with the opposite layout to land on the same sound. That difference is where most tone-chasing goes wrong: the settings were right, but they were written for someone else's pickups.`;
        case "bass":
            return `Bass tone matching works from the same four things as guitar, the gain structure, the EQ curve, the pickup position and the effects order, but the frequencies that carry the character sit an octave down. Settings for the ${label} are written for bass rigs rather than adapted from a guitar answer.`;
        case "bass-amp":
            return `A bass amp's EQ points sit where a guitar amp's do not, so a bass tone written against guitar advice fights the cabinet. Settings for the ${label} use this amp's own controls and the frequency ranges they actually cover.`;
        case "drive-pedal":
            return `A drive pedal is not an amount of gain, it is a shape. The ${label} changes what reaches the amp's input, so where it sits in the chain and how the amp is set behind it matter as much as the pedal's own controls. Settings here cover both ends: the pedal, and the amp underneath it.`;
        case "time-pedal":
            return `Time and modulation effects sit at a specific point in a chain and change character completely if they move. Settings for the ${label} come with the position in the signal path, not just the knob values, because a delay in front of a driven amp and the same delay in a loop are two different sounds.`;
        case "multifx":
            return `A multi-effects unit gives you the whole chain in one box, which means the order of the blocks is as much of the answer as the values inside them. Settings for the ${label} name the amp model, the block order and the parameters together, rather than handing you numbers with no chain to put them in.`;
    }
}

const has = (entry: GearEntry, needle: string) =>
    (entry.controls ?? []).some((c) => c.toLowerCase().includes(needle));

const lowerFirst = (s: string): string => (s ? s[0].toLowerCase() + s.slice(1) : s);

const list = (items: string[]): string =>
    items.length <= 1
        ? items.join("")
        : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/**
 * What this one unit's own panel means for dialling it in.
 *
 * `leadParagraph` varies by family, which is enough to keep a fuzz pedal page
 * away from a valve head page, but it left two Marshall heads reading as the
 * same page with the model name swapped: measured at 75% identical five-word
 * sequences, which is the near-duplicate band. This paragraph is generated from
 * the row's own controls, channels, voicings and pickups, so two units only
 * read alike when their front panels genuinely are alike.
 *
 * Every sentence is derived from stored facts. Nothing here is invented, and an
 * entry with no panel on file gets no paragraph rather than a padded one.
 */
export function panelParagraph(entry: GearEntry): string | null {
    const label = gearLabel(entry);
    const family = familyOf(entry);
    const parts: string[] = [];

    if (family === "guitar" || family === "bass") {
        if (!entry.pickups && !entry.scale) return null;

        if (entry.scale) {
            // Scale length is the one number on a guitar that changes the
            // settings: it sets string tension at pitch, which is why the same
            // gain lands tighter on a 25.5" and thicker on a 24.75".
            const short = parseFloat(entry.scale) < 25;
            parts.push(
                `A ${entry.scale} scale${entry.construction ? `, ${lowerFirst(entry.construction)}` : ""}. ${short
                    ? "Shorter scales hold less string tension at pitch, so the low end arrives softer and the front of the amp saturates sooner. That usually means a shade less gain than a longer-scale guitar wants for the same part."
                    : "That is the longer of the two common scales, so the strings sit tighter at pitch and the low end stays defined under gain."
                }`
            );
        }

        if (entry.pickups) {
            const p = entry.pickups.toUpperCase();
            parts.push(pickupNote(p));
        }

        if (entry.switching) {
            parts.push(`Controls: ${lowerFirst(entry.switching)}.`);
        }

        if (entry.bridge) {
            parts.push(
                `${entry.bridge}${/trem|floyd|vibrato|bigsby/i.test(entry.bridge)
                    ? ", so anything in the original that moves the pitch by hand can be played rather than approximated with an effect."
                    : ", a fixed anchor, so pitch effects in the original have to come from a pedal or the picking hand."
                }`
            );
        }

        parts.push(
            `Every setting Tonelify writes for this instrument names the pickup position it was dialled in on, because moving the selector changes both the level hitting the amp and the frequency balance it arrives with.`
        );
        return parts.join(" ");
    }

    if (!entry.controls?.length && !entry.power) return null;

    const notable: string[] = [];

    if (entry.power) {
        // Watts are the headroom figure, and headroom is what decides whether a
        // clean setting stays clean at the volume it will be played at.
        const watts = parseInt(entry.power, 10);
        notable.push(
            `${entry.power}${entry.speaker ? ` through a ${entry.speaker}` : ""}. ${Number.isFinite(watts) && watts <= 20
                ? "At that rating the power section starts working early, so the loudness knob is part of the tone setting rather than separate from it."
                : "There is enough headroom to hold a clean setting at band volume, so the gain control does the driving rather than the master."
            }`
        );
    }

    if (!entry.controls?.length) {
        return notable.length ? notable.join(" ") : null;
    }

    if (family === "tube-amp" || family === "solid-state-amp" || family === "modelling-amp" || family === "bass-amp") {
        notable.push(
            has(entry, "presence")
                ? `It has a presence control, so the top end above the treble band is set separately from the tone stack. That is the control to reach for when a setting sounds close but harsh.`
                : `There is no presence control on this panel, so everything above the treble band has to come from the treble control and the guitar's own tone knob. A setting copied from an amp with presence has to be rebalanced here.`
        );

        if (has(entry, "resonance") || has(entry, "deep")) {
            notable.push(`A ${has(entry, "resonance") ? "resonance" : "deep"} control sets the low end at the power stage rather than in the preamp, which is a different kind of bass to the one the bass knob makes.`);
        }

        if (!has(entry, "middle") && !has(entry, "mid")) {
            notable.push(`The EQ has no middle control, so the midrange is fixed by the amp's own voicing and can only be shaped around with bass and treble, or in front of the amp with a pedal.`);
        }

        notable.push(
            has(entry, "master")
                ? `Gain and master volume are separate, so the preamp can be driven hard at a volume that is liveable. Where a tone sits between the two is part of the answer, not a detail.`
                : `There is no master volume: how loud the amp is and how driven it sounds move together, which is the main thing to plan around when a setting written for a master-volume amp is carried over.`
        );

        if (has(entry, "reverb")) {
            notable.push(`Reverb is onboard, so a tone that needs it does not need a pedal in the chain.`);
        }
    }

    if (family === "drive-pedal" || family === "time-pedal" || family === "multifx") {
        notable.push(
            `Its controls are ${list(entry.controls)}, and settings for this ${GEAR_TYPE_LABELS[entry.type].toLowerCase()} are written against those names rather than a generic level, tone and gain.`
        );
    }

    if (entry.channels?.length) {
        notable.push(
            entry.channels.length === 1
                ? `One channel, ${entry.channels[0]}, so the clean sound and the driven sound are the same circuit at two different settings.`
                : `${entry.channels.length} channels, ${list(entry.channels)}, and a setting only means something once the channel it belongs to is named.`
        );
    }

    if (entry.voicings?.length) {
        notable.push(
            `The selectable voicings are ${list(entry.voicings)}. Picking the voicing comes before the knob positions, because the same numbers land somewhere else on each one.`
        );
    }

    if (notable.length === 0) return null;

    return notable.join(" ");
}

/**
 * Family-specific questions with answers that are true of this row only. These
 * feed both the visible FAQ section and the FAQPage block, which the gear pages
 * previously had no version of at all.
 */
export function gearFaqs(entry: GearEntry): { q: string; a: string }[] {
    const label = gearLabel(entry);
    const family = familyOf(entry);
    const typeLabel = GEAR_TYPE_LABELS[entry.type].toLowerCase();
    const out: { q: string; a: string }[] = [];

    if (family === "tube-amp" || family === "solid-state-amp" || family === "modelling-amp") {
        out.push({
            q: `What are good starting settings on a ${label}?`,
            a: entry.controls?.length
                ? `Start from the middle of the range on ${entry.controls.slice(0, 4).join(", ")} and move one control at a time. There is no single correct set of numbers for this amp, because the target changes with the song. Tonelify writes the values for a named tone against this amp's actual panel: ${entry.controls.join(", ")}.`
                : `Set every control to the middle of its range, then move one at a time towards the sound you want, gain first and EQ second. Tonelify writes the values for a specific song against this amp rather than handing you a generic curve.`,
        });
        out.push({
            q: `Can the ${label} get a metal tone?`,
            a:
                family === "tube-amp"
                    ? `It depends on how much gain the amp makes on its own. Where a valve amp runs short of gain, a drive pedal in front of the input adds saturation and tightens the low end at the same time, which is how most of the amp's own range gets extended. Tonelify says which of the two routes a given tone needs on this amp.`
                    : family === "modelling-amp"
                        ? `Yes, by selecting a high-gain voicing rather than by turning the gain up on a clean one. On a modelling amp the model choice sets the ceiling and the knobs work inside it, so picking the voicing is the first step of the answer.`
                        : `Yes. Solid-state heads are behind some of the tightest recorded rhythm tones, because their gain stays consistent instead of softening as the amp is pushed. What they need is a firmer hand on the treble and presence controls than a valve amp does.`,
        });
    }

    if (family === "guitar" || family === "bass") {
        out.push({
            q: `What amp settings suit a ${label}?`,
            a: entry.pickups
                ? `The ${entry.pickups} layout on this instrument is what decides it. ${pickupNote(entry.pickups)} That changes the gain setting more than any other control, which is why the same song needs different numbers on this instrument than on one with the opposite layout.`
                : `That depends on the tone you are after rather than on the instrument alone, but the pickup you select changes how hard the amp is driven and therefore where the gain control ends up. Name the song and the amp and Tonelify accounts for both.`,
        });
        out.push({
            q: `Do I need to change my settings when I switch pickups on the ${label}?`,
            a: `Yes. Moving from a neck position to a bridge position changes both the output level hitting the amp and the frequency balance, so a setting dialled in on one pickup rarely holds up on the other. Every set of settings Tonelify returns names the pickup position it was written for.`,
        });
    }

    if (family === "drive-pedal" || family === "time-pedal") {
        out.push({
            q: `Where does the ${label} go in the signal chain?`,
            a:
                family === "drive-pedal"
                    ? `In front of the amp input, before any time-based effects. Drive pedals interact with what the amp is already doing, so the amp's own gain setting is part of the answer and cannot be ignored when the pedal is dialled in.`
                    : `After the drive stage. Running a time or modulation effect into a distorted input smears the repeats into the distortion instead of layering them over it, which is why this kind of pedal usually belongs in an effects loop where the amp has one.`,
        });
    }

    if (family === "multifx") {
        out.push({
            q: `How do you build a patch on the ${label}?`,
            a: `Pick the amp model first, then set its controls, then add the blocks in signal-chain order: drive before the amp, time and modulation after it. A patch built the other way around ends up compensating for the wrong stage. Tonelify returns the model, the order and the parameters together.`,
        });
    }

    out.push({
        q: `Does Tonelify support the ${label}?`,
        a: entry.controls?.length
            ? `Yes, and its front panel is stored, so settings only ever reference controls this ${typeLabel} has: ${entry.controls.join(", ")}. You will not be told to set a knob that is not there.`
            : `Yes. Name it in the tone matcher along with the song you are chasing and the settings come back adapted to it. Gear does not need to be in the catalog for a match to run.`,
    });

    return out;
}

function pickupNote(pickups: string): string {
    if (pickups.includes("H") && !pickups.includes("S"))
        return "Humbuckers push a hotter, thicker signal into the input, so they reach a given amount of saturation at a lower gain setting.";
    if (!pickups.includes("H"))
        return "Single coils send a lower-output, brighter signal into the input, so they need more gain to reach the same saturation and less treble to stay comfortable.";
    return "A mixed layout means the same guitar drives the amp two different ways depending on the selector, so the gain setting has to be stated per position.";
}

/**
 * Tones worth trying on this gear. Previously every page listed the same first
 * six library entries, which is both a duplicate-content signal and useless
 * advice: nobody chases Sultans of Swing on a 6505.
 */
export function tonesFor(entry: GearEntry, count = 6): LibraryTone[] {
    const family = familyOf(entry);
    const highGain = new Set(["Thrash Metal", "Groove Metal", "Metalcore", "Metal", "Alt Metal"]);

    const rank = (tone: LibraryTone): number => {
        switch (family) {
            case "modelling-amp":
            case "multifx":
                // These cover everything, so spread the list across the range
                return tone.tone === "Clean" ? 1 : 0;
            case "solid-state-amp":
                return highGain.has(tone.genre) ? 0 : tone.tone === "Clean" ? 1 : 2;
            case "tube-amp":
                return highGain.has(tone.genre) ? 2 : 0;
            case "guitar":
                return entry.pickups?.includes("H") && !entry.pickups.includes("S")
                    ? highGain.has(tone.genre) || tone.tone === "Distorted"
                        ? 0
                        : 2
                    : tone.tone === "Clean"
                        ? 0
                        : 1;
            case "bass":
            case "bass-amp":
                return 0;
            case "drive-pedal":
                return tone.tone === "Distorted" ? 0 : 2;
            case "time-pedal":
                return tone.part === "Solo" ? 0 : 1;
        }
    };

    return [...TONE_LIBRARY]
        .map((t, i) => ({ t, r: rank(t), i }))
        .sort((a, b) => a.r - b.r || a.i - b.i)
        .slice(0, count)
        .map((x) => x.t);
}
