import type { Metadata } from "next"
import Link from "next/link"

/**
 * A 404 that says so in its own title, and does not inherit the root layout's
 * canonical. That canonical pointed every missing URL at the homepage, which
 * is the shape of a soft 404: a page that answers "not found" while telling an
 * engine it is really the front page.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#08080A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
    }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
      `}</style>

      <div style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 700,
        fontSize: "clamp(6rem, 20vw, 10rem)",
        lineHeight: 1,
        letterSpacing: "-0.04em",
        background: "linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #E8912D 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "16px",
      }}>
        404
      </div>

      <h1 style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 600,
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        color: "#F2F2F7",
        letterSpacing: "-0.01em",
        marginBottom: "12px",
      }}>
        Page not found
      </h1>

      <p style={{
        fontFamily: "'Satoshi', sans-serif",
        fontSize: "1rem",
        color: "#8E8E93",
        lineHeight: 1.6,
        maxWidth: "360px",
        marginBottom: "40px",
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 32px",
        background: "linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #E8912D 100%)",
        color: "#08080A",
        fontFamily: "'Satoshi', sans-serif",
        fontWeight: 600,
        fontSize: "0.9375rem",
        borderRadius: "12px",
        textDecoration: "none",
      }}>
        Go Home
      </Link>
    </div>
  )
}
