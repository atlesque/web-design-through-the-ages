import type { RoomMeta } from '../../types'

const meta: RoomMeta = {
  parent: '01-bbs',
  title: 'Pre-web systems: Teletext, Minitel & Gopher',
  years: '1974–1995',
  summary:
    'Before and alongside the early web, people already browsed screens of text: teletext pages broadcast with the TV picture, Minitel services dialled over the phone line, and Gopher menus linking university servers.',
  context: {
    screens: 'TV sets and dedicated terminals: 40×24 or 40×25 character cells in 8 colours, with 2×3 block mosaics for pictures',
    connection: 'Teletext rode in unused TV scan lines (one-way); Minitel used 1200 baud down / 75 baud up; Gopher ran over the Internet via campus terminals and modems',
    browsers: 'Teletext decoders in the TV, the Minitel terminal itself, and text Gopher clients on Unix and VT100-style terminals',
  },
  traits: [
    { id: 'teletext', label: 'Teletext page with header, clock and page search' },
    { id: 'char-grid', label: 'A 40-column character-cell screen' },
    { id: 'mosaic', label: 'Block-mosaic graphics (2×3 sub-cells per character)' },
    { id: 'fastext', label: 'Coloured Fastext keys on the remote' },
    { id: 'minitel', label: 'A 3615 Minitel service' },
    { id: 'function-keys', label: 'Minitel function keys (ENVOI, SUITE, RETOUR, SOMMAIRE)' },
    { id: 'gopher', label: 'A university Gopher menu' },
    { id: 'type-glyphs', label: 'Item-type markers: "/" directories, "." files, <?> searches' },
  ],
  tech: [
    'Teletext (CEEFAX, ORACLE and the World System Teletext standard), broadcast in the vertical blanking interval',
    'Videotex: the French Télétel network and the Minitel terminal, with the Alphamosaic character set',
    'The Gopher protocol (RFC 1436), with one-character item types for menus, documents and searches',
    'Recreated here with CSS grid character cells, inline-SVG mosaics, and scaleY() for double-height rows',
  ],
  thenVsNow:
    'Page numbers became URLs, Fastext keys became nav bars, and Gopher menus lost to the web’s inline links; teletext’s 8-colour blocky look still lives on as a retro aesthetic.',
  snippets: [
    { file: 'demo.html', lang: 'html', caption: 'A teletext screen is a 40×24 grid of cells', region: 'teletext-grid' },
    { file: 'era.css', lang: 'css', caption: 'The shared 8-colour palette', region: 'palette' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Waiting for your page to come round the carousel', region: 'carousel' },
    { file: 'era.client.ts', lang: 'typescript', caption: 'Minitel function keys drive the service', region: 'keys' },
  ],
  sources: [
    { label: 'Teletext (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Teletext' },
    { label: 'Minitel (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Minitel' },
    { label: 'Gopher (protocol) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Gopher_(protocol)' },
    { label: 'RFC 1436: The Internet Gopher Protocol', url: 'https://www.rfc-editor.org/rfc/rfc1436' },
  ],
}

export default meta
