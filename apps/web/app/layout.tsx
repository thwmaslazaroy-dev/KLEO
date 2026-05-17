import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kleo — Θυμάμαι εγώ, εσύ απλά ζεις.',
  description: 'Ο προσωπικός βοηθός σου',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="el" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}
