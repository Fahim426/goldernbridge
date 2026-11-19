import type { NextConfig } from 'next'

const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/webp'], deviceSizes: [390, 640, 768, 1024, 1440, 1920], qualities: [75, 85] },
  experimental: { serverActions: { bodySizeLimit: '64kb' } },
  async headers() {
    const confidential = [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ]
    return [
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ] },
      { source: '/admin/:path*', headers: confidential },
      { source: '/api/:path*', headers: confidential },
    ]
  },
}
export default config
