"use client"

import { useState, useMemo } from "react"
import { X, Search, Plus, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    MULTI_FX_UNITS,
    MULTI_FX_TYPE_LABELS,
    MULTI_FX_TYPE_COLORS,
    type MultiFxUnit,
    type MultiFxType,
} from "@/lib/gear-catalog"

interface AddMultiFxDialogProps {
    open: boolean
    onClose: () => void
    onAdd: (unit: MultiFxUnit) => void
    addedIds?: string[]
}

type FilterType = "all" | MultiFxType

export function AddMultiFxDialog({ open, onClose, onAdd, addedIds = [] }: AddMultiFxDialogProps) {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<FilterType>("all")

    const filters: { id: FilterType; label: string; color: string }[] = [
        { id: "all", label: "All Types", color: "bg-blue-600 text-white" },
        { id: "effects_only", label: "Effects Only", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        { id: "amp_modeler", label: "Amp Modeler", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
        { id: "amp_effects", label: "Amp + Effects", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    ]

    const filtered = useMemo(() => {
        return MULTI_FX_UNITS.filter(unit => {
            const matchesSearch = search === "" ||
                unit.name.toLowerCase().includes(search.toLowerCase()) ||
                unit.brand.toLowerCase().includes(search.toLowerCase())
            const matchesFilter = filter === "all" || unit.type === filter
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
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col mx-4"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Multi FX Unit</h2>
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
                            placeholder="Search multi FX units..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                filter === f.id
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222]"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">No units found</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map(unit => {
                                const isAdded = addedIds.includes(unit.id)
                                const typeColor = MULTI_FX_TYPE_COLORS[unit.type]
                                return (
                                    <div
                                        key={unit.id}
                                        className={cn(
                                            "bg-white dark:bg-[#1a1a1a] border rounded-xl p-4 relative transition-all",
                                            isAdded
                                                ? "border-green-300 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/5"
                                                : "border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-800/50 hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{unit.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{unit.brand}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={isAdded}
                                                onClick={() => onAdd(unit)}
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

                                        {/* Type badges */}
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1", typeColor.bg, typeColor.text)}>
                                                {unit.type !== "effects_only" && <Volume2 className="h-3 w-3" />}
                                                {MULTI_FX_TYPE_LABELS[unit.type]}
                                            </span>
                                            {unit.features.map(f => (
                                                <span key={f} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Price */}
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">{unit.priceRange}</p>

                                        {/* Amps info */}
                                        {unit.amps && (
                                            <p className="text-xs text-slate-400 mt-1 truncate">
                                                Amps: {unit.amps} {unit.ampsCount && unit.ampsCount > 3 && <span className="text-blue-500 font-medium">+{unit.ampsCount - 3} more</span>}
                                            </p>
                                        )}
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
