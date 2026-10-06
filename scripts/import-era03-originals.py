#!/usr/bin/env python3
"""Copies the archived 1990s GIFs for era 03 (Dave's Kool Page) into public/, with their stills.

    python3 scripts/import-era03-originals.py <path to the unzipped "22k animated gifs" folder>

Sources (both downloaded once by hand, not fetched by the site):
  - "22k Animated Gifs", a 90s clip-art collection: https://archive.org/details/22k-animated-gifs
    (unzip "22k animated gifs.zip" and pass the "22k animated gifs" folder).
  - Archive Team's GeoCities "Under construction" collection: http://www.textfiles.com/underconstruction/
    (fetched by this script).

Files are copied byte for byte, except:
  - new.gif cycles its colour every 300 ms; it is re-timed to 500 ms (house rule: under 3 flashes per second).
  - counter-digits.gif is a 0-9 strip cut from the first wheel of an odometer GIF, one digit per frame.
Every animation gets <role>-still.gif (its first frame) for prefers-reduced-motion and readable mode.
The roles with no fitting original (fire, the three 88x31 badges) stay drawn by make-era03-gifs.py.
"""
import os
import shutil
import sys
import urllib.request

from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'demos', '03-homepages')
UC_URL = 'http://www.textfiles.com/underconstruction/trtranstinaiconsconstruction.gif'

# role -> path inside the "22k animated gifs" folder
FROM_22K = {
    'globe': 'animated/EARTH.GIF',
    'divider': 'MISC/BUTTON/MISC/RAINLN.GIF',
    'mailbox': 'HOUSE/MAILBOX/MAIL2.GIF',
    'new': 'MISC/BUTTON/MISC/NEW.GIF',
    'dancer': 'animated/BALLET.GIF',
}
COUNTER = 'ELECTRO/COUNTER/COUNTER.GIF'
DIGIT_W = 15  # the odometer is 90x20: six wheels of 15 px


def frames_of(im):
    for i in range(getattr(im, 'n_frames', 1)):
        im.seek(i)
        yield i


def still(role):
    """Saves frame 0 of <role>.gif as <role>-still.gif, keeping its palette and transparency."""
    im = Image.open(os.path.join(OUT, f'{role}.gif'))
    im.seek(0)
    kw = {}
    if 'transparency' in im.info:
        kw['transparency'] = im.info['transparency']
    im.copy().save(os.path.join(OUT, f'{role}-still.gif'), **kw)


def retime(role, ms):
    path = os.path.join(OUT, f'{role}.gif')
    im = Image.open(path)
    frames = [im.copy() for _ in frames_of(im)]
    frames[0].save(path, save_all=True, append_images=frames[1:], loop=im.info.get('loop', 0), duration=ms)


def counter_digits(src):
    im = Image.open(src)
    strip = Image.new('RGB', (DIGIT_W * 10, im.height))
    for i in frames_of(im):  # frame n shows digit n on the first wheel
        strip.paste(im.convert('RGB').crop((0, 0, DIGIT_W, im.height)), (i * DIGIT_W, 0))
    strip.save(os.path.join(OUT, 'counter-digits.gif'))


def main(root):
    os.makedirs(OUT, exist_ok=True)
    with urllib.request.urlopen(UC_URL) as r, open(os.path.join(OUT, 'under-construction.gif'), 'wb') as f:
        f.write(r.read())
    for role, rel in FROM_22K.items():
        shutil.copyfile(os.path.join(root, rel), os.path.join(OUT, f'{role}.gif'))
    retime('new', 500)
    for role in ['under-construction', *FROM_22K]:
        still(role)
    counter_digits(os.path.join(root, COUNTER))
    for role in ['under-construction', *FROM_22K, 'counter-digits']:
        im = Image.open(os.path.join(OUT, f'{role}.gif'))
        print(f'{role}.gif  {im.width}x{im.height}  {getattr(im, "n_frames", 1)} frame(s)')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
