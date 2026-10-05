import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '06',
  slug: '06-y2k',
  title: 'Y2K chrome & futurism',
  years: '1998–2003',
  summary:
    'At the turn of the millennium the web went shiny: brushed-chrome logos, blobby gel buttons, translucent candy-coloured plastic, lens flares, bubbles and an "e-" in front of everything.',
  context: {
    screens: '1024×768 CRTs in "millions of colours"; candy-coloured all-in-one computers on desks',
    connection: '56k dial-up and the first cable and DSL broadband at home',
    browsers: 'Internet Explorer 5 and Netscape 4.7, with Flash 4 for anything that moved',
  },
  traits: [
    { id: 'chrome', label: 'A beveled chrome logo with a lens flare' },
    { id: 'e-everything', label: 'e-Everything copywriting' },
    { id: 'blobs', label: 'Organic blob buttons that glow on hover' },
    { id: 'candy', label: 'Translucent candy plastic in fruit flavours' },
    { id: 'countdown', label: 'A millennium countdown clock' },
    { id: 'scan', label: 'A Y2K compliance check' },
    { id: 'footer', label: '"Y2K ready" and "enhanced for 4.0 browsers" badges' },
  ],
  tech: [
    'Chrome and gel effects rendered in Photoshop and Bryce, then exported as GIF and JPEG slices',
    'Image maps and JavaScript rollovers for the blob buttons',
    'DHTML countdown clocks with setTimeout and document.all / document.layers',
    'Recreated here with SVG lighting filters, CSS gradients, border-radius blobs, backdrop-filter and :has()',
  ],
  thenVsNow:
    'Flat design swept the gloss away around 2013, but SVG filters, backdrop-filter and gradients now draw the same chrome and glass without a single image.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'Chrome from an SVG gradient and specular lighting filter', region: 'chrome-filter' },
    { file: 'demo.html', lang: 'html', caption: 'Blob buttons are just links', region: 'blob-nav' },
    { file: 'era.css', lang: 'css', caption: 'Picking a candy colour with :has(), no script needed', region: 'candy' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Counting down to 2000 from a pretend 1999', region: 'countdown' },
  ],
  sources: [
    { label: 'Year 2000 problem (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Year_2000_problem' },
    { label: 'Y2K aesthetic (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Y2K_aesthetic' },
    { label: 'feSpecularLighting (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting' },
    { label: 'backdrop-filter (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter' },
    { label: 'Web Design Museum', url: 'https://www.webdesignmuseum.org/' },
  ],
  recreated: [
    'Chrome, gel and glass were pre-rendered images in 1999; here they are live SVG filters and CSS gradients.',
    'The countdown pretends it is November 1999 and the compliance scan checks nothing.',
  ],
}

export default meta
