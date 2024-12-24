import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Estate Command Center',
  description: 'Real Estate Team Command Center Dashboard',
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