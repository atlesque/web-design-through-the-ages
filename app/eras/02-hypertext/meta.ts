import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '02',
  slug: '02-hypertext',
  title: 'Early hypertext',
  years: '1991–1995',
  summary:
    'The first web pages had no design at all: authors wrote headings, paragraphs, lists and links, and the browser decided how they looked: grey page, black Times, blue underlined links.',
  context: {
    screens: '640×480 to 1024×768 workstation and PC monitors, often only 16 or 256 colours',
    connection: 'University Ethernet and leased lines; at home, 9,600 to 14,400 baud dial-up via SLIP',
    browsers: 'The line-mode browser, early X Window and Macintosh browsers; NCSA Mosaic from 1993',
  },
  traits: [
    { id: 'default-styles', label: 'No author CSS: browser default headings, lists and Times' },
    { id: 'browser-chrome', label: 'Grey page inside a grey browser window' },
    { id: 'blue-links', label: 'Blue underlined links that turn purple once visited' },
    { id: 'whats-new', label: 'A "What\'s New" page' },
    { id: 'inline-gif', label: 'A small inline image with ALT text' },
    { id: 'address', label: 'An <ADDRESS> footer with the webmaster\'s email' },
    { id: 'view-source', label: 'View Source: how everyone learned HTML' },
  ],
  tech: [
    'HTML 1 and 2: <H1>–<H6>, <P>, <UL>, <DL>, <ADDRESS>, <HR>, <PRE> and <A HREF>',
    'The <IMG> tag (1993) for inline GIF images, with ALT text for line-mode browsers',
    'Simple forms for the first interactive pages',
    'Presentation entirely up to the browser; stylesheets did not exist yet',
  ],
  thenVsNow:
    'The browser default stylesheet is still there under every site, and "View Source" became the browser developer tools.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'The whole page is just structure', region: 'document' },
    { file: 'era.css', lang: 'css', caption: 'The browser defaults this room re-creates', region: 'defaults' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'View Source shows the markup as sent', region: 'source' },
  ],
  sources: [
    { label: 'Mosaic (web browser) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Mosaic_(web_browser)' },
    { label: 'HTML Tags, the first HTML document (W3C)', url: 'https://www.w3.org/History/19921103-hypertext/hypertext/WWW/MarkUp/Tags.html' },
    { label: 'History of the World Wide Web (Wikipedia)', url: 'https://en.wikipedia.org/wiki/History_of_the_World_Wide_Web' },
    { label: 'Web Design Museum', url: 'https://www.webdesignmuseum.org/' },
  ],
  recreated: [
    'The browser window, toolbar and loading globe are drawn with CSS; the original program cannot run in a page.',
    'The modern browser default stylesheet is reset to match the period look (grey page, #0000ee links).',
  ],
}

export default meta
