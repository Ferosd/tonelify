import { auth } from "@clerk/nextjs/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { CollectionContent } from "@/components/CollectionContent"

export default async function CollectionPage() {
    const { userId } = await auth()

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
