import React from "react";
import { cn } from "@/lib/utils";

interface StompboxProps {
    name: string;
    settings: string;
}

export const Stompbox = ({ name, settings }: StompboxProps) => {
    // Determine color based on pedal name keyword (simple heuristic)
    let color = "bg-gray-400"; // Default
    let knobColor = "bg-gray-800";

    const lowerName = name.toLowerCase();

    if (lowerName.includes("drive") || lowerName.includes("tube") || lowerName.includes("screamer") || lowerName.includes("distortion")) {
        color = "bg-green-500"; // Tube Screamer green
        if (lowerName.includes("distortion") || lowerName.includes("fuzz")) color = "bg-orange-600"; // DS-1 Orange or Fuzz
    } else if (lowerName.includes("chorus") || lowerName.includes("blue")) {
        color = "bg-blue-400"; // Chorus Blue
    } else if (lowerName.includes("delay") || lowerName.includes("echo")) {
        color = "bg-white border-2 border-gray-300"; // DD-3 White
        knobColor = "bg-gray-800";
    } else if (lowerName.includes("reverb")) {
        color = "bg-purple-400"; // Reverb Purple/Grey
    } else if (lowerName.includes("wah")) {
        color = "bg-black"; // Wah Black
        knobColor = "bg-white";
    } else if (lowerName.includes("compressor")) {
        color = "bg-blue-600"; // CS-3 Blue
    } else if (lowerName.includes("phaser")) {
        color = "bg-orange-400"; // Phase 90 Orange
    }

    // Parse settings string to get key-value pairs if possible
    // Expected format: "Level: 5, Drive: 3"
    const knobs = settings.split(',')
        .map(s => s.trim())
        .map(s => {
            const [label, value] = s.split(':').map(v => v.trim());
            return { label, value };
        })
        .filter(k => k.label && k.value);

    return (
        <div className={cn("relative w-32 h-48 rounded-lg shadow-lg flex flex-col items-center justify-between p-4 border-b-4 border-r-4 border-black/20", color)}>
            {/* Knobs Row */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
                {knobs.map((knob, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className={cn("w-6 h-6 rounded-full shadow-inner relative flex items-center justify-center", knobColor)}>
                            <div className="w-1 h-3 bg-white/80 rounded-sm transform origin-bottom translate-y-[-50%]"
                                style={{ transform: `rotate(${(parseInt(knob.value) || 5) * 36 - 180}deg)` }} />
                        </div>
                        <span className="text-[8px] font-bold uppercase mt-1 text-black/70 overflow-hidden text-ellipsis w-8 text-center">{knob.label}</span>
                    </div>
                ))}
                {knobs.length === 0 && (
                    // Verify fallback if settings aren't parsed typically
                    <div className="text-xs text-center font-mono opacity-80">{settings}</div>
                )}
            </div>

            {/* Foot Switch */}
            <div className="mt-auto mb-2 w-full flex flex-col items-center gap-2">
                <div className="text-sm font-bold text-center leading-tight uppercase tracking-tighter text-black/80 break-words w-full">
                    {name}
                </div>

                <div className="w-12 h-8 bg-gray-300 rounded-sm shadow-inner mx-auto border border-gray-400 flex items-center justify-center">
                    <div className="w-8 h-4 bg-gray-400 rounded-full"></div>
                </div>
            </div>

            {/* LED */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_2px_rgba(255,0,0,0.6)] animate-pulse"></div>
        </div>
    );
};
