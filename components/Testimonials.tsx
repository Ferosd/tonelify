import { Star, Quote } from "lucide-react";

export function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "John Martinez",
            role: "Hobbyist Guitarist, 8 years playing",
            initials: "JM",
            content: "Finally nailed the Hendrix tone with my Squier Strat! The AI compensation for my gear was spot-on. This app changed how I approach learning songs.",
            avatarColor: "bg-indigo-500"
        },
        {
            id: 2,
            name: "Sarah Chen",
            role: "Covers Band Guitarist",
            initials: "SC",
            content: "Saved me hours of tweaking knobs. I just enter the song, my gear, and boom - instant results. Perfect for my covers band where I need different tones every gig.",
            avatarColor: "bg-blue-500"
        },
        {
            id: 3,
            name: "Mike Thompson",
            role: "Producer & Session Guitarist",
            initials: "MT",
            content: "As a home studio producer, this is a game-changer. I can quickly reference classic tones and adapt them to my recording setup. Worth every penny.",
            avatarColor: "bg-emerald-500"
        }
    ];

    return (
        <section className="bg-slate-50 py-20 px-8 w-full border-t border-slate-200">
            <div className="container mx-auto max-w-[1200px]">
                {/* Header */}
                <div className="text-center mb-[60px] space-y-4">
                    <h2 className="text-[40px] font-bold text-slate-900 leading-tight">
                        What Guitarists Say
                    </h2>
                    <p className="text-[18px] text-slate-600">
                        Real feedback from musicians using Tonelify
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md relative flex flex-col h-full hover:border-slate-300 transition-all duration-300"
                        >
                            {/* Decorative Quote */}
                            <Quote className="absolute top-8 left-8 h-12 w-12 text-slate-100 rotate-180 -translate-x-2 -translate-y-2 pointer-events-none" />

                            {/* Stars */}
                            <div className="flex justify-end mb-6">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-[#fbbf24] fill-[#fbbf24]" />
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <blockquote className="text-slate-700 text-[16px] leading-[1.8] italic mb-8 flex-grow relative z-10">
                                "{testimonial.content}"
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                                <div className={`h-12 w-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center shrink-0 shadow-sm text-white`}>
                                    <span className="font-bold text-lg">{testimonial.initials}</span>
                                </div>
                                <div>
                                    <div className="text-slate-900 font-bold text-[16px]">{testimonial.name}</div>
                                    <div className="text-slate-500 text-[13px] font-medium">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
