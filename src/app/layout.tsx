import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
