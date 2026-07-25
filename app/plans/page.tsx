import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";

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
        </div>
    );
}
