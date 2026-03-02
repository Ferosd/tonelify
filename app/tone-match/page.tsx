"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Guitar as GuitarIcon, Music2, Music, Flame, Search, Target, Sparkles, Lightbulb, Speaker, User, ExternalLink, PlayCircle, ArrowLeft, SlidersHorizontal, X, Cpu, Check } from "lucide-react"
import Link from "next/link"
import { TrendingTones } from "@/components/TrendingTones"
import { useDebounce } from "@/hooks/useDebounce"
import { useEffect } from "react"
import { type MultiFxUnit, type Pedal, PEDAL_CATEGORY_LABELS, MULTI_FX_TYPE_LABELS } from "@/lib/gear-catalog"

export default function ToneMatchPage() {
    const { user } = useUser()

    // Form State
    const [songTitle, setSongTitle] = useState("")
    const [artist, setArtist] = useState("")
    const [instrument, setInstrument] = useState<"guitar" | "bass">("guitar")

    // Step 1: Gear State
    const [preset, setPreset] = useState("manual")
    const [userGuitar, setUserGuitar] = useState("")
    const [userAmp, setUserAmp] = useState("")
    const [goingDirect, setGoingDirect] = useState(false)
    const [userEffects, setUserEffects] = useState("")
    const [effectsType, setEffectsType] = useState<"pedals" | "multi">("pedals")

    // Collection gear from localStorage
    const [collectionPedals, setCollectionPedals] = useState<Pedal[]>([])
    const [collectionMultiFx, setCollectionMultiFx] = useState<MultiFxUnit[]>([])
    const [activePedalIds, setActivePedalIds] = useState<Set<string>>(new Set())
    const [activeMultiFxId, setActiveMultiFxId] = useState<string | null>(null)

    // Step 2: Song Details State
    const [partType, setPartType] = useState<"riff" | "solo">("riff")
    const [toneType, setToneType] = useState<"auto" | "clean" | "distorted">("auto")

    // API State
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Subscription / Paywall State
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
    const [showPaywall, setShowPaywall] = useState(false)

    // Search State
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedSongTitle = useDebounce(songTitle, 500)

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem("toneMatchState");
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setSongTitle(parsed.songTitle || "");
                setArtist(parsed.artist || "");
                setInstrument(parsed.instrument || "guitar");
                setPreset(parsed.preset || "manual");
                setUserGuitar(parsed.userGuitar || "");
                setUserAmp(parsed.userAmp || "");
                setGoingDirect(parsed.goingDirect || false);
                setUserEffects(parsed.userEffects || "");
                setEffectsType(parsed.effectsType || "pedals");
                setPartType(parsed.partType || "riff");
                setToneType(parsed.toneType || "auto");
            } catch (e) {
                console.error("Failed to parse saved state", e);
            }
        }

        // Load collection gear from localStorage
        try {
            const savedPedals = localStorage.getItem("tonelify_pedals")
            const savedMultiFx = localStorage.getItem("tonelify_multifx")
            if (savedPedals) setCollectionPedals(JSON.parse(savedPedals))
            if (savedMultiFx) setCollectionMultiFx(JSON.parse(savedMultiFx))
        } catch (e) { console.error(e) }
    }, []);

    // Save state to localStorage on change
    useEffect(() => {
        const stateToSave = {
            songTitle,
            artist,
            instrument,
            preset,
            userGuitar,
            userAmp,
            goingDirect,
            userEffects,
            effectsType,
            partType,
            toneType
        };
        localStorage.setItem("toneMatchState", JSON.stringify(stateToSave));
    }, [songTitle, artist, instrument, preset, userGuitar, userAmp, goingDirect, userEffects, effectsType, partType, toneType]);

    // Check subscription status on mount
    useEffect(() => {
        async function checkSub() {
            try {
                const res = await fetch("/api/subscription")
                if (res.ok) {
                    const data = await res.json()
                    setHasSubscription(data?.plan && data.plan !== "free" ? true : false)
                } else {
                    setHasSubscription(false)
                }
            } catch {
                setHasSubscription(false)
            }
        }
        if (user) checkSub()
    }, [user])

    useEffect(() => {
        async function search() {
            if (debouncedSongTitle.length > 2 && isSearching) {
                try {
                    const res = await fetch(`/api/search-song?q=${encodeURIComponent(debouncedSongTitle)}`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSearchResults(data);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                setSearchResults([]);
            }
        }
        search();
    }, [debouncedSongTitle, isSearching]);

    // Handle Preset Selection
    const handlePresetChange = (value: string) => {
        setPreset(value)
        if (value === "preset1") {
            setUserGuitar("Fender Stratocaster")
            setUserAmp("Fender Twin Reverb")
            setGoingDirect(false)
            setUserEffects("Tube Screamer, Compressor")
            setEffectsType("pedals")
        } else if (value === "preset2") {
            setUserGuitar("Gibson Les Paul")
            setUserAmp("Marshall JCM800")
            setGoingDirect(false)
            setUserEffects("Wah, Delay, Reverb")
            setEffectsType("pedals")
        } else {
            // Manual - optional: clear fields or keep as is
            setUserGuitar("")
            setUserAmp("")
            setUserEffects("")
        }
    }

    // Actual API Call
    const runResearch = async () => {
        // Paywall check: if not logged in, redirect to sign-up
        if (!user) {
            window.location.href = "/sign-up"
            return
        }
        // If no subscription, show paywall modal
        if (hasSubscription === false) {
            setShowPaywall(true)
            return
        }

        setIsLoading(true)
        setError(null)
        setResult(null)
        setIsSaved(false)

        try {
            const response = await fetch("/api/tone-match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    songTitle,
                    artist,
                    instrument,
                    partType,
                    toneType,
                    userGear: {
                        guitarModel: userGuitar,
                        ampModel: userAmp,
                        goingDirect,
                        effects: userEffects.split(",").map(s => s.trim()).filter(Boolean),
                        effectsType
                    }
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Something went wrong")
            }

            const data = await response.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!result) return
        setIsSaving(true)
        try {
            const response = await fetch("/api/save-tone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    songTitle,
                    artist,
                    instrument,
                    userGear: {
                        guitarModel: userGuitar,
                        ampModel: userAmp,
                        effects: userEffects.split(",").map(s => s.trim()).filter(Boolean)
                    },
                    settings: result
                })
            })

            if (!response.ok) throw new Error("Failed to save")
            setIsSaved(true)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0a] pb-20 font-sans transition-colors duration-300">

            {/* ── PAYWALL MODAL ── */}
            {showPaywall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaywall(false)} />
                    <div className="relative z-10 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
                        {/* Close */}
                        <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        {/* Logo + Heading */}
                        <div className="flex items-start gap-4 mb-6">
                            <img src="/logo-new.svg" alt="Tonelify" className="h-14 w-14 rounded-xl shadow-md" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    Recreate this exact guitar tone on your gear
                                </h2>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <p className="text-base text-slate-600 dark:text-slate-400">
                                <span className="text-blue-600 font-bold">Try it free</span> — we&apos;ll match this tone to your exact guitar and amp in seconds.
                            </p>
                            <p className="text-sm text-slate-400 mt-2">Cancel anytime. No commitment.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowPaywall(false)}
                                className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#222]"
                            >
                                Keep my current tone
                            </Button>
                            <Link href="/plans" className="flex-1">
                                <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                                    Get this tone
                                </Button>
                            </Link>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-3">Start free trial · Cancel anytime</p>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="text-center pt-8 md:pt-12 pb-6 md:pb-8 space-y-4 md:space-y-6 bg-white dark:bg-[#111] border-b border-slate-100 dark:border-white/5 px-4 transition-colors duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    <span className="text-blue-500">⚡</span> Gear-Matched Tone Settings
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Tonelify
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-light">
                    Transform legendary {instrument === 'guitar' ? 'guitar' : 'bass'} tones to match your gear
                </p>

                {/* Instrument Toggle */}
                <div className="flex justify-center mt-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm inline-flex">
                        <button
                            onClick={() => setInstrument("guitar")}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${instrument === "guitar"
                                ? "bg-violet-600 text-white shadow-md"
                                : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            <GuitarIcon className="h-4 w-4" />
                            Guitar
                        </button>
                        <button
                            onClick={() => setInstrument("bass")}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${instrument === "bass"
                                ? "bg-violet-600 text-white shadow-md"
                                : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            <Music2 className="h-4 w-4" />
                            Bass
                        </button>
                    </div>
                </div>

                {/* NEW Badge for Bass */}
                {instrument === 'bass' && (
                    <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100">
                            <span className="text-emerald-500 font-bold">NEW</span>
                            <span className="text-emerald-600/80">• Bass adaptation is brand new — results may vary</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="container max-w-5xl px-3 md:px-4 py-4 md:py-8 mx-auto space-y-6 md:space-y-8">

                {/* Trending Section */}
                <TrendingTones />

                {/* ==================== STEP 1: YOUR GEAR ==================== */}
                <Card className="border-none shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm">
                    <CardHeader className="bg-slate-50/80 dark:bg-[#1a1a1a]/80 border-b border-slate-100 dark:border-white/5 p-4 md:p-8 flex flex-row items-center gap-3 md:gap-5">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-lg shadow-blue-500/20 shrink-0">
                            1
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Gear</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Select your current equipment configuration</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10">
                        {instrument === 'guitar' ? (
                            /* ========== GUITAR GEAR UI ========== */
                            <div className="space-y-10">

                                {/* Saved Preset Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-blue-500" />
                                        <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Load Preset</Label>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 px-4 bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-white/10 rounded-xl text-base font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all text-slate-700 dark:text-slate-200 appearance-none cursor-pointer hover:bg-white dark:hover:bg-[#2a2a2a] hover:border-blue-300"
                                            value={preset}
                                            onChange={(e) => handlePresetChange(e.target.value)}
                                        >
                                            <option value="manual">Select a preset...</option>
                                            <option value="preset1">My Clean Setup (Strat + Twin)</option>
                                            <option value="preset2">Live Rig (Les Paul + JCM800)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <ArrowLeft className="h-4 w-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-slate-100"></div>
                                    <span className="flex-shrink-0 mx-6 text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Or Configure Manually</span>
                                    <div className="flex-grow border-t border-slate-100"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Guitar Input */}
                                    <div className="space-y-4 group">
                                        <div className="flex items-center gap-2">
                                            <GuitarIcon className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Label htmlFor="guitar" className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">Guitar Model</Label>
                                        </div>
                                        <input
                                            id="guitar"
                                            placeholder="e.g. Fender Stratocaster"
                                            value={userGuitar}
                                            onChange={(e) => setUserGuitar(e.target.value)}
                                            className="w-full h-12 px-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all shadow-sm text-slate-900 dark:text-white"
                                        />
                                        <p className="text-[10px] text-slate-400 cursor-pointer hover:text-blue-500 transition-colors font-medium pl-1">
                                            Can't find your model? Type generic type (e.g. "S-Type")
                                        </p>
                                    </div>

                                    {/* Amp Input */}
                                    <div className="space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Speaker className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Label htmlFor="amp" className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">Amplifier</Label>
                                            </div>

                                            {/* Custom Toggle */}
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group/toggle"
                                                onClick={() => setGoingDirect(!goingDirect)}
                                            >
                                                <Label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${goingDirect ? 'text-blue-600' : 'text-slate-400 group-hover/toggle:text-slate-500'}`}>
                                                    Going Direct
                                                </Label>
                                                <div className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${goingDirect ? 'bg-blue-600 shadow-inner' : 'bg-slate-200'}`}>
                                                    <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform duration-300 ${goingDirect ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            id="amp"
                                            placeholder="e.g. Fender Twin Reverb"
                                            value={userAmp}
                                            onChange={(e) => setUserAmp(e.target.value)}
                                            className="w-full h-12 px-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-[#111] text-slate-900 dark:text-white"
                                            disabled={goingDirect}
                                        />
                                    </div>
                                </div>

                                {/* Effects Section - Collection Integrated */}
                                <div className="space-y-5 pt-2">
                                    <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Select Your Effects
                                        <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-auto bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Optional</span>
                                    </Label>

                                    {!userAmp && !goingDirect && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/5 rounded-xl px-4 py-3">Select an amp first to enable effects selection</p>
                                    )}

                                    {(userAmp || goingDirect) && (
                                        <>
                                            {/* Pedals / Multi FX Tabs */}
                                            <div className="p-1 rounded-xl border flex bg-slate-50 dark:bg-[#222] border-slate-200 dark:border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => setEffectsType("pedals")}
                                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${effectsType === 'pedals' ? 'bg-white dark:bg-[#333] shadow-sm text-blue-600 dark:text-blue-400 ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                >
                                                    <SlidersHorizontal className="h-4 w-4" />
                                                    Pedals
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEffectsType("multi")}
                                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${effectsType === 'multi' ? 'bg-white dark:bg-[#333] shadow-sm text-blue-600 dark:text-blue-400 ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                >
                                                    <Cpu className="h-4 w-4" />
                                                    Multi FX
                                                </button>
                                            </div>

                                            {/* Hint for Multi FX */}
                                            {effectsType === 'multi' && collectionMultiFx.length > 0 && (
                                                <p className="text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 rounded-lg px-3 py-2 flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3" />
                                                    Want to use Multi FX? Add your multi-effects unit in <Link href="/collection" className="font-bold underline underline-offset-2">Account → Multi FX</Link> to get complete presets instead of individual pedals.
                                                </p>
                                            )}

                                            {/* PEDALS TAB */}
                                            {effectsType === 'pedals' && (
                                                <div className="space-y-4">
                                                    {collectionPedals.length > 0 ? (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Your Pedals</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (activePedalIds.size === collectionPedals.length) {
                                                                            setActivePedalIds(new Set())
                                                                            setUserEffects("")
                                                                        } else {
                                                                            const allIds = new Set(collectionPedals.map(p => p.id))
                                                                            setActivePedalIds(allIds)
                                                                            setUserEffects(collectionPedals.map(p => p.name).join(", "))
                                                                        }
                                                                    }}
                                                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                                                                >
                                                                    {activePedalIds.size === collectionPedals.length ? 'Deselect All' : 'Select All Active'}
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {collectionPedals.map((pedal) => {
                                                                    const isActive = activePedalIds.has(pedal.id)
                                                                    return (
                                                                        <button
                                                                            key={pedal.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const next = new Set(activePedalIds)
                                                                                if (isActive) { next.delete(pedal.id) } else { next.add(pedal.id) }
                                                                                setActivePedalIds(next)
                                                                                setUserEffects(
                                                                                    collectionPedals.filter(p => next.has(p.id)).map(p => p.name).join(", ")
                                                                                )
                                                                            }}
                                                                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${isActive
                                                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 shadow-sm'
                                                                                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
                                                                                }`}
                                                                        >
                                                                            {isActive && <Check className="h-3 w-3" />}
                                                                            {pedal.name}
                                                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isActive ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                                                                {PEDAL_CATEGORY_LABELS[pedal.category]?.substring(0, 2) || pedal.category.substring(0, 2).toUpperCase()}
                                                                            </span>
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1a1a] dark:to-[#222] border border-slate-200 dark:border-white/10 rounded-2xl text-center space-y-3">
                                                            <div className="bg-white dark:bg-[#333] h-12 w-12 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                                                                <SlidersHorizontal className="h-6 w-6 text-slate-300" />
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No pedals in your collection</p>
                                                            <p className="text-xs text-slate-400">Add your pedals in the Collection page to select them here</p>
                                                            <Link href="/collection">
                                                                <Button variant="outline" className="text-xs font-bold h-9 mt-1 rounded-lg border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                                    Go to Collection
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* MULTI FX TAB */}
                                            {effectsType === 'multi' && (
                                                <div className="space-y-4">
                                                    {collectionMultiFx.length > 0 ? (
                                                        <>
                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Your Multi FX Units</span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {collectionMultiFx.map((unit) => {
                                                                    const isActive = activeMultiFxId === unit.id
                                                                    return (
                                                                        <button
                                                                            key={unit.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (isActive) {
                                                                                    setActiveMultiFxId(null)
                                                                                    setUserEffects("")
                                                                                } else {
                                                                                    setActiveMultiFxId(unit.id)
                                                                                    setUserEffects(unit.name + " (" + unit.brand + ")")
                                                                                }
                                                                            }}
                                                                            className={`p-4 rounded-xl border text-left transition-all ${isActive
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800/30 shadow-md'
                                                                                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{unit.brand} {unit.name}</span>
                                                                                {isActive && (
                                                                                    <div className="bg-blue-600 text-white h-5 w-5 rounded-full flex items-center justify-center">
                                                                                        <Check className="h-3 w-3" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                                                                                {MULTI_FX_TYPE_LABELS[unit.type]}
                                                                            </span>
                                                                            {unit.ampsCount && (
                                                                                <span className="text-[10px] text-slate-400 ml-2">{unit.ampsCount} amps</span>
                                                                            )}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1a1a] dark:to-[#222] border border-slate-200 dark:border-white/10 rounded-2xl text-center space-y-3">
                                                            <div className="bg-white dark:bg-[#333] h-12 w-12 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                                                                <Cpu className="h-6 w-6 text-slate-300" />
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Multi FX units in your collection</p>
                                                            <p className="text-xs text-slate-400">Add your multi-effects unit in the Collection page</p>
                                                            <Link href="/collection">
                                                                <Button variant="outline" className="text-xs font-bold h-9 mt-1 rounded-lg border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                                    Go to Collection
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ========== BASS GEAR UI ========== */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {/* Bass Guitar Dropdown */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Music2 className="h-4 w-4 text-violet-500" />
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bass Guitar</Label>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-12 px-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20 focus:border-violet-400 transition-all text-slate-700 dark:text-slate-200 appearance-none cursor-pointer hover:border-violet-300"
                                            value={userGuitar}
                                            onChange={(e) => setUserGuitar(e.target.value)}
                                        >
                                            <option value="">Select bass...</option>
                                            <option value="Fender Precision Bass">Fender Precision Bass</option>
                                            <option value="Fender Jazz Bass">Fender Jazz Bass</option>
                                            <option value="Music Man StingRay">Music Man StingRay</option>
                                            <option value="Rickenbacker 4003">Rickenbacker 4003</option>
                                            <option value="Gibson Thunderbird">Gibson Thunderbird</option>
                                            <option value="Ibanez SR Series">Ibanez SR Series</option>
                                            <option value="Yamaha BB Series">Yamaha BB Series</option>
                                            <option value="Warwick Thumb">Warwick Thumb</option>
                                            <option value="Hofner Violin Bass">Höfner Violin Bass</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-violet-500 transition-colors">
                                            <ArrowLeft className="h-4 w-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bass Amplifier Dropdown */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Speaker className="h-4 w-4 text-violet-500" />
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bass Amplifier</Label>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-12 px-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20 focus:border-violet-400 transition-all text-slate-700 dark:text-slate-200 appearance-none cursor-pointer hover:border-violet-300"
                                            value={userAmp}
                                            onChange={(e) => setUserAmp(e.target.value)}
                                        >
                                            <option value="">Select bass amp...</option>
                                            <option value="Ampeg SVT Classic">Ampeg SVT Classic</option>
                                            <option value="Fender Bassman">Fender Bassman</option>
                                            <option value="Gallien-Krueger 800RB">Gallien-Krueger 800RB</option>
                                            <option value="Hartke HA3500">Hartke HA3500</option>
                                            <option value="Markbass Little Mark">Markbass Little Mark</option>
                                            <option value="Mesa Boogie Subway">Mesa Boogie Subway</option>
                                            <option value="Orange Terror Bass">Orange Terror Bass</option>
                                            <option value="Trace Elliot">Trace Elliot</option>
                                            <option value="Darkglass Microtubes">Darkglass Microtubes</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-violet-500 transition-colors">
                                            <ArrowLeft className="h-4 w-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ==================== STEP 2: SONG & PART ==================== */}
                <Card className="border-none shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm">
                    <CardHeader className="bg-slate-50/80 dark:bg-[#1a1a1a]/80 border-b border-slate-100 dark:border-white/5 p-4 md:p-8 flex flex-row items-center gap-3 md:gap-5">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-lg shadow-blue-500/20 shrink-0">
                            2
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Song & Part</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Identify the track and tone you want to capture</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10">
                        <div className="space-y-10">

                            {/* Song Search */}
                            <div className="space-y-4 relative">
                                <div className="flex items-center gap-2">
                                    <Music2 className="h-4 w-4 text-blue-500" />
                                    <Label htmlFor="song" className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Target Song</Label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="song"
                                        placeholder="Search for a song (e.g. Master of Puppets)..."
                                        value={songTitle}
                                        onChange={(e) => {
                                            setSongTitle(e.target.value);
                                            setIsSearching(true);
                                        }}
                                        onFocus={() => setIsSearching(true)}
                                        className="h-14 pl-12 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-lg font-medium shadow-sm focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {songTitle && !isSearching && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-in fade-in">Found</span>}
                                        {isSearching && songTitle.length > 2 && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                                    </div>
                                </div>

                                {/* Autocomplete Dropdown */}
                                {isSearching && searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {searchResults.map((result: any, index: number) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    setSongTitle(result.trackName);
                                                    setArtist(result.artistName);
                                                    setIsSearching(false);
                                                    setSearchResults([]);
                                                }}
                                                className="flex items-center gap-4 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                                            >
                                                <div className="h-10 w-10 bg-slate-100 rounded-md overflow-hidden shrink-0">
                                                    {result.artworkUrl && <img src={result.artworkUrl} alt="Art" className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{result.trackName}</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{result.artistName} • {result.albumName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Artist Input */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <Label htmlFor="artist" className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Artist</Label>
                                </div>
                                <div className="relative group">
                                    <Input
                                        id="artist"
                                        placeholder={songTitle ? "Detecting artist..." : "Waiting for song..."}
                                        value={artist}
                                        onChange={(e) => setArtist(e.target.value)}
                                        className="h-12 bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium border rounded-xl focus:bg-white dark:focus:bg-[#222] transition-all shadow-inner"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <Sparkles className="h-4 w-4 opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Part Type Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4 text-blue-500" />
                                    <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Part Type</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <div
                                        onClick={() => setPartType("riff")}
                                        className={`cursor-pointer relative overflow-hidden border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 group ${partType === 'riff' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md scale-[1.02]' : 'border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-700/30 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] bg-white dark:bg-[#111]'}`}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${partType === 'riff' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-500'}`}>
                                            <GuitarIcon className="h-6 w-6" />
                                        </div>
                                        <span className={`font-bold text-sm uppercase tracking-wide ${partType === 'riff' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Rhythm / Riff</span>
                                        {partType === 'riff' && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500 shadow-sm" />}
                                    </div>
                                    <div
                                        onClick={() => setPartType("solo")}
                                        className={`cursor-pointer relative overflow-hidden border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 group ${partType === 'solo' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md scale-[1.02]' : 'border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-700/30 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] bg-white dark:bg-[#111]'}`}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${partType === 'solo' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-500'}`}>
                                            <Music className="h-6 w-6" />
                                        </div>
                                        <span className={`font-bold text-sm uppercase tracking-wide ${partType === 'solo' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Lead / Solo</span>
                                        {partType === 'solo' && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500 shadow-sm" />}
                                    </div>
                                </div>
                            </div>

                            {/* Tone Type Section - YELLOW BOX */}
                            <div className="p-8 bg-[#FFF9E5] rounded-2xl border border-yellow-200/60 shadow-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                            <Sparkles className="h-5 w-5 fill-current" />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-bold text-slate-800">Tone Type</Label>
                                            <span className="text-xs text-slate-500 font-medium tracking-wide">
                                                {instrument === 'guitar'
                                                    ? 'Select whether you want a clean or distorted guitar tone.'
                                                    : 'Select whether you want a clean or distorted bass tone.'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <span className="bg-[#FEF08A] text-yellow-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-yellow-200 shadow-sm">
                                        Required
                                    </span>
                                </div>

                                {instrument === 'guitar' ? (
                                    /* Guitar: 3-column (Auto/Clean/Distorted) */
                                    <div className="grid grid-cols-3 gap-4 relative z-10">
                                        <button
                                            type="button"
                                            onClick={() => setToneType("auto")}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-200 ${toneType === 'auto' ? 'border-emerald-500 bg-white dark:bg-[#111] ring-2 ring-emerald-500/20 shadow-md scale-[1.02]' : 'border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#111]/50 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-emerald-200 text-slate-500'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${toneType === 'auto' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-[#222] text-slate-400'}`}>
                                                <Search className="h-4 w-4" />
                                            </div>
                                            <span className={`font-bold text-xs uppercase tracking-wide ${toneType === 'auto' ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>Auto</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setToneType("clean")}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-200 ${toneType === 'clean' ? 'border-blue-500 bg-white dark:bg-[#111] ring-2 ring-blue-500/20 shadow-md scale-[1.02]' : 'border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#111]/50 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-blue-200 text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${toneType === 'clean' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 dark:bg-[#222] text-slate-400'}`}>
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            <span className={`font-bold text-xs uppercase tracking-wide ${toneType === 'clean' ? 'text-blue-700 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>Clean</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setToneType("distorted")}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-200 ${toneType === 'distorted' ? 'border-indigo-500 bg-white dark:bg-[#111] ring-2 ring-indigo-500/20 shadow-md scale-[1.02]' : 'border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#111]/50 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-indigo-200 text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${toneType === 'distorted' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 dark:bg-[#222] text-slate-400'}`}>
                                                <Flame className="h-4 w-4 fill-current" />
                                            </div>
                                            <span className={`font-bold text-xs uppercase tracking-wide ${toneType === 'distorted' ? 'text-indigo-700 dark:text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`}>Distorted</span>
                                        </button>
                                    </div>
                                ) : (
                                    /* Bass: 2-column (Clean/Distorted with Gain labels) */
                                    <div className="grid grid-cols-2 gap-6 relative z-10">
                                        <button
                                            type="button"
                                            onClick={() => setToneType("clean")}
                                            className={`border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-200 ${toneType === 'clean' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/20 shadow-lg scale-[1.02]' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-700/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'}`}
                                        >
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${toneType === 'clean' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <span className={`font-bold text-sm ${toneType === 'clean' ? 'text-blue-700' : 'text-slate-700'}`}>Clean</span>
                                                <span className={`block text-xs ${toneType === 'clean' ? 'text-blue-500' : 'text-slate-400'}`}>Gain = 0</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setToneType("distorted")}
                                            className={`border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-200 ${toneType === 'distorted' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20 shadow-lg scale-[1.02]' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-indigo-300 dark:hover:border-indigo-700/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}
                                        >
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${toneType === 'distorted' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Flame className="h-6 w-6" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <span className={`font-bold text-sm ${toneType === 'distorted' ? 'text-indigo-700' : 'text-slate-700'}`}>Distorted</span>
                                                <span className={`block text-xs ${toneType === 'distorted' ? 'text-indigo-500' : 'text-slate-400'}`}>Gain &gt; 0</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ==================== PROMO BANNER ==================== */}
                {/* ==================== PROMO BANNER ==================== */}
                <div className="w-full bg-[#EFF6FF] dark:bg-[#1e293b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left border border-blue-50 dark:border-white/5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles className="h-24 w-24 text-blue-600" />
                    </div>

                    <div className="space-y-2 relative z-10 max-w-xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">New here?</span>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                            Try Tonelify free for a limited time
                        </h3>
                        <p className="text-[#059669] font-medium text-sm">
                            Start a free trial and unlock full adaptations, tone saving, and presets.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 relative z-10 shrink-0">
                        <Link href="/plans">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-blue-200 transition-transform hover:scale-105">
                                Start Free Trial
                            </Button>
                        </Link>
                        <span className="text-[10px] text-slate-400">Cancel anytime during your trial · No long-term commitment</span>
                    </div>
                </div>

                {/* ==================== RUN RESEARCH BUTTON ==================== */}
                <div className="w-full space-y-6">
                    <div className="flex justify-center">
                        <Button
                            onClick={runResearch}
                            disabled={isLoading}
                            className="h-14 px-8 text-lg bg-[#81A3F8] hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-100 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 w-full max-w-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Analyzing Tone...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="h-5 w-5" />
                                    <span>{instrument === 'bass' ? 'Research & Adapt' : 'Run Research'}</span>
                                </>
                            )}
                        </Button>
                        {instrument === 'bass' && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                                <span className="text-slate-300">ⓘ</span>
                                Select your bass and amp above to enable research
                            </p>
                        )}
                    </div>

                    {result && (
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <a
                                href={`https://www.songsterr.com/?pattern=${encodeURIComponent((songTitle || "") + " " + (artist || ""))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="h-10 px-6 rounded-full border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 bg-white font-medium text-xs flex items-center gap-2 transition-all">
                                    <ExternalLink className="h-3 w-3" />
                                    Open Songsterr Tab
                                </Button>
                            </a>
                            <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((songTitle || "") + " " + (artist || "") + " backing track")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="h-10 px-6 rounded-full border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 bg-white font-medium text-xs flex items-center gap-2 transition-all">
                                    <PlayCircle className="h-3 w-3" />
                                    Find Backing Track
                                </Button>
                            </a>
                        </div>
                    )}
                </div>

                {/* ==================== STEP 3: RESULTS ==================== */}
                {/* ==================== STEP 3: RESULTS ==================== */}
                {/* ==================== STEP 3: RESULTS ==================== */}
                <Card className="border-none shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-8 flex flex-row items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 shrink-0">
                            3
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">One-Click Adaptation</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">AI-generated settings for your specific gear</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10">
                        {error && (
                            <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg text-sm mb-6 flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        {!result ? (
                            // Empty State (Pre-computation)
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                {/* Original Tone Placeholder */}
                                <div className="flex flex-col items-center text-center space-y-6 group">
                                    <div className="flex items-center gap-3 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-slate-200 text-slate-500 p-2 rounded-lg">
                                            <Music2 className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-xl text-slate-400">Original Tone</h3>
                                    </div>

                                    <div className="flex flex-col items-center justify-center h-56 w-full border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 group-hover:bg-slate-50 group-hover:border-slate-300 transition-all">
                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                            <Search className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h4 className="font-bold text-slate-700 text-lg">Awaiting Input</h4>
                                        <p className="text-sm text-slate-400 max-w-[200px] mt-2 leading-relaxed">
                                            Select a song and run research to analyze the original track's signal chain
                                        </p>
                                    </div>
                                </div>

                                {/* Adapted Tone Placeholder */}
                                <div className="flex flex-col items-center text-center space-y-6 group">
                                    <div className="flex items-center gap-3 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-slate-200 text-slate-500 p-2 rounded-lg">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-xl text-slate-400">Your Adaptation</h3>
                                    </div>

                                    <div className="flex flex-col items-center justify-center h-56 w-full border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 group-hover:bg-slate-50 group-hover:border-slate-300 transition-all">
                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                            <Sparkles className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h4 className="font-bold text-slate-700 text-lg">Ready to Generate</h4>
                                        <p className="text-sm text-slate-400 max-w-[200px] mt-2 leading-relaxed">
                                            AI will calculate the optimal settings for your {userGuitar || "guitar"} and {userAmp || "amp"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Actual Results
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="bg-white p-3 rounded-full shadow-sm h-fit text-indigo-600">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-indigo-900">AI Tone Analysis</h4>
                                            <p className="italic text-indigo-800 text-lg leading-relaxed">"{result.explanation}"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Original vs Adapted Tone Comparison ── */}
                                {result.original_tone && result.adapted_tone && (
                                    <div className="space-y-6">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-white">
                                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg"><Sparkles className="h-6 w-6" /></span>
                                            Tone Comparison
                                        </h3>

                                        {/* Desktop: Side-by-side */}
                                        <div className="hidden md:grid md:grid-cols-2 gap-6">
                                            {/* LEFT: Original Tone */}
                                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                        <Music className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">Original Setup</h4>
                                                        <p className="text-sm text-slate-400">What the artist used</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Guitar</p>
                                                        <p className="text-white font-medium">{result.original_tone.guitar}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Amplifier</p>
                                                        <p className="text-white font-medium">{result.original_tone.amp}</p>
                                                    </div>
                                                    {result.original_tone.pickups && (
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Pickups</p>
                                                            <p className="text-white font-medium">{result.original_tone.pickups}</p>
                                                        </div>
                                                    )}

                                                    {/* Original Amp Settings */}
                                                    <div className="pt-4 border-t border-slate-700">
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Amp Settings</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {result.original_tone.settings && Object.entries(result.original_tone.settings).map(([key, value]: [string, any]) => (
                                                                <div key={key} className="bg-slate-800/60 rounded-xl p-3 text-center">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{key}</p>
                                                                    <p className="text-2xl font-bold text-slate-300 font-mono">{value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Original Effects */}
                                                    {result.original_tone.effects && result.original_tone.effects.length > 0 && (
                                                        <div className="pt-4 border-t border-slate-700">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Effects</p>
                                                            <div className="space-y-2">
                                                                {result.original_tone.effects.map((effect: any, idx: number) => (
                                                                    <div key={idx} className="bg-slate-800/60 rounded-lg p-3">
                                                                        <p className="text-sm text-white font-medium">{effect.name}</p>
                                                                        <p className="text-xs text-slate-400 mt-0.5">{effect.settings}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* RIGHT: Adapted Tone */}
                                            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl p-6 border border-blue-700 relative">
                                                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                                                    ✨ For Your Gear
                                                </div>

                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                        <Target className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">Your Adapted Settings</h4>
                                                        <p className="text-sm text-blue-300">AI-adjusted for your gear</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-1">Your Guitar</p>
                                                        <p className="text-white font-medium">{userGuitar || "Not specified"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-1">Your Amp</p>
                                                        <p className="text-white font-medium">{userAmp || "Not specified"}</p>
                                                    </div>

                                                    {/* Adapted Settings with Diff */}
                                                    <div className="pt-4 border-t border-blue-800">
                                                        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-3">AI-Adjusted Settings</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {result.adapted_tone.settings && Object.entries(result.adapted_tone.settings).map(([key, value]: [string, any]) => {
                                                                const original = result.original_tone?.settings?.[key]
                                                                const diff = typeof value === "number" && typeof original === "number" ? value - original : 0
                                                                const adjustment = result.adapted_tone?.adjustments?.[key]
                                                                return (
                                                                    <div key={key} className="bg-blue-900/50 rounded-xl p-3 text-center relative group cursor-help">
                                                                        <p className="text-[10px] text-blue-300 uppercase font-bold mb-1">{key}</p>
                                                                        <div className="flex items-baseline justify-center gap-1">
                                                                            <p className="text-2xl font-bold text-white font-mono">{value}</p>
                                                                            {diff !== 0 && (
                                                                                <span className={`text-xs font-bold ${diff > 0 ? "text-green-400" : "text-orange-400"}`}>
                                                                                    {diff > 0 ? "+" : ""}{diff}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {/* Tooltip */}
                                                                        {adjustment && (
                                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-52 text-center z-20 leading-relaxed">
                                                                                {adjustment}
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile: Stacked */}
                                        <div className="md:hidden space-y-4">
                                            {/* Adapted (default visible) */}
                                            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl p-5 border border-blue-700 relative">
                                                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg">
                                                    ✨ For Your Gear
                                                </div>
                                                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-blue-400" /> Your Adapted Settings
                                                </h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {result.adapted_tone.settings && Object.entries(result.adapted_tone.settings).map(([key, value]: [string, any]) => {
                                                        const original = result.original_tone?.settings?.[key]
                                                        const diff = typeof value === "number" && typeof original === "number" ? value - original : 0
                                                        return (
                                                            <div key={key} className="bg-blue-900/50 rounded-xl p-2.5 text-center">
                                                                <p className="text-[9px] text-blue-300 uppercase font-bold mb-0.5">{key}</p>
                                                                <div className="flex items-baseline justify-center gap-0.5">
                                                                    <p className="text-xl font-bold text-white font-mono">{value}</p>
                                                                    {diff !== 0 && (
                                                                        <span className={`text-[10px] font-bold ${diff > 0 ? "text-green-400" : "text-orange-400"}`}>
                                                                            {diff > 0 ? "+" : ""}{diff}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* Original (expandable) */}
                                            <details className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                                                <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-800/50 transition">
                                                    <div className="flex items-center gap-2">
                                                        <Music className="w-4 h-4 text-purple-400" />
                                                        <span className="font-bold text-white text-sm">Show Original Setup</span>
                                                    </div>
                                                </summary>
                                                <div className="px-4 pb-4 space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Guitar</p>
                                                        <p className="text-white text-sm">{result.original_tone.guitar}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Amp</p>
                                                        <p className="text-white text-sm">{result.original_tone.amp}</p>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                                        {result.original_tone.settings && Object.entries(result.original_tone.settings).map(([key, value]: [string, any]) => (
                                                            <div key={key} className="bg-slate-800/60 rounded-lg p-2 text-center">
                                                                <p className="text-[9px] text-slate-500 uppercase font-bold">{key}</p>
                                                                <p className="text-lg font-bold text-slate-300 font-mono">{value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </details>
                                        </div>

                                        {/* Gear Differences */}
                                        {result.gear_differences && result.gear_differences.length > 0 && (
                                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5">
                                                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-3 flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4" />
                                                    Key Gear Adjustments
                                                </h4>
                                                <div className="space-y-2">
                                                    {result.gear_differences.map((diff: string, idx: number) => (
                                                        <div key={idx} className="flex gap-2 text-sm">
                                                            <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                                                            <span className="text-amber-800 dark:text-amber-200 leading-relaxed">{diff}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-white">
                                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><GuitarIcon className="h-6 w-6" /></span>
                                            {instrument === 'guitar' ? 'Guitar' : 'Bass'} Settings
                                        </h3>
                                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 space-y-4 border border-slate-100 dark:border-white/5 shadow-lg shadow-slate-100/50 dark:shadow-none">
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Pickup Position</span>
                                                <span className="font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-[#222] px-3 py-1 rounded-md">{result.suggestedSettings?.guitar?.pickupSelector}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Volume Knob</span>
                                                <span className="font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-[#222] px-3 py-1 rounded-md">{result.suggestedSettings?.guitar?.volume}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tone Knob</span>
                                                <span className="font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-[#222] px-3 py-1 rounded-md">{result.suggestedSettings?.guitar?.tone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-white">
                                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Speaker className="h-6 w-6" /></span>
                                            Amp Settings
                                        </h3>
                                        <div className="bg-stone-900 text-white rounded-2xl p-6 space-y-4 border border-stone-800 shadow-xl shadow-stone-900/20 relative overflow-hidden">
                                            {/* Mesh pattern overlay */}
                                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none"></div>

                                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Gain</span>
                                                    <div className="font-mono text-2xl text-amber-400 font-bold">{result.suggestedSettings?.amp?.gain}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Bass</span>
                                                    <div className="font-mono text-2xl text-white font-bold">{result.suggestedSettings?.amp?.bass}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Mids</span>
                                                    <div className="font-mono text-2xl text-white font-bold">{result.suggestedSettings?.amp?.mid}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Treble</span>
                                                    <div className="font-mono text-2xl text-white font-bold">{result.suggestedSettings?.amp?.treble}</div>
                                                </div>
                                            </div>
                                            <div className="pt-4 mt-2 border-t border-stone-800 flex justify-between items-center relative z-10">
                                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Master Vol</span>
                                                <div className="font-mono text-xl text-white font-bold bg-stone-800 px-3 py-1 rounded-md border border-stone-700">{result.suggestedSettings?.amp?.master}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Effects Chain */}
                                {result.suggestedSettings?.pedals && result.suggestedSettings.pedals.length > 0 && (
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-white">
                                            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><SlidersHorizontal className="h-6 w-6" /></span>
                                            Effects Chain
                                        </h3>
                                        <div className="grid gap-3">
                                            {result.suggestedSettings.pedals.map((pedal: any, index: number) => (
                                                <div key={index} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-2xl p-5 border border-orange-100 dark:border-orange-800/20 shadow-sm flex items-start gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400 font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{pedal.name}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{pedal.settings}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Playing Tips */}
                                {result.playingTips && result.playingTips.length > 0 && (
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-white">
                                            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><GuitarIcon className="h-6 w-6" /></span>
                                            Playing Tips
                                        </h3>
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/20 shadow-sm">
                                            <ul className="space-y-3">
                                                {result.playingTips.map((tip: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <span className="h-6 w-6 rounded-full bg-emerald-200 dark:bg-emerald-800/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                            {index + 1}
                                                        </span>
                                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{tip}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {user && (
                                    <div className="flex justify-center pt-8">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || isSaved}
                                            className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200/50 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                        >
                                            {isSaved ? (
                                                <>✓ Saved to Library</>
                                            ) : isSaving ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                    Saving Tone...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 mr-2" />
                                                    Save to Tone Library
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
