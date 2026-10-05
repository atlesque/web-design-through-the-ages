import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '17',
  slug: '17-bento-now',
  title: 'Bento & scroll-driven (now)',
  years: '2023–2026',
  summary:
    'Today’s product page: a bento box of rounded tiles, giant kinetic type, and motion and layout that once needed JavaScript, now done in CSS with scroll timelines, container queries, :has() and view transitions.',
  context: {
    screens: 'Everything from foldables to 6K monitors; components size themselves to their container',
    connection: '5G and fibre, yet performance budgets matter again (Core Web Vitals)',
    browsers: 'Evergreen engines shipping features together via the yearly Interop effort',
  },
  traits: [
    { id: 'bento', label: 'Bento grid of varied tile sizes (grid-template-areas)' },
    { id: 'kinetic', label: 'Oversized kinetic type' },
    { id: 'scroll-driven', label: 'Scroll-driven reveals with animation-timeline: view()' },
    { id: 'view-transitions', label: 'Same-document View Transitions for filter and expand' },
    { id: 'container', label: 'Container queries reacting to a component’s own width' },
    { id: 'has', label: ':has() and subgrid for state and alignment' },
    { id: 'feature-detect', label: 'Live feature detection with CSS.supports()' },
  ],
  tech: [
    'CSS Grid with grid-template-areas and dense auto-flow',
    'animation-timeline: view() and scroll(), guarded by @supports and reduced-motion',
    'document.startViewTransition() with view-transition-name on each tile',
    '@container queries, :has(), subgrid, CSS nesting, oklch() and color-mix()',
  ],
  thenVsNow: 'This is the now. Anchor positioning, scroll-state queries and cross-document transitions are what’s landing next.',
  snippets: [
    { file: 'era.css', lang: 'css', caption: 'Scroll-driven reveal, no JavaScript', region: 'scroll' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'A view transition with a fallback', region: 'vt' },
    { file: 'era.css', lang: 'css', caption: 'A card that queries its container', region: 'cq' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Feature detection with CSS.supports()', region: 'detect' },
  ],
  sources: [
    { label: 'CSS scroll-driven animations (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations' },
    { label: 'View Transition API (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API' },
    { label: 'CSS container queries (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries' },
    { label: 'CSS Containment Module Level 3 (W3C)', url: 'https://www.w3.org/TR/css-contain-3/' },
    { label: 'Interop 2024 (web-platform-tests)', url: 'https://wpt.fyi/interop-2024' },
  ],
}

export default meta
