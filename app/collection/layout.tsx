import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Collection — Saved Presets, Tones & Gear",
    description: "Manage your saved presets, tones, pedals, and multi-effects in your personal collection.",
    alternates: {
        canonical: "/collection",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function CollectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
