import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '08',
  slug: '08-blogs-myspace',
  title: 'Blogs & MySpace',
  years: '2003–2008',
  summary:
    'Anyone could publish: hosted blogs gave everyone dated posts, permalinks and a sidebar, while social profiles let millions of teenagers paste raw CSS into an "About me" box.',
  context: {
    screens: '1024×768 on CRTs and the first cheap LCDs',
    connection: 'Broadband became normal at home; feeds were polled by desktop aggregators',
    browsers: 'Internet Explorer 6 and 7, Firefox 1.5 and 2, Safari 2',
  },
  traits: [
    { id: 'blog', label: 'Two-column blog template with a header banner' },
    { id: 'permalinks', label: 'Dated posts with permalinks, comments and trackbacks' },
    { id: 'tag-cloud', label: 'Tag cloud: bigger words, more posts' },
    { id: 'feeds', label: 'Orange RSS / Atom badges' },
    { id: 'comments', label: 'Comment threads (and the first spam)' },
    { id: 'profile', label: 'Social profile: mood, Top 8, blurbs, profile song' },
    { id: 'css-sandbox', label: 'User CSS pasted into the profile' },
  ],
  tech: [
    'Hosted blog engines with template tags and two-column float layouts',
    'RSS 2.0 and Atom feeds, trackbacks and pingbacks',
    'Social profiles that accepted user HTML and <style> blocks',
    'Layout sites that handed out copy-and-paste CSS',
    'Embedded profile music players (here: a Web Audio chiptune)',
  ],
  thenVsNow:
    'Blog templates became themes and static-site generators; user-styled profiles gave way to uniform feeds where the platform, not the person, owns the design.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'A post: date header, permalink, byline', region: 'post' },
    { file: 'era.css', lang: 'css', caption: 'The classic two-column float template', region: 'blog-layout' },
    { file: 'demo.html', lang: 'html', caption: 'The CSS sandbox: a textarea and a same-origin iframe', region: 'sandbox' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Posting the CSS into the profile frame', region: 'post-css' },
  ],
  sources: [
    { label: 'Blog (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Blog' },
    { label: 'MySpace (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Myspace' },
    { label: 'Tag cloud (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Tag_cloud' },
    { label: 'RSS (Wikipedia)', url: 'https://en.wikipedia.org/wiki/RSS' },
    { label: 'Window.postMessage() (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage' },
  ],
  recreated: [
    'Profile glitter text was usually an animated GIF; here it is a moving CSS gradient clipped to the text.',
    'Profile songs played through a Flash player; here a short original chiptune is synthesised with Web Audio after you press Play.',
  ],
}

export default meta
