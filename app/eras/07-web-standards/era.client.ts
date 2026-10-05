// Era 07 behaviour: remember the chosen stylesheet (like the old cookie-based
// style switchers), flash the page on swap and move the "current" tab.
// Everything already works without JS through radio buttons and :has().

export default function setup(root: HTMLElement) {
  const page = root.querySelector<HTMLElement>('#sg-page')
  const form = root.querySelector<HTMLFormElement>('.sg__switcher')
  if (!page || !form) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const KEY = 'wdta-07-style'

  // snippet:switcher:start
  // A 2003 style switcher would set <link rel="alternate stylesheet" disabled>
  // and save the title in a cookie. Here the radios drive CSS; we only persist.
  function remember() {
    const data = new FormData(form!)
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(data)))
    } catch {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, string>
    for (const [name, value] of Object.entries(saved)) {
      const input = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`)
      if (input) input.checked = true
    }
  } catch {}
  // snippet:switcher:end

  const onChange = (e: Event) => {
    const t = e.target as HTMLInputElement
    if (t.name === 'sg-theme' && !reduced && !document.documentElement.classList.contains('readable')) {
      page.classList.remove('is-swapping')
      void page.offsetWidth
      page.classList.add('is-swapping')
    }
    remember()
  }
  form.addEventListener('change', onChange)
  // Sidebar <label for> links also toggle the radios; they bubble a change on the form.

  const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('#nav a'))
  const onTab = (e: Event) => {
    const a = e.currentTarget as HTMLAnchorElement
    tabs.forEach((t) => t.parentElement!.classList.toggle('current', t === a))
    const target = root.querySelector(a.getAttribute('href')!)
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
  }
  tabs.forEach((a) => a.addEventListener('click', onTab))

  return () => {
    form.removeEventListener('change', onChange)
    tabs.forEach((a) => a.removeEventListener('click', onTab))
  }
}
