"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Heart } from "lucide-react"
import { likeLabel, type LikeState } from "@/lib/tone-likes"

type Props = {
    songTitle: string
    artist: string
    slug?: string
    /** Count resolved on the server, so the first paint already has a number. */
    initial?: LikeState
    size?: "sm" | "md"
}

/**
 * "N players like this tone", and a way to be one of them.
 *
 * The count arrives from the server, but the `liked` half cannot: the library
 * pages are statically revalidated, so whoever triggered the rebuild would
 * otherwise have their own heart filled in for every visitor. The button reads
 * its own state once after hydration instead.
 */
export function LikeButton({ songTitle, artist, slug, initial, size = "md" }: Props) {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()
    const [state, setState] = useState<LikeState>(initial ?? { count: 0, liked: false })
    const [pending, setPending] = useState(false)
    const inFlight = useRef(false)

    // Only signed-in visitors can have a like to look up, and a signed-out
    // hit here would spend the read budget to learn `false`.
    useEffect(() => {
        if (!isLoaded || !isSignedIn) return
        let cancelled = false
        fetch(`/api/tone-likes?song=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artist)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (cancelled || !data?.likes) return
                // Never clobber a click the player already made while this was
                // in the air.
                if (inFlight.current) return
                setState(data.likes as LikeState)
            })
            .catch(() => { })
        return () => {
            cancelled = true
        }
    }, [isLoaded, isSignedIn, songTitle, artist])

    async function toggle() {
        if (!isSignedIn) {
            router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        if (pending) return

        const next = !state.liked
        const optimistic: LikeState = {
            liked: next,
            count: Math.max(0, state.count + (next ? 1 : -1)),
        }
        setState(optimistic)
        setPending(true)
        inFlight.current = true

        try {
            const res = await fetch("/api/tone-likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ songTitle, artist, slug, liked: next }),
            })
            const data = res.ok ? await res.json() : null
            if (data?.likes) setState(data.likes as LikeState)
            // A failed write rolls the heart back rather than leaving a like
            // that only exists in this tab.
            else setState({ liked: !next, count: state.count })
        } catch {
            setState({ liked: !next, count: state.count })
        } finally {
            setPending(false)
            inFlight.current = false
        }
    }

    const label = likeLabel(state)
    const compact = size === "sm"

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={pending}
            aria-pressed={state.liked}
            aria-label={state.liked ? `Unlike ${songTitle}` : `Like ${songTitle}`}
            className={`inline-flex items-center gap-2 rounded-full border font-bold disabled:opacity-60 transition-[background-color,border-color,color] duration-200 ${compact ? "h-9 px-3 text-xs" : "h-11 px-5 text-sm"
                } ${state.liked
                    ? "bg-[#D14B32]/15 border-[#D14B32]/50 text-[#E8712A]"
                    : "bg-[#12121A] border-white/10 text-[#A6A29B] hover:text-[#F2F2F7] hover:border-[#E8712A]/40"
                }`}
        >
            <Heart
                className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
                fill={state.liked ? "currentColor" : "none"}
                strokeWidth={2}
            />
            <span>{state.liked ? "Liked" : "Like"}</span>
            {label && <span className="font-mono text-[#FFD700]">{label}</span>}
        </button>
    )
}
