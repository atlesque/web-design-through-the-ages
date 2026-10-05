// Era 11 behaviour: a device-width resizer around the Hatchly iframe.

export default function setup(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('#rw-stage')!
  const device = root.querySelector<HTMLElement>('#rw-device')!
  const frame = root.querySelector<HTMLIFrameElement>('#rw-frame')!
  const handle = root.querySelector<HTMLElement>('#rw-handle')!
  const readout = root.querySelector<HTMLOutputElement>('#rw-readout')!
  const ruler = root.querySelector<HTMLElement>('.rw-ruler')!
  const grid = root.querySelector<HTMLInputElement>('#rw-grid')!
  const devButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.rw-dev'))
  const MIN = 280
  const MAX = 1600
  const GRIP = 20
  let width = 1024

  // snippet:resize:start
  function tier(w: number) {
    return w >= 1200 ? 'lg' : w >= 992 ? 'md' : w >= 768 ? 'sm' : 'xs'
  }
  function setWidth(w: number) {
    width = Math.round(Math.max(MIN, Math.min(MAX, w)))
    const room = stage.clientWidth - GRIP
    const scale = Math.min(1, room / width) // shrink big "screens" to fit, like a zoomed-out browser
    device.style.width = `${width}px`
    device.style.transform = scale < 1 ? `scale(${scale})` : ''
    stage.style.height = `${device.offsetHeight * scale + 6}px`
    ruler.style.setProperty('--scale', String(scale))
    ruler.style.setProperty('--w', `${width * scale}px`)
    readout.textContent = `${width}px · ${tier(width)}${scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ''}`
    handle.setAttribute('aria-valuenow', String(width))
    handle.setAttribute('aria-valuetext', `${width} pixels`)
    devButtons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.w) === width)))
  }
  // snippet:resize:end

  handle.hidden = false
  root.querySelectorAll<HTMLButtonElement>('[data-w]').forEach((b) =>
    b.addEventListener('click', () => {
      setWidth(Number(b.dataset.w))
      if (b.classList.contains('rw-try')) stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }),
  )

  let startX = 0
  let startW = 0
  let scaleAtStart = 1
  handle.addEventListener('pointerdown', (e) => {
    startX = e.clientX
    startW = width
    scaleAtStart = device.getBoundingClientRect().width / device.offsetWidth || 1
    handle.setPointerCapture(e.pointerId)
    stage.classList.add('is-dragging')
  })
  handle.addEventListener('pointermove', (e) => {
    if (!stage.classList.contains('is-dragging')) return
    setWidth(startW + (e.clientX - startX) / scaleAtStart)
  })
  const stop = () => stage.classList.remove('is-dragging')
  handle.addEventListener('pointerup', stop)
  handle.addEventListener('pointercancel', stop)
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 100 : 10
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setWidth(width + step)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setWidth(width - step)
    else if (e.key === 'Home') setWidth(MIN)
    else if (e.key === 'End') setWidth(MAX)
    else return
    e.preventDefault()
  })

  const sendGrid = () => {
    try {
      frame.contentWindow?.postMessage({ hatchlyGrid: grid.checked }, location.origin)
    } catch {}
  }
  grid.addEventListener('change', sendGrid)
  frame.addEventListener('load', sendGrid)

  const ro = new ResizeObserver(() => setWidth(width))
  ro.observe(stage)
  setWidth(stage.clientWidth < 700 ? 320 : 1024)

  return () => ro.disconnect()
}
