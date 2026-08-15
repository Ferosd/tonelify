import type { Metadata } from "next";
import Link from "next/link";
import { TONE_LIBRARY, LIBRARY_UPDATED } from "@/lib/tone-library";
import { GEAR_CATALOG } from "@/lib/gear-catalog";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
    // The root layout appends "| Tonelify"
    title: "About Tonelify and How the Settings Are Produced",
    description:
        "Who publishes Tonelify, where the original rig information comes from, how settings are produced for your amp, and what the tool deliberately does not claim.",
    alternates: { canonical: "/about" },
    openGraph: {
        title: "About Tonelify | Tonelify",
        description:
            "Where the rig information comes from, how settings are produced, and what Tonelify does not claim.",
        url: `${SITE_URL}/about`,
        type: "article",
    },
};

const UPDATED = "2026-08-15";

/**
 * The trust page. Every answer engine weighs whether the publisher of a claim
 * is identifiable and whether the method behind the claim is stated, and the
 * site had neither page. It also matters more here than on most sites, because
 * the product's output is numbers a stranger is asked to trust.
 *
 * Everything on this page is checkable against the product. Nothing about the
 * company that cannot be verified from outside is asserted.
 */
const SECTIONS: { heading: string; id: string; body: string[] }[] = [
    {
        heading: "What Tonelify is",
        id: "what",
        body: [
            "Tonelify is a web app that turns a recorded guitar tone into knob settings for the amp and guitar you already own. You name a song and your gear, and it returns gain, bass, middle, treble and presence values, a pickup position, and the order of the effects.",
            "It is not a plugin, an amp modeller or an impulse response pack. Nothing is installed, no audio is recorded, uploaded or analysed, and no audio interface is required. The whole product runs on text: the documented rig behind a recording, and the rig you say you own.",
        ],
    },
    {
        heading: "Where the original rig information comes from",
        id: "sources",
        body: [
            "Rig rundowns, interviews with the players and the engineers who recorded them, manufacturer documentation, album credits and gear databases. For older recordings these accounts sometimes disagree, which is why tone pages describe the original equipment as reported rather than confirmed.",
            "Provenance shown alongside a match names the kind of source and what it established rather than linking to a URL, unless a person entered and checked that URL by hand. A language model will produce a plausible-looking citation that leads nowhere, and a reader who clicks a dead link trusts everything else on the page less. Showing no link is the smaller cost.",
        ],
    },
    {
        heading: "How settings are produced for your own rig",
        id: "method",
        body: [
            "Four things carry a guitar tone from one rig to another: the gain structure, the EQ curve, the pickup position and the order of the effects. All four translate onto other equipment, which is the reason this works at all.",
            "What does not translate is the knob positions. Tone stacks are voiced around different frequencies and sit at different points in different circuits, so a 6 on one amp is not a 6 on another. The job is to work out where your amp has to sit to land where the original landed.",
            `Where an amp's front panel is documented, that panel is part of the input, so a setting is never returned for a control the unit does not have. ${GEAR_CATALOG.filter((g) => g.controls?.length).length} of the ${GEAR_CATALOG.length} catalog entries currently carry a verified control list. Entries without one are marked absent rather than guessed, because a wrong control list is worse than no control list.`,
        ],
    },
    {
        heading: "What Tonelify does not claim",
        id: "limits",
        body: [
            "That the settings will make you sound exactly like the record. A record is a mix: layered takes, microphone choice and placement, studio compression and mastering all sit between the amp in the room and the released file, and no knob position reproduces any of them.",
            "That the reference starting points published on tone pages are the settings the artist used. They are positions on a generic five-knob amp, stated as a starting point, and they are labelled that way everywhere they appear.",
            "That reviews on the site are anything other than what they are. Reviews come from signed-in accounts and are not seeded, and the aggregate rating in the page markup is generated from the same rows the page displays rather than written by hand.",
        ],
    },
    {
        heading: "What is on the site",
        id: "content",
        body: [
            `A tone library of ${TONE_LIBRARY.length} documented tones, each with the reported original rig, a reference starting point and the questions players ask about it. Last reviewed ${LIBRARY_UPDATED}.`,
            `A gear catalog of ${GEAR_CATALOG.length} amps, guitars, basses, pedals and modellers, each with its own page.`,
            `${GUIDES.length} guides covering the parts of guitar tone that are the same on every rig: how to EQ an amp, what each control does, pedal order, pickups and why a home rig does not sound like a record.`,
            "Machine-readable exports at /llms.txt and /llms-full.txt, carrying the same facts as the pages and regenerated from the same sources, so the two cannot disagree.",
        ],
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#08080C] pb-28 md:pb-20 font-sans">
            <div className="container max-w-3xl px-4 py-8 md:py-14 mx-auto space-y-10">

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <nav aria-label="Breadcrumb" className="text-xs text-[#8A8494] font-medium">
                        <Link href="/" className="inline-block py-2 hover:text-[#F5A623] transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#A6A29B]">About</span>
                    </nav>
                    <span className="font-mono text-[11px] text-[#8A8494]">
                        Updated <time dateTime={UPDATED}>{UPDATED}</time>
                    </span>
                </div>

                <header className="space-y-4">
                    <h1
                        className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]"
                        style={{ letterSpacing: "-0.015em" }}
                    >
                        About Tonelify
                    </h1>
                    <p className="text-[#F2F0ED] text-base md:text-lg leading-relaxed">
                        Tonelify translates a recorded guitar tone into knob settings for the amp and
                        guitar you already own. This page covers who publishes it, where the
                        information behind a match comes from, how the settings are produced, and
                        which claims the tool deliberately does not make.
                    </p>
                </header>

                <nav aria-label="On this page" className="flex flex-wrap gap-2">
                    {SECTIONS.map((s) => (
                        <a
                            key={s.id}
                            href={`#${s.id}`}
                            className="inline-flex items-center h-10 text-xs font-bold px-4 rounded-full border border-white/10 bg-white/5 text-[#A6A29B] hover:text-[#F5A623] hover:border-[#F5A623]/30 transition-colors"
                        >
                            {s.heading}
                        </a>
                    ))}
                </nav>

                {SECTIONS.map((section) => (
                    <section key={section.id} id={section.id} className="space-y-3 scroll-mt-20">
                        <h2 className="font-display text-xl md:text-2xl font-bold text-[#F2F2F7]">
                            {section.heading}
                        </h2>
                        {section.body.map((para, i) => (
                            <p key={i} className="text-[#A6A29B] leading-relaxed">
                                {para}
                            </p>
                        ))}
                    </section>
                ))}

                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Contact</h2>
                    <p className="text-[#A6A29B] text-sm leading-relaxed">
                        Corrections to a tone page, gear you want added, or anything that looks
                        wrong: <a href="mailto:contact@tonelify.com" className="font-bold text-[#F5A623] hover:text-[#FFD700] transition-colors">contact@tonelify.com</a>.
                        Gear requests can also go through the request form, which is the faster route.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                            href="/request-gear"
                            className="inline-flex items-center h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-colors"
                        >
                            Request gear
                        </Link>
                        <Link
                            href="/faq"
                            className="inline-flex items-center h-12 px-8 rounded-full border border-white/10 text-[#F2F2F7] font-bold text-sm hover:border-[#F5A623]/40 transition-colors"
                        >
                            Read the FAQ
                        </Link>
                    </div>
                </section>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                                { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
                            ],
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "AboutPage",
                            "@id": `${SITE_URL}/about`,
                            url: `${SITE_URL}/about`,
                            name: "About Tonelify",
                            dateModified: UPDATED,
                            inLanguage: "en",
                            isPartOf: { "@id": `${SITE_URL}/#website` },
                            // Points the trust page at the sitewide entity rather than
                            // describing a second, unrelated Organization
                            mainEntity: { "@id": `${SITE_URL}/#organization` },
                            publisher: { "@id": `${SITE_URL}/#organization` },
                        },
                    ]),
                }}
            />
        </div>
    );
}
