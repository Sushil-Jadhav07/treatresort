// Validates the built dist/index.html: JSON-LD parses and has the right shape, head tags are present.
//   npm run build && node tests/verify-seo.mjs [dist-folder]
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve(process.argv[2] || 'dist')
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const results = []
const check = (name, ok, detail = '') => {
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`)
}

const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
check('exactly one JSON-LD block', blocks.length === 1, `${blocks.length} found`)
let ld = null
try {
  ld = JSON.parse(blocks[0])
  check('JSON-LD parses (JSON.parse)', true)
} catch (e) {
  check('JSON-LD parses (JSON.parse)', false, e.message)
}
if (ld) {
  const g = ld['@graph'] || []
  const orgs = g.filter((n) => n['@type'] === 'Organization')
  const lodging = g.filter((n) => n['@type'] === 'LodgingBusiness')
  check('@context is schema.org', ld['@context'] === 'https://schema.org')
  check('one Organization with name, url, telephone, email, sameAs', orgs.length === 1 && orgs[0].name && orgs[0].url && orgs[0].telephone && orgs[0].email && orgs[0].sameAs?.length === 3, JSON.stringify({ phone: orgs[0]?.telephone, sameAs: orgs[0]?.sameAs?.length }))
  check('one LodgingBusiness per OPEN property (11)', lodging.length === 11, `${lodging.length} found`)
  check('every LodgingBusiness has name + address.addressLocality', lodging.every((n) => n.name && n.address?.addressLocality))
  const banned = ['aggregateRating', 'review', 'priceRange', 'streetAddress', 'postalCode', 'geo']
  const text = JSON.stringify(ld)
  check('no invented fields (ratings, prices, street address, geo)', banned.every((k) => !text.includes(`"${k}"`)))
  check('Rajkot ("Opening soon") is not listed as open', !lodging.some((n) => /Rajkot/.test(n.name)))
  console.log('      open properties:', lodging.map((n) => `${n.name} [${n.address.addressLocality}${n.address.addressRegion ? ', ' + n.address.addressRegion : ''}]`).join(' | '))
}
check('canonical link', /<link rel="canonical" href="https?:\/\/[^"]+\/" \/>/.test(html))
check('robots meta', /<meta name="robots" content="(index,follow|noindex,nofollow)[^"]*" \/>/.test(html), (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1])
check('Open Graph: title, description, url, image, type', ['og:title', 'og:description', 'og:url', 'og:image', 'og:type'].every((p) => html.includes(`property="${p}"`)))
check('Twitter card: summary_large_image + image', html.includes('name="twitter:card" content="summary_large_image"') && html.includes('name="twitter:image"'))
check('pre-rendered: one <h1> with the headline in the HTML', (html.match(/<h1\b/g) || []).length === 1 && /tradition of service/i.test(html))
check('pre-rendered: intro text + property names present', /Redefining hospitality/i.test(html) && /Treat Resort, Silvassa/.test(html))
check('no href="#" alone', !/href="#"/.test(html))
const failed = results.filter((x) => !x).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
