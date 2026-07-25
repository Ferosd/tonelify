import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TONE_LIBRARY, getToneBySlug, getRelatedTones } from "@/lib/tone-library";
import { getArtwork } from "@/lib/artwork";

export const revalidate = 86400;
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
    const title = `${tone.title} by ${tone.artist} — Guitar Tone Settings`;
    const description = `How to get the ${tone.title} guitar tone on your own amp: ${tone.character.toLowerCase()}. Original rig, tone character, and AI-adapted settings for your exact gear.`;
    return {
        title,
        description,
        alternates: { canonical: `/explore/${tone.id}` },
        openGraph: { title, description },
    };
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
    const adaptHref = `/tone-match?song=${encodeURIComponent(tone.title)}&artist=${encodeURIComponent(tone.artist)}`;

    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <div className="container max-w-4xl px-4 py-8 md:py-12 mx-auto space-y-10">

                {/* Breadcrumb */}
                <nav className="text-xs text-[#8A8494] font-medium">
                    <Link href="/explore" className="hover:text-[#F5A623] transition-colors">Explore</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#A6A29B]">{tone.title}</span>
                </nav>

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
                        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.03em" }}>
                            {tone.title}
                        </h1>
                        <p className="text-lg text-[#A6A29B] font-medium">{tone.artist}</p>
                        <p className="text-[#8A8494] leading-relaxed">{tone.character}.</p>
                        <Link
                            href={adaptHref}
                            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-transform hover:scale-105"
                        >
                            ⚡ Adapt to My Gear
                        </Link>
                    </div>
                </div>

                {/* Original rig */}
                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">The original rig</h2>
                    <p className="text-[#A6A29B] leading-relaxed">
                        {tone.artist} reportedly recorded this with {tone.originalGear.charAt(0).toLowerCase() + tone.originalGear.slice(1)}.
                    </p>
                    <p className="text-[#8A8494] text-sm leading-relaxed">
                        You don't need that exact gear. Tonelify's AI analyzes what makes this tone work — gain structure,
                        EQ curve, pickup choice, effects — and translates it to the amp and guitar you already own.
                    </p>
                </section>

                {/* How it works */}
                <section className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Get this tone on your gear</h2>
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
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#F5A623] hover:text-[#FFD700] transition-colors"
                        >
                            Start matching — 3 free matches a month →
                        </Link>
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
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Explore Tones", item: "https://tonelify.com/explore" },
                            { "@type": "ListItem", position: 2, name: `${tone.title} — ${tone.artist}`, item: `https://tonelify.com/explore/${tone.id}` },
                        ],
                    }),
                }}
            />
        </div>
    );
}
