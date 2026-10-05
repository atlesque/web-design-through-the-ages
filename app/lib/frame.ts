/**
 * Build-time helpers that fit an era room into the stage's monitor.
 * Pure functions with no imports, shared by the Nuxt loader (useRoom.ts) and
 * the standalone preview script (scripts/preview-eras.mjs).
 */

export interface FrameEra {
  id: string
  slug: string
  title: string
  years: string
}

export interface FrameContext {
  /** The room being framed, e.g. "03-homepages" or "01-bbs/pre-web". */
  path: string
  title: string
  years: string
  /** All eras in order. */
  eras: FrameEra[]
  cta?: { prev?: string; next?: string }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Replaces `<!-- era:stamp -->` (the era and its years, at the top of the
 * room) and `<!-- era:cta -->` (the travel buttons, in the room's main
 * content) with markup each era styles in its own era.css. A room without
 * the markers gets the stamp first and the buttons last.
 */
export function frameRoom(html: string, ctx: FrameContext) {
  const [eraSlug, sub] = ctx.path.split('/')
  const i = ctx.eras.findIndex((e) => e.slug === eraSlug)
  const era = ctx.eras[i]
  if (!era) return html

  const stamp =
    `<p class="era-stamp"><span class="era-stamp__no">Era ${era.id}/${String(ctx.eras.length).padStart(2, '0')}</span> ` +
    `<span class="era-stamp__years">${esc(ctx.years)}</span> <span class="era-stamp__title">${esc(ctx.title)}</span></p>`

  const lobby = { href: '/', title: 'All eras', years: '' }
  const as = (e: FrameEra) => ({ href: `/eras/${e.slug}/`, title: e.title, years: e.years })
  const prev = sub ? as(era) : ctx.eras[i - 1] ? as(ctx.eras[i - 1]!) : lobby
  const next = ctx.eras[i + 1] ? as(ctx.eras[i + 1]!) : lobby
  const prevLabel = ctx.cta?.prev ?? (sub ? 'Back to the era' : prev === lobby ? 'Back to the lobby' : 'Previous era')
  const nextLabel = ctx.cta?.next ?? (next === lobby ? 'Back to the lobby' : 'Next era')
  const link = (cls: 'prev' | 'next', rel: string, label: string, to: typeof lobby) =>
    `<a class="era-cta__${cls}" rel="${rel}" href="${to.href}"><span class="era-cta__label">${esc(label)}</span> ` +
    `<span class="era-cta__to">${to.years ? `${esc(to.years)} · ` : ''}${esc(to.title)}</span></a>`
  const cta =
    `<nav class="era-cta" aria-label="Travel through time">` +
    link('next', 'next', nextLabel, next) +
    ' ' +
    link('prev', 'prev', prevLabel, prev) +
    `</nav>`

  let out = html
  out = out.includes('<!-- era:stamp -->') ? out.replace('<!-- era:stamp -->', stamp) : stamp + '\n' + out
  out = out.includes('<!-- era:cta -->') ? out.replace('<!-- era:cta -->', cta) : out + '\n' + cta
  return out
}

const WIDTH_ONLY = /^\s*(?:(?:only\s+)?screen\s+and\s+)?(\((?:min-|max-)?width\s*:[^)]+\)(?:\s+and\s+\((?:min-|max-)?width\s*:[^)]+\))*)\s*$/i

/**
 * Era CSS was written for a whole browser window; inside the monitor the
 * window is the screen. Width-only media queries become container queries on
 * the screen, viewport units become container units, and scroll timelines
 * follow the screen's scroller instead of the root.
 */
export function toScreenCss(css: string) {
  return css
    .replace(/@media([^{;]+)\{/g, (m, prelude: string) => {
      const w = prelude.match(WIDTH_ONLY)
      return w ? `@container screen ${w[1]} {` : m
    })
    .replace(/(\d*\.?\d+)(?:d|s|l)?v(w|h|min|max)\b/g, '$1cq$2')
    .replace(/scroll\(\s*root\s*\)/g, 'scroll(nearest)')
}
