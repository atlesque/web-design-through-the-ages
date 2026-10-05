import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '16',
  slug: '16-glass-soft-ui',
  title: 'Gradients, glass & soft UI',
  years: '2018–2023',
  summary:
    'After years of flat colour, gradients came back as glowing blobs behind frosted-glass panels, soft extruded "neumorphic" controls had a moment on Dribbble, and every app grew a dark mode.',
  context: {
    screens: 'High-density OLED phones and Retina laptops; system-wide dark mode from 2019',
    connection: 'Fast 4G and fibre; 5G arriving',
    browsers: 'Safari had backdrop-filter first; Chrome shipped it in 2019, Firefox in 2022',
  },
  traits: [
    { id: 'mesh', label: 'Vivid, blurred gradient blobs (a mesh-gradient look)' },
    { id: 'glass', label: 'Frosted glass panels with backdrop-filter' },
    { id: 'illustration', label: 'Glossy 3D-style illustration' },
    { id: 'soft', label: 'Neumorphic soft controls with paired light and dark shadows' },
    { id: 'weight', label: 'Animated variable font weight' },
    { id: 'dark', label: 'Light and dark mode, following the system by default' },
  ],
  tech: [
    'backdrop-filter: blur() saturate() for glass, with a thin light border to catch the edge',
    'Large radial-gradient() shapes under filter: blur() for mesh-style colour',
    'Two box-shadows, one light and one dark, for soft UI; inset to "press" it',
    'prefers-color-scheme and color-scheme for dark mode',
    'Variable system fonts (SF Pro, Segoe UI Variable) for smooth weight changes',
  ],
  thenVsNow:
    'Glass became an OS material and dark mode a default expectation; pure neumorphism faded because its low-contrast controls were hard to see.',
  snippets: [
    { file: 'era.css', lang: 'css', caption: 'Soft UI: a light shadow and a dark one', region: 'neu' },
    { file: 'demo.html', lang: 'html', caption: 'A glass card is mostly a blur', region: 'glass' },
    { file: 'era.css', lang: 'css', caption: 'Theme tokens for light and dark', region: 'theme' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Follow the OS until the visitor decides', region: 'theme-switch' },
  ],
  sources: [
    { label: 'backdrop-filter (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter' },
    { label: 'prefers-color-scheme (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme' },
    { label: 'Neumorphism (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Neumorphism' },
    { label: 'Glassmorphism in User Interfaces (Nielsen Norman Group)', url: 'https://www.nngroup.com/articles/glassmorphism/' },
    { label: 'Variable fonts guide (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide' },
  ],
  recreated: ['The weight animation is smooth only where the system UI font is a variable font; elsewhere it steps between the weights available.'],
}

export default meta
