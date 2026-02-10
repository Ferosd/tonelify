import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";

export const metadata: Metadata = {
    title: "Plans & Pricing — Start Your Free Trial",
    description: "Choose your Tonelify plan. 7-day free trial included. Match unlimited guitar tones with AI-powered gear adaptation.",
    openGraph: {
        title: "Plans & Pricing — Tonelify",
        description: "Choose your plan and start matching legendary guitar tones today. 7-day free trial included.",
    },
};
export default function PlansPage() {
    return (
        <div className="pt-10 md:pt-20 min-h-screen bg-background text-foreground">
            <Pricing />
        </div>
    );
}
