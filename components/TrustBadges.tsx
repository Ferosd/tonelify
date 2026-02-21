import { Lock, RotateCcw, CheckCircle, Globe } from "lucide-react";

export function TrustBadges() {
    const badges = [
        {
            id: 1,
            icon: Lock,
            title: "Secure Payments",
            subtitle: "Powered by Stripe"
        },
        {
            id: 2,
            icon: RotateCcw,
            title: "7-Day Free Trial",
            subtitle: "Cancel anytime"
        },
        {
            id: 3,
            icon: CheckCircle,
            title: "No Commitment",
            subtitle: "Cancel anytime"
        },
        {
            id: 4,
            icon: Globe,
            title: "35,000+ Users",
            subtitle: "Trusted worldwide"
        }
    ];

    return (
        <section className="bg-white py-10 border-b border-slate-100 w-full">
            <div className="container px-4 md:px-6 mx-auto max-w-[1000px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {badges.map((badge) => (
                        <div key={badge.id} className="flex flex-col items-center text-center space-y-2 group">
                            <div className="mb-2 p-2 rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors">
                                <badge.icon className="h-8 w-8 text-slate-700 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900 leading-tight">
                                    {badge.title}
                                </h4>
                                <p className="text-sm text-slate-500 font-medium">
                                    {badge.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
