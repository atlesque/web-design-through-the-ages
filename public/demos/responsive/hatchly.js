// Hatchly progressive enhancement, 2013 style (no jQuery, though everyone used it).
(function () {
  var html = document.documentElement
  html.className += ' js'

  // Navbar: the checkbox hack works without JS; JS adds aria-expanded and keyboard support.
  var box = document.getElementById('nav-toggle')
  var toggle = document.querySelector('.navbar-toggle')
  function sync() { toggle.setAttribute('aria-expanded', box.checked ? 'true' : 'false') }
  box.addEventListener('change', sync)
  toggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.checked = !box.checked; sync() }
  })
  document.querySelectorAll('.navbar-collapse a').forEach(function (a) {
    a.addEventListener('click', function () { box.checked = false; sync() })
  })

  // Carousel: prev/next buttons and indicator dots. No autoplay.
  var items = [].slice.call(document.querySelectorAll('.carousel .item'))
  var dots = [].slice.call(document.querySelectorAll('.carousel-indicators a'))
  var current = 0
  function go(i) {
    current = (i + items.length) % items.length
    items.forEach(function (el, n) { el.classList.toggle('active', n === current) })
    dots.forEach(function (d, n) {
      if (n === current) d.setAttribute('aria-current', 'true')
      else d.removeAttribute('aria-current')
    })
  }
  document.querySelectorAll('.carousel-control').forEach(function (b) {
    b.hidden = false
    b.addEventListener('click', function () { go(current + (b.classList.contains('left') ? -1 : 1)) })
  })
  dots.forEach(function (d, n) {
    d.addEventListener('click', function (e) { e.preventDefault(); go(n) })
  })

  addEventListener('message', function (e) {
    if (e.origin === location.origin && e.data && 'hatchlyGrid' in e.data) {
      document.body.classList.toggle('show-grid', !!e.data.hatchlyGrid)
    }
  })

  // Tell the museum room how wide this "device" is.
  function report() {
    try { parent.postMessage({ hatchlyWidth: innerWidth }, location.origin) } catch (e) {}
  }
  addEventListener('resize', report)
  report()
})()
