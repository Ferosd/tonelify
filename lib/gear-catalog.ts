// Multi FX Units Database
// Comprehensive catalog of popular multi-effects processors

export type MultiFxType = "effects_only" | "amp_modeler" | "amp_effects"

export interface MultiFxUnit {
    id: string
    name: string
    brand: string
    type: MultiFxType
    features: string[]
    priceRange: string
    amps?: string
    ampsCount?: number
}

export interface Pedal {
    id: string
    name: string
    brand: string
    category: PedalCategory
    priceRange: string
    description?: string
}

export type PedalCategory = "overdrive" | "distortion" | "fuzz" | "delay" | "reverb" | "chorus" | "phaser" | "flanger" | "compressor" | "wah" | "tremolo" | "eq" | "boost" | "looper" | "tuner" | "noise_gate" | "octave" | "harmonizer" | "multi"

// ───────────── MULTI FX DATABASE ─────────────

export const MULTI_FX_UNITS: MultiFxUnit[] = [
    // Boss
    { id: "boss-gp10", name: "GP-10", brand: "Boss", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$350-500", amps: "JC-120, Clean Twin, Tweed", ampsCount: 12 },
    { id: "boss-gt1", name: "GT-1", brand: "Boss", type: "effects_only", features: [], priceRange: "$200-250" },
    { id: "boss-gt1000", name: "GT-1000", brand: "Boss", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$800-1000", amps: "Natural, Boutique, Supreme", ampsCount: 25 },
    { id: "boss-gx100", name: "GX-100", brand: "Boss", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$550-650", amps: "JC-120, Twin Combo, Deluxe Combo", ampsCount: 14 },
    { id: "boss-me80", name: "ME-80", brand: "Boss", type: "effects_only", features: [], priceRange: "$300-400" },
    { id: "boss-me90", name: "ME-90", brand: "Boss", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$400-500", amps: "JC-120, Crunch, Metal", ampsCount: 8 },
    { id: "boss-katana-100", name: "Katana-100 MKII", brand: "Boss", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$350-400", amps: "Clean, Crunch, Lead, Brown", ampsCount: 5 },

    // Line 6
    { id: "line6-helix", name: "Helix", brand: "Line 6", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1500-1700", amps: "US Double Nrm, Brit Plexi, Revv Gen", ampsCount: 82 },
    { id: "line6-helix-lt", name: "Helix LT", brand: "Line 6", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1000-1200", amps: "US Double Nrm, Brit Plexi, Revv Gen", ampsCount: 82 },
    { id: "line6-hx-stomp", name: "HX Stomp", brand: "Line 6", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$600-700", amps: "US Double Nrm, Brit Plexi", ampsCount: 82 },
    { id: "line6-hx-stomp-xl", name: "HX Stomp XL", brand: "Line 6", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$800-900", amps: "US Double Nrm, Brit Plexi", ampsCount: 82 },
    { id: "line6-hx-effects", name: "HX Effects", brand: "Line 6", type: "effects_only", features: [], priceRange: "$500-600" },
    { id: "line6-pod-go", name: "POD Go", brand: "Line 6", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$450-550", amps: "US Double, Brit Plexi", ampsCount: 32 },
    { id: "line6-spider-v", name: "Spider V 60 MKII", brand: "Line 6", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$250-300", amps: "Clean, Crunch, Insane", ampsCount: 16 },

    // Fractal Audio
    { id: "fractal-axefx3", name: "Axe-Fx III", brand: "Fractal Audio", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$2500-2800", amps: "Friedman, Mesa, Marshall, Fender", ampsCount: 250 },
    { id: "fractal-fm3", name: "FM3", brand: "Fractal Audio", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1200-1400", amps: "Friedman, Mesa, Marshall", ampsCount: 250 },
    { id: "fractal-fm9", name: "FM9", brand: "Fractal Audio", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1800-2000", amps: "Friedman, Mesa, Marshall, Fender", ampsCount: 250 },

    // Neural DSP
    { id: "neural-quad-cortex", name: "Quad Cortex", brand: "Neural DSP", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1600-1800", amps: "Tone Capture, Virtual Amps", ampsCount: 50 },

    // Kemper
    { id: "kemper-profiler", name: "Profiler Stage", brand: "Kemper", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1800-2000", amps: "Profiled Amps (unlimited)", ampsCount: 999 },
    { id: "kemper-player", name: "Kemper Player", brand: "Kemper", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$700-800", amps: "Profiled Amps", ampsCount: 999 },

    // Headrush
    { id: "headrush-pedalboard", name: "Pedalboard", brand: "Headrush", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$800-1000", amps: "Eleven HD Models", ampsCount: 46 },
    { id: "headrush-mx5", name: "MX5", brand: "Headrush", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$350-450", amps: "Eleven HD Models", ampsCount: 46 },
    { id: "headrush-prime", name: "Prime", brand: "Headrush", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$1200-1400", amps: "Eleven HD Models", ampsCount: 63 },

    // Zoom
    { id: "zoom-ms70cdr", name: "MS-70CDR", brand: "Zoom", type: "effects_only", features: [], priceRange: "$100-130" },
    { id: "zoom-g5n", name: "G5n", brand: "Zoom", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$200-300", amps: "Clean, Crunch, Hi-Gain", ampsCount: 22 },
    { id: "zoom-g11", name: "G11", brand: "Zoom", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$500-600", amps: "Clean, Crunch, Hi-Gain", ampsCount: 22 },
    { id: "zoom-g6", name: "G6", brand: "Zoom", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$300-400", amps: "Clean, Crunch, Hi-Gain", ampsCount: 22 },

    // Mooer
    { id: "mooer-ge300", name: "GE300", brand: "Mooer", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$500-600", amps: "Tone Capture, Preamp Models", ampsCount: 108 },
    { id: "mooer-ge200", name: "GE200", brand: "Mooer", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$250-350", amps: "Preamp Models", ampsCount: 55 },

    // NUX
    { id: "nux-mg30", name: "MG-30", brand: "NUX", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$250-300", amps: "Amp Models", ampsCount: 36 },
    { id: "nux-mg300", name: "MG-300", brand: "NUX", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$150-200", amps: "Amp Models", ampsCount: 16 },

    // Hotone
    { id: "hotone-ampero", name: "Ampero", brand: "Hotone", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$250-350", amps: "Amp Models", ampsCount: 64 },
    { id: "hotone-ampero2", name: "Ampero II Stomp", brand: "Hotone", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$300-400", amps: "Amp Models", ampsCount: 64 },

    // Valeton
    { id: "valeton-gp200", name: "GP-200", brand: "Valeton", type: "amp_modeler", features: ["Amp Modeling"], priceRange: "$200-280", amps: "Amp Models", ampsCount: 50 },

    // Digitech
    { id: "digitech-rp500", name: "RP500", brand: "DigiTech", type: "amp_effects", features: ["Amp Modeling"], priceRange: "$200-300", amps: "Amp Models", ampsCount: 22 },
]

// ───────────── PEDALS DATABASE ─────────────

export const PEDALS: Pedal[] = [
    // Overdrive
    { id: "ts9", name: "TS-9 Tube Screamer", brand: "Ibanez", category: "overdrive", priceRange: "$80-100" },
    { id: "ts808", name: "TS808 Tube Screamer", brand: "Ibanez", category: "overdrive", priceRange: "$150-180" },
    { id: "boss-od3", name: "OD-3 OverDrive", brand: "Boss", category: "overdrive", priceRange: "$60-80" },
    { id: "boss-sd1", name: "SD-1 Super OverDrive", brand: "Boss", category: "overdrive", priceRange: "$50-60" },
    { id: "boss-bd2", name: "BD-2 Blues Driver", brand: "Boss", category: "overdrive", priceRange: "$70-90" },
    { id: "fulltone-ocd", name: "OCD", brand: "Fulltone", category: "overdrive", priceRange: "$100-140" },
    { id: "klon-centaur", name: "Centaur (KTR)", brand: "Klon", category: "overdrive", priceRange: "$200-300" },
    { id: "jhs-morning-glory", name: "Morning Glory V4", brand: "JHS", category: "overdrive", priceRange: "$180-220" },
    { id: "ehx-soul-food", name: "Soul Food", brand: "Electro-Harmonix", category: "overdrive", priceRange: "$50-70" },

    // Distortion
    { id: "boss-ds1", name: "DS-1 Distortion", brand: "Boss", category: "distortion", priceRange: "$40-60" },
    { id: "boss-ds2", name: "DS-2 Turbo Distortion", brand: "Boss", category: "distortion", priceRange: "$60-80" },
    { id: "boss-mt2", name: "MT-2 Metal Zone", brand: "Boss", category: "distortion", priceRange: "$60-80" },
    { id: "proco-rat", name: "RAT 2", brand: "ProCo", category: "distortion", priceRange: "$70-90" },
    { id: "mxr-distortion-plus", name: "Distortion+", brand: "MXR", category: "distortion", priceRange: "$70-90" },
    { id: "friedman-be-od", name: "BE-OD", brand: "Friedman", category: "distortion", priceRange: "$150-180" },
    { id: "revv-g3", name: "G3 Distortion", brand: "Revv", category: "distortion", priceRange: "$180-220" },

    // Fuzz
    { id: "ehx-big-muff", name: "Big Muff Pi", brand: "Electro-Harmonix", category: "fuzz", priceRange: "$60-80" },
    { id: "dunlop-fuzz-face", name: "Fuzz Face Mini", brand: "Dunlop", category: "fuzz", priceRange: "$80-100" },
    { id: "zvex-fuzz-factory", name: "Fuzz Factory", brand: "Z.Vex", category: "fuzz", priceRange: "$180-220" },

    // Delay
    { id: "boss-dd8", name: "DD-8 Digital Delay", brand: "Boss", category: "delay", priceRange: "$130-150" },
    { id: "boss-dd3t", name: "DD-3T Digital Delay", brand: "Boss", category: "delay", priceRange: "$100-120" },
    { id: "tc-flashback", name: "Flashback 2", brand: "TC Electronic", category: "delay", priceRange: "$130-150" },
    { id: "mxr-carbon-copy", name: "Carbon Copy", brand: "MXR", category: "delay", priceRange: "$120-150" },
    { id: "strymon-timeline", name: "TimeLine", brand: "Strymon", category: "delay", priceRange: "$400-450" },
    { id: "strymon-el-capistan", name: "El Capistan", brand: "Strymon", category: "delay", priceRange: "$300-350" },
    { id: "ehx-canyon", name: "Canyon", brand: "Electro-Harmonix", category: "delay", priceRange: "$120-140" },

    // Reverb
    { id: "boss-rv6", name: "RV-6 Reverb", brand: "Boss", category: "reverb", priceRange: "$120-140" },
    { id: "tc-hall-of-fame", name: "Hall of Fame 2", brand: "TC Electronic", category: "reverb", priceRange: "$130-150" },
    { id: "strymon-bigsky", name: "BigSky", brand: "Strymon", category: "reverb", priceRange: "$400-480" },
    { id: "ehx-holy-grail", name: "Holy Grail Neo", brand: "Electro-Harmonix", category: "reverb", priceRange: "$100-130" },
    { id: "walrus-slo", name: "Slö", brand: "Walrus Audio", category: "reverb", priceRange: "$180-220" },

    // Chorus
    { id: "boss-ce2w", name: "CE-2W Chorus", brand: "Boss", category: "chorus", priceRange: "$150-180" },
    { id: "mxr-analog-chorus", name: "Analog Chorus", brand: "MXR", category: "chorus", priceRange: "$80-100" },
    { id: "tc-corona", name: "Corona Chorus", brand: "TC Electronic", category: "chorus", priceRange: "$100-120" },
    { id: "ehx-small-clone", name: "Small Clone", brand: "Electro-Harmonix", category: "chorus", priceRange: "$70-90" },

    // Compressor
    { id: "boss-cs3", name: "CS-3 Compression", brand: "Boss", category: "compressor", priceRange: "$60-80" },
    { id: "mxr-dyna-comp", name: "Dyna Comp", brand: "MXR", category: "compressor", priceRange: "$70-90" },
    { id: "keeley-comp-plus", name: "Compressor Plus", brand: "Keeley", category: "compressor", priceRange: "$130-150" },

    // Wah
    { id: "dunlop-cry-baby", name: "Cry Baby GCB95", brand: "Dunlop", category: "wah", priceRange: "$70-90" },
    { id: "dunlop-535q", name: "535Q Multi-Wah", brand: "Dunlop", category: "wah", priceRange: "$120-150" },
    { id: "morley-bad-horsie", name: "Bad Horsie 2", brand: "Morley", category: "wah", priceRange: "$100-130" },

    // Phaser
    { id: "mxr-phase90", name: "Phase 90", brand: "MXR", category: "phaser", priceRange: "$70-90" },
    { id: "boss-ph3", name: "PH-3 Phase Shifter", brand: "Boss", category: "phaser", priceRange: "$80-100" },
    { id: "ehx-small-stone", name: "Small Stone Nano", brand: "Electro-Harmonix", category: "phaser", priceRange: "$60-80" },

    // Boost
    { id: "mxr-micro-amp", name: "Micro Amp+", brand: "MXR", category: "boost", priceRange: "$80-100" },
    { id: "tc-spark", name: "Spark Mini Booster", brand: "TC Electronic", category: "boost", priceRange: "$50-60" },
    { id: "xotic-ep-booster", name: "EP Booster", brand: "Xotic", category: "boost", priceRange: "$100-130" },

    // Noise Gate
    { id: "boss-ns2", name: "NS-2 Noise Suppressor", brand: "Boss", category: "noise_gate", priceRange: "$80-100" },
    { id: "isp-decimator", name: "Decimator II", brand: "ISP", category: "noise_gate", priceRange: "$120-150" },

    // EQ
    { id: "boss-ge7", name: "GE-7 Graphic EQ", brand: "Boss", category: "eq", priceRange: "$80-100" },
    { id: "mxr-10band-eq", name: "10 Band EQ", brand: "MXR", category: "eq", priceRange: "$100-130" },

    // Looper
    { id: "boss-rc1", name: "RC-1 Loop Station", brand: "Boss", category: "looper", priceRange: "$90-110" },
    { id: "boss-rc5", name: "RC-5 Loop Station", brand: "Boss", category: "looper", priceRange: "$170-200" },
    { id: "tc-ditto", name: "Ditto Looper", brand: "TC Electronic", category: "looper", priceRange: "$90-110" },

    // Tuner
    { id: "boss-tu3", name: "TU-3 Chromatic Tuner", brand: "Boss", category: "tuner", priceRange: "$80-100" },
    { id: "tc-polytune", name: "PolyTune 3", brand: "TC Electronic", category: "tuner", priceRange: "$90-110" },
]

// ───────────── HELPER FUNCTIONS ─────────────

export const MULTI_FX_TYPE_LABELS: Record<MultiFxType, string> = {
    effects_only: "Effects Only",
    amp_modeler: "Amp Modeler",
    amp_effects: "Amp + Effects",
}

export const MULTI_FX_TYPE_COLORS: Record<MultiFxType, { bg: string; text: string }> = {
    effects_only: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    amp_modeler: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
    amp_effects: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
}

export const PEDAL_CATEGORY_LABELS: Record<PedalCategory, string> = {
    overdrive: "Overdrive",
    distortion: "Distortion",
    fuzz: "Fuzz",
    delay: "Delay",
    reverb: "Reverb",
    chorus: "Chorus",
    phaser: "Phaser",
    flanger: "Flanger",
    compressor: "Compressor",
    wah: "Wah",
    tremolo: "Tremolo",
    eq: "EQ",
    boost: "Boost",
    looper: "Looper",
    tuner: "Tuner",
    noise_gate: "Noise Gate",
    octave: "Octave",
    harmonizer: "Harmonizer",
    multi: "Multi",
}
