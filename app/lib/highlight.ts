// Build-time syntax highlighting. Imported only from server-guarded code,
// so Shiki never ships to the browser.
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-dark-dimmed.mjs')],
    langs: [import('shiki/langs/html.mjs'), import('shiki/langs/css.mjs'), import('shiki/langs/typescript.mjs')],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

export async function highlight(code: string, lang: 'html' | 'css' | 'typescript') {
  const hl = await getHighlighter()
  return hl.codeToHtml(code, { lang, theme: 'github-dark-dimmed' })
}
