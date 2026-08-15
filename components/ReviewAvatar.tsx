"use client"

import { useCallback, useState } from "react"
import { hasAvatar } from "@/lib/avatars"

/**
 * A reviewer's picture, with an initials disc as the fallback.
 *
 * Photos live in public/avatars/ and are matched by the reviewer's name run
 * through avatarSlug(): "Emma Taylor" reads /avatars/emma-taylor.jpg. Which
 * names have a file is declared in lib/avatars, so a reviewer without one draws
 * the disc immediately instead of requesting an image that will 404.
 *
 * onError alone was not enough. An <img> that fails before React hydrates has
 * already fired its error event by the time the handler is attached, so the
 * browser's broken-image glyph stayed on screen forever: that is what the row
 * of torn-page icons under the hero was. The ref below re-checks a settled
 * image, which covers the load that finished before the listener existed.
 */
export function avatarSlug(name: string) {
    return name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

export function getInitials(name: string) {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? "")
            .join("") || "?"
    )
}

export function ReviewAvatar({
    name,
    src,
    size = 40,
    ring,
}: {
    name: string
    /** Overrides the name-derived path. */
    src?: string
    size?: number
    /** Border colour, for the overlapping stack in the hero. */
    ring?: string
}) {
    const [failed, setFailed] = useState(false)
    const slug = avatarSlug(name)
    // An explicit src is trusted: it names a file the caller knows about, such
    // as the hero stack, which has no reviewer behind it.
    const path = src ?? (hasAvatar(slug) ? `/avatars/${slug}.jpg` : null)

    // Catches the image that errored before hydration, which never fires
    // onError at all.
    const check = useCallback((img: HTMLImageElement | null) => {
        if (img && img.complete && img.naturalWidth === 0) setFailed(true)
    }, [])

    const base: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        objectFit: "cover",
        ...(ring ? { border: `2px solid ${ring}` } : null),
    }

    if (failed || !path) {
        return (
            <div
                aria-hidden="true"
                style={{
                    ...base,
                    background: "linear-gradient(135deg, #E8712A 0%, #D14B32 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 600,
                    fontSize: Math.round(size * 0.34),
                    color: "#FFFFFF",
                    letterSpacing: "0.01em",
                }}
            >
                {getInitials(name)}
            </div>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={check}
            src={path}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            style={base}
        />
    )
}
