"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Guitar, Bookmark, Settings, Sparkles, MessageSquare, LogOut, Compass } from "lucide-react";
import { useState } from "react";

const routes = [
  { href: "/explore",       label: "Explore",      icon: Compass },
  { href: "/tone-match",    label: "Match Tones",  icon: Guitar },
  { href: "/collection",    label: "Collection",   icon: Bookmark },
  { href: "/settings",      label: "Settings",     icon: Settings },
  { href: "/plans",         label: "Plans",        icon: Sparkles },
  { href: "/request-gear",  label: "Request Gear", icon: MessageSquare },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
              className="flex items-center -ml-1 p-2 md:hidden"
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

            <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {routes.map(route => (
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

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <SignedIn>
                <SignOutButton>
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
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
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
              fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
              color: "#F5A623", letterSpacing: "-0.02em",
            }}
          >
            Tonelify
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex"
          style={{ flex: 1, justifyContent: "center", gap: "8px" }}
        >
          {routes.map(route => (
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
            <SignOutButton>
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
