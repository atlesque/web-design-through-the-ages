// Era 09 behaviour: a fake "Ajax" save. Show the spinner, wait a moment as if
// an XMLHttpRequest were out, then insert the new item with the yellow fade.

export default function setup(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('.gl__add')
  const input = root.querySelector<HTMLInputElement>('#gl-input')
  const list = root.querySelector<HTMLUListElement>('.gl__list')
  const num = root.querySelector<HTMLElement>('#gl-num')
  const status = root.querySelector<HTMLElement>('.gl__spin-text')
  if (!form || !input || !list) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const ideas = ['A really good banana bread', 'Free fonts for your blog', 'Cute cat in a box', 'How to build a mashup with maps']
  let busy = false
  let timer = 0

  // snippet:ajax-save:start
  function onSubmit(e: Event) {
    e.preventDefault()
    if (busy) return
    const text = input!.value.trim() || ideas[Math.floor(Math.random() * ideas.length)]
    busy = true
    form!.classList.add('is-busy')
    if (status) status.textContent = 'Saving…'
    // In 2006 this was new XMLHttpRequest() and a callback; here we only pretend.
    timer = window.setTimeout(() => {
      const li = document.createElement('li')
      const b = document.createElement('b')
      b.textContent = text
      const meta = document.createElement('span')
      meta.className = 'gl__meta'
      meta.textContent = 'by you, just now'
      li.append(b, ' ', meta)
      li.classList.add('is-new') // the Yellow Fade Technique
      list!.prepend(li)
      if (num) num.textContent = String(list!.children.length)
      form!.classList.remove('is-busy')
      if (status) status.textContent = 'Saved!'
      input!.value = ''
      busy = false
    }, reduced ? 300 : 1100)
  }
  // snippet:ajax-save:end

  form.addEventListener('submit', onSubmit)
  return () => {
    clearTimeout(timer)
    form.removeEventListener('submit', onSubmit)
  }
}
