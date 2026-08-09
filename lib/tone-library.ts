// Curated library of iconic tones surfaced on /explore.
// `character` is a one-line description of what defines the tone.
// `originalGear` is the widely documented rig behind the recording (phrased
// as "reportedly" on tone pages, it powers the SEO detail pages).

export type LibraryTone = {
    id: string
    title: string
    artist: string
    genre: string
    era: string
    tone: "Clean" | "Distorted"
    part: "Riff" | "Solo"
    character: string
    originalGear: string
}

// Real edit date for the library copy, bumped by hand when entries change.
// Used for Article dateModified and the visible "reviewed" line, so freshness
// reflects actual edits instead of regenerating to "today" on every rebuild.
export const LIBRARY_UPDATED = "2026-07-26";

export const TONE_LIBRARY: LibraryTone[] = [
    { id: "master-of-puppets", title: "Master of Puppets", artist: "Metallica", genre: "Thrash Metal", era: "1980s", tone: "Distorted", part: "Riff", character: "Scooped mids, razor-tight palm-muted chug", originalGear: "ESP Explorer-style guitars into a Mesa/Boogie Mark IIC+, the definitive scooped thrash stack" },
    { id: "november-rain", title: "November Rain", artist: "Guns N' Roses", genre: "Hard Rock", era: "1990s", tone: "Distorted", part: "Solo", character: "Singing neck-pickup lead with silky sustain", originalGear: "Kris Derrig '59 Les Paul replica into a Marshall Silver Jubilee 2555 head" },
    { id: "comfortably-numb", title: "Comfortably Numb", artist: "Pink Floyd", genre: "Prog Rock", era: "1970s", tone: "Distorted", part: "Solo", character: "Creamy fuzz-driven sustain, huge ambience", originalGear: "Fender Stratocaster with a Big Muff and Electric Mistress into Hiwatt heads" },
    { id: "sultans-of-swing", title: "Sultans of Swing", artist: "Dire Straits", genre: "Rock", era: "1970s", tone: "Clean", part: "Solo", character: "Glassy in-between Strat quack, fingerstyle snap", originalGear: "Fender Stratocaster in the in-between pickup position into a clean Fender-style combo" },
    { id: "my-own-summer", title: "My Own Summer (Shove It)", artist: "Deftones", genre: "Alt Metal", era: "1990s", tone: "Distorted", part: "Riff", character: "Thick detuned wall of grinding lows", originalGear: "ESP 7-string into high-gain Marshall rack gear, tuned way down" },
    { id: "welcome-to-the-jungle", title: "Welcome To The Jungle", artist: "Guns N' Roses", genre: "Hard Rock", era: "1980s", tone: "Distorted", part: "Riff", character: "Bright crunchy Marshall bite with delay stabs", originalGear: "Gibson Les Paul into a modded Marshall, Slash's signature crunch with delay accents" },
    { id: "floods", title: "Floods", artist: "Pantera", genre: "Groove Metal", era: "1990s", tone: "Distorted", part: "Solo", character: "Haunting solid-state lead over clean arpeggios", originalGear: "Washburn signature guitars into Randall solid-state heads with a digital delay in the loop" },
    { id: "cowboys-from-hell", title: "Cowboys from Hell", artist: "Pantera", genre: "Groove Metal", era: "1990s", tone: "Distorted", part: "Riff", character: "Scooped solid-state grind, surgical attack", originalGear: "Dean ML-style guitars into Randall RG solid-state heads with heavily scooped mids" },
    { id: "unholy-confessions", title: "Unholy Confessions", artist: "Avenged Sevenfold", genre: "Metalcore", era: "2000s", tone: "Distorted", part: "Riff", character: "Drop-D chug with modern high-gain saturation", originalGear: "Schecter guitars in Drop D into modded Marshall-style high-gain heads" },
    { id: "smells-like-teen-spirit", title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge", era: "1990s", tone: "Distorted", part: "Riff", character: "Raw fuzzy grunge power chords", originalGear: "Fender Mustang with a Boss DS-1 into a cranked amp, raw and unpolished on purpose" },
    { id: "under-the-bridge", title: "Under the Bridge", artist: "Red Hot Chili Peppers", genre: "Alt Rock", era: "1990s", tone: "Clean", part: "Riff", character: "Chimey clean arpeggios, warm compression", originalGear: "Fender Stratocaster into a barely-driven Marshall, chimey, dynamic cleans" },
    { id: "slow-dancing", title: "Slow Dancing in a Burning Room", artist: "John Mayer", genre: "Blues Rock", era: "2000s", tone: "Clean", part: "Solo", character: "Fat blues neck tone on the edge of breakup", originalGear: "Fender Stratocaster into Dumble-style amps riding the edge of breakup" },
    { id: "enter-sandman", title: "Enter Sandman", artist: "Metallica", genre: "Metal", era: "1990s", tone: "Distorted", part: "Riff", character: "Wah-cocked intro into massive rhythm crunch", originalGear: "ESP Explorer into Mesa/Boogie high-gain rigs, layered multiple times" },
    { id: "stairway-to-heaven", title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock", era: "1970s", tone: "Distorted", part: "Solo", character: "Mid-forward Telecaster lead through a cranked amp", originalGear: "Fender Telecaster into a small cranked Supro combo for the legendary solo" },
    { id: "back-in-black", title: "Back in Black", artist: "AC/DC", genre: "Hard Rock", era: "1980s", tone: "Distorted", part: "Riff", character: "Dry punchy Gretsch-and-Marshall crunch", originalGear: "Gretsch Jet and Gibson SG into Marshall Super Leads, no pedals, all amp" },
    { id: "sweet-child-o-mine", title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Hard Rock", era: "1980s", tone: "Distorted", part: "Riff", character: "Bell-like intro licks with hot-rodded gain", originalGear: "Kris Derrig Les Paul replica into a modded Marshall JCM800" },
    { id: "purple-haze", title: "Purple Haze", artist: "Jimi Hendrix", genre: "Psychedelic Rock", era: "1960s", tone: "Distorted", part: "Riff", character: "Fuzz Face snarl and cranked Plexi warmth", originalGear: "Fender Stratocaster with a Fuzz Face into cranked Marshall Super Leads" },
    { id: "little-wing", title: "Little Wing", artist: "Jimi Hendrix", genre: "Blues Rock", era: "1960s", tone: "Clean", part: "Solo", character: "Rounded neck-pickup chords with vibrato shimmer", originalGear: "Fender Stratocaster (neck pickup) through a rotary speaker into a warm clean amp" },
    { id: "wish-you-were-here", title: "Wish You Were Here", artist: "Pink Floyd", genre: "Prog Rock", era: "1970s", tone: "Clean", part: "Riff", character: "Open airy strumming, gentle warmth", originalGear: "12-string acoustic layered with warm, round electric cleans" },
    { id: "crazy-train", title: "Crazy Train", artist: "Ozzy Osbourne", genre: "Metal", era: "1980s", tone: "Distorted", part: "Riff", character: "Tight upper-mid British chug, hot pickups", originalGear: "Les Paul Custom into a cranked Marshall 1959, doubled takes for width" },
    { id: "nothing-else-matters", title: "Nothing Else Matters", artist: "Metallica", genre: "Metal Ballad", era: "1990s", tone: "Clean", part: "Riff", character: "Wide chorus-kissed clean fingerpicking", originalGear: "EMG-loaded ESP into a pristine clean channel with wide chorus" },
    { id: "snow-hey-oh", title: "Snow (Hey Oh)", artist: "Red Hot Chili Peppers", genre: "Alt Rock", era: "2000s", tone: "Clean", part: "Riff", character: "Percussive sparkling clean sixteenths", originalGear: "Fender Stratocaster into a Marshall Major, glassy, lightly compressed cleans" },
    { id: "cliffs-of-dover", title: "Cliffs of Dover", artist: "Eric Johnson", genre: "Instrumental Rock", era: "1990s", tone: "Distorted", part: "Solo", character: "Violin-smooth lead with liquid legato", originalGear: "Fender Stratocaster with a Tube Driver into vintage Marshall Plexis" },
    { id: "seek-and-destroy", title: "Seek & Destroy", artist: "Metallica", genre: "Thrash Metal", era: "1980s", tone: "Distorted", part: "Riff", character: "Early-thrash bark, aggressive downpicking", originalGear: "Gibson Flying V into Marshall JCM800-style crunch, pre-Mesa Metallica bite" },
]

export function getToneBySlug(slug: string): LibraryTone | undefined {
    return TONE_LIBRARY.find((t) => t.id === slug)
}

export function getRelatedTones(tone: LibraryTone, count = 4): LibraryTone[] {
    const sameGenre = TONE_LIBRARY.filter((t) => t.id !== tone.id && t.genre === tone.genre)
    const sameTone = TONE_LIBRARY.filter((t) => t.id !== tone.id && t.genre !== tone.genre && t.tone === tone.tone)
    return [...sameGenre, ...sameTone].slice(0, count)
}
