// A reference starting point for every tone in the library.
//
// Why this exists at all. The pages that win "master of puppets amp settings"
// today are the ones that print numbers: Guitar Chalk, Killer Rig, Riffhard.
// Our tone pages said, correctly, that there is no single set of numbers
// because the right positions depend on the amp in front of you. That is true
// and it is also unquotable, so an answer engine looking for something to cite
// walked past us every time.
//
// The honest version of a number is a number with its reference stated. These
// values are positions on ONE named panel: a generic five-knob amp with gain,
// bass, middle, treble and presence, each 0 to 10. That is a real, common
// front panel, and saying "6 on a five-knob amp" is a claim that can be checked
// rather than a claim about the record.
//
// What is deliberately NOT claimed:
// - that these are the settings used on the recording
// - that they will land on the same place on a different amp
//
// The second point is the product. A Katana and a Dual Rectifier reach the same
// voicing from different positions, and the matcher is what works that out. The
// starting point is the hook; the translation is the reason to sign up.
//
// Values are derived from genre, clean/distorted and riff/solo rather than
// hand-written per song, for the same reason the tone pages derive their prose:
// 24 hand-tuned tables would drift, and nobody can audit a table they did not
// write. Every number here is a general property of the style, which is the
// same basis the competing articles are working from.

import type { LibraryTone } from "./tone-library";
import type { AmpSettings } from "./tone-settings-public";

// The shapes, labels and the open/locked split live in tone-settings-public so
// a client component can have them without dragging BY_GENRE below into the
// browser bundle. Re-exported here so server callers keep one import.
export type { AmpSettings } from "./tone-settings-public";
export {
    SETTING_ROWS,
    OPEN_SETTING_KEYS,
    LOCKED_SETTING_KEYS,
    LOCKED_SETTING_LABELS,
    isOpenSetting,
    settingsSentence,
    openSettingsSentence,
} from "./tone-settings-public";

export type ToneStartingPoint = {
    settings: AmpSettings;
    /** Pickup selector position, in the words players use */
    pickup: string;
    /** Effects in signal-chain order, empty when the sound is all amp */
    effects: string[];
    /** One sentence on the control that matters most for this style */
    keyControl: string;
};

/**
 * Per-genre reference positions on a five-knob amp. Distorted values; the clean
 * variants are derived below rather than listed twice, so a genre cannot end up
 * with a clean profile that contradicts its distorted one.
 */
const BY_GENRE: Record<string, Omit<ToneStartingPoint, "pickup">> = {
    "Thrash Metal": {
        settings: { gain: 8, bass: 6, middle: 3, treble: 7, presence: 6, reverb: 1 },
        effects: ["Noise gate", "Amp distortion", "Short room reverb"],
        keyControl: "Middle. Thrash lives in the cut, but taking it past a 3 costs the definition that keeps fast downpicking readable.",
    },
    "Groove Metal": {
        settings: { gain: 8, bass: 6, middle: 2, treble: 8, presence: 7, reverb: 1 },
        effects: ["Noise gate", "Amp distortion", "Digital delay on leads"],
        keyControl: "Presence. The hard upper-midrange attack that defines this style comes from presence and treble, not from the gain knob.",
    },
    Metalcore: {
        settings: { gain: 7, bass: 5, middle: 5, treble: 6, presence: 6, reverb: 1 },
        effects: ["Noise gate", "Tube Screamer style boost", "Amp distortion"],
        keyControl: "Bass. Modern high gain needs a tighter low end than vintage crunch, and a boost pedal in front does more for tightness than more gain does.",
    },
    Metal: {
        settings: { gain: 7, bass: 5, middle: 4, treble: 7, presence: 6, reverb: 2 },
        effects: ["Noise gate", "Amp distortion", "Short reverb"],
        keyControl: "Gain. The weight on records like this comes from layered takes, so a single track set this high already sounds bigger than the record does alone.",
    },
    "Metal Ballad": {
        settings: { gain: 1, bass: 5, middle: 5, treble: 6, presence: 5, reverb: 4 },
        effects: ["Compressor", "Chorus", "Hall reverb"],
        keyControl: "Chorus depth. The width is the sound. The amp only has to stay clean enough not to break up under a hard-picked chord.",
    },
    "Alt Metal": {
        settings: { gain: 7, bass: 4, middle: 5, treble: 6, presence: 5, reverb: 2 },
        effects: ["Noise gate", "Amp distortion", "Chorus on clean passages"],
        keyControl: "Bass. Detuned parts need it pulled back further than feels right, or the low strings turn to mud the moment the gain rises.",
    },
    "Hard Rock": {
        settings: { gain: 6, bass: 5, middle: 6, treble: 6, presence: 6, reverb: 2 },
        effects: ["Amp distortion", "Delay on leads"],
        keyControl: "Middle. This is a mid-forward sound, not a scooped one. Scooping it is the single most common way players miss this tone.",
    },
    Rock: {
        settings: { gain: 5, bass: 5, middle: 6, treble: 6, presence: 5, reverb: 2 },
        effects: ["Amp distortion", "Spring reverb"],
        keyControl: "Master volume. The character comes from an amp worked hard rather than a pedal, so volume does more here than the gain knob.",
    },
    "Prog Rock": {
        settings: { gain: 5, bass: 5, middle: 7, treble: 5, presence: 5, reverb: 4 },
        effects: ["Fuzz or overdrive", "Modulation", "Long delay", "Hall reverb"],
        keyControl: "Delay time. Sustain and ambience carry these parts, and the repeats shape the sound as much as the amp does.",
    },
    "Psychedelic Rock": {
        settings: { gain: 6, bass: 6, middle: 6, treble: 5, presence: 5, reverb: 3 },
        effects: ["Fuzz", "Cranked amp", "Spring reverb"],
        keyControl: "Amp volume. Fuzz into a clean channel does not get there. The snarl comes from a fuzz circuit interacting with an amp already breaking up.",
    },
    "Blues Rock": {
        settings: { gain: 4, bass: 5, middle: 6, treble: 6, presence: 5, reverb: 3 },
        effects: ["Light overdrive", "Spring reverb"],
        keyControl: "Your guitar volume knob. Set the amp on the edge of breakup and the guitar does the work between clean and dirty.",
    },
    "Alt Rock": {
        settings: { gain: 3, bass: 5, middle: 5, treble: 6, presence: 5, reverb: 3 },
        effects: ["Compressor", "Light overdrive", "Room reverb"],
        keyControl: "Compression. Pick attack and compression define this more than gain, so a lightly driven amp gets closer than a high-gain setting.",
    },
    Grunge: {
        settings: { gain: 6, bass: 6, middle: 4, treble: 6, presence: 5, reverb: 2 },
        effects: ["Distortion pedal", "Cranked amp"],
        keyControl: "Gain staging. The point is a raw, barely controlled tone. Cleaning it up moves you away from the record rather than towards it.",
    },
    "Instrumental Rock": {
        settings: { gain: 6, bass: 5, middle: 7, treble: 6, presence: 5, reverb: 4 },
        effects: ["Overdrive", "Analog delay", "Hall reverb"],
        keyControl: "Middle. Smooth legato needs mids and moderate gain into a bright amp, not maximum saturation, which flattens the dynamics out.",
    },
};

const FALLBACK: Omit<ToneStartingPoint, "pickup"> = {
    settings: { gain: 5, bass: 5, middle: 6, treble: 6, presence: 5, reverb: 2 },
    effects: ["Amp distortion", "Reverb"],
    keyControl: "Middle. The balance between gain, midrange and pickup position defines this sound more than any single piece of equipment.",
};

/** Genres whose lead voice sits on the bridge pickup rather than the neck. */
const BRIDGE_LEAD = new Set([
    "Thrash Metal",
    "Groove Metal",
    "Metalcore",
    "Metal",
    "Alt Metal",
]);

const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n * 2) / 2));

function pickupFor(tone: LibraryTone): string {
    if (tone.tone === "Clean") {
        return tone.part === "Solo"
            ? "Neck pickup, tone control rolled back slightly"
            : "Neck or middle position";
    }
    if (tone.part === "Solo") {
        return BRIDGE_LEAD.has(tone.genre)
            ? "Bridge pickup"
            : "Neck pickup for body, bridge if the lead needs to cut";
    }
    return "Bridge pickup";
}

/**
 * The reference starting point for one tone. Pure and deterministic, so the
 * page, the FAQ answer, the schema block and llms-full.txt all state the same
 * numbers without anyone keeping three copies in step.
 */
export function startingPoint(tone: LibraryTone): ToneStartingPoint {
    const base = BY_GENRE[tone.genre] ?? FALLBACK;
    const s = { ...base.settings };

    // A clean part in a loud genre is still a clean part. Pulling the gain down
    // here rather than adding 14 more genre rows keeps the two axes independent.
    if (tone.tone === "Clean") {
        s.gain = Math.min(s.gain, 2);
        s.reverb = Math.max(s.reverb, 3);
    }

    // Leads need a little more body and a little more push to sit over a mix.
    if (tone.part === "Solo" && tone.tone === "Distorted") {
        s.middle = s.middle + 1;
        s.gain = s.gain + 0.5;
    }

    return {
        settings: {
            gain: clamp(s.gain),
            bass: clamp(s.bass),
            middle: clamp(s.middle),
            treble: clamp(s.treble),
            presence: clamp(s.presence),
            reverb: clamp(s.reverb),
        },
        pickup: pickupFor(tone),
        effects: base.effects,
        keyControl: base.keyControl,
    };
}

/**
 * The caveat, in one place. It appears on the page, in the FAQ answer and in
 * llms-full.txt, and it has to read identically in all three or the numbers
 * start looking like a claim about the recording.
 */
export const REFERENCE_CAVEAT =
    "These are positions on a generic five-knob amp with gain, bass, middle, treble and presence, each running 0 to 10. They are a starting point, not the settings used on the record, and they will not transfer unchanged to an amp with a different gain structure or EQ voicing.";
