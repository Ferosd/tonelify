import type { Metadata } from "next";
import { ExploreContent } from "@/components/ExploreContent";

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

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <div className="text-center pt-8 md:pt-12 pb-6 md:pb-8 space-y-4 bg-[#0E0E14] border-b border-white/8 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8712A]/10 text-[#E8712A] text-xs font-semibold">
                    <span>🔥</span> Curated Tone Library
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.03em" }}>
                    Explore <span className="text-[#F5A623]">legendary tones</span>
                </h1>
                <p className="text-[#8A8494] text-base md:text-lg max-w-2xl mx-auto font-light">
                    Pick an iconic tone and adapt it to your amp and guitar in one tap
                </p>
            </div>
            <ExploreContent />
        </div>
    );
}
