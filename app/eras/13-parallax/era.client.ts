// Era 13 behaviour: scroll-linked parallax layers, chapter highlighting and scroll reveal.

export default function setup(root: HTMLElement) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('.px-scene')).map((el) => ({
    el,
    layers: Array.from(el.querySelectorAll<SVGElement>('.px-layer')).map((l) => ({ l, depth: Number(l.dataset.depth) || 0 })),
  }))
  const observers: IntersectionObserver[] = []
  let frame = 0

  // snippet:parallax:start
  function update() {
    frame = 0
    const vh = innerHeight
    for (const { el, layers } of scenes) {
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > vh) continue // off screen: skip the work
      const d = el.classList.contains('px-hero') ? r.top : r.top + r.height / 2 - vh / 2
      for (const { l, depth } of layers) {
        // Far layers (low depth) lag behind the page; near layers rush past it.
        l.style.setProperty('--shift', `${(-d * (0.6 - depth) * 0.35).toFixed(1)}px`)
      }
    }
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  // snippet:parallax:end

  if (!still) {
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    update()
  }

  // Highlight the chapter in view.
  const links = new Map<string, HTMLAnchorElement>()
  root.querySelectorAll<HTMLAnchorElement>('.px-nav ol a').forEach((a) => links.set(a.hash.slice(1), a))
  // snippet:spy:start
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        links.forEach((a, id) => {
          const on = id === e.target.id
          a.classList.toggle('is-active', on)
          if (on) {
            a.setAttribute('aria-current', 'location')
            const ol = a.closest('ol')!
            if (ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: a.offsetLeft - ol.offsetLeft - 16 })
          }
          else a.removeAttribute('aria-current')
        })
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  // snippet:spy:end
  links.forEach((_, id) => {
    const el = root.querySelector(`#${id}`)
    if (el) spy.observe(el)
  })
  observers.push(spy)

  // Reveal chapter text as it scrolls in.
  if (!still && 'IntersectionObserver' in window) {
    root.classList.add('js-reveal')
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            reveal.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    root.querySelectorAll('[data-trait~="reveal"]').forEach((el) => reveal.observe(el))
    observers.push(reveal)
  }

  return () => {
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', onScroll)
    cancelAnimationFrame(frame)
    observers.forEach((o) => o.disconnect())
    root.classList.remove('js-reveal')
  }
}
