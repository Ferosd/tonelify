"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "rgba(245,166,35,0.1)",
        border: "1px solid rgba(245,166,35,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h1 style={{
        fontFamily: "'Clash Display', sans-serif",
        fontWeight: 600,
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        color: "#F2F2F7",
        letterSpacing: "-0.02em",
        marginBottom: "12px",
      }}>
        Something went wrong
      </h1>

      <p style={{
        fontFamily: "'General Sans', sans-serif",
        fontSize: "1rem",
        color: "#8E8E93",
        lineHeight: 1.6,
        maxWidth: "360px",
        marginBottom: "40px",
      }}>
        An unexpected error occurred. Please try again.
      </p>

      <button
        onClick={() => reset()}
        style={{
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
          border: "none",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  )
}
