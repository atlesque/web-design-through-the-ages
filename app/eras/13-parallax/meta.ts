import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '13',
  slug: '13-parallax',
  title: 'Parallax & one-page storytelling',
  years: '2012–2017',
  summary:
    'Long single pages told a story as you scrolled: layered scenes moving at different speeds, full-screen heroes, giant type and a sticky nav that tracked your chapter.',
  context: {
    screens: 'Wide laptop and desktop screens plus touch phones, where scroll effects were often switched off',
    connection: 'Fast broadband; hero background videos and multi-megabyte pages became normal',
    browsers: 'Chrome, Safari, Firefox and IE10+; scroll-jacking libraries and jQuery plugins drove the effects',
  },
  traits: [
    { id: 'parallax', label: 'Layered scenes scrolling at different speeds' },
    { id: 'hero', label: 'Full-bleed animated hero' },
    { id: 'sticky-nav', label: 'Sticky nav that highlights the current section' },
    { id: 'reveal', label: 'Content that fades in as you scroll' },
    { id: 'chapters', label: 'Chapter numbers and giant headline type' },
  ],
  tech: [
    'Scroll event handlers throttled with requestAnimationFrame (2011+)',
    'translate3d() to push layers onto the GPU',
    'position: sticky, and before it, JavaScript that toggled position: fixed',
    'IntersectionObserver (2016+) for scroll spies and reveal-on-scroll',
  ],
  thenVsNow:
    'Heavy scroll-jacking fell out of favour for performance and motion-sickness reasons; CSS scroll-driven animations now do the same job without JavaScript, and must respect prefers-reduced-motion.',
  snippets: [
    { file: 'era.client.ts', lang: 'typescript', caption: 'Parallax: shift each layer by scroll × depth', region: 'parallax' },
    { file: 'era.css', lang: 'css', caption: 'Scenes are stacks of absolutely positioned SVG layers', region: 'scene' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'A scroll spy with IntersectionObserver', region: 'spy' },
    { file: 'era.css', lang: 'css', caption: 'Today’s way: a scroll-driven progress bar in pure CSS', region: 'progress' },
  ],
  sources: [
    { label: 'Parallax scrolling (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Parallax_scrolling' },
    { label: 'Intersection Observer API (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API' },
    { label: 'prefers-reduced-motion (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' },
    { label: 'Scroll-driven animations (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations' },
  ],
  cta: { next: 'Continue the story', prev: 'Previous chapter' },
  recreated: [
    'Period sites often used a looping background video in the hero; here an animated dawn gradient and SVG mountains stand in for it.',
    'Parallax and reveal effects are switched off for visitors who prefer reduced motion.',
  ],
}

export default meta
