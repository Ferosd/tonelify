/**
 * Seeds `song_gear` with the documented original rig behind each tone in the
 * curated library, and creates the matching `songs` row where one is missing.
 *
 * Why this exists: `song_gear` was empty in production, and /api/tone-match
 * only sets provenance "verified" when it finds a row there. So every match the
 * product had ever returned was pure model recollection, the "checked against
 * our gear database" block never rendered, and the verified badge was dead
 * code. The data to fix it was already in the repo: lib/tone-library.ts
 * publishes these rigs as prose on the /explore pages. This script is that same
 * information in the structured columns the matcher reads.
 *
 * Two deliberate omissions:
 *
 * 1. source_title / source_url / source_detail are left null. A citation is
 *    only worth showing if a person opened the page it points at, and inventing
 *    24 plausible-looking article references is the exact failure lib/sources.ts
 *    is written to prevent. The route already reads those columns defensively,
 *    so a row with no stored source still gets the verified badge and the gear
 *    override, just without a citation line. Fill them in by hand as real
 *    sources get checked.
 *
 * 2. `effects` lists only what the library prose already claims. Where the
 *    documented story is "no pedals, all amp", the array is empty rather than
 *    padded with a plausible guess.
 *
 * Safe to re-run: matches songs case-insensitively on title and artist, updates
 * an existing song_gear row instead of adding a second one, and never deletes.
 *
 *   node scripts/seed_song_gear.js          # write
 *   node scripts/seed_song_gear.js --dry    # show what would change
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DRY_RUN = process.argv.includes('--dry');

/**
 * One entry per tone in lib/tone-library.ts, in the same order.
 *
 * `title` and `artist` must match the library exactly: those are the strings
 * the /explore pages link into /tone-match with, and the matcher looks the song
 * up by them.
 */
const SEED = [
    {
        title: 'Master of Puppets', artist: 'Metallica', genre: 'Thrash Metal',
        guitar_model: 'ESP Explorer-style electric',
        pickup_type: 'Active humbuckers, bridge position',
        amp_model: 'Mesa/Boogie Mark IIC+',
        effects: [],
    },
    {
        title: 'November Rain', artist: "Guns N' Roses", genre: 'Hard Rock',
        guitar_model: "Kris Derrig '59 Les Paul replica",
        pickup_type: 'Alnico humbuckers, neck position',
        amp_model: 'Marshall Silver Jubilee 2555',
        effects: [],
    },
    {
        title: 'Comfortably Numb', artist: 'Pink Floyd', genre: 'Prog Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils, bridge and neck',
        amp_model: 'Hiwatt head into a rotating and static cabinet rig',
        effects: ['Electro-Harmonix Big Muff', 'Electric Mistress flanger'],
    },
    {
        title: 'Sultans of Swing', artist: 'Dire Straits', genre: 'Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils, in-between positions 2 and 4',
        amp_model: 'Clean Fender-style combo',
        effects: [],
    },
    {
        title: 'My Own Summer (Shove It)', artist: 'Deftones', genre: 'Alt Metal',
        guitar_model: 'ESP 7-string, tuned well down',
        pickup_type: 'Active humbuckers, bridge position',
        amp_model: 'High-gain Marshall rack rig',
        effects: [],
    },
    {
        title: 'Welcome To The Jungle', artist: "Guns N' Roses", genre: 'Hard Rock',
        guitar_model: 'Gibson Les Paul',
        pickup_type: 'Humbuckers, bridge position',
        amp_model: 'Modded Marshall head',
        effects: ['Delay, used for the intro stabs'],
    },
    {
        title: 'Floods', artist: 'Pantera', genre: 'Groove Metal',
        guitar_model: 'Washburn signature solidbody',
        pickup_type: 'High-output humbucker, bridge position',
        amp_model: 'Randall solid-state head',
        effects: ['Digital delay in the effects loop'],
    },
    {
        title: 'Cowboys from Hell', artist: 'Pantera', genre: 'Groove Metal',
        guitar_model: 'Dean ML-style solidbody',
        pickup_type: 'High-output humbucker, bridge position',
        amp_model: 'Randall RG solid-state head',
        effects: [],
    },
    {
        title: 'Unholy Confessions', artist: 'Avenged Sevenfold', genre: 'Metalcore',
        guitar_model: 'Schecter solidbody in Drop D',
        pickup_type: 'Active humbuckers, bridge position',
        amp_model: 'Modded Marshall-style high-gain head',
        effects: [],
    },
    {
        title: 'Smells Like Teen Spirit', artist: 'Nirvana', genre: 'Grunge',
        guitar_model: 'Fender Mustang',
        pickup_type: 'Single coil, bridge position',
        amp_model: 'Cranked Fender-style amp',
        effects: ['Boss DS-1 Distortion'],
    },
    {
        title: 'Under the Bridge', artist: 'Red Hot Chili Peppers', genre: 'Alt Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils, neck position',
        amp_model: 'Marshall head kept just under breakup',
        effects: [],
    },
    {
        title: 'Slow Dancing in a Burning Room', artist: 'John Mayer', genre: 'Blues Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils, neck position',
        amp_model: 'Dumble-style overdrive amp on the edge of breakup',
        effects: [],
    },
    {
        title: 'Enter Sandman', artist: 'Metallica', genre: 'Metal',
        guitar_model: 'ESP Explorer-style electric',
        pickup_type: 'Active humbuckers, bridge position',
        amp_model: 'Mesa/Boogie high-gain rig, layered takes',
        effects: ['Wah, parked for the intro figure'],
    },
    {
        title: 'Stairway to Heaven', artist: 'Led Zeppelin', genre: 'Rock',
        guitar_model: 'Fender Telecaster',
        pickup_type: 'Single coil, bridge position',
        amp_model: 'Small cranked Supro combo',
        effects: [],
    },
    {
        title: 'Back in Black', artist: 'AC/DC', genre: 'Hard Rock',
        guitar_model: 'Gretsch Jet and Gibson SG',
        pickup_type: 'Humbuckers',
        amp_model: 'Marshall Super Lead, no pedals',
        effects: [],
    },
    {
        title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: 'Hard Rock',
        guitar_model: 'Kris Derrig Les Paul replica',
        pickup_type: 'Humbuckers, bridge position',
        amp_model: 'Modded Marshall JCM800',
        effects: [],
    },
    {
        title: 'Purple Haze', artist: 'Jimi Hendrix', genre: 'Psychedelic Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils',
        amp_model: 'Cranked Marshall Super Lead',
        effects: ['Dallas Arbiter Fuzz Face'],
    },
    {
        title: 'Little Wing', artist: 'Jimi Hendrix', genre: 'Blues Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coil, neck position',
        amp_model: 'Warm clean amp',
        effects: ['Rotary speaker'],
    },
    {
        title: 'Wish You Were Here', artist: 'Pink Floyd', genre: 'Prog Rock',
        guitar_model: '12-string acoustic layered with an electric',
        pickup_type: 'Single coils on the electric layer',
        amp_model: 'Warm, round clean amp',
        effects: [],
    },
    {
        title: 'Crazy Train', artist: 'Ozzy Osbourne', genre: 'Metal',
        guitar_model: 'Gibson Les Paul Custom',
        pickup_type: 'Humbuckers, bridge position',
        amp_model: 'Cranked Marshall 1959 Super Lead, doubled takes',
        effects: [],
    },
    {
        title: 'Nothing Else Matters', artist: 'Metallica', genre: 'Metal Ballad',
        guitar_model: 'EMG-loaded ESP electric',
        pickup_type: 'Active humbuckers, neck position',
        amp_model: 'Pristine clean channel',
        effects: ['Wide chorus'],
    },
    {
        title: 'Snow (Hey Oh)', artist: 'Red Hot Chili Peppers', genre: 'Alt Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils',
        amp_model: 'Marshall Major, glassy cleans',
        effects: ['Light compression'],
    },
    {
        title: 'Cliffs of Dover', artist: 'Eric Johnson', genre: 'Instrumental Rock',
        guitar_model: 'Fender Stratocaster',
        pickup_type: 'Single coils, neck position for the lead',
        amp_model: 'Vintage Marshall Plexi',
        effects: ['Tube Driver'],
    },
    {
        title: 'Seek & Destroy', artist: 'Metallica', genre: 'Thrash Metal',
        guitar_model: 'Gibson Flying V',
        pickup_type: 'Humbuckers, bridge position',
        amp_model: 'Marshall JCM800-style head',
        effects: [],
    },
];

/**
 * PostgREST has no "ilike exact" operator, so the escaping matters: an
 * apostrophe in "Sweet Child O' Mine" and the % and _ wildcards all have to
 * survive as literals or the lookup silently matches the wrong row.
 */
function ilikeLiteral(value) {
    return value.replace(/([\\%_])/g, '\\$1');
}

async function findSong(title, artist) {
    const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist')
        .ilike('title', ilikeLiteral(title))
        .ilike('artist', ilikeLiteral(artist));

    if (error) throw new Error(`songs lookup failed for "${title}": ${error.message}`);
    return data && data.length > 0 ? data[0] : null;
}

async function run() {
    console.log(DRY_RUN ? 'DRY RUN, nothing will be written\n' : 'Seeding song_gear\n');

    let created = 0, updated = 0, songsCreated = 0, failed = 0;

    for (const entry of SEED) {
        const { title, artist, genre, ...gear } = entry;

        try {
            let song = await findSong(title, artist);

            if (!song) {
                if (DRY_RUN) {
                    console.log(`  + song   "${title}" by ${artist}`);
                } else {
                    const { data, error } = await supabase
                        .from('songs')
                        .insert({ title, artist, genre })
                        .select('id, title, artist')
                        .single();
                    if (error) throw new Error(`songs insert failed: ${error.message}`);
                    song = data;
                }
                songsCreated++;
            }

            // Dry run against a song that does not exist yet has no id to check
            // gear for, so there is nothing further to report on this entry.
            if (!song) continue;

            const { data: existingGear, error: gearError } = await supabase
                .from('song_gear')
                .select('id')
                .eq('song_id', song.id);

            if (gearError) throw new Error(`song_gear lookup failed: ${gearError.message}`);

            const row = { song_id: song.id, ...gear, verified: true };
            const hasGear = existingGear && existingGear.length > 0;

            if (DRY_RUN) {
                console.log(`  ${hasGear ? '~' : '+'} gear   "${title}" by ${artist}`);
                hasGear ? updated++ : created++;
                continue;
            }

            if (hasGear) {
                const { error } = await supabase
                    .from('song_gear')
                    .update(row)
                    .eq('id', existingGear[0].id);
                if (error) throw new Error(`song_gear update failed: ${error.message}`);
                updated++;
                console.log(`  ~ updated "${title}" by ${artist}`);
            } else {
                const { error } = await supabase.from('song_gear').insert(row);
                if (error) throw new Error(`song_gear insert failed: ${error.message}`);
                created++;
                console.log(`  + added   "${title}" by ${artist}`);
            }
        } catch (err) {
            failed++;
            console.error(`  ! ${title} by ${artist}: ${err.message}`);
        }
    }

    console.log(
        `\nsongs created ${songsCreated} | gear added ${created} | gear updated ${updated} | failed ${failed}`
    );
    if (failed > 0) process.exitCode = 1;
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
