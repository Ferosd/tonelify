/**
 * The half of the settings module a browser is allowed to have.
 *
 * This split is the paywall. lib/tone-settings.ts holds BY_GENRE, which is
 * every locked value for every style in one table, so a client component
 * importing anything from that file would pull the whole table into the
 * JavaScript bundle and the gate would be decoration. The knob panel imports
 * this file instead: shapes, labels and which keys are open, and no values.
 */

export type AmpSettings = {
    gain: number;
    bass: number;
    middle: number;
    treble: number;
    presence: number;
    reverb: number;
};

/** Display order, matching the left-to-right order on a real front panel. */
export const SETTING_ROWS: { key: keyof AmpSettings; label: string }[] = [
    { key: "gain", label: "Gain" },
    { key: "bass", label: "Bass" },
    { key: "middle", label: "Middle" },
    { key: "treble", label: "Treble" },
    { key: "presence", label: "Presence" },
    { key: "reverb", label: "Reverb" },
];

/**
 * What a visitor without a plan sees.
 *
 * The first two knobs stay open on purpose. A page that shows nothing has
 * nothing anyone can quote, and the whole reason these numbers exist is that a
 * passage with no figure in it never gets cited. Gain and bass set the shape of
 * the sound, they are enough for a reader to tell the page has real values on
 * it, and they are not enough to skip the product.
 *
 * The rest is what the plan pays for: the EQ curve, the signal chain, and the
 * one control that actually matters for the style.
 */
export const OPEN_SETTING_KEYS: (keyof AmpSettings)[] = ["gain", "bass"];

export function isOpenSetting(key: keyof AmpSettings): boolean {
    return OPEN_SETTING_KEYS.includes(key);
}

export const LOCKED_SETTING_KEYS: (keyof AmpSettings)[] = SETTING_ROWS
    .map((r) => r.key)
    .filter((k) => !isOpenSetting(k));

/** The names of the controls behind the paywall, for the copy that says so. */
export const LOCKED_SETTING_LABELS = LOCKED_SETTING_KEYS.map(
    (k) => SETTING_ROWS.find((r) => r.key === k)!.label.toLowerCase()
);

/** "Gain 8, Bass 6, Middle 3, Treble 7, Presence 6, Reverb 1" */
export function settingsSentence(s: AmpSettings): string {
    return SETTING_ROWS.map((r) => `${r.label} ${s[r.key]}`).join(", ");
}

/**
 * "Gain 8, Bass 6" — the sentence for the open half only.
 *
 * Used everywhere the full sentence used to go on a public surface: the meta
 * description, the FAQ answer, the schema payload, llms-full.txt. Locked values
 * must be absent from those, not printed as zeros. A paywall that renders the
 * hidden numbers as 0 is worse than no paywall, because crawlers and answer
 * engines read the zeros as real settings and quote them.
 */
export function openSettingsSentence(s: AmpSettings): string {
    return SETTING_ROWS.filter((r) => isOpenSetting(r.key))
        .map((r) => `${r.label} ${s[r.key]}`)
        .join(", ");
}
