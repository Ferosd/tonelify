import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide, relatedGuides, guideText } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { TRIAL_DAYS } from "@/lib/pricing";

export const revalidate = 86400;
// Fixed in-code set, so an unknown slug is a hard 404 rather than a soft one
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return GUIDES.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const guide = getGuide(slug);
    if (!guide) return {};

    const url = `${SITE_URL}/guides/${guide.id}`;
    return {
        title: guide.metaTitle,
        description: guide.description,
        alternates: { canonical: `/guides/${guide.id}` },
        openGraph: {
            title: guide.metaTitle,
            description: guide.description,
            url,
            type: "article",
            siteName: "Tonelify",
            publishedTime: guide.updated,
            modifiedTime: guide.updated,
        },
        // Without this the root layout's generic Twitter card wins and every
        // guide shares as the homepage blurb
        twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.description },
    };
}

export default async function GuidePage({ params }: Props) {
    const { slug } = await params;
    const guide = getGuide(slug);
    if (!guide) notFound();

    const related = relatedGuides(guide);
    const wordCount = guideText(guide).split(/\s+/).length;

    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <article className="container max-w-3xl px-4 py-8 md:py-12 mx-auto space-y-10">

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <nav aria-label="Breadcrumb" className="text-xs text-[#8A8494] font-medium">
                        <Link href="/guides" className="inline-block py-2 hover:text-[#F5A623] transition-colors">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#A6A29B]">{guide.title}</span>
                    </nav>
                    <span className="font-mono text-[11px] text-[#8A8494]">
                        Updated <time dateTime={guide.updated}>{guide.updated}</time> · {guide.minutes} min
                    </span>
                </div>

                <header className="space-y-5">
                    <h1
                        className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]"
                        style={{ letterSpacing: "-0.015em" }}
                    >
                        {guide.title}
                    </h1>

                    {/* The direct answer, above everything else. Roughly the first
                        third of a page is where citations come from, and a passage
                        has to make sense with nothing above it to be liftable. */}
                    <div className="bg-[#12121A] border border-[#F5A623]/20 rounded-2xl p-5 md:p-6 space-y-3">
                        {guide.answer.map((para, i) => (
                            <p
                                key={i}
                                className={`leading-relaxed ${i === 0 ? "text-[#F2F0ED] text-[1.0625rem]" : "text-[#A6A29B] text-sm"}`}
                            >
                                {para}
                            </p>
                        ))}
                    </div>
                </header>

                {/* Outline a crawler can read before it parses any prose */}
                <nav aria-label="On this page" className="flex flex-wrap gap-2">
                    {guide.sections.map((s, i) => (
                        <a
                            key={s.heading}
                            href={`#section-${i + 1}`}
                            className="inline-flex items-center h-10 text-xs font-bold px-4 rounded-full border border-white/10 bg-white/5 text-[#A6A29B] hover:text-[#F5A623] hover:border-[#F5A623]/30 transition-colors"
                        >
                            {s.heading}
                        </a>
                    ))}
                </nav>

                {guide.sections.map((section, i) => (
                    <section key={section.heading} id={`section-${i + 1}`} className="space-y-3 scroll-mt-20">
                        <h2 className="font-display text-xl md:text-2xl font-bold text-[#F2F2F7]">
                            {section.heading}
                        </h2>
                        {section.body.map((para, j) => (
                            <p key={j} className="text-[#A6A29B] leading-relaxed">
                                {para}
                            </p>
                        ))}
                    </section>
                ))}

                <section className="space-y-4">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-[#F2F2F7]">
                        Common questions
                    </h2>
                    <div className="space-y-3">
                        {guide.faqs.map((f) => (
                            <div key={f.q} className="bg-[#12121A] border border-white/8 rounded-2xl p-5 md:p-6 space-y-2">
                                <h3 className="font-bold text-[#F2F2F7] text-[0.9375rem] leading-snug">{f.q}</h3>
                                <p className="text-sm text-[#A6A29B] leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        Settings for your own amp
                    </h2>
                    <p className="text-[#A6A29B] text-sm leading-relaxed">
                        This guide covers what is true of every rig. For a specific song on a
                        specific amp, Tonelify reads the documented chain behind the recording and
                        returns gain, bass, middle, treble and presence values for the controls
                        your amp actually has. Free for {TRIAL_DAYS} days, no charge until the trial ends.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                            href="/tone-match"
                            className="inline-flex items-center h-12 px-8 rounded-full bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-sm shadow-lg shadow-[#E8712A]/20 transition-colors"
                        >
                            Match a tone free
                        </Link>
                        <Link
                            href="/gear"
                            className="inline-flex items-center h-12 px-8 rounded-full border border-white/10 text-[#F2F2F7] font-bold text-sm hover:border-[#F5A623]/40 transition-colors"
                        >
                            Find your amp
                        </Link>
                    </div>
                </section>

                {related.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Keep reading</h2>
                        <ul className="space-y-3">
                            {related.map((r) => (
                                <li key={r.id}>
                                    <Link
                                        href={`/guides/${r.id}`}
                                        className="block bg-[#12121A] border border-white/8 rounded-xl p-4 hover:border-[#F5A623]/30 transition-colors"
                                    >
                                        <span className="block font-bold text-sm text-[#F2F2F7]">{r.title}</span>
                                        <span className="block text-xs text-[#8A8494] mt-1 line-clamp-2">{r.description}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>

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
                                { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}/guides/${guide.id}` },
                            ],
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "Article",
                            headline: guide.title,
                            description: guide.description,
                            mainEntityOfPage: `${SITE_URL}/guides/${guide.id}`,
                            datePublished: guide.updated,
                            dateModified: guide.updated,
                            wordCount,
                            inLanguage: "en",
                            // Organization rather than a person: inventing a bylined
                            // author with credentials nobody can check is worse for
                            // trust than publishing under the entity that stands behind it.
                            author: { "@id": `${SITE_URL}/#organization` },
                            publisher: { "@id": `${SITE_URL}/#organization` },
                            articleSection: "Guitar tone",
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            mainEntity: guide.faqs.map((f) => ({
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
