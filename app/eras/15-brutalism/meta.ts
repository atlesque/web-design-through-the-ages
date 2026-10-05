import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '15',
  slug: '15-brutalism',
  title: 'Brutalism & neubrutalism',
  years: '2016–2024',
  summary:
    'A reaction to templated flat design: first raw, default-stylesheet pages that showed their seams on purpose, then a friendlier neubrutalism of thick black outlines, hard shadows and loud flat colour.',
  context: {
    screens: 'Retina laptops and large phones; designers deliberately ignoring them',
    connection: 'Fast broadband and 4G; tiny pages as a statement against bloated ones',
    browsers: 'Evergreen Chrome, Firefox and Safari; CSS Grid from 2017, :has() from 2022–23',
  },
  traits: [
    { id: 'toggle', label: 'Same content, two skins: Raw (2016) and Neubrutalist (2021+)' },
    { id: 'raw-html', label: 'Default browser styles, Times and blue underlined links' },
    { id: 'broken-grid', label: 'A visible grid that elements deliberately break out of' },
    { id: 'marquee', label: 'Scrolling ticker text' },
    { id: 'borders', label: 'Visible borders everywhere' },
    { id: 'hard-shadow', label: 'Hard, unblurred offset shadows' },
    { id: 'press', label: 'Buttons that press into their shadow' },
    { id: 'stickers', label: 'Rotated stickers and pill badges' },
  ],
  tech: [
    'Raw HTML and the user-agent stylesheet, used on purpose',
    'CSS Grid with items placed to overlap and overflow their tracks',
    'box-shadow with zero blur (6px 6px 0 #000) and thick solid borders',
    'Here: a radio button plus :has() swaps every custom property, so the toggle works without JavaScript',
  ],
  thenVsNow:
    'Neubrutalism went mainstream in app UIs and landing pages; the raw strand lives on in personal sites and the small-web movement.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'The variant switch is just radios', region: 'toggle' },
    { file: 'era.css', lang: 'css', caption: ':has() swaps the whole theme', region: 'neo' },
    { file: 'era.css', lang: 'css', caption: 'A button that presses into its shadow', region: 'press-css' },
    { file: 'era.css', lang: 'css', caption: 'The ticker, now that <marquee> is retired', region: 'marquee' },
  ],
  sources: [
    { label: 'Brutalist Websites (Pascal Deville)', url: 'https://brutalistwebsites.com/' },
    { label: 'Brutalist architecture (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Brutalist_architecture' },
    { label: 'Neubrutalism – UI Design Trend (Nielsen Norman Group)', url: 'https://www.nngroup.com/articles/neobrutalism/' },
    { label: ':has() (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has' },
  ],
  cta: { next: 'NEXT →', prev: '← back' },
  recreated: ['The scrolling ticker is a CSS transform animation, not the obsolete <marquee> element; it can be paused.'],
}

export default meta
