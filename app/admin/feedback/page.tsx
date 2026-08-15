import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";
import { FeedbackInbox, type FeedbackRow } from "@/components/FeedbackInbox";

// Never cached and never prerendered: this reads a table that changes whenever
// somebody uses the form, and a build-time snapshot of it would be both stale
// and stored.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Feedback inbox",
    // Belt and braces with the robots.txt disallow. This page is behind an
    // admin check anyway, but a noindex costs nothing and covers the case
    // where a URL leaks into somebody's history sync.
    robots: { index: false, follow: false },
};

const PAGE_SIZE = 100;

export default async function AdminFeedbackPage() {
    // notFound rather than a redirect or a 403, so the page does not confirm
    // it exists to anyone who is not supposed to be here.
    if (!(await requireAdmin())) notFound();

    const { data, error } = await getSupabaseAdmin()
        .from("feedback")
        .select("id, kind, message, email, page_path, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

    if (error) {
        console.error("feedback read failed:", error);
    }

    const rows = (data ?? []) as FeedbackRow[];
    const unread = rows.filter((r) => r.status === "new").length;

    return (
        <div className="min-h-screen bg-[#08080C] pb-24 font-sans">
            <div className="container max-w-3xl px-4 py-8 md:py-12 mx-auto space-y-6">
                <div className="space-y-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8712A]/10 border border-[#E8712A]/20 text-[#E8712A] text-[11px] font-bold uppercase tracking-[0.08em]">
                        Admin
                    </span>
                    <h1
                        className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F2F2F7]"
                        style={{ letterSpacing: "-0.015em" }}
                    >
                        Feedback inbox
                    </h1>
                    <p className="text-sm text-[#A6A29B]">
                        {rows.length === 0
                            ? "Nothing has come in yet."
                            : `${rows.length} message${rows.length === 1 ? "" : "s"}, ${unread} unread. Newest first, last ${PAGE_SIZE}.`}
                    </p>
                    {error && (
                        <p className="text-sm font-semibold text-[#D14B32]">
                            The table could not be read. Check that
                            scripts/sql/add_tone_likes_and_feedback.sql has been run.
                        </p>
                    )}
                </div>

                <FeedbackInbox rows={rows} />
            </div>
        </div>
    );
}
