#!/usr/bin/env node
/**
 * Runs after `nuxt generate`. Writes into .output/public:
 *   - _headers: security headers, caching, and a per-page Content-Security-Policy
 *     whose script-src lists the SHA-256 of every inline script (Nuxt's boot script)
 *     and inline event handler (era 04's period rollovers) on that page.
 *   - sitemap.xml
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const SITE = 'https://webdesign.atlesque.dev'
const out = join(process.cwd(), '.output/public')
if (!existsSync(out)) {
  console.error('postgenerate: .output/public not found; run nuxt generate first')
  process.exit(1)
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`
const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const DATA_TYPES = /type\s*=\s*["']?(application\/(ld\+)?json|text\/template)/i

function policyFor(html) {
  const scripts = new Set()
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attrs, body] = m
    if (/\bsrc\s*=/.test(attrs) || DATA_TYPES.test(attrs) || !body.trim()) continue
    scripts.add(sha(body))
  }
  const handlers = new Set()
  for (const m of html.matchAll(/\son[a-z]+\s*=\s*"([^"]*)"/gi)) handlers.add(sha(decode(m[1])))
  for (const m of html.matchAll(/\son[a-z]+\s*=\s*'([^']*)'/gi)) handlers.add(sha(decode(m[1])))

  const scriptSrc = ["'self'", ...scripts, ...(handlers.size ? ["'unsafe-hashes'", ...handlers] : [])]
  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ')
}

const htmlFiles = walk(out).filter((f) => f.endsWith('.html'))
const rules = []
const pages = []
for (const file of htmlFiles) {
  const rel = '/' + relative(out, file).split(sep).join('/')
  const csp = policyFor(readFileSync(file, 'utf8'))
  if (csp.length > 2000) throw new Error(`CSP for ${rel} exceeds 2,000 characters`)
  const paths = rel.endsWith('/index.html')
    ? [rel.slice(0, -'index.html'.length)]
    : [rel, rel.slice(0, -'.html'.length)]
  for (const p of paths) rules.push(`${p}\n  Content-Security-Policy: ${csp}`)
  if (rel.endsWith('/index.html') && !rel.startsWith('/demos/')) pages.push(paths[0])
}

const base = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: SAMEORIGIN

/_nuxt/*
  Cache-Control: public, max-age=31536000, immutable

https://:project.pages.dev/*
  X-Robots-Tag: noindex`

const headers = [base, ...rules].join('\n\n') + '\n'
const ruleCount = headers.split('\n').filter((l) => l && !l.startsWith(' ')).length
if (ruleCount > 100) throw new Error(`_headers has ${ruleCount} rules; Cloudflare Pages allows 100`)
writeFileSync(join(out, '_headers'), headers)

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .sort()
  .map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`
writeFileSync(join(out, 'sitemap.xml'), sitemap)

console.log(`postgenerate: ${ruleCount} header rules for ${htmlFiles.length} HTML files; sitemap with ${pages.length} pages`)
