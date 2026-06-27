"use client"

import { useState } from "react"
import { Settings, Music, Cpu, SlidersHorizontal, Plus, Sparkles, Trash2, Eye, Loader2, Guitar as GuitarIcon, Speaker, AlertTriangle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// ───────────── Types ─────────────

interface SavedTone {
    id: string
    created_at: string
    songs: { title: string; artist: string } | null
    settings: any
}

type TabId = "presets" | "tones" | "multifx" | "pedals"

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
    badge?: number
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
        icon: <Settings className="h-8 w-8 text-[#E8712A]" />,
        iconBg: "bg-[#E8712A]/10",
        title: "Unlock Gear Presets",
        description: "Save your favorite guitar and amp combinations for instant access during tone matching.",
        buttonText: "View Plans",
        buttonHref: "/plans",
        buttonStyle: "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C]",
    },
    tones: {
        icon: <Music className="h-8 w-8 text-[#E8712A]" />,
        iconBg: "bg-[#E8712A]/10",
        title: "No saved tones yet",
        description: "Match a legendary tone to your gear, then hit “Save to Tone Library” to keep it here for quick reference.",
        buttonText: "Match a Tone",
        buttonHref: "/tone-match",
        buttonStyle: "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C]",
    },
    multifx: {
        icon: <Cpu className="h-8 w-8 text-[#8A8494]" />,
        iconBg: "bg-white/8",
        title: "No multi FX units yet",
        description: "Add your multi FX processor (like Boss ME-80, Line 6 Helix, etc.) to get preset recommendations",
        buttonText: "+ Add Your Multi FX Unit",
        buttonStyle: "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C]",
        sectionTitle: "My Multi FX Units",
        sectionSubtitle: "Manage your multi FX processors for tone matching",
    },
    pedals: {
        icon: <SlidersHorizontal className="h-8 w-8 text-[#8A8494]" />,
        iconBg: "bg-white/8",
        title: "No pedals yet",
        description: "Add pedals to your collection to get better tone matching results",
        buttonText: "+ Add Your First Pedal",
        buttonStyle: "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C]",
        sectionTitle: "My Pedals",
        sectionSubtitle: "Manage your pedal collection for tone matching",
    },
}

// ───────────── Helpers ─────────────

function val(v: any): string {
    return v === null || v === undefined || v === "" ? "—" : String(v)
}

// ───────────── Saved tone detail (null-safe, rich) ─────────────

function ToneDetail({ tone }: { tone: SavedTone }) {
    const s = tone.settings || {}
    const tags = s.tags || null
    const original = s.original || null
    const amp = s.suggestedSettings?.amp || {}
    const guitar = s.suggestedSettings?.guitar || {}
    const pedals: any[] = Array.isArray(s.suggestedSettings?.pedals) ? s.suggestedSettings.pedals : []
    const missingEffects: any[] = Array.isArray(s.missingEffects) ? s.missingEffects : []
    const playingTips: any[] = Array.isArray(s.playingTips) ? s.playingTips : []

    const ampRows = [
        { label: "Gain", v: amp.gain },
        { label: "Bass", v: amp.bass },
        { label: "Mids", v: amp.middle ?? amp.mid },
        { label: "Treble", v: amp.treble },
        { label: "Presence", v: amp.presence },
        { label: "Reverb", v: amp.reverb },
    ]

    const origAmp = original?.ampSettings || null
    const origAmpRows = origAmp
        ? [
            { label: "Gain", v: origAmp.gain },
            { label: "Bass", v: origAmp.bass },
            { label: "Mids", v: origAmp.middle ?? origAmp.mid },
            { label: "Treble", v: origAmp.treble },
            { label: "Presence", v: origAmp.presence },
            { label: "Reverb", v: origAmp.reverb },
        ]
        : []

    return (
        <div className="space-y-6 mt-2">
            {/* Tags */}
            {tags && (
                <div className="flex flex-wrap gap-2">
                    {[tags.part, tags.genre, tags.era, tags.tempo].filter(Boolean).map((t: string, i: number) => (
                        <span key={i} className="text-[11px] font-bold text-[#8A8494] bg-white/5 border border-white/8 px-3 py-1 rounded-full uppercase tracking-wide">{t}</span>
                    ))}
                </div>
            )}

            {/* AI explanation */}
            {s.explanation && (
                <div className="bg-[#E8712A]/5 border border-[#E8712A]/20 rounded-xl p-4">
                    <p className="italic text-[#8A8494] text-sm leading-relaxed">&quot;{s.explanation}&quot;</p>
                </div>
            )}

            {/* Original tone */}
            {original && (
                <div className="space-y-3">
                    <h3 className="font-bold text-base flex items-center gap-2 text-[#F2F0ED]">
                        <Music className="h-4 w-4 text-[#E8712A]" /> Original Tone
                        {original.verified && (
                            <span className="text-[10px] font-bold text-[#E8712A] bg-[#E8712A]/10 border border-[#E8712A]/20 px-2 py-0.5 rounded-full uppercase tracking-wide">Verified</span>
                        )}
                    </h3>
                    <div className="bg-[#12121A] border border-white/8 rounded-xl p-4 space-y-4">
                        <div className="grid sm:grid-cols-3 gap-3">
                            {[
                                { label: "Guitar", v: original.guitar },
                                { label: "Amp", v: original.amp },
                                { label: "Pickups", v: original.pickups },
                            ].filter((f) => f.v).map((f) => (
                                <div key={f.label} className="space-y-0.5">
                                    <div className="text-[10px] font-bold text-[#E8712A] uppercase tracking-widest">{f.label}</div>
                                    <div className="text-sm font-semibold text-[#F2F0ED] leading-snug">{f.v}</div>
                                </div>
                            ))}
                        </div>
                        {origAmpRows.length > 0 && (
                            <div className="pt-3 border-t border-white/8">
                                <div className="text-[10px] font-bold text-[#8A8494] uppercase tracking-widest mb-2">Original Amp Settings</div>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {origAmpRows.map((r) => (
                                        <div key={r.label} className="text-center bg-white/3 rounded-lg py-2">
                                            <div className="font-mono text-base font-bold text-amber-400">{val(r.v)}</div>
                                            <div className="text-[9px] font-bold text-[#8A8494] uppercase tracking-wider mt-0.5">{r.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {Array.isArray(original.signalChain) && original.signalChain.length > 0 && (
                            <div className="pt-3 border-t border-white/8">
                                <div className="text-[10px] font-bold text-[#8A8494] uppercase tracking-widest mb-2">Original Signal Chain</div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {original.signalChain.map((stage: string, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-2">
                                            <span className="text-xs font-semibold text-[#F2F0ED] bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">{stage}</span>
                                            {i < original.signalChain.length - 1 && <span className="text-[#E8712A]">→</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Adapted settings */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="font-bold text-base flex items-center gap-2 text-[#F2F0ED]"><GuitarIcon className="h-4 w-4 text-[#E8712A]" /> Guitar</h3>
                    <div className="bg-[#12121A] border border-white/8 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[#8A8494]">Pickup</span><span className="font-semibold text-[#F2F0ED]">{val(guitar.pickupSelector)}</span></div>
                        <div className="flex justify-between"><span className="text-[#8A8494]">Volume</span><span className="font-semibold text-[#F2F0ED]">{val(guitar.volume)}</span></div>
                        <div className="flex justify-between"><span className="text-[#8A8494]">Tone</span><span className="font-semibold text-[#F2F0ED]">{val(guitar.tone)}</span></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-base flex items-center gap-2 text-[#F2F0ED]"><Speaker className="h-4 w-4 text-[#E8712A]" /> Amp</h3>
                    <div className="bg-[#12121A] border border-white/8 rounded-xl p-4 grid grid-cols-3 gap-2">
                        {ampRows.map((r) => (
                            <div key={r.label} className="text-center bg-white/3 rounded-lg py-2">
                                <div className="font-mono text-base font-bold text-amber-400">{val(r.v)}</div>
                                <div className="text-[9px] font-bold text-[#8A8494] uppercase tracking-wider mt-0.5">{r.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Signal chain / pedals */}
            {pedals.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-bold text-base flex items-center gap-2 text-[#F2F0ED]"><SlidersHorizontal className="h-4 w-4 text-[#E8712A]" /> Signal Chain</h3>
                    <div className="space-y-2">
                        {pedals.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 bg-[#12121A] border border-white/8 rounded-xl p-3">
                                <div className="h-7 w-7 shrink-0 rounded-lg bg-[#E8712A]/10 text-[#E8712A] flex items-center justify-center font-mono font-bold text-xs">{i + 1}</div>
                                <div className="min-w-0">
                                    <div className="font-bold text-[#F2F0ED] text-sm">{val(p?.name)}</div>
                                    {p?.settings && <div className="font-mono text-xs text-[#8A8494] mt-0.5">{p.settings}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing effects */}
            {missingEffects.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-bold text-base flex items-center gap-2 text-[#F2F0ED]"><AlertTriangle className="h-4 w-4 text-amber-400" /> Missing Effects</h3>
                    <div className="space-y-2">
                        {missingEffects.map((fx, i) => (
                            <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                                <div className="font-bold text-[#F2F0ED] text-sm">{val(fx?.name)}</div>
                                {fx?.reason && <p className="text-sm text-[#8A8494] leading-relaxed">{fx.reason}</p>}
                                {Array.isArray(fx?.alternatives) && fx.alternatives.length > 0 && (
                                    <div className="pt-1.5 border-t border-amber-500/10 space-y-1">
                                        {fx.alternatives.map((alt: string, ai: number) => (
                                            <div key={ai} className="flex gap-2 text-sm text-[#F2F0ED]"><span className="text-amber-400 shrink-0">→</span><span>{alt}</span></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Playing tips */}
            {playingTips.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-bold text-base flex items-center gap-2 text-[#F2F0ED]"><Lightbulb className="h-4 w-4 text-[#E8712A]" /> Playing Tips</h3>
                    <div className="space-y-2">
                        {playingTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 bg-[#12121A] border border-white/8 rounded-xl p-3">
                                <div className="h-6 w-6 shrink-0 rounded-full bg-[#E8712A]/10 text-[#E8712A] flex items-center justify-center font-bold text-xs">{i + 1}</div>
                                <p className="text-sm text-[#F2F0ED] leading-relaxed pt-0.5">{String(tip)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ───────────── Component ─────────────

export function CollectionContent({ savedTones }: { savedTones: SavedTone[] }) {
    const [activeTab, setActiveTab] = useState<TabId>("tones")
    const [tones, setTones] = useState<SavedTone[]>(savedTones)
    const [selected, setSelected] = useState<SavedTone | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const router = useRouter()

    const tabs: Tab[] = [
        { id: "presets", label: "Presets", icon: <Settings className="h-[18px] w-[18px]" />, badge: 0 },
        { id: "tones", label: "Tones", icon: <Music className="h-[18px] w-[18px]" />, badge: tones.length },
        { id: "multifx", label: "Multi FX", icon: <Cpu className="h-[18px] w-[18px]" /> },
        { id: "pedals", label: "Pedals", icon: <SlidersHorizontal className="h-[18px] w-[18px]" /> },
    ]

    const currentEmpty = emptyStates[activeTab]
    const showAddButton = activeTab === "multifx" || activeTab === "pedals"
    const showTonesList = activeTab === "tones" && tones.length > 0

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this saved tone?")) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/tone-match/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            setTones((prev) => prev.filter((t) => t.id !== id))
            if (selected?.id === id) setSelected(null)
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Failed to delete tone")
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#08080C]">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 md:py-12">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#F2F0ED] tracking-tight">My Collection</h1>
                    <p className="text-base text-[#8A8494] mt-1">Manage your saved presets, tones, pedals, and multi-effects</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8" role="tablist" aria-label="Collection categories">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-medium transition-colors duration-200 border",
                                activeTab === tab.id
                                    ? "bg-[#E8712A] text-[#08080C] border-[#E8712A] shadow-md shadow-[#E8712A]/20"
                                    : "bg-[#12121A] text-[#8A8494] border-white/8 hover:bg-[#1A1A22] hover:text-[#F2F0ED]"
                            )}
                        >
                            <span className={activeTab === tab.id ? "text-[#08080C]" : "text-[#8A8494]"}>{tab.icon}</span>
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                                    activeTab === tab.id ? "bg-black/20 text-[#08080C]" : "bg-white/8 text-[#8A8494]"
                                )}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Section Header + Add Button (for Multi FX / Pedals) */}
                {showAddButton && currentEmpty.sectionTitle && (
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#F2F0ED]">{currentEmpty.sectionTitle}</h2>
                            <p className="text-sm text-[#8A8494] mt-0.5">{currentEmpty.sectionSubtitle}</p>
                        </div>
                        <Button className="bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-semibold rounded-lg shadow-sm text-sm">
                            <Plus className="h-4 w-4 mr-1.5" />
                            {activeTab === "multifx" ? "Add Multi FX" : "Add Pedal"}
                        </Button>
                    </div>
                )}

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                    >
                        {showTonesList ? (
                            /* Saved tones grid */
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tones.map((tone) => {
                                    const match = typeof tone.settings?.confidenceScore === "number" ? Math.round(tone.settings.confidenceScore) : null
                                    return (
                                        <div
                                            key={tone.id}
                                            className="group bg-[#0E0E14] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#E8712A]/40 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-[#F2F0ED] truncate">{tone.songs?.title || "Untitled tone"}</div>
                                                    <div className="text-sm text-[#8A8494] truncate">{tone.songs?.artist || "Unknown artist"}</div>
                                                </div>
                                                {match !== null && (
                                                    <span className="shrink-0 text-[10px] font-bold text-[#E8712A] bg-[#E8712A]/10 border border-[#E8712A]/20 px-2 py-1 rounded-full">{match}%</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-[#8A8494]">{new Date(tone.created_at).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-2 mt-auto pt-1">
                                                <Button
                                                    onClick={() => setSelected(tone)}
                                                    className="flex-1 h-9 bg-[#12121A] hover:bg-[#1A1A22] text-[#F2F0ED] border border-white/8 rounded-lg text-sm font-semibold"
                                                >
                                                    <Eye className="h-4 w-4 mr-1.5 text-[#E8712A]" /> View
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(tone.id)}
                                                    disabled={deleting === tone.id}
                                                    className="h-9 w-9 p-0 bg-[#12121A] hover:bg-red-500/10 border border-white/8 hover:border-red-500/30 rounded-lg"
                                                    aria-label="Delete tone"
                                                >
                                                    {deleting === tone.id ? <Loader2 className="h-4 w-4 animate-spin text-[#8A8494]" /> : <Trash2 className="h-4 w-4 text-red-400" />}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            /* Empty State Card */
                            <div className="flex justify-center">
                                <div className={cn(
                                    "w-full rounded-2xl border p-10 sm:p-16 text-center bg-gradient-to-b",
                                    activeTab === "presets" && "from-[#E8712A]/5 to-[#12121A] border-[#E8712A]/15",
                                    activeTab === "tones" && "from-[#E8712A]/5 to-[#12121A] border-[#E8712A]/15",
                                    activeTab === "multifx" && "from-white/3 to-[#12121A] border-white/8",
                                    activeTab === "pedals" && "from-white/3 to-[#12121A] border-white/8",
                                )}>
                                    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", currentEmpty.iconBg)}>
                                        {currentEmpty.icon}
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-[#F2F0ED] mb-3">{currentEmpty.title}</h3>
                                    <p className="text-base text-[#8A8494] leading-relaxed max-w-md mx-auto mb-6">{currentEmpty.description}</p>
                                    {currentEmpty.buttonHref ? (
                                        <Link href={currentEmpty.buttonHref}>
                                            <Button className={cn("px-6 py-2.5 h-11 rounded-lg text-[15px] font-semibold shadow-sm hover:opacity-90 transition-opacity", currentEmpty.buttonStyle)}>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                {currentEmpty.buttonText}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className={cn("px-6 py-2.5 h-11 rounded-lg text-[15px] font-semibold shadow-sm hover:opacity-90 transition-opacity", currentEmpty.buttonStyle)}>
                                            {currentEmpty.buttonText}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Detail dialog */}
            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0E0E14] border border-white/8 text-[#F2F0ED]">
                    <DialogHeader>
                        <DialogTitle className="text-[#F2F0ED]">{selected?.songs?.title || "Saved tone"}{selected?.songs?.artist ? ` — ${selected.songs.artist}` : ""}</DialogTitle>
                        <DialogDescription className="text-[#8A8494]">AI-adapted settings for your gear</DialogDescription>
                    </DialogHeader>
                    {selected && <ToneDetail tone={selected} />}
                </DialogContent>
            </Dialog>
        </div>
    )
}
