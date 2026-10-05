#!/usr/bin/env node
// Fails if the build exceeds the Cloudflare Pages free-tier budget set in the spec.
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'

const out = join(process.cwd(), '.output/public')
const MAX_FILES = 2000
const MAX_FILE = 2 * 1024 * 1024
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]))
const files = walk(out)
const problems = []
if (files.length > MAX_FILES) problems.push(`${files.length} files (max ${MAX_FILES})`)
for (const f of files) if (statSync(f).size > MAX_FILE) problems.push(`${relative(out, f)} is over 2 MiB`)

const kb = (n) => (n / 1024).toFixed(1) + ' KB'
const js = files.filter((f) => f.endsWith('.js'))
const totalJs = js.reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0)
console.log(`files: ${files.length}, total JS (gzip): ${kb(totalJs)}`)
for (const f of files.filter((f) => f.endsWith('index.html'))) {
  const gz = gzipSync(readFileSync(f)).length
  const flag = gz > 60 * 1024 ? '  <-- over 60 KB budget' : ''
  if (flag) problems.push(`${relative(out, f)} HTML ${kb(gz)} gzip`)
  console.log(`${relative(out, f).padEnd(48)} ${kb(gz)}${flag}`)
}
if (problems.length) {
  console.error('\nBudget problems:\n  - ' + problems.join('\n  - '))
  process.exit(1)
}
