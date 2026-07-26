import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    // The root layout appends "| Tonelify", so the brand is left off here
    title: "Pricing — Guitar Tone Matching Plans",
    description: "Free plan with three matches a month, or unlimited from $4.99 a week. Monthly and yearly plans include a 3-day free trial.",
    openGraph: {
        title: "Plans & Pricing — Tonelify",
        description: "Free to start. Unlimited tone matching from $4.99 a week.",
    },
    alternates: {
        canonical: "/plans",
    },
};
export default function PlansPage() {
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
                        {
                            "@context": "https://schema.org",
                            "@type": "Service",
                            name: "Tonelify Guitar Tone Matching",
                            serviceType: "Guitar tone matching",
                            provider: { "@type": "Organization", name: "Tonelify", url: SITE_URL },
                            areaServed: "Worldwide",
                            url: `${SITE_URL}/plans`,
                            offers: {
                                "@type": "AggregateOffer",
                                priceCurrency: "USD",
                                lowPrice: "0",
                                highPrice: "59.99",
                                offerCount: "4",
                                url: `${SITE_URL}/plans`,
                            },
                        },
                    ]),
                }}
            />
        </div>
    );
}
