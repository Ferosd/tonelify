import type { GearEntry } from "./gear-catalog";

/**
 * Researched specifications, merged onto the catalog entries by id.
 *
 * Why this file exists: 66 of the 123 catalog rows carried nothing but a brand,
 * a model and, on guitars, a pickup layout. Two pages from the same family
 * measured 70-78% identical five-word sequences, which is the near-duplicate
 * band, and a page that only differs by a proper noun is a page an engine folds
 * away rather than ranks. It also cost the tone engine accuracy: an amp with no
 * stored panel gets settings written against a generic five-knob layout.
 *
 * Why it is separate from gear-catalog.ts: that file is the hand-maintained
 * list of what Tonelify recognises, and it stays readable. This one is
 * reference data, gathered per model and merged in at module load.
 *
 * Sourcing rule, same as the catalog's: every value here was read off a
 * manufacturer page, an owner's manual or an authorised dealer's spec sheet in
 * August 2026. Where sources disagreed across model years or variants (the
 * Jackson Soloist's body wood, the Music Man JP15's piezo option, the Ibanez
 * RG421's switch) the disputed field is left out rather than guessed. A wrong
 * figure here is worse than a missing one: the reader is holding the thing.
 */
export const GEAR_SPECS: Record<string, Partial<GearEntry>> = {
    // ── ELECTRIC GUITARS ────────────────────────────────────────────────────
    "fender-player-stratocaster": {
        scale: '25.5"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Two-point synchronised tremolo",
        switching: "5-way blade, master volume, two tone controls",
    },
    "fender-american-professional-ii-stratocaster": {
        scale: '25.5"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Two-point synchronised tremolo with bent-steel saddles and cold-rolled steel block",
        switching: "5-way blade, master volume, two tone controls, push-push switch adding the neck pickup",
    },
    "squier-classic-vibe-60s-stratocaster": {
        scale: '25.5"',
        construction: "Poplar body, bolt-on maple neck",
        bridge: "Vintage-style six-saddle synchronised tremolo",
        switching: "5-way blade, master volume, two tone controls",
    },
    "fender-player-telecaster": {
        scale: '25.5"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Six-saddle string-through-body Telecaster bridge with block saddles",
        switching: "3-way blade, master volume, master tone",
    },
    "fender-american-professional-ii-telecaster": {
        scale: '25.5"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Telecaster bridge with compensated brass barrel saddles, top-load or string-through",
        switching: "3-way blade, master volume, master tone",
    },
    "squier-classic-vibe-50s-telecaster": {
        scale: '25.5"',
        construction: "Pine body, bolt-on maple neck",
        bridge: "Vintage-style Telecaster bridge with barrel saddles, string-through body",
        switching: "3-way blade, master volume, master tone",
    },
    "fender-player-jazzmaster": {
        scale: '25.5"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Six-saddle bridge with vintage-style floating tremolo tailpiece",
        switching: "3-way toggle, master volume, master tone",
    },
    "fender-player-mustang": {
        scale: '24"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Six-saddle string-through-body hardtail",
        switching: "3-way toggle, volume, tone",
    },
    "gibson-les-paul-standard": {
        scale: '24.75"',
        construction: "Mahogany body with carved maple top, set mahogany neck",
        bridge: "Tune-o-matic with stop bar tailpiece",
        switching: "3-way toggle, two volume, two tone",
    },
    "epiphone-les-paul-standard": {
        scale: '24.75"',
        construction: "Mahogany body with carved maple cap, set mahogany neck",
        bridge: "LockTone Tune-o-matic with LockTone stop bar",
        switching: "3-way toggle, two volume, two tone",
    },
    "gibson-sg-standard": {
        scale: '24.75"',
        construction: "Mahogany body, set mahogany neck",
        bridge: "Nashville Tune-o-matic with aluminium stop bar",
        switching: "3-way toggle, two volume, two tone",
    },
    "gibson-es-335": {
        scale: '24.75"',
        construction: "Semi-hollow laminated maple body with solid maple centre block, set mahogany neck",
        bridge: "Tune-o-matic with stop bar tailpiece",
        switching: "3-way toggle, two volume, two tone",
    },
    "gibson-explorer": {
        scale: '24.75"',
        construction: "Mahogany body, set mahogany neck",
        bridge: "Tune-o-matic with stop bar tailpiece",
        switching: "3-way toggle, two volume, two tone",
    },
    "gibson-flying-v": {
        scale: '24.75"',
        construction: "Mahogany body, set mahogany neck",
        bridge: "Tune-o-matic with stop bar tailpiece",
        switching: "3-way toggle, two volume, one tone",
    },
    "gibson-les-paul-junior": {
        scale: '24.75"',
        construction: "Slab mahogany body, set mahogany neck",
        bridge: "Compensated wraparound",
        switching: "Single bridge P-90, one volume, one tone, no selector",
    },
    "epiphone-sg-special": {
        scale: '24.75"',
        construction: "Poplar body with mahogany veneer, bolt-on neck",
        bridge: "Tune-o-matic with stop bar tailpiece",
        switching: "3-way toggle, master volume, master tone",
    },
    "prs-se-custom-24": {
        scale: '25"',
        construction: "Mahogany back with maple top, set wide-thin maple neck",
        bridge: "PRS patented tremolo",
        switching: "3-way blade with push-pull coil tap, volume and tone",
    },
    "prs-custom-24": {
        scale: '25"',
        construction: "Mahogany back with figured maple top, set mahogany neck",
        bridge: "PRS Gen III tremolo",
        switching: "5-way blade, master volume, master tone",
    },
    "ibanez-rg550": {
        scale: '25.5"',
        construction: "Basswood body, bolt-on five-piece maple and walnut neck",
        bridge: "Edge double-locking tremolo with locking nut",
        switching: "5-way blade, volume, tone",
    },
    "ibanez-rg421": {
        scale: '25.5"',
        construction: "Mahogany body, bolt-on Wizard III maple neck",
        bridge: "Fixed bridge",
    },
    "ibanez-az2402": {
        scale: '25.5"',
        construction: "Alder body, bolt-on roasted maple neck",
        bridge: "Gotoh T1802 tremolo with titanium saddles",
        switching: "dyna-MIX10 system with alter switch, volume and tone",
    },
    "jackson-pro-soloist": {
        scale: '25.5"',
        construction: "Neck-through three-piece maple neck",
        bridge: "Recessed Floyd Rose double-locking tremolo",
    },
    "jackson-dinky": {
        scale: '25.5"',
        construction: "Bolt-on maple neck, superstrat body",
    },
    "esp-ltd-ec-1000": {
        scale: '24.75"',
        construction: "Mahogany body, set neck",
        bridge: "TonePros locking Tune-o-matic",
        switching: "3-way toggle, two volume, one tone, active pickups",
    },
    "schecter-hellraiser-c-1": {
        scale: '25.5"',
        construction: "Mahogany body with quilted maple top, set mahogany neck",
        bridge: "TonePros Tune-o-matic, strings through the body",
        switching: "3-way toggle, two volume, one tone, active EMG pickups",
    },
    "schecter-omen-6": {
        scale: '25.5"',
        construction: "Basswood body, bolt-on maple neck",
        bridge: "Tune-o-matic",
        switching: "3-way toggle, volume, tone",
    },
    "charvel-pro-mod-dk24": {
        scale: '25.5"',
        construction: "Alder body, bolt-on caramelised maple neck",
        bridge: "Gotoh Custom 510 tremolo",
        switching: "5-way blade, volume, tone",
    },
    "gretsch-g5422": {
        scale: '24.6"',
        construction: "Fully hollow laminated maple body, set maple neck",
        bridge: "Adjusto-Matic on a rosewood base",
        switching: "3-way toggle, two volume, master volume, master tone",
    },
    "rickenbacker-330": {
        scale: '24.75"',
        construction: "Semi-hollow maple body, set maple neck",
        bridge: "Six-saddle bridge with 'R' tailpiece",
        switching: "3-way toggle, two volume, two tone and a fifth blend control",
    },
    "music-man-jp15": {
        scale: '25.5"',
        construction: "Okoume body with maple top, bolt-on roasted maple neck",
        bridge: "Music Man modern tremolo",
        switching: "3-way toggle, active preamp with push/push volume boost",
    },
    "harley-benton-fusion-t": {
        scale: '25.5"',
        construction: "Nyatoh body, bolt-on roasted flamed maple neck",
        bridge: "Wilkinson 50IIK two-point tremolo",
        switching: "3-way toggle, master volume, master tone with push/pull coil split",
    },
    "cort-g250": {
        scale: '25.5"',
        construction: "Basswood body, bolt-on maple neck",
        bridge: "Two-point tremolo with steel block",
        switching: "5-way blade, master volume, master tone with push-pull coil split",
    },
    "fender-squier-affinity-stratocaster": {
        scale: '25.5"',
        construction: "Poplar body, bolt-on maple neck",
        bridge: "Two-point tremolo",
        switching: "5-way blade, master volume, two tone controls",
    },
    "sterling-cutlass": {
        scale: '25.5"',
        construction: "Poplar body, bolt-on maple neck",
        bridge: "Fulcrum tremolo",
        switching: "5-way blade, master volume, master tone",
    },

    // ── BASSES ──────────────────────────────────────────────────────────────
    "fender-player-precision-bass": {
        scale: '34"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Four-saddle standard bass bridge",
        switching: "Split single coil, master volume, master tone",
    },
    "fender-player-jazz-bass": {
        scale: '34"',
        construction: "Alder body, bolt-on maple neck",
        bridge: "Four-saddle bridge with single-groove steel saddles",
        switching: "Two pickup volumes and a master tone",
    },
    "music-man-stingray": {
        scale: '34"',
        construction: "Ash body, bolt-on maple neck",
        bridge: "Music Man top-loading bass bridge",
        switching: "Humbucker into an active three-band preamp",
    },
    "ibanez-sr300e": {
        scale: '34"',
        construction: "Okoume body, bolt-on five-piece maple and walnut neck",
        bridge: "Accu-cast B120",
        switching: "Volume, pickup balancer, three-band EQ and a three-way power tap switch",
    },
    "yamaha-trbx304": {
        scale: '34"',
        construction: "Mahogany body, bolt-on five-piece maple and mahogany neck",
        switching: "Master volume, pickup balancer, active two-band EQ and a five-position Performance EQ switch",
    },
    "squier-affinity-jazz-bass": {
        scale: '34"',
        construction: "Poplar body, bolt-on maple neck",
        bridge: "Vintage-style four-saddle bridge",
        switching: "Two pickup volumes and a master tone",
    },

    // ── AMPS ────────────────────────────────────────────────────────────────
    // The amps that already carried a front panel get the two figures the panel
    // does not tell you: rated output and speaker. They are what separates two
    // amps with the same knobs, and headroom is the first thing a clean setting
    // runs out of. The DSL40CR and the DSL20CR are the case in point: identical
    // control layouts, 40W into a V-Type against 20W into a Seventy 80.
    "fender-blues-junior-iv": { power: "15W", speaker: '1x12" Celestion A-Type' },
    "fender-hot-rod-deluxe-iv": { power: "40W", speaker: '1x12" Celestion A-Type' },
    "fender-65-deluxe-reverb": { power: "22W", speaker: '1x12" Jensen C-12K' },
    "fender-65-princeton-reverb": { power: "12W", speaker: '1x10" Jensen C-10R' },
    "fender-champion-20": { power: "20W", speaker: '1x8"' },
    "marshall-dsl40cr": { power: "40W, switchable to 20W", speaker: '1x12" Celestion V-Type' },
    "marshall-dsl20cr": { power: "20W, switchable to 10W", speaker: '1x12" Celestion Seventy 80' },
    "marshall-jcm800-2203": { power: "100W head" },
    "marshall-jvm410h": { power: "100W head" },
    "marshall-origin-20c": { power: "20W, with 3W and 0.5W settings", speaker: '1x10" Celestion V-Type' },
    "vox-ac15c1": { power: "15W", speaker: '1x12" Celestion G12M Greenback' },
    "vox-ac30c2": { power: "30W", speaker: '2x12" Celestion G12M Greenback' },
    "boss-katana-50-mkii": { power: "50W, with 25W and 0.5W settings", speaker: '1x12" custom' },
    "boss-katana-100-mkii": { power: "100W, with 50W and 0.5W settings", speaker: '1x12" custom' },
    "orange-crush-35rt": { power: "35W", speaker: '1x10"' },
    "peavey-6505-plus": { power: "120W head" },
    "mesa-boogie-dual-rectifier": { power: "100W head" },
    "blackstar-ht-club-40": { power: "40W", speaker: '1x12" Celestion' },
    "blackstar-id-core-20": { power: "20W, as 2x10W stereo", speaker: '2x5" Blackstar' },
    "roland-jc-40": { power: "40W, as 2x20W stereo", speaker: '2x10"' },
    "roland-jc-120": { power: "120W, as 2x60W stereo", speaker: '2x12"' },
    "positive-grid-spark-40": { power: "40W, as 2x20W stereo", speaker: '2x4"' },
    "fender-rumble-100": { power: "100W", speaker: '1x12" Eminence' },
    "ampeg-svt-classic": { power: "300W head" },

    "fender-mustang-lt25": {
        power: "25W",
        speaker: '1x8" Fender Special Design',
        controls: ["Gain", "Volume", "Treble", "Bass", "Voice", "FX Level", "Master"],
    },
    "marshall-mg30gfx": {
        power: "30W",
        speaker: '1x10"',
        controls: ["Gain", "Bass", "Middle", "Treble", "Volume", "Reverb", "FX Type", "FX Level", "Master"],
        channels: ["Clean", "Crunch", "OD1", "OD2"],
    },
    "line-6-spider-v-30": {
        power: "30W",
        speaker: '1x8" woofer with tweeter',
        controls: ["Drive", "Bass", "Mid", "Treble", "Comp", "Reverb", "FX1", "FX2", "FX3", "Volume"],
    },
    "supro-blues-king-12": {
        power: "15W",
        speaker: '1x12" Supro BK12',
        controls: ["Volume", "Bass", "Middle", "Treble", "Reverb", "Master", "Boost"],
    },
    "victory-v30-mkii": {
        power: "42W, switchable to 7W",
        controls: [
            "Clean Gain", "Clean Bass", "Clean Middle", "Clean Treble", "Clean Master",
            "OD Gain", "OD Bass", "OD Middle", "OD Treble", "OD Master",
        ],
        channels: ["Clean (pull for crunch)", "Overdrive"],
    },
    "revv-g20": {
        power: "20W, switchable to 4W",
        controls: ["Gain", "Bass", "Middle", "Treble", "Volume", "Aggression", "Wide switch"],
        channels: ["Clean", "Purple (high gain)"],
    },
    "hughes-kettner-tubemeister-18": {
        power: "18W, with a four-stage power soak down to silent",
        controls: ["Clean Volume", "Lead Gain", "Lead Master", "Bass", "Mid", "Treble", "Boost"],
        channels: ["Clean", "Lead"],
    },
    "orange-rocker-15": {
        power: "15W, with half-power and 1W bedroom modes",
        speaker: '1x10" Orange Voice of the World Gold Label',
        controls: ["Natural Volume", "Dirty Gain", "Bass", "Middle", "Treble", "Dirty Volume"],
        channels: ["Natural", "Dirty"],
    },
    "mesa-boogie-mark-v-25": {
        power: "25W, switchable to 10W",
        controls: ["Gain", "Treble", "Mid", "Bass", "Presence", "Master", "5-band graphic EQ"],
        channels: ["Channel 1 (Clean, Fat, Crunch)", "Channel 2 (Mark IIC+, Mark IV, Xtreme)"],
    },

    // ── BASS AMPS ───────────────────────────────────────────────────────────
    "ampeg-ba-110": {
        power: "40W",
        speaker: '1x10" Ampeg Custom',
        controls: ["Volume", "Bass", "Midrange", "Treble", "Scrambler Drive", "Scrambler Blend"],
    },
    "hartke-hd75": {
        power: "75W",
        speaker: '1x12" HyDrive with tweeter',
        controls: ["Volume", "Bass", "Mid", "Treble", "7-band graphic EQ"],
    },

    // ── PEDALS ──────────────────────────────────────────────────────────────
    "dunlop-cry-baby": {
        controls: ["Treadle sweep"],
    },
    "strymon-timeline": {
        controls: ["Time", "Repeats", "Mix", "Filter", "Grit", "Speed", "Depth", "Value"],
    },
    "strymon-bigsky": {
        controls: ["Decay", "Pre-Delay", "Mix", "Tone", "Mod", "Param 1", "Param 2", "Value"],
    },
    "xotic-ep-booster": {
        controls: ["Level", "Internal bass boost DIP", "Internal bright DIP"],
    },
    "digitech-whammy": {
        controls: ["Treadle", "Mode selector"],
    },

    // ── MULTI FX AND MODELLERS ──────────────────────────────────────────────
    // These do not have a front panel of tone knobs in the way an amp does, so
    // what is stored is the shape of the unit: how many footswitches a patch is
    // played from, and, where the unit really does carry amp-style controls,
    // those controls by name.
    "kemper-profiler": {
        controls: ["Gain", "Bass", "Middle", "Treble", "Presence", "Rig Volume"],
        note: "Profiling amp: it captures a real rig as a profile rather than modelling a fixed list, and the six amp-style knobs adjust the captured profile.",
    },
    "ik-multimedia-tonex-pedal": {
        controls: ["Gain", "Bass", "Middle", "Treble", "Presence", "Volume", "Reverb", "Compressor", "Noise Gate", "Depth"],
        note: "Amp and pedal capture player with a real knob per control, three footswitches and dual-function encoders.",
    },
    "line-6-hx-stomp": {
        note: "Compact Helix processor: three footswitches and up to six blocks in a preset, so the chain has to be planned rather than stacked.",
    },
    "line-6-pod-go": {
        note: "Floor modeller with eight footswitches and a treadle. Six fixed blocks (wah, volume, FX loop, amp, cab and EQ) plus four free ones per preset.",
    },
    "neural-dsp-quad-cortex": {
        note: "Floor modeller with eleven rotary footswitches and three play modes: stomp, scene and preset. It captures amps as well as modelling them.",
    },
    "fractal-fm9": {
        note: "Floor modeller with nine footswitches, each with its own LED ring and mini display.",
    },
    "fractal-fm3": {
        note: "The compact Fractal floor unit: three footswitches on board, with FC controllers addable over FASLINK II.",
    },
    "fractal-axe-fx-iii": {
        note: "Rack processor. It is driven from the front panel or an FC foot controller rather than from footswitches of its own.",
    },
    "boss-gt-1000core": {
        note: "Compact processor with three footswitches, five editing knobs and up to 24 effect blocks per patch, built on Boss AIRD amp modelling.",
    },
    "boss-me-80": {
        note: "Floor unit with a real knob per effect section, so a patch is dialled in by hand rather than through menus, plus eight footswitches and a treadle.",
    },
    "headrush-mx5": {
        note: "Ultraportable modeller with three footswitches and a colour touchscreen, running the HeadRush rig format.",
    },
    "mooer-ge300": {
        note: "Floor modeller with ten footswitches, amp capture and a synth engine alongside the modelling.",
    },
    "valeton-gp-200": {
        note: "Floor modeller with eight footswitches, a treadle and eleven effect modules per patch, with slots for custom impulse responses.",
    },
    "zoom-g6": {
        note: "Floor modeller driven from a 4.3in touchscreen, with six stomp footswitches, a treadle and four ways of laying the switches out.",
    },
    "nux-mg-30": {
        note: "Floor modeller with a colour screen, dedicated knobs and a treadle, shipped with a two-button external footswitch.",
    },
};
