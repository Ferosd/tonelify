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
            <div className="text-center py-6 space-y-3">
                <div className="flex justify-center">
                    <Guitar className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="text-sm text-muted-foreground">
                    No equipment saved yet.
                </div>
                <AddEquipmentForm />
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
