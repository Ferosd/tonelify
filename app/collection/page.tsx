"use client"

import { useState } from "react"
import { Settings, Music, Cpu, SlidersHorizontal, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// ───────────── Tab definitions ─────────────

type TabId = "presets" | "tones" | "multifx" | "pedals"

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
    badge?: number
}

const tabs: Tab[] = [
    { id: "presets", label: "Presets", icon: <Settings className="h-[18px] w-[18px]" />, badge: 0 },
    { id: "tones", label: "Tones", icon: <Music className="h-[18px] w-[18px]" />, badge: 0 },
    { id: "multifx", label: "Multi FX", icon: <Cpu className="h-[18px] w-[18px]" /> },
    { id: "pedals", label: "Pedals", icon: <SlidersHorizontal className="h-[18px] w-[18px]" /> },
]

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
        title: "Unlock Gear Presets",
        description: "Save your favorite guitar and amp combinations for instant access during tone matching.",
        buttonText: "View Plans",
        buttonHref: "/plans",
        buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    tones: {
        icon: <Music className="h-8 w-8 text-purple-500" />,
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        title: "Unlock Saved Tones",
        description: "Save your adapted tone settings for quick reference anytime.",
        buttonText: "View Plans",
        buttonHref: "/plans",
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

// ───────────── Component ─────────────

export default function CollectionPage() {
    const [activeTab, setActiveTab] = useState<TabId>("presets")

    const currentEmpty = emptyStates[activeTab]
    const showAddButton = activeTab === "multifx" || activeTab === "pedals"

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
                {showAddButton && currentEmpty.sectionTitle && (
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {currentEmpty.sectionTitle}
                            </h2>
                            <p className="text-sm text-slate-400 mt-0.5">
                                {currentEmpty.sectionSubtitle}
                            </p>
                        </div>
                        <Button
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
                        {/* Empty State Card */}
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
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    )
}
