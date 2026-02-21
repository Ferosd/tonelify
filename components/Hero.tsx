import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Star, Users, CheckCircle2 } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white pt-20 pb-20 md:pt-32 md:pb-32 min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center transition-colors duration-300">

            {/* Background Gradients (Subtle Light) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center">

                {/* Top Social Floating Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md hover:opacity-90 transition-opacity">
                        <span>📸</span> Follow us on Instagram
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold shadow-md hover:opacity-90 transition-opacity">
                        <span>🎵</span> Follow us on TikTok
                    </a>
                </div>

                {/* Main Content */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                        Stop Guessing <br />
                        <span className="text-slate-900 dark:text-white">Amp Settings</span>
                    </h1>
                    <p className="mx-auto max-w-[800px] text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium leading-relaxed px-2">
                        AI matches legendary guitar tones to YOUR exact gear in seconds. <br className="hidden md:block" />
                        Works with any guitar, amp, and pickups.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center gap-6 w-full pt-10">
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href="/tone-match">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 h-14 rounded-xl font-bold transition-all shadow-xl shadow-blue-200">
                                Start Matching Tones
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/#features">
                            <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-lg px-8 h-14 rounded-xl font-bold">
                                Learn More
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span> 1000+ songs
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span> Any gear
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span> Instant results
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span> Free to start
                        </span>
                    </div>
                </div>

                {/* Bottom Stats / Social Proof */}
                <div className="pt-16 flex flex-col items-center gap-6">
                    <Link href="/plans" className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <span className="text-lg">✨</span> View Subscription Plans
                    </Link>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-semibold text-slate-600">
                            <Users className="h-4 w-4 text-blue-500" />
                            Join 35k guitarists
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2 bg-green-50 border border-green-100 rounded-full shadow-sm text-sm font-semibold text-green-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            381 tones matched today
                        </div>
                    </div>
                </div>

                {/* Floating Reviews Badge (Absolute) */}
                <Link href="/#reviews" className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-full shadow-lg rotate-[-5deg] hover:rotate-0 transition-all hover:scale-105 cursor-pointer">
                    <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Reviews</span>
                </Link>

            </div>
        </section>
    )
}
