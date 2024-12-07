import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Predator Dashboard',
  description: 'Strategic Predator Analytics Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  )
}
