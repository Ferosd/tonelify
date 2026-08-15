import { auth } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";
import { SettingsContent } from "@/components/SettingsContent";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const [subscription, tonesRes, gearRes] = await Promise.all([
        getUserSubscription(userId),
        getSupabaseAdmin()
            .from("tone_matches")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        getSupabaseAdmin()
            .from("user_equipment")
            .select("type")
            .eq("user_id", userId),
    ]);

    const gear = gearRes.data || [];
    const counts = {
        presets: gear.filter((g: any) => (g.type || "rig") === "rig").length,
        savedTones: tonesRes.count ?? 0,
        pedals: gear.filter((g: any) => g.type === "pedal").length,
        multifx: gear.filter((g: any) => g.type === "multifx").length,
    };

    return (
        <SettingsContent
            subscription={subscription}
            planName={PLANS[subscription.plan]?.name || "No plan"}
            counts={counts}
        />
    );
}
