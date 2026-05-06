// lib/seo.js — Centralized SEO metadata factory
// Dùng cho tất cả các page trong app/

const SITE = {
  name:        'Sip & Brew',
  url:         process.env.NEXT_PUBLIC_SITE_URL || 'https://sipandbrew.vn',
  description: 'Thức uống thượng hạng từ nguyên liệu tự nhiên — Trà sữa, Cà phê, Nước ép tươi. Giao hàng 30 phút nội thành.',
  locale:      'vi_VN',
  twitterHandle: '@sipandbrew',
};

/**
 * buildMetadata(overrides)
 * Tạo object metadata cho Next.js App Router
 *
 * @param {object} overrides - Ghi đè title, description, image, url, noindex
 * @returns {import('next').Metadata}
 */
export function buildMetadata({
  title,
  description,
  image,
  url,
  noindex = false,
  type    = 'website',
  keywords = [],
} = {}) {
  const resolvedTitle = title
    ? `${title} — ${SITE.name}`
    : `${SITE.name} — Thức Uống Thượng Hạng`;
  const resolvedDesc  = description || SITE.description;
  const resolvedUrl   = url ? `${SITE.url}${url}` : SITE.url;
  const resolvedImage = image || `${SITE.url}/og-default.jpg`;

  return {
    // ── Basic ────────────────────────────────────────────────────────
    title:       resolvedTitle,
    description: resolvedDesc,
    keywords:    ['sip and brew', 'trà sữa', 'cà phê', 'nước ép', 'thức uống', 'beverage', 'giao hàng nhanh', ...keywords],
    authors:     [{ name: SITE.name, url: SITE.url }],
    creator:     SITE.name,
    publisher:   SITE.name,

    // ── Canonical URL ────────────────────────────────────────────────
    alternates: { canonical: resolvedUrl },

    // ── Robots ──────────────────────────────────────────────────────
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },

    // ── Open Graph ───────────────────────────────────────────────────
    openGraph: {
      title:       resolvedTitle,
      description: resolvedDesc,
      url:         resolvedUrl,
      siteName:    SITE.name,
      locale:      SITE.locale,
      type,
      images: [{
        url:    resolvedImage,
        width:  1200,
        height: 630,
        alt:    resolvedTitle,
      }],
    },

    // ── Twitter Card ─────────────────────────────────────────────────
    twitter: {
      card:        'summary_large_image',
      site:        SITE.twitterHandle,
      creator:     SITE.twitterHandle,
      title:       resolvedTitle,
      description: resolvedDesc,
      images:      [resolvedImage],
    },

    // ── Icons ────────────────────────────────────────────────────────
    icons: {
      icon:        '/favicon.ico',
      shortcut:    '/favicon-16x16.png',
      apple:       '/apple-touch-icon.png',
    },

    // ── Verification (điền khi có) ───────────────────────────────────
    // verification: {
    //   google: 'your-google-verification-code',
    // },
  };
}

// ── JSON-LD structured data builders ─────────────────────────────────────────

/** Schema.org LocalBusiness */
export const localBusinessSchema = {
  '@context':       'https://schema.org',
  '@type':          'FoodEstablishment',
  name:             SITE.name,
  description:      SITE.description,
  url:              SITE.url,
  logo:             `${SITE.url}/logo.png`,
  image:            `${SITE.url}/og-default.jpg`,
  priceRange:       '₫₫',
  servesCuisine:    ['Beverage', 'Bubble Tea', 'Coffee'],
  currenciesAccepted: 'VND',
  paymentAccepted:  'Cash, Bank Transfer, MoMo',
  openingHours:     'Mo-Su 07:00-22:00',
  telephone:        '+84-xxx-xxx-xxxx',
  address: {
    '@type':           'PostalAddress',
    addressLocality:   'Hồ Chí Minh',
    addressRegion:     'TP. HCM',
    addressCountry:    'VN',
  },
  sameAs: [
    'https://www.facebook.com/sipandbrew',
    'https://www.instagram.com/sipandbrew',
  ],
};

/** Schema.org Product — dùng cho trang chi tiết sản phẩm */
export function buildProductSchema(product) {
  return {
    '@context':   'https://schema.org',
    '@type':      'Product',
    name:         product.name,
    description:  product.description || '',
    image:        product.imageURL || '',
    category:     product.category,
    offers: {
      '@type':        'Offer',
      priceCurrency:  'VND',
      price:          product.price,
      availability:   product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  };
}

/** Schema.org WebSite với SearchAction */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  name:       SITE.name,
  url:        SITE.url,
  potentialAction: {
    '@type':       'SearchAction',
    target:        { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export { SITE };
