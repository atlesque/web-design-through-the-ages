// Era 08 behaviour: the FriendSpace "About me" CSS sandbox.
// CSS typed in the textarea is posted to the same-origin profile iframe,
// whose own script (public/demos/profile/profile.js) puts it in a <style>.

const PRESETS: Record<string, string> = {
  glitter: `/* ~*glitter pink layout*~ by pinkmarshmallow */
body { background: #ffd6ec repeating-linear-gradient(45deg, #ffc0e3 0 10px, #ffe3f3 10px 20px); }
.page { background: rgba(255,255,255,.7); border: 3px dotted #ff3fa4; }
#fs-bar, #fs-menu { background: #ff3fa4; }
.bluehead, .headtext { background: #ff7ac2; color: #fff; }
.box { border: 2px solid #ff3fa4; }
.nametext { color: #ff3fa4; font-family: 'Comic Sans MS', cursive; text-shadow: 2px 2px #fff; }
a { color: #c0007a; }
.comments td { background: #ffe0f1; }
body, td { font-family: 'Comic Sans MS', cursive; }`,
  emo: `/* black emo layout. dont steal. */
body { background: #000; color: #ccc; }
.page { background: #0a0a0a; }
#fs-bar, #fs-menu { background: #111; border-bottom: 1px solid #c00; }
.bluehead, .headtext { background: #000; color: #c00; border-bottom: 1px solid #c00; letter-spacing: 3px; text-transform: lowercase; }
.box { border: 1px solid #333; }
td { color: #aaa; background: transparent; }
.comments td, .comments td.who, .contact td, .url, .player { background: #111; border-color: #333; }
.nametext { color: #fff; font-family: Georgia, serif; font-style: italic; }
a { color: #f33; }
svg { filter: grayscale(1) contrast(1.3); }`,
  hacked: `/* hacked tables: hide the boring stuff, float everything */
.extended, .interests, .url { display: none; }
body { background: #003; }
.page { background: transparent; }
table, td { background: transparent; border: 0; color: #0f0; font-family: 'Courier New', monospace; }
.leftcol, .rightcol { display: block; width: 600px; }
.box { border: 1px dashed #0f0; }
.bluehead, .headtext { background: #0f0; color: #000; }
.top8 td { display: inline-block; width: 22%; }
a { color: #ff0; }
.nametext { color: #0f0; font: bold 26px 'Courier New', monospace; }`,
  reset: `/* paste a layout or write your own! */
body { background: #e8f0ff; }`,
}

export default function setup(root: HTMLElement) {
  const textarea = root.querySelector<HTMLTextAreaElement>('#fs-css')
  const frame = root.querySelector<HTMLIFrameElement>('.fs__frame')
  const status = root.querySelector<HTMLElement>('.fs__status')
  if (!textarea || !frame) return

  // snippet:post-css:start
  function send() {
    // targetOrigin = our own origin: the CSS never leaves this site.
    frame!.contentWindow?.postMessage({ type: 'fs-css', css: textarea!.value }, location.origin)
  }
  // snippet:post-css:end

  let debounce = 0
  const onInput = () => {
    clearTimeout(debounce)
    debounce = window.setTimeout(send, 200)
  }
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== location.origin || e.source !== frame.contentWindow) return
    if (e.data?.type === 'fs-ready') send()
  }
  const onLoad = () => send()
  const onPreset = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-preset]')
    if (!btn) return
    textarea.value = PRESETS[btn.dataset.preset!] ?? ''
    send()
    if (status) status.textContent = `Layout "${btn.textContent}" pasted into About Me.`
  }
  const presets = root.querySelector('.fs__presets')

  textarea.addEventListener('input', onInput)
  window.addEventListener('message', onMessage)
  frame.addEventListener('load', onLoad)
  presets?.addEventListener('click', onPreset)
  send()

  return () => {
    clearTimeout(debounce)
    textarea.removeEventListener('input', onInput)
    window.removeEventListener('message', onMessage)
    frame.removeEventListener('load', onLoad)
    presets?.removeEventListener('click', onPreset)
  }
}
