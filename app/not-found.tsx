import Link from "next/link"

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
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@700,600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=General+Sans:wght@400;500;600&display=swap');
      `}</style>

      <div style={{
        fontFamily: "'Clash Display', sans-serif",
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
        fontFamily: "'Clash Display', sans-serif",
        fontWeight: 600,
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        color: "#F2F2F7",
        letterSpacing: "-0.02em",
        marginBottom: "12px",
      }}>
        Page not found
      </h1>

      <p style={{
        fontFamily: "'General Sans', sans-serif",
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
        fontFamily: "'General Sans', sans-serif",
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
