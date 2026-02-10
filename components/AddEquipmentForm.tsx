"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddEquipmentForm() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [name, setName] = useState("");
    const [guitarModel, setGuitarModel] = useState("");
    const [ampModel, setAmpModel] = useState("");
    const [pickupType, setPickupType] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/equipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    guitar_model: guitarModel,
                    amp_model: ampModel,
                    pickup_type: pickupType
                }),
            });

            if (!res.ok) throw new Error("Failed to add equipment");

            setOpen(false);
            setName("");
            setGuitarModel("");
            setAmpModel("");
            setPickupType("");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to add equipment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add Gear
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Equipment</DialogTitle>
                    <DialogDescription>
                        Save your gear details to quickly use them in tone matches.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nickname (Required)</Label>
                        <Input
                            id="name"
                            placeholder="My Main Strat"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="guitar">Guitar Model</Label>
                        <Input
                            id="guitar"
                            placeholder="Fender Stratocaster"
                            value={guitarModel}
                            onChange={(e) => setGuitarModel(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amp">Amp Model</Label>
                        <Input
                            id="amp"
                            placeholder="Fender Blues Jr"
                            value={ampModel}
                            onChange={(e) => setAmpModel(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pickup">Pickup Type</Label>
                        <Input
                            id="pickup"
                            placeholder="Single Coil / Humbucker"
                            value={pickupType}
                            onChange={(e) => setPickupType(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Equipment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
