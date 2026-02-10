import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings — Manage Your Account",
    description:
        "Manage your Tonelify profile, subscription, equipment presets, and account settings.",
    openGraph: {
        title: "Settings — Tonelify Account",
        description: "Manage your Tonelify profile and subscription.",
    },
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
