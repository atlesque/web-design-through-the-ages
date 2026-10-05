// Era 03: hit counter, guestbook, webring and a Web Audio "MIDI" tune.

export default function setup(root: HTMLElement) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')
  const store = {
    get(k: string) { try { return localStorage.getItem(k) } catch { return null } },
    set(k: string, v: string) { try { localStorage.setItem(k, v) } catch { /* private mode */ } },
  }

  // ---------- Hit counter: every visit bumps it, odometer style ----------
  const digits = root.querySelector<HTMLElement>('.dk__digits')!
  const hits = Number(store.get('era03-hits') || 4417) + 1
  store.set('era03-hits', String(hits))
  const prev = String(hits - 1).padStart(7, '0')
  digits.innerHTML = ''
  String(hits).padStart(7, '0').split('').forEach((d, i) => {
    const s = document.createElement('span')
    s.className = 'dk__digit'
    s.textContent = d
    if (!calm && d !== prev[i]) s.classList.add('is-rolling')
    digits.append(s)
  })
  digits.parentElement!.setAttribute('aria-label', `Hit counter: ${hits} visitors`)

  // ---------- Guestbook ----------
  // snippet:guestbook-js:start
  const form = root.querySelector<HTMLFormElement>('.dk__gbform')!
  const list = root.querySelector<HTMLOListElement>('.dk__entries')!
  type Entry = { name: string; from: string; msg: string; date: string }
  const addEntry = (e: Entry) => {
    const li = document.createElement('li')
    const b = document.createElement('b')
    b.textContent = e.name
    const i = document.createElement('i')
    i.textContent = e.msg
    const small = document.createElement('small')
    small.textContent = e.date
    li.append(b, e.from ? ` (${e.from}): ` : ': ', i, ' ', small)
    list.prepend(li)
  }
  let saved: Entry[] = []
  try { saved = JSON.parse(store.get('era03-guestbook') || '[]') } catch { saved = [] }
  saved.forEach(addEntry)
  form.addEventListener('submit', (ev) => {
    ev.preventDefault()
    const data = new FormData(form)
    const entry: Entry = {
      name: String(data.get('name') || '').trim().slice(0, 30),
      from: String(data.get('from') || '').trim().slice(0, 30),
      msg: String(data.get('msg') || '').trim().slice(0, 200),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', ''),
    }
    if (!entry.name || !entry.msg) return
    addEntry(entry)
    saved.push(entry)
    store.set('era03-guestbook', JSON.stringify(saved.slice(-20)))
    form.reset()
  })
  // snippet:guestbook-js:end

  // ---------- Webring ----------
  const ring = ['Jenny\'s Unicorn World', 'Planet Skate', 'The X-Files Shrine', 'Kool Kids HQ', 'Mike\'s Pokemon Lair', 'Cyber Kitty Klub', 'Dave\'s Kool Page', 'Star Base Ohio', 'Angelfire Annie', 'The Lego Zone']
  let at = 6
  const out = root.querySelector<HTMLElement>('.dk__ringout')!
  root.querySelectorAll<HTMLAnchorElement>('[data-ring]').forEach((a) =>
    a.addEventListener('click', (ev) => {
      ev.preventDefault()
      const kind = a.dataset.ring
      if (kind === 'list') {
        out.textContent = `Kool Kids Webring sites: ${ring.join(' · ')} … and 202 more`
        return
      }
      at = kind === 'next' ? (at + 1) % ring.length : kind === 'prev' ? (at + ring.length - 1) % ring.length : Math.floor(Math.random() * ring.length)
      out.textContent = `Next stop: “${ring[at]}” (site ${at + 1} of 212). In 1998 this would load their page. This ring is pretend.`
    }),
  )

  // ---------- MIDI-style tune ----------
  // snippet:midi:start
  /** A square-wave melody and bass, like a General MIDI file on a cheap sound card. */
  const btn = root.querySelector<HTMLButtonElement>('.dk__midi')!
  let ctx: AudioContext | null = null
  let timer = 0
  const melody = [72, 76, 79, 76, 81, 79, 76, 72, 74, 77, 81, 77, 79, 0, 79, 0, 72, 76, 79, 84, 83, 79, 76, 74, 72, 74, 76, 72, 67, 0, 72, 0]
  const bass = [48, 48, 45, 45, 41, 41, 43, 43]
  const hz = (n: number) => 440 * 2 ** ((n - 69) / 12)
  function note(freq: number, at: number, len: number, type: OscillatorType, vol: number) {
    const o = ctx!.createOscillator()
    const g = ctx!.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, at)
    g.gain.exponentialRampToValueAtTime(0.001, at + len)
    o.connect(g).connect(ctx!.destination)
    o.start(at)
    o.stop(at + len)
  }
  function play() {
    ctx ??= new AudioContext()
    void ctx.resume()
    const step = 0.16
    let t = ctx.currentTime + 0.05
    let i = 0
    const schedule = () => {
      while (t < ctx!.currentTime + 0.5) {
        const m = melody[i % melody.length]
        if (m) note(hz(m), t, step * 0.9, 'square', 0.05)
        if (i % 4 === 0) note(hz(bass[(i / 4) % bass.length]), t, step * 3.5, 'triangle', 0.12)
        t += step
        i++
      }
    }
    schedule()
    timer = window.setInterval(schedule, 100)
  }
  function stop() {
    clearInterval(timer)
    void ctx?.suspend()
  }
  // snippet:midi:end
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true'
    btn.setAttribute('aria-pressed', String(on))
    btn.textContent = on ? '■ Stop MIDI' : '▶ Play MIDI'
    if (on) play()
    else stop()
  })

  return () => {
    clearInterval(timer)
    void ctx?.close()
  }
}
