import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL?.replace(/\/$/, '')
  return base ? [{ url: base + '/' }, { url: base + '/privacy' }] : []
}
