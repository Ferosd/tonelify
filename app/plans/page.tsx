import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";
import { SITE_URL } from "@/lib/site";
import { getReviewSummary } from "@/lib/reviews";
import { PRICING_FAQ } from "@/lib/pricing-faq";
import { PRICING, PLAN_NAMES, TRIAL_DAYS, STAGE_MATCHES, STAGE_SAVED_TONES } from "@/lib/pricing";
import { isPlanConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
    // The root layout appends "| Tonelify", so the brand is left off here
    title: "Pricing: Guitar Tone Matching Plans",
    description: `Two plans, monthly or yearly. ${PLAN_NAMES.stage} from ${PRICING.stage.month.price} a month, unlimited matching on ${PLAN_NAMES.player} from ${PRICING.month.price} a month. Both start with a ${TRIAL_DAYS}-day free trial.`,
    openGraph: {
        title: "Plans & Pricing | Tonelify",
        description: `Unlimited guitar tone matching from ${PRICING.month.price} a month, with a ${TRIAL_DAYS}-day free trial.`,
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

    // Read here rather than in the component: price ids are server-only, and a
    // tier without them must not reach a visitor as a button that cannot pay.
    const stageAvailable = isPlanConfigured("stage");

    return (
        <div className="pt-10 md:pt-20 min-h-screen bg-[#08080C] text-[#F2F0ED]">
            <Pricing stageAvailable={stageAvailable} />
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
                            // Offers mirror the cards exactly, Stage included only
                            // when it is actually on sale. An engine quoting a
                            // tier a visitor cannot buy is the same failure as a
                            // button that cannot pay.
                            offers: [
                                ...(stageAvailable
                                    ? [
                                        {
                                            "@type": "Offer", name: `${PLAN_NAMES.stage} (Monthly)`, price: PRICING.stage.month.amount.toFixed(2), priceCurrency: "USD",
                                            description: `${STAGE_MATCHES} tone matches and ${STAGE_SAVED_TONES} saved tones a month, ${TRIAL_DAYS}-day free trial`,
                                            url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                        },
                                        {
                                            "@type": "Offer", name: `${PLAN_NAMES.stage} (Yearly)`, price: PRICING.stage.year.amount.toFixed(2), priceCurrency: "USD",
                                            description: `${STAGE_MATCHES} tone matches and ${STAGE_SAVED_TONES} saved tones a month billed yearly, ${TRIAL_DAYS}-day free trial`,
                                            url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                        },
                                    ]
                                    : []),
                                {
                                    "@type": "Offer", name: `${PLAN_NAMES.player} (Monthly)`, price: PRICING.month.amount.toFixed(2), priceCurrency: "USD",
                                    description: `Unlimited matches and saved tones, ${TRIAL_DAYS}-day free trial`,
                                    url: `${SITE_URL}/plans`, availability: "https://schema.org/InStock",
                                },
                                {
                                    "@type": "Offer", name: `${PLAN_NAMES.player} (Yearly)`, price: PRICING.year.amount.toFixed(2), priceCurrency: "USD",
                                    description: `Unlimited matches and saved tones billed yearly, ${TRIAL_DAYS}-day free trial`,
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
