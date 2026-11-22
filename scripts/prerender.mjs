// Puts the server-rendered homepage HTML into dist/index.html so crawlers, link previews and AI
// tools see the real content in the first response. React then hydrates it in the browser.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const ssrDir = path.resolve('dist-ssr')
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const file = path.join(dist, 'index.html')
const html = fs.readFileSync(file, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> not found in dist/index.html')

fs.writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`))
fs.rmSync(ssrDir, { recursive: true, force: true })
console.log(`prerender: dist/index.html now contains ${(fs.statSync(file).size / 1024).toFixed(0)} KB of server-rendered HTML`)
