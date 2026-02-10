"use client"

import { Card } from "@/components/ui/card"
import { Flame, Music } from "lucide-react"

const trendingTones = [
    {
        rank: 1,
        title: "Master of Puppets",
        artist: "Metallica",
        searches: 32,
        color: "bg-yellow-400 text-white"
    },
    {
        rank: 2,
        title: "Floods",
        artist: "Pantera",
        searches: 21,
        color: "bg-slate-200 text-slate-600"
    },
    {
        rank: 3,
        title: "Enter Sandman",
        artist: "Metallica",
        searches: 16,
        color: "bg-orange-500 text-white"
    },
    {
        rank: 4,
        title: "Slow Dancing in a Burning Room",
        artist: "John Mayer",
        searches: 11,
        color: "bg-blue-600 text-white"
    },
    {
        rank: 5,
        title: "Seek & Destroy",
        artist: "Metallica",
        searches: 10,
        color: "bg-blue-500 text-white"
    }
]

export function TrendingTones() {
    return (
        <div className="w-full space-y-6 md:space-y-8 text-center mb-8 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="bg-orange-100 p-2 rounded-xl">
                        <Flame className="h-5 w-5 text-orange-600 fill-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Trending This Week</h2>
                </div>
                <p className="text-slate-400 text-sm font-medium">Most researched tones by our community</p>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-3 md:gap-4 md:flex-wrap md:justify-center md:overflow-x-visible scrollbar-hide">
                {trendingTones.map((tone) => (
                    <Card key={tone.rank} className="flex-none w-[220px] md:w-[260px] p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-slate-200 shadow-sm bg-white rounded-xl group">
                        <div className={`h-12 w-12 flex-none rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-110 ${tone.color}`}>
                            {tone.rank}
                        </div>
                        <div className="text-left overflow-hidden">
                            <h3 className="font-bold text-sm truncate text-slate-900 leading-tight mb-0.5" title={tone.title}>{tone.title}</h3>
                            <p className="text-xs text-slate-500 truncate font-medium">{tone.artist}</p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-semibold bg-slate-50 w-fit px-1.5 py-0.5 rounded-md">
                                <Music className="h-3 w-3" />
                                <span>{tone.searches} searches this week</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
