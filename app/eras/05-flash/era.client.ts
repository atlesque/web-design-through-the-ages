// Era 05 behaviour: preloader, intro timeline, scale-to-fit stage, mystery-meat nav, sound and lab toys.

export default function setup(root: HTMLElement) {
  const vx = root.querySelector<HTMLElement>('.vx')!
  const fit = root.querySelector<HTMLElement>('#vx-fit')!
  const stage = root.querySelector<HTMLElement>('#vx-stage')!
  const skip = root.querySelector<HTMLAnchorElement>('.vx-skip')!
  const soundBtn = root.querySelector<HTMLButtonElement>('.vx-sound')!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const readable = () => document.documentElement.classList.contains('readable')
  const timers: number[] = []
  const off: (() => void)[] = []
  const on = (el: EventTarget, type: string, fn: EventListener) => {
    el.addEventListener(type, fn)
    off.push(() => el.removeEventListener(type, fn))
  }
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))
  const clearTimers = () => timers.splice(0).forEach(clearTimeout)

  // snippet:scale:start
  // Flash's "showAll" scale mode: keep the 760x480 stage whole and scale it to the space available.
  function scale() {
    const s = Math.min(1, fit.clientWidth / 760)
    stage.style.setProperty('--vx-scale', String(s))
    fit.style.height = `${Math.ceil(480 * s)}px`
  }
  // snippet:scale:end
  const ro = new ResizeObserver(scale)
  ro.observe(fit)
  off.push(() => ro.disconnect())
  scale()

  // ----- Sound (off by default, Web Audio only after a click) -----
  let ctx: AudioContext | null = null
  let soundOn = false
  function blip(freq = 880, dur = 0.06) {
    if (!soundOn || !ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = freq
    g.gain.setValueAtTime(0.05, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  }
  on(soundBtn, 'click', () => {
    soundOn = !soundOn
    if (soundOn && !ctx) ctx = new AudioContext()
    soundBtn.setAttribute('aria-pressed', String(soundOn))
    soundBtn.textContent = `SOUND: ${soundOn ? 'ON' : 'OFF'}`
    blip(soundOn ? 1320 : 440, 0.1)
  })

  // ----- Phases: preload -> intro -> site -----
  function showSite(animate: boolean) {
    clearTimers()
    vx.dataset.phase = 'site'
    vx.classList.toggle('is-entering', animate)
    if (animate) later(() => vx.classList.remove('is-entering'), 1200)
  }

  // snippet:preloader:start
  function play() {
    clearTimers()
    if (reduced || readable()) return showSite(false)
    vx.dataset.phase = 'preload'
    const pct = root.querySelector('.vx-preload__pct')!
    const kb = root.querySelector('.vx-preload__kb-n')!
    const fill = root.querySelector<HTMLElement>('.vx-preload__fill')!
    let p = 0
    const tick = () => {
      // Lurch forward like a real 56k download: fast, stall, fast.
      p = Math.min(100, p + (p > 40 && p < 55 ? 1 : 3 + Math.random() * 5))
      pct.textContent = String(Math.floor(p))
      kb.textContent = String(Math.floor((p / 100) * 412))
      fill.style.width = `${p}%`
      if (p < 100) later(tick, 70)
      else later(intro, 250)
    }
    tick()
  }
  // snippet:preloader:end

  function intro() {
    vx.dataset.phase = 'intro'
    const tag = root.querySelector<HTMLElement>('.vx-intro__tag')!
    const text = '// WE BUILD EXPERIENCES_'
    tag.textContent = ''
    for (let i = 1; i <= text.length; i++) later(() => (tag.textContent = text.slice(0, i)), 3000 + i * 45)
    ;[0, 150, 300, 1800, 2400].forEach((t, i) => later(() => blip(220 + i * 110, 0.08), t))
    later(() => showSite(true), 4600)
  }

  on(skip, 'click', (e) => {
    e.preventDefault()
    blip(660)
    showSite(true)
    root.querySelector<HTMLElement>('.vx-nav__btn')?.focus()
  })
  on(root.querySelector('.vx-replay')!, 'click', play)

  // ----- Mystery-meat navigation -----
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.vx-panel'))
  const btns = Array.from(root.querySelectorAll<HTMLAnchorElement>('.vx-nav__btn'))
  function go(section: string) {
    panels.forEach((p) => p.classList.toggle('is-current', p.dataset.section === section))
    btns.forEach((b) => b.setAttribute('aria-current', String(b.dataset.section === section)))
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  }
  btns.forEach((b, i) => {
    on(b, 'click', (e) => {
      e.preventDefault()
      blip(523 + i * 98, 0.09)
      go(b.dataset.section!)
    })
    on(b, 'mouseenter', () => blip(1760, 0.03))
  })
  go('work')

  // ----- Mouse coordinates readout, Flash _xmouse/_ymouse style -----
  const xs = root.querySelector('.vx-x')!
  const ys = root.querySelector('.vx-y')!
  const dots = Array.from(root.querySelectorAll<HTMLElement>('.vx-lab__field span'))
  on(stage, 'pointermove', (ev) => {
    const e = ev as PointerEvent
    const r = stage.getBoundingClientRect()
    const k = 760 / r.width
    xs.textContent = String(Math.round((e.clientX - r.left) * k)).padStart(3, '0')
    ys.textContent = String(Math.round((e.clientY - r.top) * k)).padStart(3, '0')
    if (reduced) return
    for (const d of dots) {
      if (d.dataset.mode) continue
      const b = d.getBoundingClientRect()
      const dx = b.left + b.width / 2 - e.clientX
      const dy = b.top + b.height / 2 - e.clientY
      const dist = Math.hypot(dx, dy) || 1
      const push = Math.max(0, 60 - dist) / 60
      d.style.transform = push ? `translate(${(dx / dist) * push * 14}px, ${(dy / dist) * push * 14}px) scale(${1 + push})` : ''
    }
  })
  root.querySelectorAll<HTMLButtonElement>('[data-lab]').forEach((b) =>
    on(b, 'click', () => {
      blip(990, 0.05)
      dots.forEach((d, i) => {
        const mode = b.dataset.lab
        d.dataset.mode = mode === 'reset' ? '' : mode
        d.style.transform =
          mode === 'spin' ? `rotate(${180 + i * 20}deg) scale(1.2)` :
          mode === 'scatter' ? `translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) rotate(${Math.random() * 360}deg)` : ''
      })
    }),
  )

  // ----- Contact form -----
  on(root.querySelector('.vx-form')!, 'submit', (e) => {
    e.preventDefault()
    const out = root.querySelector('.vx-form__out')!
    out.textContent = 'TRANSMITTING... MESSAGE RECEIVED. WE WILL GET BACK TO YOU.'
    blip(1200, 0.15)
  })

  // Readable mode switched on mid-intro: jump straight to the site.
  const mo = new MutationObserver(() => readable() && vx.dataset.phase !== 'site' && showSite(false))
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  off.push(() => mo.disconnect())

  play()

  return () => {
    clearTimers()
    off.forEach((f) => f())
    void ctx?.close()
  }
}
