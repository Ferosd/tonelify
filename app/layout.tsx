import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalSiteHeader } from "@/components/ConditionalSiteHeader";

export const metadata: Metadata = {
  title: {
    default: "Tonelify — Match Any Guitar Tone to Your Gear",
    template: "%s | Tonelify",
  },
  description:
    "Dial in legendary guitar tones for your exact amp, guitar, and pickups. Join 35,000+ guitarists getting perfect settings in seconds.",
  keywords: [
    "guitar tone",
    "tone matching",
    "amp settings",
    "guitar AI",
    "guitar tone settings",
    "tone adapt",
    "guitar gear",
    "amp configuration",
    "pickup settings",
    "guitar effects",
  ],
  authors: [{ name: "Tonelify" }],
  creator: "Tonelify",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tonelify.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tonelify",
    title: "Tonelify — Match Any Guitar Tone to Your Gear",
    description:
      "Dial in legendary guitar tones for your exact amp, guitar, and pickups.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tonelify - Guitar Tone Matching",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tonelify — Match Any Guitar Tone",
    description:
      "Dial in legendary tones for your specific gear. Perfect settings in seconds.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://tonelify.com",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://api.fontshare.com" />
          <link
            href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&f[]=general-sans@400,500,600&display=swap"
            rel="stylesheet"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@700&family=Inter+Tight:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ConditionalSiteHeader />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
