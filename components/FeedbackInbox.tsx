"use client"

import { useState } from "react"
import { Bug, Lightbulb, Wrench, Heart, MessageSquare } from "lucide-react"
import type { FeedbackKind } from "@/lib/validations/feedback"

export type FeedbackRow = {
    id: string
    kind: FeedbackKind
    message: string
    email: string | null
    page_path: string | null
    status: "new" | "read" | "actioned" | "spam"
    created_at: string
    user_id: string | null
}

const ICONS: Record<FeedbackKind, typeof Bug> = {
    bug: Bug,
    feature: Lightbulb,
    improvement: Wrench,
    praise: Heart,
    other: MessageSquare,
}

const KIND_LABEL: Record<FeedbackKind, string> = {
    bug: "Bug",
    feature: "Feature",
    improvement: "Improvement",
    praise: "Praise",
    other: "Other",
}

const NEXT_STATUS: { value: FeedbackRow["status"]; label: string }[] = [
    { value: "read", label: "Read" },
    { value: "actioned", label: "Done" },
    { value: "spam", label: "Spam" },
]

function when(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/**
 * The inbox list. Client side only for the status buttons; the rows themselves
 * are read on the server, so nothing about the table shape reaches a visitor
 * who is not an admin.
 */
export function FeedbackInbox({ rows }: { rows: FeedbackRow[] }) {
    const [statuses, setStatuses] = useState<Record<string, FeedbackRow["status"]>>(
        Object.fromEntries(rows.map((r) => [r.id, r.status]))
    )
    const [busy, setBusy] = useState<string | null>(null)

    async function setStatus(id: string, status: FeedbackRow["status"]) {
        const previous = statuses[id]
        setStatuses((s) => ({ ...s, [id]: status }))
        setBusy(id)
        try {
            const res = await fetch("/api/admin/feedback", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            })
            if (!res.ok) setStatuses((s) => ({ ...s, [id]: previous }))
        } catch {
            setStatuses((s) => ({ ...s, [id]: previous }))
        } finally {
            setBusy(null)
        }
    }

    if (rows.length === 0) return null

    return (
        <div className="space-y-3">
            {rows.map((row) => {
                const Icon = ICONS[row.kind] ?? MessageSquare
                const status = statuses[row.id]
                const isNew = status === "new"

                return (
                    <article
                        key={row.id}
                        className={`rounded-2xl border p-5 space-y-3 ${isNew ? "bg-[#12121A] border-[#F5A623]/30" : "bg-[#0E0E14] border-white/8"
                            }`}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#E8712A]/10 border border-[#E8712A]/30 text-[#E8712A]">
                                <Icon className="h-3 w-3" />
                                {KIND_LABEL[row.kind] ?? row.kind}
                            </span>
                            {!isNew && (
                                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#8A8494]">
                                    {status}
                                </span>
                            )}
                            <span className="font-mono text-[11px] text-[#8A8494] ml-auto">
                                {when(row.created_at)}
                            </span>
                        </div>

                        <p className="text-sm text-[#F2F0ED] leading-relaxed whitespace-pre-wrap break-words">
                            {row.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8A8494] font-mono">
                            {row.email ? (
                                <a href={`mailto:${row.email}`} className="text-[#F5A623] hover:text-[#FFD700] break-all">
                                    {row.email}
                                </a>
                            ) : (
                                <span>no address, cannot reply</span>
                            )}
                            {row.page_path && <span className="break-all">from {row.page_path}</span>}
                            {row.user_id && <span className="break-all">{row.user_id}</span>}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {NEXT_STATUS.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setStatus(row.id, s.value)}
                                    disabled={busy === row.id || status === s.value}
                                    className="inline-flex items-center h-9 px-4 rounded-full text-xs font-bold border border-white/10 bg-[#08080C] text-[#A6A29B] hover:text-[#F2F2F7] hover:border-[#F5A623]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </article>
                )
            })}
        </div>
    )
}
