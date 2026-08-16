import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Pricing } from "@/components/Pricing";
import { SITE_URL } from "@/lib/site";
import { getReviewSummary } from "@/lib/reviews";
import { PRICING_FAQ } from "@/lib/pricing-faq";
import { isPlanConfigured } from "@/lib/stripe";

/** Where a signed-out visitor is sent instead of the price table. */
const SIGN_UP = "/sign-up?redirect_url=%2Fplans";

/**
 * Prices are behind the account now, so the metadata cannot carry them either.
 *
 * A title and description are read by crawlers, previewed in messaging apps and
 * shown in a shared link, all without anybody signing in. Leaving the old
 * "from $6.99 a month" description in place would publish the exact figure the
 * page no longer shows. The redirect also lives here rather than only in the
 * component: metadata resolves before the response streams, so a signed-out
 * request is answered with the redirect instead of a page that renders and then
 * bounces.
 */
export async function generateMetadata(): Promise<Metadata> {
    const { userId } = await auth();
    if (!userId) redirect(SIGN_UP);

    return {
        // The root layout appends "| Tonelify", so the brand is left off here
        title: "Your plan options",
        description: "Compare the Tonelify plans on your account and pick the one that fits how often you match.",
        // Behind sign-in, so there is nothing here for an index to hold.
        robots: { index: false, follow: false },
        alternates: {
            canonical: "/plans",
        },
    };
}

/**
 * Signed-in only, so it cannot be prerendered or cached across visitors any
 * more. It used to revalidate hourly to keep the review count fresh; that read
 * now happens per request, which is the same query the dashboard already runs.
 */
export const dynamic = "force-dynamic";

export default async function PlansPage() {
    const { userId } = await auth();
    if (!userId) redirect(SIGN_UP);

    // Read on the server so the rating is in the HTML for engines that never
    // run JavaScript. Emitted only when real reviews exist: the site's own
    // llms.txt states that reviews are not seeded, and a hardcoded rating
    // would make that a lie and risk the block being distrusted anyway.
    const { count, average } = await getReviewSummary();

    // Read here rather than in the component: price ids are server-only, and a
    // tier without them must not reach a visitor as a button that cannot pay.
    const stageAvailable = isPlanConfigured("stage");
    const playerAvailable = isPlanConfigured("player");

    // No page-level top padding: the Pricing section already opens with
    // py-16 md:py-24, and stacking the two put 176px of empty page between the
    // header and the trial badge on a desktop screen, which pushed the first
    // plan card below the fold on the page whose only job is to show the cards.
    return (
        <div className="min-h-screen bg-[#08080C] text-[#F2F0ED]">
            <Pricing stageAvailable={stageAvailable} playerAvailable={playerAvailable} />
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
                            // No Offer nodes. This page is signed-in only now, so
                            // the prices are not public, and structured data is
                            // published text: marking up a figure nobody can see
                            // on the page is exactly the mismatch that gets a
                            // rich result pulled, and it would republish the
                            // number the account gate is there to withhold.
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
