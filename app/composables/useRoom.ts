import type { EraMeta, EraSnippet, RoomMeta } from '~/eras/types'
import { frameRoom, toScreenCss } from '~/lib/frame'
import { eras } from './useEras'

export interface RoomSnippet {
  caption: string
  file: string
  html: string
}

export interface RoomPayload {
  /** e.g. "01-bbs" or "01-bbs/pre-web" */
  path: string
  meta: EraMeta | RoomMeta
  html: string
  css: string
  snippets: RoomSnippet[]
}

const MARKER = /snippet:[\w-]+:(start|end)/

/** Pull the lines between `snippet:<region>:start` and `snippet:<region>:end`. */
export function extractRegion(source: string, region: string) {
  const lines = source.split('\n')
  const start = lines.findIndex((l) => l.includes(`snippet:${region}:start`))
  const end = lines.findIndex((l, i) => i > start && l.includes(`snippet:${region}:end`))
  if (start < 0 || end < 0) return `/* snippet "${region}" not found */`
  // The stage's era:stamp / era:cta slots are filled at build time, so they don't belong in the code panel.
  const body = lines.slice(start + 1, end).filter((l) => !MARKER.test(l) && !/<!--\s*era:(stamp|cta)\s*-->/.test(l))
  const indent = Math.min(...body.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length))
  return body.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n')
}

function stripMarkers(source: string) {
  return source
    .split('\n')
    .filter((l) => !MARKER.test(l))
    .join('\n')
}

/**
 * Loads an era room's markup, styles and highlighted snippets.
 * Runs only during prerender: the result is serialised into the page payload,
 * so neither the raw sources nor the highlighter ship to the browser.
 */
export async function loadRoom(path: string): Promise<RoomPayload> {
  if (import.meta.server) {
    const raw = import.meta.glob<string>(
      ['../eras/**/*.html', '../eras/**/*.css', '../eras/**/era.client.ts'],
      { query: '?raw', import: 'default' },
    )
    const metas = import.meta.glob<EraMeta | RoomMeta>('../eras/**/meta.ts', { import: 'default' })

    const read = async (file: string) => {
      const loader = raw[`../eras/${path}/${file}`]
      return loader ? await loader() : ''
    }
    const metaLoader = metas[`../eras/${path}/meta.ts`]
    if (!metaLoader) throw createError({ statusCode: 404, statusMessage: `Unknown room ${path}` })
    const meta = await metaLoader()

    const { highlight } = await import('../lib/highlight')
    const snippets: RoomSnippet[] = []
    for (const s of meta.snippets as EraSnippet[]) {
      const source = await read(s.file)
      snippets.push({ caption: s.caption, file: s.file, html: await highlight(extractRegion(source, s.region), s.lang) })
    }

    return {
      path,
      meta,
      html: frameRoom(stripMarkers(await read('demo.html')), {
        path,
        title: meta.title,
        years: meta.years,
        eras,
        cta: meta.cta,
      }),
      css: `@layer era, shell;\n@layer era {\n${toScreenCss(stripMarkers(await read('era.css')))}\n}`,
      snippets,
    }
  }
  throw createError({ statusCode: 500, statusMessage: 'Rooms are only loaded at build time' })
}

/** Lazy per-era behaviour modules (one chunk per era). */
const clientModules = import.meta.glob<{ default: (root: HTMLElement) => void | (() => void) }>(
  '../eras/**/era.client.ts',
)

export async function mountRoomBehaviour(path: string, root: HTMLElement) {
  const loader = clientModules[`../eras/${path}/era.client.ts`]
  if (!loader) return undefined
  const mod = await loader()
  return mod.default(root) || undefined
}
