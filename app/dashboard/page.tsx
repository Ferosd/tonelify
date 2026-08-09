import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Music, Settings } from "lucide-react";
import { MatchList } from "@/components/MatchList";
import { EquipmentList } from "@/components/EquipmentList";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { CheckoutSuccessBanner } from "@/components/CheckoutSuccessBanner";
import { Suspense } from "react";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { PLANS } from "@/lib/stripe";

export const metadata: Metadata = {
    title: "Collection: Your Saved Tones & Equipment",
    description: "View your matched tones, saved equipment profiles, and subscription status on Tonelify.",
    alternates: {
        canonical: "/dashboard",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default async function Dashboard() {
    const { userId } = await auth();

    if (!userId) return null;

    const { data: recentMatches } = await getSupabaseAdmin()
        .from('tone_matches')
        .select(`
            id,
            created_at,
            songs ( title, artist ),
            settings
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

        .limit(5);

    const { data: userEquipment } = await getSupabaseAdmin()
        .from('user_equipment')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    // Transform the data to match the component's expected interface
    const matches = recentMatches?.map(match => ({
        ...match,
        songs: Array.isArray(match.songs) ? match.songs[0] : match.songs
    })) || [];

    const subscription = await getUserSubscription(userId);

    return (
        <div className="min-h-screen bg-[#08080C]">
            {/* Dashboard Header */}
            {/* Dashboard Header Removed - using global SiteHeader */}

            <main className="container p-4 md:p-8 space-y-6 md:space-y-8">
                <Suspense fallback={null}>
                    <CheckoutSuccessBanner />
                </Suspense>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Manage your tones and equipment.</p>
                    </div>
                    <Link href="/tone-match">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Tone Match
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Recent Matches Card */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Music className="h-5 w-5" />
                                Recent Matches
                            </CardTitle>
                            <CardDescription>Your recently matched songs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MatchList initialMatches={matches} />
                        </CardContent>
                    </Card>

                    {/* Equipment Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                My Equipment
                            </CardTitle>
                            <CardDescription>Your saved guitar and amp profiles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EquipmentList initialEquipment={userEquipment || []} />
                        </CardContent>
                    </Card>

                    {/* Stats / Subscription Card */}
                    <SubscriptionCard
                        plan={subscription.plan}
                        planName={PLANS[subscription.plan]?.name || "Free"}
                        status={subscription.status}
                        matchesUsed={subscription.matchesUsed}
                        matchLimit={subscription.matchLimit}
                        currentPeriodEnd={subscription.currentPeriodEnd}
                        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                    />
                </div>
            </main>
        </div>
    )
}
