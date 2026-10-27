import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { BRAND } from "@/config/brand";
import "./globals.css";

const geist = localFont({
  src: "../assets/fonts/Geist.woff2",
  variable: "--font-geist",
  display: "swap",
});

const geistMono = localFont({
  src: "../assets/fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3001"),
  title: `${BRAND.name} | From curiosity to discovery`,
  description: BRAND.tagline,
  applicationName: BRAND.name,
  openGraph: {
    title: `${BRAND.name} | From curiosity to discovery`,
    description: BRAND.tagline,
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.tagline,
  },
};

export const viewport: Viewport = { themeColor: "#f8f8f6" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Browser extensions stamp attributes on <body> before React hydrates; this ignores only that element's attributes. */}
      <body className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
