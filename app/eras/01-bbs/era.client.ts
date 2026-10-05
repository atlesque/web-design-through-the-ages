// Era 01 behaviour: modem-speed text reveal, login, and single-key menu navigation.

export default function setup(root: HTMLElement) {
  const screen = root.querySelector<HTMLElement>('#bbs-screen')!
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.bbs__panel'))
  const login = root.querySelector<HTMLFormElement>('#bbs-login')!
  const handleInput = root.querySelector<HTMLInputElement>('#bbs-handle')!
  const online = root.querySelector<HTMLElement>('.bbs__online')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const started = Date.now()
  let baud = 2400
  let typingRun = 0
  let restore: () => void = () => {}

  // snippet:modem:start
  /** Reveal an element's text at the speed of the chosen modem (about baud / 10 characters per second). */
  async function typeOut(el: HTMLElement) {
    restore() // finish any screen that is still arriving
    const run = ++typingRun
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const nodes: { node: Text; text: string }[] = []
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      if (node.parentElement?.checkVisibility()) nodes.push({ node, text: node.data })
    }
    if (reduced || document.documentElement.classList.contains('readable')) return
    nodes.forEach((n) => (n.node.data = ''))
    restore = () => finish(nodes)
    const charsPerSecond = baud / 10
    let last = performance.now()
    let budget = 0
    for (const n of nodes) {
      let i = 0
      while (i < n.text.length) {
        if (run !== typingRun) return // a newer screen took over (and restored this one)
        await new Promise(requestAnimationFrame)
        const now = performance.now()
        budget += ((now - last) / 1000) * charsPerSecond
        last = now
        const take = Math.floor(budget)
        if (take > 0) {
          budget -= take
          i = Math.min(n.text.length, i + take)
          n.node.data = n.text.slice(0, i)
        }
      }
    }
    restore = () => {}
  }
  // snippet:modem:end
  function finish(nodes: { node: Text; text: string }[]) {
    nodes.forEach((n) => (n.node.data = n.text))
  }

  function show(name: string) {
    for (const p of panels) p.classList.toggle('is-current', p.dataset.screen === name)
    const current = panels.find((p) => p.dataset.screen === name)
    if (name === 'bye') {
      const mins = root.querySelector('.bbs__minutes')
      if (mins) mins.textContent = String(Math.max(1, Math.round((Date.now() - started) / 60000)))
    }
    if (current) void typeOut(current)
    if (location.hash) history.replaceState(null, '', location.pathname)
  }

  // Before login only the splash and prompt are on screen.
  panels.forEach((p) => p.classList.remove('is-current'))
  login.hidden = false
  void typeOut(screen)

  login.addEventListener('submit', (e) => {
    e.preventDefault()
    const handle = (handleInput.value.trim() || 'GUEST').toUpperCase().slice(0, 16)
    root.querySelectorAll('.bbs__you').forEach((el) => (el.textContent = handle))
    login.hidden = true
    root.querySelector<HTMLElement>('.bbs__splash')!.hidden = true
    show('main')
    screen.focus()
  })

  const keyMap = new Map<string, string>()
  root.querySelectorAll<HTMLAnchorElement>('a[data-key]').forEach((a) => {
    const target = a.getAttribute('href')!.replace('#bbs-', '')
    a.addEventListener('click', (e) => {
      e.preventDefault()
      show(target)
    })
    if (a.closest('[data-screen="main"]')) keyMap.set(a.dataset.key!, target)
  })

  screen.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return
    const key = e.key.toLowerCase()
    const current = panels.find((p) => p.classList.contains('is-current'))?.dataset.screen
    if (!current) return
    if (key === 'q' && current !== 'main') {
      show('main')
    } else if (current === 'main' && keyMap.has(key)) {
      show(keyMap.get(key)!)
    } else {
      return
    }
    e.preventDefault()
  })

  root.querySelectorAll<HTMLInputElement>('input[name="baud"]').forEach((r) =>
    r.addEventListener('change', () => {
      baud = Number(r.value)
      const status = root.querySelector('.bbs__status span:nth-child(2)')
      if (status) status.textContent = `${baud === 14400 ? '14.4k' : baud} 8N1`
    }),
  )
  root.querySelector('.bbs__redial')!.addEventListener('click', () => {
    const current = panels.find((p) => p.classList.contains('is-current'))
    void typeOut(current ?? screen)
  })

  const clock = window.setInterval(() => {
    if (!online) return
    const s = Math.floor((Date.now() - started) / 1000)
    online.textContent = `ONLINE ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }, 1000)

  return () => {
    restore()
    typingRun++
    clearInterval(clock)
  }
}
