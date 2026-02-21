"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Check, Loader2, MessageSquare, Guitar, Speaker, CircleDot, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gearRequestSchema, type GearRequestFormValues } from "@/lib/validations/gear";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function RequestGearPage() {
    const { user } = useUser();
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<GearRequestFormValues>({
        resolver: zodResolver(gearRequestSchema),
        defaultValues: {
            equipment_type: "",
            equipment_name: "",
            additional_info: "",
            email: "",
        },
    });

    // Populate email when user loads
    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setValue("email", user.primaryEmailAddress.emailAddress);
        }
    }, [user, setValue]);

    const equipmentType = watch("equipment_type");

    const equipmentTypes = [
        { value: "guitar", label: "Guitar", icon: Guitar },
        { value: "amp", label: "Amplifier", icon: Speaker },
        { value: "pedal", label: "Pedal / Effect", icon: CircleDot },
        { value: "other", label: "Other", icon: HelpCircle },
    ];

    const onSubmit = async (data: GearRequestFormValues) => {
        setSubmitError("");
        try {
            const response = await fetch("/api/gear-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Failed to submit request");
            }

            setIsSuccess(true);
            reset();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0a0a] dark:to-[#111] py-12 px-4 transition-colors duration-300">
                <div className="max-w-xl mx-auto">
                    <Card className="border-none shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Request Submitted!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0a0a] dark:to-[#111] py-12 px-4 transition-colors duration-300">
            <div className="max-w-xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                        <MessageSquare className="h-4 w-4" />
                        Feature Request
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Request New Gear</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Can't find the guitar, amp, or pedal you need? Let us know and we'll add it to our database.
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border-none shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                    <CardHeader className="bg-slate-50/80 dark:bg-[#222]/80 border-b border-slate-100 dark:border-white/5 p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Equipment Details</h2>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Equipment Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Equipment Type <span className="text-blue-500">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {equipmentTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setValue("equipment_type", type.value, { shouldValidate: true })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 flex items-center gap-3 transition-all",
                                                equipmentType === type.value
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                    : "border-slate-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-[#222]"
                                            )}
                                        >
                                            <type.icon className={cn("h-5 w-5", equipmentType === type.value ? "text-blue-600" : "text-slate-400")} />
                                            <span className="font-medium text-sm">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.equipment_type && (
                                    <p className="text-xs text-red-500 font-medium">{errors.equipment_type.message}</p>
                                )}
                            </div>

                            {/* Equipment Name */}
                            <div className="space-y-2">
                                <Label htmlFor="equipment_name" className="text-sm font-bold text-slate-700">
                                    Equipment Name <span className="text-blue-500">*</span>
                                </Label>
                                <Input
                                    id="equipment_name"
                                    placeholder="e.g. Gibson ES-335, Mesa Boogie Mark V"
                                    {...register("equipment_name")}
                                    className={cn(
                                        "w-full h-12 px-4 bg-white dark:bg-[#111] border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-400 placeholder:text-slate-400 text-slate-900 dark:text-white",
                                        errors.equipment_name ? "border-red-500 focus:ring-red-50" : "border-slate-200 dark:border-white/10"
                                    )}
                                />
                                {errors.equipment_name && (
                                    <p className="text-xs text-red-500 font-medium">{errors.equipment_name.message}</p>
                                )}
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-2">
                                <Label htmlFor="additional_info" className="text-sm font-bold text-slate-700">
                                    Additional Information <span className="text-slate-400 font-normal">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="additional_info"
                                    placeholder="Any other details, links, or context that might help us understand your request better..."
                                    {...register("additional_info")}
                                    className="min-h-[120px] resize-none bg-white border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-xl p-4 text-sm"
                                />
                                <p className="text-xs text-slate-400 text-right">
                                    {(watch("additional_info") || "").length}/300 characters
                                </p>
                                {errors.additional_info && (
                                    <p className="text-xs text-red-500 font-medium">{errors.additional_info.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-700">
                                    Your Email <span className="text-blue-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    {...register("email")}
                                    className={cn(
                                        "w-full h-12 px-4 bg-white border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 placeholder:text-slate-400",
                                        errors.email ? "border-red-500 focus:ring-red-50" : "border-slate-200"
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                                )}
                                <p className="text-xs text-slate-400">
                                    We'll use this to notify you when your requested feature is added
                                </p>
                            </div>

                            {/* Error Message */}
                            {submitError && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                                    {submitError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Submit Request
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
