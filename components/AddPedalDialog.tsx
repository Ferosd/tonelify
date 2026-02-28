"use client"

import { useState, useMemo } from "react"
import { X, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    PEDALS,
    PEDAL_CATEGORY_LABELS,
    type Pedal,
    type PedalCategory,
} from "@/lib/gear-catalog"

interface AddPedalDialogProps {
    open: boolean
    onClose: () => void
    onAdd: (pedal: Pedal) => void
    addedIds?: string[]
}

type FilterType = "all" | PedalCategory

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    overdrive: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
    distortion: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
    fuzz: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-400" },
    delay: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    reverb: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400" },
    chorus: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400" },
    phaser: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400" },
    compressor: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
    wah: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    boost: { bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-700 dark:text-lime-400" },
    noise_gate: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
    eq: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    looper: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-400" },
    tuner: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
}

const QUICK_FILTERS: FilterType[] = ["all", "overdrive", "distortion", "delay", "reverb", "chorus", "fuzz", "compressor", "wah"]

export function AddPedalDialog({ open, onClose, onAdd, addedIds = [] }: AddPedalDialogProps) {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<FilterType>("all")

    const filtered = useMemo(() => {
        return PEDALS.filter(pedal => {
            const matchesSearch = search === "" ||
                pedal.name.toLowerCase().includes(search.toLowerCase()) ||
                pedal.brand.toLowerCase().includes(search.toLowerCase())
            const matchesFilter = filter === "all" || pedal.category === filter
            return matchesSearch && matchesFilter
        })
    }, [search, filter])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col mx-4"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Pedal</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search pedals..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                filter === f
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222]"
                            )}
                        >
                            {f === "all" ? "All" : PEDAL_CATEGORY_LABELS[f]}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">No pedals found</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map(pedal => {
                                const isAdded = addedIds.includes(pedal.id)
                                const catColor = CATEGORY_COLORS[pedal.category] || CATEGORY_COLORS.noise_gate
                                return (
                                    <div
                                        key={pedal.id}
                                        className={cn(
                                            "bg-white dark:bg-[#1a1a1a] border rounded-xl p-4 relative transition-all",
                                            isAdded
                                                ? "border-green-300 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/5"
                                                : "border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-800/50 hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{pedal.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{pedal.brand}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={isAdded}
                                                onClick={() => onAdd(pedal)}
                                                className={cn(
                                                    "h-9 w-9 rounded-full p-0 shrink-0 shadow-sm",
                                                    isAdded
                                                        ? "bg-green-500 text-white cursor-default"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-110 transition-transform"
                                                )}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Category badge */}
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", catColor.bg, catColor.text)}>
                                                {PEDAL_CATEGORY_LABELS[pedal.category]}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">{pedal.priceRange}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
