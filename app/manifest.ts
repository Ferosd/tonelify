import type { MetadataRoute } from "next";

/**
 * The site already renders as an app on phones (bottom tab bar, safe-area
 * padding), but without a manifest an installed shortcut opened in the browser
 * chrome with a generic icon. This makes "Add to Home Screen" produce something
 * that looks like the product, and gives Android the theme colour to paint the
 * status bar with.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Tonelify: Guitar Tone Matching",
        short_name: "Tonelify",
        description:
            "Turn any recorded guitar tone into knob settings for the amp and guitar you already own.",
        start_url: "/explore",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#08080A",
        theme_color: "#08080A",
        categories: ["music", "utilities", "education"],
        icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            // The maskable copy is padded into the safe zone; pointing a launcher
            // at the full-bleed mark got its rounded corners cropped off
            { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
