import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TONE_LIBRARY, getToneBySlug, getRelatedTones, LIBRARY_UPDATED, type LibraryTone } from "@/lib/tone-library";
import { getArtwork } from "@/lib/artwork";
import { SITE_URL } from "@/lib/site";
import { confirmationLine } from "@/lib/tone-feedback";
import { getFeedbackCounts } from "@/lib/tone-feedback-server";
import { PRICING, FREE_MATCHES } from "@/lib/pricing";

// Six hours. The page content is a fixed library entry, but the confirmation
// count under the title moves, and a day-old number reads as a stale page.
export const revalidate = 21600;
// The library is a fixed in-code list — unknown slugs should be hard 404s, not soft ones
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return TONE_LIBRARY.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const tone = getToneBySlug(slug);
    if (!tone) return {};
    const title = `${tone.title} by ${tone.artist}: Guitar Tone Settings`;
    const description = `How to get the ${tone.title} guitar tone on your own amp: ${tone.character.toLowerCase()}. Original rig, tone character, and AI-adapted settings for your exact gear.`;
    const url = `${SITE_URL}/explore/${tone.id}`;
    const artwork = await getArtwork(tone.title, tone.artist);
    const images = artwork ? [artwork] : ["/og-image.png"];

    return {
        title,
        description,
        alternates: { canonical: `/explore/${tone.id}` },
        openGraph: { title, description, url, type: "article", siteName: "Tonelify", images },
        // Without this the root layout's generic Twitter tags win, so every one
        // of the 24 pages shared as the homepage blurb
        twitter: { card: "summary_large_image", title, description, images },
    };
}

/**
 * A genre-specific sentence so the 24 pages do not read as one template with
 * the nouns swapped. Keyed on data already in the library, and each line states
 * only what is true of that style in general, not invented detail about the take.
 */
function toneShape(tone: LibraryTone): string {
    const byGenre: Record<string, string> = {
        "Thrash Metal": "Tones in this style live or die on tight low end and a scooped midrange, with the picking hand doing as much of the work as the amp.",
        "Groove Metal": "The character here comes from a hard upper-midrange attack and a fast note decay, which is why solid-state rigs suit it better than most players expect.",
        "Metalcore": "Modern high-gain sits on a tighter low end than vintage crunch, so the gain control matters less than where the bass and the noise gate sit.",
        "Metal": "The weight comes from layered takes and controlled low end rather than from raw gain, which is the part most players overshoot.",
        "Metal Ballad": "Clean tones at this level depend on headroom and modulation width, not on gain, so the amp needs room before it starts to break up.",
        "Alt Metal": "Detuned parts need the bass control pulled back further than feels right, or the low strings turn to mud as soon as the gain rises.",
        "Hard Rock": "This is a mid-forward sound rather than a scooped one, and it usually sits closer to the edge of breakup than to full saturation.",
        "Rock": "Much of this character comes from an amp worked hard rather than from a pedal, so master volume and pickup output matter more than the gain knob.",
        "Prog Rock": "Sustain and ambience carry these parts, so the delay and modulation settings shape the sound as much as the amp does.",
        "Psychedelic Rock": "The snarl comes from a fuzz circuit interacting with a cranked amp, which is why fuzz into a clean channel rarely gets there on its own.",
        "Blues Rock": "This lives right on the edge of breakup, where the volume knob on the guitar does the real work between clean and dirty.",
        "Alt Rock": "The sound depends on compression and pick attack more than on gain, so a lightly driven amp with the tone rolled back gets closer than a high-gain setting.",
        "Grunge": "The point here is a raw, barely controlled tone, so cleaning it up too much moves it away from the record rather than towards it.",
        "Instrumental Rock": "Smooth legato leads need sustain without harshness, which usually means moderate gain into a bright amp rather than maximum saturation.",
    };
    return byGenre[tone.genre] ?? "The balance between gain, midrange and pickup position defines this sound more than any single piece of equipment.";
}

/**
 * Every answer is derived from the tone library, so these stay true for all 24
 * pages without anyone hand-writing (or inventing) copy per song.
 */
function faqs(tone: LibraryTone) {
    const gear = tone.originalGear.charAt(0).toLowerCase() + tone.originalGear.slice(1);
    return [
        {
            q: `What amp settings do you need for ${tone.title}?`,
            a: `There is no single set of numbers, because the settings depend on the amp in front of you. A high-gain head and a small solid-state combo reach the same ${tone.character.toLowerCase()} in different positions. Tonelify takes your amp and guitar and returns the gain, bass, mids, treble and presence values for that specific rig.`,
        },
        {
            q: `Can you get the ${tone.title} tone without the original gear?`,
            a: `Yes. The original was tracked with ${gear}, but the parts that define the sound are the gain structure, the EQ curve, the pickup position and the effects order. Those translate to other equipment, which is what the adaptation step does.`,
        },
        {
            q: `Is ${tone.title} a rhythm or a lead tone?`,
            a: `It is a ${tone.part.toLowerCase()} part with a ${tone.tone.toLowerCase()} character, from ${tone.artist}'s ${tone.era} ${tone.genre.toLowerCase()} catalogue.`,
        },
        {
            q: `Does Tonelify cost anything to try?`,
            a: `No. The free plan includes ${FREE_MATCHES} tone matches a month and does not ask for a card. Unlimited matching starts at ${PRICING.week.price} for a week pass, or ${PRICING.month.price} a month.`,
        },
    ];
}

const badge = (text: string, accent = false) => (
    <span
        key={text}
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${accent
            ? "text-[#E8712A] bg-[#E8712A]/10 border-[#E8712A]/30"
            : "text-[#A6A29B] bg-white/5 border-white/10"
            }`}
    >
        {text}
    </span>
);

export default async function ToneDetailPage({ params }: Props) {
    const { slug } = await params;
    const tone = getToneBySlug(slug);
    if (!tone) notFound();

    const [artwork, related] = [await getArtwork(tone.title, tone.artist), getRelatedTones(tone)];
    // Real players reporting whether the settings held up. Nothing else on this
    // page is unique to Tonelify: the rig history is documented all over the
    // web, but this number exists nowhere else, which is exactly what an answer
    // engine has a reason to cite.
    const confirmations = confirmationLine(await getFeedbackCounts(tone.title, tone.artist));
    const adaptHref = `/tone-match?song=${encodeURIComponent(tone.title)}&artist=${encodeURIComponent(tone.artist)}`;

    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <div className="container max-w-4xl px-4 py-8 md:py-12 mx-auto space-y-10">

                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <nav className="text-xs text-[#8A8494] font-medium">
                        {/* py-2 is what lifts a 15px-tall text link to a tappable box */}
                        <Link href="/explore" className="inline-block py-2 hover:text-[#F5A623] transition-colors">Explore</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#A6A29B]">{tone.title}</span>
                    </nav>
                    <span className="font-mono text-[11px] text-[#8A8494]">
                        Reviewed <time dateTime={LIBRARY_UPDATED}>{LIBRARY_UPDATED}</time>
                    </span>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start">
                    <div
                        className="w-40 h-40 md:w-52 md:h-52 shrink-0 rounded-2xl overflow-hidden border border-white/8 shadow-xl"
                        style={{ background: "linear-gradient(135deg, #E8712A 0%, #D14B32 100%)" }}
                    >
                        {artwork && (
                            <img src={artwork} alt={`${tone.title} by ${tone.artist} album artwork`} className="h-full w-full object-cover" />
                        )}
                    </div>
                    <div className="space-y-4 min-w-0">
                        <div className="flex flex-wrap gap-2">
                            {badge(tone.tone, true)}
                            {badge(tone.part)}
                            {badge(tone.genre)}
                            {badge(tone.era)}
                        </div>
                        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.015em" }}>
                            {tone.title}
                        </h1>
                        <p className="text-lg text-[#A6A29B] font-medium">{tone.artist}</p>
                        <p className="text-[#8A8494] leading-relaxed">{tone.character}.</p>
                        {confirmations && (
                            <p className="text-sm font-semibold text-[#FFD700]">
                                {confirmations}
                            </p>
                        )}
                        <Link
                            href={adaptHref}
                            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-transform hover:scale-105"
                        >
                            ⚡ Adapt to My Gear
                        </Link>
                    </div>
                </div>

                {/* Front-loaded answer. Roughly 44% of AI citations come from the
                    first third of a page, so the self-contained summary sits here. */}
                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        What is the {tone.title} guitar tone?
                    </h2>
                    <p className="text-[#F2F0ED] leading-relaxed">
                        The {tone.title} guitar tone is {tone.character.charAt(0).toLowerCase() + tone.character.slice(1)},
                        heard on {tone.artist}&apos;s {tone.era} {tone.genre.toLowerCase()} recording. It is
                        a {tone.tone.toLowerCase()} {tone.part.toLowerCase()} tone, and {tone.artist} reportedly
                        tracked it with {tone.originalGear.charAt(0).toLowerCase() + tone.originalGear.slice(1)}.
                        {" "}{toneShape(tone)}
                    </p>
                    <p className="text-[#8A8494] text-sm leading-relaxed">
                        You do not need that exact gear to land in the same place. What carries this sound is the
                        gain structure, the EQ curve, the pickup choice and the order of the effects, and all four
                        can be rebuilt on equipment that costs a fraction of the original. The numbers change from
                        amp to amp, because a {tone.tone === "Clean" ? "clean channel on a modelling combo" : "high-gain head"} and
                        a small practice amp reach the same voicing from different knob positions. That translation
                        is what Tonelify works out for the rig you actually own.
                    </p>
                </section>

                {/* Original rig */}
                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        What gear did {tone.artist} use on {tone.title}?
                    </h2>
                    <p className="text-[#A6A29B] leading-relaxed">
                        {tone.originalGear}.
                    </p>
                    <p className="text-[#8A8494] text-sm leading-relaxed">
                        Tonelify reads that chain and translates it to the amp and guitar you already own, returning
                        gain, bass, mids, treble and presence values along with a pickup position.
                    </p>
                </section>

                {/* How it works */}
                <section className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        How do you get the {tone.title} tone on your own amp?
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {[
                            { step: "1", text: "Tell us your guitar, amp, and pedals" },
                            { step: "2", text: `AI researches the original ${tone.title} tone` },
                            { step: "3", text: "Get exact knob settings adapted to your rig" },
                        ].map((s) => (
                            <div key={s.step} className="bg-[#12121A] border border-white/8 rounded-2xl p-5 space-y-2">
                                <div className="h-8 w-8 rounded-lg bg-[#E8712A]/10 text-[#E8712A] flex items-center justify-center font-bold text-sm">{s.step}</div>
                                <p className="text-sm text-[#A6A29B] leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2">
                        <Link
                            href={adaptHref}
                            className="inline-flex items-center gap-2 min-h-11 text-sm font-bold text-[#F5A623] hover:text-[#FFD700] transition-colors"
                        >
                            Start matching, 3 free matches a month →
                        </Link>
                    </div>
                </section>

                {/* FAQ — self-contained question and answer pairs, built only from
                    library data so nothing here is invented */}
                <section className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        {tone.title} tone questions
                    </h2>
                    <div className="space-y-3">
                        {faqs(tone).map((f) => (
                            <div key={f.q} className="bg-[#12121A] border border-white/8 rounded-2xl p-5 md:p-6 space-y-2">
                                <h3 className="font-bold text-[#F2F2F7] text-[0.9375rem] leading-snug">{f.q}</h3>
                                <p className="text-sm text-[#A6A29B] leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related tones */}
                {related.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Related tones</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {related.map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/explore/${r.id}`}
                                    className="bg-[#12121A] border border-white/8 rounded-xl p-4 hover:border-[#F5A623]/30 hover:-translate-y-0.5 transition-[transform,border-color] space-y-1"
                                >
                                    <div className="font-bold text-sm text-[#F2F2F7] leading-tight truncate">{r.title}</div>
                                    <div className="text-xs text-[#8A8494] truncate">{r.artist}</div>
                                    <div className="text-[10px] font-bold text-[#E8712A] uppercase tracking-wide pt-1">{r.tone} · {r.part}</div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                { "@type": "ListItem", position: 1, name: "Explore Tones", item: `${SITE_URL}/explore` },
                                { "@type": "ListItem", position: 2, name: `${tone.title} by ${tone.artist}`, item: `${SITE_URL}/explore/${tone.id}` },
                            ],
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "Article",
                            headline: `${tone.title} guitar tone: original rig and amp settings`,
                            description: `How to get the ${tone.title} guitar tone by ${tone.artist} on your own amp and guitar.`,
                            about: { "@type": "MusicRecording", name: tone.title, byArtist: { "@type": "MusicGroup", name: tone.artist } },
                            mainEntityOfPage: `${SITE_URL}/explore/${tone.id}`,
                            publisher: { "@type": "Organization", name: "Tonelify", url: SITE_URL },
                            datePublished: "2026-07-05",
                            dateModified: LIBRARY_UPDATED,
                            ...(artwork ? { image: artwork } : {}),
                            author: { "@type": "Organization", name: "Tonelify", url: SITE_URL },
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            mainEntity: faqs(tone).map((f) => ({
                                "@type": "Question",
                                name: f.q,
                                acceptedAnswer: { "@type": "Answer", text: f.a },
                            })),
                        },
                    ]),
                }}
            />
        </div>
    );
}
