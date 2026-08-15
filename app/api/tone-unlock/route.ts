import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getToneBySlug } from "@/lib/tone-library";
import { startingPoint } from "@/lib/tone-settings";
import { getUserSubscription, hasActivePlan } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rate-limit";

const READS_PER_MINUTE = 60;

/**
 * The half of a library page that a plan pays for.
 *
 * This route exists so the tone pages can stay statically generated. The
 * locked values are never rendered into the HTML at build time, so there is
 * nothing for a crawler to read and nothing to strip per request; a subscriber
 * fetches them after hydration instead.
 *
 * That also means the gate is enforced in exactly one place. The values are
 * derived, not stored, but deriving them in the browser would put the whole
 * table in the client bundle, which is a paywall in name only.
 */
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ locked: true, reason: "signed-out" }, { status: 401 });
        }

        const burst = await checkRateLimit("tone-unlock", userId, READS_PER_MINUTE, 60);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too fast" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfter) } }
            );
        }

        const slug = (new URL(req.url).searchParams.get("slug") || "").trim().slice(0, 120);
        const tone = getToneBySlug(slug);
        if (!tone) {
            return NextResponse.json({ error: "Unknown tone" }, { status: 404 });
        }

        const subscription = await getUserSubscription(userId);
        if (!hasActivePlan(subscription)) {
            return NextResponse.json(
                {
                    locked: true,
                    reason: "no-plan",
                    message: "Full settings are part of a Tonelify plan.",
                },
                { status: 403 }
            );
        }

        const sp = startingPoint(tone);
        return NextResponse.json({
            locked: false,
            settings: sp.settings,
            effects: sp.effects,
            keyControl: sp.keyControl,
        });
    } catch (error) {
        console.error("Error in tone-unlock GET:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
