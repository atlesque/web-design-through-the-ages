import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '14',
  slug: '14-material',
  title: 'Material Design',
  years: '2014–2019',
  summary:
    'Google asked what digital paper would be like if it obeyed light and physics: sheets at measured heights casting real shadows, ink that spread from your fingertip, and a single bold accent colour on a floating button.',
  context: {
    screens: '360–412 dp Android phones at 2–3× density; tablets and Chromebooks with the same layouts',
    connection: '4G LTE in most cities; Wi-Fi at home; apps cached offline',
    browsers: 'Chrome for Android, Chrome desktop, Android WebView; Polymer and Angular Material on the web',
  },
  traits: [
    { id: 'appbar', label: 'Coloured app bar sitting at 4dp' },
    { id: 'elevation', label: 'Elevation in dp, drawn with a key and an ambient shadow' },
    { id: 'ripple', label: 'Ink ripples spreading from the touch point' },
    { id: 'fab', label: 'Floating action button that opens a speed dial and morphs into a dialog' },
    { id: 'snackbar', label: 'Snackbar with a single action ("Undo")' },
    { id: 'fields', label: 'Floating-label text fields with an animated underline' },
    { id: 'tabs', label: 'Fixed tabs with an accent ink bar' },
    { id: 'palette', label: 'Primary + accent palette (Teal 800 and Pink A200)' },
  ],
  tech: [
    'Layered box-shadows tuned per dp level (the umbra, penumbra and ambient values Material shipped)',
    'Roboto, the standard curve cubic-bezier(0.4, 0, 0.2, 1) and an 8 dp baseline grid',
    'Ripples injected under the pointer with a scaling, fading circle',
    'Polymer paper-elements, then Materialize, Material Design Lite and Angular Material on the web',
    'Here: CSS-only radio tabs, <dialog>.showModal() and a placeholder-shown trick for floating labels',
  ],
  thenVsNow:
    'Material You (2021) swapped hard paper and big shadows for tonal surfaces and dynamic colour; the ripple and the FAB are still everywhere.',
  snippets: [
    { file: 'era.css', lang: 'css', caption: 'Elevation levels as layered shadows', region: 'shadows' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'An ink ripple from the pointer', region: 'ripple' },
    { file: 'era.css', lang: 'css', caption: 'A floating label without JavaScript', region: 'field' },
    { file: 'demo.html', lang: 'html', caption: 'The FAB and its speed dial', region: 'fab' },
  ],
  sources: [
    { label: 'Material Design (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Material_Design' },
    { label: 'Material Design 2014 guidelines, archived at material.io', url: 'https://m1.material.io/' },
    { label: 'Material Design 2 guidelines: Elevation', url: 'https://m2.material.io/design/environment/elevation.html' },
    { label: 'The <dialog> element (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog' },
  ],
  recreated: ['Touch ripples and the FAB-to-dialog morph are approximated with CSS animations on a desktop pointer.'],
}

export default meta
