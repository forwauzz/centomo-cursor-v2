import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CentomoMD - Medical Documentation Platform",
  description: "Professional medical documentation platform for CNESST reports with AI-powered voice recording and Quebec healthcare compliance.",
  keywords: "medical documentation, CNESST, healthcare, Quebec, voice recording, AI, medical reports",
  authors: [{ name: "CentomoMD Team" }],
  creator: "CentomoMD",
  publisher: "CentomoMD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5002"),
  openGraph: {
    title: "CentomoMD - Medical Documentation Platform",
    description: "Professional medical documentation platform for CNESST reports",
    url: "/",
    siteName: "CentomoMD",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CentomoMD - Medical Documentation Platform",
    description: "Professional medical documentation platform for CNESST reports",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0066CC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CentomoMD" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Manifest temporarily disabled due to Next.js routing issues */}
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
