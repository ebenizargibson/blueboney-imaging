import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Blue Boney Imaging',
  description: 'Imaging & Radiology Workspace for Blue Boney Health — order management, scheduling, reporting, and quality assurance.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Blue Boney Imaging',
    description: 'Secure imaging staff portal.',
    siteName: 'Blue Boney Imaging',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A5F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><ErrorBoundary>{children}</ErrorBoundary></body>
    </html>
  )
}
