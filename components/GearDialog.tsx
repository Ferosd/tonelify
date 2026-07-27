"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export type GearType = "rig" | "pedal" | "multifx"

export interface GearItem {
    id: string
    type: GearType
    name: string
    brand?: string | null
    category?: string | null
    notes?: string | null
    guitar_model?: string | null
    amp_model?: string | null
    pickup_type?: string | null
    created_at?: string
}

// Covers what a tone-match prompt actually cares about; "Other" catches the rest
export const PEDAL_CATEGORIES = [
    "Overdrive",
    "Distortion",
    "Fuzz",
    "Boost",
    "Compressor",
    "EQ",
    "Wah",
    "Chorus",
    "Phaser",
    "Flanger",
    "Tremolo",
    "Delay",
    "Reverb",
    "Pitch / Octave",
    "Noise Gate",
    "Other",
]

const copy: Record<GearType, { title: string; description: string; nameLabel: string; namePlaceholder: string }> = {
    rig: {
        title: "Add a rig",
        description: "A guitar and amp pairing you can load into any tone match with one tap.",
        nameLabel: "Rig name",
        namePlaceholder: "My Main Strat",
    },
    pedal: {
        title: "Add a pedal",
        description: "Every pedal you add gets factored into your tone match suggestions.",
        nameLabel: "Pedal model",
        namePlaceholder: "Tube Screamer TS9",
    },
    multifx: {
        title: "Add a multi FX unit",
        description: "Tell us your processor and we'll write settings in its own language.",
        nameLabel: "Unit model",
        namePlaceholder: "HX Stomp",
    },
}

const inputClass =
    "h-11 bg-[#0E0E14] border-white/8 text-[#F2F0ED] placeholder:text-[#8A8494] focus-visible:ring-[#E8712A]/30"

interface GearDialogProps {
    type: GearType
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: (item: GearItem) => void
}

export function GearDialog({ type, open, onOpenChange, onSaved }: GearDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState("")
    const [brand, setBrand] = useState("")
    const [category, setCategory] = useState(PEDAL_CATEGORIES[0])
    const [notes, setNotes] = useState("")
    const [guitarModel, setGuitarModel] = useState("")
    const [ampModel, setAmpModel] = useState("")
    const [pickupType, setPickupType] = useState("")

    const t = copy[type]

    const reset = () => {
        setName("")
        setBrand("")
        setCategory(PEDAL_CATEGORIES[0])
        setNotes("")
        setGuitarModel("")
        setAmpModel("")
        setPickupType("")
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/equipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    name,
                    brand,
                    category: type === "pedal" ? category : "",
                    notes,
                    guitar_model: guitarModel,
                    amp_model: ampModel,
                    pickup_type: pickupType,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || "Couldn't save that. Try again.")

            onSaved({ ...data, type })
            reset()
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save that. Try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset()
                onOpenChange(next)
            }}
        >
            <DialogContent className="sm:max-w-[440px] bg-[#0E0E14] border border-white/8 text-[#F2F0ED]">
                <DialogHeader>
                    <DialogTitle className="text-[#F2F0ED]">{t.title}</DialogTitle>
                    <DialogDescription className="text-[#8A8494]">{t.description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {type !== "rig" && (
                        <div className="grid gap-2">
                            <Label htmlFor="gear-brand" className="text-[#F2F0ED]">Brand</Label>
                            <Input
                                id="gear-brand"
                                placeholder={type === "pedal" ? "Ibanez" : "Line 6"}
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="gear-name" className="text-[#F2F0ED]">{t.nameLabel} <span className="text-[#E8712A]">*</span></Label>
                        <Input
                            id="gear-name"
                            placeholder={t.namePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    {type === "pedal" && (
                        <div className="grid gap-2">
                            <Label htmlFor="gear-category" className="text-[#F2F0ED]">What it does</Label>
                            <select
                                id="gear-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-11 px-3 rounded-md bg-[#0E0E14] border border-white/8 text-sm text-[#F2F0ED] focus:outline-none focus:ring-2 focus:ring-[#E8712A]/30"
                            >
                                {PEDAL_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type === "rig" && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="gear-guitar" className="text-[#F2F0ED]">Guitar model</Label>
                                <Input
                                    id="gear-guitar"
                                    placeholder="Fender Stratocaster"
                                    value={guitarModel}
                                    onChange={(e) => setGuitarModel(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gear-amp" className="text-[#F2F0ED]">Amp model</Label>
                                <Input
                                    id="gear-amp"
                                    placeholder="Fender Blues Jr"
                                    value={ampModel}
                                    onChange={(e) => setAmpModel(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gear-pickup" className="text-[#F2F0ED]">Pickup type</Label>
                                <Input
                                    id="gear-pickup"
                                    placeholder="Single coil / Humbucker"
                                    value={pickupType}
                                    onChange={(e) => setPickupType(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </>
                    )}

                    {type !== "rig" && (
                        <div className="grid gap-2">
                            <Label htmlFor="gear-notes" className="text-[#F2F0ED]">
                                Notes <span className="text-[#8A8494] font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="gear-notes"
                                placeholder={type === "pedal" ? "Always on, drive at 9 o'clock" : "4 cable method into the FX loop"}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    )}

                    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-10 bg-transparent border border-white/8 text-[#8A8494] hover:bg-white/5 hover:text-[#F2F0ED]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-semibold"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
