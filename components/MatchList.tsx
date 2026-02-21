"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Eye, Loader2, Guitar } from "lucide-react";
import { Stompbox } from "@/components/Stompbox";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Match {
    id: string;
    created_at: string;
    songs: {
        title: string;
        artist: string;
    };
    settings: any;
}

interface MatchListProps {
    initialMatches: Match[];
}

export function MatchList({ initialMatches }: MatchListProps) {
    const [matches, setMatches] = useState<Match[]>(initialMatches);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this tone?")) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/tone-match/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            setMatches((prev) => prev.filter((m) => m.id !== id));
            router.refresh(); // Refresh server data
        } catch (error) {
            console.error(error);
            alert("Failed to delete tone");
        } finally {
            setIsDeleting(null);
        }
    };

    const openMatch = (match: Match) => {
        setSelectedMatch(match);
    };

    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-white/5 transition-all hover:bg-slate-50 dark:hover:bg-white/10">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-500">
                        <Guitar className="h-10 w-10" />
                    </div>
                </div>
                <div className="max-w-sm space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Tone Journey Starts Here</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Match your first song to discover the perfect amp settings for your gear.
                    </p>
                </div>
                <Link href="/tone-match">
                    <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl transition-all hover:-translate-y-1">
                        Start Matching Tones
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="space-y-1">
                            <div className="font-semibold">
                                {match.songs?.title || "Unknown Song"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {match.songs?.artist || "Unknown Artist"}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground hidden sm:block">
                                {new Date(match.created_at).toLocaleDateString()}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openMatch(match)}>
                                    <Eye className="h-4 w-4 text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(match.id)} disabled={isDeleting === match.id}>
                                    {isDeleting === match.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedMatch?.songs?.title} - {selectedMatch?.songs?.artist}</DialogTitle>
                        <DialogDescription>
                            AI Suggested Settings
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMatch && (
                        <div className="space-y-6 mt-4">
                            <div className="bg-muted p-4 rounded-md italic text-sm">
                                "{selectedMatch.settings.explanation}"
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🎸 Guitar</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        <li>Pickup: <span className="font-medium">{selectedMatch.settings.suggestedSettings.guitar.pickupSelector}</span></li>
                                        <li>Volume: <span className="font-medium">{selectedMatch.settings.suggestedSettings.guitar.volume}</span></li>
                                        <li>Tone: <span className="font-medium">{selectedMatch.settings.suggestedSettings.guitar.tone}</span></li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🔊 Amp</h3>
                                    <ul className="grid grid-cols-2 gap-2 text-sm">
                                        {Object.entries(selectedMatch.settings.suggestedSettings.amp).map(([key, value]) => (
                                            <li key={key} className="bg-secondary/50 p-2 rounded">
                                                <span className="capitalize text-muted-foreground block text-xs">{key}</span>
                                                <span className="font-bold text-lg">{String(value)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {selectedMatch.settings.suggestedSettings.pedals && selectedMatch.settings.suggestedSettings.pedals.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🎛 Pedals</h3>
                                    <div className="flex flex-wrap gap-6 p-6 bg-muted/20 rounded-xl justify-center sm:justify-start border border-dashed border-gray-300 dark:border-gray-700">
                                        {selectedMatch.settings.suggestedSettings.pedals.map((pedal: any, idx: number) => (
                                            <Stompbox key={idx} name={pedal.name} settings={pedal.settings} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
