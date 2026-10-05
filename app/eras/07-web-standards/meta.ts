import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '07',
  slug: '07-web-standards',
  title: 'Web standards & CSS layouts',
  years: '2001–2007',
  cta: { next: 'Next chapter →', prev: '← Previous chapter' },
  summary:
    'Designers threw out layout tables and proved one clean XHTML document could wear completely different designs, using nothing but floats, clever background images and a stylesheet.',
  context: {
    screens: '800×600 giving way to 1024×768; the 760 px fixed-width page was the safe default',
    connection: 'Early broadband (DSL, cable) for many, dial-up still common; small CSS files beat table soup',
    browsers: 'Internet Explorer 6 dominant and buggy; Firefox 1.0 (2004) and Safari pushed standards support',
  },
  traits: [
    { id: 'semantic', label: 'Semantic XHTML: headings, lists, no layout tables' },
    { id: 'style-switcher', label: 'One document, many stylesheets' },
    { id: 'floats', label: 'Float-based columns cleared with a clearfix' },
    { id: 'faux-columns', label: 'Faux columns: a tiled background fakes equal heights' },
    { id: 'sliding-doors', label: 'Sliding-doors tabs that stretch with their text' },
    { id: 'image-replacement', label: 'Image replacement with text-indent: -9999px' },
    { id: 'liquid-elastic', label: 'Fixed, liquid and elastic widths' },
    { id: 'badges', label: '"Valid XHTML / Valid CSS" badges' },
  ],
  tech: [
    'XHTML 1.0 Strict with lowercase, closed, quoted markup',
    'CSS floats and the :after clearfix hack',
    'Background-image sprites for tabs, logos and faux columns',
    'Em-based elastic layouts and percentage-based liquid layouts',
    'Alternate stylesheets and JavaScript style switchers (here: radio buttons with :has())',
  ],
  thenVsNow:
    'Floats, clearfix and faux columns were replaced by flexbox and grid; image replacement by web fonts and SVG; the idea of separating content from presentation won outright.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'The one shared document: no tables, no font tags', region: 'markup' },
    { file: 'era.css', lang: 'css', caption: 'Sliding doors: two background images per tab', region: 'sliding-doors' },
    { file: 'era.css', lang: 'css', caption: 'Floats, clearfix and liquid faux columns', region: 'clearfix' },
    { file: 'era.css', lang: 'css', caption: 'Phark image replacement', region: 'image-replacement' },
  ],
  sources: [
    { label: 'Douglas Bowman, “Sliding Doors of CSS” (A List Apart, 2003)', url: 'https://alistapart.com/article/slidingdoors/' },
    { label: 'Dan Cederholm, “Faux Columns” (A List Apart, 2004)', url: 'https://alistapart.com/article/fauxcolumns/' },
    { label: 'CSS Zen Garden', url: 'https://www.csszengarden.com/' },
    { label: 'Web Standards Project (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Web_Standards_Project' },
    { label: 'XHTML 1.0 (W3C Recommendation)', url: 'https://www.w3.org/TR/xhtml1/' },
  ],
  recreated: [
    'Period style switchers swapped <link rel="alternate stylesheet"> elements with JavaScript and a cookie; here three scoped themes are chosen with radio buttons and :has(), so it works without JS.',
  ],
}

export default meta
