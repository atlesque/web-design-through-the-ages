// Era 04 behaviour: horoscope picker, fake search, free email sign-up, remembered screen resolution.

const HOROSCOPES = [
  'A forwarded email brings unexpected luck. Do not forward it to ten friends.',
  'Your modem connects at 56K on the first try. Buy a lottery ticket.',
  'Someone in a chat room is not who they claim to be. Proceed with caution.',
  'Back up your files to floppy today. All of them. Yes, all 31 disks.',
  'A bold move pays off: upgrade to 64 MB of RAM.',
  'Organise your Favorites folder. You will find a site you forgot you loved.',
  'Balance returns when you finally clear your browser cache.',
  'A mysterious stranger signs your guestbook. Reply graciously.',
  'Adventure calls. Try a search engine you have never used before.',
  'Your stock picks are strong, but do not quit your day job just yet.',
  'Your homepage gets its 1,000th hit. Celebrate with a new animated GIF.',
  'A dream about the year 2000 means nothing. Probably.',
]

export default function setup(root: HTMLElement) {
  const off: (() => void)[] = []
  const on = <K extends keyof HTMLElementEventMap>(el: Element | null, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    if (!el) return
    el.addEventListener(type, fn as EventListener)
    off.push(() => el.removeEventListener(type, fn as EventListener))
  }

  const sign = root.querySelector<HTMLSelectElement>('#ws-sign')
  const horo = root.querySelector<HTMLElement>('.ws-horo')
  on(sign, 'change', () => {
    if (horo && sign) horo.textContent = HOROSCOPES[Number(sign.value)] ?? ''
  })

  const search = root.querySelector<HTMLFormElement>('.ws-search')
  const results = root.querySelector<HTMLElement>('#ws-results')
  on(search, 'submit', (e) => {
    e.preventDefault()
    const q = (root.querySelector<HTMLInputElement>('#ws-q')?.value || 'everything').trim()
    if (results) results.textContent = `Webspan found about ${(q.length * 4817 + 1203).toLocaleString('en-US')} pages for "${q}". (Results 1-10 would load on a new page, after about 20 seconds.)`
  })
  root.querySelectorAll<HTMLAnchorElement>('.ws-search__pop a').forEach((a) =>
    on(a, 'click', (e) => {
      e.preventDefault()
      const input = root.querySelector<HTMLInputElement>('#ws-q')
      if (input) input.value = a.textContent ?? ''
      search?.requestSubmit()
    }),
  )

  const signup = root.querySelector<HTMLFormElement>('.ws-signup')
  on(signup, 'submit', (e) => {
    e.preventDefault()
    const user = root.querySelector<HTMLInputElement>('#ws-user')
    const msg = root.querySelector<HTMLElement>('.ws-signup__msg')
    const name = (user?.value || '').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
    if (!msg) return
    msg.textContent = name
      ? `Sorry, ${name}@webspan.net is taken. How about ${name}${1970 + (name.length * 7) % 30}@webspan.net?`
      : 'Please choose a username first.'
  })

  // snippet:resolution:start
  // Remember the chosen "screen resolution" for this visitor only.
  const KEY = 'era04-viewport'
  try {
    const saved = localStorage.getItem(KEY)
    const radio = saved ? root.querySelector<HTMLInputElement>(`input[name="ws-vp"][value="${saved}"]`) : null
    if (radio) radio.checked = true
  } catch {}
  root.querySelectorAll<HTMLInputElement>('input[name="ws-vp"]').forEach((r) =>
    on(r, 'change', () => {
      try { localStorage.setItem(KEY, r.value) } catch {}
    }),
  )
  // snippet:resolution:end

  return () => off.forEach((f) => f())
}
