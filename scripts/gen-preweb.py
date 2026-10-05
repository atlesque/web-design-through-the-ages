#!/usr/bin/env python3
"""Generates app/eras/01-bbs/pre-web/demo.html. Pages are exact 40-column grids."""
import re, html

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app', 'eras', '01-bbs', 'pre-web', 'demo.html')
COLS = 40

# ---------------------------------------------------------------- row markup
# {x} sets foreground, [x] sets background, <NNN|label> makes a page link.
TOKEN = re.compile(r'\{([rgybmcwk])\}|\[([rgybmcwk])\]|<(\w+)\|([^>]*)>')


def row(spec, kind='tt', cols=COLS, extra=''):
    fg, bg = 'w', 'k'
    out, n = [], 0
    pos = 0
    def emit(text, link=None):
        nonlocal n
        if not text:
            return
        n += len(text)
        cls = f'f{fg}' + (f' b{bg}' if bg != 'k' else '')
        t = html.escape(text)
        if link:
            out.append(f'<a class="{cls}" href="#{kind}-{link}" data-go="{link}">{t}</a>')
        elif cls == 'fw':
            out.append(t)
        else:
            out.append(f'<span class="{cls}">{t}</span>')
    for m in TOKEN.finditer(spec):
        emit(spec[pos:m.start()])
        if m.group(1):
            fg = m.group(1)
        elif m.group(2):
            bg = m.group(2)
        else:
            emit(m.group(4), m.group(3))
        pos = m.end()
    emit(spec[pos:])
    if n > cols:
        raise SystemExit(f'row too long ({n}): {spec!r}')
    if n < cols and bg != 'k':
        emit(' ' * (cols - n))
    return ''.join(out)


def line(r, spec, kind='tt', dh=False, cls=''):
    if dh:
        return f'<div class="{kind}-r {kind}-dh {cls}" style="grid-row:{r} / span 2"><span>{row(spec, kind)}</span></div>'
    return f'<div class="{kind}-r {cls}" style="grid-row:{r}">{row(spec, kind)}</div>'


# ---------------------------------------------------------------- mosaics
def mosaic(bitmap, colours, r0, c0, label=None):
    """bitmap: list of strings at 2 sub-pixels per column and 3 per row. Chars map to colours."""
    h = len(bitmap)
    w = max(len(b) for b in bitmap)
    cols = (w + 1) // 2
    rows = (h + 2) // 3
    rects = {}
    for y, b in enumerate(bitmap):
        x = 0
        while x < len(b):
            ch = b[x]
            if ch in colours:
                x2 = x
                while x2 < len(b) and b[x2] == ch:
                    x2 += 1
                rects.setdefault(colours[ch], []).append(f'M{x} {y}h{x2 - x}v1h-{x2 - x}z')
                x = x2
            else:
                x += 1
    aria = f'role="img" aria-label="{label}"' if label else 'aria-hidden="true"'
    return (f'<svg class="mos" {aria} style="grid-area:{r0} / {c0} / span {rows} / span {cols}" '
            f'viewBox="0 0 {cols * 2} {rows * 3}" preserveAspectRatio="none" shape-rendering="crispEdges">'
            + ''.join(f'<path fill="{c}" d="{"".join(d)}"/>' for c, d in rects.items()) + '</svg>')


FONT = {
    'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    ' ': ['.....'] * 7,
}


def word_bitmap(word, ch='#'):
    lines = ['' for _ in range(9)]
    lines[0] = '.' * (len(word) * 6)
    lines[8] = '.' * (len(word) * 6)
    for i in range(7):
        lines[i + 1] = ''.join(FONT[c][i].replace('#', ch) + '.' for c in word)
    return lines


def raster_poly(w, h, polys, ch='#'):
    def inside(x, y, p):
        c = False
        j = len(p) - 1
        for i in range(len(p)):
            xi, yi = p[i]; xj, yj = p[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                c = not c
            j = i
        return c
    return [''.join(ch if any(inside(x + .5, y + .5, p) for p in polys) else '.' for x in range(w)) for y in range(h)]


# ================================================================= TELETEXT
def tt_page(num, rows_html, fast):
    """fast: list of (colour, page, label) for row 24."""
    spec = ''
    for colour, page, label in fast:
        spec += f'{{{colour}}}<{page}|{label}>'
    rows_html.append(line(23, spec, cls='tt-fast'))
    cur = ' is-current' if num == 'p100' else ''
    return (f'<section class="tt-page{cur}" id="tt-{num}" data-page="{num[1:]}" aria-label="Teletext page {num[1:]}">'
            + '\n'.join(rows_html) + '</section>')


FAST = [('r', 'p101', 'Headlines '), ('g', 'p102', 'Weather   '), ('y', 'p103', 'NTV Tonight '), ('c', 'p100', 'Index   ')]

# Page grid rows are teletext rows 2..24 (row 1 is the live header), so r = teletext row - 1.
logo = mosaic(word_bitmap('NORTHTEXT'), {'#': '#ffff00'}, 1, 3, 'NORTHTEXT')
p100 = [
    line(1, '[b]'), line(2, '[b]'), line(3, '[b]'),
    logo,
    line(4, '{c}  The information service from'),
    line(5, '{c}  Northvale Television  {w}[b] NTV [k]  {y}1968-1989'),
    line(7, '{y} INDEX                       {w} page', dh=True),
    line(9, '{w}  News headlines ..............{c}<p101|101>'),
    line(10, '{w}  Weather map .................{c}<p102|102>'),
    line(11, '{w}  NTV tonight .................{c}<p103|103>'),
    line(12, '{w}  Sport ....................... {c}140'),
    line(13, '{w}  Travel & ferries ............ {c}150'),
    line(14, '{w}  Subtitles ................... {c}888'),
    line(16, '[m]{w} NEW [k]{m} Harvest Fair results on 115    '),
    line(18, '{g}  Key in a page number on your'),
    line(19, '{g}  handset, or press a coloured key.'),
    line(21, '{b}[c] Northtext: always on, never sleeps  '),
]
news_band = mosaic(['#' * 80, '#' * 80, '.' * 80], {'#': '#ff0000'}, 1, 1)
p101 = [
    line(1, '[r]{w} NEWS                   {y}101', dh=True),
    line(3, '{r}' + '▄' * 0),
    line(4, '{y} Council approves Northvale ring road'),
    line(5, '{w}  Work to start in spring, 1,200 homes'),
    line(6, '{w}  on the route will get letters.  {c}104'),
    line(8, '{y} Rail fares to rise 6% in January'),
    line(9, '{w}  Season tickets hit hardest.     {c}105'),
    line(11, '{y} Lighthouse keepers stand down'),
    line(12, '{w}  Greywater light goes automatic'),
    line(13, '{w}  after 112 years.               {c}106'),
    line(15, '{y} Record crowds at Harvest Fair'),
    line(16, '{w}  Giant marrow wins by a whisker.{c}115'),
    line(18, '{y} Ferry strike called off'),
    line(19, '{w}  Sailings normal from 0600.     {c}150'),
    line(21, '[b]{c} More news{w} 104{c}  Regional{w} 160       '),
]

# Weather map: an invented island in a black sea, 24 cols x 17 rows of mosaic.
island = [(6, 2), (14, 1), (22, 4), (28, 3), (33, 7), (31, 12), (36, 16), (41, 18), (44, 25), (40, 31),
          (42, 38), (37, 44), (30, 47), (24, 50), (17, 48), (11, 43), (13, 37), (7, 33), (9, 27), (4, 22), (6, 15), (3, 9)]
islet = [(38, 4), (43, 6), (45, 10), (41, 12), (37, 9)]
land = raster_poly(48, 51, [island, islet], '#')
sun = ['..y..y..', '...yy...', 'y.yyyy.y', '..yyyy..', '...yy...', '..y..y..']
cloud = ['..wwww....', '.wwwwww.ww', 'wwwwwwwwww', '.wwwwwwww.', '..c..c..c.', '.c..c..c..']
wx_map = mosaic(land, {'#': '#00ff00'}, 3, 2, 'Weather map of Northvale')
wx_sun = mosaic(sun, {'y': '#ffff00'}, 4, 15)
wx_cloud = mosaic(cloud, {'w': '#ffffff', 'c': '#00ffff'}, 12, 4)


def label(r, c, text, fg='y'):
    return f'<span class="tt-r tt-lbl f{fg}" style="grid-area:{r} / {c} / span 1 / span {len(text)}">{html.escape(text)}</span>'


p102 = [
    line(1, '[g]{k} WEATHER                {k}102', dh=True),
    wx_map, wx_sun, wx_cloud,
    label(6, 7, ' 9 '), label(10, 10, ' 11 '), label(15, 13, ' 12 '), label(8, 21, ' 8 ', 'c'),
    label(7, 4, 'Kirkby', 'w'), label(11, 15, 'Vale', 'w'), label(17, 9, 'Port Ash', 'w'),
    line(3, '{k}                          {y}TONIGHT'),
    line(4, '{k}                          {w}Clear and'),
    line(5, '{k}                          {w}chilly with'),
    line(6, '{k}                          {w}frost in'),
    line(7, '{k}                          {w}the valleys'),
    line(8, '{k}                          {c}Min 2C'),
    line(10, '{k}                          {y}TOMORROW'),
    line(11, '{k}                          {w}Bright then'),
    line(12, '{k}                          {w}showers from'),
    line(13, '{k}                          {w}the west.'),
    line(14, '{k}                          {c}Max 14C'),
    line(16, '{k}                          {g}Pollen: low'),
    line(21, '[b]{w} Shipping forecast{c} 108{w}  Ski{c} 109      '),
]
p103 = [
    line(1, '[y]{b} NTV TONIGHT            {b}103', dh=True),
    line(4, '{c}1800{w} Northvale News'),
    line(5, '{c}1830{w} Wheel of Words{g}  quiz'),
    line(6, '{c}1900{w} Harbour Lane{g}  Dot\'s secret is out'),
    line(7, '{c}1930{w} Top Tunes Countdown'),
    line(8, '{c}2000{y} FILM: The Glass Comet{g} (1979)'),
    line(9, '{w}     Sci-fi drama. A comet hangs'),
    line(10, '{w}     over a seaside town for a week.'),
    line(11, '{c}2140{w} News at Twenty to Ten'),
    line(12, '{c}2210{w} Late Lines{g}  phone-in'),
    line(13, '{c}2340{w} Closedown'),
    line(15, '{m} Subtitled programmes on{w} 888'),
    line(17, '[b]{y} QUIZ{w} What year did NTV first go   '),
    line(18, '[b]{w} on air? Press REVEAL for the answer.'),
    f'<div class="tt-r tt-conceal" style="grid-row:19">{row("[b]{y}  Answer: 1968, from the Kirkby mast.  ")}</div>',
]

teletext = '\n'.join([
    tt_page('p100', p100, FAST),
    tt_page('p101', p101, FAST),
    tt_page('p102', p102, FAST),
    tt_page('p103', p103, FAST),
])
tt_header = ('<div class="tt-head" aria-live="off">'
             '<span class="fw tt-req">P100</span><span class="fw"> </span>'
             '<span class="fy">NORTHTEXT</span><span class="fw"> </span><span class="fw tt-num">100</span>'
             '<span class="fw"> </span><span class="fy tt-date">Mon 05 Oct</span><span class="fw"> </span>'
             '<span class="fw tt-clock">18:42/07</span><span class="fw">  </span></div>')

# ================================================================= MINITEL
def mt_line(r, spec, dh=False, dw=False, cls=''):
    k = 'mt'
    if dh or dw:
        scale = 'mt-dbl' if dw else 'mt-dh'
        return f'<div class="mt-r {scale} {cls}" style="grid-row:{r} / span 2"><span>{row(spec, k, COLS // (2 if dw else 1))}</span></div>'
    return f'<div class="mt-r {cls}" style="grid-row:{r}">{row(spec, k)}</div>'


def mt_field(r, c, ident, labeltext, size):
    return (f'<label class="mt-field" style="grid-area:{r} / {c} / span 1 / span {size}">'
            f'<span class="sr-only">{labeltext}</span>'
            f'<input id="{ident}" name="{ident}" maxlength="{size}" size="{size}" placeholder="{"." * size}" autocomplete="off" spellcheck="false" data-keys="own"></label>')


def mt_screen(name, rows_html, cur=False, label=''):
    c = ' is-current' if cur else ''
    return (f'<section class="mt-page{c}" id="mt-{name}" data-screen="{name}" aria-label="{label}">'
            + '\n'.join(rows_html) + '</section>')


rule = '{b}' + '▀' * 40
mt_sunny = mosaic(['....yy....', '.y.yyyy.y.', '..yyyyyy..', 'yyyyyyyyyy', '..yyyyyy.w', '.y.yyy.www', '...wwwwwww', '..wwwwwwww', '...wwwwww.'],
                  {'y': '#ffff00', 'w': '#ffffff'}, 2, 34)
minitel = '\n'.join([
    mt_screen('accueil', [
        mt_line(2, '[b]{y}METEOVILLE{w}      ', dw=True),
        mt_sunny,
        mt_line(5, '{c}  Le temps qu\'il fait, ville par ville'),
        mt_line(6, rule),
        mt_line(8, '{w}  Prévisions à 3 jours pour 36 000'),
        mt_line(9, '{w}  communes. Mise à jour toutes les'),
        mt_line(10, '{w}  heures par nos météorologues.'),
        mt_line(13, '{g}  Tapez le nom de votre ville'),
        mt_line(14, '{g}  puis appuyez sur{w}[g] ENVOI [k]'),
        mt_line(16, '{y}  VILLE :'),
        mt_field(16, 11, 'mt-ville', 'Nom de la ville', 20),
        mt_line(19, '{c}  Autres rubriques  {w}[b] <sommaire|SOMMAIRE> [k]'),
        mt_line(23, '{m}  3615 METEOVILLE{w}    0,98 F/min'),
    ], True, 'Écran d\'accueil'),
    mt_screen('sommaire', [
        mt_line(1, '[b]{w}SOMMAIRE            ', dw=True),
        mt_line(4, rule),
        mt_line(6, '{y}  1{w}  <ville1|Prévisions de votre ville>'),
        mt_line(8, '{y}  2{w}  <marine|Bulletin météo marine>'),
        mt_line(10, '{y}  3{w}  <neige1|Neige et état des routes>'),
        mt_line(12, '{y}  4{w}  <dicton|Le dicton du jour>'),
        mt_line(15, rule),
        mt_line(17, '{g}  Votre choix :    {g}puis{w}[g] ENVOI [k]'),
        mt_field(17, 17, 'mt-choix', 'Votre choix (1 à 4)', 1),
        mt_line(23, '{c}  Retour à l\'accueil :{w}[b] <accueil|RETOUR> [k]'),
    ], label='Sommaire'),
    mt_screen('ville1', [
        mt_line(1, '[b]{w}AUJOURD\'HUI         ', dw=True),
        mt_line(3, '{y}  @@CITY@@@@@@@@@@@@@@{c}               1/2'),
        mt_line(4, rule),
        mt_line(6, '{w}  Matin    {y}Soleil voilé      {c} 9°C'),
        mt_line(8, '{w}  Midi     {y}Éclaircies        {c}15°C'),
        mt_line(10, '{w}  Soir     {w}Nuageux           {c}11°C'),
        mt_line(12, '{w}  Vent     {g}Ouest, 20 km/h'),
        mt_line(14, '{w}  Pression {g}1 016 hPa, stable'),
        mt_line(17, '{m}  Conseil : sortez le parapluie'),
        mt_line(18, '{m}  après 18 h.'),
        mt_line(23, '{w}  Suite  [b] SUITE [k]{w}   Sommaire [b] SOMMAIRE [k]'),
    ], label='Prévisions, page 1'),
    mt_screen('ville2', [
        mt_line(1, '[b]{w}3 JOURS             ', dw=True),
        mt_line(3, '{y}  @@CITY@@@@@@@@@@@@@@{c}               2/2'),
        mt_line(4, rule),
        mt_line(6, '{c}  MARDI    {y}Soleil        {w}min 6 max 17'),
        mt_line(8, '{c}  MERCREDI {w}Averses       {w}min 8 max 13'),
        mt_line(10, '{c}  JEUDI    {w}Pluie, vent   {w}min 7 max 12'),
        mt_line(13, '{g}  Tendance : temps plus frais en fin'),
        mt_line(14, '{g}  de semaine.'),
        mt_line(23, '{w}  Retour [b] RETOUR [k]{w}   Sommaire [b] SOMMAIRE [k]'),
    ], label='Prévisions, page 2'),
    mt_screen('marine', [
        mt_line(1, '[b]{w}MÉTÉO MARINE        ', dw=True),
        mt_line(4, rule),
        mt_line(6, '{y}  Côte Nord, de Pointe-Grise au Cap'),
        mt_line(8, '{w}  Vent : Ouest 4 à 5 Beaufort,'),
        mt_line(9, '{w}  fraîchissant 6 en soirée.'),
        mt_line(11, '{w}  Mer : agitée à forte.'),
        mt_line(12, '{w}  Houle : Ouest 2 mètres.'),
        mt_line(13, '{w}  Visibilité : bonne, réduite sous'),
        mt_line(14, '{w}  grains.'),
        mt_line(17, '[r]{w}  AVIS DE GRAND FRAIS À PARTIR DE 20H  '),
        mt_line(23, '{w}  Sommaire [b] SOMMAIRE [k]'),
    ], label='Météo marine'),
    mt_screen('neige1', [
        mt_line(1, '[b]{w}NEIGE & ROUTES      ', dw=True),
        mt_line(3, '{c}                                  1/2'),
        mt_line(4, rule),
        mt_line(6, '{y}  STATION        NEIGE   PISTES'),
        mt_line(8, '{w}  Le Grand Col   {c} 85 cm {g} 24/30'),
        mt_line(9, '{w}  Val-Mirande    {c} 60 cm {g} 18/22'),
        mt_line(10, '{w}  Les Aiguettes  {c} 40 cm {g}  9/15'),
        mt_line(11, '{w}  Pic Sauvage    {c}120 cm {g} 31/31'),
        mt_line(14, '{m}  Neige fraîche cette nuit : 15 cm'),
        mt_line(23, '{w}  Suite  [b] SUITE [k]{w}   Sommaire [b] SOMMAIRE [k]'),
    ], label='Neige, page 1'),
    mt_screen('neige2', [
        mt_line(1, '[b]{w}ÉTAT DES ROUTES     ', dw=True),
        mt_line(3, '{c}                                  2/2'),
        mt_line(4, rule),
        mt_line(6, '{w}  Col du Loup       {g}ouvert'),
        mt_line(8, '{w}  Col de la Brèche  {y}équipements'),
        mt_line(9, '{w}                    {y}obligatoires'),
        mt_line(11, '{w}  Route des Lacs    {r}fermée'),
        mt_line(14, '{c}  Prudence : verglas en altitude.'),
        mt_line(23, '{w}  Retour [b] RETOUR [k]{w}   Sommaire [b] SOMMAIRE [k]'),
    ], label='Routes, page 2'),
    mt_screen('dicton', [
        mt_line(1, '[b]{w}DICTON DU JOUR      ', dw=True),
        mt_line(4, rule),
        mt_line(8, '{y}     « Brouillard d\'octobre,'),
        mt_line(10, '{y}       pluie de novembre. »'),
        mt_line(14, '{w}     Envoyez-nous le vôtre :'),
        mt_line(15, '{c}     Rubrique 5, BOÎTE AUX LETTRES'),
        mt_line(23, '{w}  Sommaire [b] SOMMAIRE [k]'),
    ], label='Dicton'),
    mt_screen('fin', [
        mt_line(8, '{w}  Vous étiez connecté au service'),
        mt_line(10, '{y}         3615 METEOVILLE', ),
        mt_line(12, '{w}  Durée :{c} @@DUR@@@@@'),
        mt_line(13, '{w}  Coût  :{c} @@COST@@@@'),
        mt_line(16, '{g}  Merci et à bientôt.'),
        mt_line(20, '{w}  Appuyez sur{w}[b] CONNEXION/FIN [k]{w} pour'),
        mt_line(21, '{w}  vous reconnecter.'),
    ], label='Fin de connexion'),
])
# Inline placeholders for JS-filled values (kept the same width).
minitel = minitel.replace('@@CITY@@@@@@@@@@@@@@', '<b class="mt-city">VOTRE VILLE         </b>')
minitel = minitel.replace('@@DUR@@@@@', '<b class="mt-dur">0 min 00 s</b>')
minitel = minitel.replace('@@COST@@@@', '<b class="mt-cost">0,00 F    </b>')
# The replacement strings are one char narrower/wider than the placeholder? Check widths below.

# ================================================================= GOPHER
def g_item(i, kind, label, target, cur=False):
    suffix = {'dir': '/', 'txt': '.', 'search': ' <?>', 'tel': ' <TEL>', 'cso': ' <CSO>', 'bin': ' <Bin>', 'img': ' <Picture>'}[kind]
    arrow = '--&gt;' if cur else '   '
    return f'<span class="g-arrow">{arrow}</span> {i:>2}.  <a href="#g-{target}" data-go="{target}" data-kind="{kind}">{html.escape(label)}{html.escape(suffix)}</a>'


def g_menu(name, title, items, cur=False, parent=None):
    body = '\n'.join(g_item(i + 1, k, l, t, i == 0) for i, (k, l, t) in enumerate(items))
    pages = f'Page: 1/1'
    up = f'u to go up a menu' if parent else 'q to Quit        '
    c = ' is-current' if cur else ''
    back = f'\n<a href="#g-{parent}" data-go="{parent}" class="g-up">[u] Up a menu</a>' if parent else ''
    return (f'<section class="g-page{c}" id="g-{name}" data-screen="{name}" data-parent="{parent or ""}" aria-label="{html.escape(title)}">'
            f'<pre>{"Internet Gopher Information Client v1.12":^64}\n\n'
            f'<b>{html.escape(title):^64}</b>\n\n\n'
            f'<span class="g-menu">{body}</span>\n\n\n'
            f'Press <kbd>?</kbd> for Help, {up}           {pages}{back}</pre></section>')


def g_text(name, title, text, parent):
    return (f'<section class="g-page" id="g-{name}" data-screen="{name}" data-parent="{parent}" aria-label="{html.escape(title)}">'
            f'<pre class="g-text"><b>{html.escape(title)}</b>  (text)\n{"-" * 64}\n{html.escape(text)}\n{"-" * 64}\n'
            f'<a href="#g-{parent}" data-go="{parent}" class="g-up">[Press RETURN to continue, u to go up]</a></pre></section>')


gopher = '\n'.join([
    g_menu('root', 'Root gopher server: gopher.lakeside-state.edu', [
        ('txt', 'About the Lakeside State University Gopher', 'about'),
        ('dir', 'Campus Information', 'campus'),
        ('dir', 'Computing Center', 'cc'),
        ('tel', 'Library Catalog (LAKECAT)', 'lakecat'),
        ('search', 'Search Lakeside Gopherspace', 'search'),
        ('cso', 'Phone Book (CSO)', 'cso'),
        ('dir', 'Weather', 'weather'),
        ('dir', 'Other Gopher and Information Servers', 'other'),
    ], cur=True),
    g_menu('campus', 'Campus Information', [
        ('txt', 'Academic Calendar 1992-93', 'calendar'),
        ('dir', 'Dining Hall Menus', 'dining'),
        ('txt', 'Parking Regulations', 'parking'),
        ('img', 'Campus Map (GIF, 41k)', 'map'),
    ], parent='root'),
    g_menu('dining', 'Dining Hall Menus', [
        ('txt', 'Monday', 'monday'),
        ('txt', 'Tuesday', 'tuesday'),
    ], parent='campus'),
    g_menu('cc', 'Computing Center', [
        ('txt', 'Dial-in modem numbers', 'dialin'),
        ('txt', 'Lab hours this semester', 'labhours'),
        ('txt', 'How to get an Internet account', 'account'),
        ('bin', 'Gopher client for the Mac (BinHex)', 'binhex'),
    ], parent='root'),
    g_menu('weather', 'Weather', [
        ('txt', 'Lakeside forecast (updated hourly)', 'forecast'),
        ('txt', 'Lake ice report', 'ice'),
    ], parent='root'),
    g_menu('other', 'Other Gopher and Information Servers', [
        ('dir', 'All the Gopher Servers in the World', 'world'),
        ('txt', 'What is a "World-Wide Web"?', 'www'),
    ], parent='root'),
    g_menu('world', 'All the Gopher Servers in the World', [
        ('dir', 'Bayfield College', 'nowhere'),
        ('dir', 'Cedar Plains Community College', 'nowhere'),
        ('dir', 'Harbor Institute of Technology', 'nowhere'),
        ('dir', 'Northern Prairie University', 'nowhere'),
    ], parent='other'),
    g_text('about', 'About the Lakeside State University Gopher',
           'This is the campus-wide information system (CWIS) for Lakeside State\n'
           'University, running on a NeXT cube in the basement of Hall 4.\n\n'
           'Gopher lets you browse information on computers all over the\n'
           'Internet through simple menus. Directories end in "/", documents\n'
           'end in ".", and items marked <?> let you search.\n\n'
           'Questions? Send mail to gopher@lakeside-state.edu.', 'root'),
    g_text('calendar', 'Academic Calendar 1992-93',
           'Aug 31   Classes begin\nSep  7   Labor Day, no classes\nNov 25   Thanksgiving recess begins at noon\n'
           'Dec 14   Final exams begin\nJan 19   Spring semester classes begin', 'campus'),
    g_text('parking', 'Parking Regulations',
           'Lots A-D require a blue permit. Lot E is open after 5 pm.\nPermits are $40 per semester at the Campus Police office.\n'
           'Do NOT park in the Computing Center loading dock. We mean it.', 'campus'),
    g_text('monday', 'Monday', 'Lunch:  Chili, cornbread, salad bar\nDinner: Baked cod, rice pilaf, green beans\nVegetarian: Lentil loaf', 'dining'),
    g_text('tuesday', 'Tuesday', 'Lunch:  Sloppy joes, tater tots\nDinner: Spaghetti night (all you can eat)\nVegetarian: Pasta primavera', 'dining'),
    g_text('dialin', 'Dial-in modem numbers',
           '2400 baud:  555-0140 (16 lines)\n9600 baud:  555-0188 (4 lines, V.32)\n\n'
           'Settings: 8 data bits, no parity, 1 stop bit.\nAt the "Lakeside>" prompt type: telnet gopher', 'cc'),
    g_text('labhours', 'Lab hours this semester',
           'Hall 4 (Macs and NeXTs):  Mon-Thu 8am-2am, Fri 8am-6pm\nLibrary (VT220 terminals): open library hours\n\n'
           'Please do not play netrek when people are waiting.', 'cc'),
    g_text('account', 'How to get an Internet account',
           'Bring your student ID to Room 112, Hall 4. You will get a\nusername, an email address and 1 MB of disk space.\n\n'
           'Accounts are for academic use. Please read the acceptable use\npolicy before posting to USENET.', 'cc'),
    g_text('forecast', 'Lakeside forecast (updated hourly)',
           'TONIGHT... Partly cloudy. Lows in the lower 30s.\nTOMORROW... Sunny. Highs around 55. West wind 10 mph.\n'
           'THURSDAY... Chance of rain. Highs in the upper 40s.', 'weather'),
    g_text('ice', 'Lake ice report',
           'No ice on the lake yet. The Outing Club reminds everyone that\nthe ice is not safe until the Club says it is safe.', 'weather'),
    g_text('www', 'What is a "World-Wide Web"?',
           'A note from the Computing Center, March 1993:\n\n'
           'Some of you have asked about the "World-Wide Web", a hypertext\n'
           'system from a physics lab in Europe. It mixes text and links in\n'
           'one document instead of using menus like Gopher. There is a\n'
           'line-mode browser on the VAX; type "www" to try it. We will\n'
           'keep running Gopher for the foreseeable future.', 'other'),
    g_text('nowhere', 'Connecting...',
           'Connecting to remote server... \n\nConnection refused by host.\n'
           '(In 1993 this would have taken you to another campus.)', 'world'),
    # Telnet, CSO, picture, binary and search screens.
    '<section class="g-page" id="g-lakecat" data-screen="lakecat" data-parent="root" aria-label="Telnet warning"><pre>'
    '+-----------------------LAKECAT------------------------+\n'
    '|                                                      |\n'
    '| Warning!!!!!, you are about to leave the Internet    |\n'
    '| Gopher program and connect to another host. If you   |\n'
    '| get stuck press the control key and the ] key, and   |\n'
    '| then type quit                                       |\n'
    '|                                                      |\n'
    '| Connecting to lakecat.lakeside-state.edu using telnet|\n'
    '|                                                      |\n'
    '|                 [<a href="#g-root" data-go="root" class="g-up">Cancel - ^G</a>] [<a href="#g-telnet" data-go="telnet">Connect - Enter</a>]     |\n'
    '+------------------------------------------------------+</pre></section>',
    g_text('telnet', 'telnet lakecat.lakeside-state.edu',
           'Trying 192.0.2.17...\nConnected to lakecat.\n\nLAKECAT Online Catalog\n'
           'Enter A for AUTHOR, T for TITLE, S for SUBJECT\n\n(The museum does not open real telnet sessions.)', 'root'),
    g_text('cso', 'Phone Book (CSO)',
           'Lakeside State University phone book server (qi)\n\n'
           'name: Computing Center Help Desk\nphone: 555-0100\nemail: help@lakeside-state.edu\n'
           'location: Hall 4, Room 112', 'root'),
    g_text('map', 'Campus Map (GIF, 41k)',
           'This item is a picture. Your terminal cannot display it.\n'
           'Save it to your account with "s", or fetch it with\nthe Mac client in the Hall 4 lab.', 'campus'),
    g_text('binhex', 'Gopher client for the Mac (BinHex)',
           '(This file must be converted with BinHex 4.0)\n\n:$f*TEQKPH#jdCA0d,R0TG!"6594%8dP8)3#3"!&amp;m!*!%Esb6...', 'cc'),
    '<section class="g-page" id="g-search" data-screen="search" data-parent="root" aria-label="Search Lakeside Gopherspace"><pre>'
    '+-----------------Search Lakeside Gopherspace-----------------+\n'
    '|                                                             |\n'
    '| Words to search for                                         |\n'
    '|                                                             |\n'
    '| <form class="g-search" action="#g-results"><label for="g-q" class="sr-only">Words to search for</label><input id="g-q" name="q" size="40" maxlength="40" autocomplete="off" spellcheck="false" data-keys="own"><button type="submit">Search</button></form>        |\n'
    '|                                                             |\n'
    '| [<a href="#g-root" data-go="root" class="g-up">Cancel ^G</a>]                                  [Accept - Enter] |\n'
    '+-------------------------------------------------------------+</pre></section>',
    '<section class="g-page" id="g-results" data-screen="results" data-parent="search" aria-label="Search results"><pre>'
    f'{"Internet Gopher Information Client v1.12":^64}\n\n'
    '<b class="g-rtitle">          Search Lakeside Gopherspace: gopher</b>\n\n\n'
    '<span class="g-menu"><span class="g-arrow">--&gt;</span>  1.  <a href="#g-about" data-go="about" data-kind="txt">About the Lakeside State University Gopher.</a>\n'
    '<span class="g-arrow">   </span>  2.  <a href="#g-dialin" data-go="dialin" data-kind="txt">Dial-in modem numbers.</a>\n'
    '<span class="g-arrow">   </span>  3.  <a href="#g-www" data-go="www" data-kind="txt">What is a "World-Wide Web"?.</a></span>\n\n\n'
    'Press <kbd>?</kbd> for Help, u to go up a menu           Page: 1/1\n'
    '<a href="#g-root" data-go="root" class="g-up">[u] Up a menu</a></pre></section>',
])

# ================================================================= PAGE
# Check minitel placeholders keep their 40-column rows: '<span class=city>' is 17 chars incl. escaping? compute visible width.
for name, rep in [('mt-city', 20), ('mt-dur', 10), ('mt-cost', 10)]:
    pass

page = f'''<div class="preweb">
  <header class="pw-head">
    <p class="pw-back"><a href="/eras/01-bbs/">&larr; Back to the BBS</a></p>
    <h1>Before the web: Teletext, Minitel &amp; Gopher</h1>
    <p class="pw-lede">The web did not arrive in an empty room. From the mid-1970s, millions of people already read news, weather and timetables on screens: <strong>teletext</strong> rode along with the TV signal, France's <strong>Minitel</strong> sat by the phone in millions of homes, and in 1991 university <strong>Gopher</strong> menus linked campuses across the Internet. All three are live below. Click a screen and use its keys.</p>
  </header>

  <div class="pw-grid">
  <section class="pw-term pw-tt" aria-labelledby="pw-tt-h" data-trait="teletext">
    <h2 id="pw-tt-h">Teletext <small>UK &amp; Europe, 1974–2012</small></h2>
    <p class="pw-cap">Pages were broadcast in a loop inside the TV signal. Type a page number and the set waits for it to come round: watch the header count.</p>
    <div class="tv">
      <!-- snippet:teletext-grid:start -->
      <div class="tt-screen" id="tt-screen" tabindex="0" data-keys="own" data-trait="char-grid mosaic" aria-label="Teletext screen. Type a three-digit page number.">
        <div class="tt-inner">
          {tt_header}
          <div class="tt-pages">
{teletext}
          </div>
        </div>
      </div>
      <!-- snippet:teletext-grid:end -->
    </div>
    <div class="remote" data-trait="fastext" role="group" aria-label="Teletext remote control">
      <div class="remote__keys">
        {''.join(f'<button type="button" data-digit="{d}">{d}</button>' for d in '1234567890')}
      </div>
      <div class="remote__fast">
        <button type="button" class="k-red" data-fast="0">Red</button><button type="button" class="k-green" data-fast="1">Green</button><button type="button" class="k-yellow" data-fast="2">Yellow</button><button type="button" class="k-cyan" data-fast="3">Cyan</button>
        <button type="button" class="k-reveal" aria-pressed="false">Reveal</button>
      </div>
    </div>
  </section>

  <section class="pw-term pw-mt" aria-labelledby="pw-mt-h" data-trait="minitel">
    <h2 id="pw-mt-h">Minitel <small>France, 1982–2012</small></h2>
    <p class="pw-cap">A free terminal from the phone company. You dialled a code like 3615, typed a service name, and paid by the minute. Navigation was a row of function keys.</p>
    <div class="minitel">
      <div class="mt-screen" id="mt-screen" data-trait="char-grid">
        <div class="mt-inner">
          <div class="mt-status"><span class="fw">3615 METEOVILLE</span><span class="mt-msg fy"></span><span class="mt-cf fw" title="Connecté">C</span></div>
          <form class="mt-pages" id="mt-form" action="#mt-sommaire">
{minitel}
          </form>
        </div>
      </div>
      <!-- snippet:function-keys:start -->
      <div class="mt-keys" role="group" aria-label="Minitel function keys" data-trait="function-keys">
        <button type="button" data-key="sommaire">Sommaire</button>
        <button type="button" data-key="annulation">Annulation</button>
        <button type="button" data-key="retour">Retour</button>
        <button type="button" data-key="repetition">Répétition</button>
        <button type="button" data-key="guide">Guide</button>
        <button type="button" data-key="correction">Correction</button>
        <button type="button" data-key="suite">Suite</button>
        <button type="button" data-key="envoi" class="mt-envoi">Envoi</button>
        <button type="button" data-key="fin" class="mt-fin">Connexion/Fin</button>
      </div>
      <!-- snippet:function-keys:end -->
      <label class="mt-bw"><input type="checkbox" id="mt-bw"> Minitel 1 black-and-white screen</label>
    </div>
  </section>

  <section class="pw-term pw-go" aria-labelledby="pw-go-h" data-trait="gopher">
    <h2 id="pw-go-h">Gopher <small>Internet, 1991–1995</small></h2>
    <p class="pw-cap">The University of Minnesota's menu system. Every line is a link to a document, a directory or a search, on any server in the world. Use the arrow keys and Enter, <kbd>u</kbd> to go up, or just click.</p>
    <div class="vt">
      <div class="vt__bar" aria-hidden="true"><span>lakeside% gopher</span><span>VT220</span></div>
      <!-- snippet:gopher-menu:start -->
      <div class="g-screen" id="g-screen" tabindex="0" data-keys="own" data-trait="type-glyphs" aria-label="Gopher client. Arrow keys move, Enter opens, u goes up.">
{gopher}
      </div>
      <!-- snippet:gopher-menu:end -->
    </div>
  </section>
  </div>

  <footer class="pw-foot">
    <p>Teletext pages, the 3615 service and the Gopher server are invented recreations. Mosaic graphics are drawn as inline SVG on the same 2&times;3 block grid the originals used.</p>
    <p><a href="/eras/01-bbs/">&larr; Back to the BBS</a></p>
  </footer>
</div>
'''

# Width check for every grid row: strip tags, unescape, count.
for m in re.finditer(r'<div class="(tt|mt)-r[^"]*"[^>]*>(.*?)</div>', page):
    txt = html.unescape(re.sub(r'<[^>]+>', '', m.group(2)))
    want = 20 if 'mt-dbl' in m.group(0)[:60] else 40
    if len(txt) > want or (len(txt) < want and txt.strip() and 'b' in m.group(0)[:0]):
        print('WIDTH', len(txt), repr(txt))

open(OUT, 'w').write(page)
print('wrote', len(page.encode()), 'bytes')
