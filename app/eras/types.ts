export interface EraSnippet {
  /** File inside the era folder, e.g. "demo.html" or "era.css". */
  file: string
  lang: 'html' | 'css' | 'typescript'
  /** Short caption shown above the code. */
  caption: string
  /**
   * Name of the marked region inside the file. The region is delimited by
   * `snippet:<name>:start` and `snippet:<name>:end` comments.
   */
  region: string
}

export interface EraMeta {
  /** Two-digit order, e.g. "01". */
  id: string
  /** Folder name and URL segment, e.g. "01-bbs". */
  slug: string
  title: string
  /** Short label used in the time bar, e.g. "1978–95". */
  years: string
  /** One-sentence summary for the index and meta description. */
  summary: string
  context: {
    screens: string
    connection: string
    browsers: string
  }
  /** Signature traits; `id` matches `data-trait` attributes in demo.html. */
  traits: { id: string; label: string }[]
  /** Techniques and technologies that made the look possible. */
  tech: string[]
  /** One line on what replaced the technique. */
  thenVsNow: string
  snippets: EraSnippet[]
  sources: { label: string; url: string }[]
  /** Optional extra rooms inside the era, e.g. the pre-web room in era 1. */
  rooms?: { path: string; label: string }[]
  /** Notes about effects recreated with modern tech because the original is dead. */
  recreated?: string[]
  /** Wording for the travel buttons, in the voice of the era (e.g. "ENTER SITE »"). */
  cta?: { prev?: string; next?: string }
}

export type RoomMeta = Pick<EraMeta, 'title' | 'years' | 'summary' | 'traits' | 'snippets' | 'sources'> & {
  parent: string
  context?: EraMeta['context']
  tech?: string[]
  thenVsNow?: string
  cta?: EraMeta['cta']
}
