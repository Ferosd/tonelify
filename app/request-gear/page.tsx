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
            <div className="min-h-screen bg-[#08080C] py-12 px-4">
                <div className="max-w-xl mx-auto">
                    <Card className="border border-white/8 overflow-hidden bg-[#12121A]">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="h-8 w-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#F2F0ED] mb-3">Request Submitted!</h2>
                            <p className="text-[#8A8494] mb-6">
                                Thank you for your gear request. We&apos;ll review it and notify you via email when it&apos;s added to our database.
                            </p>
                            <Button
                                onClick={() => setIsSuccess(false)}
                                className="bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold"
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
        <div className="min-h-screen bg-[#08080C] py-12 px-4">
            <div className="max-w-xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-[#E8712A]/10 text-[#E8712A] px-4 py-2 rounded-full text-sm font-medium">
                        <MessageSquare className="h-4 w-4" />
                        Feature Request
                    </div>
                    <h1 className="text-3xl font-bold text-[#F2F0ED]">Request New Gear</h1>
                    <p className="text-[#8A8494] max-w-md mx-auto">
                        Can&apos;t find the guitar, amp, or pedal you need? Let us know and we&apos;ll add it to our database.
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border border-white/8 overflow-hidden bg-[#12121A]">
                    <CardHeader className="bg-white/3 border-b border-white/8 p-6">
                        <h2 className="text-lg font-bold text-[#F2F0ED]">Equipment Details</h2>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Equipment Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-[#F2F0ED]">
                                    Equipment Type <span className="text-[#E8712A]">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {equipmentTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setValue("equipment_type", type.value, { shouldValidate: true })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 flex items-center gap-3 transition-colors",
                                                equipmentType === type.value
                                                    ? "border-[#E8712A] bg-[#E8712A]/10 text-[#E8712A]"
                                                    : "border-white/8 hover:border-[#E8712A]/40 hover:bg-white/3 text-[#8A8494]"
                                            )}
                                        >
                                            <type.icon className={cn("h-5 w-5", equipmentType === type.value ? "text-[#E8712A]" : "text-[#8A8494]")} />
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
                                <Label htmlFor="equipment_name" className="text-sm font-bold text-[#F2F0ED]">
                                    Equipment Name <span className="text-[#E8712A]">*</span>
                                </Label>
                                <Input
                                    id="equipment_name"
                                    placeholder="e.g. Gibson ES-335, Mesa Boogie Mark V"
                                    {...register("equipment_name")}
                                    className={cn(
                                        "w-full h-12 px-4 bg-[#0E0E14] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 placeholder:text-[#8A8494] text-[#F2F0ED]",
                                        errors.equipment_name ? "border-red-500" : "border-white/8"
                                    )}
                                />
                                {errors.equipment_name && (
                                    <p className="text-xs text-red-500 font-medium">{errors.equipment_name.message}</p>
                                )}
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-2">
                                <Label htmlFor="additional_info" className="text-sm font-bold text-[#F2F0ED]">
                                    Additional Information <span className="text-[#8A8494] font-normal">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="additional_info"
                                    placeholder="Any other details, links, or context that might help us understand your request better..."
                                    {...register("additional_info")}
                                    className="min-h-[120px] resize-none bg-[#0E0E14] border-white/8 focus:border-[#E8712A]/60 focus:ring-2 focus:ring-[#E8712A]/20 rounded-xl p-4 text-sm text-[#F2F0ED] placeholder:text-[#8A8494]"
                                />
                                <p className="text-xs text-[#8A8494] text-right">
                                    {(watch("additional_info") || "").length}/300 characters
                                </p>
                                {errors.additional_info && (
                                    <p className="text-xs text-red-500 font-medium">{errors.additional_info.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-[#F2F0ED]">
                                    Your Email <span className="text-[#E8712A]">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    {...register("email")}
                                    className={cn(
                                        "w-full h-12 px-4 bg-[#0E0E14] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8712A]/20 focus:border-[#E8712A]/60 placeholder:text-[#8A8494] text-[#F2F0ED]",
                                        errors.email ? "border-red-500" : "border-white/8"
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                                )}
                                <p className="text-xs text-[#8A8494]">
                                    We&apos;ll use this to notify you when your requested feature is added
                                </p>
                            </div>

                            {/* Error Message */}
                            {submitError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    {submitError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold rounded-xl shadow-lg shadow-[#E8712A]/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
                <Card className="border border-white/8 overflow-hidden bg-[#12121A]">
                    <CardContent className="p-6 md:p-8">
                        <h3 className="font-bold text-[#F2F0ED] mb-4">What happens next?</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-[#8A8494]">We review all feature requests regularly</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-[#8A8494]">Popular requests are prioritized for development</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-[#8A8494]">You&apos;ll be notified via email when your requested feature is added</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
