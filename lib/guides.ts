// Evergreen guides.
//
// The site had no answer to any question a player types before they know a tool
// like this exists. Every URL was either the product, a song or a piece of gear,
// which means the only way to reach Tonelify from a search engine was to already
// be looking for tone matching. That is a small pool, and it is not the pool the
// answer engines draw from: "how do I EQ a guitar amp" and "what order do my
// pedals go in" are asked constantly, answered by a handful of the same sites
// every time, and cited by name in the response.
//
// These pages exist to be that citation. The shape is deliberate and the same in
// each: the question as the h1, a two-sentence direct answer immediately under
// it, then the reasoning. An engine lifting a passage takes it without the page
// around it, so the answer has to survive on its own with nothing above it.
//
// The product appears once per guide, at the point where the general advice runs
// out and the reader needs a number for their own amp. A guide that sells in
// every paragraph does not get cited, and being cited is the entire point.

export type GuideSection = {
    heading: string;
    body: string[];
};

export type Guide = {
    id: string;
    /** The h1, phrased the way the question gets typed */
    title: string;
    /** Title tag; the layout appends the brand */
    metaTitle: string;
    description: string;
    /** Front-loaded answer, quotable with nothing above it */
    answer: string[];
    updated: string;
    /** Rough read time in minutes, shown and used in schema */
    minutes: number;
    sections: GuideSection[];
    faqs: { q: string; a: string }[];
    /** Guide ids to cross-link */
    related: string[];
};

export const GUIDES_UPDATED = "2026-08-15";

export const GUIDES: Guide[] = [
    {
        id: "how-to-eq-a-guitar-amp",
        title: "How to EQ a guitar amp",
        metaTitle: "How to EQ a Guitar Amp: A Method That Works on Any Amp",
        description:
            "Set the gain first, then cut before you boost, and move one control at a time. A repeatable method for EQing any guitar amp, and what each band actually does.",
        answer: [
            "Set the gain first, then start with bass, middle and treble at 5 and move one control at a time. Cut the band that bothers you before boosting the one you want, because boosting raises the overall volume and tricks you into thinking the tone improved when it only got louder.",
            "Guitar amp EQ is subtractive work. The amp is already making every frequency it is going to make, and the tone controls only decide which ones survive.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 6,
        sections: [
            {
                heading: "Set the gain before you touch the EQ",
                body: [
                    "Gain and EQ are not independent. The distortion stage generates harmonics from whatever reaches it, so changing the gain changes the frequency content the tone stack is then working on. EQ dialled in at a low gain setting falls apart when the gain goes up.",
                    "Get the amount of dirt right first, playing the part you actually intend to play. A chord voicing that sounds tight at low gain can turn to mush at high gain, and that is a gain problem no amount of EQ will fix.",
                ],
            },
            {
                heading: "Start flat, then cut before you boost",
                body: [
                    "Put bass, middle and treble at 5 and listen before you change anything. Most amps are voiced to sound reasonable there, and it gives you a reference to move away from.",
                    "When something bothers you, find it and cut it rather than boosting its neighbours. Cutting keeps the overall level roughly where it was, so you hear the change in tone rather than a change in loudness. Boosting does the opposite: it raises the volume, and louder reliably sounds better for the first few seconds.",
                    "One control at a time, and move it far enough to hear it. Small simultaneous nudges to three knobs tell you nothing about which knob did what.",
                ],
            },
            {
                heading: "What each band is actually doing",
                body: [
                    "Bass controls the weight and the body. Too much and the low strings smear together, especially under distortion, because the distortion stage multiplies the low frequencies into everything else. High-gain rhythm tones almost always want less bass than feels right in a quiet room.",
                    "Middle is where the guitar lives. It carries note definition and it is the range that decides whether a part is audible with a band playing. Cutting it makes a guitar sound heavier on its own and disappear completely in a mix.",
                    "Treble sets the attack and the string noise. It is also the first control to turn harsh, and how harsh depends on volume: a treble setting that is bright at bedroom level can be painful at stage level.",
                    "Presence sits above treble and works on the power section rather than the preamp, which is why it behaves differently from the other three. See the guide on what each amp control does for the detail.",
                ],
            },
            {
                heading: "EQ at the volume you will actually play at",
                body: [
                    "Human hearing is not flat, and it is less flat at low volume. Bass and treble both fall away as level drops, which is why a tone dialled in quietly sounds thin and shrill when it is turned up, and a tone dialled in loud sounds dull and boomy in a bedroom.",
                    "If you rehearse loud and practise quiet, you need two settings. This is not a failure of the amp.",
                ],
            },
            {
                heading: "Where the general method runs out",
                body: [
                    "Everything above gets you a good sound. It does not get you a specific sound, because the same target lands at different knob positions on different amps: the tone stacks are voiced differently, they sit at different points in the circuit, and a 5 on one amp is not a 5 on another.",
                    "That translation is what Tonelify does. Name the amp you own and the tone you are chasing, and it returns the positions for that amp's actual controls rather than a generic curve.",
                ],
            },
        ],
        faqs: [
            {
                q: "Should guitar amp EQ be set flat?",
                a: "Flat is a starting point, not a destination. Set bass, middle and treble to 5, listen, then cut whatever bothers you. Most amps are voiced to sound usable at 5, which makes it a useful reference, but no amp is designed to be left there.",
            },
            {
                q: "Do you set gain or EQ first on a guitar amp?",
                a: "Gain first. The distortion stage generates harmonics from whatever reaches it, so changing the gain changes the frequency content that the tone controls then act on. EQ set at low gain will not hold up once the gain is raised.",
            },
            {
                q: "Why does my amp sound different at high volume?",
                a: "Human hearing is less sensitive to bass and treble at low volume, so a tone dialled in quietly sounds thin and harsh when it is turned up. On valve amps the power section also compresses as it is pushed, which changes the response on top of that. Dial in at the volume you will actually play at.",
            },
        ],
        related: ["amp-controls-explained", "scooped-mids-explained", "why-your-amp-doesnt-sound-like-the-record"],
    },

    {
        id: "amp-controls-explained",
        title: "What every knob on a guitar amp does",
        metaTitle: "Guitar Amp Controls Explained: Gain, Volume, Master and Presence",
        description:
            "Gain sets distortion, volume sets level, master sets power-section drive, presence works above treble. What each guitar amp control does and which ones interact.",
        answer: [
            "Gain sets how hard the preamp is driven and therefore how much distortion the amp makes. Volume sets how loud that is. On an amp with both a volume and a master volume, the first sets preamp level and the second sets how hard the power section works, which is a different kind of distortion with a different feel.",
            "Presence and resonance sit after the tone stack and act on the power amp, so they behave differently from bass, middle and treble.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 6,
        sections: [
            {
                heading: "Gain, drive, preamp volume",
                body: [
                    "All three names describe the same job: how hard the signal is pushed into the preamp's distortion stages. More gain means more saturation, more compression and more sustain, and less clarity between the notes in a chord.",
                    "Gain also interacts with your pickups. A high-output humbucker reaches a given amount of saturation at a lower gain setting than a single coil does, which is why the same number sounds different on two guitars through the same amp.",
                ],
            },
            {
                heading: "Volume and master volume",
                body: [
                    "On a single-volume amp, the volume control does both jobs: it makes the amp louder and, past a point, drives the power section into distortion. This is why old amps only sound like the records at volumes that are impractical indoors.",
                    "A master volume splits the two. The first control decides how much preamp distortion you get, and the master decides how loud that is. Power-section distortion is looser and more responsive than preamp distortion, and getting it means running the master high and the preamp lower, which is the opposite of what most players do.",
                ],
            },
            {
                heading: "Bass, middle, treble",
                body: [
                    "These form the tone stack, and on most amps they are interactive rather than independent: moving the bass control changes what the middle control does, because the circuit is a single passive network rather than three separate filters.",
                    "That interaction is why one control at a time is the only way to learn an amp. It is also why two amps with identical numbers on the panel do not sound the same. The tone stack sits at a different point in the circuit and is tuned around different frequencies.",
                ],
            },
            {
                heading: "Presence and resonance",
                body: [
                    "Presence works above the treble range and, on most valve amps, does so by reducing negative feedback in the power section rather than by filtering the signal. In practice it adds bite and air, and it is the control that decides whether a distorted tone cuts through or sits behind everything else.",
                    "Resonance, sometimes called depth, is the same idea at the other end: it controls the low-frequency behaviour of the power section and the speaker together. Turning it up adds thump rather than the general weight the bass control adds.",
                    "Both act after the tone stack, so they can rescue a tone that the EQ alone could not.",
                ],
            },
            {
                heading: "Channel and voicing switches",
                body: [
                    "A channel switch usually swaps between different preamp gain structures, not just different amounts of the same thing. Setting a clean channel's controls and expecting them to carry over to the lead channel does not work; each channel is dialled in separately.",
                    "On modelling amps, the voicing or model selector sets the ceiling that all the other controls work inside. Picking it is the first step of dialling in a tone, not a garnish at the end.",
                ],
            },
        ],
        faqs: [
            {
                q: "What is the difference between gain and volume on a guitar amp?",
                a: "Gain sets how hard the preamp is driven, which controls how much distortion the amp makes. Volume sets how loud the result is. On an amp with a master volume, the master controls how hard the power section works, which produces a looser, more responsive distortion than the preamp does.",
            },
            {
                q: "What does the presence knob do?",
                a: "Presence adds content above the treble range and, on most valve amps, works by reducing negative feedback in the power section rather than by filtering the signal. It adds bite and air, and it is usually what decides whether a distorted tone cuts through a band or sits behind it.",
            },
            {
                q: "What does the resonance or depth control do?",
                a: "Resonance controls the low-frequency behaviour of the power section and speaker together, adding thump and physical push rather than the broad weight the bass control adds. Like presence, it acts after the tone stack, so it can fix a low end the EQ could not.",
            },
        ],
        related: ["how-to-eq-a-guitar-amp", "pickups-and-amp-settings", "metal-tone-on-any-amp"],
    },

    {
        id: "guitar-pedal-order",
        title: "What order should guitar pedals go in?",
        metaTitle: "Guitar Pedal Order: The Standard Chain and When to Break It",
        description:
            "Tuner, filter, compressor, drive, modulation, delay, reverb. The standard pedal order, the reason behind each position, and the cases where swapping two is correct.",
        answer: [
            "The standard order is tuner, then filter effects like wah, then compressor, then drive and distortion, then modulation, then delay, then reverb. The rule behind it is that each effect should act on a signal that already contains everything it needs to react to, and nothing it should not.",
            "Time-based effects go last because running a delay into a distortion smears the repeats into the distortion instead of layering them over it.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 6,
        sections: [
            {
                heading: "The standard chain, and why each position",
                body: [
                    "Tuner first, so it sees the raw signal. Anything that compresses or distorts before it makes pitch detection worse, and a tuner with a mute switch at the front of the chain kills the whole rig silently.",
                    "Wah and filters early, because they sweep a peak across the signal and you want that peak feeding the drive stage. A wah after distortion sounds thinner and more like an effect sitting on top of the tone rather than part of it.",
                    "Compressor before drive, so the drive receives an even signal and the compressor is not fighting the drive pedal's own compression. Some players do the reverse to control the output of a fuzz, which is a legitimate exception.",
                    "Drives in order of least to most gain, so a boost can push an overdrive rather than the other way round. Stacking is the point: a light overdrive in front of a driven amp tightens the low end and adds saturation without adding mud.",
                    "Modulation after drive, because chorus and phaser applied before distortion get flattened by the distortion's compression.",
                    "Delay then reverb last, in that order. Reverb after delay puts the ambience around the repeats, which is how a real room works. Reverb before delay makes the delay repeat the reverb, which almost always sounds wrong.",
                ],
            },
            {
                heading: "Effects loops change the answer",
                body: [
                    "If your distortion comes from the amp rather than a pedal, putting a delay in front of the input means the delay is going into the distortion. The effects loop sits between the preamp and the power section, which is after the amp's own distortion, and that is where time-based effects belong on an amp that has one.",
                    "Drive pedals stay in front of the input regardless, because they are meant to interact with the preamp rather than bypass it.",
                ],
            },
            {
                heading: "The exceptions worth knowing",
                body: [
                    "Fuzz usually wants to be first, straight into the guitar, because most fuzz circuits interact with the pickups directly and lose their character behind a buffered pedal.",
                    "Volume pedal position changes what it does. Before the drive it acts like the guitar volume knob and cleans the tone up as you roll back. After the drive it acts as a master level and keeps the amount of dirt constant.",
                    "Noise gates often work best in two places at once on high-gain rigs: one before the drive to catch the input noise, one in the loop to catch what the amp adds.",
                ],
            },
            {
                heading: "Order is not the whole answer",
                body: [
                    "Getting the order right stops the chain fighting itself. It does not tell you what to set anything to, and the settings depend on the amp underneath as much as on the pedals.",
                    "Tonelify takes the pedals you own along with your amp and guitar, and returns both the order and the values for a specific tone.",
                ],
            },
        ],
        faqs: [
            {
                q: "Does delay go before or after distortion?",
                a: "After. A delay in front of a distortion has its repeats compressed and saturated along with the dry signal, which smears them together. Placing it after keeps the repeats clean and layered over the distorted tone. If the distortion comes from the amp, that means putting the delay in the amp's effects loop.",
            },
            {
                q: "Where does a wah pedal go in the chain?",
                a: "Early, before the drive pedals. A wah sweeps a resonant peak across the signal, and feeding that peak into the distortion is what produces the vocal, expressive character. After the distortion it sounds thinner and more like an effect layered on top.",
            },
            {
                q: "Why does fuzz go first?",
                a: "Most fuzz circuits have a low input impedance and interact directly with the guitar's pickups, which is part of how they respond to the volume knob. Putting a buffered pedal in front of a fuzz breaks that interaction and usually makes it sound thin and harsh.",
            },
        ],
        related: ["amp-controls-explained", "how-to-eq-a-guitar-amp", "why-your-amp-doesnt-sound-like-the-record"],
    },

    {
        id: "scooped-mids-explained",
        title: "What does scooping the mids mean?",
        metaTitle: "Scooped Mids Explained: Why It Sounds Huge Alone and Vanishes in a Band",
        description:
            "Scooped mids means cutting the midrange and boosting bass and treble. Why it sounds enormous on its own, why it disappears with a band, and where it is genuinely correct.",
        answer: [
            "Scooping the mids means cutting the midrange control while leaving bass and treble high, which produces the smiley-face EQ curve behind most classic thrash rhythm tones. It sounds enormous on its own because the ear reads the exaggerated extremes as size.",
            "It disappears in a band because the midrange is the only range where a guitar is not competing with bass guitar, kick drum or cymbals. Cut it and you have removed the part of your sound with somewhere to sit.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 5,
        sections: [
            {
                heading: "Why it sounds so good alone",
                body: [
                    "Cutting the mids raises the perceived contrast between the low end and the top end, and contrast reads as scale. The palm mutes get more thud, the picking gets more click, and nothing sits in the middle to soften either.",
                    "Under distortion the effect compounds. Distortion generates a dense band of harmonics through the midrange, so cutting there also removes a lot of the fizz and mush that high gain creates, which makes the tone sound cleaner and tighter than it is.",
                ],
            },
            {
                heading: "Why it vanishes with a band",
                body: [
                    "A full mix is crowded at both ends. Bass guitar and kick drum own the low frequencies, cymbals and vocal air own the top. The midrange is where a guitar has room, and it is also where the human ear is most sensitive.",
                    "Scoop it and the guitar has nothing left in the one range that was uncontested. Turning up does not fix it, because you are adding more of the frequencies that are already occupied.",
                ],
            },
            {
                heading: "How the records actually did it",
                body: [
                    "The recorded thrash tones that made scooping famous were not one guitar with the mids at zero. They were multiple layered takes, often four, panned wide, with each individual track carrying more midrange than the finished sound suggests.",
                    "Layering builds size out of many mid-heavy tracks. A single player trying to reach that size with one track and a scooped EQ is solving a different problem with the wrong tool.",
                ],
            },
            {
                heading: "When scooping is correct",
                body: [
                    "Recording rhythm parts that will be layered and then mixed, where the mids can be shaped at the desk afterwards.",
                    "Playing alone, where there is nothing to compete with and the sound only has to please you.",
                    "As a deliberate arrangement choice, where a second guitarist is carrying the midrange and you are covering the extremes.",
                    "Playing in a band as the only guitarist is not on this list. There, a mid-forward setting that sounds worse on its own almost always sounds better in the room.",
                ],
            },
        ],
        faqs: [
            {
                q: "Should I scoop the mids for metal?",
                a: "Only if you are layering multiple guitar tracks or playing alone. With a live band and one guitar, a scooped setting removes the only frequency range where the guitar is not competing with bass, kick and cymbals, so the part disappears no matter how loud the amp is.",
            },
            {
                q: "What is a smiley face EQ?",
                a: "A setting with bass and treble raised and the midrange cut, so the three controls form a smile shape on the panel. It exaggerates the extremes, which the ear reads as size, and it is the classic scooped metal rhythm curve.",
            },
            {
                q: "Why does my guitar disappear in the band mix?",
                a: "Usually because the midrange is cut. Bass and drums already occupy the low frequencies and cymbals occupy the top, so the mids are the only uncontested range a guitar has. Raising the middle control almost always fixes it faster than raising the volume does.",
            },
        ],
        related: ["how-to-eq-a-guitar-amp", "metal-tone-on-any-amp", "why-your-amp-doesnt-sound-like-the-record"],
    },

    {
        id: "pickups-and-amp-settings",
        title: "How pickups change your amp settings",
        metaTitle: "Single Coils vs Humbuckers: How Pickups Change Your Amp Settings",
        description:
            "Humbuckers hit the amp harder and darker, single coils lighter and brighter. What to change on the amp when you switch guitars, and why copied settings often fail.",
        answer: [
            "Humbuckers send a hotter, darker signal into the amp, so they reach a given amount of saturation at a lower gain setting and usually need more treble. Single coils send a lower-output, brighter signal, so they need more gain for the same saturation and less treble to stay comfortable.",
            "This is why amp settings copied from another player often fail. The settings were right, but they were written for different pickups.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 5,
        sections: [
            {
                heading: "Output level is a gain control you already own",
                body: [
                    "A pickup's output level decides how hard the amp's first stage is driven, which makes it functionally part of the gain structure. A high-output humbucker into an amp set at 5 can be dirtier than a vintage single coil into the same amp set at 7.",
                    "The practical consequence: when you swap guitars, adjust the amp's gain before you conclude the amp is wrong.",
                ],
            },
            {
                heading: "Frequency balance, not just level",
                body: [
                    "Humbuckers use two coils wired to cancel hum, and the arrangement also cancels some high frequency content, which is why they sound thicker and darker. Single coils keep that top end and the noise that comes with it.",
                    "So the change is two-dimensional. A humbucker guitar usually wants more treble and presence and less bass than a single coil guitar aiming at the same tone, on top of the gain difference.",
                ],
            },
            {
                heading: "Position matters as much as type",
                body: [
                    "The bridge pickup sits where the string moves least, which produces a brighter, tighter, lower-output signal. The neck pickup sits over a wider part of the string's motion, producing a fatter, louder, darker one.",
                    "That is a bigger difference than many guitar-to-guitar differences. A setting dialled in on the bridge pickup rarely holds up on the neck, which is why any set of settings worth following names the pickup position it was written for.",
                    "In-between positions on a Stratocaster-style guitar partially cancel as well, giving the thinner, hollow character that carries a lot of clean funk and blues playing.",
                ],
            },
            {
                heading: "The practical routine when you switch guitars",
                body: [
                    "Match the saturation first by moving the gain, not the EQ. Play the same part on both guitars and get the amount of dirt to feel the same.",
                    "Then fix the balance: darker guitar, more treble and less bass. Brighter guitar, the reverse.",
                    "Then check the pickup position you will actually use for the part, and adjust again if it is not the one you dialled in on.",
                    "Tonelify does this arithmetic as part of a match. Enter the guitar and its pickup layout along with your amp, and the settings come back already accounting for what those pickups do to the front of the amp.",
                ],
            },
        ],
        faqs: [
            {
                q: "Do humbuckers need more or less gain than single coils?",
                a: "Less. Humbuckers have higher output, so they drive the amp's input harder and reach the same amount of saturation at a lower gain setting. Moving from single coils to humbuckers usually means turning the gain down and the treble up.",
            },
            {
                q: "Why do amp settings from a video not work on my guitar?",
                a: "Usually because the pickups are different. Pickup output changes how hard the amp is driven and pickup type changes the frequency balance reaching it, so identical knob positions produce different results on different guitars. The settings were not wrong, they were written for another instrument.",
            },
            {
                q: "Should I change amp settings when I switch pickups on the same guitar?",
                a: "Yes. The bridge pickup is brighter, tighter and lower in output than the neck pickup, so a setting dialled in on one rarely holds up on the other. Any set of settings worth following states which pickup position it assumes.",
            },
        ],
        related: ["amp-controls-explained", "how-to-eq-a-guitar-amp", "why-your-amp-doesnt-sound-like-the-record"],
    },

    {
        id: "metal-tone-on-any-amp",
        title: "How to get a metal tone on any amp",
        metaTitle: "How to Get a Metal Tone on Any Amp, Including Cheap Ones",
        description:
            "Tight low end, controlled gain, mids you can hear and a gate. How to get a usable metal tone out of a practice amp, a modelling combo or a valve head.",
        answer: [
            "Cut the bass further than feels right, keep the gain lower than you expect, leave the mids audible, and use a noise gate. Most amps that supposedly cannot do metal are being asked to make heaviness out of bass and gain, which is where heaviness does not come from.",
            "If the amp genuinely runs out of gain, an overdrive pedal in front of the input with the drive low and the level high adds saturation and tightens the low end at the same time.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 6,
        sections: [
            {
                heading: "Turn the gain down",
                body: [
                    "Past a certain point more gain adds compression and noise rather than aggression. It also destroys the gap between notes, and palm-muted riffing depends entirely on that gap being clean.",
                    "Set the gain where a fast palm-muted run stays readable, then stop. On most amps that is a good deal lower than the panel suggests.",
                ],
            },
            {
                heading: "Cut the bass, not the mids",
                body: [
                    "Distortion multiplies low frequencies into everything else, so bass that sounds correct clean turns into mud as soon as the gain rises. Detuned parts need it cut further still.",
                    "Cutting mids is the more common instinct and the more damaging one. It hollows the tone out and removes the range that makes a riff audible with drums playing. See the guide on scooped mids for why the records that made it famous do not apply to a single live guitar.",
                ],
            },
            {
                heading: "Put an overdrive in front",
                body: [
                    "A Tube Screamer style pedal with the drive near zero, the tone around the middle and the level high is not being used as a distortion. It is being used as a filter and a boost: it rolls off the low end before the signal reaches the amp's distortion, and it pushes the input harder.",
                    "The result is a tighter, more focused version of the same amp, which is the single most effective thing you can do to a mid-priced high-gain amp. It also works on an amp that does not have enough gain of its own.",
                ],
            },
            {
                heading: "Gate it",
                body: [
                    "High gain and single-coil-adjacent noise are a bad combination, and the silence between riffs is part of what makes a rhythm part sound tight. A noise gate is not a luxury on a high-gain rig.",
                    "Set the threshold just above the noise floor with the guitar's volume up, not down, or the gate will chop off sustained notes.",
                ],
            },
            {
                heading: "On a modelling amp, pick the model first",
                body: [
                    "The voicing selector sets the ceiling. Every knob afterwards works inside whatever the model can do, so turning the gain up on a clean voicing will never arrive anywhere useful.",
                    "Choose the high-gain model, then apply everything above inside it.",
                ],
            },
            {
                heading: "Getting a specific tone rather than a good one",
                body: [
                    "The advice above produces a solid metal tone on almost any amp. Landing on a particular record is a different job, because the numbers change with the amp and the guitar.",
                    "Tonelify takes the song, your amp and your guitar and returns the positions for your rig, using only the controls that amp actually has.",
                ],
            },
        ],
        faqs: [
            {
                q: "Can you get a metal tone from a cheap practice amp?",
                a: "Usually yes, with the bass cut further than feels natural, the gain lower than expected, the mids left audible and an overdrive pedal in front of the input to tighten the low end. Most practice amps fail at metal because they are asked to make heaviness out of bass and gain rather than out of tightness and midrange.",
            },
            {
                q: "Why does my high-gain tone sound muddy?",
                a: "Almost always too much bass, too much gain, or both. Distortion multiplies low frequencies into everything else, so a bass setting that sounds right on a clean channel turns to mud once the gain rises. Cut the bass first and lower the gain second.",
            },
            {
                q: "What does a Tube Screamer do in front of a high-gain amp?",
                a: "With the drive near zero and the level high, it works as a filter and a boost rather than a distortion. It rolls off low frequencies before they reach the amp's distortion stage and pushes the input harder, which produces a tighter, more focused version of the same amp.",
            },
        ],
        related: ["scooped-mids-explained", "how-to-eq-a-guitar-amp", "guitar-pedal-order"],
    },

    {
        id: "why-your-amp-doesnt-sound-like-the-record",
        title: "Why your amp doesn't sound like the record",
        metaTitle: "Why Your Amp Doesn't Sound Like the Record (And How Close You Can Get)",
        description:
            "Records are layered, compressed, mic'd and mastered. What of a recorded guitar tone is reachable on your own amp, what is not, and where the remaining distance comes from.",
        answer: [
            "A record is a mix, not an amp. Layered takes, microphone choice and placement, studio compression, and mastering all sit between the amplifier in the room and the file you are listening to, and none of them are things a knob position can reproduce.",
            "What you can reach is the amp-in-the-room version of the tone: the same gain structure, the same EQ balance, the same pickup and the same effects. That is most of what people mean when they say a tone sounds right.",
        ],
        updated: GUIDES_UPDATED,
        minutes: 6,
        sections: [
            {
                heading: "Layering",
                body: [
                    "Most heavy rhythm parts on records are two to four separate performances panned across the stereo field. The size comes from the small timing and pitch differences between takes, which no single performance can produce.",
                    "This is the largest single gap, and it is the one players most often try to close with gain. Adding gain to one track does not make it sound like four tracks; it makes it sound like one saturated track.",
                ],
            },
            {
                heading: "The microphone and the room",
                body: [
                    "What reaches a record is a microphone's view of one part of one speaker cone. Move the microphone an inch toward the centre and the tone gets brighter and harsher; move it toward the edge and it darkens. Engineers spend real time on that inch.",
                    "You are standing several feet away hearing the whole cabinet plus the room. Those are genuinely different sounds from the same amp, and neither is wrong.",
                ],
            },
            {
                heading: "Compression and mastering",
                body: [
                    "Studio compression evens out the dynamics in a way an amp does not, which is a large part of why recorded guitars sound so consistent and so present. Mastering then shapes the whole mix again.",
                    "Both stages happen after the guitar tone exists. Trying to reproduce their effect with amp settings means over-compressing the amp itself, usually by adding gain, which costs the clarity the record actually has.",
                ],
            },
            {
                heading: "Your hands",
                body: [
                    "Pick attack, pick angle, string gauge, tuning and how hard you mute all change the tone measurably. Two players on identical rigs sound different, and this is not a cliché, it is the largest remaining variable once the settings are right.",
                    "Nothing on the amp closes this gap.",
                ],
            },
            {
                heading: "What is actually reachable, and how",
                body: [
                    "Four things carry a tone from one rig to another: the gain structure, the EQ curve, the pickup position and the order of the effects. All four translate onto equipment that costs a fraction of the original, and getting all four right is what makes a tone recognisable.",
                    "The catch is that the knob positions differ per amp, because tone stacks are voiced differently and sit at different points in the circuit. Copying the numbers from the original rig onto yours produces the wrong answer.",
                    "Tonelify does that translation: it reads the documented chain behind a recording and returns the positions for the amp and guitar you actually own. It aims at the amp-in-the-room version deliberately, because that is the honest target.",
                ],
            },
        ],
        faqs: [
            {
                q: "Can you sound exactly like a record with the right amp settings?",
                a: "No. A record is a mix: layered takes, microphone placement, studio compression and mastering all sit between the amp and the released file, and none of them are reproducible with knob positions. What is reachable is the amp-in-the-room version of the tone, which is the same gain structure, EQ balance, pickup and effects chain.",
            },
            {
                q: "Why do recorded guitars sound bigger than mine?",
                a: "Mostly layering. Heavy rhythm parts are usually two to four separate takes panned wide, and the size comes from the small timing and pitch differences between them. A single track cannot produce that, and adding gain to compensate makes the tone more saturated rather than bigger.",
            },
            {
                q: "Should I copy the amp settings the original artist used?",
                a: "Not directly. Tone stacks are voiced differently and sit at different points in different circuits, so a 6 on the original amp is not a 6 on yours. What transfers is the gain structure, the EQ balance, the pickup position and the effects order, translated to your amp's own controls.",
            },
        ],
        related: ["scooped-mids-explained", "pickups-and-amp-settings", "how-to-eq-a-guitar-amp"],
    },
];

export function getGuide(id: string): Guide | undefined {
    return GUIDES.find((g) => g.id === id);
}

export function relatedGuides(guide: Guide): Guide[] {
    return guide.related
        .map(getGuide)
        .filter((g): g is Guide => g !== undefined && g.id !== guide.id);
}

/** Every paragraph of a guide as one string, for schema wordCount and exports. */
export function guideText(guide: Guide): string {
    return [
        ...guide.answer,
        ...guide.sections.flatMap((s) => [s.heading, ...s.body]),
        ...guide.faqs.flatMap((f) => [f.q, f.a]),
    ].join("\n\n");
}
