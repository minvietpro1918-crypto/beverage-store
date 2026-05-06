// app/sitemap.js — Next.js App Router dynamic sitemap
// Tự động generate /sitemap.xml khi build hoặc request

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sipandbrew.vn';
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api';

export default async function sitemap() {
  // ── Static pages ────────────────────────────────────────────────────────
  const staticPages = [
    { url: SITE_URL,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/login`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/register`,lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/search`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/checkout`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // ── Dynamic product pages ───────────────────────────────────────────────
  let productPages = [];
  try {
    const res      = await fetch(`${API_URL}/products?limit=200`, { next: { revalidate: 3600 } });
    const data     = await res.json();
    const products = data.products || [];

    productPages = products.map((p) => ({
      url:             `${SITE_URL}/products/${p._id}`,
      lastModified:    new Date(p.updatedAt || p.createdAt),
      changeFrequency: 'weekly',
      priority:        0.8,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch products', err.message);
  }

  return [...staticPages, ...productPages];
}
