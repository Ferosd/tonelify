// Curated library of iconic tones surfaced on /explore.
// `character` is a one-line description of what defines the tone.

export type LibraryTone = {
    id: string
    title: string
    artist: string
    genre: string
    era: string
    tone: "Clean" | "Distorted"
    part: "Riff" | "Solo"
    character: string
}

export const TONE_LIBRARY: LibraryTone[] = [
    { id: "master-of-puppets", title: "Master of Puppets", artist: "Metallica", genre: "Thrash Metal", era: "1980s", tone: "Distorted", part: "Riff", character: "Scooped mids, razor-tight palm-muted chug" },
    { id: "november-rain", title: "November Rain", artist: "Guns N' Roses", genre: "Hard Rock", era: "1990s", tone: "Distorted", part: "Solo", character: "Singing neck-pickup lead with silky sustain" },
    { id: "comfortably-numb", title: "Comfortably Numb", artist: "Pink Floyd", genre: "Prog Rock", era: "1970s", tone: "Distorted", part: "Solo", character: "Creamy fuzz-driven sustain, huge ambience" },
    { id: "sultans-of-swing", title: "Sultans of Swing", artist: "Dire Straits", genre: "Rock", era: "1970s", tone: "Clean", part: "Solo", character: "Glassy in-between Strat quack, fingerstyle snap" },
    { id: "my-own-summer", title: "My Own Summer (Shove It)", artist: "Deftones", genre: "Alt Metal", era: "1990s", tone: "Distorted", part: "Riff", character: "Thick detuned wall of grinding lows" },
    { id: "welcome-to-the-jungle", title: "Welcome To The Jungle", artist: "Guns N' Roses", genre: "Hard Rock", era: "1980s", tone: "Distorted", part: "Riff", character: "Bright crunchy Marshall bite with delay stabs" },
    { id: "floods", title: "Floods", artist: "Pantera", genre: "Groove Metal", era: "1990s", tone: "Distorted", part: "Solo", character: "Haunting solid-state lead over clean arpeggios" },
    { id: "cowboys-from-hell", title: "Cowboys from Hell", artist: "Pantera", genre: "Groove Metal", era: "1990s", tone: "Distorted", part: "Riff", character: "Scooped solid-state grind, surgical attack" },
    { id: "unholy-confessions", title: "Unholy Confessions", artist: "Avenged Sevenfold", genre: "Metalcore", era: "2000s", tone: "Distorted", part: "Riff", character: "Drop-D chug with modern high-gain saturation" },
    { id: "smells-like-teen-spirit", title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge", era: "1990s", tone: "Distorted", part: "Riff", character: "Raw fuzzy grunge power chords" },
    { id: "under-the-bridge", title: "Under the Bridge", artist: "Red Hot Chili Peppers", genre: "Alt Rock", era: "1990s", tone: "Clean", part: "Riff", character: "Chimey clean arpeggios, warm compression" },
    { id: "slow-dancing", title: "Slow Dancing in a Burning Room", artist: "John Mayer", genre: "Blues Rock", era: "2000s", tone: "Clean", part: "Solo", character: "Fat blues neck tone on the edge of breakup" },
    { id: "enter-sandman", title: "Enter Sandman", artist: "Metallica", genre: "Metal", era: "1990s", tone: "Distorted", part: "Riff", character: "Wah-cocked intro into massive rhythm crunch" },
    { id: "stairway-to-heaven", title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock", era: "1970s", tone: "Distorted", part: "Solo", character: "Mid-forward Telecaster lead through a cranked amp" },
    { id: "back-in-black", title: "Back in Black", artist: "AC/DC", genre: "Hard Rock", era: "1980s", tone: "Distorted", part: "Riff", character: "Dry punchy Gretsch-and-Marshall crunch" },
    { id: "sweet-child-o-mine", title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Hard Rock", era: "1980s", tone: "Distorted", part: "Riff", character: "Bell-like intro licks with hot-rodded gain" },
    { id: "purple-haze", title: "Purple Haze", artist: "Jimi Hendrix", genre: "Psychedelic Rock", era: "1960s", tone: "Distorted", part: "Riff", character: "Fuzz Face snarl and cranked Plexi warmth" },
    { id: "little-wing", title: "Little Wing", artist: "Jimi Hendrix", genre: "Blues Rock", era: "1960s", tone: "Clean", part: "Solo", character: "Rounded neck-pickup chords with vibrato shimmer" },
    { id: "wish-you-were-here", title: "Wish You Were Here", artist: "Pink Floyd", genre: "Prog Rock", era: "1970s", tone: "Clean", part: "Riff", character: "Open airy strumming, gentle warmth" },
    { id: "crazy-train", title: "Crazy Train", artist: "Ozzy Osbourne", genre: "Metal", era: "1980s", tone: "Distorted", part: "Riff", character: "Tight upper-mid British chug, hot pickups" },
    { id: "nothing-else-matters", title: "Nothing Else Matters", artist: "Metallica", genre: "Metal Ballad", era: "1990s", tone: "Clean", part: "Riff", character: "Wide chorus-kissed clean fingerpicking" },
    { id: "snow-hey-oh", title: "Snow (Hey Oh)", artist: "Red Hot Chili Peppers", genre: "Alt Rock", era: "2000s", tone: "Clean", part: "Riff", character: "Percussive sparkling clean sixteenths" },
    { id: "cliffs-of-dover", title: "Cliffs of Dover", artist: "Eric Johnson", genre: "Instrumental Rock", era: "1990s", tone: "Distorted", part: "Solo", character: "Violin-smooth lead with liquid legato" },
    { id: "seek-and-destroy", title: "Seek & Destroy", artist: "Metallica", genre: "Thrash Metal", era: "1980s", tone: "Distorted", part: "Riff", character: "Early-thrash bark, aggressive downpicking" },
]
