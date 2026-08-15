import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";

const patchSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(["new", "read", "actioned", "spam"]),
});

/**
 * Moves one message out of the queue.
 *
 * A 404 rather than a 403 for non-admins: a 403 confirms the route exists and
 * that there is something behind it, which is free information for anyone
 * probing the site.
 */
export async function PATCH(request: NextRequest) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const parsed = patchSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const { error } = await getSupabaseAdmin()
            .from("feedback")
            .update({ status: parsed.data.status })
            .eq("id", parsed.data.id);

        if (error) {
            console.error("feedback status update failed:", error);
            return NextResponse.json({ error: "Could not update that" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Admin feedback PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
