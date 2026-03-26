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

export const metadata: Metadata = {
  title: {
    default: "Dad.alpha — AI Family Co-Pilot",
    template: "%s | Dad.alpha",
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
  ],
  authors: [{ name: "AlphaSpeed AI" }],
  creator: "AlphaSpeed AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dad.alpha",
    title: "Dad.alpha — AI Family Co-Pilot",
    description:
      "Your AI co-pilot for family logistics. Stay in sync, stay ahead.",
    url: "https://dad.alphaspeedai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dad.alpha — AI Family Co-Pilot",
    description: "Your AI co-pilot for family logistics. Stay in sync, stay ahead.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
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
