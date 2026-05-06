// app/robots.js — Next.js App Router robots.txt generator
// Tự động generate /robots.txt

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sipandbrew.vn';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  ['/admin', '/api/', '/order-success', '/checkout'],
      },
      {
        userAgent: 'Googlebot',
        allow:     '/',
        disallow:  ['/admin', '/api/'],
      },
    ],
    sitemap:    `${SITE_URL}/sitemap.xml`,
    host:        SITE_URL,
  };
}
