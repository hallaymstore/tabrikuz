"""Compose the floral ornament set in public/assets/ornaments/ from the
transparent botanical illustrations in public/assets/backgrounds/.

Run:  python scripts/build-ornaments.py   (needs Pillow + numpy)

Each output is a real RGBA WebP with a transparent background. Replacing any
file with hand-made art of the same name needs no code change.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'public' / 'assets'
SRC, OUT = ROOT / 'backgrounds', ROOT / 'ornaments'


def load(name, fog=False):
    im = Image.open(SRC / f'{name}.webp').convert('RGBA')
    a = np.array(im)
    alpha = a[:, :, 3]
    alpha[alpha < 26] = 0  # stray halo pixels
    if fog:  # the garland ships with a soft white glow; keep only the plant
        rgb = a[:, :, :3].astype(int)
        grey = rgb.max(axis=2) - rgb.min(axis=2) < 34
        alpha[grey & (alpha < 215)] = 0
    im = Image.fromarray(a)
    return im.crop(im.getbbox())


def crop(im, box):
    part = im.crop(box)
    return part.crop(part.getbbox())


def tf(im, scale=1.0, rotate=0.0, flip=False):
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if scale != 1:
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    if rotate:
        im = im.rotate(rotate, resample=Image.BICUBIC, expand=True)
    return im.crop(im.getbbox())


class Canvas:
    def __init__(self, w, h):
        self.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))

    def put(self, art, cx, cy):
        """Place art centred on (cx, cy); parts outside the canvas are clipped."""
        layer = Image.new('RGBA', self.im.size, (0, 0, 0, 0))
        layer.paste(art, (round(cx - art.width / 2), round(cy - art.height / 2)), art)
        self.im = Image.alpha_composite(self.im, layer)
        return self

    def save(self, name, pad=4, max_w=None):
        im = self.im.crop(self.im.getbbox())
        if pad:
            framed = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
            framed.paste(im, (pad, pad))
            im = framed
        if max_w and im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        im.save(OUT / f'{name}.webp', 'WEBP', quality=88, method=6)
        print(f'{name}.webp', im.size)
        return im


corner = load('botanical-corner')
garland = load('botanical-garland', fog=True)
festoon = load('festival-divider')
sprig = load('botanical-button')
rose = load('floral-sprig')
bells = load('ivory-bells')
lantern = load('day-lantern')

# Small pieces cut from the larger illustrations.
jasmine = crop(rose, (218, 0, 460, 190))          # jasmine + gilded buds
rose_head = crop(rose, (0, 110, 270, 312))         # the pink rose alone
lisianthus = crop(bells, (112, 0, 330, 176))        # ivory lisianthus pair
bell_tip = crop(bells, (0, 60, 120, 241))          # two bluebells
festoon_left = crop(festoon, (0, 0, 330, 362))     # bow, crystal, mixed blooms
eucalyptus = crop(garland, (800, 40, 1100, 358))   # drooping eucalyptus end
white_sprig = crop(sprig, (0, 0, 250, 173))        # white blossom sprig
pink_sprig = crop(sprig, (250, 0, 520, 173))       # pink blossom tendril

# 1. Top-left: fern, gypsophila and lavender hugging the corner.
c = Canvas(560, 520)
c.put(tf(corner, 1.08), 236, 222)
c.put(tf(bell_tip, .55, -18), 410, 52)
c.save('corner-top-left')

# 2. Top-right: a garden rose in the corner, gilded jasmine along the top,
#    lisianthus trailing down the right edge.
c = Canvas(560, 520)
c.put(tf(lisianthus, .9, -40, flip=True), 400, 236)
c.put(tf(jasmine, .95, 8, flip=True), 236, 74)
c.put(tf(rose_head, .82, -8), 420, 108)
c.save('corner-top-right')

# 3. Bottom-left: bluebells and lisianthus resting on the edge, a pale sprig
#    rising up the left side.
c = Canvas(560, 520)
c.put(tf(white_sprig, .9, 70), 92, 300)
c.put(tf(bells, .92, 4), 250, 420)
c.save('corner-bottom-left')

# 4. Bottom-right: eucalyptus fall with a jewelled festoon cluster.
c = Canvas(560, 520)
c.put(tf(eucalyptus, .95, 58, flip=True), 450, 270)
c.put(tf(festoon_left, .82, 12, flip=True), 330, 420)
c.put(tf(pink_sprig, .7, 0), 150, 470)
c.save('corner-bottom-right')

# Divider 01 — Botanical garland: mirrored vines meeting at a lisianthus heart.
c = Canvas(1240, 220)
c.put(tf(sprig, 1.15, 0), 330, 112)
c.put(tf(sprig, 1.15, 0, flip=True), 910, 112)
c.put(tf(lisianthus, .62), 620, 96)
c.save('divider-floral-01')

# Divider 02 — Romantic floral festoon (lamps are a separate layer).
c = Canvas(festoon.width + 8, festoon.height + 8)
c.put(festoon, c.im.width / 2, c.im.height / 2)
c.save('divider-floral-02')

# Divider 03 — Royal: rose centrepiece, gilded jasmine, lisianthus and bells.
c = Canvas(1300, 280)
for side, f in ((-1, False), (1, True)):
    c.put(tf(bells, .95, 0, flip=not f), 650 + side * 430, 150)
    c.put(tf(jasmine, .9, 0, flip=not f), 650 + side * 205, 128)
c.put(tf(rose_head, .95), 650, 140)
c.save('divider-floral-03')

# Buttons: small, light accents.
Canvas(260, 180).put(tf(white_sprig, .8), 130, 90).save('button-floral-01')
Canvas(280, 200).put(tf(pink_sprig, .85), 140, 100).save('button-floral-02')

# Navbar: slim symmetric vine for the header's lower edge.
c = Canvas(1800, 120)
for x, f in ((170, False), (430, False), (690, False), (1110, True), (1370, True), (1630, True)):
    c.put(tf(sprig, .6, 0, flip=f), x, 60)
c.put(tf(lisianthus, .36), 900, 56)
c.save('navbar-garland')

# Hanging lamp layer for the romantic and royal dividers.
Canvas(lantern.width, lantern.height).put(lantern, lantern.width / 2, lantern.height / 2).save('lamp-pendant', pad=0, max_w=96)

# ---- Full-width seam vines: a continuous band laid across the whole screen
# under each divider, so no section boundary is left bare. Each mixes
# different pieces, flips and scales so the eye never catches a repeat.
def vine(name, pieces, width=2600, height=190, overlap=.62):
    c = Canvas(width, height)
    x, i = 0, 0
    while x < width + 200:
        art, scale, rot, dy = pieces[i % len(pieces)]
        art = tf(art, scale, rot, flip=i % 2 == 1)
        c.put(art, x + art.width / 2, height / 2 + dy)
        x += art.width * overlap
        i += 1
    c.save(name)

vine('seam-vine-01', [(sprig, .8, 0, 0), (white_sprig, .9, -6, -10), (sprig, .74, 4, 8), (pink_sprig, .86, 0, 6), (bell_tip, .6, -72, -4)])
vine('seam-vine-02', [(pink_sprig, .9, 0, 4), (sprig, .78, 0, 0), (festoon_left, .48, -10, -2), (white_sprig, .86, 6, 6), (bell_tip, .62, -80, -8)])
vine('seam-vine-03', [(sprig, .8, 0, 4), (jasmine, .6, -18, 0), (white_sprig, .9, 0, -4), (lisianthus, .5, 0, -6), (pink_sprig, .86, 0, 8)])

# Divider 04 — Garden: jewelled festoon arms and bells around a rose.
c = Canvas(1300, 300)
for side, f in ((-1, False), (1, True)):
    c.put(tf(festoon_left, .7, 0, flip=f), 650 + side * 118, 140)
    c.put(tf(bells, .8, 0, flip=not f), 650 + side * 372, 150)
c.put(tf(rose_head, .78), 650, 132)
c.save('divider-floral-04')
