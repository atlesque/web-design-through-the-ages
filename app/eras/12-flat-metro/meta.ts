import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '12',
  slug: '12-flat-metro',
  title: 'Flat & Metro',
  years: '2012–2016',
  summary:
    'Interfaces dropped the leather and gloss for solid colour, thin type and tiles. Inspired by transit signage and Swiss typography, “flat” made content the interface.',
  context: {
    screens: 'High-density phone and tablet screens everywhere; layouts had to look crisp at 1×, 2× and 3×',
    connection: '4G and fast broadband; icon fonts and SVG replaced image sprites',
    browsers: 'Chrome, Firefox, Safari, IE10/11 with flexbox; Windows 8 tiles and iOS 7 set the visual tone',
  },
  traits: [
    { id: 'tiles', label: 'A grid of solid-colour tiles' },
    { id: 'live', label: 'Live tiles that flip to show new content' },
    { id: 'long-shadow', label: 'Long-shadow icons' },
    { id: 'ghost', label: 'Ghost buttons: outline only, no fill' },
    { id: 'thin', label: 'Thin, lowercase sans-serif headlines' },
    { id: 'panel', label: 'Content panels that slide in, edge to edge' },
  ],
  tech: [
    'Flexbox (fully supported from IE11 and the 2013–2014 browsers)',
    'Web fonts with light weights, and system fonts like Segoe UI Light',
    'Icon fonts and SVG icons instead of bitmap sprites',
    'CSS transitions and transforms for tile motion',
  ],
  thenVsNow:
    'Pure flat proved hard to read (what is a button?), so Material Design brought back purposeful shadow; the colour palettes and thin type remain.',
  snippets: [
    { file: 'era.css', lang: 'css', caption: 'A long shadow is just 60 stacked text-shadows', region: 'long-shadow' },
    { file: 'era.css', lang: 'css', caption: 'Live tiles: two faces that slide in turn', region: 'live' },
    { file: 'era.css', lang: 'css', caption: 'The ghost button', region: 'ghost' },
    { file: 'demo.html', lang: 'html', caption: 'Tiles are buttons in a list', region: 'tiles' },
  ],
  sources: [
    { label: 'Flat design (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Flat_design' },
    { label: 'Metro (design language) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Metro_(design_language)' },
    { label: 'Flexbox (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox' },
    { label: 'Flat UI Colors', url: 'https://flatuicolors.com/' },
  ],
  cta: { next: 'next', prev: 'back' },
  recreated: [
    'Flat UI palette colours are darkened here so white text on every tile meets WCAG AA; the originals (#1abc9c, #3498db…) were lighter.',
  ],
}

export default meta
