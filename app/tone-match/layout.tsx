import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tone Match — AI Guitar Tone Matching",
    description:
        "Match any legendary guitar tone to your specific gear. Select your amp, guitar, and pickups — get AI-powered settings in seconds.",
    openGraph: {
        title: "Tone Match — AI Guitar Tone Matching",
        description:
            "Match any legendary guitar tone to your specific gear. Get AI-powered amp settings instantly.",
    },
};

export default function ToneMatchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
