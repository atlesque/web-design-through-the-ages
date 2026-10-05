// Era 15 behaviour: remember the chosen variant and answer the join form.
// The Raw / Neubrutalist switch itself is pure CSS (:has() on a radio), so it works without this file.

export default function setup(root: HTMLElement) {
  const radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="cc-variant"]'))
  // snippet:remember:start
  try {
    const saved = localStorage.getItem('era15-variant')
    const match = radios.find((r) => r.value === saved)
    if (match) match.checked = true
  } catch {
    /* storage blocked: the default (Raw) stays */
  }
  const onChange = (e: Event) => {
    const r = e.target as HTMLInputElement
    if (r.name !== 'cc-variant') return
    try {
      localStorage.setItem('era15-variant', r.value)
    } catch {
      /* ignore */
    }
  }
  // snippet:remember:end
  root.addEventListener('change', onChange)

  const form = root.querySelector<HTMLFormElement>('.cc__form')!
  const out = root.querySelector<HTMLOutputElement>('.cc__out')!
  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    const fav = (root.querySelector<HTMLInputElement>('#cc-fav')!.value.trim() || '<marquee>').slice(0, 24)
    const neo = root.querySelector<HTMLInputElement>('#cc-neo')!.checked
    out.textContent = neo
      ? `You're in! ${fav} is a great pick. Sticker pack on its way.`
      : `OK. ${fav}. noted. there is no confirmation email.`
    form.reset()
  }
  form.addEventListener('submit', onSubmit)

  return () => {
    root.removeEventListener('change', onChange)
    form.removeEventListener('submit', onSubmit)
  }
}
