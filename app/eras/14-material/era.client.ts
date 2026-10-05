// Era 14 behaviour: ink ripples, the FAB speed dial and dialog, and the snackbar with Undo.

export default function setup(root: HTMLElement) {
  const md = root.querySelector<HTMLElement>('.md')!
  md.classList.add('md--js')
  root.querySelectorAll('.era-cta a').forEach((a) => a.classList.add('ripple'))
  const quiet = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')

  // snippet:ripple:start
  /** Ink spreads from where the finger touched, sized to reach the far corner. */
  function ripple(e: PointerEvent) {
    const host = (e.target as HTMLElement).closest<HTMLElement>('.ripple')
    if (!host || !root.contains(host) || quiet()) return
    // A button inside a card ripples on its own; do not ripple the card too.
    if (host.classList.contains('md__card') && (e.target as HTMLElement).closest('button')) return
    const r = host.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const d = 2 * Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y))
    const ink = document.createElement('span')
    ink.className = 'md__ripple'
    ink.style.cssText = `--x:${x}px;--y:${y}px;--d:${d}px`
    host.append(ink)
    ink.addEventListener('animationend', () => ink.remove())
  }
  // snippet:ripple:end
  root.addEventListener('pointerdown', ripple)

  // Speed dial
  const wrap = root.querySelector<HTMLElement>('.md__fab-wrap')!
  const fab = root.querySelector<HTMLButtonElement>('#md-fab')!
  const setDial = (open: boolean) => {
    wrap.classList.toggle('is-open', open)
    fab.setAttribute('aria-expanded', String(open))
  }
  fab.addEventListener('click', () => setDial(!wrap.classList.contains('is-open')))
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && wrap.classList.contains('is-open')) {
      setDial(false)
      fab.focus()
    }
  }
  const onDocClick = (e: MouseEvent) => {
    if (!wrap.contains(e.target as Node)) setDial(false)
  }
  document.addEventListener('keydown', onKey)
  document.addEventListener('click', onDocClick)

  // The FAB morphs into the "New plant" dialog.
  const dialog = root.querySelector<HTMLDialogElement>('#md-dialog')!
  root.querySelector('[data-open-dialog]')!.addEventListener('click', () => {
    setDial(false)
    dialog.showModal()
  })
  dialog.addEventListener('close', () => {
    const form = dialog.querySelector('form')!
    if (dialog.returnValue === 'save') {
      const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim() || 'New plant'
      snack(`${name} planted`)
    }
    form.reset()
    fab.focus()
  })

  // snippet:snackbar:start
  const bar = root.querySelector<HTMLElement>('#md-snack')!
  const text = bar.querySelector<HTMLElement>('.md__snack-text')!
  const undo = bar.querySelector<HTMLButtonElement>('.md__snack-action')!
  let timer = 0
  let undoFn: (() => void) | null = null
  function snack(message: string, onUndo?: () => void) {
    clearTimeout(timer)
    text.textContent = message
    undoFn = onUndo ?? null
    undo.hidden = !onUndo
    bar.classList.add('is-shown')
    wrap.classList.add('is-lifted') // the FAB moves up out of the snackbar's way
    timer = window.setTimeout(hide, 4000)
  }
  function hide() {
    bar.classList.remove('is-shown')
    wrap.classList.remove('is-lifted')
  }
  undo.addEventListener('click', () => {
    undoFn?.()
    snack('Watering undone')
  })
  // snippet:snackbar:end

  root.querySelectorAll<HTMLButtonElement>('[data-water]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const name = btn.dataset.water!
      const verb = btn.dataset.verb ?? 'watered'
      const item = btn.closest('li')
      const meter = btn.closest('.md__card')?.querySelector<HTMLElement>('.md__meter span')
      const before = meter?.style.getPropertyValue('--v')
      if (item?.closest('.md__list')) item.classList.add('is-done')
      if (meter) meter.style.setProperty('--v', '100%')
      if (wrap.contains(btn)) setDial(false)
      const label = name.charAt(0).toUpperCase() + name.slice(1)
      snack(`${label} ${verb}`, () => {
        item?.classList.remove('is-done')
        if (meter && before) meter.style.setProperty('--v', before)
      })
    }),
  )

  return () => {
    root.removeEventListener('pointerdown', ripple)
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onDocClick)
    clearTimeout(timer)
    if (dialog.open) dialog.close()
  }
}
