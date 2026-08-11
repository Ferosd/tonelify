import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";
import { SITE_URL } from "@/lib/site";
import { getReviewSummary } from "@/lib/reviews";
import { PRICING_FAQ } from "@/lib/pricing-faq";

export const metadata: Metadata = {
    // The root layout appends "| Tonelify", so the brand is left off here
    title: "Pricing: Guitar Tone Matching Plans",
    description: "Free plan with three matches a month, or unlimited from $4.99 a week. Monthly and yearly plans include a 3-day free trial.",
    openGraph: {
        title: "Plans & Pricing | Tonelify",
        description: "Free to start. Unlimited tone matching from $4.99 a week.",
    },
    alternates: {
        canonical: "/plans",
    },
};
/**
 * The page is otherwise fully static, which would freeze the review count into
 * the build. An hour is short enough that the rating in the markup tracks the
 * real table and long enough that this stays a cached render.
 */
export const revalidate = 3600;

export default async function PlansPage() {
    // Read on the server so the rating is in the HTML for engines that never
    // run JavaScript. Emitted only when real reviews exist: the site's own
    // llms.txt states that reviews are not seeded, and a hardcoded rating
    // would make that a lie and risk the block being distrusted anyway.
    const { count, average } = await getReviewSummary();

    return (
        <div className="pt-10 md:pt-20 min-h-screen bg-[#08080C] text-[#F2F0ED]">
            <Pricing />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                                { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/plans` },
                            ],
                        },
                        // This is the canonical pricing page, so it carries the
                        // richer markup: four discrete Offers rather than the
                        // AggregateOffer price range that used to sit here. An
                        // engine answering "how much does Tonelify cost" was
                        // getting a worse answer from /plans than from the
                        // homepage, which models the same product as a
                        // SoftwareApplication with a per-tier breakdown.
                        {
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            name: "Tonelify",
                            applicationCategory: "MusicApplication",
                            operatingSystem: "Web",
                            description:
                                "Tone matching that adapts recorded guitar tones to the amp, guitar and pickups you already own.",
                            url: SITE_URL,
                            publisher: { "@id": `${SITE_URL}/#organization` },
                            ...(count > 0
                                ? {
                                    aggregateRating: {
                                        "@type": "AggregateRating",
                                        ratingValue: average.toFixed(1),
                                        reviewCount: count,
                                        bestRating: "5",
                                        worstRating: "1",
                                    },
                                }
                                : {}),
                            offers: [
                                {
                                    "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD",
                                    description: "3 tone matches a month and 3 saved tones, no card required",
                                    url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                },
                                {
                                    "@type": "Offer", name: "Week Pass", price: "4.99", priceCurrency: "USD",
                                    description: "Unlimited matches for a week, renews weekly, no trial",
                                    url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                },
                                {
                                    "@type": "Offer", name: "Player (Monthly)", price: "12.99", priceCurrency: "USD",
                                    description: "Unlimited matches and saved tones, 3-day free trial",
                                    url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                },
                                {
                                    "@type": "Offer", name: "Player (Yearly)", price: "59.99", priceCurrency: "USD",
                                    description: "Unlimited matches and saved tones billed yearly, 3-day free trial",
                                    url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                },
                            ],
                        },
                        // The billing questions people actually ask before
                        // paying. Same source as the accordion on the page, so
                        // the markup can never describe a page that isn't there.
                        {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            mainEntity: PRICING_FAQ.map((f) => ({
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
