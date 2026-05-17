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
import { UserSubscription } from "@/lib/subscription";

interface SettingsContentProps {
    subscription: UserSubscription;
}

export function SettingsContent({ subscription }: SettingsContentProps) {
    const { user, isLoaded } = useUser();
    const { openUserProfile, signOut } = useClerk();
    const [activeTab, setActiveTab] = useState("settings");
    const [username, setUsername] = useState("");

    if (!isLoaded) return <div className="p-8 bg-[#08080C] min-h-screen text-[#8A8494]">Loading...</div>;
    if (!user) return <div className="p-8 bg-[#08080C] min-h-screen text-[#8A8494]">Please sign in.</div>;

    return (
        <div className="min-h-screen bg-[#08080C]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E8712A] to-[#9B5DE5] pb-20 pt-8 md:pt-10 px-4 md:px-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white">

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="h-20 w-20 rounded-2xl border-4 border-white/20 overflow-hidden shadow-sm bg-white/10">
                            <img
                                src={user.imageUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-bold">{user.username || user.fullName}</h1>
                            <p className="text-white/70 text-sm mb-2">{user.primaryEmailAddress?.emailAddress}</p>
                            <Badge className="w-fit bg-white/20 hover:bg-white/20 text-white border-0 capitalize">
                                {subscription.plan === 'free' ? 'Free Account' : `${subscription.plan} Plan`}
                            </Badge>
                        </div>
                    </div>

                    <Link href="/tone-match">
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm">
                            <Guitar className="mr-2 h-4 w-4" />
                            Adapt Tone
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 space-y-8 pb-12">

                {/* Tabs */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        variant={activeTab === "settings" ? "default" : "secondary"}
                        className={activeTab === "settings"
                            ? "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] shadow-md rounded-lg h-10 px-6 transition-colors"
                            : "bg-[#12121A] hover:bg-[#1A1A22] text-[#8A8494] border border-white/8 rounded-lg h-10 px-6 transition-colors"}
                        onClick={() => setActiveTab("settings")}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button
                        variant={activeTab === "activity" ? "default" : "secondary"}
                        className={activeTab === "activity"
                            ? "bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] shadow-md rounded-lg h-10 px-6 transition-colors"
                            : "bg-[#12121A] hover:bg-[#1A1A22] text-[#8A8494] border border-white/8 rounded-lg h-10 px-6 transition-colors"}
                        onClick={() => setActiveTab("activity")}
                    >
                        <Activity className="mr-2 h-4 w-4" />
                        Activity
                        <Badge variant="secondary" className="ml-2 bg-white/8 text-[#8A8494]">
                            {subscription.matchesUsed}
                        </Badge>
                    </Button>
                </div>

                <p className="text-sm text-[#8A8494] ml-1">
                    Looking for your saved gear? Visit your <Link href="/dashboard" className="text-[#E8712A] font-semibold hover:underline">Collection</Link>
                </p>

                {/* Settings Tab */}
                {activeTab === "settings" && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Presets", value: 0 },
                                { label: "Saved Tones", value: 0 },
                                { label: "Activities", value: subscription.matchesUsed },
                                { label: "Adaptations", value: 0 },
                            ].map((stat, i) => (
                                <Card key={i} className="flex flex-col items-center justify-center py-6 bg-[#12121A] border-white/8">
                                    <span className="text-2xl font-bold text-[#F2F0ED]">{stat.value}</span>
                                    <span className="text-xs text-[#8A8494] font-medium uppercase tracking-wide mt-1">{stat.label}</span>
                                </Card>
                            ))}
                        </div>

                        {/* Subscription */}
                        <Card className="border-white/8 bg-[#12121A] overflow-hidden">
                            <Accordion type="single" collapsible defaultValue="subscription">
                                <AccordionItem value="subscription" className="border-0">
                                    <AccordionTrigger className="px-6 py-4 hover:no-underline bg-[#12121A]">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-[#E8712A]/10 text-[#E8712A] flex items-center justify-center">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-[#F2F0ED]">Subscription</h3>
                                                <p className="text-xs text-[#8A8494] capitalize">{subscription.plan} Plan</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-white/3 px-6 py-6 border-t border-white/8">
                                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                                            <div>
                                                <p className="text-xs font-bold text-[#8A8494] uppercase mb-1">PLAN</p>
                                                <p className="font-semibold text-[#F2F0ED] capitalize">{subscription.plan}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#8A8494] uppercase mb-1">STATUS</p>
                                                <p className="font-semibold text-[#F2F0ED] capitalize">{subscription.status}</p>
                                            </div>
                                        </div>
                                        {subscription.plan === 'free' ? (
                                            <Link href="/plans">
                                                <Button className="bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] font-bold shadow-sm">
                                                    Upgrade Plan 🚀
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch("/api/stripe/portal", {
                                                            method: "POST",
                                                        });
                                                        const data = await response.json();
                                                        if (data.url) window.location.href = data.url;
                                                        else alert("Failed to load portal");
                                                    } catch (error) {
                                                        console.error("Error:", error);
                                                        alert("Something went wrong");
                                                    }
                                                }}
                                                className="bg-[#12121A] hover:bg-[#1A1A22] text-[#F2F0ED] border border-white/8 shadow-sm"
                                            >
                                                Manage Billing & Subscription
                                            </Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </Card>

                        {/* Profile & Security */}
                        <Accordion type="single" collapsible defaultValue="profile" className="space-y-4">

                            <AccordionItem value="profile" className="border border-white/8 rounded-xl bg-[#12121A] px-2">
                                <AccordionTrigger className="hover:no-underline py-6 px-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8712A]/10 text-[#E8712A]">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-[#F2F0ED]">Profile</h3>
                                            <p className="text-sm text-[#8A8494] font-normal">Picture and username</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-2">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-base font-medium text-[#F2F0ED]">Profile Picture</Label>
                                            <div className="flex items-center gap-6">
                                                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/8">
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
                                                            className="cursor-pointer inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#E8712A]/10 text-[#E8712A] hover:bg-[#E8712A]/20 h-10 px-4 py-2"
                                                        >
                                                            Dosya Seç
                                                        </Label>
                                                        <span className="text-sm text-[#8A8494]">Dosya seçilmedi</span>
                                                        <Input id="picture" type="file" className="hidden" />
                                                    </div>
                                                    <p className="mt-2 text-xs text-[#8A8494]">
                                                        Max 5MB • JPG, PNG, GIF
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label htmlFor="username" className="text-base font-medium text-[#F2F0ED]">Username</Label>
                                            <div className="flex gap-4">
                                                <Input
                                                    id="username"
                                                    placeholder="Enter username"
                                                    defaultValue={user.username || ""}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="max-w-xl h-11 border-white/8 bg-[#0E0E14] text-[#F2F0ED] placeholder:text-[#8A8494]"
                                                />
                                                <Button className="h-11 bg-[#E8712A] hover:bg-[#D4621F] text-[#08080C] px-8 text-base font-semibold rounded-lg">
                                                    Save
                                                </Button>
                                            </div>
                                            <p className="text-xs text-[#8A8494]">
                                                3-30 characters, letters, numbers, underscores, hyphens
                                            </p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="security" className="border border-white/8 rounded-xl bg-[#12121A] px-2">
                                <AccordionTrigger className="hover:no-underline py-6 px-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9B5DE5]/10 text-[#9B5DE5]">
                                            <Key className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-[#F2F0ED]">Security</h3>
                                            <p className="text-sm text-[#8A8494] font-normal">Password and sign out</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-2">
                                    <div className="space-y-4 max-w-xl">
                                        <p className="text-sm text-[#8A8494] mb-4">
                                            Manage your password and session settings.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={() => openUserProfile()} className="h-10 border-white/8 bg-transparent text-[#F2F0ED] hover:bg-white/5">
                                                Change Password
                                            </Button>
                                            <Button variant="destructive" onClick={() => signOut()} className="h-10">
                                                Sign Out
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="delete" className="border border-red-500/20 rounded-xl bg-[#12121A] px-2">
                                <AccordionTrigger className="hover:no-underline py-6 px-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-red-500">Delete Account</h3>
                                            <p className="text-sm text-[#8A8494] font-normal">Permanently delete your account</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-2">
                                    <div className="space-y-4 max-w-xl">
                                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                                            <p className="font-medium">Warning: This action is not reversible.</p>
                                            <p className="mt-1 text-red-400/70">Please be certain.</p>
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

                {/* Activity Tab */}
                {activeTab === "activity" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-xl font-bold text-[#F2F0ED]">Recent Activity</h2>
                            <p className="text-sm text-[#8A8494]">Your tone research and adaptations</p>
                        </div>

                        <Card className="flex flex-col items-center justify-center p-12 bg-[#12121A] border-white/8 border-dashed min-h-[400px]">
                            <div className="h-16 w-16 bg-[#E8712A]/10 rounded-2xl flex items-center justify-center mb-6 text-[#E8712A]">
                                <Activity className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#F2F0ED] mb-2">No activity yet</h3>
                            <p className="text-[#8A8494] text-center max-w-sm mb-8">
                                Start using the app to track your activity
                            </p>
                            <Link href="/tone-match">
                                <Button className="bg-[#E8712A]/10 hover:bg-[#E8712A]/20 text-[#E8712A] border border-[#E8712A]/20 font-semibold">
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
