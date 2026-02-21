"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Guitar } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddEquipmentForm } from "./AddEquipmentForm";

interface Equipment {
    id: string;
    name: string;
    guitar_model: string;
    amp_model: string;
    pickup_type: string;
}

interface EquipmentListProps {
    initialEquipment: Equipment[];
}

export function EquipmentList({ initialEquipment }: EquipmentListProps) {
    const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this equipment?")) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/equipment/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            setEquipment((prev) => prev.filter((item) => item.id !== id));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to delete");
        } finally {
            setIsDeleting(null);
        }
    };

    if (equipment.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5 transition-all hover:bg-slate-50 dark:hover:bg-white/10">
                <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-500 rounded-full flex items-center justify-center shadow-sm">
                    <Guitar className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your Gear Locker is Empty</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto mt-1 leading-relaxed">
                        Add your guitar and amp to get personalized tone recommendations.
                    </p>
                </div>
                <div className="pt-2">
                    <AddEquipmentForm />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Your Gear ({equipment.length})</h3>
                <AddEquipmentForm />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {equipment.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card text-sm"
                    >
                        <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {item.guitar_model} {item.amp_model ? `+ ${item.amp_model}` : ""}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                        >
                            {isDeleting === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
