import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '11',
  slug: '11-responsive',
  title: 'Responsive & grid frameworks',
  years: '2010–2015',
  summary:
    'Smartphones made fixed 960px layouts obsolete. Fluid grids, flexible images and media queries let one site reflow for every screen, and grid frameworks made it the default.',
  context: {
    screens: 'Anything from a 320px phone to a 2560px monitor, plus the first tablets; the viewport meta tag became mandatory',
    connection: 'Broadband at home, 3G and early 4G on phones; page weight started to matter again',
    browsers: 'Chrome, Firefox, Safari and Mobile Safari, Android Browser; IE8 needed Respond.js to understand media queries',
  },
  traits: [
    { id: 'fluid', label: 'Fluid percentage grid and flexible images' },
    { id: 'breakpoints', label: 'Breakpoints at 768 / 992 / 1200px' },
    { id: 'hamburger', label: 'Navbar that collapses to a hamburger' },
    { id: 'carousel', label: 'Hero carousel with arrows and dots' },
    { id: 'grid', label: '12-column grid with .row and .col-* classes' },
    { id: 'mobile-first', label: 'Mobile-first min-width media queries' },
    { id: 'viewport', label: 'The viewport meta tag' },
  ],
  tech: [
    'CSS3 media queries (W3C Candidate Recommendation 2009, Recommendation 2012)',
    'The viewport meta tag, introduced by Mobile Safari in 2007',
    'Float-based 12-column grids from frameworks such as 960.gs, Foundation and Bootstrap',
    'max-width: 100% for images; Respond.js and html5shiv for old Internet Explorer',
  ],
  thenVsNow:
    'Float grids and breakpoint classes gave way to CSS Grid, flexbox, container queries and clamp(); the hamburger survives everywhere.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'A 12-column grid in a dozen lines', region: 'grid' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Simulating device widths with an iframe', region: 'resize' },
    { file: 'era.css', lang: 'css', caption: 'A framework-style button group', region: 'btn-group' },
  ],
  sources: [
    { label: 'Ethan Marcotte, “Responsive Web Design” (A List Apart, 2010)', url: 'https://alistapart.com/article/responsive-web-design/' },
    { label: 'Responsive web design (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Responsive_web_design' },
    { label: 'Media Queries (W3C)', url: 'https://www.w3.org/TR/css3-mediaqueries/' },
    { label: 'Viewport meta tag (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag' },
    { label: 'Bootstrap (front-end framework) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Bootstrap_(front-end_framework)' },
  ],
  cta: { next: 'Next era »', prev: '« Previous era' },
  recreated: [
    'Developers tested by resizing the browser or on a drawer of real devices; here an iframe stands in for each device so its media queries respond to the frame width.',
  ],
}

export default meta
