import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')
const title = 'Liora on Dubai Islands | Golden Bridge'
const description = 'Explore Liora by Jaiedco on Dubai Islands. View the residences, architecture and amenities, then register your interest with Golden Bridge.'

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  icons: { icon: '/brand/mark.png' },
  title: { default: title, template: '%s | Golden Bridge' },
  description,
  ...(siteUrl ? {
    openGraph: { title, description, url: siteUrl, type: 'website', images: [{ url: '/images/liora-social.jpg', width: 1200, height: 630, alt: 'Liora residences on Dubai Islands' }] },
  } : { openGraph: { title, description, type: 'website' } }),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
