"use client"

import { useState } from "react"

/**
 * A reviewer's picture, with an initials disc as the fallback.
 *
 * Photos live in public/avatars/ and are matched by the reviewer's name run
 * through avatarSlug(): "Emma Taylor" reads /avatars/emma-taylor.jpg. Nothing
 * has to exist for the component to render, so dropping a file into that folder
 * is the whole job of adding a face; until then the initials disc shows and no
 * broken image ever reaches the page.
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
    const path = src ?? `/avatars/${avatarSlug(name)}.jpg`

    const base: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        objectFit: "cover",
        ...(ring ? { border: `2px solid ${ring}` } : null),
    }

    if (failed) {
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
