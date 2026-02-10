"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Activity, CreditCard, Guitar, User, Key, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { openUserProfile, signOut } = useClerk();
    const [activeTab, setActiveTab] = useState("settings");
    const [username, setUsername] = useState("");

    if (!isLoaded) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">Please sign in.</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Header Section - Blue Background */}
            <div className="bg-blue-600 pb-20 pt-8 md:pt-10 px-4 md:px-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white">

                    {/* User Profile Info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="h-20 w-20 rounded-2xl border-4 border-white/20 overflow-hidden shadow-sm bg-white">
                            <img
                                src={user.imageUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-bold">{user.username || user.fullName}</h1>
                            <p className="text-blue-100 text-sm mb-2">{user.primaryEmailAddress?.emailAddress}</p>
                            <Badge className="w-fit bg-blue-500 hover:bg-blue-500 text-white border-0">Free Account</Badge>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Link href="/tone-match">
                        <Button className="bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 shadow-sm">
                            <Guitar className="mr-2 h-4 w-4" />
                            Adapt Tone
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Main Content - Overlapping the Header */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 space-y-8 pb-12">

                {/* Tabs / Filters */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        variant={activeTab === "settings" ? "default" : "secondary"}
                        className={activeTab === "settings"
                            ? "bg-blue-600 hover:bg-blue-700 shadow-md rounded-lg h-10 px-6 transition-all"
                            : "bg-white hover:bg-slate-50 text-slate-600 shadow-sm rounded-lg h-10 px-6 transition-all"}
                        onClick={() => setActiveTab("settings")}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button
                        variant={activeTab === "activity" ? "default" : "secondary"}
                        className={activeTab === "activity"
                            ? "bg-blue-600 hover:bg-blue-700 shadow-md rounded-lg h-10 px-6 transition-all"
                            : "bg-white hover:bg-slate-50 text-slate-600 shadow-sm rounded-lg h-10 px-6 transition-all"}
                        onClick={() => setActiveTab("activity")}
                    >
                        <Activity className="mr-2 h-4 w-4" />
                        Activity
                        <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-500">0</Badge>
                    </Button>
                </div>

                <p className="text-sm text-slate-500 ml-1">
                    Looking for your saved gear? Visit your <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline">Collection</Link>
                </p>

                {/* 3. Stats Grid (Only on Settings Tab) */}
                {activeTab === "settings" && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Presets", value: 0 },
                                { label: "Saved Tones", value: 0 },
                                { label: "Activities", value: 0 },
                                { label: "Adaptations", value: 0 },
                            ].map((stat, i) => (
                                <Card key={i} className="flex flex-col items-center justify-center py-6 shadow-sm border-slate-200">
                                    <span className="text-2xl font-bold text-slate-700">{stat.value}</span>
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">{stat.label}</span>
                                </Card>
                            ))}
                        </div>

                        {/* 4. Subscription Section */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <Accordion type="single" collapsible defaultValue="subscription">
                                <AccordionItem value="subscription" className="border-0">
                                    <AccordionTrigger className="px-6 py-4 hover:no-underline bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-slate-800">Subscription</h3>
                                                <p className="text-xs text-slate-500">No active plan</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-slate-50/50 px-6 py-6 border-t border-slate-100">
                                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">PLAN</p>
                                                <p className="font-semibold text-slate-900">No Plan</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">STATUS</p>
                                                <p className="font-semibold text-slate-900">Inactive</p>
                                            </div>
                                        </div>
                                        <Link href="/plans">
                                            <Button className="bg-blue-300 hover:bg-blue-400 text-blue-900 font-bold border border-blue-300 shadow-sm">
                                                Manage Subscription ›
                                            </Button>
                                        </Link>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </Card>

                        {/* 5. Profile & Security Sections (Merged from Step 2) */}
                        <Accordion type="single" collapsible defaultValue="profile" className="space-y-4">

                            {/* Profile Section */}
                            <AccordionItem value="profile" className="border border-slate-200 rounded-xl bg-white px-2 shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-6 px-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">Profile</h3>
                                            <p className="text-sm text-muted-foreground font-normal">Picture and username</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-2">
                                    <div className="space-y-8">
                                        {/* Profile Picture */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-medium">Profile Picture</Label>
                                            <div className="flex items-center gap-6">
                                                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-slate-100">
                                                    <img
                                                        src={user.imageUrl}
                                                        alt="Profile"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 max-w-md">
                                                    <div className="flex items-center gap-3">
                                                        <Label
                                                            htmlFor="picture"
                                                            className="cursor-pointer inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-50 text-blue-600 hover:bg-blue-100 h-10 px-4 py-2"
                                                        >
                                                            Dosya Seç
                                                        </Label>
                                                        <span className="text-sm text-muted-foreground">Dosya seçilmedi</span>
                                                        <Input id="picture" type="file" className="hidden" />
                                                    </div>
                                                    <p className="mt-2 text-xs text-slate-400">
                                                        Max 5MB • JPG, PNG, GIF
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div className="space-y-4">
                                            <Label htmlFor="username" className="text-base font-medium">Username</Label>
                                            <div className="flex gap-4">
                                                <Input
                                                    id="username"
                                                    placeholder="Enter username"
                                                    defaultValue={user.username || ""}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="max-w-xl h-11 border-slate-200"
                                                />
                                                <Button className="h-11 bg-blue-600 hover:bg-blue-700 px-8 text-base font-semibold shadow-sm rounded-lg">
                                                    Save
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                3-30 characters, letters, numbers, underscores, hyphens
                                            </p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Security Section */}
                            <AccordionItem value="security" className="border border-slate-200 rounded-xl bg-white px-2 shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-6 px-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <Key className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">Security</h3>
                                            <p className="text-sm text-muted-foreground font-normal">Password and sign out</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-2">
                                    <div className="space-y-4 max-w-xl">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Manage your password and session settings.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={() => openUserProfile()} className="h-10 border-slate-200">
                                                Change Password
                                            </Button>
                                            <Button variant="destructive" onClick={() => signOut()} className="h-10">
                                                Sign Out
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Delete Account Section */}
                            <AccordionItem value="delete" className="border border-red-100 rounded-xl bg-white px-2 shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-6 px-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-red-600">Delete Account</h3>
                                            <p className="text-sm text-muted-foreground font-normal">Permanently delete your account</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-2">
                                    <div className="space-y-4 max-w-xl">
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                            <p className="font-medium">Warning: This action is not reversible.</p>
                                            <p className="mt-1 text-red-600/80">Please be certain.</p>
                                        </div>
                                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 h-10">
                                            Delete My Account
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </>
                )}

                {/* 4. Activity Tab Content */}
                {activeTab === "activity" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                            <p className="text-sm text-slate-500">Your tone research and adaptations</p>
                        </div>

                        <Card className="flex flex-col items-center justify-center p-12 border-slate-200 border-dashed min-h-[400px]">
                            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                                <Activity className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No activity yet</h3>
                            <p className="text-slate-500 text-center max-w-sm mb-8">
                                Start using the app to track your activity
                            </p>
                            <Link href="/tone-match">
                                <Button className="bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 shadow-sm font-semibold">
                                    <Guitar className="mr-2 h-4 w-4" />
                                    Start Adapting
                                </Button>
                            </Link>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
