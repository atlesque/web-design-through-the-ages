// Era 02: a tiny browser. History, visited links, a slow page load and View Source.

export default function setup(root: HTMLElement) {
  const doc = root.querySelector<HTMLElement>('#rcl-doc')!
  const pages = Array.from(doc.querySelectorAll<HTMLElement>('.rcl-page'))
  const source = root.querySelector<HTMLElement>('#rcl-source')!
  const srcBtn = root.querySelector<HTMLButtonElement>('.rcl-source-btn')!
  const back = root.querySelector<HTMLButtonElement>('[data-nav="back"]')!
  const fwd = root.querySelector<HTMLButtonElement>('[data-nav="forward"]')!
  const title = root.querySelector('.rcl-title')!
  const url = root.querySelector('.rcl-url')!
  const status = root.querySelector('.rcl-status')!
  const win = root.querySelector<HTMLElement>('.win')!
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')
  const visited = new Set<string>(['rcl-home'])
  const history: string[] = ['rcl-home']
  let pos = 0
  let timer = 0

  try {
    JSON.parse(localStorage.getItem('era02-visited') || '[]').forEach((id: string) => visited.add(id))
  } catch { /* storage unavailable */ }

  function paintVisited() {
    doc.querySelectorAll<HTMLAnchorElement>('a[href^="#rcl-"]').forEach((a) =>
      a.classList.toggle('is-visited', visited.has(a.getAttribute('href')!.slice(1))),
    )
  }

  // snippet:source:start
  /** View Source: the browser shows the raw markup it received. No stylesheet, no script. */
  function sourceOf(page: HTMLElement) {
    const clone = page.cloneNode(true) as HTMLElement
    clone.querySelectorAll('[data-trait]').forEach((el) => el.removeAttribute('data-trait'))
    clone.querySelectorAll('a[href^="#rcl-"]').forEach((a) => {
      const target = pages.find((p) => p.id === a.getAttribute('href')!.slice(1))
      a.setAttribute('href', target?.dataset.file ?? 'Overview.html')
    })
    clone.querySelectorAll('[hidden], [class]').forEach((el) => el.removeAttribute('class'))
    clone.querySelector('[hidden]')?.remove()
    const body = clone.innerHTML.replace(/src="data:[^"]*"/g, 'src="riverside.gif"').replace(/<(\/?)([a-z0-9]+)/g, (_, s, t) => `<${s}${t.toUpperCase()}`).trim()
    return `<HTML>\n<HEAD>\n<TITLE>${page.dataset.title}</TITLE>\n</HEAD>\n<BODY>\n${body}\n</BODY>\n</HTML>`
  }
  // snippet:source:end

  function render(id: string) {
    const page = pages.find((p) => p.id === id) ?? pages[0]
    pages.forEach((p) => p.classList.toggle('is-current', p === page))
    title.textContent = page.dataset.title!
    url.textContent = `http://info.riverside-lab.edu/hypertext/${page.dataset.file}`
    source.textContent = sourceOf(page)
    visited.add(page.id)
    try { localStorage.setItem('era02-visited', JSON.stringify([...visited])) } catch { /* ignore */ }
    paintVisited()
    back.disabled = pos === 0
    fwd.disabled = pos >= history.length - 1
    if (location.hash) window.history.replaceState(null, '', location.pathname)
  }

  function load(id: string) {
    clearTimeout(timer)
    if (calm) return render(id)
    win.classList.add('is-loading')
    const file = pages.find((p) => p.id === id)?.dataset.file
    status.textContent = `Connecting to info.riverside-lab.edu...`
    timer = window.setTimeout(() => {
      status.textContent = `Transferring ${file}...`
      timer = window.setTimeout(() => {
        render(id)
        win.classList.remove('is-loading')
        status.textContent = 'Document: Done.'
        doc.scrollIntoView({ block: 'nearest' })
      }, 350)
    }, 300)
  }

  function go(id: string) {
    history.splice(pos + 1)
    history.push(id)
    pos = history.length - 1
    load(id)
  }

  root.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#rcl-"]')
    if (!a || !root.contains(a)) return
    e.preventDefault()
    go(a.getAttribute('href')!.slice(1))
  })
  back.addEventListener('click', () => pos > 0 && load(history[--pos]))
  fwd.addEventListener('click', () => pos < history.length - 1 && load(history[++pos]))
  root.querySelector('[data-nav="reload"]')!.addEventListener('click', () => load(history[pos]))
  srcBtn.addEventListener('click', () => {
    const on = srcBtn.getAttribute('aria-pressed') !== 'true'
    srcBtn.setAttribute('aria-pressed', String(on))
    srcBtn.textContent = on ? 'View Page' : 'View Source'
    source.hidden = !on
    doc.classList.toggle('is-hidden', on)
  })
  const form = root.querySelector<HTMLFormElement>('.rcl-form')
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    form.querySelector<HTMLElement>('.rcl-thanks')!.hidden = false
  })

  const start = location.hash.slice(1)
  if (pages.some((p) => p.id === start)) { history[0] = start }
  render(history[0])

  return () => clearTimeout(timer)
}
