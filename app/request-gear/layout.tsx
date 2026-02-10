import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Request Gear — Suggest New Equipment",
    description:
        "Can't find your guitar, amp, or pedal? Request it and we'll add it to the Tonelify database.",
    openGraph: {
        title: "Request Gear — Tonelify",
        description:
            "Suggest new guitars, amps, and pedals to add to Tonelify.",
    },
};

export default function RequestGearLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
