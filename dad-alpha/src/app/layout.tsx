import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = "https://dad.alphaspeedai.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alpha.Dad — AI Family Co-Pilot",
    template: "%s | Alpha.Dad",
  },
  description:
    "Your AI co-pilot for family logistics. Stay in sync with your partner, manage schedules, track expenses, and never miss a school event.",
  keywords: [
    "AI family assistant",
    "dad productivity",
    "family calendar",
    "expense tracker",
    "partner sync",
    "family organizer",
    "co-parenting app",
    "alpha dad",
  ],
  authors: [{ name: "AlphaSpeed AI" }],
  creator: "AlphaSpeed AI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Alpha.Dad",
    title: "Alpha.Dad — AI Family Co-Pilot",
    description:
      "Your AI co-pilot for family logistics. Stay in sync, stay ahead.",
    url: siteUrl,
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 630, alt: "Alpha.Dad — AI Family Co-Pilot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha.Dad — AI Family Co-Pilot",
    description: "Your AI co-pilot for family logistics. Stay in sync, stay ahead.",
    images: ["/brand/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00CCFF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable} steady-strong`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
