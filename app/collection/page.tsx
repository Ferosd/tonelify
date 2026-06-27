import { auth } from "@clerk/nextjs/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { CollectionContent } from "@/components/CollectionContent"

export default async function CollectionPage() {
    const { userId } = await auth()

    let savedTones: any[] = []

    if (userId) {
        const { data } = await getSupabaseAdmin()
            .from("tone_matches")
            .select(`
                id,
                created_at,
                songs ( title, artist ),
                settings
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        savedTones = (data || []).map((match: any) => ({
            ...match,
            songs: Array.isArray(match.songs) ? match.songs[0] : match.songs,
        }))
    }

    return <CollectionContent savedTones={savedTones} />
}
