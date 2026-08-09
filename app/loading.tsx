export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#08080A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
    }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
        @keyframes tn-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #F5A623 0%, #FF6B35 100%)",
        animation: "tn-pulse 1.4s ease-in-out infinite",
      }} />

      <div style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 700,
        fontSize: "1.5rem",
        color: "#F5A623",
        letterSpacing: "-0.01em",
      }}>
        Tonelify
      </div>

      <div style={{
        fontFamily: "'Satoshi', sans-serif",
        fontSize: "0.875rem",
        color: "#8E8E93",
      }}>
        Loading&hellip;
      </div>
    </div>
  )
}
