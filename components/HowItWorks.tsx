import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Guitar, Zap } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Search Any Song",
            description: "Find any song from Hendrix to modern metal. Our database covers 1000+ legendary guitar tones.",
            icon: Search,
            placeholderLabel: "Search interface preview"
        },
        {
            id: 2,
            title: "Select Your Gear",
            description: "Tell us your exact guitar, amp, and pickups. We'll customize everything for YOUR specific setup.",
            icon: Guitar,
            placeholderLabel: "Equipment selector preview"
        },
        {
            id: 3,
            title: "Get Instant Settings",
            description: "Receive exact amp knob positions, pickup recommendations, and playing tips in seconds. Ready to dial in and play.",
            icon: Zap,
            placeholderLabel: "Results preview"
        }
    ];

    return (
        <section className="bg-white dark:bg-[#0f0f0f] py-20 px-8 w-full border-t border-slate-200 dark:border-white/5">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                        Get legendary tones in 3 simple steps
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 group"
                        >
                            {/* Step Number Circle */}
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                                <span className="text-2xl font-bold text-red-600 dark:text-red-500 group-hover:text-white">{step.id}</span>
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-4">
                                <step.icon className="h-6 w-6 text-slate-400 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                            </div>

                            <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-8 min-h-[80px]">
                                {step.description}
                            </p>

                            {/* Visual Placeholder */}
                            <div className="w-32 h-32 mx-auto bg-white dark:bg-[#2d2d2d] rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 transition-colors shadow-sm">
                                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono uppercase tracking-widest px-2">
                                    {step.placeholderLabel}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/tone-match">
                        <Button
                            className="h-14 px-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all hover:scale-105"
                        >
                            Try It Free - No Credit Card Required
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
