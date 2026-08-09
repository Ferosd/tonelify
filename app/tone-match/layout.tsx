import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    title: "Tone Match: AI Guitar Tone Matching",
    description:
        "Match any legendary guitar tone to your specific gear. Select your amp, guitar, and pickups, then get settings in seconds.",
    openGraph: {
        title: "Tone Match: AI Guitar Tone Matching",
        description:
            "Match any legendary guitar tone to your specific gear. Get AI-powered amp settings instantly.",
    },
    alternates: {
        canonical: "/tone-match",
    },
};

/**
 * The matcher itself is a client component, so everything a crawler used to see
 * on this route was form microcopy: no sentence on the page answered "what is
 * tone matching" in a way anything could quote. These three steps and the
 * explainer below render server-side, which puts a self-contained answer in the
 * first HTML payload for the engines that never run JavaScript.
 */
const STEPS = [
    {
        name: "Enter your gear",
        text: "Name the guitar, the amp and the pickup configuration you actually own. Tonelify needs the rig it is translating to, not the one on the record.",
    },
    {
        name: "Name the reference tone",
        text: "Give a song and artist, or describe the sound in plain language. Tonelify reads the documented signal chain behind that recording.",
    },
    {
        name: "Get the dial positions",
        text: "Tonelify returns gain, bass, mids, treble, master and presence values, a pickup position and the order of the effects, set for your equipment.",
    },
];

export default function ToneMatchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}

            <section className="bg-[#08080C] pb-28 md:pb-20">
                <div className="container max-w-3xl px-4 mx-auto border-t border-white/8 pt-10">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F2F2F7] tracking-tight">
                        How guitar tone matching works
                    </h2>
                    <p className="text-[#A6A29B] leading-relaxed mt-4">
                        Tone matching is the job of working out where to set the controls
                        on your own equipment so it lands on the same sound as a
                        recording. Four things carry a tone across rigs: the gain
                        structure, the EQ curve, the pickup position and the order of the
                        effects. A high-gain head and a small practice combo reach the
                        same voicing from very different knob positions, and calculating
                        that translation is what Tonelify does.
                    </p>
                    <p className="text-[#A6A29B] leading-relaxed mt-4">
                        Tonelify does not record, upload or analyse audio, so there is
                        nothing to install and no audio interface required. It works from
                        the documented rig behind a recording and from the gear you name,
                        which means it runs entirely on text. The settings reach the
                        amp-in-the-room version of a tone rather than the mixed and
                        mastered record, because layered takes, studio compression, mic
                        placement and mastering all sit between the amp and the released
                        file.
                    </p>

                    <ol className="mt-8 space-y-5">
                        {STEPS.map((step, i) => (
                            <li key={step.name} className="flex gap-4">
                                <span className="font-mono text-sm font-medium text-[#FFD700] shrink-0 pt-1">
                                    0{i + 1}
                                </span>
                                <div>
                                    <h3 className="font-bold text-[#F2F2F7]">{step.name}</h3>
                                    <p className="text-sm text-[#A6A29B] leading-relaxed mt-1">
                                        {step.text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <p className="text-sm text-[#A6A29B] mt-8">
                        Browsing for ideas first?{" "}
                        <Link
                            href="/explore"
                            className="inline-block py-3 font-bold text-[#F5A623] hover:text-[#FFD700] underline underline-offset-2"
                        >
                            Explore the documented tone library
                        </Link>
                    </p>
                </div>
            </section>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                { "@type": "ListItem", position: 1, name: "Tonelify", item: SITE_URL },
                                { "@type": "ListItem", position: 2, name: "Tone Match", item: `${SITE_URL}/tone-match` },
                            ],
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "HowTo",
                            name: "How to match a guitar tone to your own gear",
                            description:
                                "Translate the tone on a recording into knob settings for the amp, guitar and pickups you already own.",
                            totalTime: "PT1M",
                            supply: [
                                { "@type": "HowToSupply", name: "An electric guitar or bass" },
                                { "@type": "HowToSupply", name: "A guitar amplifier" },
                            ],
                            step: STEPS.map((s, i) => ({
                                "@type": "HowToStep",
                                position: i + 1,
                                name: s.name,
                                text: s.text,
                                url: `${SITE_URL}/tone-match`,
                            })),
                            publisher: { "@id": `${SITE_URL}/#organization` },
                        },
                    ]),
                }}
            />
        </>
    );
}
