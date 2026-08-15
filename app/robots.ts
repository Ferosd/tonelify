import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Signed-in surfaces and auth screens. Nothing here is useful in a result page,
// and most of it redirects to sign-in for a crawler anyway.
// No trailing slashes: "/sign-in/" does not match the real path "/sign-in".
const PRIVATE = ["/api", "/admin", "/dashboard", "/settings", "/collection", "/sign-in", "/sign-up"];

/**
 * Answer engines send their own agents, and several of them read robots.txt
 * strictly rather than falling back to the "*" group. Listing them explicitly
 * puts the allow decision on the record instead of leaving it inferred:
 *
 * - GPTBot / OAI-SearchBot / ChatGPT-User: ChatGPT training, index and browsing
 * - ClaudeBot / Claude-SearchBot / Claude-User: Anthropic index and browsing
 * - PerplexityBot / Perplexity-User: Perplexity index and browsing
 * - Google-Extended: Gemini grounding, separate from Googlebot's crawl
 */
const AI_AGENTS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "meta-externalagent",
    "cohere-ai",
    "Amazonbot",
    "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_URL;

    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: PRIVATE },
            ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
