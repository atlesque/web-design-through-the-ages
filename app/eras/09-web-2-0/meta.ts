import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '09',
  slug: '09-web-2-0',
  title: 'Web 2.0 gloss',
  years: '2005–2009',
  summary:
    'The web became an app platform: perpetually beta startups with glossy pill buttons, wet-floor logos, tag clouds and pages that updated themselves with Ajax.',
  context: {
    screens: '1024×768 and up; the first widescreen laptops and LCDs',
    connection: 'Always-on broadband made background requests (XMLHttpRequest) practical',
    browsers: 'Firefox 2 and 3, Safari 3, Internet Explorer 7; the iPhone arrived in 2007',
  },
  traits: [
    { id: 'reflection', label: 'Wet-floor reflection under the logo' },
    { id: 'beta', label: 'The ever-present BETA badge' },
    { id: 'gloss', label: 'Glossy pill buttons with a halfway highlight' },
    { id: 'stripes', label: 'Diagonal stripes and pastel gradients' },
    { id: 'icons', label: 'Big glossy feature icons' },
    { id: 'ajax', label: 'Ajax spinner and the Yellow Fade Technique' },
    { id: 'tag-cloud', label: 'Folksonomy tag cloud' },
    { id: 'share', label: 'Row of social bookmarking buttons' },
  ],
  tech: [
    'XMLHttpRequest and libraries such as Prototype, script.aculo.us and jQuery',
    'Sliced background images for gradients, gloss and rounded corners (here: CSS gradients and border-radius)',
    'Animated GIF loading spinners',
    'Bookmarklets, RSS everywhere and public APIs for mashups',
    'Ruby on Rails and other convention-over-configuration frameworks',
  ],
  thenVsNow:
    'Gloss and reflections gave way to flat design, but Ajax became simply how the web works: fetch(), live updates and single-page apps.',
  snippets: [
    { file: 'era.css', lang: 'css', caption: 'The glossy pill: a hard stop halfway down a gradient', region: 'pill' },
    { file: 'era.css', lang: 'css', caption: 'Wet-floor reflection with a fallback', region: 'reflection' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'A pretend Ajax save with the yellow fade', region: 'ajax-save' },
  ],
  sources: [
    { label: 'Web 2.0 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Web_2.0' },
    { label: 'XMLHttpRequest (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest' },
    { label: 'Ajax (programming) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Ajax_(programming)' },
    { label: 'Folksonomy (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Folksonomy' },
    { label: '-webkit-box-reflect (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-box-reflect' },
  ],
  recreated: [
    'Gloss, gradients and rounded corners were sliced PNG images in 2006; here they are CSS gradients and border-radius.',
    'The "Ajax" save is simulated with a timer; no request leaves the page.',
  ],
}

export default meta
