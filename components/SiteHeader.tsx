"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Guitar, Bookmark, Settings, Sparkles, MessageSquare, LogOut, Compass, HelpCircle, Sliders, BookOpen } from "lucide-react";
import { useState } from "react";

/**
 * The whole nav, grouped the way the drawer shows it.
 *
 * Nine links across the top bar was the problem: past about five, a horizontal
 * nav stops being read and starts being scanned past, and every link competes
 * with the four that actually sell the product. The drawer holds all of them
 * now, at every width, and the bar keeps only the four.
 *
 * /gear and /guides are the two largest indexable sections on the site, so both
 * stay one tap from every page. An orphaned section gets crawled rarely and
 * ranks poorly no matter what is on it.
 */
/**
 * Routes that only exist once there is an account behind them.
 *
 * Plans is here because the prices sit behind sign-up now: linking to a page
 * that answers a signed-out visitor with a redirect is a dead link with a label
 * on it, and the label is the very word the gate is meant to hold back.
 */
const SIGNED_IN_ONLY = new Set(["/plans"]);

const groups: { label: string; routes: { href: string; label: string; icon: typeof Compass }[] }[] = [
  {
    label: "Tones",
    routes: [
      { href: "/explore", label: "Explore", icon: Compass },
      { href: "/tone-match", label: "Match Tones", icon: Guitar },
      { href: "/collection", label: "My Collection", icon: Bookmark },
    ],
  },
  {
    label: "Reference",
    routes: [
      { href: "/gear", label: "Settings by Gear", icon: Sliders },
      { href: "/guides", label: "Tone Guides", icon: BookOpen },
      { href: "/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    label: "Account",
    routes: [
      { href: "/plans", label: "Plans", icon: Sparkles },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/feedback", label: "Send Feedback", icon: MessageSquare },
    ],
  },
];

/**
 * The four that stay visible on a wide screen: browse, do the thing, the
 * biggest reference section, and the page that takes the money.
 */
const primary = [
  { href: "/explore", label: "Explore" },
  { href: "/tone-match", label: "Match Tones" },
  { href: "/gear", label: "Gear" },
  { href: "/plans", label: "Plans" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();

  // While Clerk is still loading, isSignedIn is undefined and the gated links
  // stay hidden. Hidden then shown is a link appearing; shown then hidden is a
  // link vanishing under the cursor, which is the worse of the two.
  const allowed = (href: string) => !SIGNED_IN_ONLY.has(href) || Boolean(isSignedIn);
  const visibleGroups = groups
    .map((g) => ({ ...g, routes: g.routes.filter((r) => allowed(r.href)) }))
    .filter((g) => g.routes.length > 0);
  const visiblePrimary = primary.filter((r) => allowed(r.href));

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(8,8,12,0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        // Sits under the status bar when installed to the home screen
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 h-[52px] md:h-[60px] flex items-center gap-2 md:gap-4">

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--tn-text-secondary)" }}
              // 36x36 before: the icon is 20px and p-2 added 8 either side, which
              // is under every touch-target guideline. The box grows, the icon doesn't.
              className="flex items-center justify-center -ml-2 h-11 w-11"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            style={{
              background: "#08080C",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              width: 300,
            }}
          >
            <SheetHeader style={{ padding: "24px 24px 16px" }}>
              <SheetTitle style={{
                fontFamily: "var(--font-heading)", fontWeight: 700,
                fontSize: "1.25rem", color: "var(--tn-accent)",
              }}>
                Tonelify
              </SheetTitle>
            </SheetHeader>

            {/* Grouped, because nine flat rows in a drawer is the same problem
                as nine links in a bar, just rotated ninety degrees */}
            <div style={{ padding: "0 16px 96px", display: "flex", flexDirection: "column", gap: "18px", overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
              {visibleGroups.map(group => (
                <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{
                    fontFamily: "var(--font-prose)", fontWeight: 700,
                    fontSize: "0.6875rem", textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "#F5A623",
                    padding: "0 16px 8px",
                  }}>
                    {group.label}
                  </span>
                  {group.routes.map(route => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 16px", borderRadius: "10px",
                        fontFamily: "var(--font-prose)", fontWeight: 500,
                        fontSize: "0.9375rem", textDecoration: "none",
                        color: pathname === route.href ? "var(--tn-accent)" : "var(--tn-text-secondary)",
                        background: pathname === route.href ? "rgba(232,113,42,0.08)" : "transparent",
                      }}
                    >
                      <route.icon size={18} />
                      {route.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <SignedIn>
                {/* Without a target, signing out on a protected page leaves you on
                that page and middleware bounces you into sign-in — which reads
                as the sign-out having failed */}
            <SignOutButton redirectUrl="/">
                  <button style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-prose)", fontWeight: 500,
                    fontSize: "0.9375rem", color: "var(--tn-text-secondary)",
                    padding: "8px 0", width: "100%",
                  }}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </SignOutButton>
              </SignedIn>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        {/* min-h-11 rather than letting the 28px logo set the height: this is the
            way back to the homepage from every page on the site and it was the
            smallest target in the bar. */}
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline min-h-11">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-7 md:h-10 md:w-10 rounded-lg object-contain bg-transparent"
          />
          <span
            className="text-[1.0625rem] md:text-[1.35rem] leading-none"
            style={{
              fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
              color: "#F5A623", letterSpacing: "-0.01em",
            }}
          >
            Tonelify
          </span>
        </Link>

        {/* Four links, not nine. The rest live in the drawer, which is now the
            nav at every width rather than the phone fallback. */}
        <nav
          className="hidden md:flex"
          style={{ flex: 1, justifyContent: "center", gap: "8px" }}
        >
          {visiblePrimary.map(route => (
            <Link
              key={route.href}
              href={route.href}
              style={{
                fontFamily: "var(--font-prose)", fontWeight: 500,
                fontSize: "0.9375rem", textDecoration: "none",
                padding: "6px 14px", borderRadius: "8px",
                color: pathname === route.href ? "var(--tn-accent)" : "var(--tn-text-secondary)",
                background: pathname === route.href ? "rgba(232,113,42,0.08)" : "transparent",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                if (pathname !== route.href) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#E8712A"
                }
              }}
              onMouseLeave={e => {
                if (pathname !== route.href) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#8A8494"
                }
              }}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Right: account */}
        <div className="ml-auto flex items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="ghost-btn text-[0.8125rem] md:text-[0.9375rem] px-4 py-1.5 md:px-5 md:py-2 whitespace-nowrap border border-white/12 hover:border-[#E8712A] transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {/* Sign out lives in the drawer on phones — the bar stays quiet */}
            {/* Without a target, signing out on a protected page leaves you on
                that page and middleware bounces you into sign-in — which reads
                as the sign-out having failed */}
            <SignOutButton redirectUrl="/">
              <button className="ghost-btn hidden md:inline-flex text-[0.9375rem] px-5 py-2 whitespace-nowrap border border-white/12 hover:border-[#E8712A] transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
