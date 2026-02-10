"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Guitar, Bookmark, Settings, Sparkles, MessageSquare, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SiteHeader() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user, isLoaded } = useUser();

    const routes = [
        {
            href: "/tone-match",
            label: "Match Tones",
            icon: Guitar,
            active: pathname === "/tone-match",
        },
        {
            href: "/dashboard",
            label: "Collection",
            icon: Bookmark,
            active: pathname === "/dashboard",
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
                                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <span className="text-lg">T</span>
                                </div>
                                <span>Tonelify</span>
                            </SheetTitle>
                        </SheetHeader>

                        {/* Account Section */}
                        <div className="px-6 py-6">
                            <SignedIn>
                                {isLoaded && user && (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={user.imageUrl} />
                                            <AvatarFallback>{user.firstName?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-semibold truncate">
                                                {user.fullName || "Account"}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {user.primaryEmailAddress?.emailAddress}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </SignedIn>
                            <SignedOut>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium mb-2">My Account</p>
                                    <SignInButton mode="modal">
                                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
                                    </SignInButton>
                                    <span className="text-xs text-muted-foreground text-center block mt-2">
                                        or <SignUpButton mode="modal"><span className="underline cursor-pointer hover:text-primary">Sign Up</span></SignUpButton>
                                    </span>
                                </div>
                            </SignedOut>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 px-4 overflow-y-auto">
                            <nav className="space-y-1">
                                {routes.map((route, index) => (
                                    <Link
                                        key={index}
                                        href={route.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            route.active
                                                ? "bg-accent text-accent-foreground"
                                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                        )}
                                    >
                                        <route.icon className="h-4 w-4" />
                                        {route.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-6 border-t mt-auto">
                            <SignedIn>
                                <SignOutButton>
                                    <button className="flex items-center gap-3 text-sm font-medium text-red-500 hover:text-red-600 transition-colors w-full px-2 py-2 rounded-lg hover:bg-red-50">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </SignOutButton>
                            </SignedIn>
                        </div>

                    </SheetContent>
                </Sheet>

                {/* Mobile/Desktop Header Title (Centered or Right) if needed, keeping simple logo here too for context when menu is closed */}
                <div className="flex items-center gap-2 mr-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-primary text-xl font-bold">Tonelify</span>
                    </Link>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {/* Keep UserButton here too? Or hide it since it's in sidebar? 
                         User asked for "sol tarafta" (left side) menu. 
                         Usually headers still have a profile icon. 
                         I'll keep the standard UserButton on the right for convenience, or hide it if strict adherence to "sidebar has everything" is needed.
                         I'll keep it for now as it's standard UX.
                     */}
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
