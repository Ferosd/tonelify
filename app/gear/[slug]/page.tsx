import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    GEAR_CATALOG,
    GEAR_TYPE_LABELS,
    getGearById,
    gearLabel,
    type GearEntry,
} from "@/lib/gear-catalog";
import { leadParagraph, panelParagraph, gearFaqs, tonesFor } from "@/lib/gear-copy";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;
// The catalog is a fixed in-code list, so an unknown slug is a hard 404
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return GEAR_CATALOG.map((g) => ({ slug: g.id }));
}

function isAmp(entry: GearEntry) {
    return entry.type === "amp" || entry.type === "bass-amp";
}

/**
 * The question this page exists to answer, phrased the way it gets typed into
 * a search box. Used as the h1 and as the title, so the page and the result
 * that leads to it say the same thing.
 */
function pageQuestion(entry: GearEntry): string {
    const label = gearLabel(entry);
    if (isAmp(entry)) return `${label} settings`;
    if (entry.type === "pedal") return `${label} settings`;
    if (entry.type === "multifx") return `${label} presets and settings`;
    return `${label} tone settings`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const entry = getGearById(slug);
    if (!entry) return {};

    const label = gearLabel(entry);
    const description = isAmp(entry)
        ? `Dial in any recorded guitar tone on a ${label}. Get gain, EQ and channel settings translated to this amp's actual controls.`
        : `Match any recorded guitar tone using a ${label}. Get settings adapted to the gear you already own.`;

    return {
        // The root layout appends "| Tonelify"
        title: pageQuestion(entry),
        description,
        alternates: { canonical: `/gear/${entry.id}` },
        openGraph: { title: `${pageQuestion(entry)} | Tonelify`, description },
    };
}

export default async function GearPage({ params }: Props) {
    const { slug } = await params;
    const entry = getGearById(slug);
    if (!entry) notFound();

    const label = gearLabel(entry);
    const typeLabel = GEAR_TYPE_LABELS[entry.type];
    const matchHref = `/tone-match?${isAmp(entry) ? "amp" : "guitar"}=${encodeURIComponent(label)}`;

    // Tones ordered by what suits this gear, not the first six in the library.
    // No claim is made that these were recorded on it: the product's premise is
    // the opposite, that the tone gets translated onto whatever the reader owns.
    const starters = tonesFor(entry);
    const faqs = gearFaqs(entry);
    // Written from this row's own panel, so two amps in the same family stop
    // reading as one page with the model name swapped.
    const panel = panelParagraph(entry);

    // Stored facts, in one list, used both on the page and in the Product
    // block. Only the fields this entry actually has: an empty row would be
    // the same padding the near-duplicate problem was made of.
    const specs: { name: string; value: string }[] = [
        entry.power && { name: "Power", value: entry.power },
        entry.speaker && { name: "Speaker", value: entry.speaker },
        entry.scale && { name: "Scale length", value: entry.scale },
        entry.construction && { name: "Construction", value: entry.construction },
        entry.bridge && { name: "Bridge", value: entry.bridge },
        entry.pickups && { name: "Pickup layout", value: entry.pickups },
        entry.switching && { name: "Controls", value: entry.switching },
        entry.channels?.length && { name: "Channels", value: entry.channels.join(", ") },
        entry.voicings?.length && { name: "Voicings", value: entry.voicings.join(", ") },
        entry.controls?.length && { name: "Front panel", value: entry.controls.join(", ") },
    ].filter((s): s is { name: string; value: string } => Boolean(s));

    const related = GEAR_CATALOG.filter(
        (g) => g.id !== entry.id && g.type === entry.type && g.brand === entry.brand
    ).slice(0, 4);

    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <div className="container max-w-4xl px-4 py-8 md:py-12 mx-auto space-y-10">

                <nav className="text-xs text-[#8A8494] font-medium">
                    <Link href="/gear" className="inline-block py-2 hover:text-[#F5A623] transition-colors">Gear</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#A6A29B]">{label}</span>
                </nav>

                <header className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#08080C] bg-[#F5A623] px-3 py-1.5 rounded-full">
                            {typeLabel}
                        </span>
                        {entry.category && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A6A29B] bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
                                {entry.category}
                            </span>
                        )}
                    </div>
                    <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.015em" }}>
                        {pageQuestion(entry)}
                    </h1>
                    {entry.note && <p className="text-lg text-[#A6A29B] leading-relaxed">{entry.note}</p>}
                    <Link
                        href={matchHref}
                        className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-transform hover:scale-105"
                    >
                        ⚡ Match a tone on this {isAmp(entry) ? "amp" : "gear"}
                    </Link>
                </header>

                {/* Front-loaded answer, self-contained enough to be quoted on its own */}
                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        How do you dial in a specific tone on a {label}?
                    </h2>
                    {/* Family-specific, so a valve head, a modelling combo and a
                        fuzz pedal do not open with the same paragraph. 123 pages
                        sharing one lead is what gets a section classified as
                        near-duplicate and dropped rather than ranked. */}
                    <p className="text-[#F2F0ED] leading-relaxed">{leadParagraph(entry)}</p>
                    <p className="text-[#A6A29B] text-sm leading-relaxed">
                        Name the song you are chasing and Tonelify returns the settings for this
                        exact {typeLabel.toLowerCase()}, not the settings the original artist used.
                        Those are two different things: the recording was made on gear most players
                        do not own.
                    </p>
                    {entry.controls?.length ? (
                        <p className="text-[#8A8494] text-sm leading-relaxed">
                            Settings for this {isAmp(entry) ? "amp" : "unit"} only ever use controls it
                            actually has, because its front panel is stored in our gear database. You will
                            not be told to set a knob that is not on the {isAmp(entry) ? "amp" : "unit"}.
                        </p>
                    ) : null}
                </section>

                {entry.controls?.length ? (
                    <section className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                            What controls does the {label} have?
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {entry.controls.map((c) => (
                                <span key={c} className="font-mono text-xs text-[#FFD700] bg-[#F5A623]/10 border border-[#F5A623]/20 px-3 py-2 rounded-lg">
                                    {c}
                                </span>
                            ))}
                        </div>
                        {/* Channels and voicings used to be repeated here as
                            sentences. They are rows in the specifications table
                            below now, so saying them twice was just length. */}
                    </section>
                ) : null}

                {specs.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                            {label} specifications
                        </h2>
                        {/* A table an engine can lift a single fact out of, which
                            is what gets a page cited: "what scale length is a
                            Player Mustang" has one answer and it is on this row. */}
                        <dl className="grid sm:grid-cols-2 gap-px bg-white/8 border border-white/8 rounded-2xl overflow-hidden">
                            {specs.map(({ name, value }) => (
                                <div key={name} className="bg-[#12121A] px-5 py-4">
                                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A8494]">{name}</dt>
                                    <dd className="text-sm text-[#F2F0ED] mt-1 leading-relaxed">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                )}

                {panel && (
                    <section className="space-y-3">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                            What the {label} panel means when you dial it in
                        </h2>
                        <p className="text-[#A6A29B] leading-relaxed">{panel}</p>
                    </section>
                )}

                {entry.pickups && (
                    <section className="space-y-3">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                            What pickups does the {label} have?
                        </h2>
                        <p className="text-[#A6A29B] leading-relaxed">
                            A {entry.pickups} layout. Pickup output and position change how hard the front
                            of an amp is driven, which is why the same song needs different gain settings on
                            this guitar than on one with the opposite layout. Tonelify accounts for that when
                            it writes the numbers.
                        </p>
                    </section>
                )}

                <section className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        Tones to try on a {label}
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {starters.map((tone) => (
                            // min-w-0: same grid-item default as the list on /gear,
                            // where a long title sized the column instead of the page.
                            <li key={tone.id} className="min-w-0">
                                {/* Points at the tone page rather than straight into
                                    the matcher: /explore is indexable and the gear
                                    pages were previously a dead end for crawlers. */}
                                <Link
                                    href={`/explore/${tone.id}`}
                                    className="flex items-center justify-between gap-3 min-h-14 px-4 rounded-xl bg-[#12121A] border border-white/8 hover:border-[#F5A623]/40 transition-colors"
                                >
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-[#F2F0ED] truncate">{tone.title}</span>
                                        <span className="block text-xs text-[#8A8494] truncate">{tone.artist}</span>
                                    </span>
                                    <span className="text-[#F5A623] shrink-0">→</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Self-contained question and answer pairs. The gear pages had
                    no FAQ at all, which left 123 URLs with nothing an engine
                    could lift as a direct answer. */}
                <section className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        {label} questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((f) => (
                            <div key={f.q} className="bg-[#12121A] border border-white/8 rounded-2xl p-5 md:p-6 space-y-2">
                                <h3 className="font-bold text-[#F2F2F7] text-[0.9375rem] leading-snug">{f.q}</h3>
                                <p className="text-sm text-[#A6A29B] leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {related.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">More {entry.brand} gear</h2>
                        <div className="flex flex-wrap gap-2">
                            {related.map((g) => (
                                <Link
                                    key={g.id}
                                    href={`/gear/${g.id}`}
                                    className="inline-flex items-center min-h-11 px-4 rounded-full bg-[#12121A] border border-white/8 text-sm text-[#A6A29B] hover:text-[#F5A623] hover:border-[#F5A623]/40 transition-colors"
                                >
                                    {gearLabel(g)}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify([
                            {
                                "@context": "https://schema.org",
                                "@type": "BreadcrumbList",
                                itemListElement: [
                                    { "@type": "ListItem", position: 1, name: "Tonelify", item: SITE_URL },
                                    { "@type": "ListItem", position: 2, name: "Gear", item: `${SITE_URL}/gear` },
                                    { "@type": "ListItem", position: 3, name: label, item: `${SITE_URL}/gear/${entry.id}` },
                                ],
                            },
                            {
                                "@context": "https://schema.org",
                                "@type": "Product",
                                name: label,
                                brand: { "@type": "Brand", name: entry.brand },
                                category: entry.category ?? typeLabel,
                                ...(entry.note ? { description: entry.note } : {}),
                                url: `${SITE_URL}/gear/${entry.id}`,
                                // The stored facts as machine-readable properties.
                                // This is the one thing this page knows that a
                                // retailer listing does not state as data, and it is
                                // the reason to cite it. Same list the page renders,
                                // so the markup can never describe a table that is
                                // not there.
                                ...(specs.length
                                    ? {
                                        additionalProperty: specs.map((s) => ({
                                            "@type": "PropertyValue",
                                            name: s.name,
                                            value: s.value,
                                        })),
                                    }
                                    : {}),
                            },
                            {
                                "@context": "https://schema.org",
                                "@type": "FAQPage",
                                mainEntity: faqs.map((f) => ({
                                    "@type": "Question",
                                    name: f.q,
                                    acceptedAnswer: { "@type": "Answer", text: f.a },
                                })),
                            },
                        ]),
                    }}
                />
            </div>
        </div>
    );
}
