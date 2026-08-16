'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

/**
 * The footer every page except the landing page gets.
 *
 * The landing page carries its own, so a reader who arrives there can reach
 * the guides, the FAQ and the legal pages from the bottom of the page. Every
 * other page ended at its last section: a visitor on a gear page had four
 * links in the header and nothing else, and a crawler that landed on one of
 * the 123 gear URLs could not reach /guides or /about at all without going
 * back to the homepage. Depth like that is what keeps a section crawled rarely.
 *
 * Not rendered on the signed-in surfaces or the auth screens. Those are tools,
 * not pages to browse away from, and they are noindex anyway.
 */
const HIDDEN_PREFIXES = ['/dashboard', '/collection', '/settings', '/admin', '/sign-in', '/sign-up']

const TONES = [
    { href: '/explore', label: 'Explore tones' },
    { href: '/tone-match', label: 'Match a tone' },
]

/** Appended to the Tones column once there is an account: see /plans. */
const PLANS_LINK = { href: '/plans', label: 'Plans' }

const REFERENCE = [
    { href: '/gear', label: 'Settings by gear' },
    { href: '/guides', label: 'Tone guides' },
    { href: '/faq', label: 'FAQ' },
]

const COMPANY = [
    { href: '/about', label: 'About and method' },
    { href: '/feedback', label: 'Send feedback' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
]

function Column({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
    return (
        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#F5A623] mb-4">{heading}</h2>
            <ul className="space-y-1">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link
                            href={l.href}
                            className="inline-flex items-center min-h-11 text-[0.9375rem] text-[#A6A29B] hover:text-[#F2F2F7] transition-colors"
                        >
                            {l.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function SiteFooter() {
    const pathname = usePathname()
    const { isSignedIn } = useUser()
    if (pathname === '/') return null
    if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

    const tones = isSignedIn ? [...TONES, PLANS_LINK] : TONES

    return (
        // The bottom padding clears the mobile tab bar, which is fixed and would
        // otherwise sit on top of the legal line.
        <footer className="border-t border-white/8 bg-[#08080A] font-sans pb-24 md:pb-10 pt-14">
            <div className="container max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
                    <div className="col-span-2 md:col-span-1">
                        <Link
                            href="/"
                            className="font-display text-2xl font-bold text-[#F5A623]"
                            style={{ letterSpacing: '-0.01em' }}
                        >
                            Tonelify
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-[#8A8494] max-w-[280px]">
                            Recorded guitar tones, translated into knob settings for the amp and
                            guitar you already own.
                        </p>
                    </div>
                    <Column heading="Tones" links={tones} />
                    <Column heading="Reference" links={REFERENCE} />
                    <Column heading="Company" links={COMPANY} />
                </div>

                <div className="mt-10 pt-6 border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#8A8494]">© 2026 Tonelify. All rights reserved.</p>
                    <a
                        href="mailto:contact@tonelify.com"
                        className="inline-flex items-center min-h-11 text-xs text-[#8A8494] hover:text-[#F5A623] transition-colors"
                    >
                        contact@tonelify.com
                    </a>
                </div>
            </div>
        </footer>
    )
}
