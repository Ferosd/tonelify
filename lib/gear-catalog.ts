// Structured gear, replacing free text in the places that feed the tone engine.
//
// Two jobs. First, accuracy: `controls` is the literal front panel of an amp,
// and it is sent to the model so it stops returning a presence value for an
// amp that has no presence knob. Nothing costs trust faster than being told to
// set a control the player is looking straight at and cannot find. Entries only
// carry `controls` where the panel is known for certain, because a wrong list
// is worse than no list.
//
// Second, addressable pages: every entry becomes /gear/[id], which is how
// somebody searching for their own amp finds this site at all.
//
// Free text is never blocked anywhere. The catalog is a suggestion layer, and
// gear that is missing from it still runs a match exactly as before.

import { GEAR_SPECS } from "./gear-specs";

export type GearType = "guitar" | "bass" | "amp" | "bass-amp" | "pedal" | "multifx";

export type GearEntry = {
    /** URL slug and stable id */
    id: string;
    brand: string;
    model: string;
    type: GearType;
    /** Combo, Head, Overdrive, Delay, and so on */
    category?: string;
    /** Guitars: pickup layout as players write it, e.g. "SSS", "HH", "HSS" */
    pickups?: string;
    /**
     * The literal front-panel controls. Omitted when the panel is not certain.
     * Present entries are the accuracy win: the model is told not to invent a
     * knob that is not on this list.
     */
    controls?: string[];
    /** Selectable channels, where the amp has them */
    channels?: string[];
    /** Selectable voicings or amp models, where the amp has them */
    voicings?: string[];
    /**
     * Specifications, filled in from the manufacturer's own page where one
     * exists. These exist for the same two reasons as `controls`: they change
     * the advice (a 25.5" bolt-on with single coils does not want the same
     * settings as a 24.75" set-neck with humbuckers, and a 15W valve combo
     * runs out of clean headroom where a 100W head does not), and they are the
     * only thing that makes 123 gear pages 123 different pages rather than one
     * template with the model name swapped.
     *
     * Every field is optional and only ever carries a figure that was read off
     * a manufacturer or authorised-dealer spec sheet. A wrong number here is
     * worse than a missing one: the reader is holding the instrument.
     */
    /** Amps: rated output as the maker states it, e.g. "40W". */
    power?: string;
    /** Amps: speaker complement, e.g. `1x12" Celestion V-Type`. */
    speaker?: string;
    /** Guitars and basses: scale length, e.g. `25.5"`. */
    scale?: string;
    /** Guitars and basses: body wood and neck joint, e.g. "Alder body, bolt-on maple neck". */
    construction?: string;
    /** Guitars and basses: bridge type, e.g. "Two-point tremolo". */
    bridge?: string;
    /** Guitars and basses: control and switching layout, e.g. "5-way, 1 volume, 2 tone". */
    switching?: string;
    /** Alternative spellings players actually type */
    aliases?: string[];
    /** One line of plain description, used on the gear page */
    note?: string;
};

const BASE_CATALOG: GearEntry[] = [
    // ── ELECTRIC GUITARS ────────────────────────────────────────────────────
    { id: "fender-player-stratocaster", brand: "Fender", model: "Player Stratocaster", type: "guitar", pickups: "SSS", aliases: ["player strat", "mim strat", "fender stratocaster", "stratocaster", "strat"], note: "Three single coils and a five-way switch, the default reference for glassy clean and edge-of-breakup tones." },
    { id: "fender-american-professional-ii-stratocaster", brand: "Fender", model: "American Professional II Stratocaster", type: "guitar", pickups: "SSS", aliases: ["am pro ii strat", "american pro strat"] },
    { id: "squier-classic-vibe-60s-stratocaster", brand: "Squier", model: "Classic Vibe '60s Stratocaster", type: "guitar", pickups: "SSS", aliases: ["classic vibe strat", "squier strat"] },
    { id: "fender-player-telecaster", brand: "Fender", model: "Player Telecaster", type: "guitar", pickups: "SS", aliases: ["player tele", "mim tele", "fender telecaster", "telecaster", "tele"], note: "Bridge single coil with the bite that carries country, indie and classic rock rhythm parts." },
    { id: "fender-american-professional-ii-telecaster", brand: "Fender", model: "American Professional II Telecaster", type: "guitar", pickups: "SS", aliases: ["am pro tele"] },
    { id: "squier-classic-vibe-50s-telecaster", brand: "Squier", model: "Classic Vibe '50s Telecaster", type: "guitar", pickups: "SS", aliases: ["squier tele"] },
    { id: "fender-player-jazzmaster", brand: "Fender", model: "Player Jazzmaster", type: "guitar", pickups: "SS", aliases: ["jazzmaster"] },
    { id: "fender-player-mustang", brand: "Fender", model: "Player Mustang", type: "guitar", pickups: "SS", aliases: ["mustang"] },
    { id: "gibson-les-paul-standard", brand: "Gibson", model: "Les Paul Standard", type: "guitar", pickups: "HH", aliases: ["les paul", "lp standard", "gibson les paul"], note: "Two humbuckers into a short scale, the thick mid-forward voice behind most classic hard rock." },
    { id: "epiphone-les-paul-standard", brand: "Epiphone", model: "Les Paul Standard", type: "guitar", pickups: "HH", aliases: ["epi les paul", "epiphone les paul"] },
    { id: "gibson-sg-standard", brand: "Gibson", model: "SG Standard", type: "guitar", pickups: "HH", aliases: ["sg", "gibson sg"] },
    { id: "gibson-es-335", brand: "Gibson", model: "ES-335", type: "guitar", pickups: "HH", aliases: ["es335", "335"] },
    { id: "gibson-explorer", brand: "Gibson", model: "Explorer", type: "guitar", pickups: "HH" },
    { id: "gibson-flying-v", brand: "Gibson", model: "Flying V", type: "guitar", pickups: "HH" },
    { id: "prs-se-custom-24", brand: "PRS", model: "SE Custom 24", type: "guitar", pickups: "HH", aliases: ["prs se", "custom 24"] },
    { id: "prs-custom-24", brand: "PRS", model: "Custom 24", type: "guitar", pickups: "HH" },
    { id: "ibanez-rg550", brand: "Ibanez", model: "RG550", type: "guitar", pickups: "HSH", aliases: ["rg 550"] },
    { id: "ibanez-rg421", brand: "Ibanez", model: "RG421", type: "guitar", pickups: "HH" },
    { id: "ibanez-az2402", brand: "Ibanez", model: "AZ2402", type: "guitar", pickups: "HH", aliases: ["az 2402"] },
    { id: "jackson-pro-soloist", brand: "Jackson", model: "Pro Series Soloist", type: "guitar", pickups: "HH", aliases: ["soloist"] },
    { id: "jackson-dinky", brand: "Jackson", model: "Dinky", type: "guitar", pickups: "HH" },
    { id: "esp-ltd-ec-1000", brand: "ESP", model: "LTD EC-1000", type: "guitar", pickups: "HH", aliases: ["ec1000", "ltd ec 1000"] },
    { id: "schecter-hellraiser-c-1", brand: "Schecter", model: "Hellraiser C-1", type: "guitar", pickups: "HH", aliases: ["hellraiser"] },
    { id: "schecter-omen-6", brand: "Schecter", model: "Omen-6", type: "guitar", pickups: "HH" },
    { id: "yamaha-pacifica-112v", brand: "Yamaha", model: "Pacifica 112V", type: "guitar", pickups: "HSS", aliases: ["pacifica", "pac112"], note: "The standard first serious guitar, an HSS layout that covers single coil chime and humbucker drive." },
    { id: "charvel-pro-mod-dk24", brand: "Charvel", model: "Pro-Mod DK24", type: "guitar", pickups: "HSS", aliases: ["dk24"] },
    { id: "gretsch-g5422", brand: "Gretsch", model: "G5422 Electromatic", type: "guitar", pickups: "HH", aliases: ["electromatic"] },
    { id: "rickenbacker-330", brand: "Rickenbacker", model: "330", type: "guitar", pickups: "SS", aliases: ["rick 330"] },
    { id: "music-man-jp15", brand: "Music Man", model: "JP15", type: "guitar", pickups: "HH", aliases: ["john petrucci"] },
    { id: "harley-benton-fusion-t", brand: "Harley Benton", model: "Fusion-T", type: "guitar", pickups: "HH" },
    { id: "cort-g250", brand: "Cort", model: "G250", type: "guitar", pickups: "HSS" },
    { id: "epiphone-sg-special", brand: "Epiphone", model: "SG Special", type: "guitar", pickups: "HH", aliases: ["epiphone sg"] },
    { id: "fender-squier-affinity-stratocaster", brand: "Squier", model: "Affinity Stratocaster", type: "guitar", pickups: "SSS", aliases: ["affinity strat"] },
    { id: "sterling-cutlass", brand: "Sterling by Music Man", model: "Cutlass", type: "guitar", pickups: "SSS" },
    { id: "gibson-les-paul-junior", brand: "Gibson", model: "Les Paul Junior", type: "guitar", pickups: "S", aliases: ["lp junior"] },

    // ── BASS GUITARS ────────────────────────────────────────────────────────
    { id: "fender-player-precision-bass", brand: "Fender", model: "Player Precision Bass", type: "bass", pickups: "P", aliases: ["p bass", "precision", "precision bass", "fender precision bass"] },
    { id: "fender-player-jazz-bass", brand: "Fender", model: "Player Jazz Bass", type: "bass", pickups: "JJ", aliases: ["jazz bass", "j bass", "fender jazz bass"] },
    { id: "music-man-stingray", brand: "Music Man", model: "StingRay", type: "bass", pickups: "H", aliases: ["stingray"] },
    { id: "ibanez-sr300e", brand: "Ibanez", model: "SR300E", type: "bass", pickups: "HH", aliases: ["sr300"] },
    { id: "yamaha-trbx304", brand: "Yamaha", model: "TRBX304", type: "bass", pickups: "HH" },
    { id: "squier-affinity-jazz-bass", brand: "Squier", model: "Affinity Jazz Bass", type: "bass", pickups: "JJ" },

    // ── GUITAR AMPS ─────────────────────────────────────────────────────────
    // Control lists below are the literal front panel. A missing control is a
    // real absence, and the tone engine is told not to invent one.
    {
        id: "fender-blues-junior-iv", brand: "Fender", model: "Blues Junior IV", type: "amp", category: "Tube combo",
        controls: ["Volume", "Treble", "Bass", "Middle", "Master", "Reverb", "FAT switch"],
        aliases: ["blues jr", "blues junior"],
        note: "A 15 watt tube combo with no gain knob: drive comes from pushing Volume, and there is no presence control at all.",
    },
    {
        id: "fender-hot-rod-deluxe-iv", brand: "Fender", model: "Hot Rod Deluxe IV", type: "amp", category: "Tube combo",
        controls: ["Drive", "More Drive", "Volume", "Treble", "Bass", "Middle", "Master", "Presence", "Reverb"],
        channels: ["Clean", "Drive", "More Drive"],
        aliases: ["hot rod deluxe", "hrd"],
    },
    {
        id: "fender-65-deluxe-reverb", brand: "Fender", model: "'65 Deluxe Reverb Reissue", type: "amp", category: "Tube combo",
        controls: ["Volume", "Treble", "Bass", "Reverb", "Speed", "Intensity", "Bright switch"],
        channels: ["Normal", "Vibrato"],
        aliases: ["deluxe reverb", "drri"],
        note: "No middle knob, no master and no presence. The tone stack is Treble and Bass only, and the mids sit where the circuit puts them.",
    },
    {
        id: "fender-65-princeton-reverb", brand: "Fender", model: "'65 Princeton Reverb Reissue", type: "amp", category: "Tube combo",
        controls: ["Volume", "Treble", "Bass", "Reverb", "Speed", "Intensity"],
        aliases: ["princeton reverb", "prri"],
        note: "Two tone controls and nothing else. Anything asking for mids, presence or a master volume does not apply to this amp.",
    },
    {
        id: "fender-champion-20", brand: "Fender", model: "Champion 20", type: "amp", category: "Modelling combo",
        controls: ["Gain", "Volume", "Treble", "Bass", "Voice selector", "FX selector", "FX level"],
        aliases: ["champion 20", "champion20"],
        note: "A practice modeller with a two-band stack: there is no dedicated mids control to set.",
    },
    {
        id: "fender-mustang-lt25", brand: "Fender", model: "Mustang LT25", type: "amp", category: "Modelling combo",
        aliases: ["mustang lt25", "lt 25"],
    },
    {
        id: "marshall-dsl40cr", brand: "Marshall", model: "DSL40CR", type: "amp", category: "Tube combo",
        controls: ["Gain", "Volume", "Treble", "Middle", "Bass", "Presence", "Resonance", "Reverb", "Master", "Tone Shift", "Deep switch"],
        channels: ["Classic Gain", "Ultra Gain"],
        aliases: ["dsl40", "dsl 40"],
    },
    {
        id: "marshall-dsl20cr", brand: "Marshall", model: "DSL20CR", type: "amp", category: "Tube combo",
        controls: ["Gain", "Volume", "Treble", "Middle", "Bass", "Presence", "Resonance", "Reverb", "Master"],
        channels: ["Classic Gain", "Ultra Gain"],
        aliases: ["dsl20"],
    },
    {
        id: "marshall-jcm800-2203", brand: "Marshall", model: "JCM800 2203", type: "amp", category: "Tube head",
        controls: ["Preamp Volume", "Master Volume", "Bass", "Middle", "Treble", "Presence"],
        aliases: ["jcm800", "jcm 800", "2203"],
        note: "One channel, no reverb and no effects loop on the original. Gain is the Preamp Volume control.",
    },
    {
        id: "marshall-jvm410h", brand: "Marshall", model: "JVM410H", type: "amp", category: "Tube head",
        controls: ["Gain", "Bass", "Middle", "Treble", "Volume", "Presence", "Resonance", "Reverb", "Master 1", "Master 2"],
        channels: ["Clean", "Crunch", "OD1", "OD2"],
        voicings: ["Green", "Orange", "Red"],
        aliases: ["jvm410", "jvm"],
    },
    {
        id: "marshall-origin-20c", brand: "Marshall", model: "Origin 20C", type: "amp", category: "Tube combo",
        controls: ["Gain", "Bass", "Middle", "Treble", "Tilt", "Presence", "Master", "Powerstem"],
        aliases: ["origin 20", "origin20"],
        note: "The Tilt control blends the two inputs, which is where the brightness lives on this amp.",
    },
    {
        id: "marshall-mg30gfx", brand: "Marshall", model: "MG30GFX", type: "amp", category: "Solid state combo",
        aliases: ["mg30"],
    },
    {
        id: "vox-ac15c1", brand: "Vox", model: "AC15C1", type: "amp", category: "Tube combo",
        controls: ["Normal Volume", "Top Boost Treble", "Top Boost Bass", "Top Boost Volume", "Tone Cut", "Master", "Reverb", "Tremolo Speed", "Tremolo Depth"],
        channels: ["Normal", "Top Boost"],
        aliases: ["ac15"],
        note: "No middle knob and no presence. Tone Cut works backwards from a presence control: turning it up removes top end.",
    },
    {
        id: "vox-ac30c2", brand: "Vox", model: "AC30C2", type: "amp", category: "Tube combo",
        controls: ["Normal Volume", "Top Boost Treble", "Top Boost Bass", "Top Boost Volume", "Tone Cut", "Master", "Reverb", "Tremolo Speed", "Tremolo Depth"],
        channels: ["Normal", "Top Boost"],
        aliases: ["ac30"],
    },
    {
        id: "boss-katana-50-mkii", brand: "Boss", model: "Katana 50 MkII", type: "amp", category: "Modelling combo",
        controls: ["Gain", "Volume", "Bass", "Middle", "Treble", "Presence", "Master", "Booster", "Mod", "FX", "Delay/Reverb"],
        voicings: ["Acoustic", "Clean", "Crunch", "Lead", "Brown"],
        aliases: ["katana 50", "katana"],
        note: "The amp voicing selector changes the gain structure more than any knob does, so it belongs in any setting written for this amp.",
    },
    {
        id: "boss-katana-100-mkii", brand: "Boss", model: "Katana 100 MkII", type: "amp", category: "Modelling combo",
        controls: ["Gain", "Volume", "Bass", "Middle", "Treble", "Presence", "Master", "Booster", "Mod", "FX", "Delay/Reverb"],
        voicings: ["Acoustic", "Clean", "Crunch", "Lead", "Brown"],
        aliases: ["katana 100"],
    },
    {
        id: "orange-crush-35rt", brand: "Orange", model: "Crush 35RT", type: "amp", category: "Solid state combo",
        controls: ["Gain", "Bass", "Middle", "Treble", "Volume", "Reverb"],
        channels: ["Clean", "Dirty"],
        aliases: ["crush 35"],
    },
    {
        id: "orange-rocker-15", brand: "Orange", model: "Rocker 15", type: "amp", category: "Tube combo",
        channels: ["Natural", "Dirty"],
        aliases: ["rocker 15"],
    },
    {
        id: "peavey-6505-plus", brand: "Peavey", model: "6505+", type: "amp", category: "Tube head",
        controls: ["Pre Gain", "Low", "Mid", "High", "Post Gain", "Presence", "Resonance", "Crunch switch"],
        channels: ["Rhythm", "Lead"],
        aliases: ["6505", "5150"],
        note: "The EQ is labelled Low, Mid and High rather than Bass, Middle and Treble, and Resonance controls the low end of the power section.",
    },
    {
        id: "mesa-boogie-dual-rectifier", brand: "Mesa/Boogie", model: "Dual Rectifier", type: "amp", category: "Tube head",
        controls: ["Gain", "Bass", "Middle", "Treble", "Presence", "Master", "Output"],
        channels: ["Clean", "Vintage", "Modern"],
        aliases: ["dual rec", "rectifier", "mesa rectifier"],
    },
    {
        id: "mesa-boogie-mark-v-25", brand: "Mesa/Boogie", model: "Mark V:25", type: "amp", category: "Tube head",
        channels: ["Clean", "Crunch", "Mark IV", "Mark IIC+"],
        aliases: ["mark v 25", "mark v:25"],
    },
    {
        id: "blackstar-ht-club-40", brand: "Blackstar", model: "HT Club 40 MkII", type: "amp", category: "Tube combo",
        controls: ["Gain", "Volume", "Bass", "Middle", "Treble", "ISF", "Reverb", "Master"],
        channels: ["Clean", "Overdrive"],
        aliases: ["ht club 40", "blackstar club 40"],
        note: "ISF sweeps the tone stack between an American and a British voicing, so it changes what every other EQ knob does.",
    },
    {
        id: "blackstar-id-core-20", brand: "Blackstar", model: "ID:Core 20 V4", type: "amp", category: "Modelling combo",
        controls: ["Gain", "Volume", "ISF", "Voice selector", "Effects"],
        aliases: ["id core", "idcore"],
    },
    {
        id: "roland-jc-40", brand: "Roland", model: "JC-40 Jazz Chorus", type: "amp", category: "Solid state combo",
        controls: ["Volume", "Treble", "Middle", "Bass", "Distortion", "Reverb", "Chorus Rate", "Chorus Depth"],
        aliases: ["jc40", "jazz chorus"],
        note: "Built around its clean channel and stereo chorus. There is no presence control and no master volume.",
    },
    {
        id: "roland-jc-120", brand: "Roland", model: "JC-120 Jazz Chorus", type: "amp", category: "Solid state combo",
        controls: ["Volume", "Treble", "Middle", "Bass", "Distortion", "Reverb", "Chorus Rate", "Chorus Depth"],
        aliases: ["jc120"],
    },
    {
        id: "line-6-spider-v-30", brand: "Line 6", model: "Spider V 30 MkII", type: "amp", category: "Modelling combo",
        aliases: ["spider v"],
    },
    {
        id: "positive-grid-spark-40", brand: "Positive Grid", model: "Spark 40", type: "amp", category: "Modelling combo",
        controls: ["Gain", "Bass", "Mid", "Treble", "Master", "Mod", "Delay", "Reverb"],
        aliases: ["spark 40", "spark amp"],
    },
    {
        id: "supro-blues-king-12", brand: "Supro", model: "Blues King 12", type: "amp", category: "Tube combo",
        aliases: ["blues king"],
    },
    {
        id: "victory-v30-mkii", brand: "Victory", model: "V30 MkII The Countess", type: "amp", category: "Tube head",
        aliases: ["victory v30", "countess"],
    },
    {
        id: "revv-g20", brand: "Revv", model: "G20", type: "amp", category: "Tube head",
        aliases: ["revv g20"],
    },
    {
        id: "hughes-kettner-tubemeister-18", brand: "Hughes & Kettner", model: "TubeMeister 18", type: "amp", category: "Tube head",
        aliases: ["tubemeister"],
    },

    // ── BASS AMPS ───────────────────────────────────────────────────────────
    {
        id: "fender-rumble-100", brand: "Fender", model: "Rumble 100", type: "bass-amp", category: "Bass combo",
        controls: ["Gain", "Bass", "Low Mid", "High Mid", "Treble", "Master", "Overdrive", "Bright switch", "Contour switch", "Vintage switch"],
        aliases: ["rumble 100"],
    },
    {
        id: "ampeg-ba-110", brand: "Ampeg", model: "BA-110 v2", type: "bass-amp", category: "Bass combo",
        aliases: ["ba110"],
    },
    {
        id: "ampeg-svt-classic", brand: "Ampeg", model: "SVT Classic", type: "bass-amp", category: "Bass head",
        controls: ["Gain", "Bass", "Midrange", "Midrange frequency", "Treble", "Master", "Ultra Lo switch", "Ultra Hi switch"],
        aliases: ["svt"],
    },
    {
        id: "hartke-hd75", brand: "Hartke", model: "HD75", type: "bass-amp", category: "Bass combo",
        aliases: ["hd75"],
    },

    // ── PEDALS ──────────────────────────────────────────────────────────────
    { id: "ibanez-ts9-tube-screamer", brand: "Ibanez", model: "TS9 Tube Screamer", type: "pedal", category: "Overdrive", controls: ["Drive", "Tone", "Level"], aliases: ["ts9", "tube screamer"], note: "A mid-hump overdrive used as much for tightening a distorted amp as for drive on its own." },
    { id: "ibanez-ts808-tube-screamer", brand: "Ibanez", model: "TS808 Tube Screamer", type: "pedal", category: "Overdrive", controls: ["Overdrive", "Tone", "Level"], aliases: ["ts808"] },
    { id: "boss-ds-1", brand: "Boss", model: "DS-1 Distortion", type: "pedal", category: "Distortion", controls: ["Tone", "Level", "Distortion"], aliases: ["ds1"] },
    { id: "boss-sd-1", brand: "Boss", model: "SD-1 Super Overdrive", type: "pedal", category: "Overdrive", controls: ["Level", "Tone", "Drive"], aliases: ["sd1"] },
    { id: "boss-bd-2", brand: "Boss", model: "BD-2 Blues Driver", type: "pedal", category: "Overdrive", controls: ["Level", "Tone", "Gain"], aliases: ["bd2", "blues driver"] },
    { id: "boss-mt-2", brand: "Boss", model: "MT-2 Metal Zone", type: "pedal", category: "Distortion", controls: ["Level", "High", "Low", "Mid", "Mid Freq", "Distortion"], aliases: ["mt2", "metal zone"] },
    { id: "boss-dd-8", brand: "Boss", model: "DD-8 Digital Delay", type: "pedal", category: "Delay", controls: ["E.Level", "Feedback", "Time", "Mode"], aliases: ["dd8"] },
    { id: "boss-rv-6", brand: "Boss", model: "RV-6 Reverb", type: "pedal", category: "Reverb", controls: ["E.Level", "Tone", "Time", "Mode"], aliases: ["rv6"] },
    { id: "boss-ce-2w", brand: "Boss", model: "CE-2W Chorus", type: "pedal", category: "Chorus", controls: ["Rate", "Depth", "Mode"], aliases: ["ce2", "ce-2"] },
    { id: "boss-blues-cube", brand: "Boss", model: "CS-3 Compression Sustainer", type: "pedal", category: "Compressor", controls: ["Level", "Tone", "Attack", "Sustain"], aliases: ["cs3", "cs-3"] },
    { id: "proco-rat-2", brand: "Pro Co", model: "RAT 2", type: "pedal", category: "Distortion", controls: ["Distortion", "Filter", "Volume"], aliases: ["rat", "rat2"], note: "The Filter knob works backwards from a tone control: turning it up cuts treble." },
    { id: "electro-harmonix-big-muff-pi", brand: "Electro-Harmonix", model: "Big Muff Pi", type: "pedal", category: "Fuzz", controls: ["Volume", "Tone", "Sustain"], aliases: ["big muff", "muff"] },
    { id: "electro-harmonix-small-clone", brand: "Electro-Harmonix", model: "Small Clone", type: "pedal", category: "Chorus", controls: ["Rate", "Depth switch"], aliases: ["small clone"] },
    { id: "electro-harmonix-holy-grail", brand: "Electro-Harmonix", model: "Holy Grail", type: "pedal", category: "Reverb", controls: ["Reverb", "Mode"], aliases: ["holy grail"] },
    { id: "mxr-phase-90", brand: "MXR", model: "Phase 90", type: "pedal", category: "Phaser", controls: ["Speed"], aliases: ["phase 90", "phase90"] },
    { id: "mxr-carbon-copy", brand: "MXR", model: "Carbon Copy Analog Delay", type: "pedal", category: "Delay", controls: ["Regen", "Mix", "Delay", "Mod switch"], aliases: ["carbon copy"] },
    { id: "mxr-dyna-comp", brand: "MXR", model: "Dyna Comp", type: "pedal", category: "Compressor", controls: ["Output", "Sensitivity"], aliases: ["dyna comp"] },
    { id: "dunlop-cry-baby", brand: "Dunlop", model: "Cry Baby GCB95", type: "pedal", category: "Wah", aliases: ["cry baby", "crybaby", "wah"] },
    { id: "fulltone-ocd", brand: "Fulltone", model: "OCD", type: "pedal", category: "Overdrive", controls: ["Volume", "Tone", "Drive", "HP/LP switch"], aliases: ["ocd"] },
    { id: "klon-ktr", brand: "Klon", model: "KTR", type: "pedal", category: "Overdrive", controls: ["Gain", "Treble", "Output"], aliases: ["klon", "centaur", "klon centaur"] },
    { id: "wampler-tumnus", brand: "Wampler", model: "Tumnus", type: "pedal", category: "Overdrive", controls: ["Level", "Tone", "Gain"], aliases: ["tumnus"] },
    { id: "jhs-morning-glory", brand: "JHS", model: "Morning Glory V4", type: "pedal", category: "Overdrive", controls: ["Volume", "Tone", "Drive", "Bright switch"], aliases: ["morning glory"] },
    { id: "tc-electronic-hall-of-fame-2", brand: "TC Electronic", model: "Hall of Fame 2", type: "pedal", category: "Reverb", controls: ["Decay", "Tone", "Level", "Mode"], aliases: ["hall of fame", "hof"] },
    { id: "tc-electronic-flashback-2", brand: "TC Electronic", model: "Flashback 2", type: "pedal", category: "Delay", controls: ["Delay", "Feedback", "Level", "Mode"], aliases: ["flashback"] },
    { id: "strymon-timeline", brand: "Strymon", model: "TimeLine", type: "pedal", category: "Delay", aliases: ["timeline"] },
    { id: "strymon-bigsky", brand: "Strymon", model: "BigSky", type: "pedal", category: "Reverb", aliases: ["bigsky", "big sky"] },
    { id: "xotic-ep-booster", brand: "Xotic", model: "EP Booster", type: "pedal", category: "Boost", aliases: ["ep booster"] },
    { id: "way-huge-green-rhino", brand: "Way Huge", model: "Green Rhino", type: "pedal", category: "Overdrive", controls: ["Volume", "Tone", "Drive", "Curve", "100Hz"], aliases: ["green rhino"] },
    { id: "digitech-whammy", brand: "DigiTech", model: "Whammy 5", type: "pedal", category: "Pitch", aliases: ["whammy"] },
    { id: "dunlop-fuzz-face-mini", brand: "Dunlop", model: "Fuzz Face Mini", type: "pedal", category: "Fuzz", controls: ["Volume", "Fuzz"], aliases: ["fuzz face"] },
    { id: "boss-oc-5", brand: "Boss", model: "OC-5 Octave", type: "pedal", category: "Octave", controls: ["Direct", "-1 Oct", "-2 Oct", "Range"], aliases: ["oc5"] },

    // ── MULTI-FX AND MODELLERS ──────────────────────────────────────────────
    { id: "line-6-helix", brand: "Line 6", model: "Helix", type: "multifx", category: "Floor modeller", aliases: ["helix floor", "helix lt"], note: "Blocks are built into a signal chain per preset, so settings are given as block parameters rather than pedal knobs." },
    { id: "line-6-hx-stomp", brand: "Line 6", model: "HX Stomp", type: "multifx", category: "Compact modeller", aliases: ["hx stomp", "hxstomp"] },
    { id: "line-6-pod-go", brand: "Line 6", model: "POD Go", type: "multifx", category: "Floor modeller", aliases: ["pod go", "podgo"] },
    { id: "neural-dsp-quad-cortex", brand: "Neural DSP", model: "Quad Cortex", type: "multifx", category: "Floor modeller", aliases: ["quad cortex", "qc"] },
    { id: "kemper-profiler", brand: "Kemper", model: "Profiler", type: "multifx", category: "Profiling amp", aliases: ["kemper", "profiler"] },
    { id: "fractal-axe-fx-iii", brand: "Fractal Audio", model: "Axe-Fx III", type: "multifx", category: "Rack modeller", aliases: ["axe fx", "axefx"] },
    { id: "fractal-fm9", brand: "Fractal Audio", model: "FM9", type: "multifx", category: "Floor modeller", aliases: ["fm9"] },
    { id: "fractal-fm3", brand: "Fractal Audio", model: "FM3", type: "multifx", category: "Floor modeller", aliases: ["fm3"] },
    { id: "boss-gt-1000core", brand: "Boss", model: "GT-1000CORE", type: "multifx", category: "Compact modeller", aliases: ["gt1000core", "gt-1000"] },
    { id: "boss-me-80", brand: "Boss", model: "ME-80", type: "multifx", category: "Floor multi-FX", aliases: ["me80"] },
    { id: "headrush-mx5", brand: "HeadRush", model: "MX5", type: "multifx", category: "Compact modeller", aliases: ["mx5"] },
    { id: "mooer-ge300", brand: "Mooer", model: "GE300", type: "multifx", category: "Floor modeller", aliases: ["ge300"] },
    { id: "valeton-gp-200", brand: "Valeton", model: "GP-200", type: "multifx", category: "Floor modeller", aliases: ["gp200"] },
    { id: "zoom-g6", brand: "Zoom", model: "G6", type: "multifx", category: "Floor modeller", aliases: ["zoom g6"] },
    { id: "ik-multimedia-tonex-pedal", brand: "IK Multimedia", model: "TONEX Pedal", type: "multifx", category: "Modelling pedal", aliases: ["tonex"] },
    { id: "nux-mg-30", brand: "NUX", model: "MG-30", type: "multifx", category: "Floor modeller", aliases: ["mg30", "mg-30"] },
];

/**
 * The list above, with the researched specifications in lib/gear-specs.ts
 * merged onto each row by id.
 *
 * Kept as a merge rather than typed into the list because the two are
 * maintained differently: the list is what Tonelify recognises, the specs are
 * reference data gathered per model from manufacturer sheets. Anything already
 * written on an entry wins, so a hand-checked value is never overwritten by
 * the sheet.
 */
export const GEAR_CATALOG: GearEntry[] = BASE_CATALOG.map((entry) => {
    const specs = GEAR_SPECS[entry.id];
    return specs ? { ...specs, ...entry } : entry;
});

// ── LOOKUP ──────────────────────────────────────────────────────────────────

function normalize(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

const BY_ID = new Map(GEAR_CATALOG.map((g) => [g.id, g]));

/** Every string a given entry can be recognized by, normalized once at load. */
const SEARCH_INDEX: { entry: GearEntry; terms: string[] }[] = GEAR_CATALOG.map((entry) => ({
    entry,
    terms: [
        `${entry.brand} ${entry.model}`,
        entry.model,
        ...(entry.aliases ?? []),
    ].map(normalize),
}));

/**
 * Brand names on their own. "Fender" is not an amp, and resolving it to one
 * would hand the model a specific front panel for a player who has not said
 * which Fender they own, which is worse than knowing nothing.
 */
const BRAND_ONLY = new Set(GEAR_CATALOG.map((g) => normalize(g.brand)));

export function getGearById(id: string): GearEntry | undefined {
    return BY_ID.get(id);
}

export function gearLabel(entry: GearEntry): string {
    return `${entry.brand} ${entry.model}`;
}

/**
 * Best single match for whatever the player typed.
 *
 * Exact match first, then "the typed text contains a known name", which is
 * what catches real input like "my old marshall jcm800 head".
 *
 * Deliberately no prefix matching, unlike searchGear. This result is fed to the
 * tone engine as fact, so a half-typed or ambiguous string must resolve to
 * nothing rather than to a guess. Returning no facts costs a little accuracy;
 * returning the wrong amp's control panel costs the user's trust.
 */
export function findGear(query: string, types?: GearType[]): GearEntry | undefined {
    const q = normalize(query);
    if (q.length < 3 || BRAND_ONLY.has(q)) return undefined;

    const pool = types
        ? SEARCH_INDEX.filter((row) => types.includes(row.entry.type))
        : SEARCH_INDEX;

    for (const row of pool) {
        if (row.terms.some((t) => t === q)) return row.entry;
    }

    // Longest match wins, so "squier classic vibe stratocaster" resolves to the
    // Squier rather than to the generic "stratocaster" alias
    let best: { entry: GearEntry; length: number } | undefined;
    for (const row of pool) {
        for (const term of row.terms) {
            if (term.length < 4) continue;
            if (q.includes(term) && (!best || term.length > best.length)) {
                best = { entry: row.entry, length: term.length };
            }
        }
    }
    return best?.entry;
}

/** Ranked suggestions for the combobox. Empty query returns nothing. */
export function searchGear(query: string, types?: GearType[], limit = 8): GearEntry[] {
    const q = normalize(query);
    if (!q) return [];

    const pool = types
        ? SEARCH_INDEX.filter((row) => types.includes(row.entry.type))
        : SEARCH_INDEX;

    const scored: { entry: GearEntry; score: number }[] = [];
    for (const row of pool) {
        let score = 0;
        for (const term of row.terms) {
            if (term === q) score = Math.max(score, 100);
            else if (term.startsWith(q)) score = Math.max(score, 70);
            else if (term.includes(q)) score = Math.max(score, 40);
        }
        if (score > 0) scored.push({ entry: row.entry, score });
    }

    return scored
        .sort((a, b) => b.score - a.score || gearLabel(a.entry).localeCompare(gearLabel(b.entry)))
        .slice(0, limit)
        .map((s) => s.entry);
}

/**
 * The facts worth sending to the tone engine. Returns null for entries with no
 * documented panel, because "no information" and "this amp has no presence
 * knob" must not look the same to the model.
 */
export function gearPromptFacts(entry: GearEntry): string | null {
    const parts: string[] = [];
    if (entry.pickups) parts.push(`pickup layout ${entry.pickups}`);
    // Headroom and scale length both change the numbers rather than just
    // describing the gear: a 15W combo breaks up where a 100W head stays clean,
    // and a short scale reaches saturation at a lower gain setting.
    if (entry.power) parts.push(`rated output ${entry.power}`);
    if (entry.speaker) parts.push(`speaker ${entry.speaker}`);
    if (entry.scale) parts.push(`scale length ${entry.scale}`);
    if (entry.channels?.length) parts.push(`selectable channels: ${entry.channels.join(", ")}`);
    if (entry.voicings?.length) parts.push(`selectable voicings: ${entry.voicings.join(", ")}`);
    if (entry.controls?.length) {
        parts.push(
            `its front panel has exactly these controls and no others: ${entry.controls.join(", ")}`
        );
    }
    if (parts.length === 0) return null;
    return `${gearLabel(entry)} (${entry.category ?? entry.type}): ${parts.join("; ")}.`;
}

export const GEAR_TYPE_LABELS: Record<GearType, string> = {
    guitar: "Electric guitar",
    bass: "Bass guitar",
    amp: "Guitar amp",
    "bass-amp": "Bass amp",
    pedal: "Pedal",
    multifx: "Multi-FX and modellers",
};
