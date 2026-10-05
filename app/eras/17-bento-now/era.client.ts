// Era 17 behaviour: View Transitions for the bento, a container-width slider and live feature detection.

type DocVT = Document & { startViewTransition?: (cb: () => void) => unknown }

export default function setup(root: HTMLElement) {
  const bento = root.querySelector<HTMLElement>('.qn__bento')!
  const tiles = Array.from(bento.querySelectorAll<HTMLElement>('.qn__tile'))

  // snippet:vt:start
  /** Wrap a DOM change in a view transition when the browser has one; otherwise just change it. */
  function transition(change: () => void) {
    const doc = document as DocVT
    const still =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('readable')
    if (!doc.startViewTransition || still) return change()
    doc.startViewTransition(change)
  }
  // snippet:vt:end

  bento.querySelectorAll<HTMLButtonElement>('.qn__expand').forEach((btn) => {
    const tile = btn.closest<HTMLElement>('.qn__tile')!
    const title = tile.querySelector('h2, blockquote p')?.textContent?.trim() ?? 'tile'
    btn.setAttribute('aria-label', `Expand: ${title}`)
    btn.addEventListener('click', () =>
      transition(() => {
        const open = !tile.classList.contains('is-open')
        tiles.forEach((t) => {
          t.classList.remove('is-open')
          t.querySelector('.qn__expand')!.setAttribute('aria-expanded', 'false')
        })
        tile.classList.toggle('is-open', open)
        btn.setAttribute('aria-expanded', String(open))
        btn.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'}: ${title}`)
      }),
    )
  })

  const filters = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'))
  filters.forEach((f) =>
    f.addEventListener('click', () =>
      transition(() => {
        const tag = f.dataset.filter!
        filters.forEach((o) => o.setAttribute('aria-pressed', String(o === f)))
        tiles.forEach((t) => (t.hidden = tag !== 'all' && !t.dataset.tags!.split(' ').includes(tag)))
        bento.classList.toggle('is-filtered', tag !== 'all')
      }),
    ),
  )

  // Container width slider
  const range = root.querySelector<HTMLInputElement>('#qn-width')!
  const out = root.querySelector<HTMLOutputElement>('#qn-width-out')!
  const cq = root.querySelector<HTMLElement>('#qn-cq')!
  range.addEventListener('input', () => {
    cq.style.setProperty('--cq', `${range.value}%`)
    out.textContent = `${range.value}%`
  })

  // snippet:detect:start
  const checks: Record<string, () => boolean> = {
    vt: () => 'startViewTransition' in document,
    sda: () => CSS.supports('animation-timeline: view()'),
    has: () => CSS.supports('selector(:has(a))'),
    cq: () => CSS.supports('container-type: inline-size'),
    subgrid: () => CSS.supports('grid-template-rows: subgrid'),
    anchor: () => CSS.supports('anchor-name: --a'),
    oklch: () => CSS.supports('color: color-mix(in oklch, oklch(60% 0.2 30), white)'),
    nesting: () => CSS.supports('selector(&)'),
    popover: () => HTMLElement.prototype.hasOwnProperty('popover'),
  }
  root.querySelectorAll<HTMLElement>('[data-check]').forEach((li) => {
    let ok = false
    try {
      ok = checks[li.dataset.check!]?.() ?? false
    } catch {
      ok = false
    }
    li.classList.add(ok ? 'is-yes' : 'is-no')
    li.querySelector('b')!.textContent = ok ? '✓ Supported' : '✕ Not supported'
  })
  // snippet:detect:end
}
