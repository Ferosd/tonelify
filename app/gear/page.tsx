import type { Metadata } from "next";
import Link from "next/link";
import {
    GEAR_CATALOG,
    GEAR_TYPE_LABELS,
    gearLabel,
    type GearType,
} from "@/lib/gear-catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
    // The root layout appends "| Tonelify"
    title: "Guitar and Amp Settings by Gear",
    description:
        "Find your amp, guitar, pedal or modeller and get any recorded tone translated to the controls it actually has.",
    alternates: { canonical: "/gear" },
    openGraph: {
        title: "Guitar and Amp Settings by Gear | Tonelify",
        description:
            "Find your rig and get any recorded tone translated to the controls it actually has.",
    },
};

// Order the sections the way a player thinks about a signal chain
const SECTIONS: GearType[] = ["amp", "guitar", "multifx", "pedal", "bass", "bass-amp"];

export default function GearIndexPage() {
    const withPanel = GEAR_CATALOG.filter((g) => g.controls?.length).length;

    return (
        <div className="min-h-screen bg-[#08080C] pb-24 md:pb-20 font-sans">
            <div className="container max-w-5xl px-4 py-8 md:py-12 mx-auto space-y-12">

                <header className="space-y-4">
                    <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F2F2F7]" style={{ letterSpacing: "-0.015em" }}>
                        Settings for your gear
                    </h1>
                    <p className="text-lg text-[#A6A29B] leading-relaxed max-w-2xl">
                        Pick the amp or guitar you own. Every tone match is written for the controls
                        that rig actually has, so you are never told to set a knob that is not on
                        the front panel.
                    </p>
                    <p className="text-sm text-[#8A8494] leading-relaxed max-w-2xl">
                        {GEAR_CATALOG.length} entries, {withPanel} of them with a documented control
                        layout. Gear that is not listed still works: type it into the tone matcher
                        and the settings come back the same way.
                    </p>
                </header>

                {SECTIONS.map((type) => {
                    const items = GEAR_CATALOG.filter((g) => g.type === type);
                    if (items.length === 0) return null;
                    return (
                        <section key={type} className="space-y-4">
                            <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                                {GEAR_TYPE_LABELS[type]}
                            </h2>
                            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {items.map((entry) => (
                                    <li key={entry.id}>
                                        <Link
                                            href={`/gear/${entry.id}`}
                                            className="flex items-center justify-between gap-3 min-h-14 px-4 rounded-xl bg-[#12121A] border border-white/8 hover:border-[#F5A623]/40 transition-colors"
                                        >
                                            <span className="min-w-0">
                                                <span className="block text-sm font-semibold text-[#F2F0ED] truncate">
                                                    {gearLabel(entry)}
                                                </span>
                                                <span className="block text-xs text-[#8A8494] truncate">
                                                    {[entry.category, entry.pickups].filter(Boolean).join(" · ")}
                                                </span>
                                            </span>
                                            {entry.controls?.length ? (
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#FFD700]">
                                                    Panel known
                                                </span>
                                            ) : null}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}

                <section className="bg-[#12121A] border border-white/8 rounded-2xl p-6 md:p-8 space-y-3">
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">
                        Cannot find your gear?
                    </h2>
                    <p className="text-[#A6A29B] leading-relaxed">
                        Nothing here is a gate. Type any make and model into the tone matcher and you
                        get the same settings back. This list only exists so the common rigs come with
                        their real control layout attached.
                    </p>
                    <Link
                        href="/request-gear"
                        className="inline-flex items-center min-h-11 text-sm font-semibold text-[#F5A623] hover:text-[#FFD700] transition-colors"
                    >
                        Ask us to add yours →
                    </Link>
                </section>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                { "@type": "ListItem", position: 1, name: "Tonelify", item: SITE_URL },
                                { "@type": "ListItem", position: 2, name: "Gear", item: `${SITE_URL}/gear` },
                            ],
                        }),
                    }}
                />
            </div>
        </div>
    );
}
