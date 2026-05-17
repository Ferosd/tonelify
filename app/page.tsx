"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const ampSettings = [
  { label: "GAIN",     value: 7.5 },
  { label: "BASS",     value: 5.0 },
  { label: "MIDS",     value: 6.5 },
  { label: "TREBLE",   value: 4.0 },
  { label: "MASTER",   value: 6.0 },
  { label: "PRESENCE", value: 3.5 },
]

const steps = [
  { n: "01", title: "Tell us your gear",        desc: "Enter your guitar model, amp, and pickup configuration." },
  { n: "02", title: "Name the reference tone",  desc: "Any song, artist, or describe the sound in plain language." },
  { n: "03", title: "Get exact dial positions", desc: "Receive precise GAIN, BASS, MIDS, TREBLE values for your specific rig." },
]

const pills = ["Frequency Analysis", "Harmonic Matching", "Gear Compensation"]

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: "3px" }}>
      <path d="M2.5 7.5L6 11L12.5 4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const glass: React.CSSProperties = {
  background: "rgba(8,8,10,0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "48px",
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  fontSize: "0.8125rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--tn-accent)",
  display: "block",
  marginBottom: "14px",
}

export default function Home() {
  const wrapperRef      = useRef<HTMLDivElement>(null)
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const heroFramesRef   = useRef<HTMLImageElement[]>([])
  const heroFrameIdxRef = useRef(0)
  const heroContentRef  = useRef<HTMLDivElement>(null)
  const s2Ref           = useRef<HTMLDivElement>(null)
  const s3Ref           = useRef<HTMLDivElement>(null)
  const s4Ref           = useRef<HTMLDivElement>(null)
  const s5Ref           = useRef<HTMLDivElement>(null)
  const s6Ref           = useRef<HTMLDivElement>(null)
  const stepRefs        = useRef<(HTMLDivElement | null)[]>([])
  const ampCardRefs     = useRef<(HTMLDivElement | null)[]>([])
  const ampValueRefs    = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const TOTAL_FRAMES = 241
    const canvas = canvasRef.current

    function drawCoverFrame(img: HTMLImageElement) {
      if (!canvas) return
      const ctx2d = canvas.getContext("2d")
      if (!ctx2d) return
      const cw = canvas.width, ch = canvas.height
      const iw = img.naturalWidth || 1, ih = img.naturalHeight || 1
      const canvasAspect = cw / ch
      const imgAspect = iw / ih
      let sx = 0, sy = 0, sw = iw, sh = ih
      if (imgAspect > canvasAspect) {
        sw = ih * canvasAspect; sx = (iw - sw) / 2
      } else {
        sh = iw / canvasAspect; sy = (ih - sh) / 2
      }
      ctx2d.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    }

    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const img = heroFramesRef.current[heroFrameIdxRef.current]
      if (img?.complete) drawCoverFrame(img)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`
      heroFramesRef.current[i] = img
    }
    const firstFrame = heroFramesRef.current[0]
    if (firstFrame.complete) drawCoverFrame(firstFrame)
    else firstFrame.onload = () => drawCoverFrame(firstFrame)

    const ctx = gsap.context(() => {

      // ── HERO ENTRANCE ─────────────────────────────────────
      gsap.fromTo(heroContentRef.current,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 1.3, ease: "power4.out", delay: 0.2 }
      )

      // ── MASTER SCROLL TRIGGER ─────────────────────────────
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
        },
      })

      // ── S2 HOW IT WORKS ───────────────────────────────────
      gsap.fromTo(s2Ref.current,
        { opacity: 0 },
        { opacity: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "15% top", end: "22% top", scrub: true } }
      )
      gsap.to(s2Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "33% top", end: "35% top", scrub: true },
      })
      gsap.fromTo(
        stepRefs.current.filter(Boolean) as HTMLDivElement[],
        { opacity: 0, x: 48 },
        { opacity: 1, x: 0, duration: 0.85, ease: "power3.out", stagger: 0.18,
          scrollTrigger: { trigger: wrapperRef.current, start: "17% top", once: true } }
      )

      // ── S3 AI ENGINE ──────────────────────────────────────
      gsap.fromTo(s3Ref.current,
        { opacity: 0 },
        { opacity: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "35% top", end: "42% top", scrub: true } }
      )
      gsap.to(s3Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "52% top", end: "55% top", scrub: true },
      })
      gsap.fromTo(
        s3Ref.current?.querySelectorAll(".js-pill") ?? [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "37% top", once: true } }
      )

      // ── S4 AMP SETTINGS ───────────────────────────────────
      gsap.fromTo(s4Ref.current,
        { opacity: 0 },
        { opacity: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "55% top", end: "60% top", scrub: true } }
      )
      gsap.to(s4Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "68% top", end: "70% top", scrub: true },
      })
      const ampCards = ampCardRefs.current.filter(Boolean) as HTMLDivElement[]
      if (ampCards.length) {
        gsap.fromTo(ampCards,
          { opacity: 0, y: 40, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)", stagger: 0.09,
            scrollTrigger: { trigger: wrapperRef.current, start: "57% top", once: true } }
        )
      }
      ScrollTrigger.create({
        trigger: wrapperRef.current, start: "57% top", once: true,
        onEnter() {
          ampSettings.forEach(({ value }, i) => {
            const el = ampValueRefs.current[i]
            if (!el) return
            const proxy = { val: 0 }
            gsap.to(proxy, {
              val: value, duration: 1.7, ease: "power2.out", delay: i * 0.09,
              onUpdate() { el.textContent = proxy.val.toFixed(1) },
            })
          })
        },
      })

      // ── S5 CTA ────────────────────────────────────────────
      gsap.fromTo(s5Ref.current,
        { opacity: 0 },
        { opacity: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "70% top", end: "75% top", scrub: true } }
      )
      gsap.to(s5Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "80% top", end: "82% top", scrub: true },
      })

      // ── S6 PRICING ────────────────────────────────────────
      gsap.fromTo(s6Ref.current,
        { opacity: 0 },
        { opacity: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "82% top", end: "87% top", scrub: true } }
      )
      gsap.to(s6Ref.current, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: wrapperRef.current, start: "93% top", end: "95% top", scrub: true },
      })
      gsap.fromTo(
        s6Ref.current?.querySelectorAll(".js-pricing-card") ?? [],
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: wrapperRef.current, start: "84% top", once: true } }
      )

    })

    return () => {
      ctx.revert()
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <main style={{ background: "var(--tn-void)", color: "var(--tn-text-primary)" }}>

      <style>{`
        @media (max-width: 768px) {
          .tn-amp-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .tn-price-grid { grid-template-columns: 1fr !important; }
          .tn-foot-grid  { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>

      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "200px 200px",
        }}
      />

      {/* ── 700VH SCROLL WRAPPER ──────────────────────────── */}
      <div ref={wrapperRef} style={{ height: "700vh", position: "relative" }}>

        {/* Single sticky viewport */}
        <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>

          {/* Canvas — sole visual layer */}
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />

          {/* Left-side readability gradient */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(to right, rgba(8,8,10,0.85) 0%, transparent 60%)",
          }} />

          {/* ── S1 HERO ─────────────────────────────────── */}
          <div
            ref={heroContentRef}
            style={{
              position: "absolute", inset: 0, zIndex: 2,
              display: "flex", flexDirection: "column", justifyContent: "center",
              paddingLeft: "clamp(24px, 7vw, 128px)",
              paddingRight: "24px",
              maxWidth: "min(680px, 54vw)",
            }}
          >
            <span style={sectionLabel}>Guitar Tone Matching</span>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "clamp(3.25rem, 7.5vw, 7rem)",
              lineHeight: 0.91, letterSpacing: "-0.03em",
              color: "var(--tn-text-primary)", margin: "0 0 28px",
            }}>
              Stop<br />Guessing.<br />
              <em style={{ fontStyle: "normal", color: "var(--tn-accent)" }}>Start</em><br />
              Playing.
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1.0625rem",
              lineHeight: 1.68, color: "var(--tn-text-secondary)",
              maxWidth: "380px", margin: "0 0 36px",
            }}>
              Match any legendary tone to your exact gear. Precise amp settings in seconds.
            </p>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/tone-match" className="cta-btn" style={{ textDecoration: "none" }}>
                Start Matching Tones
              </Link>
              <Link href="/plans" style={{
                fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.9375rem", color: "var(--tn-text-secondary)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                paddingBottom: "2px",
              }}>
                See plans
              </Link>
            </div>
          </div>

          {/* ── S2 HOW IT WORKS ─────────────────────────── */}
          <div
            ref={s2Ref}
            style={{
              position: "absolute", inset: 0, zIndex: 2, opacity: 0,
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              paddingRight: "clamp(24px, 7vw, 96px)",
              paddingLeft: "24px",
            }}
          >
            <div style={{ ...glass, maxWidth: "520px", width: "100%" }}>
              <span style={sectionLabel}>How It Works</span>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                lineHeight: 1.06, letterSpacing: "-0.02em",
                color: "var(--tn-text-primary)", margin: "0 0 40px",
              }}>
                Three steps to your perfect tone
              </h2>
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  ref={(el) => { stepRefs.current[i] = el }}
                  style={{
                    display: "grid", gridTemplateColumns: "44px 1fr",
                    gap: "16px",
                    paddingBottom: i < steps.length - 1 ? "28px" : "0",
                    marginBottom: i < steps.length - 1 ? "28px" : "0",
                    borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)", fontWeight: 500,
                    fontSize: "0.75rem", color: "var(--tn-accent)",
                    paddingTop: "4px", letterSpacing: "0.04em",
                  }}>
                    {step.n}
                  </span>
                  <div>
                    <h3 style={{
                      fontFamily: "var(--font-display)", fontWeight: 600,
                      fontSize: "1.125rem", color: "var(--tn-text-primary)",
                      margin: "0 0 8px",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: "0.9375rem",
                      lineHeight: 1.65, color: "var(--tn-text-secondary)", margin: 0,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── S3 AI ENGINE ────────────────────────────── */}
          <div
            ref={s3Ref}
            style={{
              position: "absolute", inset: 0, zIndex: 2, opacity: 0,
              display: "flex", alignItems: "center",
              paddingLeft: "clamp(24px, 7vw, 96px)",
              paddingRight: "24px",
            }}
          >
            <div style={{ ...glass, maxWidth: "560px", width: "100%" }}>
              <span style={sectionLabel}>The Engine</span>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                lineHeight: 0.95, letterSpacing: "-0.03em",
                color: "var(--tn-text-primary)", margin: "0 0 20px",
              }}>
                AI analyzes every<br />detail of your tone
              </h2>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "1.0625rem",
                lineHeight: 1.68, color: "var(--tn-text-secondary)",
                margin: "0 0 32px",
              }}>
                Frequency response, harmonic content, pickup characteristics — matched against thousands of real amp profiles.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="js-pill"
                    style={{
                      fontFamily: "var(--font-body)", fontWeight: 500,
                      fontSize: "0.8125rem", color: "var(--tn-accent)",
                      border: "1px solid rgba(245,166,35,0.25)",
                      borderRadius: "999px", padding: "8px 18px",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── S4 AMP SETTINGS ─────────────────────────── */}
          <div
            ref={s4Ref}
            style={{
              position: "absolute", inset: 0, zIndex: 2, opacity: 0,
              display: "flex", flexDirection: "column", justifyContent: "center",
              paddingLeft: "clamp(24px, 7vw, 96px)",
              paddingRight: "clamp(24px, 7vw, 96px)",
            }}
          >
            <span style={{ ...sectionLabel, marginBottom: "10px" }}>Amp Settings</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.04, letterSpacing: "-0.02em",
              color: "var(--tn-text-primary)", margin: "0 0 40px",
            }}>
              Exact numbers.<br />No guesswork.
            </h2>
            <div
              className="tn-amp-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", maxWidth: "860px" }}
            >
              {ampSettings.map(({ label: lbl }, i) => (
                <div
                  key={lbl}
                  ref={(el) => { ampCardRefs.current[i] = el }}
                  style={{
                    background: "rgba(12,12,16,0.82)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderTop: "1px solid rgba(255,255,255,0.11)",
                    borderRadius: "16px",
                    padding: "28px 24px",
                    opacity: 0,
                    transition: "border-color 0.3s, box-shadow 0.3s, transform 0.25s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = "rgba(245,166,35,0.3)"
                    el.style.boxShadow = "inset 0 1px 0 rgba(245,166,35,0.1), 0 0 48px rgba(245,166,35,0.1)"
                    el.style.transform = "translateY(-4px)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = "rgba(255,255,255,0.07)"
                    el.style.boxShadow = ""
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-mono)", fontWeight: 500,
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    color: "var(--tn-accent-bright)", marginBottom: "6px", lineHeight: 1,
                  }}>
                    <span ref={(el) => { ampValueRefs.current[i] = el }}>0.0</span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontWeight: 500,
                    fontSize: "0.6875rem", textTransform: "uppercase",
                    letterSpacing: "0.12em", color: "var(--tn-text-secondary)",
                  }}>
                    {lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── S5 CTA ──────────────────────────────────── */}
          <div
            ref={s5Ref}
            style={{
              position: "absolute", inset: 0, zIndex: 2, opacity: 0,
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              textAlign: "center",
              padding: "0 clamp(24px, 7vw, 128px)",
            }}
          >
            <span style={{ ...sectionLabel, textAlign: "center" }}>Ready?</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "clamp(3rem, 7vw, 6rem)",
              lineHeight: 0.91, letterSpacing: "-0.03em",
              color: "var(--tn-text-primary)", margin: "0 0 44px",
            }}>
              Your tone<br />is waiting.
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/sign-up" className="cta-btn" style={{ textDecoration: "none" }}>
                Try It Free
              </Link>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.875rem",
                color: "var(--tn-text-secondary)",
              }}>
                No credit card required
              </span>
            </div>
          </div>

          {/* ── S6 PRICING ──────────────────────────────── */}
          <div
            ref={s6Ref}
            style={{
              position: "absolute", inset: 0, zIndex: 2, opacity: 0,
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              padding: "0 clamp(24px, 5vw, 80px)",
              overflowY: "auto",
            }}
          >
            <div style={{ width: "100%", maxWidth: "900px" }}>
              <div style={{ marginBottom: "36px", textAlign: "center" }}>
                <span style={{ ...sectionLabel, textAlign: "center" }}>Pricing</span>
                <h2 style={{
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                  lineHeight: 1.04, letterSpacing: "-0.02em",
                  color: "var(--tn-text-primary)", margin: 0,
                }}>
                  Simple, honest pricing
                </h2>
              </div>

              <div
                className="tn-price-grid"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", alignItems: "start" }}
              >
                {/* Beginner */}
                <div
                  className="js-pricing-card"
                  style={{
                    background: "rgba(8,8,10,0.78)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px", padding: "36px",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-body)", fontWeight: 500,
                    fontSize: "0.75rem", textTransform: "uppercase",
                    letterSpacing: "0.1em", color: "var(--tn-text-secondary)",
                    marginBottom: "16px",
                  }}>
                    Beginner
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontWeight: 500,
                    fontSize: "2.25rem", color: "var(--tn-text-primary)",
                    lineHeight: 1, marginBottom: "6px",
                  }}>
                    Free
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)", color: "var(--tn-text-secondary)",
                    fontSize: "0.875rem", marginBottom: "28px",
                  }}>
                    No credit card
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", marginBottom: "28px" }}>
                    {["3 tone matches per day", "GAIN, BASS & TREBLE", "Basic amp profiles"].map((f) => (
                      <div key={f} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                        <CheckIcon />
                        <span style={{ fontFamily: "var(--font-body)", color: "var(--tn-text-secondary)", fontSize: "0.9rem" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/plans" className="ghost-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                    Get Started
                  </Link>
                </div>

                {/* Expert */}
                <div
                  className="js-pricing-card"
                  style={{
                    background: "rgba(245,166,35,0.04)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(245,166,35,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(245,166,35,0.1), 0 0 72px rgba(245,166,35,0.05)",
                    borderRadius: "16px", padding: "36px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{
                      fontFamily: "var(--font-body)", fontWeight: 500,
                      fontSize: "0.75rem", textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "var(--tn-accent)",
                    }}>
                      Expert
                    </div>
                    <span style={{
                      fontFamily: "var(--font-body)", fontWeight: 600,
                      fontSize: "0.6875rem", textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      background: "var(--tn-cta-gradient)",
                      color: "#08080A",
                      borderRadius: "6px", padding: "4px 10px",
                    }}>
                      Most Popular
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontWeight: 500,
                      fontSize: "2.5rem", color: "var(--tn-accent-bright)", lineHeight: 1,
                    }}>
                      $9.99
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", color: "var(--tn-text-secondary)", fontSize: "0.9375rem" }}>
                      /month
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)", color: "var(--tn-text-secondary)",
                    fontSize: "0.875rem", marginBottom: "28px",
                  }}>
                    7-day free trial
                  </div>
                  <div style={{ borderTop: "1px solid rgba(245,166,35,0.1)", paddingTop: "24px", marginBottom: "28px" }}>
                    {[
                      "Unlimited tone matches",
                      "Full settings: GAIN, BASS, MIDS, TREBLE, MASTER",
                      "Effects chain recommendations",
                      "Tone tips & explanations",
                      "Priority support",
                    ].map((f) => (
                      <div key={f} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                        <CheckIcon />
                        <span style={{ fontFamily: "var(--font-body)", color: "var(--tn-text-secondary)", fontSize: "0.9rem" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/plans" className="cta-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── S7 FOOTER — normal flow ──────────────────────── */}
      <footer style={{
        background: "#08080A",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "80px 0 40px",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(24px, 5vw, 80px)" }}>
          <div
            className="tn-foot-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "56px",
              marginBottom: "64px",
            }}
          >
            {/* Col 1 — Brand */}
            <div>
              <Link href="/" style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "1.5rem", color: "var(--tn-accent)",
                textDecoration: "none", display: "block",
                marginBottom: "14px", letterSpacing: "-0.02em",
              }}>
                Tonelify
              </Link>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.9375rem",
                lineHeight: 1.7, color: "var(--tn-text-secondary)",
                maxWidth: "280px", margin: "0 0 20px",
              }}>
                Gear-matched guitar tone settings for musicians worldwide.
              </p>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.8125rem",
                color: "var(--tn-text-secondary)", opacity: 0.5, margin: 0,
              }}>
                © 2026 Tonelify
              </p>
            </div>

            {/* Col 2 — Quick Links */}
            <div>
              <h4 style={{
                fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.6875rem", textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--tn-text-secondary)",
                margin: "0 0 20px",
              }}>
                Quick Links
              </h4>
              {([
                ["Match Tones", "/tone-match"],
                ["Collection",  "/collection"],
                ["Plans",       "/plans"],
                ["Dashboard",   "/dashboard"],
              ] as const).map(([text, href]) => (
                <div key={href} style={{ marginBottom: "12px" }}>
                  <Link href={href} style={{
                    fontFamily: "var(--font-body)", fontSize: "0.9375rem",
                    color: "var(--tn-text-primary)", textDecoration: "none", opacity: 0.65,
                  }}>
                    {text}
                  </Link>
                </div>
              ))}
            </div>

            {/* Col 3 — Support */}
            <div>
              <h4 style={{
                fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.6875rem", textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--tn-text-secondary)",
                margin: "0 0 20px",
              }}>
                Support
              </h4>
              {([
                ["Contact Us",       "mailto:contact@tonelify.com"],
                ["Privacy Policy",   "/privacy"],
                ["Terms of Service", "/terms"],
              ] as [string, string][]).map(([text, href]) => (
                <div key={href} style={{ marginBottom: "12px" }}>
                  <a href={href} style={{
                    fontFamily: "var(--font-body)", fontSize: "0.9375rem",
                    color: "var(--tn-text-primary)", textDecoration: "none", opacity: 0.65,
                  }}>
                    {text}
                  </a>
                </div>
              ))}
            </div>

            {/* Col 4 — Legal */}
            <div>
              <h4 style={{
                fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: "0.6875rem", textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--tn-text-secondary)",
                margin: "0 0 20px",
              }}>
                Legal
              </h4>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.9375rem",
                color: "var(--tn-text-secondary)", margin: 0, lineHeight: 1.65,
              }}>
                All sales final. No refunds.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}
