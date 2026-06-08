import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Outfit, Space_Mono } from "next/font/google";
import { SiteHeader } from "@/components/home/SiteHeader";
import { Footer } from "@/components/home/Footer";
import { ChartProvider } from "@/lib/chart/ChartProvider";
import { SITE } from "@/lib/site";
import "./globals.css";

/* Self-hosted via next/font — no cross-origin font requests, which keeps
   the later COOP/COEP cross-origin isolation (for the WASM engine) safe.
   Each font is exposed as the CSS variable the design tokens reference. */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.liveUrl),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description:
    "A client-side study tool and interactive birth-chart generator for Vedic astrology (Jyotish).",
  applicationName: SITE.name,
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    url: SITE.liveUrl,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.tagline,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${bodyFont.variable} ${mono.variable}`}>
        <ChartProvider>
          <SiteHeader />
          {children}
          <Footer />
        </ChartProvider>
      </body>
    </html>
  );
}
