import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '04',
  slug: '04-tables-portals',
  title: 'Table layouts & portals',
  years: '1996–2003',
  summary:
    'Designers bent HTML tables into page grids: sliced header images, spacer GIFs, image rollovers and dense three-column portals squeezed into 760 pixels for an 800×600 screen.',
  context: {
    screens: '800×600 on 15-inch CRTs was the target; plenty of visitors were still on 640×480',
    connection: '28.8k and 56k dial-up modems; every sliced image was a separate request worth caching',
    browsers: 'Internet Explorer 4–6 and Netscape Navigator 4, with very different CSS support',
  },
  traits: [
    { id: 'table-layout', label: 'Nested tables with cellpadding="0" and cellspacing="0" as the page grid' },
    { id: 'sliced', label: 'A header image sliced into pieces and reassembled in table cells' },
    { id: 'rollovers', label: 'JavaScript image-swap rollovers in the left nav' },
    { id: 'dense', label: 'Dense 10–11px Verdana everywhere' },
    { id: 'search', label: 'A search box front and centre' },
    { id: 'signup', label: 'Free email sign-up to build the portal\'s audience' },
    { id: 'frames', label: 'A <frameset> members area' },
    { id: 'viewport', label: '"Best viewed at 800x600" fixed widths' },
    { id: 'footer', label: '© footer with "Best viewed at" note' },
  ],
  tech: [
    'HTML 3.2 / 4.0 tables with width, bgcolor, valign and nowrap attributes',
    'Transparent 1×1 spacer GIFs stretched with width and height to force gaps',
    'Image slicing tools that exported a table of image fragments',
    'onmouseover / onmouseout swapping img.src for rollovers',
    '<frameset> and target="name" to keep the navigation loaded',
    'Verdana and Tahoma, screen fonts hinted for small sizes',
  ],
  thenVsNow:
    'CSS layout, then Flexbox and Grid, replaced layout tables; :hover replaced image-swap rollovers and fluid, responsive pages replaced "best viewed at 800x600".',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'A sliced header, reassembled with a spacer GIF', region: 'sliced-header' },
    { file: 'demo.html', lang: 'html', caption: 'Three columns made of nested tables', region: 'portal-grid' },
    { file: 'era.css', lang: 'css', caption: 'Simulating 640, 800 and fluid screens', region: 'viewport' },
  ],
  sources: [
    { label: 'Spacer GIF (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Spacer_GIF' },
    { label: 'Web portal (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Web_portal' },
    { label: 'HTML 4.01: Frames (W3C)', url: 'https://www.w3.org/TR/html401/present/frames.html' },
    { label: 'HTML 4.01: Tables (W3C)', url: 'https://www.w3.org/TR/html401/struct/tables.html' },
    { label: 'Web Design Museum', url: 'https://www.webdesignmuseum.org/' },
  ],
  recreated: [
    'The browser window and its 640/800 widths are simulated inside the page; the portal inside it is real table markup.',
    'Rollover images are inline SVG data URIs rather than GIFs.',
  ],
}

export default meta
