import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tokvista Demo',
  description: 'Interactive design tokens documentation demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
