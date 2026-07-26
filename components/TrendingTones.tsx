"use client"

import { Flame, Music } from "lucide-react"

const trendingTones = [
    { rank: 1, title: "Master of Puppets",              artist: "Metallica",  searches: 32 },
    { rank: 2, title: "Floods",                         artist: "Pantera",    searches: 21 },
    { rank: 3, title: "Enter Sandman",                  artist: "Metallica",  searches: 16 },
    { rank: 4, title: "Slow Dancing in a Burning Room", artist: "John Mayer", searches: 11 },
    { rank: 5, title: "Seek & Destroy",                 artist: "Metallica",  searches: 10 },
]

// Rank 1 glows gold, the rest fade down the amber scale
const rankColors = [
    "text-[#FFD700] border-[#FFD700]/40 bg-[#FFD700]/10",
    "text-[#F5A623] border-[#F5A623]/30 bg-[#F5A623]/8",
    "text-[#E8712A] border-[#E8712A]/30 bg-[#E8712A]/8",
    "text-[#A6A29B] border-white/10 bg-white/5",
    "text-[#A6A29B] border-white/10 bg-white/5",
]

export function TrendingTones({ onSelect }: { onSelect?: (title: string, artist: string) => void }) {
    return (
        <div className="w-full space-y-3 md:space-y-8 text-left md:text-center mb-6 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1 md:space-y-2 flex flex-col md:items-center">
                <div className="flex items-center gap-2 md:justify-center md:mb-1">
                    <div className="bg-[#E8712A]/10 border border-[#E8712A]/20 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                        <Flame className="h-4 w-4 md:h-5 md:w-5 text-[#F5A623] fill-[#F5A623]" />
                    </div>
                    <h2 className="font-display text-base md:text-xl font-bold text-[#F2F2F7]">Trending this week</h2>
                </div>
                <p className="text-[#A6A29B] text-[0.8125rem] md:text-sm font-medium">Most researched tones right now</p>
            </div>

            {/* Edge-to-edge rail on mobile: cards snap, and the last one clears the viewport edge.
                The negative margin has to match the parent's phone padding, which is px-3.
                At -mx-4 the rail hung 4px past each edge and the whole page scrolled
                sideways on every phone width. */}
            <div className="flex overflow-x-auto pb-2 gap-3 md:gap-4 -mx-3 px-3 snap-x snap-mandatory md:mx-0 md:px-0 md:flex-wrap md:justify-center md:overflow-x-visible md:snap-none scrollbar-hide">
                {trendingTones.map((tone, i) => (
                    <button
                        key={tone.rank}
                        type="button"
                        onClick={() => onSelect?.(tone.title, tone.artist)}
                        className="flex-none snap-start w-[236px] md:w-[260px] p-3 md:p-4 flex items-center gap-3 md:gap-4 rounded-xl border border-white/8 bg-[#12121A]/80 backdrop-blur-md hover:border-[#F5A623]/30 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(245,166,35,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080C] transition-[transform,border-color,box-shadow] cursor-pointer group text-left"
                    >
                        <div className={`h-11 w-11 md:h-12 md:w-12 flex-none rounded-xl border flex items-center justify-center font-mono font-bold text-lg transition-transform group-hover:scale-110 ${rankColors[i]}`}>
                            {tone.rank}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm truncate text-[#F2F2F7] leading-tight mb-0.5" title={tone.title}>{tone.title}</h3>
                            <p className="text-xs text-[#A6A29B] truncate font-medium">{tone.artist}</p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-[#A6A29B] font-mono bg-white/5 border border-white/5 w-fit px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                <Music className="h-3 w-3 flex-none" />
                                <span>{tone.searches} this week</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
