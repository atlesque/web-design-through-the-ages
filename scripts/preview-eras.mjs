#!/usr/bin/env node
/**
 * Dependency-light preview + lint for era rooms, usable without installing Nuxt.
 *
 *   node scripts/preview-eras.mjs [filter] [--shots] [--out dir]
 *
 * For every room in app/eras (and nested rooms like 01-bbs/pre-web) it:
 *   - checks meta.ts fields, that every trait id appears as data-trait in demo.html,
 *     that every snippet region exists, and that era.css rules are scoped;
 *   - writes a standalone preview page (demo + era.css + time bar skin + era.client.ts);
 *   - with --shots, screenshots each page with Playwright (desktop + mobile).
 *
 * Needs `typescript` and (for --shots) `playwright`, resolved from the project or
 * the global node_modules.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execSync } from 'node:child_process'
import http from 'node:http'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const erasDir = join(root, 'app/eras')
const args = process.argv.slice(2)
const shots = args.includes('--shots')
const outIdx = args.indexOf('--out')
const outDir = outIdx >= 0 ? args[outIdx + 1] : join(root, '.preview')
const filter = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')

function loadModule(name) {
  const require = createRequire(join(root, 'package.json'))
  try {
    return require(name)
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim()
    return createRequire(join(globalRoot, 'noop.js'))(name)
  }
}
const ts = loadModule('typescript')
const transpile = (src) =>
  ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText

async function importTs(file) {
  const js = transpile(readFileSync(file, 'utf8')).replace(/^import type .*$/gm, '')
  const tmp = join(outDir, '_mods', file.replace(root, '').replace(/[\\/]/g, '_') + '.mjs')
  mkdirSync(dirname(tmp), { recursive: true })
  writeFileSync(tmp, js)
  return (await import(pathToFileURL(tmp).href + '?t=' + Date.now())).default
}

function rooms() {
  const list = []
  for (const d of readdirSync(erasDir, { withFileTypes: true })) {
    if (!d.isDirectory() || !/^\d\d-/.test(d.name)) continue
    list.push({ path: d.name, era: d.name })
    for (const s of readdirSync(join(erasDir, d.name), { withFileTypes: true })) {
      if (s.isDirectory() && existsSync(join(erasDir, d.name, s.name, 'demo.html'))) {
        list.push({ path: `${d.name}/${s.name}`, era: d.name })
      }
    }
  }
  return list.filter((r) => !filter || r.path.includes(filter)).sort((a, b) => a.path.localeCompare(b.path))
}

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const strip = (s) => s.split('\n').filter((l) => !/snippet:[\w-]+:(start|end)/.test(l)).join('\n')
const shellCss = read(join(root, 'app/assets/shell.css'))

/** Strip comments, then check that every top-level rule is scoped. */
function lintCss(css, id, file, problems) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  let depth = 0
  let buf = ''
  for (const ch of clean) {
    if (ch === '{') {
      if (depth === 0) {
        const sel = buf.trim()
        const ok =
          sel.startsWith(`[data-era="${id}"]`) ||
          sel.startsWith(`[data-era='${id}']`) ||
          sel.startsWith('html[data-era-page') ||
          sel.startsWith('@keyframes') ||
          sel.startsWith('@media') ||
          sel.startsWith('@supports') ||
          sel.startsWith('@container') ||
          sel.startsWith('@font-face') ||
          sel.startsWith('@property')
        if (!ok) problems.push(`${file}: unscoped top-level rule "${sel.slice(0, 60)}"`)
        if (sel.startsWith('@keyframes') && !new RegExp(`@keyframes\\s+e${id}-`).test(sel)) {
          problems.push(`${file}: keyframes should be prefixed e${id}- ("${sel}")`)
        }
      }
      depth++
      buf = ''
    } else if (ch === '}') {
      depth--
      buf = ''
    } else if (ch === ';' && depth === 0) {
      buf = ''
    } else {
      buf += ch
    }
  }
}

const problems = []
const built = []
mkdirSync(outDir, { recursive: true })

for (const room of rooms()) {
  const dir = join(erasDir, room.path)
  const id = room.era.slice(0, 2)
  const local = []
  const metaFile = join(dir, 'meta.ts')
  if (!existsSync(metaFile)) {
    problems.push(`${room.path}: missing meta.ts`)
    continue
  }
  const meta = await importTs(metaFile)
  const demo = read(join(dir, 'demo.html'))
  const css = read(join(dir, 'era.css'))
  const skin = read(join(erasDir, room.era, 'timebar.css'))
  const client = read(join(dir, 'era.client.ts'))

  const isEra = room.path === room.era
  const required = isEra
    ? ['id', 'slug', 'title', 'years', 'summary', 'context', 'traits', 'tech', 'thenVsNow', 'snippets', 'sources']
    : ['title', 'years', 'summary', 'traits', 'snippets', 'sources', 'parent']
  for (const k of required) if (meta[k] === undefined) local.push(`meta.${k} missing`)
  if (isEra && meta.slug !== room.era) local.push(`meta.slug "${meta.slug}" != folder "${room.era}"`)
  if (isEra && meta.id !== id) local.push(`meta.id "${meta.id}" != "${id}"`)
  for (const t of meta.traits ?? []) {
    if (!new RegExp(`data-trait="[^"]*\\b${t.id}\\b`).test(demo)) local.push(`trait "${t.id}" not found as data-trait in demo.html`)
  }
  for (const s of meta.snippets ?? []) {
    const src = read(join(dir, s.file))
    if (!src.includes(`snippet:${s.region}:start`) || !src.includes(`snippet:${s.region}:end`)) {
      local.push(`snippet region "${s.region}" missing in ${s.file}`)
    }
  }
  if (!demo.trim()) local.push('demo.html empty')
  if (/<(html|head|body)[\s>]/i.test(demo)) local.push('demo.html must be a fragment (no html/head/body)')
  if (/<script\b/i.test(demo)) local.push('demo.html must not contain <script>; use era.client.ts')
  if (/https?:\/\/(?!webdesign\.atlesque\.dev)[^"'\s]+\.(png|jpe?g|gif|svg|webp|woff2?|css|js)/i.test(demo + css)) {
    local.push('external asset URL found')
  }
  lintCss(css, id, `${room.path}/era.css`, local)
  if (isEra) {
    if (!skin) local.push('missing timebar.css')
    else lintCss(skin, id, `${room.path}/timebar.css`, local)
  }
  problems.push(...local.map((p) => `${room.path}: ${p}`))

  const html = `<!doctype html>
<html lang="en" data-era-page="${id}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title} preview</title>
<style>${shellCss}</style>
<style>@layer era, shell, skin;\n@layer era {\n${strip(css)}\n}</style>
<style>@layer era, shell, skin;\n@layer skin {\n${strip(skin)}\n}</style>
</head>
<body>
<div class="shell-room">
<main id="main" class="era" data-era="${id}" data-room="${room.path}">
${strip(demo)}
</main>
<nav id="timebar" class="timebar" aria-label="Time bar">
  <a class="timebar__step timebar__prev" href="#"><span aria-hidden="true">‹</span></a>
  <div class="timebar__now"><span class="timebar__years">${meta.years}</span><span class="timebar__title">${meta.title}</span></div>
  <div class="timebar__track"><ol class="timebar__notches">${Array.from({ length: 17 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0')
    return `<li><a class="timebar__notch" href="#"${n === id ? ' aria-current="page"' : ''}><span class="timebar__notch-label">${n}</span></a></li>`
  }).join('')}</ol></div>
  <div class="timebar__tools"><button class="timebar__btn" aria-pressed="false">Aa</button><button class="timebar__btn timebar__btn--curator" aria-expanded="false">Curator</button><button class="timebar__btn">?</button><a class="timebar__btn timebar__home" href="#">◰</a></div>
  <a class="timebar__step timebar__next" href="#"><span aria-hidden="true">›</span></a>
</nav>
</div>
${client ? `<script type="module">\n${transpile(client).replace(/^export default /m, 'const __setup = ')}\nconst __cleanup = __setup(document.querySelector('main.era'));\nwindow.__eraReady = true;\n</script>` : '<script>window.__eraReady = true</script>'}
</body>
</html>`
  const file = join(outDir, room.path.replace('/', '__') + '.html')
  writeFileSync(file, html)
  built.push({ room, file })
}

// Copy public demos so iframes resolve in previews.
if (existsSync(join(root, 'public/demos'))) {
  execSync(`mkdir -p "${outDir}/demos" && cp -R "${join(root, 'public/demos')}/." "${outDir}/demos/"`)
}

console.log(`Built ${built.length} preview(s) in ${outDir}`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  for (const p of problems) console.log('  - ' + p)
}

if (shots) {
  const { chromium } = loadModule('playwright')
  const server = http
    .createServer((req, res) => {
      const p = join(outDir, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'))
      if (!existsSync(p)) {
        res.writeHead(404).end()
        return
      }
      const type = p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : p.endsWith('.js') ? 'text/javascript' : p.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream'
      res.writeHead(200, { 'content-type': type }).end(readFileSync(p))
    })
    .listen(0)
  const port = server.address().port
  const browser = await chromium.launch()
  mkdirSync(join(outDir, 'shots'), { recursive: true })
  for (const { room, file } of built) {
    for (const [label, viewport] of [
      ['desktop', { width: 1280, height: 800 }],
      ['mobile', { width: 390, height: 844 }],
    ]) {
      const page = await browser.newPage({ viewport })
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      await page.goto(`http://localhost:${port}/${file.split('/').pop()}`)
      await page.waitForFunction(() => window.__eraReady === true, null, { timeout: 5000 }).catch(() => errors.push('era.client did not finish'))
      await page.waitForTimeout(1200)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (overflow > 1 && label === 'mobile' && !['04'].includes(room.era.slice(0, 2))) {
        problems.push(`${room.path}: horizontal overflow of ${overflow}px on mobile`)
      }
      const name = `${room.path.replace('/', '__')}-${label}`
      await page.screenshot({ path: join(outDir, 'shots', `${name}.png`) })
      await page.screenshot({ path: join(outDir, 'shots', `${name}-full.png`), fullPage: true })
      if (errors.length) problems.push(`${room.path} (${label}): ${errors.join(' | ')}`)
      await page.close()
    }
  }
  await browser.close()
  server.close()
  console.log(`Screenshots in ${join(outDir, 'shots')}`)
  if (problems.length) {
    console.log(`\nProblems after screenshots:`)
    for (const p of problems) console.log('  - ' + p)
  }
}
process.exitCode = problems.length ? 1 : 0
