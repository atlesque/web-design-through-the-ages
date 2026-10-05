// FriendSpace profile frame: receives "About me" CSS from the parent page and
// plays the profile song (a tiny Web Audio chiptune) only after a click.
(function () {
  'use strict'
  var userCss = document.getElementById('user-css')

  // Mirror the museum's readable mode and reduced-motion preference if the parent is same-origin.
  function syncReadable() {
    try {
      var on = window.parent !== window && window.parent.document.documentElement.classList.contains('readable')
      document.documentElement.classList.toggle('readable', !!on)
    } catch (e) {}
  }
  syncReadable()

  // Only accept messages from our own origin and from the page that embeds us.
  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return
    if (event.source !== window.parent) return
    var data = event.data
    if (!data || data.type !== 'fs-css' || typeof data.css !== 'string') return
    // textContent, never innerHTML: the text is parsed as CSS only, so it cannot add markup or scripts.
    userCss.textContent = data.css.slice(0, 20000)
    syncReadable()
  })

  // Tell the parent we are ready to receive CSS (it may have loaded before us).
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'fs-ready' }, window.location.origin)
  }

  // ---- Profile song ----
  var button = document.getElementById('play')
  var progress = document.getElementById('progress')
  var ctx = null
  var timer = 0
  var step = 0
  // An original 16-step melody in C major (MIDI note numbers, 0 = rest).
  var melody = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 0]
  var bass = [48, 48, 55, 55, 50, 50, 53, 53, 48, 48, 55, 55, 55, 55, 52, 52]
  var LOOPS = 4

  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12) }
  function blip(freq, type, vol, len) {
    var t = ctx.currentTime
    var osc = ctx.createOscillator()
    var gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + len)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + len + 0.02)
  }
  function stop() {
    clearInterval(timer)
    timer = 0
    step = 0
    button.setAttribute('aria-pressed', 'false')
    button.innerHTML = '&#9654; Play'
    progress.style.width = '0'
  }
  function tick() {
    var i = step % 16
    if (melody[i]) blip(hz(melody[i]), 'square', 0.05, 0.16)
    blip(hz(bass[i]), 'triangle', 0.09, 0.2)
    step++
    progress.style.width = Math.min(100, (step / (16 * LOOPS)) * 100) + '%'
    if (step >= 16 * LOOPS) stop()
  }
  if (button) {
    button.addEventListener('click', function () {
      if (timer) { stop(); return }
      var AC = window.AudioContext || window.webkitAudioContext
      if (!AC) { button.textContent = 'No audio :('; return }
      ctx = ctx || new AC()
      if (ctx.state === 'suspended') ctx.resume()
      button.setAttribute('aria-pressed', 'true')
      button.innerHTML = '&#9632; Stop'
      tick()
      timer = setInterval(tick, 190)
    })
  }
})()
