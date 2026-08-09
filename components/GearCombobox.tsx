"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Check } from "lucide-react"
import { type GearEntry, type GearType, gearLabel, searchGear } from "@/lib/gear-catalog"

/**
 * A text field that suggests catalog gear without ever requiring it.
 *
 * The catalog is a few hundred entries against a world of tens of thousands,
 * so anything that forced a selection would lock out most of the people this
 * form exists for. Typing freely is the default path and always works; picking
 * a suggestion is the shortcut that also gets the amp's real control layout
 * into the prompt.
 *
 * Selection is tracked by value rather than by a separate id, so a saved rig
 * loaded back into the form still resolves to its catalog entry.
 */
export function GearCombobox({
    id,
    value,
    onChange,
    types,
    placeholder,
    className,
    ariaLabel,
    disabled,
    onSelect,
}: {
    id?: string
    value: string
    onChange: (value: string) => void
    /**
     * Fired only when a catalog entry is picked, never on typing. Lets a caller
     * fill neighbouring fields (brand, pickup layout) from the same choice.
     */
    onSelect?: (entry: GearEntry) => void
    types?: GearType[]
    placeholder?: string
    /** Passed straight through: the two call sites style their fields differently */
    className?: string
    ariaLabel?: string
    disabled?: boolean
}) {
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(0)
    const wrapRef = useRef<HTMLDivElement>(null)
    const listId = useId()

    const suggestions = useMemo(() => {
        if (!open) return []
        const found = searchGear(value, types)
        // An exact single hit means the field is already settled; showing a
        // one-row dropdown over it is noise.
        if (found.length === 1 && gearLabel(found[0]).toLowerCase() === value.trim().toLowerCase()) {
            return []
        }
        return found
    }, [open, value, types])

    // Clicking anywhere else commits whatever is typed and closes the list
    useEffect(() => {
        if (!open) return
        function onPointerDown(e: MouseEvent | TouchEvent) {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onPointerDown)
        document.addEventListener("touchstart", onPointerDown)
        return () => {
            document.removeEventListener("mousedown", onPointerDown)
            document.removeEventListener("touchstart", onPointerDown)
        }
    }, [open])

    // Clamped at read time rather than reset from an effect: the list shrinks
    // as the query narrows, and a stale index would otherwise point past the
    // end of it for a render.
    const activeIndex = suggestions.length ? Math.min(active, suggestions.length - 1) : 0

    const commit = (entry: GearEntry) => {
        onChange(gearLabel(entry))
        onSelect?.(entry)
        setOpen(false)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!suggestions.length) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActive((i) => (Math.min(i, suggestions.length - 1) + 1) % suggestions.length)
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActive((i) => (Math.min(i, suggestions.length - 1) - 1 + suggestions.length) % suggestions.length)
        } else if (e.key === "Enter") {
            // Only steal Enter when a suggestion is highlighted, so the form
            // can still be submitted from a freely typed value.
            e.preventDefault()
            commit(suggestions[activeIndex])
        } else if (e.key === "Escape") {
            setOpen(false)
        }
    }

    return (
        <div ref={wrapRef} className="relative">
            {/* A plain input, not the ui/input component: both call sites pass a
                fully formed className and merging two base styles fought over
                height and background. */}
            <input
                id={id}
                value={value}
                onChange={(e) => { onChange(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={className}
                disabled={disabled}
                aria-label={ariaLabel}
                role="combobox"
                aria-expanded={suggestions.length > 0}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
            />

            {suggestions.length > 0 && (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-white/8 bg-[#0E0E14] shadow-2xl shadow-black/50 py-1"
                >
                    {suggestions.map((entry, i) => (
                        <li key={entry.id} role="option" aria-selected={i === activeIndex}>
                            <button
                                type="button"
                                // onMouseDown, not onClick: the input's blur would
                                // close the list before a click ever landed.
                                onMouseDown={(e) => { e.preventDefault(); commit(entry) }}
                                onMouseEnter={() => setActive(i)}
                                className={`w-full text-left px-4 py-3 min-h-11 flex items-center justify-between gap-3 transition-colors ${i === activeIndex ? "bg-[#F5A623]/10" : ""
                                    }`}
                            >
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-[#F2F0ED] truncate">
                                        {gearLabel(entry)}
                                    </span>
                                    <span className="block text-xs text-[#8A8494] truncate">
                                        {[entry.category, entry.pickups].filter(Boolean).join(" · ")}
                                    </span>
                                </span>
                                {entry.controls?.length ? (
                                    <span
                                        title="We know this panel, so the settings will only use controls it actually has."
                                        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#FFD700]"
                                    >
                                        <Check className="h-3 w-3" /> Panel known
                                    </span>
                                ) : null}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
