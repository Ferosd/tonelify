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
        icon: <Settings className="h-8 w-8 text-[#E8712A]" />,
        iconBg: "bg-[#E8712A]/10",
        title: "Unlock Gear Presets",
        description: "Save your favorite guitar and amp combinations for instant access during tone matching.",
        buttonText: "View Plans",
        buttonHref: "/plans",
        buttonStyle: "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C]",
    },
    tones: {
        icon: <Music className="h-8 w-8 text-[#9B5DE5]" />,
        iconBg: "bg-[#9B5DE5]/10",
        title: "Unlock Saved Tones",
        description: "Save your adapted tone settings for quick reference anytime.",
        buttonText: "View Plans",
        buttonHref: "/plans",
        buttonStyle: "bg-gradient-to-r from-[#9B5DE5] to-[#7C3AED] hover:from-[#8B4DD5] hover:to-[#6B2FD9] text-white",
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

// ───────────── Component ─────────────

export default function CollectionPage() {
    const [activeTab, setActiveTab] = useState<TabId>("presets")

    const currentEmpty = emptyStates[activeTab]
    const showAddButton = activeTab === "multifx" || activeTab === "pedals"

    return (
        <div className="min-h-screen bg-[#08080C]">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 md:py-12">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#F2F0ED] tracking-tight">
                        My Collection
                    </h1>
                    <p className="text-base text-[#8A8494] mt-1">
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
                                "inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-medium transition-colors duration-200 border",
                                activeTab === tab.id
                                    ? "bg-[#E8712A] text-[#08080C] border-[#E8712A] shadow-md shadow-[#E8712A]/20"
                                    : "bg-[#12121A] text-[#8A8494] border-white/8 hover:bg-[#1A1A22] hover:text-[#F2F0ED]"
                            )}
                        >
                            <span className={activeTab === tab.id ? "text-[#08080C]" : "text-[#8A8494]"}>
                                {tab.icon}
                            </span>
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                                    activeTab === tab.id
                                        ? "bg-black/20 text-[#08080C]"
                                        : "bg-white/8 text-[#8A8494]"
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
                            <h2 className="text-lg font-bold text-[#F2F0ED]">
                                {currentEmpty.sectionTitle}
                            </h2>
                            <p className="text-sm text-[#8A8494] mt-0.5">
                                {currentEmpty.sectionSubtitle}
                            </p>
                        </div>
                        <Button
                            className="bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-semibold rounded-lg shadow-sm text-sm"
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
                                activeTab === "presets" && "from-[#E8712A]/5 to-[#12121A] border-[#E8712A]/15",
                                activeTab === "tones" && "from-[#9B5DE5]/5 to-[#12121A] border-[#9B5DE5]/15",
                                activeTab === "multifx" && "from-white/3 to-[#12121A] border-white/8",
                                activeTab === "pedals" && "from-white/3 to-[#12121A] border-white/8",
                            )}>
                                {/* Icon */}
                                <div className={cn(
                                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                    currentEmpty.iconBg
                                )}>
                                    {currentEmpty.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl sm:text-2xl font-bold text-[#F2F0ED] mb-3">
                                    {currentEmpty.title}
                                </h3>

                                {/* Description */}
                                <p className="text-base text-[#8A8494] leading-relaxed max-w-md mx-auto mb-6">
                                    {currentEmpty.description}
                                </p>

                                {/* Action Button */}
                                {currentEmpty.buttonHref ? (
                                    <Link href={currentEmpty.buttonHref}>
                                        <Button className={cn(
                                            "px-6 py-2.5 h-11 rounded-lg text-[15px] font-semibold shadow-sm hover:opacity-90 transition-opacity",
                                            currentEmpty.buttonStyle
                                        )}>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            {currentEmpty.buttonText}
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button className={cn(
                                        "px-6 py-2.5 h-11 rounded-lg text-[15px] font-semibold shadow-sm hover:opacity-90 transition-opacity",
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
