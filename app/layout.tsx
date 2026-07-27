import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalSiteHeader } from "@/components/ConditionalSiteHeader";
import { MobileTabBar } from "@/components/MobileTabBar";
import Script from 'next/script';
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    // Keyword first, brand last, one separator — the same shape the template
    // gives every other page, so no tab reads differently from its neighbours
    default: "Match Any Guitar Tone to Your Gear | Tonelify",
    template: "%s | Tonelify",
  },
  description:
    "Dial in legendary guitar tones for your exact amp, guitar, and pickups. Join 1,000+ guitarists getting perfect settings in seconds.",
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
    title: "Match Any Guitar Tone to Your Gear | Tonelify",
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
    title: "Match Any Guitar Tone to Your Gear | Tonelify",
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
    canonical: "/",
  },
  // Icons come from the app/ file conventions (favicon.ico, icon.png,
  // apple-icon.png) rather than being listed here. Next fingerprints the URLs it
  // emits for those, which is what finally pushed the stale default icon out of
  // browser caches — a hand-written "/favicon.ico" never changes URL.
  verification: {
    google: 'mK5vHmwQWzTryoCTW-e1lxdyjd6Cm5cjmyEqRju1eyI',
  },
};

/**
 * The page was shipping with only Next's default viewport tag, so mobile
 * browsers painted their chrome white above a #08080A page and the hero's
 * 100dvh sticky section stopped short of the notch. viewportFit: "cover" is
 * what makes the env(safe-area-inset-*) padding in the tab bar mean anything.
 *
 * maximumScale is left at 5 rather than 1: locking zoom is a WCAG 1.4.4 failure
 * and Safari ignores it anyway.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#08080A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#F5A623",
          colorBackground: "#141418",
          colorInputBackground: "#1A1A20",
          colorText: "#F2F2F7",
          colorTextSecondary: "#A6A29B",
          colorInputText: "#F2F2F7",
          colorNeutral: "#F2F2F7",
          borderRadius: "12px",
        },
        elements: {
          card: { backgroundColor: "#141418", border: "1px solid rgba(255,255,255,0.08)" },
          footer: { background: "#101014" },
        },
      }}
    >
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
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-SRFVYDD4WH" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SRFVYDD4WH');
            `}
          </Script>
          {process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID && (
            <Script id="tiktok-pixel" strategy="afterInteractive">
              {`
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                  ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');
                  ttq.page();
                }(window, document, 'ttq');
              `}
            </Script>
          )}
          {/* Sitewide entity. sameAs is deliberately absent until real profile
              URLs exist; placeholders would be worse than nothing. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  // Stable @id so the site's other blocks point at one entity
                  // instead of describing an unrelated Organization each time
                  "@id": `${SITE_URL}/#organization`,
                  name: "Tonelify",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/logo.png`,
                    width: 512,
                    height: 512,
                  },
                  email: "contact@tonelify.com",
                  description:
                    "Tone matching that adapts recorded guitar tones to the amp, guitar and pickups you already own.",
                  knowsAbout: [
                    "guitar tone",
                    "amp settings",
                    "guitar amplifiers",
                    "guitar pickups",
                    "guitar effects pedals",
                    "signal chain",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer support",
                    email: "contact@tonelify.com",
                    availableLanguage: "English",
                  },
                },
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: "Tonelify",
                  url: SITE_URL,
                  inLanguage: "en",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
              ]),
            }}
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
            <MobileTabBar />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
