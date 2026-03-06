import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Tokvista',
  description: 'Interactive design tokens documentation demo',
  icons: {
    icon: [
      { url: '/brand/tokvista-mark-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/brand/tokvista-mark-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/brand/tokvista-mark-dark.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/brand/tokvista-mark-dark.svg',
    apple: '/brand/tokvista-mark-light.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="tokvista-theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const saved = window.localStorage.getItem('ftd-theme-mode')
              const mode = saved === 'light' || saved === 'dark' ? saved : 'dark'
              document.documentElement.setAttribute('data-theme', mode)
            } catch {
              document.documentElement.setAttribute('data-theme', 'dark')
            }
          })()`}
        </Script>
        {children}
      </body>
    </html>
  )
}
