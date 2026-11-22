import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { brand, footer, locations, properties } from './src/data/content.js'

/**
 * SEO plugin: everything that depends on the site URL is generated at build time from SITE_URL
 * (default https://treatresorts.com/). A SITE_URL on asynk.in is treated as STAGING:
 * noindex + robots.txt "Disallow: /". Production gets index,follow + a sitemap-aware robots.txt.
 */
function seoPlugin(env, isBuild) {
  const site = (env.SITE_URL || 'https://treatresorts.com/').replace(/\/?$/, '/')
  const staging = /asynk\.in/i.test(site) || !isBuild
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

  const title = 'Treat Hotels & Resorts | Luxury Stays, Weddings & Corporate Getaways in India'
  const desc =
    'Book direct at Treat Hotels & Resorts: 13 hotels and resorts across India for luxury stays, destination weddings, corporate events and fine dining. 40+ years of hospitality.'
  const image = `${site}og-image.jpg`

  // --- JSON-LD: only data that exists in src/data/content.js (no ratings, prices or street addresses)
  const statusByName = Object.fromEntries(properties.map((p) => [p.name, p.status]))
  const open = locations.filter((l) => !(l.name in statusByName) || statusByName[l.name] === 'open')
  const lodging = open.map((l) => {
    const [town, region] = l.place.split(',').map((x) => x.trim())
    const address = { '@type': 'PostalAddress', addressLocality: town, addressCountry: 'IN' }
    if (region && region.length > 3) address.addressRegion = region // skip abbreviations such as "UT" / "MH"
    return { '@type': 'LodgingBusiness', name: l.name, address, parentOrganization: { '@id': `${site}#organization` } }
  })
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site}#organization`,
        name: 'Treat Hotels & Resorts',
        url: site,
        logo: `${site}images/logo-navy.png`,
        telephone: brand.phone,
        email: brand.email,
        sameAs: footer.social.map((s) => s.href),
      },
      ...lodging,
    ],
  }

  const head = [
    `<link rel="canonical" href="${site}" />`,
    staging
      ? '<meta name="robots" content="noindex,nofollow" />'
      : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Treat Hotels &amp; Resorts" />',
    '<meta property="og:locale" content="en_IN" />',
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${site}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')

  return {
    name: 'treat-seo',
    transformIndexHtml(html) {
      return html.replace('<!--seo-head-->', head)
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: staging ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${site}sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), seoPlugin(env, command === 'build')],
    server: {
      // local development: forward the enquiry endpoint to a dev server (see docs/DEPLOY.md)
      proxy: { '/api': { target: env.DEV_API_TARGET || 'http://localhost:8787', changeOrigin: true } },
    },
  }
})
