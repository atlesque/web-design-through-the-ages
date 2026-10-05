// Era 06 behaviour: millennium countdown and a fake Y2K compliance scan.

export default function setup(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const readable = () => document.documentElement.classList.contains('readable')
  const timers: number[] = []

  // snippet:countdown:start
  // The room pretends it is 1999: count down from a fixed point in November 1999,
  // advancing with the real clock while the page is open.
  const pretendStart = Date.UTC(1999, 10, 14, 16, 37, 44)
  const opened = Date.now()
  const target = Date.UTC(2000, 0, 1, 0, 0, 0)
  const lcd = root.querySelector<HTMLElement>('.ob-lcd')!
  const cells = ['d', 'h', 'm', 's'].map((k) => lcd.querySelector<HTMLElement>(`.ob-lcd__${k}`)!)
  function tick() {
    const left = Math.max(0, target - (pretendStart + (Date.now() - opened)))
    const s = Math.floor(left / 1000)
    const parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60]
    parts.forEach((n, i) => (cells[i].textContent = String(n).padStart(2, '0')))
    lcd.classList.toggle('is-done', left === 0)
  }
  // snippet:countdown:end
  tick()
  timers.push(window.setInterval(tick, 1000))

  // ----- Y2K compliance scan -----
  const btn = root.querySelector<HTMLButtonElement>('#ob-scan')!
  const log = root.querySelector<HTMLUListElement>('.ob-log')!
  const fill = root.querySelector<HTMLElement>('.ob-meter__fill')!
  const steps: [string, string, string][] = [
    ['Checking BIOS real-time clock', 'ok', 'OK'],
    ['Rolling date to 12/31/1999 23:59:59', 'ok', 'OK'],
    ['Testing two-digit years in spreadsheets', 'warn', '"00" read as 1900!'],
    ['Scanning e-mail client', 'ok', 'OK'],
    ['Checking leap day 02/29/2000', 'ok', 'OK'],
    ['Applying CyberScan 2K e-Patch', 'ok', 'DONE'],
  ]
  const line = (html: string) => {
    const li = document.createElement('li')
    li.innerHTML = html
    log.append(li)
    while (log.children.length > 5) log.firstElementChild?.remove()
  }
  btn.addEventListener('click', () => {
    btn.disabled = true
    log.replaceChildren()
    const fast = reduced || readable()
    const delay = fast ? 0 : 650
    line('CyberScan 2K v1.0 &middot; scanning...')
    steps.forEach(([label, cls, result], i) => {
      timers.push(
        window.setTimeout(() => {
          line(`${label}... <span class="${cls}">${result}</span>`)
          fill.style.setProperty('--p', `${Math.round(((i + 1) / steps.length) * 100)}%`)
          if (i === steps.length - 1) {
            line('<span class="ok">Your PC is Y2K COMPLIANT!</span> Have a happy e-Millennium.')
            btn.disabled = false
            btn.textContent = 'Scan Again'
          }
        }, delay * (i + 1)),
      )
    })
  })

  return () => {
    timers.forEach((t) => (clearTimeout(t), clearInterval(t)))
  }
}
