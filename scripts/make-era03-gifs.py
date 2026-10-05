#!/usr/bin/env python3
"""Draws the era 03 GIFs (Dave's Kool Page) that have no archived original, pixel by pixel, with Pillow.

    python3 scripts/make-era03-gifs.py

Writes public/demos/03-homepages/<role>.gif and, for every animation, <role>-still.gif
(one frame) that the room shows under prefers-reduced-motion and in readable mode.
Files are named by their role on the page, so a different GIF can be dropped in under
the same name later. No fonts, clip art or downloads: every pixel is placed here.
Blinking parts change at most twice a second (house rule: under 3 flashes per second).
"""
import math
import os
import random

from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'demos', '03-homepages')
KEY = '#FF00FF'  # palette slot 0: the transparent colour

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def dith(x, y):
    """Ordered (Bayer 4x4) dither threshold in 0..1, the look of 256-colour GIFs."""
    return (BAYER[y % 4][x % 4] + 0.5) / 16


# ---------------------------------------------------------------- pixel fonts
# Rows of bits, space separated. Glyphs may differ in width.
F3 = {k: v.split() for k, v in {
    'A': '010 101 111 101 101', 'B': '110 101 110 101 110', 'C': '011 100 100 100 011',
    'D': '110 101 101 101 110', 'E': '111 100 110 100 111', 'F': '111 100 110 100 100',
    'G': '011 100 101 101 011', 'H': '101 101 111 101 101', 'I': '111 010 010 010 111',
    'J': '001 001 001 101 010', 'K': '101 101 110 101 101', 'L': '100 100 100 100 111',
    'M': '10001 11011 10101 10001 10001', 'N': '1001 1101 1011 1001 1001',
    'O': '010 101 101 101 010', 'P': '110 101 110 100 100', 'Q': '010 101 101 110 011',
    'R': '110 101 110 101 101', 'S': '011 100 010 001 110', 'T': '111 010 010 010 010',
    'U': '101 101 101 101 111', 'V': '101 101 101 101 010', 'W': '10001 10001 10101 11011 10001',
    'X': '101 101 010 101 101', 'Y': '101 101 010 010 010', 'Z': '111 001 010 100 111',
    '0': '111 101 101 101 111', '1': '010 110 010 010 111', '2': '110 001 010 100 111',
    '3': '110 001 010 001 110', '4': '101 101 111 001 001', '5': '111 100 110 001 110',
    '6': '011 100 111 101 111', '7': '111 001 010 010 010', '8': '111 101 111 101 111',
    '9': '111 101 111 001 110', '.': '0 0 0 0 1', '!': '1 1 1 0 1', '-': '000 000 111 000 000',
    'x': '000 101 010 101 000', ' ': '00 00 00 00 00',
}.items()}

F5 = {k: v.split() for k, v in {
    'A': '01110 10001 10001 11111 10001 10001 10001', 'C': '01110 10001 10000 10000 10000 10001 01110',
    'D': '11110 10001 10001 10001 10001 10001 11110', 'E': '11111 10000 10000 11110 10000 10000 11111',
    'H': '10001 10001 10001 11111 10001 10001 10001', 'I': '111 010 010 010 010 010 111',
    'M': '10001 11011 10101 10101 10001 10001 10001', 'N': '10001 11001 10101 10011 10001 10001 10001',
    'O': '01110 10001 10001 10001 10001 10001 01110', 'P': '11110 10001 10001 11110 10000 10000 10000',
    'R': '11110 10001 10001 11110 10100 10010 10001', 'S': '01111 10000 10000 01110 00001 00001 11110',
    'T': '11111 00100 00100 00100 00100 00100 00100', 'U': '10001 10001 10001 10001 10001 10001 01110',
    'W': '10001 10001 10001 10101 10101 10101 01010', 'G': '01110 10001 10000 10111 10001 10001 01111',
    '!': '1 1 1 1 1 0 1', ' ': '000 000 000 000 000 000 000',
    '0': '01110 10001 10011 10101 11001 10001 01110', '1': '00100 01100 00100 00100 00100 00100 01110',
    '2': '01110 10001 00001 00010 00100 01000 11111', '3': '11111 00010 00100 00010 00001 10001 01110',
    '4': '00010 00110 01010 10010 11111 00010 00010', '5': '11111 10000 11110 00001 00001 10001 01110',
    '6': '00110 01000 10000 11110 10001 10001 01110', '7': '11111 00001 00010 00100 01000 01000 01000',
    '8': '01110 10001 10001 01110 10001 10001 01110', '9': '01110 10001 10001 01111 00001 00010 01100',
}.items()}


def text_pixels(s, font, bold=False, scale=1):
    """Set of (x, y) pixels for a string, origin top-left, plus its width."""
    px, x = set(), 0
    for ch in s:
        rows = font[ch]
        for gy, row in enumerate(rows):
            for gx, bit in enumerate(row):
                if bit == '1':
                    for b in range(2 if bold else 1):
                        for sy in range(scale):
                            for sx in range(scale):
                                px.add((x + (gx + b) * scale + sx, gy * scale + sy))
        x += (len(rows[0]) + (1 if bold else 0) + 1) * scale
    return px, x - scale


def text(img, x, y, s, font, c, bold=False, shadow=None, scale=1, center=False, max_w=None):
    px, w = text_pixels(s, font, bold, scale)
    if max_w is not None and w > max_w:
        raise ValueError(f'"{s}" is {w}px wide, more than {max_w}px')
    if center:
        x = x - w // 2
    if shadow is not None:
        for (a, b) in px:
            img.putpixel((x + a + 1, y + b + 1), shadow)
    for (a, b) in px:
        img.putpixel((x + a, y + b), c)
    return w


# ---------------------------------------------------------------- canvas helpers
def canvas(w, h, pal, bg=0):
    img = Image.new('P', (w, h), bg)
    flat = []
    for c in pal:
        flat += [int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)]
    img.putpalette(flat)
    return img, ImageDraw.Draw(img)


def rect(d, x, y, w, h, c):
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)


def outline(img, c):
    """Paint a 1px outline on transparent pixels touching the drawing (classic clip-art edge)."""
    w, h = img.size
    src = img.copy()
    for y in range(h):
        for x in range(w):
            if src.getpixel((x, y)) != 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src.getpixel((nx, ny)) not in (0, c):
                    img.putpixel((x, y), c)
                    break


def bevel(d, w, h, light, dark):
    d.line([(0, h - 1), (0, 0), (w - 1, 0)], fill=light)
    d.line([(1, h - 1), (w - 1, h - 1), (w - 1, 1)], fill=dark)


def save(name, frames, durations, still=None, transparent=True):
    os.makedirs(OUT, exist_ok=True)
    kw = dict(optimize=False)
    if transparent:
        kw.update(transparency=0, disposal=2)
    path = os.path.join(OUT, f'{name}.gif')
    if len(frames) == 1:
        frames[0].save(path, **kw)
    else:
        frames[0].save(path, save_all=True, append_images=frames[1:], loop=0, duration=durations, **kw)
    if still is not None:
        frames[still].save(os.path.join(OUT, f'{name}-still.gif'), **kw)
    print(f'{name}.gif  {frames[0].size[0]}x{frames[0].size[1]}  {len(frames)} frame(s)  {os.path.getsize(path)} bytes')


# ---------------------------------------------------------------- under construction
def under_construction():
    pal = ['#000000', '#FFFFFF', '#FFFF00', '#FFCC00', '#FF9900', '#FF6600', '#663300', '#996633',
           '#FFCC99', '#CC9966', '#003399', '#999999', '#666666', '#CCCCCC', '#333333', '#993300', '#CC6600']
    BLK, WHT, YEL, YEL2, ORA, ORA2, DBR, BRN, SKIN, SKIN2, JEAN, GRY, DGRY, LGRY, VDGRY, AMBOFF, RUST = range(17)
    rng = random.Random(3)
    ground = [(x, y) for y in range(57, 64) for x in range(120) if rng.random() < 0.35]
    # Grip on the handle, then blade end, per frame: in the dirt, lifting, throwing, coming back.
    poses = [((36, 33), (45, 53)), ((35, 31), (48, 45)), ((34, 28), (48, 22)), ((35, 31), (47, 42))]
    frames = []
    for f in range(4):
        img, d = canvas(120, 64, pal)
        bob = 1 if f == 0 else 0
        text(img, 60, 2, 'UNDER CONSTRUCTION', F5, YEL2, shadow=RUST, center=True)
        # ground and dirt pile
        rect(d, 0, 57, 120, 7, DBR)
        for p in ground:
            img.putpixel(p, BRN)
        d.pieslice([40, 49, 66, 66], 180, 360, fill=BRN)
        for y in range(50, 58):
            for x in range(40, 67):
                if img.getpixel((x, y)) == BRN and dith(x, y) < 0.3:
                    img.putpixel((x, y), DBR)
        # barricade: two posts, two striped boards, lamp on top
        for px in (70, 110):
            rect(d, px, 30, 3, 27, LGRY)
            rect(d, px + 2, 30, 1, 27, GRY)
            rect(d, px - 2, 55, 7, 2, DGRY)
        for (by, bh) in ((28, 9), (43, 6)):
            for y in range(by, by + bh):
                for x in range(64, 118):
                    img.putpixel((x, y), BLK if ((x - y) // 5) % 2 == 0 else YEL2)
            d.line([(64, by + bh), (117, by + bh)], fill=VDGRY)
        rect(d, 89, 20, 2, 8, GRY)
        rect(d, 86, 24, 8, 4, DGRY)
        on = f < 2  # on 400 ms, off 400 ms: 1.25 flashes per second
        rect(d, 86, 15, 8, 9, ORA if on else AMBOFF)
        rect(d, 87, 14, 6, 1, ORA if on else AMBOFF)
        if on:
            rect(d, 88, 16, 4, 4, YEL)
            rect(d, 89, 17, 2, 2, WHT)
            for (a, b) in ((83, 13), (82, 18), (83, 23), (96, 13), (97, 18), (96, 23), (90, 11)):
                img.putpixel((a, b), YEL)
        # the worker
        y0 = 14 + bob
        rect(d, 21, y0, 9, 4, YEL2)
        rect(d, 19, y0 + 4, 13, 1, YEL2)
        img.putpixel((23, y0 + 1), YEL)
        rect(d, 21, y0 + 5, 9, 7, SKIN)
        rect(d, 21, y0 + 10, 9, 2, SKIN2)
        img.putpixel((23, y0 + 7), BLK)
        img.putpixel((27, y0 + 7), BLK)
        rect(d, 24, y0 + 10, 3, 1, DBR)
        rect(d, 19, y0 + 12, 13, 13, ORA2)
        rect(d, 19, y0 + 17, 13, 2, YEL)
        rect(d, 20, 40, 4, 14, JEAN)
        rect(d, 26, 40, 4, 14, JEAN)
        rect(d, 18, 54, 6, 3, DBR)
        rect(d, 26, 54, 6, 3, DBR)
        (gx, gy), (bx, by_) = poses[f]
        d.line([(gx - 3, gy - 4), (bx, by_)], fill=BRN, width=2)  # handle
        ang = math.atan2(by_ - gy, bx - gx)
        ux, uy = math.cos(ang), math.sin(ang)
        tip = (bx + ux * 6, by_ + uy * 6)
        nx, ny = -uy * 3, ux * 3
        d.polygon([(bx + nx, by_ + ny), (bx - nx, by_ - ny), (tip[0] - nx * 0.6, tip[1] - ny * 0.6), (tip[0] + nx * 0.6, tip[1] + ny * 0.6)], fill=GRY)
        if f == 1:
            rect(d, int(tip[0]) - 3, int(tip[1]) - 3, 4, 2, BRN)
        d.line([(30, y0 + 14), (gx, gy)], fill=ORA2, width=3)  # arm
        rect(d, gx - 1, gy - 1, 3, 3, SKIN)
        if f == 2:
            for (a, b) in ((54, 24), (57, 20), (60, 26), (52, 18), (58, 30)):
                rect(d, a, b, 2, 2, BRN)
        if f == 3:
            for (a, b) in ((56, 40), (60, 44), (53, 45), (62, 37)):
                rect(d, a, b, 2, 2, BRN)
        frames.append(img)
    save('under-construction', frames, [200] * 4, still=0, transparent=False)


# ---------------------------------------------------------------- spinning globe
def globe():
    pal = [KEY, '#000033', '#000099', '#0033CC', '#3366FF', '#003300', '#006600', '#339933', '#66CC33',
           '#666699', '#999999', '#CCCCCC', '#FFFFFF', '#000000']
    OCEAN, LAND, ICE = [1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]
    # A made-up planet: blobby continents from a fixed seed, on a 96x48 equirectangular map.
    rng = random.Random(1997)
    blobs = [(rng.uniform(0, 2 * math.pi), rng.uniform(-1.0, 1.0), rng.uniform(0.25, 0.6)) for _ in range(16)]
    MW, MH = 96, 48
    land = [[False] * MW for _ in range(MH)]
    for j in range(MH):
        lat = (0.5 - (j + 0.5) / MH) * math.pi
        for i in range(MW):
            lon = (i + 0.5) / MW * 2 * math.pi
            v = 0
            for (blon, blat, br) in blobs:
                c = math.sin(lat) * math.sin(blat) + math.cos(lat) * math.cos(blat) * math.cos(lon - blon)
                dist = math.acos(max(-1, min(1, c)))
                v += math.exp(-(dist / br) ** 2)
            v += 0.15 * math.sin(lon * 7 + lat * 5) * math.sin(lat * 9)
            land[j][i] = v > 0.62
    S, R = 44, 20.5
    c0 = S / 2
    tilt = math.radians(20)
    L = (-0.55, -0.55, 0.63)
    frames = []
    N = 16
    for f in range(N):
        img, d = canvas(S, S, pal)
        for py in range(S):
            for px in range(S):
                nx, ny = (px + 0.5 - c0) / R, (py + 0.5 - c0) / R
                rr = nx * nx + ny * ny
                if rr > 1:
                    continue
                nz = math.sqrt(1 - rr)
                # tilt the axis toward the viewer, then read latitude/longitude
                ty = ny * math.cos(tilt) - nz * math.sin(tilt)
                tz = ny * math.sin(tilt) + nz * math.cos(tilt)
                lat = math.asin(max(-1, min(1, -ty)))
                lon = (math.atan2(nx, tz) - 2 * math.pi * f / N) % (2 * math.pi)
                i = int(lon / (2 * math.pi) * MW) % MW
                j = min(MH - 1, int((0.5 - lat / math.pi) * MH))
                ramp = ICE if abs(lat) > math.radians(68) else LAND if land[j][i] else OCEAN
                b = max(0.0, nx * L[0] + ny * L[1] + nz * L[2]) * 1.15 + 0.1
                lvl = int(b * 3 + dith(px, py) - 0.25)
                img.putpixel((px, py), ramp[max(0, min(3, lvl))])
        # a glint of sunlight on the sea
        if img.getpixel((14, 12)) in OCEAN:
            img.putpixel((14, 12), 12)
        outline(img, 13)
        frames.append(img)
    save('globe', frames, [100] * N, still=0)


# ---------------------------------------------------------------- fire divider
def fire():
    pal = [KEY, '#330000', '#660000', '#990000', '#CC0000', '#FF3300', '#FF6600', '#FF9900',
           '#FFCC00', '#FFFF00', '#FFFF99', '#FFFFFF']
    W, H, TOP = 234, 22, 11
    rng = random.Random(42)
    heat = [[0] * W for _ in range(H)]
    for x in range(W):
        heat[H - 1][x] = TOP

    def step():
        for x in range(W):  # the coals flicker a little
            heat[H - 1][x] = TOP - (1 if rng.random() < 0.15 else 0)
        for y in range(1, H):
            for x in range(W):
                r = rng.randint(0, 3)
                dst = (x - r + 1) % W
                heat[y - 1][dst] = max(0, heat[y][x] - (1 if r & 1 else 0) - (1 if rng.random() < 0.55 else 0))

    for _ in range(80):
        step()
    frames = []
    for _ in range(8):
        step()
        img, d = canvas(W, 16, pal)
        for y in range(16):
            for x in range(W):
                img.putpixel((x, y), heat[y + H - 17][x])
        frames.append(img)
    save('fire', frames, [100] * 8, still=0)


# ---------------------------------------------------------------- rainbow divider
def divider():
    hues = ['#FF0000', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00', '#99FF00', '#00FF00', '#00FF99',
            '#00FFFF', '#0099FF', '#0000FF', '#9900FF', '#FF00FF', '#FF0099']
    pal = [KEY] + hues + ['#FFFFFF']
    W, H, BAND = 448, 6, 8
    n = len(hues)
    frames = []
    for f in range(n):
        img, d = canvas(W, H, pal)
        for y in range(H):
            for x in range(W):
                h = ((x + f * BAND) / BAND) % n
                k = int(h)
                if dith(x, y) < h - k:
                    k = (k + 1) % n
                img.putpixel((x, y), 1 + k)
        for x in range(0, W, 4):  # sparkly top edge
            img.putpixel((x + (f % 4), 0), n + 1)
        frames.append(img)
    save('divider', frames, [80] * n, still=0)


# ---------------------------------------------------------------- mailbox
def mailbox():
    pal = [KEY, '#000000', '#0033CC', '#3366FF', '#003399', '#996633', '#663300', '#FFFFFF',
           '#CCCCCC', '#FF0000', '#990000', '#000066', '#FFFF00']
    BLK, BLU, LBLU, DBLU, BRN, DBR, WHT, GRY, RED, DRED, NAVY, YEL = range(1, 13)
    # (letter top y or None, flag angle in degrees: 0 = down, 90 = up)
    script = [(0, 0), (5, 0), (10, 0), (None, 45), (None, 90), (None, 90)]
    frames = []
    for (ly, flag) in script:
        img, d = canvas(48, 40, pal)
        if ly is not None:
            rect(d, 12, ly, 14, 9, WHT)
            d.line([(12, ly), (19, ly + 5), (25, ly)], fill=RED)
            rect(d, 22, ly + 1, 2, 2, LBLU)
            d.rectangle([12, ly, 25, ly + 8], outline=GRY)
        rect(d, 21, 25, 5, 15, BRN)
        rect(d, 24, 25, 2, 15, DBR)
        d.pieslice([6, 9, 41, 31], 180, 360, fill=BLU)
        rect(d, 6, 19, 36, 8, BLU)
        rect(d, 6, 25, 36, 2, DBLU)
        d.arc([7, 10, 40, 30], 200, 300, fill=LBLU)
        rect(d, 6, 15, 4, 12, DBLU)  # the door
        rect(d, 9, 20, 1, 2, YEL)
        a =math.radians(flag)
        px, py = 40, 21
        ex, ey = px - 12 * math.cos(a), py - 12 * math.sin(a)
        d.line([(px, py), (ex, ey)], fill=GRY, width=2)
        rect(d, int(ex) - 2, int(ey) - 2, 5, 4, RED)
        rect(d, px - 1, py - 1, 3, 3, NAVY)
        if flag == 90 and ly is None:
            text(img, 2, 2, '!', F5, YEL)
        outline(img, BLK)
        frames.append(img)
    save('mailbox', frames, [300, 200, 200, 200, 600, 400], still=4)


# ---------------------------------------------------------------- NEW! starburst
def new():
    pal = [KEY, '#FF0000', '#FFFF00', '#990000', '#FFFFFF']
    RED, YEL, DRED, WHT = 1, 2, 3, 4
    W, H = 40, 24
    cx, cy = W / 2 - 0.5, H / 2 - 0.5
    pts = []
    for k in range(28):
        a = math.pi * k / 14
        rx, ry = (19, 11.5) if k % 2 == 0 else (14.5, 8)
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
    frames = []
    for burst, ink in ((RED, YEL), (YEL, RED)):  # swap every 500 ms: one flash a second
        img, d = canvas(W, H, pal)
        d.polygon(pts, fill=burst)
        text(img, W // 2, 8, 'NEW!', F5, ink, bold=True, center=True)
        outline(img, DRED)
        frames.append(img)
    save('new', frames, [500, 500], still=0)


# ---------------------------------------------------------------- dancing alien
def dancer():
    pal = [KEY, '#336600', '#66CC33', '#99FF66', '#000000', '#FFFFFF', '#FF0000', '#FFFF00', '#9900CC', '#CC66FF']
    DGRN, GRN, LGRN, BLK, WHT, RED, YEL, PUR, LPUR = range(1, 10)
    # per frame: body bob, lean, (left hand), (right hand), left foot x, right foot x
    poses = [
        (0, 0, (4, 6), (31, 6), 11, 22),
        (2, 0, (3, 22), (32, 22), 9, 24),
        (0, 2, (6, 30), (31, 4), 12, 24),
        (2, 0, (3, 22), (32, 22), 9, 24),
    ]
    frames = []
    for f, (bob, lean, lh, rh, lf, rf) in enumerate(poses):
        img, d = canvas(36, 44, pal)
        hx, hy = 18 + lean, 4 + bob
        # antenna with a bobble that swings
        side = -3 if f % 2 == 0 else 3
        d.line([(hx, hy + 2), (hx + side, hy - 3)], fill=DGRN)
        rect(d, hx + side - 1, hy - 4, 3, 2, RED if f % 2 == 0 else YEL)
        # legs
        d.line([(16 + lean, 32 + bob), (lf, 40)], fill=GRN, width=3)
        d.line([(21 + lean, 32 + bob), (rf, 40)], fill=GRN, width=3)
        rect(d, lf - 2, 40, 5, 2, PUR)
        rect(d, rf - 2, 40, 5, 2, PUR)
        # body in a purple party shirt
        d.ellipse([12 + lean, 18 + bob, 25 + lean, 33 + bob], fill=PUR)
        rect(d, 15 + lean, 22 + bob, 2, 2, LPUR)
        rect(d, 20 + lean, 26 + bob, 2, 2, LPUR)
        # arms
        d.line([(13 + lean, 21 + bob), lh], fill=GRN, width=2)
        d.line([(24 + lean, 21 + bob), rh], fill=GRN, width=2)
        for h in (lh, rh):
            rect(d, h[0] - 1, h[1] - 1, 3, 3, LGRN)
        # head with big eyes
        d.ellipse([hx - 7, hy, hx + 7, hy + 14], fill=GRN)
        rect(d, hx - 4, hy + 2, 3, 1, LGRN)
        d.ellipse([hx - 6, hy + 5, hx - 2, hy + 9], fill=BLK)
        d.ellipse([hx + 2, hy + 5, hx + 6, hy + 9], fill=BLK)
        img.putpixel((hx - 5, hy + 6), WHT)
        img.putpixel((hx + 3, hy + 6), WHT)
        d.line([(hx - 2, hy + 11), (hx + 2, hy + 11)], fill=DGRN)
        outline(img, BLK)
        frames.append(img)
    save('dancer', frames, [180] * 4, still=0)


# ---------------------------------------------------------------- 88x31 badges
def badge_navigator():
    pal = ['#000066', '#9999FF', '#000033', '#FFFFFF', '#FFFF00', '#99CCFF', '#003399', '#CCCCCC', '#FF0000', '#666699']
    BG, LIGHT, DARK, WHT, YEL, SKY, CBLU, GRY, RED, MID = range(10)
    frames = []
    for ang in (-25, 0, 25, 0):  # the compass needle swings
        img, d = canvas(88, 31, pal)
        bevel(d, 88, 31, LIGHT, DARK)
        d.ellipse([3, 5, 23, 25], fill=CBLU, outline=GRY)
        cx, cy = 13, 15
        for k in range(8):
            a = math.pi * k / 4
            img.putpixel((round(cx + 8 * math.sin(a)), round(cy - 8 * math.cos(a))), WHT if k % 2 == 0 else MID)
        a = math.radians(ang)
        tx, ty = cx + 7 * math.sin(a), cy - 7 * math.cos(a)
        d.line([(cx, cy), (tx, ty)], fill=RED, width=2)
        d.line([(cx, cy), (cx - 6 * math.sin(a), cy + 6 * math.cos(a))], fill=WHT, width=2)
        img.putpixel((cx, cy), YEL)
        text(img, 27, 4, 'BEST VIEWED IN', F3, WHT, max_w=59)
        text(img, 27, 12, 'NAVIGATOR 3.0', F3, YEL, max_w=59)
        text(img, 27, 21, 'AT 800x600', F3, SKY, max_w=59)
        frames.append(img)
    save('badge-navigator', frames, [400, 300, 400, 300], still=1, transparent=False)


def badge_notepad():
    pal = ['#CCCCCC', '#FFFFFF', '#666666', '#000000', '#000099', '#99CCFF', '#FFCC00', '#FF9999', '#999999', '#663300']
    BG, WHT, DGRY, BLK, NAVY, SKY, YEL, PINK, GRY, BRN = range(10)
    frames = []
    for f in range(4):
        img, d = canvas(88, 31, pal)
        bevel(d, 88, 31, WHT, DGRY)
        d.rectangle([3, 4, 24, 26], fill=WHT, outline=BLK)
        rect(d, 4, 5, 20, 3, NAVY)
        for y in (11, 15, 19, 23):
            d.line([(6, y), (21, y)], fill=SKY)
        for y in (11, 15):
            d.line([(6, y - 1), (19, y - 1)], fill=GRY)
        x_end = 7 + f * 4  # Dave typing the third line
        d.line([(6, 18), (x_end, 18)], fill=BLK)
        # pencil
        px, py = x_end, 18
        d.line([(px + 1, py - 1), (px + 6, py - 6)], fill=YEL, width=2)
        rect(d, px + 6, py - 8, 2, 2, PINK)
        img.putpixel((px, py), BLK)
        text(img, 56, 6, 'MADE WITH', F3, BLK, center=True)
        text(img, 56, 14, 'NOTEPAD', F5, NAVY, center=True, max_w=60)
        frames.append(img)
    save('badge-notepad', frames, [250] * 4, still=3, transparent=False)


def badge_hometown():
    pal = ['#336699', '#99CCFF', '#003366', '#FFFF00', '#000000', '#FFFFFF', '#CC0000', '#33CC33', '#996633', '#CCCCCC', '#999999']
    BG, LIGHT, DARK, YEL, BLK, WHT, RED, GRN, BRN, GRY, MID = range(11)
    frames = []
    for f in range(3):
        img, d = canvas(88, 31, pal)
        bevel(d, 88, 31, LIGHT, DARK)
        rect(d, 2, 23, 24, 5, GRN)
        rect(d, 17, 8, 3, 6, BRN)
        d.polygon([(3, 15), (13, 6), (23, 15)], fill=RED)
        rect(d, 6, 15, 15, 9, WHT)
        rect(d, 12, 18, 4, 6, BRN)
        rect(d, 7, 17, 3, 3, YEL)
        rect(d, 18, 17, 2, 3, YEL)
        for k in range(3):  # smoke puffs drifting up
            y = 6 - ((f + k * 3) % 9) // 1
            if y >= 1:
                rect(d, 18 + k % 2, y, 2, 2, GRY if k else MID)
        text(img, 56, 3, 'HOMETOWN', F5, YEL, shadow=BLK, center=True, max_w=60)
        text(img, 56, 12, 'PAGES', F5, WHT, shadow=BLK, center=True)
        text(img, 56, 22, 'FREE SITES', F3, LIGHT, center=True)
        frames.append(img)
    save('badge-hometown', frames, [300] * 3, still=0, transparent=False)


# ---------------------------------------------------------------- hit counter digits
def counter_digits():
    """A 0-9 strip, 14x20 per digit, like the GIFs a CGI counter stitched together."""
    pal = ['#000000', '#333333', '#666666', '#FFFFFF', '#CCCCCC', '#111111']
    BLK, DG, MG, WHT, LG, VD = range(6)
    img, d = canvas(140, 20, pal)
    for n in range(10):
        x0 = n * 14
        for y in range(20):
            for x in range(14):
                top = y < 10
                t = (y if top else y - 10) / 10
                c = DG if dith(x, y) > t else (BLK if top else VD)
                img.putpixel((x0 + x, y), c)
        rect(d, x0, 0, 14, 1, MG)
        px, _ = text_pixels(str(n), F5, scale=2)
        for (a, b) in px:
            img.putpixel((x0 + 2 + a, 3 + b), WHT if b < 7 else LG)
        rect(d, x0, 10, 14, 1, BLK)
        rect(d, x0 + 13, 0, 1, 20, BLK)
    save('counter-digits', [img], None, transparent=False)


if __name__ == '__main__':
    # The other roles are archived originals now (scripts/import-era03-originals.py).
    # Their drawn versions stay below in case an original is ever dropped.
    fire()
    badge_navigator()
    badge_notepad()
    badge_hometown()
