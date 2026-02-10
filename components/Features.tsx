import { Zap, Settings, Search, Music, Mic2, Smartphone } from "lucide-react"

const features = [
    {
        name: "Smart Analysis",
        description: "Advanced algorithms search documented gear info, amp settings, and tone characteristics from rig rundowns, interviews, and gear forums.",
        icon: Search,
    },
    {
        name: "Gear Adaptation",
        description: "Automatically compensates for pickup output differences, amp voicing changes, and gear mismatches to translate the tone to your setup.",
        icon: Settings,
    },
    {
        name: "Instant Results",
        description: "Get amp settings, pickup recommendations, and playing tips in seconds — ready to dial in and play. Designed around real amps and realistic limitations.",
        icon: Zap,
    },
]

export function Features() {
    return (
        <section className="bg-slate-50 text-slate-900 py-24 border-t border-slate-200" id="features">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-slate-900">
                        Everything you need to match legendary guitar tones
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Our AI engine does the heavy lifting so you can focus on playing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div key={feature.name} className="group relative p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500/30 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5">
                            <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                                {feature.name}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
