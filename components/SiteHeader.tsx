"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Guitar, Bookmark, Settings, Sparkles, MessageSquare, LogOut, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

export function SiteHeader() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user, isLoaded } = useUser();
    const { setTheme, theme } = useTheme();

    const routes = [
        {
            href: "/tone-match",
            label: "Match Tones",
            icon: Guitar,
            active: pathname === "/tone-match",
        },
        {
            href: "/collection",
            label: "Collection",
            icon: Bookmark,
            active: pathname === "/collection",
        },
        {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            active: pathname === "/settings",
        },
        {
            href: "/plans",
            label: "Plans",
            icon: Sparkles,
            active: pathname === "/plans",
        },
        {
            href: "/request-gear",
            label: "Request Gear",
            icon: MessageSquare,
            active: pathname === "/request-gear",
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4">

                {/* HAMBURGER MENU (Visible on ALL screens now) */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col h-full">

                        {/* Sidebar Header */}
                        <SheetHeader className="p-6 text-left border-b">
                            <SheetTitle className="flex items-center gap-2 font-bold text-xl">
                                <img src="/logo-new.svg" alt="Tonelify" className="h-8 w-8 object-contain" />
                                <span>Tonelify</span>
                            </SheetTitle>
                        </SheetHeader>

                        {/* Sidebar Links */}
                        <div className="flex flex-col gap-1 p-4">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                        route.active
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    <route.icon className={cn("h-5 w-5", route.active ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                                    {route.label}
                                </Link>
                            ))}
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-6 border-t mt-auto">
                            <SignedIn>
                                <SignOutButton>
                                    <button className="flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-full px-2 py-2 rounded-lg hover:bg-blue-50">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </SignOutButton>
                            </SignedIn>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Mobile/Desktop Header Title */}
                <div className="flex items-center gap-2 mr-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/logo-new.svg" alt="Tonelify Logo" className="h-10 w-auto object-contain" />
                    </Link>
                </div>



                <div className="ml-auto flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-10 w-10 rounded-full transition-transform hover:scale-105 active:scale-95"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button size="sm" variant="ghost">Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </header>
    );
}
