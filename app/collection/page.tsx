"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Music, Cpu, SlidersHorizontal, Plus, Sparkles, Trash2, Loader2, Guitar, Speaker, ChevronDown, ChevronUp, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { AddMultiFxDialog } from "@/components/AddMultiFxDialog"
import { AddPedalDialog } from "@/components/AddPedalDialog"
import { type MultiFxUnit, type Pedal, MULTI_FX_TYPE_LABELS, MULTI_FX_TYPE_COLORS, PEDAL_CATEGORY_LABELS } from "@/lib/gear-catalog"

// ───────────── Tab definitions ─────────────

type TabId = "presets" | "tones" | "multifx" | "pedals"

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
    badge?: number
}

// ───────────── Data interfaces ─────────────

interface SavedTone {
    id: string
    song_id: string | null
    settings: any
    created_at: string
    songs?: { title: string; artist: string } | null
}

interface Equipment {
    id: string
    name: string
    guitar_model: string | null
    amp_model: string | null
    pickup_type: string | null
    created_at: string
}

// ───────────── Empty state config ─────────────

interface EmptyStateConfig {
    icon: React.ReactNode
    iconBg: string
    title: string
    description: string
    buttonText: string
    buttonHref?: string
    buttonStyle: string
    sectionTitle?: string
    sectionSubtitle?: string
}

const emptyStates: Record<TabId, EmptyStateConfig> = {
    presets: {
        icon: <Settings className="h-8 w-8 text-blue-500" />,
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        title: "No Saved Presets Yet",
        description: "Save your favorite guitar and amp combinations for instant access during tone matching.",
        buttonText: "Go to Tone Match",
        buttonHref: "/tone-match",
        buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    tones: {
        icon: <Music className="h-8 w-8 text-purple-500" />,
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        title: "No Saved Tones Yet",
        description: "Match a tone and save it to your collection for quick reference anytime.",
        buttonText: "Match a Tone",
        buttonHref: "/tone-match",
        buttonStyle: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white",
    },
    multifx: {
        icon: <Cpu className="h-8 w-8 text-slate-500 dark:text-slate-400" />,
        iconBg: "bg-slate-100 dark:bg-slate-800",
        title: "No multi FX units yet",
        description: "Add your multi FX processor (like Boss ME-80, Line 6 Helix, etc.) to get preset recommendations",
        buttonText: "+ Add Your Multi FX Unit",
        buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
        sectionTitle: "My Multi FX Units",
        sectionSubtitle: "Manage your multi FX processors for tone matching",
    },
    pedals: {
        icon: <SlidersHorizontal className="h-8 w-8 text-slate-500 dark:text-slate-400" />,
        iconBg: "bg-slate-100 dark:bg-slate-800",
        title: "No pedals yet",
        description: "Add pedals to your collection to get better tone matching results",
        buttonText: "+ Add Your First Pedal",
        buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
        sectionTitle: "My Pedals",
        sectionSubtitle: "Manage your pedal collection for tone matching",
    },
}

// ───────────── Tone Card Component ─────────────

function ToneCard({ tone, onDelete }: { tone: SavedTone; onDelete: (id: string) => void }) {
    const [expanded, setExpanded] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const songTitle = tone.songs?.title || "Unknown Song"
    const artist = tone.songs?.artist || "Unknown Artist"
    const settings = tone.settings || {}
    const confidence = settings.confidenceScore
    const date = new Date(tone.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    })

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/tone-match/${tone.id}`, { method: "DELETE" })
            if (res.ok) onDelete(tone.id)
        } catch (e) {
            console.error(e)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Card Header */}
            <div className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{songTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{artist}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {confidence && (
                        <span className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-full",
                            confidence >= 80 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                confidence >= 50 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                                    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        )}>
                            {confidence}%
                        </span>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">{date}</span>
                </div>
            </div>

            {/* Expand/Collapse */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222] transition-colors"
            >
                <span>{expanded ? "Hide Settings" : "View Settings"}</span>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 border-t border-slate-100 dark:border-white/5 space-y-4">
                            {/* Explanation */}
                            {settings.explanation && (
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{settings.explanation}</p>
                                </div>
                            )}

                            {/* Guitar Settings */}
                            {settings.suggestedSettings?.guitar && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Guitar className="h-3.5 w-3.5" /> Guitar
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(settings.suggestedSettings.guitar).map(([key, val]: [string, any]) => (
                                            <div key={key} className="bg-slate-50 dark:bg-[#222] rounded-lg p-3 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{String(val)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Amp Settings */}
                            {settings.suggestedSettings?.amp && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Speaker className="h-3.5 w-3.5" /> Amplifier
                                    </h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {Object.entries(settings.suggestedSettings.amp).map(([key, val]: [string, any]) => (
                                            <div key={key} className="bg-slate-50 dark:bg-[#222] rounded-lg p-3 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{String(val)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pedals */}
                            {settings.suggestedSettings?.pedals?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <SlidersHorizontal className="h-3.5 w-3.5" /> Pedals
                                    </h4>
                                    <div className="space-y-2">
                                        {settings.suggestedSettings.pedals.map((pedal: any, i: number) => (
                                            <div key={i} className="bg-slate-50 dark:bg-[#222] rounded-lg p-3 flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pedal.name}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{pedal.settings}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Delete Button */}
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium"
                                >
                                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ───────────── Main Component ─────────────

export default function CollectionPage() {
    const [activeTab, setActiveTab] = useState<TabId>("tones")
    const [tones, setTones] = useState<SavedTone[]>([])
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)

    // Multi FX & Pedals state (localStorage persisted)
    const [userMultiFx, setUserMultiFx] = useState<MultiFxUnit[]>([])
    const [userPedals, setUserPedals] = useState<Pedal[]>([])
    const [showAddMultiFx, setShowAddMultiFx] = useState(false)
    const [showAddPedal, setShowAddPedal] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedFx = localStorage.getItem("tonelify_multifx")
            const savedPedals = localStorage.getItem("tonelify_pedals")
            if (savedFx) setUserMultiFx(JSON.parse(savedFx))
            if (savedPedals) setUserPedals(JSON.parse(savedPedals))
        } catch (e) { console.error(e) }
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("tonelify_multifx", JSON.stringify(userMultiFx))
    }, [userMultiFx])
    useEffect(() => {
        localStorage.setItem("tonelify_pedals", JSON.stringify(userPedals))
    }, [userPedals])

    const handleAddMultiFx = (unit: MultiFxUnit) => {
        if (!userMultiFx.find(u => u.id === unit.id)) {
            setUserMultiFx(prev => [...prev, unit])
        }
    }
    const handleRemoveMultiFx = (id: string) => {
        setUserMultiFx(prev => prev.filter(u => u.id !== id))
    }
    const handleAddPedal = (pedal: Pedal) => {
        if (!userPedals.find(p => p.id === pedal.id)) {
            setUserPedals(prev => [...prev, pedal])
        }
    }
    const handleRemovePedal = (id: string) => {
        setUserPedals(prev => prev.filter(p => p.id !== id))
    }

    const tabs: Tab[] = [
        { id: "presets", label: "Presets", icon: <Settings className="h-[18px] w-[18px]" />, badge: equipment.length },
        { id: "tones", label: "Tones", icon: <Music className="h-[18px] w-[18px]" />, badge: tones.length },
        { id: "multifx", label: "Multi FX", icon: <Cpu className="h-[18px] w-[18px]" />, badge: userMultiFx.length },
        { id: "pedals", label: "Pedals", icon: <SlidersHorizontal className="h-[18px] w-[18px]" />, badge: userPedals.length },
    ]

    // Fetch data on mount
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [tonesRes, equipRes] = await Promise.all([
                fetch("/api/save-tone"),
                fetch("/api/equipment"),
            ])

            if (tonesRes.ok) {
                const data = await tonesRes.json()
                setTones(Array.isArray(data) ? data : [])
            }
            if (equipRes.ok) {
                const data = await equipRes.json()
                setEquipment(Array.isArray(data) ? data : [])
            }
        } catch (e) {
            console.error("Failed to fetch collection data:", e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDeleteTone = (id: string) => {
        setTones(prev => prev.filter(t => t.id !== id))
    }

    const currentEmpty = emptyStates[activeTab]
    const showAddButton = activeTab === "multifx" || activeTab === "pedals"

    // Determine if we have data for the current tab
    const hasData = (activeTab === "tones" && tones.length > 0) ||
        (activeTab === "presets" && equipment.length > 0) ||
        (activeTab === "multifx" && userMultiFx.length > 0) ||
        (activeTab === "pedals" && userPedals.length > 0)

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 md:py-12">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <h1 className="text-[28px] sm:text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                        My Collection
                    </h1>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
                        Manage your saved presets, tones, pedals, and multi-effects
                    </p>
                </div>

                {/* ── Tab Navigation ── */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-medium transition-all duration-200 border",
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                                    : "bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <span className={activeTab === tab.id ? "text-white" : "text-slate-400 dark:text-slate-500"}>
                                {tab.icon}
                            </span>
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                                    activeTab === tab.id
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                )}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Section Header + Add Button (for Multi FX / Pedals) ── */}
                {showAddButton && (
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {activeTab === "multifx" ? "My Multi FX Units" : "My Pedals"}
                            </h2>
                            <p className="text-sm text-slate-400 mt-0.5">
                                {activeTab === "multifx" ? "Manage your multi FX processors for tone matching" : "Manage your pedal collection for tone matching"}
                            </p>
                        </div>
                        <Button
                            onClick={() => activeTab === "multifx" ? setShowAddMultiFx(true) : setShowAddPedal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm text-sm"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            {activeTab === "multifx" ? "Add Multi FX" : "Add Pedal"}
                        </Button>
                    </div>
                )}

                {/* ── Tab Content ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Loading State */}
                        {loading && (activeTab === "tones" || activeTab === "presets") ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-sm text-slate-400 font-medium">Loading your collection...</p>
                            </div>
                        ) : hasData ? (
                            /* ── Data List ── */
                            <div className="space-y-4">
                                {activeTab === "tones" && tones.map(tone => (
                                    <ToneCard key={tone.id} tone={tone} onDelete={handleDeleteTone} />
                                ))}
                                {activeTab === "presets" && equipment.map(eq => (
                                    <div key={eq.id} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{eq.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {[eq.guitar_model, eq.amp_model].filter(Boolean).join(" • ") || "No gear configured"}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400">{new Date(eq.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}

                                {/* Multi FX Items */}
                                {activeTab === "multifx" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userMultiFx.map(unit => {
                                            const typeColor = MULTI_FX_TYPE_COLORS[unit.type]
                                            return (
                                                <div key={unit.id} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                                    <button
                                                        onClick={() => handleRemoveMultiFx(unit.id)}
                                                        className="absolute top-3 right-3 h-7 w-7 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40"
                                                    >
                                                        <X className="h-3.5 w-3.5 text-red-500" />
                                                    </button>
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                            <Cpu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{unit.name}</h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{unit.brand}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1", typeColor.bg, typeColor.text)}>
                                                            {unit.type !== "effects_only" && <Volume2 className="h-3 w-3" />}
                                                            {MULTI_FX_TYPE_LABELS[unit.type]}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">{unit.priceRange}</p>
                                                    {unit.amps && (
                                                        <p className="text-xs text-slate-400 mt-1 truncate">Amps: {unit.amps}</p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Pedals Items */}
                                {activeTab === "pedals" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userPedals.map(pedal => (
                                            <div key={pedal.id} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                                <button
                                                    onClick={() => handleRemovePedal(pedal.id)}
                                                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40"
                                                >
                                                    <X className="h-3.5 w-3.5 text-red-500" />
                                                </button>
                                                <div className="flex items-start gap-3">
                                                    <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                                        <SlidersHorizontal className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{pedal.name}</h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{pedal.brand}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                                        {PEDAL_CATEGORY_LABELS[pedal.category]}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">{pedal.priceRange}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Empty State Card ── */
                            <div className="flex justify-center">
                                <div className={cn(
                                    "w-full rounded-2xl border p-10 sm:p-16 text-center",
                                    "bg-gradient-to-b",
                                    activeTab === "presets" && "from-blue-50/60 to-white dark:from-blue-900/5 dark:to-[#1a1a1a] border-blue-100/60 dark:border-blue-800/20",
                                    activeTab === "tones" && "from-purple-50/60 to-white dark:from-purple-900/5 dark:to-[#1a1a1a] border-purple-100/60 dark:border-purple-800/20",
                                    activeTab === "multifx" && "from-slate-50/80 to-white dark:from-slate-800/10 dark:to-[#1a1a1a] border-slate-200/60 dark:border-white/5",
                                    activeTab === "pedals" && "from-slate-50/80 to-white dark:from-slate-800/10 dark:to-[#1a1a1a] border-slate-200/60 dark:border-white/5",
                                )}>
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                        currentEmpty.iconBg
                                    )}>
                                        {currentEmpty.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                        {currentEmpty.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
                                        {currentEmpty.description}
                                    </p>

                                    {/* Action Button */}
                                    {currentEmpty.buttonHref ? (
                                        <Link href={currentEmpty.buttonHref}>
                                            <Button className={cn(
                                                "px-6 py-2.5 h-11 rounded-lg text-[15px] font-semibold shadow-sm hover:opacity-90 transition-all",
                                                currentEmpty.buttonStyle
                                            )}>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                {currentEmpty.buttonText}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className={cn(
                                            "px-6 py-2.5 h-11 rounded-lg text-[15px] font-semibold shadow-sm hover:opacity-90 transition-all",
                                            currentEmpty.buttonStyle
                                        )}>
                                            {currentEmpty.buttonText}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>

            {/* Dialogs */}
            <AddMultiFxDialog
                open={showAddMultiFx}
                onClose={() => setShowAddMultiFx(false)}
                onAdd={handleAddMultiFx}
                addedIds={userMultiFx.map(u => u.id)}
            />
            <AddPedalDialog
                open={showAddPedal}
                onClose={() => setShowAddPedal(false)}
                onAdd={handleAddPedal}
                addedIds={userPedals.map(p => p.id)}
            />
        </div>
    )
}
