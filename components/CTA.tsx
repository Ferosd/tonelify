import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
    return (
        <section className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white py-24 border-t border-slate-200 dark:border-white/5">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-slate-900 dark:text-white">
                            Ready to Stop Guessing Your Settings?
                        </h2>
                        <p className="mx-auto max-w-[600px] text-slate-600 dark:text-slate-400 md:text-xl">
                            Join thousands of guitarists who are already matching legendary tones with their gear.
                        </p>
                    </div>
                    <div className="flex flex-col w-full max-w-sm gap-4 mt-8">
                        <Link href="/sign-up">
                            <Button size="lg" className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 font-bold">
                                Start Your Tone Journey
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
