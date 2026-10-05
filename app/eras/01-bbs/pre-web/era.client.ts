// Pre-web room: teletext page search, Minitel function keys, Gopher keyboard menus.

export default function setup(root: HTMLElement) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')
  const timers: number[] = []
  const pad = (n: number) => String(n).padStart(2, '0')
  const offHash = () => location.hash && history.replaceState(null, '', location.pathname)

  // ---------- Teletext ----------
  const tt = root.querySelector<HTMLElement>('#tt-screen')!
  const ttPages = Array.from(tt.querySelectorAll<HTMLElement>('.tt-page'))
  const req = tt.querySelector<HTMLElement>('.tt-req')!
  const num = tt.querySelector<HTMLElement>('.tt-num')!
  const clock = tt.querySelector<HTMLElement>('.tt-clock')!
  const date = tt.querySelector<HTMLElement>('.tt-date')!
  const fast = [['101', '102', '103', '100'], ['100', '102', '103', '101'], ['101', '100', '103', '102'], ['101', '102', '100', '103']]
  let typed = ''
  let rolling = 0
  let current = '100'

  const tick = () => {
    const d = new Date()
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}/${pad(d.getSeconds())}`
    date.textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(',', '').slice(0, 10).padEnd(10)
  }
  tick()
  timers.push(window.setInterval(tick, 1000))

  function showTt(page: string) {
    const target = ttPages.find((p) => p.dataset.page === page)
    ttPages.forEach((p) => p.classList.toggle('is-current', p === target))
    tt.classList.remove('is-revealed')
    revealBtn.setAttribute('aria-pressed', 'false')
    current = page
    num.textContent = page
    req.textContent = `P${page}`
    offHash()
  }

  // snippet:carousel:start
  /** Pages arrive in a broadcast loop: the header counts through the carousel until ours comes round. */
  function goTt(page: string) {
    clearInterval(rolling)
    req.textContent = `P${page}`
    const exists = ttPages.some((p) => p.dataset.page === page)
    if (calm) {
      if (exists) showTt(page)
      return
    }
    tt.classList.add('tt-searching')
    let n = Number(current)
    const steps = exists ? 6 + Math.floor(Math.random() * 10) : 40
    let i = 0
    rolling = window.setInterval(() => {
      n = n >= 199 ? 100 : n + 1
      num.textContent = String(n)
      if (++i >= steps) {
        clearInterval(rolling)
        tt.classList.remove('tt-searching')
        if (exists) showTt(page)
        else num.textContent = current // page not in the carousel; give up quietly
      }
    }, 90)
  }
  // snippet:carousel:end

  function digit(d: string) {
    typed += d
    req.textContent = `P${typed.padEnd(3, '-')}`
    if (typed.length === 3) {
      const p = typed
      typed = ''
      goTt(p)
    }
  }

  const revealBtn = root.querySelector<HTMLButtonElement>('.k-reveal')!
  revealBtn.addEventListener('click', () => {
    const on = tt.classList.toggle('is-revealed')
    revealBtn.setAttribute('aria-pressed', String(on))
  })
  root.querySelectorAll<HTMLButtonElement>('[data-digit]').forEach((b) => b.addEventListener('click', () => digit(b.dataset.digit!)))
  root.querySelectorAll<HTMLButtonElement>('[data-fast]').forEach((b) =>
    b.addEventListener('click', () => {
      const row = fast[ttPages.findIndex((p) => p.dataset.page === current)] ?? fast[0]
      goTt(row[Number(b.dataset.fast)])
    }),
  )
  tt.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-go]')
    if (!a) return
    e.preventDefault()
    goTt(a.dataset.go!.slice(1))
  })
  tt.addEventListener('keydown', (e) => {
    if (/^\d$/.test(e.key)) digit(e.key)
    else if (['r', 'g', 'y', 'c'].includes(e.key)) root.querySelector<HTMLButtonElement>(`[data-fast="${'rgyc'.indexOf(e.key)}"]`)!.click()
    else return
    e.preventDefault()
  })

  // ---------- Minitel ----------
  const mt = root.querySelector<HTMLElement>('#mt-screen')!
  const mtForm = root.querySelector<HTMLFormElement>('#mt-form')!
  const mtPages = Array.from(mt.querySelectorAll<HTMLElement>('.mt-page'))
  const msg = mt.querySelector<HTMLElement>('.mt-msg')!
  const ville = mt.querySelector<HTMLInputElement>('#mt-ville')!
  const choix = mt.querySelector<HTMLInputElement>('#mt-choix')!
  const next: Record<string, string> = { ville1: 'ville2', neige1: 'neige2' }
  const prev: Record<string, string> = { ville2: 'ville1', neige2: 'neige1', sommaire: 'accueil' }
  const menu = ['', 'ville1', 'marine', 'neige1', 'dicton']
  let screen = 'accueil'
  let connected = Date.now()
  let flash = 0

  const say = (text: string) => {
    msg.textContent = text
    clearTimeout(flash)
    flash = window.setTimeout(() => (msg.textContent = ''), 2500)
  }

  function showMt(name: string) {
    const target = mtPages.find((p) => p.dataset.screen === name)
    if (!target) return
    screen = name
    mtPages.forEach((p) => p.classList.toggle('is-current', p === target))
    if (!calm) {
      target.classList.remove('is-painting')
      void target.offsetWidth
      target.classList.add('is-painting')
    }
    if (name === 'fin') {
      const s = Math.round((Date.now() - connected) / 1000)
      mt.querySelector('.mt-dur')!.textContent = `${Math.floor(s / 60)} min ${pad(s % 60)} s`.padEnd(10)
      mt.querySelector('.mt-cost')!.textContent = `${((s / 60) * 0.98).toFixed(2).replace('.', ',')} F`.padEnd(10)
    }
    target.querySelector<HTMLInputElement>('input')?.focus()
    offHash()
  }

  // snippet:keys:start
  function press(key: string) {
    if (screen === 'fin' && key !== 'fin') return say('Pas de connexion')
    switch (key) {
      case 'sommaire': return showMt('sommaire')
      case 'suite': return next[screen] ? showMt(next[screen]) : say('Dernière page')
      case 'retour': return prev[screen] ? showMt(prev[screen]) : say('Première page')
      case 'repetition': return showMt(screen)
      case 'guide': return say('Tapez 1 à 4 + ENVOI')
      case 'annulation': ville.value = ''; choix.value = ''; return say('Annulé')
      case 'correction': {
        const f = screen === 'sommaire' ? choix : ville
        f.value = f.value.slice(0, -1)
        return f.focus()
      }
      case 'fin':
        if (screen === 'fin') { connected = Date.now(); return showMt('accueil') }
        return showMt('fin')
      case 'envoi':
        if (screen === 'accueil') {
          const city = ville.value.trim().toUpperCase()
          if (!city) return say('Tapez une ville')
          mt.querySelectorAll('.mt-city').forEach((el) => (el.textContent = city.slice(0, 20).padEnd(20)))
          return showMt('ville1')
        }
        if (screen === 'sommaire') {
          const page = menu[Number(choix.value)]
          choix.value = ''
          return page ? showMt(page) : say('Choix 1 à 4')
        }
        return say('Utilisez SUITE')
    }
  }
  // snippet:keys:end

  root.querySelectorAll<HTMLButtonElement>('.mt-keys [data-key]').forEach((b) => b.addEventListener('click', () => press(b.dataset.key!)))
  mtForm.addEventListener('submit', (e) => {
    e.preventDefault()
    press('envoi')
  })
  // Two fields and no submit button: implicit submission does not fire, so Enter is ENVOI.
  mtForm.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    press('envoi')
  })
  mt.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-go]')
    if (!a) return
    e.preventDefault()
    showMt(a.dataset.go!)
  })
  root.querySelector<HTMLInputElement>('#mt-bw')!.addEventListener('change', (e) =>
    mt.classList.toggle('is-bw', (e.target as HTMLInputElement).checked),
  )

  // ---------- Gopher ----------
  const g = root.querySelector<HTMLElement>('#g-screen')!
  const gPages = Array.from(g.querySelectorAll<HTMLElement>('.g-page'))
  let gNow = gPages.find((p) => p.classList.contains('is-current'))!

  const items = () => Array.from(gNow.querySelectorAll<HTMLAnchorElement>('.g-menu a'))
  function select(i: number) {
    const list = items()
    if (!list.length) return
    i = (i + list.length) % list.length
    list.forEach((a, n) => a.classList.toggle('is-sel', n === i))
    gNow.querySelectorAll('.g-arrow').forEach((s, n) => (s.textContent = n === i ? '-->' : '   '))
  }
  const selected = () => Math.max(0, items().findIndex((a) => a.classList.contains('is-sel')))

  function showG(name: string, keepFocus = true) {
    const target = gPages.find((p) => p.dataset.screen === name)
    if (!target) return
    gNow = target
    gPages.forEach((p) => p.classList.toggle('is-current', p === target))
    select(0)
    const input = target.querySelector<HTMLInputElement>('input')
    if (input) input.focus()
    else if (keepFocus) g.focus()
    offHash()
  }
  select(0)

  g.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-go]')
    if (!a) return
    e.preventDefault()
    showG(a.dataset.go!)
  })
  g.querySelector('.g-search')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const q = (g.querySelector<HTMLInputElement>('#g-q')!.value.trim() || 'gopher').slice(0, 24)
    g.querySelector('.g-rtitle')!.textContent = `          Search Lakeside Gopherspace: ${q}`
    showG('results')
  })
  g.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      if (e.key === 'Escape') showG(gNow.dataset.parent || 'root')
      return
    }
    const list = items()
    if (e.key === 'ArrowDown' || e.key === 'j') select(selected() + 1)
    else if (e.key === 'ArrowUp' || e.key === 'k') select(selected() - 1)
    else if (e.key === 'Enter' || e.key === 'ArrowRight') {
      if (list.length) showG(list[selected()].dataset.go!)
      else if (gNow.dataset.parent) showG(gNow.dataset.parent)
    } else if (e.key === 'u' || e.key === 'ArrowLeft' || e.key === 'Backspace') {
      if (gNow.dataset.parent) showG(gNow.dataset.parent)
    } else if (/^[1-9]$/.test(e.key) && list[Number(e.key) - 1]) showG(list[Number(e.key) - 1].dataset.go!)
    else return
    e.preventDefault()
  })

  return () => {
    timers.forEach(clearInterval)
    clearInterval(rolling)
    clearTimeout(flash)
  }
}
