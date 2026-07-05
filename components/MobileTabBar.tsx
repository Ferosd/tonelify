"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Guitar, Bookmark, Settings } from "lucide-react"

const tabs = [
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/tone-match", label: "Match", icon: Guitar },
    { href: "/collection", label: "Collection", icon: Bookmark },
    { href: "/settings", label: "Settings", icon: Settings },
]

export function MobileTabBar() {
    const pathname = usePathname()
    // App-style bottom nav only makes sense inside the product, not on the landing page
    if (pathname === "/") return null

    return (
        <nav
            aria-label="Primary mobile navigation"
            className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/8"
            style={{
                background: "rgba(8,8,12,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
        >
            <div className="flex items-stretch justify-around">
                {tabs.map((tab) => {
                    const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
                    const Icon = tab.icon
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex flex-col items-center gap-1 flex-1 py-2.5 text-[10px] font-bold tracking-wide transition-colors ${active ? "text-[#F5A623]" : "text-[#8A8494] hover:text-[#F2F2F7]"
                                }`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                            {tab.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
