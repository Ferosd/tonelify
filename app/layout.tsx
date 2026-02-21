import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "Tonelify — Match Any Guitar Tone to Your Gear",
    template: "%s | Tonelify",
  },
  description:
    "AI-powered tone matching that adapts legendary guitar tones to your specific amp, guitar, and pickups. Join 35,000+ guitarists getting perfect settings in seconds.",
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
      "AI-powered tone matching that adapts legendary guitar tones to your specific amp, guitar, and pickups.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tonelify - AI Guitar Tone Matching",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tonelify — Match Any Guitar Tone",
    description:
      "AI-powered tone matching for your specific gear. Get perfect amp settings in seconds.",
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
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SiteHeader />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
