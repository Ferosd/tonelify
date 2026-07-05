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
        <div className="w-full space-y-6 md:space-y-8 text-center mb-8 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="bg-[#E8712A]/10 border border-[#E8712A]/20 p-2 rounded-xl">
                        <Flame className="h-5 w-5 text-[#F5A623] fill-[#F5A623]" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-[#F2F2F7]">Trending This Week</h2>
                </div>
                <p className="text-[#8A8494] text-sm font-medium">Most researched tones by our community</p>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-3 md:gap-4 md:flex-wrap md:justify-center md:overflow-x-visible scrollbar-hide">
                {trendingTones.map((tone, i) => (
                    <div
                        key={tone.rank}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect?.(tone.title, tone.artist)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(tone.title, tone.artist) } }}
                        className="flex-none w-[220px] md:w-[260px] p-3 md:p-4 flex items-center gap-3 md:gap-4 rounded-xl border border-white/8 bg-[#12121A]/80 backdrop-blur-md hover:border-[#F5A623]/30 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(245,166,35,0.08)] transition-[transform,border-color,box-shadow] cursor-pointer group"
                    >
                        <div className={`h-12 w-12 flex-none rounded-xl border flex items-center justify-center font-mono font-bold text-lg transition-transform group-hover:scale-110 ${rankColors[i]}`}>
                            {tone.rank}
                        </div>
                        <div className="text-left overflow-hidden">
                            <h3 className="font-bold text-sm truncate text-[#F2F2F7] leading-tight mb-0.5" title={tone.title}>{tone.title}</h3>
                            <p className="text-xs text-[#8A8494] truncate font-medium">{tone.artist}</p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-[#A6A29B] font-mono bg-white/5 border border-white/5 w-fit px-1.5 py-0.5 rounded-md">
                                <Music className="h-3 w-3" />
                                <span>{tone.searches} searches this week</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
