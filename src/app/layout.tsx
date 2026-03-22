import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MockHero — Synthetic Test Data API",
  description:
    "Generate realistic, relational test data with 150+ field types. JSON, CSV, and SQL output. Free tier available.",
  metadataBase: new URL("https://mockhero.dev"),
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "MockHero — Synthetic Test Data API",
    description:
      "Generate realistic, relational test data with 150+ field types. JSON, CSV, and SQL output. Free tier available.",
    url: "https://mockhero.dev",
    siteName: "MockHero",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MockHero — Synthetic Test Data API" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MockHero — Synthetic Test Data API",
    description:
      "Generate realistic, relational test data with 150+ field types. JSON, CSV, and SQL output. Free tier available.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable
      )}
    >
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-W46D3W37"
        />
        <Script
          id="gtm-init"
          strategy="afterInteractive"
        >{`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}</Script>
      </head>
      <body className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W46D3W37"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
