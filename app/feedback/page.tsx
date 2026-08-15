import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "@/components/FeedbackForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    title: "Send Feedback",
    description:
        "Tell Tonelify what is broken, what is missing, or what could work better. Every message goes to the person who builds it.",
    alternates: { canonical: "/feedback" },
    openGraph: {
        title: "Send Feedback | Tonelify",
        description: "Report a bug, request a feature, or tell us what could work better.",
    },
};

export default function FeedbackPage() {
    return (
        <div className="min-h-screen bg-[#08080C] pb-28 md:pb-20 font-sans">
            <div className="container max-w-2xl px-4 py-8 md:py-14 mx-auto space-y-8">
                <div className="space-y-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8712A]/10 border border-[#E8712A]/20 text-[#E8712A] text-[11px] font-bold uppercase tracking-[0.08em]">
                        Send feedback
                    </span>
                    <h1
                        className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F2F2F7]"
                        style={{ letterSpacing: "-0.015em" }}
                    >
                        Tell us what to fix
                    </h1>
                    <p className="text-[#A6A29B] leading-relaxed">
                        Tonelify is small enough that one person reads every message. If a tone is wrong,
                        an amp is missing from the catalog, or something on the site does not work the way
                        it should, this is the fastest way to get it changed.
                    </p>
                </div>

                <FeedbackForm />

                <p className="text-sm text-[#8A8494] leading-relaxed border-t border-white/8 pt-6">
                    Looking for a piece of gear that is not in the catalog?{" "}
                    <Link
                        href="/request-gear"
                        className="inline-block py-2 font-bold text-[#F5A623] hover:text-[#FFD700] underline underline-offset-2"
                    >
                        Request it here
                    </Link>{" "}
                    instead, so it lands in the right queue.
                </p>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        name: "Send Feedback",
                        url: `${SITE_URL}/feedback`,
                        description:
                            "Report a bug, request a feature, or tell Tonelify what could work better.",
                        isPartOf: { "@id": `${SITE_URL}/#website` },
                    }),
                }}
            />
        </div>
    );
}
