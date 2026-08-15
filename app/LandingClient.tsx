"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SignOutButton, useUser } from "@clerk/nextjs"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { LandingTestimonials } from "@/components/LandingTestimonials"
import { ReviewStrip } from "@/components/ReviewStrip"
import { SocialProofBar } from "@/components/SocialProofBar"
import { Reviews } from "@/components/Reviews"
import { Pricing } from "@/components/Pricing"
import { ToneProof, TONE_COUNT } from "@/components/ToneProof"
import { AmpKnob } from "@/components/AmpKnob"
import { TONE_LIBRARY } from "@/lib/tone-library"
import type { StoredReview } from "@/lib/reviews"
import { PRICING, PLAN_NAMES, TRIAL_DAYS } from "@/lib/pricing"

// ── DATA ─────────────────────────────────────────────────────────────────────

const steps = [
  { n: "01", title: "Tell us your gear",        desc: "Enter your guitar model, amp, and pickup configuration." },
  { n: "02", title: "Name the reference tone",  desc: "Any song, artist, or describe the sound in plain language." },
  { n: "03", title: "Get exact dial positions", desc: "Receive precise GAIN, BASS, MIDS, TREBLE values for your specific rig." },
]

const features = [
  { title: "Smart Analysis",   desc: "Advanced algorithms search documented gear info, amp settings, and tone characteristics from rig rundowns, interviews, and gear forums." },
  { title: "Gear Adaptation",  desc: "Automatically compensates for pickup output differences, amp voicing changes, and gear mismatches to translate the tone to your setup." },
  { title: "Instant Results",  desc: "Get amp settings, pickup recommendations, and playing tips in seconds, ready to dial in and play." },
]

const pills = ["Frequency Analysis", "Harmonic Matching", "Gear Compensation"]

// Read off the library rather than hand-listed, so a renamed or removed tone
// cannot leave a 404 sitting in the footer.
const FOOTER_TONES = TONE_LIBRARY.slice(0, 12).map(
  (t) => [`${t.title} tone`, `/explore/${t.id}`] as const
)

const ampSettings = [
  { label: "GAIN",     value: 7.5 },
  { label: "BASS",     value: 5.0 },
  { label: "MIDS",     value: 6.5 },
  { label: "TREBLE",   value: 4.0 },
  { label: "MASTER",   value: 6.0 },
  { label: "PRESENCE", value: 3.5 },
]


const badges           = ["Any song", "Any gear", "Instant results", "Free to start"]

// ── SHARED STYLES ─────────────────────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: "rgba(15,13,12,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "48px",
}

// Scrubbed section clips sit in a half-width column that carries its own black
// field — layered straight onto the frame canvas they read as a double
// exposure. The mask feathers the field and the clip together.
const sectionMediaColumn: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "54%",
  zIndex: 1,
  opacity: 0,
  pointerEvents: "none",
  background: "#08080A",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 22%, #000 74%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)",
  maskImage: "linear-gradient(to right, transparent 0%, #000 22%, #000 74%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
}

const sectionMediaVideo: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
}

// Scroll windows the two scrubbed clips play across, in ScrollTrigger progress.
// Note this is NOT the same scale as the "43% top" syntax the section fades
// use: those measure into a 1200vh trigger, progress divides by 1100vh, so a
// section's "43%" lands at progress 0.43 * 12/11. Each clip starts with its
// section's fade-in and finishes just after it is fully lit, so the board is
// full and the guitar is apart while the copy is being read.
const PEDAL_SCRUB: [number, number] = [0.470, 0.575]
const ENGINE_SCRUB: [number, number] = [0.622, 0.730]
// Ends just short of 1 so the loop is stopped once the sticky frame lets go —
// past that point onUpdate no longer fires and the clip would run forever.
const CTA_VISIBLE: [number, number] = [0.860, 0.995]

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Satoshi', sans-serif",
  fontWeight: 500,
  fontSize: "0.8125rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#F5A623",
  display: "block",
  marginBottom: "14px",
}

const h2Style: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontWeight: 600,
  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
  lineHeight: 1.1,
  letterSpacing: "-0.01em",
  color: "#F2F2F7",
  margin: "0 0 32px",
}

const gradientDivider: React.CSSProperties = {
  height: "1px",
  width: "60%",
  margin: "40px auto 0",
  background: "linear-gradient(90deg, transparent, #E8712A, #D14B32, transparent)",
  opacity: 0.3,
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
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18c-2.5 0-4.5-2-4.5-4.5S6.5 9 9 9c.8 0 1.6.2 2.2.6L17 4l3 3-5.4 5.8c.4.6.6 1.4.6 2.2C15.2 17.5 12.2 18 9 18z" />
      <circle cx="9" cy="13.5" r="1" fill="#F5A623" />
    </svg>
  )
}

function StepSearchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <path d="M9 9a2 2 0 0 1 2-2" />
    </svg>
  )
}

function StepSlidersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8"  cy="6"  r="2" fill="#0D0D10" />
      <circle cx="16" cy="12" r="2" fill="#0D0D10" />
      <circle cx="10" cy="18" r="2" fill="#0D0D10" />
    </svg>
  )
}

const stepIcons = [<StepGuitarIcon key="g" />, <StepSearchIcon key="s" />, <StepSlidersIcon key="sl" />]

const trustItems = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    title: "Secure Payments", sub: "Powered by Stripe",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    title: `${TRIAL_DAYS}-Day Free Trial`, sub: "Cancel before it ends",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    title: "No Commitment", sub: "Cancel anytime",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8712A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    title: "1,000+ Users", sub: "Trusted worldwide",
  },
]

const trendingTones = [
  { song: "Purple Haze",              artist: "Jimi Hendrix",       img: "/albums/purple-haze.jpg",      spotifyId: "0wJoRiX5K5BxlqZTolB2LD", floatDuration: 3.0, floatDelay: 0.0 },
  { song: "Comfortably Numb",         artist: "Pink Floyd",         img: "/albums/comfortably-numb.jpg", spotifyId: "5Dxm6GjLMTF3kxZhRLeqUb", floatDuration: 3.5, floatDelay: 0.4 },
  { song: "Sweet Child O' Mine",      artist: "Guns N' Roses",      img: "/albums/sweet-child.jpg",      spotifyId: "7o2CTH4ctstm8TNelqjb51", floatDuration: 4.0, floatDelay: 0.8 },
  { song: "Texas Flood",              artist: "Stevie Ray Vaughan", img: "/albums/texas-flood.jpg",      spotifyId: "3YGkSEhOcgYInjpNMaEOBJ", floatDuration: 3.2, floatDelay: 1.2 },
  { song: "Sultans of Swing",         artist: "Dire Straits",       img: "/albums/sultans-of-swing.jpg", spotifyId: "4lLtanYk6tkMvoofikzhOb", floatDuration: 3.8, floatDelay: 0.2 },
  { song: "Hotel California",         artist: "Eagles",             img: "/albums/hotel-california.jpg", spotifyId: "40riOy7x9W7GXjyGp4pjAv", floatDuration: 3.3, floatDelay: 0.6 },
  { song: "Eruption",                 artist: "Van Halen",          img: "/albums/eruption.jpg",         spotifyId: "3OfxKQMWnIGFEweVigJpOl", floatDuration: 3.6, floatDelay: 1.0 },
  { song: "All Along the Watchtower", artist: "Jimi Hendrix",       img: "/albums/watchtower.jpg",       spotifyId: "3MPJsiRlMNEN7oJBLVmi7A", floatDuration: 3.4, floatDelay: 1.4 },
]

const gearBrands = ["Fender", "Marshall", "Gibson", "Vox", "Mesa Boogie", "PRS", "Orange", "Boss", "Line 6", "Ibanez", "Epiphone", "Blackstar"]

// ── COMPONENT ─────────────────────────────────────────────────────────────────

/**
 * The landing page itself. It stays a client component: the hero canvas, the
 * ScrollTrigger timelines and the Clerk session all need the browser.
 *
 * `initialReviews` is read on the server by app/page.tsx and threaded down so
 * the three review blocks have their content in the first HTML payload. They
 * each fetched from a useEffect, which meant an answer engine that does not run
 * JavaScript saw a spinner and an empty placeholder where the social proof was.
 * The components still refetch on mount, so a freshly posted review shows up
 * without waiting for the hourly revalidate.
 */
export function LandingClient({ initialReviews, stageAvailable = false, playerAvailable = true }: { initialReviews: StoredReview[]; stageAvailable?: boolean; playerAvailable?: boolean }) {
  const navRef            = useRef<HTMLElement>(null)
  const wrapperRef        = useRef<HTMLDivElement>(null)
  const canvasRef         = useRef<HTMLCanvasElement>(null)
  const heroFramesRef     = useRef<HTMLImageElement[]>([])
  const heroFrameIdxRef   = useRef(0)
  const heroContentRef    = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const videoRef          = useRef<HTMLVideoElement>(null)
  const pedalVideoRef     = useRef<HTMLVideoElement>(null)
  const ctaVideoRef       = useRef<HTMLVideoElement>(null)
  const s3MediaRef        = useRef<HTMLDivElement>(null)
  const s4MediaRef        = useRef<HTMLDivElement>(null)
  const s6MediaRef        = useRef<HTMLDivElement>(null)
  const s2Ref             = useRef<HTMLDivElement>(null)
  const s3Ref             = useRef<HTMLDivElement>(null)
  const s4Ref             = useRef<HTMLDivElement>(null)
  const s5Ref             = useRef<HTMLDivElement>(null)
  const s6Ref             = useRef<HTMLDivElement>(null)
  const s8Ref             = useRef<HTMLDivElement>(null)
  const sTrendRef         = useRef<HTMLDivElement>(null)
  const stepRefs          = useRef<(HTMLDivElement | null)[]>([])
  const ampCardRefs       = useRef<(HTMLDivElement | null)[]>([])

  // Stays false through the prerender, so the signed-out markup is what ships in
  // the static HTML and the signed-in nav swaps in once Clerk resolves
  const { isSignedIn } = useUser()

  const [mounted, setMounted]               = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [knobsLive, setKnobsLive]           = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
      const xBias = window.innerWidth <= 768 ? 0.65 : 0.5
      if (ia > ca) { sw = ih * ca; sx = (iw - sw) * xBias }
      else          { sh = iw / ca; sy = (ih - sh) / 2 }
      ctx2d.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    }

    const resizeCanvas = () => {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
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

    // On mobile, load every 3rd frame (~1.6MB instead of ~4.8MB); scrub snaps to loaded frames
    const FRAME_STEP = window.innerWidth <= 768 ? 3 : 1
    const BATCH = 20
    const loadBatch = (start: number) => {
      for (let i = start; i < Math.min(start + BATCH, TOTAL); i++) {
        if (i % FRAME_STEP !== 0 && i !== TOTAL - 1) continue
        const img = new Image()
        img.src = `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`
        heroFramesRef.current[i] = img
      }
      if (start + BATCH < TOTAL) setTimeout(() => loadBatch(start + BATCH), 16)
    }
    loadBatch(0)
    const firstFrame = heroFramesRef.current[0]
    if (firstFrame.complete) drawCoverFrame(firstFrame)
    else firstFrame.onload = () => drawCoverFrame(firstFrame)

    // Latest wrapper progress, readable from a video's own load handler
    let scrollProgress = 0

    // Maps the scroll window a clip is scrubbed across onto its timeline
    const applyScrub = (el: HTMLVideoElement | null, from: number, to: number) => {
      if (!el || !el.duration) return
      // Never seek to exactly duration — that fires `ended` and some browsers
      // snap the poster frame back
      const p = Math.max(0, Math.min(0.998, (scrollProgress - from) / (to - from)))
      el.currentTime = p * el.duration
    }

    // Section clips carry their URL in data-src and only fetch once the scroll
    // gets close. Elements hidden by the mobile media query never load at all.
    // The seek is repeated on loadedmetadata: the first scroll update lands
    // before duration is known, and without this the clip stays on frame one
    // until the next scroll event.
    const ensureSrc = (el: HTMLVideoElement | null, scrub?: [number, number]) => {
      if (!el || el.src || el.offsetParent === null) return
      const webm = el.dataset.srcWebm
      const canWebm = webm && el.canPlayType('video/webm; codecs="vp9"')
      if (scrub) {
        el.addEventListener("loadedmetadata", () => applyScrub(el, scrub[0], scrub[1]), { once: true })
      }
      el.src = canWebm ? webm : (el.dataset.src ?? "")
      el.load()
    }

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
          let idx = Math.min(Math.floor(self.progress * 240), 240)
          idx = Math.min(240, Math.round(idx / FRAME_STEP) * FRAME_STEP)
          heroFrameIdxRef.current = idx
          const img = heroFramesRef.current[idx]
          if (img?.complete) drawCoverFrame(img)
          const heroOpacity = String(Math.max(0, 1 - self.progress * 6))
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = heroOpacity
            // Faded out is not out of the way: the buttons keep taking clicks
            heroContentRef.current.style.visibility = heroOpacity === "0" ? "hidden" : "visible"
          }
          if (scrollIndicatorRef.current) {
            scrollIndicatorRef.current.style.opacity = heroOpacity
          }
          scrollProgress = self.progress

          if (self.progress > 0.30) {
            ensureSrc(pedalVideoRef.current, PEDAL_SCRUB)
            ensureSrc(videoRef.current, ENGINE_SCRUB)
          }
          if (self.progress > 0.75) ensureSrc(ctaVideoRef.current)

          applyScrub(videoRef.current, ENGINE_SCRUB[0], ENGINE_SCRUB[1])
          // Pedalboard fills itself in across the features section
          applyScrub(pedalVideoRef.current, PEDAL_SCRUB[0], PEDAL_SCRUB[1])
          // The CTA loop is the only clip that plays on its own, so it is
          // stopped whenever its section is off screen
          const cta = ctaVideoRef.current
          if (cta) {
            const visible = self.progress > CTA_VISIBLE[0] && self.progress < CTA_VISIBLE[1]
            if (visible && cta.paused) cta.play().catch(() => { })
            else if (!visible && !cta.paused) cta.pause()
          }
        },
      })

      // Sections cross-fade with autoAlpha rather than opacity. Two reasons:
      // an element parked at opacity 0 still swallows clicks — the invisible
      // amp knobs were sitting on top of the hero's CTA and eating it — and
      // the exit has to be a fromTo with immediateRender off. A plain to()
      // records its start value during the initial refresh, while the section
      // is still at 0, so every section cut straight to black the moment its
      // exit window opened instead of fading across it.
      const sectionFade = (
        el: Element | null,
        inFrom: string, inTo: string, outFrom: string, outTo: string,
      ) => {
        if (!el) return
        gsap.fromTo(el, { autoAlpha: 0 }, {
          autoAlpha: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: inFrom, end: inTo, scrub: true },
        })
        gsap.fromTo(el, { autoAlpha: 1 }, {
          autoAlpha: 0, ease: "none", immediateRender: false,
          scrollTrigger: { trigger: wrapperRef.current, start: outFrom, end: outTo, scrub: true },
        })
      }

      // ── S1.5 TRENDING TONES ──────────────────────────────────
      sectionFade(sTrendRef.current, "8% top", "12% top", "22% top", "26% top")
      gsap.fromTo(
        sTrendRef.current?.querySelectorAll(".tone-card") ?? [],
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: wrapperRef.current, start: "10% top", once: true } }
      )

      // ── S2 HOW IT WORKS ──────────────────────────────────────
      sectionFade(s2Ref.current, "27% top", "33% top", "40% top", "43% top")
      gsap.fromTo(
        stepRefs.current.filter(Boolean) as HTMLDivElement[],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: wrapperRef.current, start: "29% top", once: true } }
      )

      // ── S3 FEATURES ──────────────────────────────────────────
      sectionFade(s3Ref.current, "43% top", "48% top", "54% top", "57% top")
      gsap.fromTo(
        s3Ref.current?.querySelectorAll(".js-feat") ?? [],
        { opacity: 0, x: -32 },
        { opacity: 1, x: 0, stagger: 0.14, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "44% top", once: true } }
      )

      // ── S4 AI ENGINE ─────────────────────────────────────────
      sectionFade(s4Ref.current, "57% top", "62% top", "67% top", "70% top")
      gsap.fromTo(
        s4Ref.current?.querySelectorAll(".js-pill") ?? [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "58% top", once: true } }
      )

      // ── S5 AMP SETTINGS ──────────────────────────────────────
      sectionFade(s5Ref.current, "70% top", "74% top", "79% top", "81% top")
      const ampCards = ampCardRefs.current.filter(Boolean) as HTMLDivElement[]
      if (ampCards.length) {
        gsap.fromTo(ampCards,
          { opacity: 0, y: 40, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)", stagger: 0.09,
            scrollTrigger: { trigger: wrapperRef.current, start: "72% top", once: true } }
        )
      }
      // The knobs run their own sweep; they only need the cue, because the
      // section is in the DOM (and "on screen") long before it fades in
      ScrollTrigger.create({
        trigger: wrapperRef.current, start: "72% top", once: true,
        onEnter() { setKnobsLive(true) },
      })

      // ── S6 CTA ───────────────────────────────────────────────
      // The sticky frame releases at 91.7% of the wrapper (1200vh − 100vh), so
      // the CTA has to be gone by then; ending at 93% left it sliding off the
      // top half lit.
      sectionFade(s6Ref.current, "81% top", "84% top", "87% top", "91% top")

      // ── SECTION MEDIA LAYERS ─────────────────────────────────
      // Each clip rides the same fade window as the copy it belongs to
      sectionFade(s3MediaRef.current, "43% top", "48% top", "54% top", "57% top")
      sectionFade(s4MediaRef.current, "57% top", "62% top", "67% top", "70% top")
      sectionFade(s6MediaRef.current, "81% top", "84% top", "87% top", "91% top")

    })

    return () => {
      ctx.revert()
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("scroll", handleNavScroll)
    }
  }, [])

  return (
    <main style={{
      background: "#08080A", color: "#F2F2F7",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.5s ease-out",
    }}>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..700,100,1&family=JetBrains+Mono:wght@500&display=swap');

        :root {
          --tn-void:           #08080A;
          --tn-primary:        #0D0D10;
          --tn-elevated:       #141418;
          --tn-surface:        #1A1A20;
          --tn-accent:         #F5A623;
          --tn-accent-bright:  #FFD700;
          --tn-glow:           rgba(245,166,35,0.15);
          --tn-text-primary:   #F2F2F7;
          --tn-text-secondary: #A6A6AF;
          --tn-gradient:       linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #E8912D 100%);
          --font-display:      'Fraunces', Georgia, serif;
          --font-body:         'Satoshi', sans-serif;
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
          font-family: 'Satoshi', sans-serif;
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
          font-family: 'Satoshi', sans-serif;
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
          font-family: 'Satoshi', sans-serif;
          font-size: 0.9375rem;
          color: #F2F2F7;
          text-decoration: none;
          opacity: 0.72;
          transition: opacity 0.2s;
        }
        .tn-nav-link:hover { opacity: 1; }

        .step-card {
          background: rgba(20,17,15,0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(245,166,35,0.12);
          border-radius: 16px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s;
          display: flex;
          flex-direction: column;
        }
        .step-card:hover {
          border-color: rgba(245,166,35,0.3);
          transform: translateY(-4px);
        }
        .step-num {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
          font-size: 3rem;
          background: linear-gradient(135deg, #E8712A 0%, #D14B32 100%);
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

        .tone-card:hover .eq-bar:nth-child(1) { animation-duration: 0.4s; }
        .tone-card:hover .eq-bar:nth-child(2) { animation-duration: 0.55s; }
        .tone-card:hover .eq-bar:nth-child(3) { animation-duration: 0.45s; }

        @keyframes marquee-scroll { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
        .marquee-track { animation: marquee-scroll 25s linear infinite; display: flex; align-items: center; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        @keyframes bounce-down {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        .tone-card {
          background: rgba(22,18,16,0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .tone-card:hover {
          transform: scale(1.05);
          border-color: rgba(245,166,35,0.3);
          box-shadow: 0 0 30px rgba(232,113,42,0.15);
        }
        .testimonial-card {
          transition: border-color 0.3s, transform 0.3s;
        }
        .testimonial-card:hover {
          border-color: rgba(245,166,35,0.35);
          transform: translateY(-2px);
        }
        @media (max-width: 1080px) {
          .tn-review-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }

        .tn-hamburger {
          display: none;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #F2F2F7;
          align-items: center;
          justify-content: center;
          /* The 20px icon plus 8px padding left a 38px box. This is the only
             way into the nav on a phone, so it gets a full 44px target. */
          min-width: 44px;
          min-height: 44px;
        }
        .tn-mobile-menu {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(8,8,10,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          z-index: 199;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
        }
        .tn-mobile-menu.open { display: flex; }
        .tn-mobile-menu a {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2rem;
          font-weight: 600;
          color: #F2F2F7;
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .tn-mobile-menu a:hover { color: #F5A623; }
        .tn-mobile-menu-close {
          position: absolute;
          top: 24px; right: clamp(24px, 5vw, 80px);
          background: transparent;
          border: none;
          color: #F2F2F7;
          cursor: pointer;
          padding: 8px;
          min-width: 44px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .tn-nav-links   { display: none !important; }
          .tn-hamburger   { display: inline-flex !important; }
          .tn-step-grid   { grid-template-columns: 1fr !important; }
          /* Six knob cards do not fit a phone viewport at desktop scale —
             the heading was being pushed off the top of the sticky frame */
          .tn-amp-grid       { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .tn-amp-grid > div { padding: 14px 10px !important; }
          .tn-amp-grid svg   { width: 64px !important; height: 64px !important; }
          .tn-price-grid  { grid-template-columns: 1fr !important; }
          .tn-foot-grid   { grid-template-columns: 1fr !important; gap: 40px !important; }
          .tn-trust-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .tn-tone-grid   { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .tn-review-grid { grid-template-columns: 1fr !important; }
          /* The pill's two halves stack rather than shrink: the rule between
             them is meaningless once they are on separate lines. */
          .tn-proofbar { gap: 12px !important; border-radius: 18px !important; }
          .tn-proofbar-rule { display: none !important; }
          .tn-proof-grid   { flex-direction: column !important; }
          .tn-hero-content { max-width: calc(100vw - 48px) !important; }
          .tn-sign-in-btn { display: none !important; }

          /* Phone hero: anchor the copy to the bottom over a solid scrim so the
             headline never fights the lit side of the photograph. */
          .tn-hero-scrim {
            background: linear-gradient(
              to top,
              rgba(8,8,10,0.96) 0%,
              rgba(8,8,10,0.88) 32%,
              rgba(8,8,10,0.55) 58%,
              rgba(8,8,10,0.15) 100%
            ) !important;
          }
          .tn-hero-content {
            justify-content: flex-end !important;
            padding-bottom: 108px !important;
          }
          .tn-hero-content h1 { margin-bottom: 16px !important; }
          .tn-hero-content p {
            color: #C9C5BE !important;
            max-width: none !important;
            margin-bottom: 24px !important;
          }
          /* The proof pill now carries the trust line in the hero, and the phone
             crop cannot hold both without pushing the CTA off the fold. */
          .tn-hero-badges { display: none !important; }

          /* A half-width clip is unreadable in a 9:16 crop, and the two
             scrubbed files are 6 MB — phones skip them entirely. */
          .tn-sec-media { display: none !important; }

          /* Every footer link was a 19px line box, which is a hard target to
             hit with a thumb and under the 24px floor. Vertical space is the
             cheap resource down here, so each one gets a real tap area. The
             wrapper margins come off to stop the column doubling in height. */
          .tn-foot-grid a {
            display: inline-flex !important;
            align-items: center !important;
            min-height: 44px !important;
          }
          .tn-foot-grid a { margin-top: -6px !important; margin-bottom: -6px !important; }
          .tn-foot-tones a {
            display: inline-flex !important;
            align-items: center !important;
            min-height: 40px !important;
          }
        }

        @media (max-width: 520px) {
          /* A tone card spends about 145px on the cover art, the EQ bars, the
             padding and the gaps before any text fits. Two columns on a 360px
             phone leave the title a handful of pixels, so the row goes single
             file and each card gets the width it needs to stay readable. */
          .tn-tone-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tn-sec-media { display: none !important; }
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Tonelify" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "contain", background: "transparent" }} />
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
            fontSize: "1.4rem", color: "#F5A623", lineHeight: 1, letterSpacing: "-0.01em",
          }}>Tonelify</span>
        </Link>
        <div className="tn-nav-links" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {/* Explore replaces Collection and Settings here: both of those bounce a
              signed-out visitor to sign-in, and the tone library is the only part
              of the site a first-time visitor (or a crawler) can actually read */}
          <Link href="/explore"    className="tn-nav-link">Explore Tones</Link>
          <Link href="/tone-match" className="tn-nav-link">Match Tones</Link>
          <Link href="/faq"        className="tn-nav-link">FAQ</Link>
          <Link href="/plans"      className="tn-nav-link">Plans</Link>
        </div>
        {/* The landing nav used to hard-code "Sign In", so a signed-in visitor who
            clicked the wordmark landed back here and read it as being logged out.
            Written against useUser rather than <SignedIn>/<SignedOut> on purpose:
            this page is statically prerendered, and Clerk's components render
            nothing at all server-side, which would empty the nav in the HTML. */}
        {isSignedIn ? (
          <Link href="/collection" className="ghost-btn tn-sign-in-btn" style={{ padding: "10px 24px", fontSize: "0.875rem" }}>My Collection</Link>
        ) : (
          <Link href="/sign-in" className="ghost-btn tn-sign-in-btn" style={{ padding: "10px 24px", fontSize: "0.875rem" }}>Sign In</Link>
        )}
        <button
          className="tn-hamburger"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`tn-mobile-menu${mobileMenuOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <button className="tn-mobile-menu-close" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/explore"    onClick={() => setMobileMenuOpen(false)}>Explore Tones</Link>
        <Link href="/tone-match" onClick={() => setMobileMenuOpen(false)}>Match Tones</Link>
        <Link href="/faq"        onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
        <Link href="/plans"      onClick={() => setMobileMenuOpen(false)}>Plans</Link>
        {!isSignedIn && (
          <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.25rem", color: "#F5A623" }}>Sign In</Link>
        )}
        {isSignedIn && (
          <>
          <Link href="/collection" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.25rem", color: "#F5A623" }}>My Collection</Link>
          <SignOutButton redirectUrl="/">
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                font: "inherit", fontSize: "1.25rem", color: "#A6A6AF", padding: 0,
              }}
            >
              Sign Out
            </button>
          </SignOutButton>
          </>
        )}
      </div>

      {/* Grain overlay */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "200px 200px",
      }} />

      {/* ── 1400VH SCROLL WRAPPER ── */}
      <div ref={wrapperRef} style={{ height: "1200vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>

          {/* Canvas */}
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#08080A url('/frames/frame_0001.jpg') right center / cover no-repeat" }} />

          {/* ── SECTION MEDIA ──
              Three clips layered over the frame canvas. The two scrubbed ones
              sit opposite their section's copy and are masked at the edges so
              they dissolve into the background instead of reading as a box.
              Sources are attached on approach (see ensureSrc) — loading them
              up front would double the landing page's bytes. */}
          <div ref={s3MediaRef} className="tn-sec-media" aria-hidden="true"
            style={{ ...sectionMediaColumn, right: 0 }}
          >
            <video
              ref={pedalVideoRef}
              data-src="/videos/pedalboard.mp4"
              muted playsInline preload="none"
              style={{ ...sectionMediaVideo, objectPosition: "center center" }}
            />
          </div>

          <div ref={s4MediaRef} className="tn-sec-media" aria-hidden="true"
            style={{ ...sectionMediaColumn, left: 0 }}
          >
            <video
              ref={videoRef}
              data-src="/video.mp4"
              muted playsInline preload="none"
              style={{ ...sectionMediaVideo, objectPosition: "72% center" }}
            />
          </div>

          <div ref={s6MediaRef} aria-hidden="true" style={{
            position: "absolute", inset: 0, zIndex: 1, opacity: 0, pointerEvents: "none",
          }}>
            <video
              ref={ctaVideoRef}
              data-src="/videos/cta-loop.mp4"
              data-src-webm="/videos/cta-loop.webm"
              muted loop playsInline preload="none"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Keeps the headline at 6:1 contrast over the lit cone */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,10,0.55)" }} />
          </div>

          {/* Left vignette — becomes a bottom-up scrim on phones, where the copy
              sits over the brightly lit half of the frame instead of beside it */}
          <div aria-hidden="true" className="tn-hero-scrim" style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(to right, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.3) 40%, transparent 60%)",
          }} />

          {/* ── S1 HERO ── */}
          <div ref={heroContentRef} className="tn-hero-content" style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
            paddingLeft: "clamp(24px, 7vw, 128px)", paddingRight: "24px",
            maxWidth: "min(760px, 60vw)",
          }}>
            <span style={{ ...sectionLabel, pointerEvents: "auto" }}>Guitar Tone Matching</span>
            <h1 style={{
              // Fraunces sets considerably wider than the old geometric sans, so
              // the display size comes down to keep each line unbroken
              fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
              fontSize: "clamp(2.6rem, 5.5vw, 5.25rem)",
              lineHeight: 1.0, letterSpacing: "-0.015em",
              color: "#F2F2F7", margin: "0 0 24px",
            }}>
              Stop Guessing.<br />
              <em style={{ fontStyle: "normal", color: "#F5A623" }}>Start</em>{" "}
              <em style={{ fontStyle: "normal", color: "#F5A623" }}>Playing.</em>
            </h1>
            <p style={{
              fontFamily: "'Satoshi', sans-serif", fontSize: "1.0625rem",
              lineHeight: 1.65, color: "#A6A6AF",
              maxWidth: "380px", margin: "0 0 32px",
            }}>
              {/* The H1 is a brand line and carries no keyword, so the first
                  paragraph has to name what the page is about */}
              Match any legendary guitar tone to the amp, guitar and pickups you already
              own. Exact knob settings in seconds.
            </p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", pointerEvents: "auto" }}>
              <Link href="/tone-match" className="cta-btn">Start Matching Tones</Link>
              <Link href="/plans"      className="ghost-btn">See plans</Link>
            </div>
            <SocialProofBar reviews={initialReviews} />
            <div className="tn-hero-badges" style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "28px", pointerEvents: "auto" }}>
              {badges.map((label) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <CheckIcon />
                  <span style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.8125rem", color: "#A6A6AF" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator — fades with hero via scrollIndicatorRef */}
          <div ref={scrollIndicatorRef} aria-hidden="true" style={{
            position: "absolute", bottom: "40px", left: "50%",
            animation: "bounce-down 1.5s ease-in-out infinite",
            zIndex: 3, pointerEvents: "none",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="6 9 12 15 18 9" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* ── S1.5 TRENDING TONES — solid breaker ── */}
          <div ref={sTrendRef} style={{
            position: "absolute", inset: 0, zIndex: 5, opacity: 0, pointerEvents: "none",
            background: "linear-gradient(180deg, #100D0B 0%, #1A100C 50%, #100D0B 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 clamp(24px, 7vw, 96px)",
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(circle at 50% 30%, rgba(245,166,35,0.07) 0%, transparent 60%)",
            }} />
            <div style={{ maxWidth: "1060px", width: "100%", position: "relative", pointerEvents: "auto" }}>
              <div style={{ textAlign: "center", marginBottom: "44px" }}>
                <span style={{ ...sectionLabel, display: "block", textAlign: "center" }}>Trending This Week</span>
                <h2 style={{ ...h2Style, margin: 0 }}>Popular tones right now</h2>
                <p style={{
                  fontFamily: "'Satoshi', sans-serif", fontSize: "0.85rem",
                  color: "#8A8494", marginTop: "8px", marginBottom: 0,
                }}>
                  Matched by 1,000+ guitarists
                </p>
              </div>
              {/* minmax(0, 1fr), not 1fr: the song and artist lines are
                  white-space:nowrap, so a plain 1fr track floors at the widest
                  title and the row grew to ~1170px inside a 1060px container.
                  The overflow was clipped, which cost the whole right-hand
                  column on a phone. Letting the track shrink below min-content
                  is what finally lets the ellipsis do its job. */}
              <div className="tn-tone-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px",
              }}>
                {trendingTones.map((tone) => (
                  // These cards have looked clickable since launch (pointer
                  // cursor, hover lift) while doing nothing at all. They now
                  // open the matcher with the track already filled in.
                  <Link
                    key={tone.song}
                    href={`/tone-match?song=${encodeURIComponent(tone.song)}&artist=${encodeURIComponent(tone.artist)}`}
                    className="tone-card"
                    aria-label={`Match the ${tone.song} tone by ${tone.artist}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      animationName: "float",
                      animationDuration: `${tone.floatDuration}s`,
                      animationDelay: `${tone.floatDelay}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      willChange: "transform",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tone.img}
                      alt={tone.song}
                      loading="lazy"
                      width={60}
                      height={60}
                      style={{ borderRadius: "8px", objectFit: "cover", flexShrink: 0, width: "60px", height: "60px" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Satoshi', sans-serif", fontWeight: 600,
                        fontSize: "0.9rem", color: "#F2F2F7",
                        marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{tone.song}</div>
                      <div style={{
                        fontFamily: "'Satoshi', sans-serif", fontWeight: 400,
                        fontSize: "0.8rem", color: "#8A8494",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{tone.artist}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "22px", flexShrink: 0 }}>
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Section divider */}
              <div style={gradientDivider} />
            </div>
          </div>

          {/* ── S2 HOW IT WORKS — solid breaker ── */}
          <div ref={s2Ref} style={{
            position: "absolute", inset: 0, zIndex: 20, opacity: 0, pointerEvents: "none",
            background: "linear-gradient(180deg, #100D0B 0%, #1A100C 50%, #100D0B 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "120px clamp(24px, 7vw, 96px)",
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(circle at 50% 30%, rgba(245,166,35,0.08) 0%, transparent 60%)",
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
                      background: "linear-gradient(90deg, #E8712A 0%, #D14B32 100%)",
                    }} />
                    <div style={{ marginBottom: "12px" }}>{stepIcons[i]}</div>
                    <div className="step-num">{step.n}</div>
                    <h3 style={{
                      fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600,
                      fontSize: "1.125rem", color: "#F2F2F7", margin: "0 0 12px",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Satoshi', sans-serif", fontSize: "0.9375rem",
                      lineHeight: 1.65, color: "#A6A6AF", margin: 0,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
              {/* Section divider */}
              <div style={gradientDivider} />
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
                    fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600,
                    fontSize: "1rem", color: "#F2F2F7", margin: "0 0 8px",
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontFamily: "'Satoshi', sans-serif", fontSize: "0.9rem",
                    lineHeight: 1.65, color: "#A6A6AF", margin: 0,
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
                fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                lineHeight: 1.0, letterSpacing: "-0.015em",
                color: "#F2F2F7", margin: "0 0 20px",
              }}>
                AI analyzes every<br />detail of your tone
              </h2>
              <p style={{
                fontFamily: "'Satoshi', sans-serif", fontSize: "1.0625rem",
                lineHeight: 1.65, color: "#A6A6AF", margin: "0 0 32px",
              }}>
                Frequency response, harmonic content and pickup characteristics, matched against thousands of real amp profiles.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {pills.map((pill) => (
                  <span key={pill} className="js-pill" style={{
                    fontFamily: "'Satoshi', sans-serif", fontWeight: 500,
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
              fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.04, letterSpacing: "-0.01em",
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
                    background: "rgba(15,13,12,0.9)",
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
                  <AmpKnob label={lbl} value={value} size={104} delay={i * 90} start={knobsLive} />
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
              fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
              fontSize: "clamp(2.6rem, 6vw, 5rem)",
              lineHeight: 0.98, letterSpacing: "-0.015em",
              color: "#F2F2F7", margin: "0 0 44px", pointerEvents: "auto",
            }}>
              Your tone<br />is waiting.
            </h2>
            <div style={{
              display: "flex", alignItems: "center", gap: "24px",
              flexWrap: "wrap", justifyContent: "center", pointerEvents: "auto",
            }}>
              {/* Sending an existing member to sign-up is a dead end — Clerk just
                  tells them they are already signed in. The signed-out copy is the
                  server-rendered default so it stays in the crawled HTML. */}
              {isSignedIn ? (
                <Link href="/tone-match" className="cta-btn">Match a Tone</Link>
              ) : (
                <>
                  <Link href="/sign-up" className="cta-btn">Try It Free</Link>
                  <span style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.875rem", color: "#A6A6AF" }}>
                    No credit card required
                  </span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Divider: after sticky scroll */}
      <div style={{
        height: "1px", width: "60%", margin: "0 auto",
        background: "linear-gradient(90deg, transparent, #E8712A, #D14B32, transparent)",
        opacity: 0.3,
      }} />

      {/* ── REVIEW STRIP — real reviews, ahead of the pricing table ── */}
      <ReviewStrip initialReviews={initialReviews} />

      {/* ── S7 PRICING — signed-in only ──
          Visitors who are not signed in do not see plans on the landing page.
          /plans still carries them, still sits in the sitemap and is still
          linked from the nav and the CTA, so the prices stay crawlable and one
          click away; this only decides what the homepage itself leads with. */}
      {isSignedIn && (
      <section style={{
        position: "relative", isolation: "isolate",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
        minHeight: "100vh",
      }}>
        {/* Bottom gradient layer */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #E8712A 0%, #D14B32 100%)",
        }} />
        {/* Frosted glass overlay */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "rgba(8,8,12,0.7)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }} />
        {/* Grain */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "200px 200px",
        }} />
        {/* Top border line */}
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
          background: "linear-gradient(90deg, transparent, #E8712A, #D14B32, transparent)",
          opacity: 0.3,
        }} />
        {/* Bottom border line */}
        <div aria-hidden="true" style={{
          position: "absolute", bottom: 0, left: "20%", right: "20%", height: "1px",
          background: "linear-gradient(90deg, transparent, #E8712A, #D14B32, transparent)",
          opacity: 0.3,
        }} />

        {/* The plan cards are the same component /plans renders, so the two
            surfaces can never describe different plans. This section used to
            hand-roll a two-card Free vs Player table that had already drifted
            from the three plans actually on sale. */}
        <div style={{ width: "100%", maxWidth: "1180px", position: "relative", zIndex: 1 }}>
          <Pricing stageAvailable={stageAvailable} playerAvailable={playerAvailable} />
        </div>
      </section>
      )}

      {/* ── S8 TESTIMONIALS — fed by the real reviews table ── */}
      <section ref={s8Ref} style={{
        padding: "100px clamp(24px, 7vw, 96px)",
        background: "linear-gradient(180deg, #100D0B 0%, #1A100C 50%, #100D0B 100%)",
        position: "relative",
        zIndex: 20,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={sectionLabel}>From the record to your rig</span>
          <h2 style={{ ...h2Style, margin: "16px 0 0" }}>
            Every tone documented down to the amp
          </h2>
          <p style={{
            fontFamily: "'Satoshi', sans-serif", fontSize: "1rem",
            lineHeight: 1.65, color: "#A6A6AF", maxWidth: 620, margin: "14px 0 0",
          }}>
            {TONE_COUNT} records in the library, each one traced back to the guitar, the amp
            and the pedals that made it, then translated to whatever you own.
          </p>

          <ToneProof />

          <div style={{ marginTop: 56 }}>
            <span style={sectionLabel}>What Guitarists Say</span>
            <div className="tn-testimonials" style={{ marginTop: "28px" }}>
              <LandingTestimonials initialReviews={initialReviews} />
            </div>
          </div>
        </div>
      </section>

      {/* ── S8b REVIEWS — read the full list and post one ── */}
      <div style={{ position: "relative", zIndex: 20 }}>
        <Reviews initialReviews={initialReviews} />
      </div>

      {/* Divider: before Gear strip */}
      <div style={{
        height: "1px", width: "60%", margin: "0 auto",
        background: "linear-gradient(90deg, transparent, #E8712A, #D14B32, transparent)",
        opacity: 0.3,
      }} />

      {/* ── GEAR COMPATIBILITY — normal flow ── */}
      <section style={{
        background: "rgba(20,17,15,0.5)", padding: "40px 0",
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
                  fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600,
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
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: "0.9375rem", color: "#F2F2F7", marginBottom: "4px" }}>
                  {title}
                </div>
                <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.8125rem", color: "#A6A6AF" }}>
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
                fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700,
                fontSize: "1.5rem", color: "#F5A623",
                textDecoration: "none", display: "block", marginBottom: "14px", letterSpacing: "-0.01em",
              }}>Tonelify</Link>
              <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.9375rem", lineHeight: 1.7, color: "#A6A6AF", maxWidth: "280px", margin: "0 0 20px" }}>
                Gear-matched guitar tone settings for musicians worldwide.
              </p>
              <p style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.8125rem", color: "#A6A6AF", opacity: 0.5, margin: 0 }}>
                © 2026 Tonelify. All rights reserved.
              </p>
            </div>

            <div>
              <h4 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A6A6AF", margin: "0 0 20px" }}>
                Quick Links
              </h4>
              {/* Collection, Dashboard and Settings used to sit here. They are
                  noindex and blocked in robots.txt, so every one of those links
                  spent a footer slot on a page no visitor could open without an
                  account and no crawler was allowed to fetch. */}
              {([["Home", "/"], ["Explore Tones", "/explore"], ["Match Tones", "/tone-match"], ["Settings by Gear", "/gear"], ["Tone Guides", "/guides"], ["Plans", "/plans"], ["FAQ", "/faq"], ["Send Feedback", "/feedback"]] as const).map(([text, href]) => (
                <div key={href} style={{ marginBottom: "12px" }}>
                  <Link href={href} style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                    {text}
                  </Link>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A6A6AF", margin: "0 0 20px" }}>
                Support
              </h4>
              <div style={{ marginBottom: "12px" }}>
                <Link href="/about" style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                  About & Method
                </Link>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <a href="mailto:contact@tonelify.com" style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                  Contact Us
                </a>
              </div>
            </div>

            <div>
              <h4 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A6A6AF", margin: "0 0 20px" }}>
                Legal
              </h4>
              {([["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] as const).map(([text, href]) => (
                <div key={href} style={{ marginBottom: "12px" }}>
                  <Link href={href} style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.9375rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.65 }}>
                    {text}
                  </Link>
                </div>
              ))}
            </div>

          </div>

          {/* The tone pages are the part of the site with real search demand, and
              until now the only route to any of them was the /explore grid. A flat
              link row gives each one a path from the highest-authority page. */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "28px" }}>
            <h4 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A6A6AF", margin: "0 0 16px" }}>
              Popular tone settings
            </h4>
            <div className="tn-foot-tones" style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px" }}>
              {FOOTER_TONES.map(([text, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.8125rem", color: "#F2F2F7", textDecoration: "none", opacity: 0.55 }}>
                  {text}
                </Link>
              ))}
              <Link href="/explore" style={{ fontFamily: "'Satoshi', sans-serif", fontSize: "0.8125rem", color: "#F5A623", textDecoration: "none", fontWeight: 600 }}>
                All {TONE_COUNT} tones →
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Tonelify",
            "applicationCategory": "MusicApplication",
            "operatingSystem": "Web",
            "description": "AI-powered tone matching that adapts legendary guitar tones to your specific amp, guitar, and pickups.",
            "url": "https://tonelify.com",
            "publisher": { "@id": "https://tonelify.com/#organization" },
            // Built from the same server-read rows the review sections render,
            // so the rating in the markup is the rating on the page. Omitted
            // entirely when the table is empty: llms.txt says reviews are not
            // seeded, and a rating with nothing behind it would contradict it.
            ...(initialReviews.length > 0
              ? {
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": (
                    Math.round(
                      (initialReviews.reduce((sum, r) => sum + r.rating, 0) /
                        initialReviews.length) * 10
                    ) / 10
                  ).toFixed(1),
                  "reviewCount": initialReviews.length,
                  "bestRating": "5",
                  "worstRating": "1",
                },
                "review": initialReviews.slice(0, 5).map((r) => ({
                  "@type": "Review",
                  "reviewRating": { "@type": "Rating", "ratingValue": String(r.rating), "bestRating": "5", "worstRating": "1" },
                  "author": { "@type": "Person", "name": r.name?.trim() || "Anonymous" },
                  "reviewBody": r.comment,
                  "datePublished": r.created_at,
                })),
              }
              : {}),
            "offers": [
              { "@type": "Offer", "name": `${PLAN_NAMES.stage} (Monthly)`, "price": PRICING.stage.month.amount.toFixed(2), "priceCurrency": "USD", "url": "https://tonelify.com/plans", "availability": "https://schema.org/InStock" },
              { "@type": "Offer", "name": `${PLAN_NAMES.stage} (Yearly)`, "price": PRICING.stage.year.amount.toFixed(2), "priceCurrency": "USD", "url": "https://tonelify.com/plans", "availability": "https://schema.org/InStock" },
              { "@type": "Offer", "name": `${PLAN_NAMES.player} (Monthly)`, "price": PRICING.month.amount.toFixed(2), "priceCurrency": "USD", "url": "https://tonelify.com/plans", "availability": "https://schema.org/InStock" },
              { "@type": "Offer", "name": `${PLAN_NAMES.player} (Yearly)`, "price": PRICING.year.amount.toFixed(2), "priceCurrency": "USD", "url": "https://tonelify.com/plans", "availability": "https://schema.org/InStock" },
            ],
          }),
        }}
      />

    </main>
  )
}
