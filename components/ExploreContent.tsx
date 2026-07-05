"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Flame, Sparkles, Search, Music, Guitar as GuitarIcon, Zap } from "lucide-react"
import { TONE_LIBRARY, type LibraryTone } from "@/lib/tone-library"

const COVER_CACHE_KEY = "exploreCovers.v1"

type ToneFilter = "All" | "Clean" | "Distorted"
type PartFilter = "All" | "Riff" | "Solo"

// Deterministic amber-family gradient for cards whose cover hasn't loaded
function fallbackGradient(id: string) {
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
    const shift = (h % 40) - 20
    return `linear-gradient(135deg, hsl(${28 + shift}, 78%, 42%) 0%, hsl(${10 + shift}, 62%, 32%) 100%)`
}

function ToneCard({ tone, cover }: { tone: LibraryTone; cover?: string }) {
    return (
        <Link
            href={`/explore/${tone.id}`}
            className="group flex flex-col rounded-2xl border border-white/8 bg-[#12121A]/80 backdrop-blur-md overflow-hidden hover:border-[#F5A623]/40 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,166,35,0.12)] transition-[transform,border-color,box-shadow]"
        >
            {/* Cover */}
            <div className="relative aspect-square w-full overflow-hidden" style={{ background: fallbackGradient(tone.id) }}>
                {cover ? (
                    <img
                        src={cover}
                        alt={`${tone.title} by ${tone.artist} album art`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <Music className="h-10 w-10 text-white/40" />
                    </div>
                )}
                <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md border ${tone.tone === "Clean"
                    ? "bg-[#08080C]/70 text-[#FFD700] border-[#FFD700]/30"
                    : "bg-[#08080C]/70 text-[#E8712A] border-[#E8712A]/40"
                    }`}>
                    {tone.tone === "Clean" ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                    {tone.tone}
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full bg-[#08080C]/70 text-[#F2F2F7] border border-white/15 backdrop-blur-md">
                    {tone.part}
                </span>
            </div>

            {/* Meta */}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
                <h3 className="font-bold text-sm text-[#F2F2F7] leading-tight truncate" title={tone.title}>{tone.title}</h3>
                <p className="text-xs text-[#8A8494] font-medium truncate">{tone.artist}</p>
                <p className="text-[11px] text-[#A6A29B] leading-snug line-clamp-2 mt-1">{tone.character}</p>
                <div className="flex items-center gap-1.5 mt-auto pt-3">
                    <span className="text-[9px] font-bold text-[#8A8494] bg-white/5 border border-white/8 px-1.5 py-0.5 rounded uppercase tracking-wide">{tone.genre}</span>
                    <span className="text-[9px] font-bold text-[#8A8494] bg-white/5 border border-white/8 px-1.5 py-0.5 rounded uppercase tracking-wide">{tone.era}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                    <GuitarIcon className="h-3.5 w-3.5" />
                    View tone →
                </div>
            </div>
        </Link>
    )
}

export function ExploreContent() {
    const [covers, setCovers] = useState<Record<string, string>>({})
    const [toneFilter, setToneFilter] = useState<ToneFilter>("All")
    const [partFilter, setPartFilter] = useState<PartFilter>("All")
    const [query, setQuery] = useState("")

    // Resolve album covers via the cached search API; persist in localStorage
    useEffect(() => {
        let cancelled = false
        const cached: Record<string, string> = (() => {
            try { return JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || "{}") } catch { return {} }
        })()
        setCovers(cached)

        const missing = TONE_LIBRARY.filter((t) => !cached[t.id])
        if (missing.length === 0) return

        async function load() {
            const next = { ...cached }
            for (const tone of missing) {
                if (cancelled) return
                try {
                    const res = await fetch(`/api/search-song?q=${encodeURIComponent(`${tone.title} ${tone.artist}`)}`)
                    if (!res.ok) continue
                    const data = await res.json()
                    const art = Array.isArray(data) ? data[0]?.artworkUrl : null
                    if (art) {
                        next[tone.id] = String(art).replace("60x60", "400x400")
                        if (!cancelled) setCovers({ ...next })
                    }
                } catch {
                    // Card falls back to gradient artwork
                }
            }
            try { localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(next)) } catch { }
        }
        load()
        return () => { cancelled = true }
    }, [])

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
        <div className="container max-w-6xl px-3 md:px-4 py-6 md:py-10 mx-auto space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8494]" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search songs, artists, genres..."
                        className="w-full h-11 pl-11 pr-4 bg-[#12121A] border border-white/8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 placeholder:text-[#8A8494] transition-colors text-[#F2F0ED]"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {(["All", "Clean", "Distorted"] as ToneFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setToneFilter(f)}
                            className={`h-9 px-4 rounded-full text-xs font-bold border transition-colors ${toneFilter === f
                                ? "bg-[#F5A623] text-[#08080C] border-[#F5A623]"
                                : "bg-[#12121A] text-[#8A8494] border-white/8 hover:text-[#F2F2F7] hover:border-[#F5A623]/30"
                                }`}
                        >
                            {f === "Distorted" && <Flame className="inline h-3 w-3 mr-1 -mt-0.5" />}
                            {f}
                        </button>
                    ))}
                    <span className="w-px h-9 bg-white/8 hidden md:block" />
                    {(["All", "Riff", "Solo"] as PartFilter[]).map((f) => (
                        <button
                            key={`part-${f}`}
                            onClick={() => setPartFilter(f)}
                            className={`h-9 px-4 rounded-full text-xs font-bold border transition-colors ${partFilter === f
                                ? "bg-[#E8712A] text-[#08080C] border-[#E8712A]"
                                : "bg-[#12121A] text-[#8A8494] border-white/8 hover:text-[#F2F2F7] hover:border-[#E8712A]/30"
                                }`}
                        >
                            {f === "All" ? "All Parts" : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {filtered.map((tone) => (
                        <ToneCard key={tone.id} tone={tone} cover={covers[tone.id]} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 space-y-3">
                    <Music className="h-10 w-10 text-[#8A8494] mx-auto" />
                    <p className="text-[#8A8494] font-medium">No tones match that search.</p>
                </div>
            )}

            {/* Not here? CTA */}
            <div className="text-center pt-4 pb-8">
                <p className="text-sm text-[#8A8494]">
                    Don't see your song?{" "}
                    <Link href="/tone-match" className="font-bold text-[#F5A623] hover:text-[#FFD700] underline underline-offset-2">
                        Research any tone with AI →
                    </Link>
                </p>
            </div>
        </div>
    )
}
