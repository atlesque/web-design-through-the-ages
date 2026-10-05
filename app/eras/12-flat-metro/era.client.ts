// Era 12 behaviour: live tiles that flip on a timer, and tiles that open a flat panel.

const PANELS: Record<string, [string, string]> = {
  today: ['today', '18° and partly sunny in Lisbon. Light breeze from the north-west, sunset at 19:12.'],
  flights: ['flights', 'LIS → OPO, Friday 08:40. On time. Gate shows up here an hour before boarding.'],
  trips: ['trips', 'Porto (12 days), Seville (5 weeks), Reykjavík (someday). Forecasts appear 10 days out.'],
  radar: ['radar', 'No rain within 50 km. The map is a solid colour too: we checked.'],
  alerts: ['alerts', 'Wind advisory: gusts up to 40 km/h after 6pm along the coast. Hold on to your hat.'],
  pack: ['what to pack', 'Sunglasses, sunscreen, a light jacket. Leave the umbrella at home.'],
  photos: ['photos', 'Your trip photos, sorted by where the sun was out. 214 pictures, 3 albums.'],
}

export default function setup(root: HTMLElement) {
  const panel = root.querySelector<HTMLElement>('#fm-panel')!
  const title = panel.querySelector<HTMLElement>('.fm-panel__title')!
  const body = panel.querySelector<HTMLElement>('.fm-panel__body')!
  const back = panel.querySelector<HTMLButtonElement>('.fm-back')!
  const toggle = root.querySelector<HTMLInputElement>('#fm-live')!
  const live = Array.from(root.querySelectorAll<HTMLElement>('.fm-tile[data-trait~="live"]'))
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')
  let opener: HTMLButtonElement | null = null

  // snippet:open:start
  root.querySelectorAll<HTMLButtonElement>('.fm-tile__btn').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false')
    btn.addEventListener('click', () => {
      const [h, text] = PANELS[btn.dataset.panel!] ?? ['', '']
      const colour = Array.from(btn.parentElement!.classList).find((c) => c.startsWith('c-'))
      panel.className = `fm-panel ${colour}`
      title.textContent = h
      body.textContent = text
      panel.hidden = false
      root.querySelectorAll('.fm-tile__btn').forEach((b) => b.setAttribute('aria-expanded', String(b === btn)))
      opener = btn
      title.focus()
      panel.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' })
    })
  })
  // snippet:open:end
  function close() {
    panel.hidden = true
    opener?.setAttribute('aria-expanded', 'false')
    opener?.focus()
  }
  back.addEventListener('click', close)
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  // Live tiles flip one at a time, every 2.5 seconds, while the toggle is on.
  if (still) toggle.checked = false
  let i = 0
  const timer = window.setInterval(() => {
    if (!toggle.checked || document.hidden) return
    live[i % live.length].classList.toggle('is-flipped')
    i++
  }, 2500)
  toggle.addEventListener('change', () => {
    if (!toggle.checked) live.forEach((t) => t.classList.remove('is-flipped'))
  })

  return () => clearInterval(timer)
}
