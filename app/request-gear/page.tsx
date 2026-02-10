"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Loader2, MessageSquare, Guitar, Speaker, CircleDot, HelpCircle } from "lucide-react";

export default function RequestGearPage() {
    const { user } = useUser();
    const [equipmentType, setEquipmentType] = useState("");
    const [equipmentName, setEquipmentName] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const equipmentTypes = [
        { value: "guitar", label: "Guitar", icon: Guitar },
        { value: "amp", label: "Amplifier", icon: Speaker },
        { value: "pedal", label: "Pedal / Effect", icon: CircleDot },
        { value: "other", label: "Other", icon: HelpCircle },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/gear-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equipment_type: equipmentType,
                    equipment_name: equipmentName,
                    additional_info: additionalInfo,
                    email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit request");
            }

            setIsSuccess(true);
            setEquipmentType("");
            setEquipmentName("");
            setAdditionalInfo("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
                <div className="max-w-xl mx-auto">
                    <Card className="border-none shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted!</h2>
                            <p className="text-slate-500 mb-6">
                                Thank you for your gear request. We'll review it and notify you via email when it's added to our database.
                            </p>
                            <Button
                                onClick={() => setIsSuccess(false)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Submit Another Request
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
            <div className="max-w-xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                        <MessageSquare className="h-4 w-4" />
                        Feature Request
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Request New Gear</h1>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Can't find the guitar, amp, or pedal you need? Let us know and we'll add it to our database.
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border-none shadow-xl ring-1 ring-slate-900/5 overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800">Equipment Details</h2>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Equipment Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">
                                    Equipment Type <span className="text-red-500">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {equipmentTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setEquipmentType(type.value)}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${equipmentType === type.value
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <type.icon className={`h-5 w-5 ${equipmentType === type.value ? "text-blue-600" : "text-slate-400"}`} />
                                            <span className="font-medium text-sm">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Equipment Name */}
                            <div className="space-y-2">
                                <Label htmlFor="equipmentName" className="text-sm font-bold text-slate-700">
                                    Equipment Name
                                </Label>
                                <input
                                    id="equipmentName"
                                    type="text"
                                    placeholder="e.g. Gibson ES-335, Mesa Boogie Mark V"
                                    value={equipmentName}
                                    onChange={(e) => setEquipmentName(e.target.value)}
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-2">
                                <Label htmlFor="additionalInfo" className="text-sm font-bold text-slate-700">
                                    Additional Information <span className="text-slate-400 font-normal">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="additionalInfo"
                                    placeholder="Any other details, links, or context that might help us understand your request better..."
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value.slice(0, 300))}
                                    className="min-h-[120px] resize-none bg-white border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-xl p-4 text-sm"
                                />
                                <p className="text-xs text-slate-400 text-right">
                                    {additionalInfo.length}/300 characters
                                </p>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-700">
                                    Your Email <span className="text-red-500">*</span>
                                </Label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 placeholder:text-slate-400"
                                    required
                                />
                                <p className="text-xs text-slate-400">
                                    We'll use this to notify you when your requested feature is added
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !equipmentType || !email}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span>Submit Feature Request</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* What Happens Next */}
                <Card className="border-none shadow-lg ring-1 ring-slate-900/5 overflow-hidden bg-white">
                    <CardContent className="p-6 md:p-8">
                        <h3 className="font-bold text-slate-900 mb-4">What happens next?</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-slate-600">We review all feature requests regularly</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-slate-600">Popular requests are prioritized for development</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-slate-600">You'll be notified via email when your requested feature is added</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
