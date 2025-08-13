import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { StartupValidation, ValidationStatus } from '@/components/startup-validation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'CentomoMD V2 - Medical Documentation Platform',
    template: '%s | CentomoMD V2'
  },
  description: 'Professional medical documentation platform for healthcare providers in Quebec. Secure, compliant, and efficient patient record management.',
  keywords: ['medical documentation', 'healthcare', 'patient records', 'Quebec healthcare', 'medical software'],
  authors: [{ name: 'CentomoMD Team' }],
  creator: 'CentomoMD',
  publisher: 'CentomoMD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'CentomoMD V2 - Medical Documentation Platform',
    description: 'Professional medical documentation platform for healthcare providers in Quebec.',
    siteName: 'CentomoMD V2',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CentomoMD V2 - Medical Documentation Platform',
    description: 'Professional medical documentation platform for healthcare providers in Quebec.',
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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0066CC" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
                   <body className={`${inter.variable} font-sans antialiased`}>
               <Providers>
                 <StartupValidation />
                 <div className="min-h-screen bg-background">
                   {children}
                 </div>
                 <Toaster />
                 <ValidationStatus />
               </Providers>
             </body>
    </html>
  )
}
