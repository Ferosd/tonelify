import type { Metadata } from "next";
import { ExploreContent } from "@/components/ExploreContent";
import { getLibraryArtwork } from "@/lib/artwork";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
    title: "Explore Tones — Iconic Guitar Tones Library",
    description:
        "Browse a curated library of iconic guitar tones — from Master of Puppets to Sultans of Swing — and adapt any of them to your own amp and guitar in one tap.",
    openGraph: {
        title: "Explore Tones — Tonelify",
        description:
            "Browse iconic guitar tones and adapt them to your own gear in one tap.",
    },
    alternates: {
        canonical: "/explore",
    },
};

export default async function ExplorePage() {
    const covers = await getLibraryArtwork();

    return (
        <div className="min-h-screen bg-[#08080C] pb-28 md:pb-20 font-sans">
            {/* Compact on phones so the sleeves land above the fold; full marketing
                header only where there's vertical room for it */}
            <div className="text-left md:text-center pt-4 md:pt-12 pb-4 md:pb-8 space-y-1.5 md:space-y-4 bg-[#0E0E14] border-b border-white/8 px-4 md:px-5">
                <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8712A]/10 border border-[#E8712A]/20 text-[#E8712A] text-[11px] font-bold uppercase tracking-[0.08em]">
                    Curated tone library
                </div>
                <h1 className="font-display text-[1.625rem] leading-[1.1] md:text-5xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.03em" }}>
                    Explore <span className="text-[#F5A623]">legendary tones</span>
                </h1>
                <p className="text-[#A6A29B] text-[0.875rem] md:text-lg max-w-2xl mx-auto">
                    Pick a tone, adapt it to your gear in one tap
                </p>
            </div>
            <ExploreContent covers={covers} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                            { "@type": "ListItem", position: 2, name: "Explore Tones", item: `${SITE_URL}/explore` },
                        ],
                    }),
                }}
            />
        </div>
    );
}
