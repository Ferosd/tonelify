import type { Metadata } from "next";
import Link from "next/link";
import { TONE_LIBRARY } from "@/lib/tone-library";
import { SITE_URL } from "@/lib/site";
import { PRICING, PLAN_NAMES, TRIAL_DAYS, FREE_MATCHES, FREE_SAVED_TONES } from "@/lib/pricing";

export const metadata: Metadata = {
    title: "Guitar Tone Matching FAQ: How Tonelify Works",
    description:
        "How tone matching works, what Tonelify needs from your rig, which amps and guitars it covers, what the free plan includes, and where the settings come from.",
    alternates: { canonical: "/faq" },
    openGraph: {
        title: "Guitar Tone Matching FAQ | Tonelify",
        description:
            "How tone matching works, which gear it covers, and what the free plan includes.",
        url: `${SITE_URL}/faq`,
        type: "article",
    },
};

const UPDATED = "2026-07-26";

type Faq = { q: string; a: string[] };
type Group = { heading: string; id: string; faqs: Faq[] };

/**
 * Written as standalone question and answer pairs on purpose. An answer engine
 * lifts a passage without the surrounding page, so each one has to make sense
 * with nothing above it — no "as mentioned above", no pronouns pointing at the
 * previous entry.
 */
const GROUPS: Group[] = [
    {
        heading: "What Tonelify is",
        id: "what-it-is",
        faqs: [
            {
                q: "What is Tonelify?",
                a: [
                    "Tonelify is a web app that turns a recorded guitar tone into knob settings for the amp and guitar you already own. You name a song and your gear, and it returns gain, bass, mids, treble and presence values, a pickup position, and the order of the effects.",
                    "It is not a plugin, an amp modeller or an impulse response pack. Nothing is installed, and no audio passes through it.",
                ],
            },
            {
                q: "How does guitar tone matching work?",
                a: [
                    "Tone matching works backwards from the signal chain behind a recording. The documented rig for a track tells you where that sound came from: how much gain, which part of the midrange was pushed or cut, which pickup was selected, and what sat in front of the amp.",
                    "Those four things carry the character. Once you know them, you can rebuild the same voicing on different equipment by moving the controls to different positions. A boutique high-gain head and a practice combo reach the same place from very different knob settings, and working out that translation is the whole job.",
                ],
            },
            {
                q: "Does Tonelify listen to my playing or process audio?",
                a: [
                    "No. Tonelify never records, uploads or analyses audio. It works from the documented equipment behind a recording and from the gear you tell it you own, so it runs entirely on text.",
                    "That means there is nothing to install, no latency, and no audio interface required.",
                ],
            },
            {
                q: "How is this different from a tone-matching plugin?",
                a: [
                    "A plugin captures a sound and reproduces it inside your computer, which means your tone only exists while the computer is running. Tonelify gives you positions for the physical controls in front of you, so the result stays on the amp after you close the browser.",
                    "It is also the only approach that works if you play through a real amp in a room rather than into a DAW.",
                ],
            },
        ],
    },
    {
        heading: "Gear and settings",
        id: "gear",
        faqs: [
            {
                q: "Which amps and guitars does Tonelify support?",
                a: [
                    "Any amp and guitar you can name. There is no fixed device list to pick from. You type what you own, including the model, the channel and the pickup configuration, and the settings come back adapted to it.",
                    "That covers tube heads, solid-state combos, modelling amps and practice amps, along with electric guitar and bass.",
                ],
            },
            {
                q: "What do I need to enter to get a match?",
                a: [
                    "Your guitar model, your amp model, and the tone you are chasing: either a song, an artist, or a plain description of the sound. Pedals and multi-effects units are optional, and adding them changes where the gain and EQ land.",
                    "The more specific the gear entry, the tighter the result. \"Squier Affinity Strat, SSS pickups\" gives a better answer than \"Strat\".",
                ],
            },
            {
                q: "Will the settings sound exactly like the record?",
                a: [
                    "No, and no honest tool would claim otherwise. A record is a mix: layered takes, studio compression, mic placement, room, and mastering all sit between the amp and the file you hear. What you can reach is the same voicing and the same feel under the hands.",
                    "Tonelify aims at the amp-in-the-room version of the tone. The remaining distance is closed by pick attack, string gauge and playing technique, not by knob positions.",
                ],
            },
            {
                q: "Where do the original rig details come from?",
                a: [
                    "From documented sources: rig rundowns, interviews with the players and engineers, and gear databases. Tone pages describe the original equipment as reported rather than confirmed, because for older recordings the accounts sometimes disagree.",
                    "The adapted settings are then derived from that chain and from the gear you entered.",
                ],
            },
            {
                q: "Can I use Tonelify for bass?",
                a: [
                    "Yes. Bass rigs are handled the same way as guitar rigs: you name the bass and the amp, and the settings come back for the controls that amp actually has.",
                ],
            },
        ],
    },
    {
        heading: "Plans and billing",
        id: "plans",
        faqs: [
            {
                q: "Is Tonelify free?",
                a: [
                    `There is a free plan with ${FREE_MATCHES} tone matches a month and ${FREE_SAVED_TONES} saved tones, and it does not ask for a card. Every match on the free plan returns the full settings, not a preview.`,
                    `Unlimited matching starts at ${PRICING.week.price} for a week pass, or ${PRICING.month.price} a month on the ${PLAN_NAMES.player} plan.`,
                ],
            },
            {
                q: "How much does Tonelify cost?",
                a: [
                    `${PLAN_NAMES.free}: ${FREE_MATCHES} matches a month, no card. ${PLAN_NAMES.weekly}: ${PRICING.week.price} a week, unlimited matches, renews weekly, no trial. ${PLAN_NAMES.player}: ${PRICING.month.price} a month or ${PRICING.year.price} a year, which is ${PRICING.year.perMonth} a month, with a ${TRIAL_DAYS}-day free trial.`,
                    "The paid plans lift the two counters on the free plan. A match is identical either way: nothing about the answer is held back for paying accounts.",
                ],
            },
            {
                q: "Can I cancel at any time?",
                a: [
                    "Yes. Subscriptions are managed through Stripe and can be cancelled from your account settings, and cancelling stops the next renewal rather than ending access immediately, so you keep the plan until the period you already paid for runs out.",
                ],
            },
        ],
    },
];

const ALL_FAQS = GROUPS.flatMap((g) => g.faqs);

export default function FaqPage() {
    const topTones = TONE_LIBRARY.slice(0, 8);

    return (
        <div className="min-h-screen bg-[#08080C] pb-28 md:pb-20 font-sans">
            <div className="container max-w-3xl px-4 py-8 md:py-14 mx-auto space-y-10">

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <nav aria-label="Breadcrumb" className="text-xs text-[#8A8494] font-medium">
                        {/* py-2 is what lifts a 15px-tall text link to a tappable box */}
                        <Link href="/" className="inline-block py-2 hover:text-[#F5A623] transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#A6A29B]">FAQ</span>
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
                        Guitar tone matching, answered
                    </h1>
                    <p className="text-[#A6A29B] text-base md:text-lg leading-relaxed">
                        Tonelify translates a recorded guitar tone into knob settings for the amp and guitar you
                        already own. It reads the documented signal chain behind a track and works out where to
                        set the controls on different equipment to land in the same place. Below is what it does,
                        what it needs from you, and what it costs.
                    </p>
                </header>

                {/* On-page jump links. Cheap to render, and they give the page an
                    outline a crawler can read before it parses any prose. */}
                <nav aria-label="On this page" className="flex flex-wrap gap-2">
                    {GROUPS.map((g) => (
                        <a
                            key={g.id}
                            href={`#${g.id}`}
                            className="inline-flex items-center h-10 text-xs font-bold px-4 rounded-full border border-white/10 bg-white/5 text-[#A6A29B] hover:text-[#F5A623] hover:border-[#F5A623]/30 transition-colors"
                        >
                            {g.heading}
                        </a>
                    ))}
                </nav>

                {GROUPS.map((group) => (
                    <section key={group.id} id={group.id} className="space-y-4 scroll-mt-20">
                        <h2 className="font-display text-xl md:text-2xl font-bold text-[#F2F2F7]">
                            {group.heading}
                        </h2>
                        <div className="space-y-3">
                            {group.faqs.map((f) => (
                                <article
                                    key={f.q}
                                    className="bg-[#12121A] border border-white/8 rounded-2xl p-5 md:p-6 space-y-2"
                                >
                                    <h3 className="font-bold text-[#F2F2F7] text-[0.9375rem] md:text-base leading-snug">
                                        {f.q}
                                    </h3>
                                    {f.a.map((para, i) => (
                                        <p
                                            key={i}
                                            className={`text-sm leading-relaxed ${i === 0 ? "text-[#A6A29B]" : "text-[#8A8494]"}`}
                                        >
                                            {para}
                                        </p>
                                    ))}
                                </article>
                            ))}
                        </div>
                    </section>
                ))}

                <section className="space-y-4">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-[#F2F2F7]">
                        Tone settings people look up most
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {topTones.map((t) => (
                            <Link
                                key={t.id}
                                href={`/explore/${t.id}`}
                                className="bg-[#12121A] border border-white/8 rounded-xl p-4 hover:border-[#F5A623]/30 hover:-translate-y-0.5 transition-[transform,border-color] space-y-1"
                            >
                                <div className="font-bold text-sm text-[#F2F2F7] leading-tight truncate">{t.title}</div>
                                <div className="text-xs text-[#8A8494] truncate">{t.artist}</div>
                            </Link>
                        ))}
                    </div>
                    <Link href="/explore" className="inline-flex items-center min-h-11 text-sm font-bold text-[#F5A623] hover:text-[#FFD700] transition-colors">
                        Browse the full tone library →
                    </Link>
                </section>

                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Still deciding?</h2>
                    <p className="text-[#A6A29B] text-sm leading-relaxed">
                        The free plan runs three matches a month without a card, which is enough to see whether the
                        settings land on your own rig before any money changes hands.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                            href="/tone-match"
                            className="inline-flex items-center h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-colors"
                        >
                            Match a tone free
                        </Link>
                        <Link
                            href="/plans"
                            className="inline-flex items-center h-12 px-8 rounded-full border border-white/10 text-[#F2F2F7] font-bold text-sm hover:border-[#F5A623]/40 transition-colors"
                        >
                            Compare plans
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
                                { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
                            ],
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            name: "Guitar tone matching FAQ",
                            url: `${SITE_URL}/faq`,
                            dateModified: UPDATED,
                            publisher: { "@type": "Organization", name: "Tonelify", url: SITE_URL },
                            mainEntity: ALL_FAQS.map((f) => ({
                                "@type": "Question",
                                name: f.q,
                                acceptedAnswer: { "@type": "Answer", text: f.a.join(" ") },
                            })),
                        },
                    ]),
                }}
            />
        </div>
    );
}
