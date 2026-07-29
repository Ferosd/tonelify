import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Makes sure the signed-in Clerk user has a row in `profiles`.
 *
 * `user_equipment`, `tone_matches` and `gear_requests` all carry a foreign key
 * to `profiles(id)`, but nothing creates that row at sign-up — there is no Clerk
 * webhook. Until this ran, the first write a new account attempted failed with
 * 23503, so saving a tone was the only path that happened to work (it created
 * the profile inline). Every writer calls this first now.
 *
 * Returns false when the profile could not be created, so the caller can answer
 * with a real error instead of letting the foreign key produce a bare 500.
 */
export async function ensureProfile(userId: string): Promise<boolean> {
    const { data: existing } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (existing) return true;

    const user = await currentUser();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

    // Upsert rather than insert: two concurrent first-time writes would
    // otherwise race and one would fail on the primary key.
    const { error } = await getSupabaseAdmin()
        .from("profiles")
        .upsert(
            {
                id: userId,
                email: user?.emailAddresses[0]?.emailAddress ?? null,
                full_name: fullName || null,
            },
            { onConflict: "id", ignoreDuplicates: true }
        );

    if (error) {
        console.error("Could not create profile for", userId, error);
        return false;
    }

    return true;
}
