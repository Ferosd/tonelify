import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, GUIDES_UPDATED } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
    // The root layout appends "| Tonelify"
    title: "Guitar Tone Guides: EQ, Gain, Pedals and Pickups",
    description:
        "Plain answers to the questions players actually ask about guitar tone: how to EQ an amp, what each knob does, pedal order, scooped mids, and why your rig doesn't sound like the record.",
    alternates: { canonical: "/guides" },
    openGraph: {
        title: "Guitar Tone Guides | Tonelify",
        description:
            "How to EQ an amp, what each control does, pedal order, and why your rig doesn't sound like the record.",
        url: `${SITE_URL}/guides`,
        type: "website",
    },
};

export default function GuidesIndexPage() {
    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <div className="container max-w-4xl px-4 py-8 md:py-12 mx-auto space-y-10">

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <nav aria-label="Breadcrumb" className="text-xs text-[#8A8494] font-medium">
                        <Link href="/" className="inline-block py-2 hover:text-[#F5A623] transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#A6A29B]">Guides</span>
                    </nav>
                    <span className="font-mono text-[11px] text-[#8A8494]">
                        Updated <time dateTime={GUIDES_UPDATED}>{GUIDES_UPDATED}</time>
                    </span>
                </div>

                <header className="space-y-4">
                    <h1
                        className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]"
                        style={{ letterSpacing: "-0.015em" }}
                    >
                        Guitar tone, explained properly
                    </h1>
                    <p className="text-[#A6A29B] text-base md:text-lg leading-relaxed max-w-2xl">
                        The parts of getting a good sound that are the same on every rig: what each
                        control does, how to set an EQ, where pedals go, and which parts of a
                        recorded tone you can reach at home. No gear you have to buy, and no
                        pretending the last ten percent is reachable when it is not.
                    </p>
                </header>

                <ul className="space-y-3">
                    {GUIDES.map((guide) => (
                        <li key={guide.id}>
                            <Link
                                href={`/guides/${guide.id}`}
                                className="block bg-[#12121A] border border-white/8 rounded-2xl p-5 md:p-6 space-y-2 hover:border-[#F5A623]/30 transition-colors"
                            >
                                <div className="flex items-baseline justify-between gap-4">
                                    <h2 className="font-display text-lg md:text-xl font-bold text-[#F2F2F7] leading-snug">
                                        {guide.title}
                                    </h2>
                                    <span className="font-mono text-[11px] text-[#8A8494] shrink-0">
                                        {guide.minutes} min
                                    </span>
                                </div>
                                {/* The first line of the answer, not a teaser. A crawler
                                    that never opens the guide still gets the answer. */}
                                <p className="text-sm text-[#A6A29B] leading-relaxed">{guide.answer[0]}</p>
                            </Link>
                        </li>
                    ))}
                </ul>

                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        When the general advice runs out
                    </h2>
                    <p className="text-[#A6A29B] text-sm leading-relaxed">
                        Everything in these guides is true of every amp. What none of it can tell you
                        is where to set the controls for one specific song on one specific rig,
                        because the same target lands at different positions on different amps.
                        Tonelify does that part: name the song and the gear you own, and it returns
                        the values for the controls your amp actually has.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                            href="/tone-match"
                            className="inline-flex items-center h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-colors"
                        >
                            Match a tone free
                        </Link>
                        <Link
                            href="/explore"
                            className="inline-flex items-center h-12 px-8 rounded-full border border-white/10 text-[#F2F2F7] font-bold text-sm hover:border-[#F5A623]/40 transition-colors"
                        >
                            Browse the tone library
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
                                { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
                            ],
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "CollectionPage",
                            "@id": `${SITE_URL}/guides`,
                            name: "Guitar tone guides",
                            url: `${SITE_URL}/guides`,
                            isPartOf: { "@id": `${SITE_URL}/#website` },
                            publisher: { "@id": `${SITE_URL}/#organization` },
                            mainEntity: {
                                "@type": "ItemList",
                                numberOfItems: GUIDES.length,
                                itemListElement: GUIDES.map((g, i) => ({
                                    "@type": "ListItem",
                                    position: i + 1,
                                    url: `${SITE_URL}/guides/${g.id}`,
                                    name: g.title,
                                })),
                            },
                        },
                    ]),
                }}
            />
        </div>
    );
}
