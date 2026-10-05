import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '05',
  slug: '05-flash',
  title: 'Flash & splash intros',
  years: '1997–2009',
  cta: { next: 'ENTER »', prev: '« BACK' },
  summary:
    'Macromedia Flash turned web pages into fixed-size stages: preloaders, skippable splash intros, swooshing menus, pixel fonts, sound effects and navigation you had to discover by hovering.',
  context: {
    screens: '800×600 to 1024×768; Flash stages were fixed sizes that scaled to fit the window',
    connection: '56k dial-up turning into early broadband; a 400 KB .swf needed a preloader',
    browsers: 'Internet Explorer 5–6 and Netscape with the Flash Player plug-in installed',
  },
  traits: [
    { id: 'preloader', label: '"LOADING... 47%" preloader bar' },
    { id: 'intro', label: 'An animated splash intro' },
    { id: 'skip', label: 'The SKIP INTRO link' },
    { id: 'stage', label: 'A fixed-size stage scaled to fit' },
    { id: 'menu', label: 'A menu that swooshes in' },
    { id: 'mystery-meat', label: 'Mystery-meat icon navigation' },
    { id: 'sound', label: 'A sound on/off toggle with interface bleeps' },
    { id: 'plugin', label: 'A "get the plug-in" badge' },
  ],
  tech: [
    'Macromedia Flash (later Adobe Flash) .swf movies embedded with <object> and <embed>',
    'ActionScript for preloaders (getBytesLoaded / getBytesTotal) and interactive menus',
    'Timeline tweens and keyframes at 12–31 frames per second',
    'Pixel fonts designed to stay crisp at 8px without anti-aliasing',
    'Recreated here with CSS keyframes, SVG, transform: scale() and the Web Audio API',
  ],
  thenVsNow:
    'CSS animations, SVG, canvas and the Web Audio API replaced the plug-in; Flash Player reached end of life on 31 December 2020.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'One fixed stage holds preloader, intro and site', region: 'stage' },
    { file: 'demo.html', lang: 'html', caption: 'Mystery-meat navigation: icons first, labels on hover', region: 'mystery-meat' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'A fake preloader that lurches like dial-up', region: 'preloader' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Scaling the stage like Flash\'s showAll mode', region: 'scale' },
  ],
  sources: [
    { label: 'Adobe Flash (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Adobe_Flash' },
    { label: 'Splash screen (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Splash_screen' },
    { label: 'Mystery meat navigation (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Mystery_meat_navigation' },
    { label: 'Web Audio API (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API' },
    { label: 'Web Design Museum', url: 'https://www.webdesignmuseum.org/' },
  ],
  recreated: [
    'Flash Player is gone, so the .swf is rebuilt with HTML, CSS keyframes and SVG on a 760×480 stage.',
    'The preloader is simulated; nothing large is actually downloaded.',
    'Sound effects are synthesised with the Web Audio API and stay off until you switch them on.',
    'The player badge is invented; no real plug-in logo is shown.',
  ],
}

export default meta
