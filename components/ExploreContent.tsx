"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Flame, Sparkles, Search, Music, Zap, Heart } from "lucide-react"
import { TONE_LIBRARY, type LibraryTone } from "@/lib/tone-library"
import { likeLabel } from "@/lib/tone-likes"

type ToneFilter = "All" | "Clean" | "Distorted"
type PartFilter = "All" | "Riff" | "Solo"

// Deterministic amber-family gradient for cards whose cover hasn't loaded
function fallbackGradient(id: string) {
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
    const shift = (h % 40) - 20
    return `linear-gradient(135deg, hsl(${28 + shift}, 78%, 42%) 0%, hsl(${10 + shift}, 62%, 32%) 100%)`
}

function ToneCard({ tone, cover, likes = 0 }: { tone: LibraryTone; cover?: string; likes?: number }) {
    const clean = tone.tone === "Clean"
    // Null below the visibility floor, so a young library never prints "1"
    const likeCount = likeLabel({ count: likes, liked: false })
    return (
        <Link
            href={`/explore/${tone.id}`}
            className="group flex flex-col rounded-2xl border border-white/8 bg-[#12121A] overflow-hidden hover:border-[#F5A623]/40 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,166,35,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080C] transition-[transform,border-color,box-shadow] duration-300"
        >
            {/* Sleeve */}
            <div className="relative aspect-square w-full overflow-hidden" style={{ background: fallbackGradient(tone.id) }}>
                {cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={cover}
                        alt={`${tone.title} by ${tone.artist} album artwork`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <Music className="h-9 w-9 text-white/30" />
                    </div>
                )}

                {/* Scrim keeps the badges legible over any sleeve */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(6,6,9,0.88) 0%, rgba(6,6,9,0.35) 45%, transparent 100%)" }}
                />

                {likeCount && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-[#08080C]/70 text-[#E8712A] border border-[#D14B32]/40 whitespace-nowrap">
                        <Heart className="h-3 w-3" fill="currentColor" />
                        {likeCount}
                    </span>
                )}

                <span
                    className={`absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${clean
                        ? "text-[#FFD700] border-[#FFD700]/30 bg-[#08080C]/60"
                        : "text-[#F5A623] border-[#F5A623]/40 bg-[#08080C]/60"
                        }`}
                >
                    {clean ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                    {tone.tone}
                </span>
                <span className="absolute bottom-2 right-2 font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-[#08080C]/60 text-[#F2F2F7] border border-white/15 whitespace-nowrap">
                    {tone.part}
                </span>
            </div>

            {/* Meta */}
            <div className="px-3 py-3 md:px-4 md:py-4 flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="font-bold text-[0.8125rem] md:text-sm text-[#F2F2F7] leading-tight truncate" title={tone.title}>
                    {tone.title}
                </h3>
                <p className="text-[0.75rem] text-[#A6A29B] font-medium truncate">{tone.artist}</p>
                {/* Running prose, not a chip: 11px reads as "text too small"
                    on a phone, so it sits at 12px with the lighter token */}
                <p className="text-[12px] text-[#A6A29B] leading-snug line-clamp-2 mt-1">{tone.character}</p>
                <div className="hidden md:flex items-center gap-1.5 mt-auto pt-3">
                    <span className="text-[9px] font-bold text-[#8A8494] bg-white/5 border border-white/8 px-1.5 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">{tone.genre}</span>
                    <span className="text-[9px] font-bold text-[#8A8494] bg-white/5 border border-white/8 px-1.5 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">{tone.era}</span>
                </div>
            </div>
        </Link>
    )
}

/** `covers` and `likes` are resolved on the server so both are in the first paint. */
export function ExploreContent({
    covers = {},
    likes = {},
}: {
    covers?: Record<string, string>
    likes?: Record<string, number>
}) {
    const [toneFilter, setToneFilter] = useState<ToneFilter>("All")
    const [partFilter, setPartFilter] = useState<PartFilter>("All")
    const [query, setQuery] = useState("")

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return TONE_LIBRARY.filter((t) => {
            if (toneFilter !== "All" && t.tone !== toneFilter) return false
            if (partFilter !== "All" && t.part !== partFilter) return false
            if (q && !`${t.title} ${t.artist} ${t.genre}`.toLowerCase().includes(q)) return false
            return true
        })
    }, [toneFilter, partFilter, query])

    return (
        <div className="container max-w-6xl px-4 md:px-4 py-5 md:py-10 mx-auto space-y-5 md:space-y-8">
            {/* Filters */}
            <div className="space-y-3 md:space-y-0 md:flex md:gap-4 md:items-center">
                <div className="relative md:flex-1 md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8494] pointer-events-none" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search songs, artists, genres"
                        aria-label="Search tones"
                        className="w-full h-11 pl-11 pr-4 bg-[#12121A] border border-white/8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 placeholder:text-[#8A8494] transition-colors text-[#F2F0ED]"
                    />
                </div>

                {/* One scroll rail on mobile so the chips never wrap into a ragged second row */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
                    {(["All", "Clean", "Distorted"] as ToneFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setToneFilter(f)}
                            aria-pressed={toneFilter === f}
                            className={`flex-none h-10 md:h-9 px-4 rounded-full text-xs font-bold border whitespace-nowrap transition-colors ${toneFilter === f
                                ? "bg-[#F5A623] text-[#08080C] border-[#F5A623]"
                                : "bg-[#12121A] text-[#A6A29B] border-white/8 hover:text-[#F2F2F7] hover:border-[#F5A623]/30"
                                }`}
                        >
                            {f === "Distorted" && <Flame className="inline h-3 w-3 mr-1 -mt-0.5" />}
                            {f === "All" ? "All tones" : f}
                        </button>
                    ))}
                    <span aria-hidden="true" className="flex-none w-px h-10 md:h-9 bg-white/8 mx-1" />
                    {(["All", "Riff", "Solo"] as PartFilter[]).map((f) => (
                        <button
                            key={`part-${f}`}
                            onClick={() => setPartFilter(f)}
                            aria-pressed={partFilter === f}
                            className={`flex-none h-10 md:h-9 px-4 rounded-full text-xs font-bold border whitespace-nowrap transition-colors ${partFilter === f
                                ? "bg-[#E8712A] text-[#08080C] border-[#E8712A]"
                                : "bg-[#12121A] text-[#A6A29B] border-white/8 hover:text-[#F2F2F7] hover:border-[#E8712A]/30"
                                }`}
                        >
                            {f === "All" ? "All parts" : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {filtered.map((tone) => (
                        <ToneCard key={tone.id} tone={tone} cover={covers[tone.id]} likes={likes[tone.id]} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 md:py-20 space-y-4">
                    <Music className="h-9 w-9 text-[#8A8494] mx-auto" />
                    <p className="text-[#A6A29B] font-medium">Nothing in the library matches that yet.</p>
                    <Link
                        href={`/tone-match${query.trim() ? `?song=${encodeURIComponent(query.trim())}` : ""}`}
                        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm text-[#08080C]"
                        style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8712A 100%)" }}
                    >
                        Match it to your gear
                    </Link>
                </div>
            )}

            {/* Not here? CTA */}
            {filtered.length > 0 && (
                <div className="text-center pt-2 pb-6">
                    <p className="text-sm text-[#A6A29B]">
                        Don&apos;t see your song?{" "}
                        {/* The exit route out of a fruitless search, so the tap
                            area gets padding rather than a 17px line box */}
                        <Link href="/tone-match" className="inline-block py-3 font-bold text-[#F5A623] hover:text-[#FFD700] underline underline-offset-2">
                            Match any tone to your gear
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}
