// Era 16 behaviour: light/dark switch, player, and the soft-UI mixer controls.

export default function setup(root: HTMLElement) {
  const room = root.querySelector<HTMLElement>('#dw')!
  const themeBtn = room.querySelector<HTMLButtonElement>('.dw__theme')!
  const mq = matchMedia('(prefers-color-scheme: dark)')

  // snippet:theme-switch:start
  /** The OS decides until the visitor flips the switch; their choice is remembered. */
  let saved: string | null = null
  try {
    saved = localStorage.getItem('era16-theme')
  } catch {
    /* storage blocked */
  }
  const apply = (theme: 'light' | 'dark') => {
    room.dataset.theme = theme
    themeBtn.setAttribute('aria-checked', String(theme === 'dark'))
  }
  apply(saved === 'dark' || saved === 'light' ? saved : mq.matches ? 'dark' : 'light')
  const onScheme = () => {
    if (!saved) apply(mq.matches ? 'dark' : 'light')
  }
  mq.addEventListener('change', onScheme)
  themeBtn.addEventListener('click', () => {
    const next = room.dataset.theme === 'dark' ? 'light' : 'dark'
    apply(next)
    saved = next
    try {
      localStorage.setItem('era16-theme', next)
    } catch {
      /* ignore */
    }
  })
  // snippet:theme-switch:end

  const play = room.querySelector<HTMLButtonElement>('.dw__ctl--play')!
  play.addEventListener('click', () => {
    const on = play.getAttribute('aria-pressed') !== 'true'
    play.setAttribute('aria-pressed', String(on))
    play.setAttribute('aria-label', on ? 'Pause' : 'Play')
    room.querySelector('.dw__player')!.classList.toggle('is-playing', on)
  })

  const monitor = room.querySelector<HTMLButtonElement>('.dw__neu-btn')!
  monitor.addEventListener('click', () => {
    const on = monitor.getAttribute('aria-pressed') !== 'true'
    monitor.setAttribute('aria-pressed', String(on))
    monitor.setAttribute('aria-label', on ? 'Monitor on' : 'Monitor off')
  })

  const segs = Array.from(room.querySelectorAll<HTMLButtonElement>('.dw__seg button'))
  segs.forEach((b) =>
    b.addEventListener('click', () => segs.forEach((o) => o.setAttribute('aria-pressed', String(o === b)))),
  )

  const range = room.querySelector<HTMLInputElement>('#dw-vol')!
  const out = room.querySelector<HTMLOutputElement>('#dw-vol-out')!
  range.addEventListener('input', () => {
    range.style.setProperty('--v', `${range.value}%`)
    out.textContent = range.value
  })

  return () => mq.removeEventListener('change', onScheme)
}
