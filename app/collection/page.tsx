import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { CollectionContent } from "@/components/CollectionContent"

export default async function CollectionPage() {
    const { userId } = await auth()

    // The middleware already bounces signed-out requests to sign-in, so this is
    // the second lock rather than the first. It matters because the fallback
    // without it is an empty collection page, which reads as "your saved tones
    // are gone" instead of "you are signed out". /dashboard does the same.
    if (!userId) redirect("/sign-in?redirect_url=%2Fcollection")

    let savedTones: any[] = []
    let equipment: any[] = []

    if (userId) {
        const [tonesRes, gearRes] = await Promise.all([
            getSupabaseAdmin()
                .from("tone_matches")
                .select(`
                    id,
                    created_at,
                    songs ( title, artist ),
                    settings
                `)
                .eq("user_id", userId)
                .order("created_at", { ascending: false }),
            getSupabaseAdmin()
                .from("user_equipment")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false }),
        ])

        savedTones = (tonesRes.data || []).map((match: any) => ({
            ...match,
            songs: Array.isArray(match.songs) ? match.songs[0] : match.songs,
        }))

        // Rows written before the gear-type migration have no `type`; they are rigs.
        equipment = (gearRes.data || []).map((item: any) => ({
            ...item,
            type: item.type || "rig",
        }))
    }

    return <CollectionContent savedTones={savedTones} equipment={equipment} />
}
