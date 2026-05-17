"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// ── DATA ─────────────────────────────────────────────────────────────────────

const steps = [
  { n: "01", title: "Tell us your gear",        desc: "Enter your guitar model, amp, and pickup configuration." },
  { n: "02", title: "Name the reference tone",  desc: "Any song, artist, or describe the sound in plain language." },
  { n: "03", title: "Get exact dial positions", desc: "Receive precise GAIN, BASS, MIDS, TREBLE values for your specific rig." },
]

const features = [
  { title: "Smart Analysis",   desc: "Advanced algorithms search documented gear info, amp settings, and tone characteristics from rig rundowns, interviews, and gear forums." },
  { title: "Gear Adaptation",  desc: "Automatically compensates for pickup output differences, amp voicing changes, and gear mismatches to translate the tone to your setup." },
  { title: "Instant Results",  desc: "Get amp settings, pickup recommendations, and playing tips in seconds — ready to dial in and play." },
]

const pills = ["Frequency Analysis", "Harmonic Matching", "Gear Compensation"]

const ampSettings = [
  { label: "GAIN",     value: 7.5 },
  { label: "BASS",     value: 5.0 },
  { label: "MIDS",     value: 6.5 },
  { label: "TREBLE",   value: 4.0 },
  { label: "MASTER",   value: 6.0 },
  { label: "PRESENCE", value: 3.5 },
]

const testimonials = [
  { quote: "Finally nailed the Hendrix tone with my Squier Strat! The AI compensation for my gear was spot-on.", name: "John Martinez", role: "Hobbyist Guitarist" },
  { quote: "Saved me hours of tweaking knobs. Enter the song, my gear, boom — instant results.",               name: "Sarah Chen",    role: "Covers Band"       },
  { quote: "As a home studio producer, this is a game-changer for referencing classic tones.",                 name: "Mike Thompson", role: "Producer"          },
]

const badges           = ["1000+ songs", "Any gear", "Instant results", "Free to start"]
const freeFeatures     = ["3 tone matches per day", "GAIN, BASS & TREBLE only", "Basic amp profiles"]
const beginnerFeatures = [
  "20 custom tone adaptations per month",
  "15 saved tones",
  "Create gear presets",
  "Full settings: GAIN, BASS, MIDS, TREBLE, MASTER",
]
const expertFeatures = [
  "Unlimited tone adaptations",
  "Unlimited saved tones",
  "Create gear presets",
  "Full settings: GAIN, BASS, MIDS, TREBLE, MASTER",
  "Effects chain recommendations",
  "Tone tips & explanations",
  "Priority support",
]

// ── SHARED STYLES ─────────────────────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: "rgba(20,20,24,0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "48px",
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'General Sans', sans-serif",
  fontWeight: 500,
  fontSize: "0.8125rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#F5A623",
  display: "block",
  marginBottom: "14px",
}

const h2Style: React.CSSProperties = {
  fontFamily: "'Clash Display', sans-serif",
  fontWeight: 600,
  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  color: "#F2F2F7",
  margin: "0 0 32px",
}

// ── ICONS ─────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: "3px" }}>
      <path d="M2 7L5.5 10.5L12 3.5" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StepGuitarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B5DE5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18c-2.5 0-4.5-2-4.5-4.5S6.5 9 9 9c.8 0 1.6.2 2.2.6L17 4l3 3-5.4 5.8c.4.6.6 1.4.6 2.2C15.2 17.5 12.2 18 9 18z" />
      <circle cx="9" cy="13.5" r="1" fill="#9B5DE5" />
    </svg>
  )
}

function StepSearchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B5DE5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <path d="M9 9a2 2 0 0 1 2-2" />
    </svg>
  )
}

function StepSlidersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B5DE5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8"  cy="6"  r="2" fill="#0D0D10" />
      <circle cx="16" cy="12" r="2" fill="#0D0D10" />
      <circle cx="10" cy="18" r="2" fill="#0D0D10" />
    </svg>
  )
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

const stepIcons = [<StepGuitarIcon key="g" />, <StepSearchIcon key="s" />, <StepSlidersIcon key="sl" />]

const trustItems = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    title: "Secure Payments", sub: "Powered by Stripe",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    title: "7-Day Free Trial", sub: "No card required",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    title: "No Commitment", sub: "Cancel anytime",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    title: "35,000+ Users", sub: "Trusted worldwide",
  },
]

const trendingTones = [
  { song: "Purple Haze",              artist: "Jimi Hendrix"       },
  { song: "Comfortably Numb",         artist: "Pink Floyd"         },
  { song: "Sweet Child O' Mine",      artist: "Guns N' Roses"      },
  { song: "Texas Flood",              artist: "Stevie Ray Vaughan" },
  { song: "Sultans of Swing",         artist: "Dire Straits"       },
  { song: "Hotel California",         artist: "Eagles"             },
  { song: "Eruption",                 artist: "Van Halen"          },
  { song: "All Along the Watchtower", artist: "Jimi Hendrix"       },
]

const gearBrands = ["Fender", "Marshall", "Gibson", "Vox", "Mesa Boogie", "PRS", "Orange", "Boss", "Line 6", "Ibanez", "Epiphone", "Blackstar"]

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function Home() {
  const navRef          = useRef<HTMLElement>(null)
  const wrapperRef      = useRef<HTMLDivElement>(null)
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const heroFramesRef   = useRef<HTMLImageElement[]>([])
  const heroFrameIdxRef = useRef(0)
  const heroContentRef  = useRef<HTMLDivElement>(null)
  const videoRef        = useRef<HTMLVideoElement>(null)
  const s2Ref           = useRef<HTMLDivElement>(null)
  const s3Ref           = useRef<HTMLDivElement>(null)
  const s4Ref           = useRef<HTMLDivElement>(null)
  const s5Ref           = useRef<HTMLDivElement>(null)
  const s6Ref           = useRef<HTMLDivElement>(null)
  const s7Ref           = useRef<HTMLDivElement>(null)
  const s8Ref           = useRef<HTMLDivElement>(null)
  const sTrendRef       = useRef<HTMLDivElement>(null)
  const stepRefs        = useRef<(HTMLDivElement | null)[]>([])
  const ampCardRefs     = useRef<(HTMLDivElement | null)[]>([])
  const ampValueRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const TOTAL = 241
    const canvas = canvasRef.current

    function drawCoverFrame(img: HTMLImageElement) {
      if (!canvas) return
      const ctx2d = canvas.getContext("2d")
      if (!ctx2d) return
      const cw = canvas.width, ch = canvas.height
      const iw = img.naturalWidth || 1, ih = img.naturalHeight || 1
      const ca = cw / ch, ia = iw / ih
      let sx = 0, sy = 0, sw = iw, sh = ih
      if (ia > ca) { sw = ih * ca; sx = (iw - sw) / 2 }
      else          { sh = iw / ca; sy = (ih - sh) / 2 }
      ctx2d.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    }

    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const img = heroFramesRef.current[heroFrameIdxRef.current]
      if (img?.complete) drawCoverFrame(img)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const handleNavScroll = () => {
      const nav = navRef.current
      if (!nav) return
      nav.style.padding = window.scrollY > 40
        ? "12px clamp(24px, 5vw, 80px)"
        : "20px clamp(24px, 5vw, 80px)"
    }
    window.addEventListener("scroll", handleNavScroll)

    for (let i = 0; i < TOTAL; i++) {
      const img = new Image()
      img.src = `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`
      heroFramesRef.current[i] = img
    }
    const firstFrame = heroFramesRef.current[0]
    if (firstFrame.complete) drawCoverFrame(firstFrame)
    else firstFrame.onload = () => drawCoverFrame(firstFrame)

    const ctx = gsap.context(() => {

      // Hero entrance
      gsap.fromTo(heroContentRef.current,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 1.3, ease: "power4.out", delay: 0.2 }
      )

      // Master scrub — drives frame index + video sync
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate(self) {
          const idx = Math.min(Math.floor(self.progress * 240), 240)
          heroFrameIdxRef.current = idx
          const img = heroFramesRef.current[idx]
          if (img?.complete) drawCoverFrame(img)
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = String(Math.max(0, 1 - self.progress * 6))
          }
          const vid = videoRef.current
          if (vid && vid.duration) {
            const s = 0.57, e = 0.67
            const p = Math.max(0, Math.min(1, (self.progress - s) / (e - s)))
            vid.currentTime = p * vid.duration
          }
        },
      })

      // ── S1.5 TRENDING TONES ──────────────────────────────────
      gsap.fromTo(sTrendRef.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "8% top", end: "12% top", scrub: true },
      })
      gsap.to(sTrendRef.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "22% top", end: "26% top", scrub: true },
      })
      gsap.fromTo(
        sTrendRef.current?.querySelectorAll(".tone-card") ?? [],
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: wrapperRef.current, start: "10% top", once: true } }
      )

      // ── S2 HOW IT WORKS ──────────────────────────────────────
      gsap.fromTo(s2Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "27% top", end: "33% top", scrub: true },
      })
      gsap.to(s2Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "40% top", end: "43% top", scrub: true },
      })
      gsap.fromTo(
        stepRefs.current.filter(Boolean) as HTMLDivElement[],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: wrapperRef.current, start: "29% top", once: true } }
      )

      // ── S3 FEATURES ──────────────────────────────────────────
      gsap.fromTo(s3Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "43% top", end: "48% top", scrub: true },
      })
      gsap.to(s3Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "54% top", end: "57% top", scrub: true },
      })
      gsap.fromTo(
        s3Ref.current?.querySelectorAll(".js-feat") ?? [],
        { opacity: 0, x: -32 },
        { opacity: 1, x: 0, stagger: 0.14, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "44% top", once: true } }
      )

      // ── S4 AI ENGINE ─────────────────────────────────────────
      gsap.fromTo(s4Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "57% top", end: "62% top", scrub: true },
      })
      gsap.to(s4Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "67% top", end: "70% top", scrub: true },
      })
      gsap.fromTo(
        s4Ref.current?.querySelectorAll(".js-pill") ?? [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "58% top", once: true } }
      )

      // ── S5 AMP SETTINGS ──────────────────────────────────────
      gsap.fromTo(s5Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "70% top", end: "74% top", scrub: true },
      })
      gsap.to(s5Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "79% top", end: "81% top", scrub: true },
      })
      const ampCards = ampCardRefs.current.filter(Boolean) as HTMLDivElement[]
      if (ampCards.length) {
        gsap.fromTo(ampCards,
          { opacity: 0, y: 40, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)", stagger: 0.09,
            scrollTrigger: { trigger: wrapperRef.current, start: "72% top", once: true } }
        )
      }
      ScrollTrigger.create({
        trigger: wrapperRef.current, start: "72% top", once: true,
        onEnter() {
          ampSettings.forEach(({ value }, i) => {
            const el = ampValueRefs.current[i]
            if (!el) return
            const proxy = { val: 0 }
            gsap.to(proxy, {
              val: value, duration: 1.5, ease: "power2.out", delay: i * 0.1,
              onUpdate() { el.textContent = proxy.val.toFixed(1) },
            })
          })
        },
      })

      // ── S6 CTA ───────────────────────────────────────────────
      gsap.fromTo(s6Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "81% top", end: "84% top", scrub: true },
      })
      gsap.to(s6Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "86% top", end: "88% top", scrub: true },
      })

      // ── S7 PRICING ───────────────────────────────────────────
      gsap.fromTo(s7Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "88% top", end: "91% top", scrub: true },
      })
      gsap.to(s7Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "92% top", end: "94% top", scrub: true },
      })
      gsap.fromTo(
        s7Ref.current?.querySelectorAll(".js-pricing-card") ?? [],
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: wrapperRef.current, start: "89% top", once: true } }
      )

      // ── S8 TESTIMONIALS ──────────────────────────────────────
      gsap.fromTo(s8Ref.current, { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "91% top", end: "93% top", scrub: true },
      })
      gsap.to(s8Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "94% top", end: "96% top", scrub: true },
      })
      gsap.fromTo(
        s8Ref.current?.querySelectorAll(".js-testimonial") ?? [],
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, stagger: 0.13, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "92% top", once: true } }
      )

    })

    return () => {
      ctx.revert()
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("scroll", handleNavScroll)
    }
  }, [])

  return (
    <main style={{ background: "#08080A", color: "#F2F2F7" }}>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@600;700&family=Inter+Tight:wght@400;600&display=swap');

        :root {
          --tn-void:           #08080A;
          --tn-primary:        #0D0D10;
          --tn-elevated:       #141418;
          --tn-surface:        #1A1A20;
          --tn-accent:         #F5A623;
          --tn-accent-bright:  #FFD700;
          --tn-glow:           rgba(245,166,35,0.15);
          --tn-text-primary:   #F2F2F7;
          --tn-text-secondary: #8E8E93;
          --tn-gradient:       linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #E8912D 100%);
          --font-display:      'Clash Display', sans-serif;
          --font-body:         'General Sans', sans-serif;
          --font-mono:         'JetBrains Mono', monospace;
        }

        * { box-sizing: border-box; }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #E8912D 100%);
          color: #08080A;
          font-family: 'General Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9375rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(245,166,35,0.3);
        }

        .ghost-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: transparent;
          color: #F2F2F7;
          font-family: 'General Sans', sans-serif;
          font-weight: 500;
          font-size: 0.9375rem;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          cursor: pointer;
          text-decoration: none;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: border-color 0.2s;
        }
        .ghost-btn:hover { border-color: rgba(255,255,255,0.18); }

        .tn-nav-link {
          font-family: 'General Sans', sans-serif;
          font-size: 0.9375rem;
          color: #F2F2F7;
          text-decoration: none;
          opacity: 0.72;
          transition: opacity 0.2s;
        }
        .tn-nav-link:hover { opacity: 1; }

        .step-card {
          background: rgba(18,18,26,0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(155,93,229,0.12);
          border-radius: 16px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s;
          display: flex;
          flex-direction: column;
        }
        .step-card:hover {
          border-color: rgba(155,93,229,0.3);
          transform: translateY(-4px);
        }
        .step-num {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 3rem;
          background: linear-gradient(135deg, #E8712A 0%, #9B5DE5 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
          line-height: 1;
        }

        @keyframes eq-bar1 { 0%,100%{height:8px}50%{height:20px} }
        @keyframes eq-bar2 { 0%,100%{height:14px}50%{height:6px} }
        @keyframes eq-bar3 { 0%,100%{height:10px}50%{height:22px} }

        .eq-bar { width: 3px; background: #E8712A; border-radius: 2px; display: inline-block; }
        .eq-bar:nth-child(1) { animation: eq-bar1 0.8s ease-in-out infinite; }
        .eq-bar:nth-child(2) { animation: eq-bar2 1.1s ease-in-out infinite; }
        .eq-bar:nth-child(3) { animation: eq-bar3 0.9s ease-in-out infinite; }

        @keyframes marquee-scroll { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
        .marquee-track { animation: marquee-scroll 25s linear infinite; display: flex; align-items: center; }

        .tone-card {
          background: rgba(20,20,28,0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.25s, transform 0.25s;
        }
        .tone-card:hover {
          border-color: rgba(232,113,42,0.25);
          transform: translateY(-3px);
        }

        @media (max-width: 768px) {
          .tn-nav-links   { display: none !important; }
          .tn-step-grid   { grid-template-columns: 1fr !important; }
          .tn-amp-grid    { grid-template-columns: repeat(2, 1fr) !important; }
          .tn-price-grid  { grid-template-columns: 1fr !important; }
          .tn-foot-grid   { grid-template-columns: 1fr !important; gap: 40px !important; }
          .tn-trust-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .tn-tone-grid   { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px clamp(24px, 5vw, 80px)",
        background: "rgba(8,8,10,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "padding 0.3s ease",
      }}>
        <Link href="/" style={{
          fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
          fontSize: "1.25rem", color: "#F5A623",
          textDecoration: "none", letterSpacing: "-0.02em",
        }}>
          Tonelify
        </Link>
        <div className="tn-nav-links" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link href="/tone-match" className="tn-nav-link">Match Tones</Link>
          <Link href="/collection" className="tn-nav-link">Collection</Link>
          <Link href="/settings"   className="tn-nav-link">Settings</Link>
          <Link href="/plans"      className="tn-nav-link">Plans</Link>
        </div>
        <Link href="/sign-in" className="ghost-btn" style={{ padding: "10px 24px", fontSize: "0.875rem" }}>Sign In</Link>
      </nav>

      {/* Grain overlay */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "200px 200px",
      }} />

      {/* ── 1100VH SCROLL WRAPPER ── */}
      <div ref={wrapperRef} style={{ height: "1400vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>

          {/* Canvas */}
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#08080A" }} />

          {/* Hidden video — AI ENGINE scroll-sync */}
          <video ref={videoRef} src="/video.mp4" muted playsInline preload="auto" style={{ display: "none" }} />

          {/* Left vignette */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(to right, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.3) 40%, transparent 60%)",
          }} />

          {/* ── S1 HERO ── */}
          <div ref={heroContentRef} style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
            paddingLeft: "clamp(24px, 7vw, 128px)", paddingRight: "24px",
            maxWidth: "min(700px, 58vw)",
          }}>
            <span style={{ ...sectionLabel, pointerEvents: "auto" }}>Guitar Tone Matching</span>
            <h1 style={{
              fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
              fontSize: "clamp(3rem, 7vw, 6.5rem)",
              lineHeight: 0.95, letterSpacing: "-0.03em",
              color: "#F2F2F7", margin: "0 0 24px",
            }}>
              Stop Guessing.<br />
              <em style={{ fontStyle: "normal", color: "#F5A623" }}>Start</em>{" "}
              <em style={{ fontStyle: "normal", color: "#F5A623" }}>Playing.</em>
            </h1>
            <p style={{
              fontFamily: "'General Sans', sans-serif", fontSize: "1.0625rem",
              lineHeight: 1.65, color: "#8E8E93",
              maxWidth: "380px", margin: "0 0 32px",
            }}>
              Match any legendary tone to your exact gear. Precise amp settings in seconds.
            </p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", pointerEvents: "auto" }}>
              <Link href="/tone-match" className="cta-btn">Start Matching Tones</Link>
              <Link href="/plans"      className="ghost-btn">See plans</Link>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "28px", pointerEvents: "auto" }}>
              {badges.map((label) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <CheckIcon />
                  <span style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.8125rem", color: "#8E8E93" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── S1.5 TRENDING TONES — solid breaker ── */}
          <div ref={sTrendRef} style={{
            position: "absolute", inset: 0, zIndex: 5, opacity: 0, pointerEvents: "none",
            background: "linear-gradient(180deg, #0F0F18 0%, #1A0F2E 50%, #0F0F18 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 clamp(24px, 7vw, 96px)",
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(circle at 50% 30%, rgba(155,93,229,0.07) 0%, transparent 60%)",
            }} />
            <div style={{ maxWidth: "1060px", width: "100%", position: "relative", pointerEvents: "auto" }}>
              <div style={{ textAlign: "center", marginBottom: "56px" }}>
                <span style={{ ...sectionLabel, display: "block", textAlign: "center" }}>Trending This Week</span>
                <h2 style={{ ...h2Style, margin: 0 }}>Popular tones right now</h2>
              </div>
              <div className="tn-tone-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px",
              }}>
                {trendingTones.map((tone) => (
                  <div key={tone.song} className="tone-card">
                    <div style={{
                      width: "60px", height: "60px", flexShrink: 0,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #E8712A 0%, #9B5DE5 100%)",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Inter Tight', sans-serif", fontWeight: 600,
                        fontSize: "0.9rem", color: "#F2F2F7",
                        marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{tone.song}</div>
                      <div style={{
                        fontFamily: "'Inter Tight', sans-serif", fontWeight: 400,
                        fontSize: "0.8rem", color: "#8A8494",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{tone.artist}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "22px", flexShrink: 0 }}>
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── S2 HOW IT WORKS — solid breaker ── */}
          <div ref={s2Ref} style={{
            position: "absolute", inset: 0, zIndex: 20, opacity: 0, pointerEvents: "none",
            background: "linear-gradient(180deg, #0F0F18 0%, #1A0F2E 50%, #0F0F18 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "120px clamp(24px, 7vw, 96px)",
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(circle at 50% 30%, rgba(155,93,229,0.08) 0%, transparent 60%)",
            }} />
            <div style={{ maxWidth: "940px", width: "100%", pointerEvents: "auto", position: "relative" }}>
              <div style={{ textAlign: "center", marginBottom: "56px" }}>
                <span style={{ ...sectionLabel, display: "block", textAlign: "center" }}>How It Works</span>
                <h2 style={{ ...h2Style, margin: 0 }}>Three steps to your perfect tone</h2>
              </div>
              <div className="tn-step-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                {steps.map((step, i) => (
                  <div key={step.n} ref={(el) => { stepRefs.current[i] = el }} className="step-card">
                    <div aria-hidden="true" style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                      background: "linear-gradient(90deg, #E8712A 0%, #9B5DE5 100%)",
                    }} />
                    <div style={{ marginBottom: "12px" }}>{stepIcons[i]}</div>
                    <div className="step-num">{step.n}</div>
                    <h3 style={{
                      fontFamily: "'Clash Display', sans-serif", fontWeight: 600,
                      fontSize: "1.125rem", color: "#F2F2F7", margin: "0 0 12px",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontFamily: "'General Sans', sans-serif", fontSize: "0.9375rem",
                      lineHeight: 1.65, color: "#8E8E93", margin: 0,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── S3 FEATURES ── */}
          <div ref={s3Ref} style={{
            position: "absolute", inset: 0, zIndex: 2, opacity: 0, pointerEvents: "none",
            display: "flex", alignItems: "center",
            paddingLeft: "clamp(24px, 7vw, 96px)", paddingRight: "24px",
          }}>
            <div style={{ ...glass, maxWidth: "560px", width: "100%", pointerEvents: "auto" }}>
              <span style={sectionLabel}>Features</span>
              <h2 style={h2Style}>Everything you need to match legendary guitar tones</h2>
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="js-feat"
                  style={{
                    paddingBottom: i < features.length - 1 ? "24px" : "0",
                    marginBottom:  i < features.length - 1 ? "24px" : "0",
                    borderBottom:  i < features.length - 1 ? "1px solid rgba(245,166,35,0.08)" : "none",
                  }}
                >
                  <h3 style={{
                    fontFamily: "'Clash Display', sans-serif", fontWeight: 600,
                    fontSize: "1rem", color: "#F2F2F7", margin: "0 0 8px",
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontFamily: "'General Sans', sans-serif", fontSize: "0.9rem",
                    lineHeight: 1.65, color: "#8E8E93", margin: 0,
                  }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── S4 AI ENGINE ── */}
          <div ref={s4Ref} style={{
            position: "absolute", inset: 0, zIndex: 2, opacity: 0, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            paddingRight: "clamp(24px, 7vw, 96px)", paddingLeft: "24px",
          }}>
            <div style={{ ...glass, maxWidth: "520px", width: "100%", pointerEvents: "auto" }}>
              <span style={sectionLabel}>The Engine</span>
              <h2 style={{
                fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                lineHeight: 0.95, letterSpacing: "-0.03em",
                color: "#F2F2F7", margin: "0 0 20px",
              }}>
                AI analyzes every<br />detail of your tone
              </h2>
              <p style={{
                fontFamily: "'General Sans', sans-serif", fontSize: "1.0625rem",
                lineHeight: 1.65, color: "#8E8E93", margin: "0 0 32px",
              }}>
                Frequency response, harmonic content, pickup characteristics — matched against thousands of real amp profiles.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {pills.map((pill) => (
                  <span key={pill} className="js-pill" style={{
                    fontFamily: "'General Sans', sans-serif", fontWeight: 500,
                    fontSize: "0.8125rem", color: "#F5A623",
                    border: "1px solid rgba(245,166,35,0.2)",
                    borderRadius: "999px", padding: "8px 18px",
                  }}>
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── S5 AMP SETTINGS ── */}
          <div ref={s5Ref} style={{
            position: "absolute", inset: 0, zIndex: 2, opacity: 0, pointerEvents: "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
            paddingLeft: "clamp(24px, 7vw, 96px)", paddingRight: "clamp(24px, 7vw, 96px)",
          }}>
            <span style={{ ...sectionLabel, pointerEvents: "auto" }}>Amp Settings</span>
            <h2 style={{
              fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.04, letterSpacing: "-0.02em",
              color: "#F2F2F7", margin: "0 0 40px", pointerEvents: "auto",
            }}>
              Exact numbers.<br />No guesswork.
            </h2>
            <div className="tn-amp-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px",
              maxWidth: "860px", pointerEvents: "auto",
            }}>
              {ampSettings.map(({ label: lbl, value }, i) => (
                <div
                  key={lbl}
                  ref={(el) => { ampCardRefs.current[i] = el }}
                  style={{
                    background: "rgba(20,20,24,0.82)",
                    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px", padding: "28px 24px",
                    opacity: 0,
                    transition: "border-color 0.3s, box-shadow 0.3s, transform 0.25s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = "rgba(245,166,35,0.3)"
                    el.style.boxShadow   = "inset 0 1px 0 rgba(245,166,35,0.1), 0 0 48px rgba(245,166,35,0.1)"
                    el.style.transform   = "translateY(-4px)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = "rgba(255,255,255,0.08)"
                    el.style.boxShadow   = ""
                    el.style.transform   = "translateY(0)"
                  }}
                >
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    color: "#FFD700", marginBottom: "6px", lineHeight: 1,
                  }}>
                    <span ref={(el) => { ampValueRefs.current[i] = el }}>{value.toFixed(1)}</span>
                  </div>
                  <div style={{
                    fontFamily: "'General Sans', sans-serif", fontWeight: 500,
                    fontSize: "0.6875rem", textTransform: "uppercase",
                    letterSpacing: "0.12em", color: "#8E8E93",
                  }}>
                    {lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── S6 CTA ── */}
          <div ref={s6Ref} style={{
            position: "absolute", inset: 0, zIndex: 2, opacity: 0, pointerEvents: "none",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", textAlign: "center",
            padding: "0 clamp(24px, 7vw, 128px)",
          }}>
            <span style={{ ...sectionLabel, textAlign: "center", pointerEvents: "auto" }}>Ready?</span>
            <h2 style={{
              fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
              fontSize: "clamp(3rem, 7vw, 6rem)",
              lineHeight: 0.91, letterSpacing: "-0.03em",
              color: "#F2F2F7", margin: "0 0 44px", pointerEvents: "auto",
            }}>
              Your tone<br />is waiting.
            </h2>
            <div style={{
              display: "flex", alignItems: "center", gap: "24px",
              flexWrap: "wrap", justifyContent: "center", pointerEvents: "auto",
            }}>
              <Link href="/sign-up" className="cta-btn">Try It Free</Link>
              <span style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.875rem", color: "#8E8E93" }}>
                No credit card required
              </span>
            </div>
          </div>

          {/* ── S7 PRICING — solid breaker ── */}
          <div ref={s7Ref} style={{
            position: "absolute", inset: 0, zIndex: 30, opacity: 0, pointerEvents: "none",
            isolation: "isolate",
            background: "linear-gradient(180deg, #0F0F18 0%, #1A0F2E 50%, #0F0F18 100%)",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
            padding: "0 clamp(24px, 5vw, 80px)", overflowY: "auto",
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(circle at 50% 30%, rgba(155,93,229,0.08) 0%, transparent 60%)",
            }} />
            <div style={{ width: "100%", maxWidth: "1060px", pointerEvents: "auto", position: "relative" }}>
              <div style={{ marginBottom: "32px", textAlign: "center" }}>
                <span style={{ ...sectionLabel, display: "block", textAlign: "center" }}>Pricing</span>
                <h2 style={{ ...h2Style, margin: 0 }}>Simple, honest pricing</h2>
              </div>

              {/* Monthly / Annual toggle */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginBottom: "40px" }}>
                <span style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.9rem", color: billingCycle === "monthly" ? "#F2F2F7" : "#8E8E93" }}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(c => c === "monthly" ? "annual" : "monthly")}
                  aria-label="Toggle billing cycle"
                  style={{
                    position: "relative", width: "48px", height: "26px", borderRadius: "999px", border: "none",
                    background: billingCycle === "annual" ? "#E8712A" : "rgba(255,255,255,0.12)",
                    cursor: "pointer", transition: "background 0.25s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: "3px",
                    left: billingCycle === "annual" ? "25px" : "3px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#FFFFFF",
                    transition: "left 0.25s",
                    display: "block",
                  }} />
                </button>
                <span style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.9rem", color: billingCycle === "annual" ? "#F2F2F7" : "#8E8E93" }}>Annual</span>
                {billingCycle === "annual" && (
                  <span style={{
                    fontFamily: "'General Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem",
                    background: "#E8712A", color: "#FFFFFF", borderRadius: "999px", padding: "3px 10px",
                  }}>Save 20%</span>
                )}
              </div>

              <div className="tn-price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", alignItems: "start" }}>

                {/* FREE */}
                <div className="js-pricing-card" style={{
                  background: "#12121A",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "36px",
                }}>
                  <div style={{
                    fontFamily: "'General Sans', sans-serif", fontWeight: 500,
                    fontSize: "0.75rem", textTransform: "uppercase",
                    letterSpacing: "0.1em", color: "#8E8E93", marginBottom: "16px",
                  }}>Free</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    fontSize: "2.25rem", color: "#F2F2F7", lineHeight: 1, marginBottom: "6px",
                  }}>Free</div>
                  <div style={{
                    fontFamily: "'General Sans', sans-serif", color: "#8E8E93",
                    fontSize: "0.875rem", marginBottom: "28px",
                  }}>No credit card</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginBottom: "28px" }}>
                    {freeFeatures.map((f) => (
                      <div key={f} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                        <CheckIcon />
                        <span style={{ fontFamily: "'General Sans', sans-serif", color: "#8E8E93", fontSize: "0.9rem" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/plans" className="ghost-btn" style={{ display: "block", textAlign: "center" }}>Get Started</Link>
                </div>

                {/* BEGINNER */}
                <div className="js-pricing-card" style={{
                  background: "#12121A",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "36px",
                }}>
                  <div style={{
                    fontFamily: "'General Sans', sans-serif", fontWeight: 500,
                    fontSize: "0.75rem", textTransform: "uppercase",
                    letterSpacing: "0.1em", color: "#8E8E93", marginBottom: "16px",
                  }}>Beginner</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                      fontSize: "2.25rem", color: "#F2F2F7", lineHeight: 1,
                    }}>{billingCycle === "monthly" ? "$5.99" : "$4.99"}</span>
                    <span style={{ fontFamily: "'General Sans', sans-serif", color: "#8E8E93", fontSize: "0.9375rem" }}>/month</span>
                  </div>
                  <div style={{
                    fontFamily: "'General Sans', sans-serif", color: "#8E8E93",
                    fontSize: "0.875rem", marginBottom: "28px",
                  }}>7-day free trial</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginBottom: "28px" }}>
                    {beginnerFeatures.map((f) => (
                      <div key={f} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                        <CheckIcon />
                        <span style={{ fontFamily: "'General Sans', sans-serif", color: "#8E8E93", fontSize: "0.9rem" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/plans" className="ghost-btn" style={{ display: "block", textAlign: "center" }}>Start Free Trial</Link>
                </div>

                {/* EXPERT */}
                <div className="js-pricing-card" style={{
                  background: "#12121A",
                  border: "1px solid #E8712A",
                  boxShadow: "0 0 48px rgba(232,113,42,0.15), 0 0 80px rgba(155,93,229,0.08)",
                  borderRadius: "16px", padding: "36px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{
                      fontFamily: "'General Sans', sans-serif", fontWeight: 500,
                      fontSize: "0.75rem", textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "#E8712A",
                    }}>Expert</div>
                    <span style={{
                      fontFamily: "'General Sans', sans-serif", fontWeight: 600,
                      fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.07em",
                      background: "#E8712A",
                      color: "#08080C", borderRadius: "999px", padding: "4px 10px",
                    }}>Most Popular</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                      fontSize: "2.5rem", color: "#E8712A", lineHeight: 1,
                    }}>{billingCycle === "monthly" ? "$9.99" : "$7.99"}</span>
                    <span style={{ fontFamily: "'General Sans', sans-serif", color: "#8E8E93", fontSize: "0.9375rem" }}>/month</span>
                  </div>
                  <div style={{
                    fontFamily: "'General Sans', sans-serif", color: "#8E8E93",
                    fontSize: "0.875rem", marginBottom: "28px",
                  }}>7-day free trial</div>
                  <div style={{ borderTop: "1px solid rgba(232,113,42,0.15)", paddingTop: "24px", marginBottom: "28px" }}>
                    {expertFeatures.map((f) => (
                      <div key={f} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                        <CheckIcon />
                        <span style={{ fontFamily: "'General Sans', sans-serif", color: "#8E8E93", fontSize: "0.9rem" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/plans" style={{
                    display: "block", textAlign: "center",
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #E8712A 0%, #9B5DE5 100%)",
                    color: "#08080C",
                    fontFamily: "'General Sans', sans-serif", fontWeight: 600, fontSize: "0.9375rem",
                    borderRadius: "12px", textDecoration: "none",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}>Start Free Trial</Link>
                </div>

              </div>
            </div>
          </div>

          {/* ── S8 TESTIMONIALS ── */}
          <div ref={s8Ref} style={{
            position: "absolute", inset: 0, zIndex: 2, opacity: 0, pointerEvents: "none",
            display: "flex", alignItems: "center",
            paddingLeft: "clamp(24px, 7vw, 96px)", paddingRight: "24px",
          }}>
            <div style={{ ...glass, maxWidth: "600px", width: "100%", pointerEvents: "auto" }}>
              <span style={sectionLabel}>What Guitarists Say</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {testimonials.map((t) => (
                  <div key={t.name} className="js-testimonial" style={{ borderLeft: "3px solid #F5A623", paddingLeft: "20px" }}>
                    <p style={{
                      fontFamily: "'General Sans', sans-serif", fontSize: "0.9375rem",
                      lineHeight: 1.65, color: "#8E8E93", margin: "0 0 10px", fontStyle: "italic",
                    }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg, #E8712A 0%, #9B5DE5 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Inter Tight', sans-serif", fontWeight: 600,
                        fontSize: "14px", color: "#FFFFFF",
                      }}>
                        {getInitials(t.name)}
                      </div>
                      <div>
                        <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 500, fontSize: "0.8125rem", color: "#F2F2F7" }}>
                          {t.name}
                        </span>
                        <span style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.8125rem", color: "#8E8E93", marginLeft: "8px" }}>
                          — {t.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── GEAR COMPATIBILITY — normal flow ── */}
      <section style={{
        background: "rgba(18,18,26,0.5)", padding: "40px 0",
        position: "relative", zIndex: 10, overflow: "hidden",
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ ...sectionLabel, display: "block", textAlign: "center" }}>Works With Any Setup</span>
        </div>
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div className="marquee-track" style={{ width: "max-content", gap: "0" }}>
            {[...gearBrands, ...gearBrands].map((brand, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                  fontSize: "1.2rem", color: "rgba(255,255,255,0.25)",
                  padding: "0 28px", whiteSpace: "nowrap",
                }}>{brand}</span>
                <span style={{ color: "#E8712A", fontSize: "1rem", lineHeight: 1 }}>•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR — normal flow ── */}
      <section style={{
        background: "#0D0D10", padding: "72px clamp(24px, 7vw, 96px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 10,
      }}>
        <div className="tn-trust-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "32px", maxWidth: "900px", margin: "0 auto",
        }}>
          {trustItems.map(({ icon, title, sub }) => (
            <div key={title} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px" }}>
              {icon}
              <div>
                <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#F2F2F7", marginBottom: "4px" }}>
                  {title}
                </div>
                <div style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.8125rem", color: "#8E8E93" }}>
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER — normal flow ── */}
      <footer style={{ background: "#08080A", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 0 40px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(24px, 5vw, 80px)" }}>
          <div className="tn-foot-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "56px", marginBottom: "64px" }}>

            <div>
              <Link href="/" style={{
                fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
                fontSize: "1.5rem", color: "#F5A623",
                textDecoration: "none", display: "block", marginBottom: "14px", letterSpacing: "-0.02em",
              }}>Tonelify</Link>
              <p style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.9375rem", lineHeight: 1.7, color: "#8E8E93", maxWidth: "280px", margin: "0 0 20px" }}>
                Gear-matched guitar tone settings for musicians worldwide.
              </p>
              <p style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.8125rem", color: "#8E8E93", opacity: 0.5, margin: 0 }}>
                © 2026 Tonelify. All rights reserved.
              </p>
            </div>

            <div>
              <h4 style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8E8E93", margin: "0 0 20px" }}>
                Quick Links
              </h4>
              {([["Home", "/"], ["Match Tones", "/tone-match"], ["Collection", "/collection"], ["Plans", "/plans"], ["Dashboard", "/dashboard"], ["Settings", "/settings"]] as const).map(([text, href]) => (
                <div key={href} style={{ marginBottom: "12px" }}>
                  <Link href={href} style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                    {text}
                  </Link>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8E8E93", margin: "0 0 20px" }}>
                Support
              </h4>
              <div style={{ marginBottom: "12px" }}>
                <a href="mailto:contact@tonelify.com" style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                  Contact Us
                </a>
              </div>
            </div>

            <div>
              <h4 style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8E8E93", margin: "0 0 20px" }}>
                Legal
              </h4>
              {([["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] as const).map(([text, href]) => (
                <div key={href} style={{ marginBottom: "12px" }}>
                  <Link href={href} style={{ fontFamily: "'General Sans', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                    {text}
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </div>
      </footer>

    </main>
  )
}
