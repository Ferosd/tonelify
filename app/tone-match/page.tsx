"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Guitar as GuitarIcon, Music2, Music, Flame, Search, Target, Sparkles, Lightbulb, Speaker, User, ExternalLink, PlayCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TrendingTones } from "@/components/TrendingTones"
import { useDebounce } from "@/hooks/useDebounce"
import { useEffect } from "react"

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

    // Step 2: Song Details State
    const [partType, setPartType] = useState<"riff" | "solo">("riff")
    const [toneType, setToneType] = useState<"auto" | "clean" | "distorted">("auto")

    // API State
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

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
        <div className="min-h-screen bg-[#08080C] pb-20 font-sans">
            {/* Header Section */}
            <div className="text-center pt-8 md:pt-12 pb-6 md:pb-8 space-y-4 md:space-y-6 bg-[#0E0E14] border-b border-white/8 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8712A]/10 text-[#E8712A] text-xs font-semibold">
                    <span>⚡</span> Gear-Matched Tone Settings
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#F2F0ED]">
                    Tonelify
                </h1>
                <p className="text-[#8A8494] text-base md:text-lg max-w-2xl mx-auto font-light">
                    Transform legendary {instrument === 'guitar' ? 'guitar' : 'bass'} tones to match your gear
                </p>

                {/* Instrument Toggle */}
                <div className="flex justify-center mt-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#12121A] p-1 rounded-xl border border-white/8 inline-flex">
                        <button
                            onClick={() => setInstrument("guitar")}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${instrument === "guitar"
                                ? "bg-[#9B5DE5] text-white shadow-md"
                                : "text-[#8A8494] hover:text-[#F2F0ED]"
                                }`}
                        >
                            <GuitarIcon className="h-4 w-4" />
                            Guitar
                        </button>
                        <button
                            onClick={() => setInstrument("bass")}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${instrument === "bass"
                                ? "bg-[#9B5DE5] text-white shadow-md"
                                : "text-[#8A8494] hover:text-[#F2F0ED]"
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
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <span className="font-bold">NEW</span>
                            <span className="opacity-80">• Bass adaptation is brand new — results may vary</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="container max-w-5xl px-3 md:px-4 py-4 md:py-8 mx-auto space-y-6 md:space-y-8">

                {/* Trending Section */}
                <TrendingTones />

                {/* ==================== STEP 1: YOUR GEAR ==================== */}
                <Card className="border border-white/8 overflow-hidden bg-[#0E0E14]">
                    <CardHeader className="bg-white/3 border-b border-white/8 p-4 md:p-8 flex flex-row items-center gap-3 md:gap-5">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-[#E8712A] text-[#08080C] flex items-center justify-center font-bold text-lg md:text-xl shadow-lg shadow-[#E8712A]/20 shrink-0">
                            1
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-[#F2F0ED] tracking-tight">Your Gear</h2>
                            <p className="text-[#8A8494] font-medium text-sm md:text-base">Select your current equipment configuration</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10">
                        {instrument === 'guitar' ? (
                            /* ========== GUITAR GEAR UI ========== */
                            <div className="space-y-10">

                                {/* Saved Preset Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-[#E8712A]" />
                                        <Label className="text-xs font-extrabold text-[#8A8494] uppercase tracking-widest">Load Preset</Label>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 px-4 bg-[#12121A] border border-white/8 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 transition-colors text-[#F2F0ED] appearance-none cursor-pointer hover:border-[#E8712A]/40"
                                            value={preset}
                                            onChange={(e) => handlePresetChange(e.target.value)}
                                        >
                                            <option value="manual">Select a preset...</option>
                                            <option value="preset1">My Clean Setup (Strat + Twin)</option>
                                            <option value="preset2">Live Rig (Les Paul + JCM800)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A8494] group-hover:text-[#E8712A] transition-colors">
                                            <ArrowLeft className="h-4 w-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/8"></div>
                                    <span className="flex-shrink-0 mx-6 text-[10px] font-extrabold text-[#8A8494] uppercase tracking-widest">Or Configure Manually</span>
                                    <div className="flex-grow border-t border-white/8"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Guitar Input */}
                                    <div className="space-y-4 group">
                                        <div className="flex items-center gap-2">
                                            <GuitarIcon className="h-4 w-4 text-[#8A8494] group-focus-within:text-[#E8712A] transition-colors" />
                                            <Label htmlFor="guitar" className="text-xs font-bold text-[#8A8494] uppercase tracking-wide group-focus-within:text-[#E8712A] transition-colors">Guitar Model</Label>
                                        </div>
                                        <input
                                            id="guitar"
                                            placeholder="e.g. Fender Stratocaster"
                                            value={userGuitar}
                                            onChange={(e) => setUserGuitar(e.target.value)}
                                            className="w-full h-12 px-4 bg-[#12121A] border border-white/8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 placeholder:text-[#8A8494] transition-colors shadow-sm text-[#F2F0ED]"
                                        />
                                        <p className="text-[10px] text-[#8A8494] cursor-pointer hover:text-[#E8712A] transition-colors font-medium pl-1">
                                            Can't find your model? Type generic type (e.g. "S-Type")
                                        </p>
                                    </div>

                                    {/* Amp Input */}
                                    <div className="space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Speaker className="h-4 w-4 text-[#8A8494] group-focus-within:text-[#E8712A] transition-colors" />
                                                <Label htmlFor="amp" className="text-xs font-bold text-[#8A8494] uppercase tracking-wide group-focus-within:text-[#E8712A] transition-colors">Amplifier</Label>
                                            </div>

                                            {/* Custom Toggle */}
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group/toggle"
                                                onClick={() => setGoingDirect(!goingDirect)}
                                            >
                                                <Label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${goingDirect ? 'text-[#E8712A]' : 'text-[#8A8494] group-hover/toggle:text-[#F2F0ED]'}`}>
                                                    Going Direct
                                                </Label>
                                                <div className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${goingDirect ? 'bg-[#E8712A] shadow-inner' : 'bg-white/15'}`}>
                                                    <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform duration-300 ${goingDirect ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            id="amp"
                                            placeholder="e.g. Fender Twin Reverb"
                                            value={userAmp}
                                            onChange={(e) => setUserAmp(e.target.value)}
                                            className="w-full h-12 px-4 bg-[#12121A] border border-white/8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 placeholder:text-[#8A8494] transition-colors shadow-sm disabled:opacity-40 disabled:bg-[#0E0E14] text-[#F2F0ED]"
                                            disabled={goingDirect}
                                        />
                                    </div>
                                </div>

                                {/* Effects Section */}
                                <div className="space-y-5 pt-2">
                                    <Label className="text-sm font-bold text-[#F2F0ED] flex items-center gap-2">
                                        Signal Chain / Effects
                                        <span className="text-xs font-normal text-[#8A8494] ml-auto bg-white/5 px-2 py-1 rounded-md">Optional</span>
                                    </Label>

                                    <div className={`p-1 rounded-xl border flex transition-colors ${userAmp || goingDirect ? 'bg-[#12121A] border-white/8' : 'bg-white/3 border-white/5 opacity-60'}`}>
                                        <button
                                            type="button"
                                            onClick={() => setEffectsType("pedals")}
                                            disabled={!userAmp && !goingDirect}
                                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${effectsType === 'pedals' ? 'bg-[#1A1A22] shadow-sm text-[#E8712A] ring-1 ring-white/10' : 'text-[#8A8494] hover:text-[#F2F0ED]'}`}
                                        >
                                            Pedals & Stompboxes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEffectsType("multi")}
                                            disabled={!userAmp && !goingDirect}
                                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${effectsType === 'multi' ? 'bg-[#1A1A22] shadow-sm text-[#E8712A] ring-1 ring-white/10' : 'text-[#8A8494] hover:text-[#F2F0ED]'}`}
                                        >
                                            Multi FX Unit
                                        </button>
                                    </div>

                                    {effectsType === 'pedals' && (
                                        <div className="relative">
                                            <Textarea
                                                placeholder="List your pedals in order (e.g. Tuner > Tube Screamer > Chorus > Delay)"
                                                value={userEffects}
                                                onChange={(e) => setUserEffects(e.target.value)}
                                                className="resize-none min-h-[120px] bg-[#12121A] border-white/8 focus:border-[#E8712A]/60 focus:ring-2 focus:ring-[#E8712A]/20 rounded-xl p-4 text-sm leading-relaxed shadow-sm transition-colors text-[#F2F0ED] placeholder:text-[#8A8494]"
                                                disabled={!userAmp && !goingDirect}
                                            />
                                            <div className="absolute bottom-3 right-3 text-[#8A8494]">
                                                <Target className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                    {effectsType === 'multi' && (
                                        <div className="p-6 bg-[#9B5DE5]/5 border border-[#9B5DE5]/20 rounded-xl flex items-start gap-4">
                                            <div className="bg-[#9B5DE5]/10 p-2 rounded-lg text-[#9B5DE5]">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-[#F2F0ED] text-sm">Using a Multi-FX Unit?</h4>
                                                <p className="text-sm text-[#8A8494] leading-relaxed">
                                                    For best results with Helix, Kemper, or Axe-FX, we recommend adding your specific unit in <Link href="/settings" className="font-bold text-[#9B5DE5] hover:text-[#8B4DD5] underline underline-offset-2">Account Settings</Link>.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ========== BASS GEAR UI ========== */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {/* Bass Guitar Dropdown */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Music2 className="h-4 w-4 text-[#9B5DE5]" />
                                        <Label className="text-xs font-bold text-[#8A8494] uppercase tracking-wide">Bass Guitar</Label>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-12 px-4 bg-[#12121A] border border-white/8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9B5DE5]/20 focus:border-[#9B5DE5]/60 transition-colors text-[#F2F0ED] appearance-none cursor-pointer hover:border-[#9B5DE5]/40"
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
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A8494] group-hover:text-[#9B5DE5] transition-colors">
                                            <ArrowLeft className="h-4 w-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bass Amplifier Dropdown */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Speaker className="h-4 w-4 text-[#9B5DE5]" />
                                        <Label className="text-xs font-bold text-[#8A8494] uppercase tracking-wide">Bass Amplifier</Label>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-12 px-4 bg-[#12121A] border border-white/8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9B5DE5]/20 focus:border-[#9B5DE5]/60 transition-colors text-[#F2F0ED] appearance-none cursor-pointer hover:border-[#9B5DE5]/40"
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
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A8494] group-hover:text-[#9B5DE5] transition-colors">
                                            <ArrowLeft className="h-4 w-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ==================== STEP 2: SONG & PART ==================== */}
                <Card className="border border-white/8 overflow-hidden bg-[#0E0E14]">
                    <CardHeader className="bg-white/3 border-b border-white/8 p-4 md:p-8 flex flex-row items-center gap-3 md:gap-5">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-[#E8712A] text-[#08080C] flex items-center justify-center font-bold text-lg md:text-xl shadow-lg shadow-[#E8712A]/20 shrink-0">
                            2
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-[#F2F0ED] tracking-tight">Song & Part</h2>
                            <p className="text-[#8A8494] font-medium text-sm md:text-base">Identify the track and tone you want to capture</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10">
                        <div className="space-y-10">

                            {/* Song Search */}
                            <div className="space-y-4 relative">
                                <div className="flex items-center gap-2">
                                    <Music2 className="h-4 w-4 text-[#E8712A]" />
                                    <Label htmlFor="song" className="text-xs font-extrabold text-[#8A8494] uppercase tracking-widest">Target Song</Label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8494] group-focus-within:text-[#E8712A] transition-colors">
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
                                        className="h-14 pl-12 bg-[#12121A] border border-white/8 rounded-xl text-lg font-medium shadow-sm focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 transition-colors placeholder:text-[#8A8494] text-[#F2F0ED]"
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {songTitle && !isSearching && <span className="text-xs font-bold text-[#E8712A] bg-[#E8712A]/10 px-2 py-1 rounded-md animate-in fade-in">Found</span>}
                                        {isSearching && songTitle.length > 2 && <Loader2 className="h-4 w-4 animate-spin text-[#8A8494]" />}
                                    </div>
                                </div>

                                {/* Autocomplete Dropdown */}
                                {isSearching && searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-[#12121A] border border-white/8 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {searchResults.map((result: any, index: number) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    setSongTitle(result.trackName);
                                                    setArtist(result.artistName);
                                                    setIsSearching(false);
                                                    setSearchResults([]);
                                                }}
                                                className="flex items-center gap-4 p-3 hover:bg-[#E8712A]/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                            >
                                                <div className="h-10 w-10 bg-white/8 rounded-md overflow-hidden shrink-0">
                                                    {result.artworkUrl && <img src={result.artworkUrl} alt="Art" className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#F2F0ED] text-sm">{result.trackName}</span>
                                                    <span className="text-xs text-[#8A8494]">{result.artistName} • {result.albumName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Artist Input */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#E8712A]" />
                                    <Label htmlFor="artist" className="text-xs font-extrabold text-[#8A8494] uppercase tracking-widest">Artist</Label>
                                </div>
                                <div className="relative group">
                                    <Input
                                        id="artist"
                                        placeholder={songTitle ? "Detecting artist..." : "Waiting for song..."}
                                        value={artist}
                                        onChange={(e) => setArtist(e.target.value)}
                                        className="h-12 bg-[#12121A] border-white/8 text-[#F2F0ED] font-medium border rounded-xl focus:bg-[#1A1A22] transition-colors placeholder:text-[#8A8494]"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8494] pointer-events-none">
                                        <Sparkles className="h-4 w-4 opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Part Type Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4 text-[#E8712A]" />
                                    <Label className="text-xs font-extrabold text-[#8A8494] uppercase tracking-widest">Part Type</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <div
                                        onClick={() => setPartType("riff")}
                                        className={`cursor-pointer relative overflow-hidden border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group ${partType === 'riff' ? 'border-[#E8712A] bg-[#E8712A]/5 shadow-md scale-[1.02]' : 'border-white/8 hover:border-[#E8712A]/30 hover:bg-white/3 bg-[#12121A]'}`}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${partType === 'riff' ? 'bg-[#E8712A] text-[#08080C]' : 'bg-white/8 text-[#8A8494] group-hover:bg-[#E8712A]/10 group-hover:text-[#E8712A]'}`}>
                                            <GuitarIcon className="h-6 w-6" />
                                        </div>
                                        <span className={`font-bold text-sm uppercase tracking-wide ${partType === 'riff' ? 'text-[#E8712A]' : 'text-[#8A8494]'}`}>Rhythm / Riff</span>
                                        {partType === 'riff' && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#E8712A] shadow-sm" />}
                                    </div>
                                    <div
                                        onClick={() => setPartType("solo")}
                                        className={`cursor-pointer relative overflow-hidden border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group ${partType === 'solo' ? 'border-[#E8712A] bg-[#E8712A]/5 shadow-md scale-[1.02]' : 'border-white/8 hover:border-[#E8712A]/30 hover:bg-white/3 bg-[#12121A]'}`}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${partType === 'solo' ? 'bg-[#E8712A] text-[#08080C]' : 'bg-white/8 text-[#8A8494] group-hover:bg-[#E8712A]/10 group-hover:text-[#E8712A]'}`}>
                                            <Music className="h-6 w-6" />
                                        </div>
                                        <span className={`font-bold text-sm uppercase tracking-wide ${partType === 'solo' ? 'text-[#E8712A]' : 'text-[#8A8494]'}`}>Lead / Solo</span>
                                        {partType === 'solo' && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#E8712A] shadow-sm" />}
                                    </div>
                                </div>
                            </div>

                            {/* Tone Type Section - YELLOW BOX */}
                            <div className="p-8 bg-[#E8712A]/5 rounded-2xl border border-[#E8712A]/20 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#E8712A]/10 p-2 rounded-lg text-[#E8712A]">
                                            <Sparkles className="h-5 w-5 fill-current" />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-bold text-[#F2F0ED]">Tone Type</Label>
                                            <span className="text-xs text-[#8A8494] font-medium tracking-wide">
                                                {instrument === 'guitar'
                                                    ? 'Select whether you want a clean or distorted bass tone.'
                                                    : 'Select whether you want a clean or distorted bass tone.'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <span className="bg-[#E8712A]/20 text-[#E8712A] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-[#E8712A]/30">
                                        Required
                                    </span>
                                </div>

                                {instrument === 'guitar' ? (
                                    /* Guitar: 3-column (Auto/Clean/Distorted) */
                                    <div className="grid grid-cols-3 gap-4 relative z-10">
                                        <button
                                            type="button"
                                            onClick={() => setToneType("auto")}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-colors ${toneType === 'auto' ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]' : 'border-white/8 bg-white/3 hover:bg-white/5 hover:border-emerald-500/30 text-[#8A8494]'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${toneType === 'auto' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/8 text-[#8A8494]'}`}>
                                                <Search className="h-4 w-4" />
                                            </div>
                                            <span className={`font-bold text-xs uppercase tracking-wide ${toneType === 'auto' ? 'text-emerald-400' : 'text-[#8A8494]'}`}>Auto</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setToneType("clean")}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-colors ${toneType === 'clean' ? 'border-[#9B5DE5] bg-[#9B5DE5]/5 ring-2 ring-[#9B5DE5]/20 shadow-md scale-[1.02]' : 'border-white/8 bg-white/3 hover:bg-white/5 hover:border-[#9B5DE5]/30 text-[#8A8494]'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${toneType === 'clean' ? 'bg-[#9B5DE5]/10 text-[#9B5DE5]' : 'bg-white/8 text-[#8A8494]'}`}>
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            <span className={`font-bold text-xs uppercase tracking-wide ${toneType === 'clean' ? 'text-[#9B5DE5]' : 'text-[#8A8494]'}`}>Clean</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setToneType("distorted")}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-colors ${toneType === 'distorted' ? 'border-[#E8712A] bg-[#E8712A]/5 ring-2 ring-[#E8712A]/20 shadow-md scale-[1.02]' : 'border-white/8 bg-white/3 hover:bg-white/5 hover:border-[#E8712A]/30 text-[#8A8494]'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${toneType === 'distorted' ? 'bg-[#E8712A]/10 text-[#E8712A]' : 'bg-white/8 text-[#8A8494]'}`}>
                                                <Flame className="h-4 w-4 fill-current" />
                                            </div>
                                            <span className={`font-bold text-xs uppercase tracking-wide ${toneType === 'distorted' ? 'text-[#E8712A]' : 'text-[#8A8494]'}`}>Distorted</span>
                                        </button>
                                    </div>
                                ) : (
                                    /* Bass: 2-column (Clean/Distorted with Gain labels) */
                                    <div className="grid grid-cols-2 gap-6 relative z-10">
                                        <button
                                            type="button"
                                            onClick={() => setToneType("clean")}
                                            className={`border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-colors ${toneType === 'clean' ? 'border-[#9B5DE5] bg-[#9B5DE5]/5 ring-2 ring-[#9B5DE5]/20 shadow-lg scale-[1.02]' : 'border-white/8 bg-[#12121A] hover:border-[#9B5DE5]/30 hover:bg-[#9B5DE5]/5'}`}
                                        >
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${toneType === 'clean' ? 'bg-[#9B5DE5]/10 text-[#9B5DE5]' : 'bg-white/8 text-[#8A8494]'}`}>
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <span className={`font-bold text-sm ${toneType === 'clean' ? 'text-[#9B5DE5]' : 'text-[#F2F0ED]'}`}>Clean</span>
                                                <span className={`block text-xs ${toneType === 'clean' ? 'text-[#9B5DE5]' : 'text-[#8A8494]'}`}>Gain = 0</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setToneType("distorted")}
                                            className={`border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-colors ${toneType === 'distorted' ? 'border-[#E8712A] bg-[#E8712A]/5 ring-2 ring-[#E8712A]/20 shadow-lg scale-[1.02]' : 'border-white/8 bg-[#12121A] hover:border-[#E8712A]/30 hover:bg-[#E8712A]/5'}`}
                                        >
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${toneType === 'distorted' ? 'bg-[#E8712A]/10 text-[#E8712A]' : 'bg-white/8 text-[#8A8494]'}`}>
                                                <Flame className="h-6 w-6" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <span className={`font-bold text-sm ${toneType === 'distorted' ? 'text-[#E8712A]' : 'text-[#F2F0ED]'}`}>Distorted</span>
                                                <span className={`block text-xs ${toneType === 'distorted' ? 'text-[#E8712A]' : 'text-[#8A8494]'}`}>Gain &gt; 0</span>
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
                <div className="w-full bg-[#12121A] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left border border-white/8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles className="h-24 w-24 text-[#E8712A]" />
                    </div>

                    <div className="space-y-2 relative z-10 max-w-xl">
                        <span className="text-xs font-bold text-[#8A8494] uppercase tracking-widest">New here?</span>
                        <h3 className="text-2xl font-bold text-[#F2F0ED] leading-tight">
                            Try Tonelify free for a limited time
                        </h3>
                        <p className="text-emerald-400 font-medium text-sm">
                            Start a free trial and unlock full adaptations, tone saving, and presets.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 relative z-10 shrink-0">
                        <Button className="bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold h-12 px-8 rounded-full shadow-lg shadow-[#E8712A]/20 transition-transform hover:scale-105">
                            Start Free Trial
                        </Button>
                        <span className="text-[10px] text-[#8A8494]">Cancel anytime during your trial · No long-term commitment</span>
                    </div>
                </div>

                {/* ==================== RUN RESEARCH BUTTON ==================== */}
                <div className="w-full space-y-6">
                    <div className="flex justify-center">
                        <Button
                            onClick={runResearch}
                            disabled={isLoading}
                            className="h-14 px-8 text-lg bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold shadow-lg shadow-[#E8712A]/20 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 w-full max-w-sm"
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
                            <p className="text-xs text-[#8A8494] flex items-center gap-1.5 mt-2">
                                <span className="text-[#8A8494]">ⓘ</span>
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
                                <Button variant="outline" className="h-10 px-6 rounded-full border-white/8 text-[#8A8494] hover:text-[#E8712A] hover:border-[#E8712A]/30 hover:bg-[#E8712A]/5 bg-transparent font-medium text-xs flex items-center gap-2 transition-colors">
                                    <ExternalLink className="h-3 w-3" />
                                    Open Songsterr Tab
                                </Button>
                            </a>
                            <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((songTitle || "") + " " + (artist || "") + " backing track")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="h-10 px-6 rounded-full border-white/8 text-[#8A8494] hover:text-[#E8712A] hover:border-[#E8712A]/30 hover:bg-[#E8712A]/5 bg-transparent font-medium text-xs flex items-center gap-2 transition-colors">
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
                <Card className="border border-white/8 overflow-hidden bg-[#0E0E14]">
                    <CardHeader className="bg-white/3 border-b border-white/8 p-8 flex flex-row items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-[#E8712A] text-[#08080C] flex items-center justify-center font-bold text-xl shadow-lg shadow-[#E8712A]/20 shrink-0">
                            3
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#F2F0ED] tracking-tight">One-Click Adaptation</h2>
                            <p className="text-[#8A8494] font-medium">AI-generated settings for your specific gear</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10">
                        {error && (
                            <div className="p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-sm mb-6 flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        {!result ? (
                            // Empty State (Pre-computation)
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                {/* Original Tone Placeholder */}
                                <div className="flex flex-col items-center text-center space-y-6 group">
                                    <div className="flex items-center gap-3 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/8 text-[#8A8494] p-2 rounded-lg">
                                            <Music2 className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-xl text-[#8A8494]">Original Tone</h3>
                                    </div>

                                    <div className="flex flex-col items-center justify-center h-56 w-full border-2 border-dashed border-white/8 rounded-3xl bg-white/3 group-hover:bg-white/5 group-hover:border-white/20 transition-colors">
                                        <div className="h-16 w-16 bg-[#12121A] rounded-full flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 text-[#8A8494]" />
                                        </div>
                                        <h4 className="font-bold text-[#F2F0ED] text-lg">Awaiting Input</h4>
                                        <p className="text-sm text-[#8A8494] max-w-[200px] mt-2 leading-relaxed">
                                            Select a song and run research to analyze the original track's signal chain
                                        </p>
                                    </div>
                                </div>

                                {/* Adapted Tone Placeholder */}
                                <div className="flex flex-col items-center text-center space-y-6 group">
                                    <div className="flex items-center gap-3 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/8 text-[#8A8494] p-2 rounded-lg">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-xl text-[#8A8494]">Your Adaptation</h3>
                                    </div>

                                    <div className="flex flex-col items-center justify-center h-56 w-full border-2 border-dashed border-white/8 rounded-3xl bg-white/3 group-hover:bg-white/5 group-hover:border-white/20 transition-colors">
                                        <div className="h-16 w-16 bg-[#12121A] rounded-full flex items-center justify-center mb-4">
                                            <Sparkles className="h-8 w-8 text-[#8A8494]" />
                                        </div>
                                        <h4 className="font-bold text-[#F2F0ED] text-lg">Ready to Generate</h4>
                                        <p className="text-sm text-[#8A8494] max-w-[200px] mt-2 leading-relaxed">
                                            AI will calculate the optimal settings for your {userGuitar || "guitar"} and {userAmp || "amp"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Actual Results
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-[#E8712A]/5 p-6 rounded-2xl border border-[#E8712A]/20">
                                    <div className="flex gap-4">
                                        <div className="bg-[#E8712A]/10 p-3 rounded-full h-fit text-[#E8712A]">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-[#F2F0ED]">AI Tone Analysis</h4>
                                            <p className="italic text-[#8A8494] text-lg leading-relaxed">"{result.explanation}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-[#F2F0ED]">
                                            <span className="bg-[#E8712A]/10 text-[#E8712A] p-2 rounded-lg"><GuitarIcon className="h-6 w-6" /></span>
                                            {instrument === 'guitar' ? 'Guitar' : 'Bass'} Settings
                                        </h3>
                                        <div className="bg-[#12121A] rounded-2xl p-6 space-y-4 border border-white/8">
                                            <div className="flex justify-between items-center pb-3 border-b border-white/8">
                                                <span className="text-sm font-bold text-[#8A8494] uppercase tracking-wide">Pickup Position</span>
                                                <span className="font-bold text-lg text-[#F2F0ED] bg-white/8 px-3 py-1 rounded-md">{result.suggestedSettings?.guitar?.pickupSelector}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-white/8">
                                                <span className="text-sm font-bold text-[#8A8494] uppercase tracking-wide">Volume Knob</span>
                                                <span className="font-bold text-lg text-[#F2F0ED] bg-white/8 px-3 py-1 rounded-md">{result.suggestedSettings?.guitar?.volume}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-[#8A8494] uppercase tracking-wide">Tone Knob</span>
                                                <span className="font-bold text-lg text-[#F2F0ED] bg-white/8 px-3 py-1 rounded-md">{result.suggestedSettings?.guitar?.tone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <h3 className="font-bold text-2xl flex items-center gap-3 text-[#F2F0ED]">
                                            <span className="bg-[#E8712A]/10 text-[#E8712A] p-2 rounded-lg"><Speaker className="h-6 w-6" /></span>
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

                                {user && (
                                    <div className="flex justify-center pt-8">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || isSaved}
                                            className="h-14 px-10 bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold text-lg shadow-lg shadow-[#E8712A]/20 rounded-2xl transition-transform hover:scale-105 active:scale-95"
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
