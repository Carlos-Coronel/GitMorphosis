import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AnalyticsWrapper } from '@/components/analytics-wrapper'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'GitHub Profile Generator | Auto-generate stunning README profiles',
  description: 'Generate professional GitHub README profiles automatically using web scraping. No API key required. Multiple templates available.',
  keywords: ['GitHub', 'README', 'profile', 'generator', 'developer', 'portfolio'],
  authors: [{ name: 'GitHub Profile Generator' }],
  openGraph: {
    title: 'GitHub Profile Generator',
    description: 'Generate professional GitHub README profiles automatically',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Profile Generator',
    description: 'Generate professional GitHub README profiles automatically',
  },
  icons: {
    icon: [
      {
        url: 'icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: 'apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
