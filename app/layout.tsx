import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitHub Profile Generator | Auto-generate stunning README profiles',
  description: 'Generate professional GitHub README profiles automatically using the official GitHub API. No API key required. Multiple templates available.',
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
    <html lang="es" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
