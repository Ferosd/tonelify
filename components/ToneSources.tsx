import { BookOpen, ExternalLink, ShieldCheck, Search } from "lucide-react"
import {
    type Provenance,
    type ToneSource,
    sourceKindLabel,
    sourceSearchUrl,
} from "@/lib/sources"

/**
 * Where the original rig on a tone card came from.
 *
 * Two rules shape this block. Curated entries carry a real href because a
 * person opened that page before it was stored. Everything the tone engine
 * named is text plus a search link, never a direct href, because a fabricated
 * URL that lands on a 404 does more damage to trust than showing no link.
 *
 * The header states which of the two applies, so a reader never has to guess
 * whether they are looking at a checked fact or a model's recollection.
 */
export function ToneSources({
    sources,
    provenance,
    song,
    artist,
}: {
    sources?: ToneSource[]
    provenance?: Provenance
    song: string
    artist: string
}) {
    const list = Array.isArray(sources) ? sources : []
    const verified = provenance === "verified"

    // Nothing to show and nothing to claim: stay out of the way rather than
    // render an empty box that implies missing data.
    if (list.length === 0 && !verified) return null

    return (
        <section className="space-y-4">
            <h3 className="font-bold text-xl flex items-center gap-3 text-[#F2F0ED]">
                <span className="bg-[#F5A623]/10 text-[#F5A623] p-2 rounded-lg">
                    <BookOpen className="h-5 w-5" />
                </span>
                Where this comes from
            </h3>

            <div className="bg-[#12121A] border border-white/8 rounded-2xl p-6 space-y-5">
                <div className="flex items-start gap-3">
                    {verified ? (
                        <ShieldCheck className="h-5 w-5 text-[#FFD700] shrink-0 mt-0.5" />
                    ) : (
                        <Search className="h-5 w-5 text-[#8A8494] shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-[#A6A29B] leading-relaxed">
                        {verified
                            ? "The original rig on this page is checked against our gear database, not generated. The adaptation to your equipment is still calculated per request."
                            : "We have no hand-checked entry for this recording yet, so the original rig below is the tone engine's best reading of the documented sources it names."}
                    </p>
                </div>

                {list.length > 0 && (
                    <ul className="space-y-3 pt-1">
                        {list.map((source, i) => (
                            <li
                                key={`${source.title}-${i}`}
                                className="border-t border-white/8 pt-3 first:border-0 first:pt-0"
                            >
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest">
                                            {sourceKindLabel(source.kind)}
                                        </div>
                                        <div className="text-sm font-semibold text-[#F2F0ED] leading-snug mt-1">
                                            {source.title}
                                        </div>
                                        {source.detail && (
                                            <p className="text-sm text-[#A6A29B] leading-relaxed mt-1">
                                                {source.detail}
                                            </p>
                                        )}
                                    </div>

                                    {source.url ? (
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 min-h-11 text-xs font-semibold text-[#F5A623] hover:text-[#FFD700] transition-colors shrink-0"
                                        >
                                            Open source <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    ) : source.kind !== "model-knowledge" ? (
                                        <a
                                            href={sourceSearchUrl(source, song, artist)}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="inline-flex items-center gap-1.5 min-h-11 text-xs font-semibold text-[#8A8494] hover:text-[#F5A623] transition-colors shrink-0"
                                        >
                                            Look it up <Search className="h-3.5 w-3.5" />
                                        </a>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
