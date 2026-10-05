// Era 10 behaviour: tear off notes onto the desk, and a brass dimmer knob for the lamp.

const KEY = 'wdta-e10-notes'

export default function setup(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('#lq-note')!
  const text = root.querySelector<HTMLTextAreaElement>('#lq-text')!
  const list = root.querySelector<HTMLUListElement>('#lq-stickies')!
  const knob = root.querySelector<HTMLElement>('#lq-knob')!
  const lamp = root.querySelector<HTMLInputElement>('#lq-lamp')!
  const colours = ['yellow', 'blue', 'pink']
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')

  let saved: string[] = []
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {}

  function pin(note: string, animate: boolean) {
    const li = document.createElement('li')
    li.className = `lq-sticky lq-sticky--${colours[list.children.length % colours.length]}`
    if (animate && !calm) li.classList.add('is-new')
    li.textContent = note
    list.append(li)
    while (list.children.length > 6) list.firstElementChild!.remove()
  }
  saved.forEach((n) => pin(n, false))

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const note = text.value.trim()
    if (!note) return
    pin(note, true)
    saved = [...saved, note].slice(-4)
    try {
      localStorage.setItem(KEY, JSON.stringify(saved))
    } catch {}
    text.value = ''
    text.focus()
  })

  // snippet:knob:start
  let level = 100
  function setLevel(v: number) {
    level = Math.max(20, Math.min(100, Math.round(v)))
    // 20% to 100% maps to a 270 degree sweep, like a real dimmer.
    knob.style.setProperty('--turn', `${-135 + ((level - 20) / 80) * 270}deg`)
    knob.setAttribute('aria-valuenow', String(level))
    knob.setAttribute('aria-valuetext', `${level} percent`)
    root.style.setProperty('--lq-dim', String(level / 100))
    if (!lamp.checked && level > 20) lamp.checked = true
  }
  // snippet:knob:end

  knob.addEventListener('keydown', (e) => {
    const step = { ArrowUp: 10, ArrowRight: 10, ArrowDown: -10, ArrowLeft: -10, PageUp: 20, PageDown: -20 }[e.key]
    if (step) setLevel(level + step)
    else if (e.key === 'Home') setLevel(20)
    else if (e.key === 'End') setLevel(100)
    else return
    e.preventDefault()
  })

  let dragging = false
  function turnTo(e: PointerEvent) {
    const r = knob.getBoundingClientRect()
    let deg = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI
    deg = Math.max(-135, Math.min(135, deg))
    setLevel(20 + ((deg + 135) / 270) * 80)
  }
  knob.addEventListener('pointerdown', (e) => {
    dragging = true
    knob.setPointerCapture(e.pointerId)
    turnTo(e)
  })
  knob.addEventListener('pointermove', (e) => dragging && turnTo(e))
  knob.addEventListener('pointerup', () => (dragging = false))
  knob.addEventListener('pointercancel', () => (dragging = false))

  setLevel(100)
}
