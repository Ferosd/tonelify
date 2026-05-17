"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Guitar, Bookmark, Settings, Sparkles, MessageSquare, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

const routes = [
  { href: "/tone-match",    label: "Match Tones",  icon: Guitar },
  { href: "/collection",    label: "Collection",   icon: Bookmark },
  { href: "/settings",      label: "Settings",     icon: Settings },
  { href: "/plans",         label: "Plans",        icon: Sparkles },
  { href: "/request-gear",  label: "Request Gear", icon: MessageSquare },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoaded } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      background: "rgba(8,8,10,0.8)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "border-color 0.3s",
    }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 24px", height: "60px",
        display: "flex", alignItems: "center", gap: "16px",
      }}>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Toggle menu"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--tn-text-secondary)", padding: "8px",
                display: "flex", alignItems: "center",
              }}
              className="md:hidden"
            >
              <Menu size={22} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            style={{
              background: "#0D0D10",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              width: 300,
            }}
          >
            <SheetHeader style={{ padding: "24px 24px 16px" }}>
              <SheetTitle style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
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
                    fontFamily: "var(--font-body)", fontWeight: 500,
                    fontSize: "0.9375rem", textDecoration: "none",
                    color: pathname === route.href ? "var(--tn-accent)" : "var(--tn-text-secondary)",
                    background: pathname === route.href ? "rgba(245,166,35,0.08)" : "transparent",
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
                    fontFamily: "var(--font-body)", fontWeight: 500,
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
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: "1.375rem", color: "var(--tn-accent)",
            textDecoration: "none", letterSpacing: "-0.01em",
            flexShrink: 0,
          }}
        >
          Tonelify
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
                fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.9375rem", textDecoration: "none",
                padding: "6px 14px", borderRadius: "8px",
                color: pathname === route.href ? "var(--tn-accent)" : "var(--tn-text-secondary)",
                background: pathname === route.href ? "rgba(245,166,35,0.08)" : "transparent",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                if (pathname !== route.href) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--tn-text-primary)"
                }
              }}
              onMouseLeave={e => {
                if (pathname !== route.href) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--tn-text-secondary)"
                }
              }}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Right: Sign In */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="ghost-btn" style={{ padding: "8px 20px", fontSize: "0.9375rem" }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <button className="ghost-btn" style={{ padding: "8px 20px", fontSize: "0.9375rem" }}>
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
