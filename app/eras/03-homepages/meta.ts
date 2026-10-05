import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '03',
  slug: '03-homepages',
  title: 'Personal homepages',
  years: '1995–2000',
  summary:
    'Free hosting turned everyone into a webmaster: tiled star backgrounds, Comic Sans, hit counters, guestbooks, webrings and an “under construction” sign that never came down.',
  context: {
    screens: '800×600 on 15-inch CRTs, 256 colours or “thousands”; 640×480 still common',
    connection: '28.8k and 56k dial-up modems; every GIF counted against a minute-by-minute load',
    browsers: 'Netscape Navigator 3–4 and Internet Explorer 3–5, each with its own tags',
  },
  traits: [
    { id: 'tiled-bg', label: 'A tiled background image' },
    { id: 'comic-sans', label: '<font face="Comic Sans MS">, <center> and a rainbow bar' },
    { id: 'under-construction', label: 'An animated “under construction” GIF' },
    { id: 'marquee', label: 'Scrolling <marquee> and <blink>ing text' },
    { id: 'hit-counter', label: 'An odometer-style hit counter' },
    { id: 'guestbook', label: 'A guestbook (sign it!)' },
    { id: 'webring', label: 'A webring navigation bar' },
    { id: 'best-viewed', label: '“Best viewed in … at 800x600” badge, MIDI and a mailbox GIF' },
  ],
  tech: [
    'Table layouts with fixed widths and align="left" images',
    'Presentational HTML: <font>, <center>, bgcolor, BACKGROUND= and <br clear="all">',
    'Animated GIFs, CGI hit counters and Perl guestbook scripts on the free host',
    '<marquee>, <blink>, and <embed>/<bgsound> for MIDI files',
  ],
  thenVsNow:
    'Guestbooks became comment sections, webrings became social feeds and link-in-bio pages, and hit counters became analytics dashboards nobody else can see.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'Layout with <table>, <center> and <font>', region: 'layout' },
    { file: 'era.css', lang: 'css', caption: 'Recreating <marquee> with a CSS animation', region: 'marquee' },
    { file: 'era.css', lang: 'css', caption: 'The tiled star background', region: 'tile' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'A “MIDI” tune with Web Audio, only after a click', region: 'midi' },
  ],
  sources: [
    { label: 'GeoCities (Wikipedia)', url: 'https://en.wikipedia.org/wiki/GeoCities' },
    { label: 'Webring (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Webring' },
    { label: 'The marquee element (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee' },
    { label: 'Blink element (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Blink_element' },
    { label: 'Web Design Museum', url: 'https://www.webdesignmuseum.org/' },
    { label: 'GIFs: “Under construction” collection (Archive Team, textfiles.com)', url: 'http://www.textfiles.com/underconstruction/' },
    { label: 'GIFs: 22k Animated Gifs (Internet Archive)', url: 'https://archive.org/details/22k-animated-gifs' },
  ],
  cta: { next: 'ENTER the next era!!', prev: '<< Go back' },
  recreated: [
    '<marquee> and <blink> are recreated with CSS animations (blink at 1 Hz, under the flash threshold).',
    'Most animated GIFs are 1990s originals: the under-construction sign from a real GeoCities page (via Archive Team), the globe, mailbox, NEW!, dancer, rainbow rule and counter digits from a 90s clip-art collection on the Internet Archive. The fire bar and the 88x31 badges are new, drawn by a script in this repo, because the real badges carried real logos. With reduced motion or readable mode on you get a still frame of each.',
    'Background MIDI is replaced by a Web Audio square-wave tune that only plays after you press Play.',
    'The hit counter and guestbook live in your browser’s localStorage instead of a CGI script.',
  ],
}

export default meta
