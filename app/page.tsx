"use client" // Needed for framer-motion in Hero

import { Hero } from "@/components/Hero"
import { HowItWorks } from "@/components/HowItWorks"
import { Features } from "@/components/Features"
import { Pricing } from "@/components/Pricing"
import { CTA } from "@/components/CTA"
import { Reviews } from "@/components/Reviews"
import { TrustBadges } from "@/components/TrustBadges"
import { Testimonials } from "@/components/Testimonials"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navbar Placeholder */}
      {/* Navbar handled by RootLayout */}

      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <Reviews />
      <TrustBadges />

      <footer className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="container px-4 md:px-6 mx-auto grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <span className="text-2xl">🎸</span> Tonelify
            </Link>
            <p className="text-sm text-slate-500 max-w-xs">
              Gear-matched guitar tone settings for musicians worldwide.
            </p>
            <div className="text-sm text-slate-400">
              © 2026 Tonelify. All rights reserved.
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
              <li><Link href="/tone-match" className="hover:text-blue-600">App</Link></li>
              <li><Link href="/plans" className="hover:text-blue-600">Plans</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="mailto:contact@tonelify.com" className="hover:text-blue-600">Contact Us</a></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <p className="text-xs text-slate-500">
              All sales final. No refunds.
            </p>
          </div>
        </div>
      </footer>
    </main >
  )
}
