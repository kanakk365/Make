import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Doc.AI - Create websites with AI",
  description: "Build stunning websites using AI in seconds. Transform your ideas into fully functional websites with our intelligent web development platform.",
  keywords: ["AI website builder", "doc.ai", "artificial intelligence", "web development", "website creation", "no-code"],
  authors: [{ name: "Doc.AI Team" }],
  creator: "Doc.AI",
  publisher: "Doc.AI",
  openGraph: {
    title: "Doc.AI - Create websites with AI",
    description: "Build stunning websites using AI in seconds. Transform your ideas into fully functional websites with our intelligent web development platform.",
    url: "https://doc.ai",
    siteName: "Doc.AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Doc.AI - Create websites with AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doc.AI - Create websites with AI",
    description: "Build stunning websites using AI in seconds. Transform your ideas into fully functional websites with our intelligent web development platform.",
    images: ["/og-image.png"],
    creator: "@docai",
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
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0a]`}>{children}</body>
    </html>
  )
}
