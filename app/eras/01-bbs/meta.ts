import type { EraMeta } from '../types'

const meta: EraMeta = {
  id: '01',
  slug: '01-bbs',
  title: 'BBS, terminals & pre-web systems',
  years: '1978–1995',
  summary:
    'Before the web, people dialled into bulletin board systems: 80 columns of text, 16 colours, ANSI art logos and menus you drove with single keystrokes.',
  context: {
    screens: '80×25 text mode on CGA/EGA/VGA monitors; no pixels, only character cells',
    connection: 'Dial-up modems from 300 to 14,400 baud; one caller per phone line',
    browsers: 'Terminal programs such as Telix, Procomm and Telemate, talking ANSI escape codes',
  },
  traits: [
    { id: 'grid', label: 'A fixed 80-column character grid' },
    { id: 'ansi-art', label: 'ANSI block-character logo art' },
    { id: 'box-menu', label: 'Box-drawing menus with [hotkeys]' },
    { id: 'login', label: 'Handle-based login prompt' },
    { id: 'cursor', label: 'Blinking block cursor' },
    { id: 'status', label: 'Terminal status line' },
    { id: 'baud', label: 'Text that arrives at modem speed' },
    { id: 'sysop', label: 'A personal note from the sysop' },
  ],
  tech: [
    'Code page 437 block and box-drawing characters',
    'ANSI escape sequences for 16 foreground colours',
    'Single-key menus handled by the BBS software',
    'Recreated here with <pre>, the ch unit and CSS custom properties for the CGA palette',
  ],
  thenVsNow:
    'Box-drawing menus became nav bars and the sysop note became the About page; the 16-colour palette lives on in terminal themes.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'ANSI art is just coloured text', region: 'ansi-splash' },
    { file: 'era.css', lang: 'css', caption: 'The CGA palette as custom properties', region: 'palette' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Revealing text at modem speed', region: 'modem' },
  ],
  sources: [
    { label: 'BBS: The Documentary (Jason Scott, 2005)', url: 'http://www.bbsdocumentary.com/' },
    { label: 'Code page 437 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Code_page_437' },
    { label: 'ANSI art (Wikipedia)', url: 'https://en.wikipedia.org/wiki/ANSI_art' },
    { label: 'Color Graphics Adapter palette (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Color_Graphics_Adapter' },
  ],
  rooms: [{ path: 'pre-web', label: 'pre-web room: Teletext, Minitel, Gopher' }],
  recreated: ['The modem reveal is simulated in the browser; nothing is actually dialled.'],
}

export default meta
