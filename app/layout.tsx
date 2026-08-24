import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitMorphosis | Generador autocontenido de perfiles GitHub',
  description: 'Crea un README profesional para tu perfil con la API oficial de GitHub y gráficos SVG locales. Sin backend ni servicios de tarjetas externos.',
  keywords: ['GitHub', 'README', 'profile', 'generator', 'developer', 'portfolio'],
  authors: [{ name: 'GitMorphosis' }],
  openGraph: {
    title: 'GitMorphosis',
    description: 'Generador autocontenido de README para perfiles de GitHub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitMorphosis',
    description: 'Generador autocontenido de README para perfiles de GitHub',
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
