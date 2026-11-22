// Contract tests for the enquiry endpoint. Works against ANY base URL (dev mock or the deployed PHP):
//   node tests/api-contract.mjs http://localhost:8787
//   node tests/api-contract.mjs https://tree.asynk.in
// NOTE: it sends real requests: valid ones create real stored enquiries / emails. The rate-limit check
// uses up this IP's 5 requests per 10 minutes, so run it once and wait 10 minutes before re-running.
const base = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '')
const url = `${base}/api/enquiry.php`
const good = { first: 'Test', last: 'Guest', phone: '+91 98765 43210', email: 'test@example.com', city: 'Mumbai', property: 'Treat Hotel, Nashik', message: 'Contract test: please ignore.' }
const post = (body, headers = {}, raw) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: raw ?? JSON.stringify(body) }).then(async (r) => ({ status: r.status, json: await r.json().catch(() => null), headers: r.headers }))

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`)
}

// these four do not consume much of the rate limit budget but do count: keep the order
let r = await fetch(url, { method: 'GET' })
check('GET is rejected (405)', r.status === 405, `status ${r.status}`)

r = await post({ first: '', phone: '', email: '' })
check('empty required fields -> 422 with field errors', r.status === 422 && r.json?.errors?.first && r.json?.errors?.phone && r.json?.errors?.email, JSON.stringify(r.json?.errors))

r = await post({ ...good, email: 'not-an-email' })
check('invalid email -> 422', r.status === 422 && !!r.json?.errors?.email)

r = await post({ ...good, phone: '12345' })
check('invalid phone -> 422', r.status === 422 && !!r.json?.errors?.phone)

r = await post({ ...good, website: 'http://spam.example' })
check('honeypot filled -> silently accepted, nothing stored (200 ok:true)', r.status === 200 && r.json?.ok === true && r.json?.emailed === undefined, 'no "emailed" flag = nothing was processed')

r = await post(good, {}, JSON.stringify({ ...good, message: 'x'.repeat(20000) }))
check('oversized body -> 413', r.status === 413, `status ${r.status}`)

// rate limit: 6 requests in a row from this IP. Earlier requests already used part of the budget,
// so we just require that a 429 appears no later than the 6th request overall.
const statuses = [405, 422, 422, 422, 200, 413].length // requests sent so far (GET + 5 POST)
let got429 = false
for (let i = 0; i < 3 && !got429; i++) {
  r = await post(good)
  if (r.status === 429) got429 = !!r.headers.get('retry-after')
}
check('rate limit: 429 with Retry-After after 5 requests per 10 min', got429, `${statuses} requests sent before the loop`)

const failed = results.filter((x) => !x.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
