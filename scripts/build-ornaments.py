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


# ---- Pillars: ivory marble with gilded trim, built as capital / seamless
# shaft tile / base so a column can stand as tall as any section.
from PIL import ImageDraw

SS = 3  # supersampling


def marble(width, height, radius_frac=1.0, flutes=0):
    """Shade a vertical cylinder lit from the upper left."""
    w, h = width * SS, height * SS
    x = (np.arange(w) + .5) / w * 2 - 1
    nx = np.clip(x / radius_frac, -1, 1)
    nz = np.sqrt(np.clip(1 - nx ** 2, 0, 1))
    light = np.clip(-.55 * nx + .83 * nz, 0, 1)
    shade = .62 + .38 * light + .25 * light ** 24
    if flutes:
        groove = (np.cos(np.pi * 2 * flutes * (x + 1) / 2) + 1) / 2
        shade = shade * (1 - .16 * groove ** 3 * nz)
    ivory = np.array([248, 238, 230]) / 255
    blush = np.array([214, 186, 196]) / 255
    rgb = (blush + (ivory - blush) * np.clip(shade, 0, 1.2)[:, None]).clip(0, 1)
    img = np.repeat((rgb * 255)[None, :, :], h, axis=0)
    a = np.where(np.abs(x) <= radius_frac, 255, 0)
    img = np.dstack([img, np.repeat(a[None, :], h, axis=0)]).astype(np.uint8)
    return Image.fromarray(img, 'RGBA')


def gold_band(draw, box, steps=6):
    x0, y0, x1, y1 = box
    for i in range(steps):
        t = i / (steps - 1)
        c = tuple(int(a + (b - a) * t) for a, b in zip((255, 236, 170), (176, 124, 52)))
        yy0 = y0 + (y1 - y0) * i / steps
        draw.rectangle((x0, yy0, x1, y0 + (y1 - y0) * (i + 1) / steps), fill=c + (255,))


def spiral(draw, cx, cy, r, turns, width, color):
    pts = []
    for i in range(int(turns * 90)):
        t = i / 90
        rr = r * (1 - t / (turns + .25))
        ang = t * 2 * np.pi
        pts.append((cx + rr * np.cos(ang), cy + rr * np.sin(ang)))
    draw.line(pts, fill=color, width=width, joint='curve')


def save_ss(im, name):
    im = im.resize((im.width // SS, im.height // SS), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    print(f'{name}.webp', im.size)


# Shaft tile: 140 wide, tiles seamlessly in y.
save_ss(marble(140, 240, .86, flutes=7), 'pillar-shaft')

# Capital (Ionic): echinus, abacus, gilded volutes.
cap = Image.new('RGBA', (200 * SS, 120 * SS), (0, 0, 0, 0))
cap.alpha_composite(marble(200, 26, 1.0).resize((200 * SS, 26 * SS)), (0, 0))
cap.alpha_composite(marble(170, 40, .96).resize((170 * SS, 40 * SS)), (15 * SS, 26 * SS))
cap.alpha_composite(marble(150, 54, .86, flutes=7).resize((150 * SS, 54 * SS)), (25 * SS, 66 * SS))
d = ImageDraw.Draw(cap)
gold_band(d, (6 * SS, 22 * SS, 194 * SS, 30 * SS))
gold_band(d, (30 * SS, 62 * SS, 170 * SS, 69 * SS))
for cx in (30, 170):
    d.ellipse(((cx - 26) * SS, 20 * SS, (cx + 26) * SS, 72 * SS), fill=(247, 236, 228, 255))
    spiral(d, cx * SS, 46 * SS, 24 * SS, 2.4, 5 * SS, (150, 104, 40, 255))
    spiral(d, cx * SS - SS, 45 * SS, 24 * SS, 2.4, 3 * SS, (255, 226, 150, 255))
for i in range(7):  # egg-and-dart beads
    x = (58 + i * 14) * SS
    d.ellipse((x - 5 * SS, 38 * SS, x + 5 * SS, 52 * SS), fill=(232, 214, 210, 255), outline=(190, 150, 120, 255), width=SS)
save_ss(cap, 'pillar-capital')

# Base (Attic): two tori around a scotia, on a plinth.
base_im = Image.new('RGBA', (200 * SS, 100 * SS), (0, 0, 0, 0))
base_im.alpha_composite(marble(150, 10, .86).resize((150 * SS, 10 * SS)), (25 * SS, 0))
base_im.alpha_composite(marble(166, 20, .95).resize((166 * SS, 20 * SS)), (17 * SS, 10 * SS))
base_im.alpha_composite(marble(150, 14, .9).resize((150 * SS, 14 * SS)), (25 * SS, 30 * SS))
base_im.alpha_composite(marble(184, 24, .98).resize((184 * SS, 24 * SS)), (8 * SS, 44 * SS))
base_im.alpha_composite(marble(200, 32, 1.0).resize((200 * SS, 32 * SS)), (0, 68 * SS))
d = ImageDraw.Draw(base_im)
gold_band(d, (10 * SS, 64 * SS, 190 * SS, 70 * SS))
save_ss(base_im, 'pillar-base')

# Vines that wind around a pillar: sprigs crossing the shaft in a zig-zag.
def wrap(name, pieces):
    c = Canvas(240, 760)
    y, i = 40, 0
    while y < 660:
        art, scale, dx = pieces[i % len(pieces)]
        side = 1 if i % 2 else -1
        piece = tf(art, scale, 90 + side * 52, flip=i % 2 == 0)
        c.put(piece, 120 + side * dx, y + piece.height / 2 - 20)
        y += piece.height * .55
        i += 1
    c.save(name)

wrap('wrap-vine-01', [(sprig, .62, 18), (white_sprig, .7, 22), (pink_sprig, .66, 16)])
wrap('wrap-vine-02', [(pink_sprig, .7, 16), (sprig, .6, 20), (bell_tip, .62, 26), (white_sprig, .66, 18)])
wrap('wrap-vine-03', [(white_sprig, .7, 20), (jasmine, .5, 24), (sprig, .6, 16), (bells, .42, 22)])


# ---- Night sky: real moon cut from the midnight scene, night clouds, and
# glow sprites for fireflies and stars (all transparent WebP).
from PIL import ImageFilter as _F

scene = np.array(Image.open(ROOT / 'scenes' / 'midnight-palace.webp').convert('RGB')).astype(float)
cx, cy, R = 931, 157, 50                      # the full moon, top right
box = 92
patch = scene[cy - box:cy + box, cx - box:cx + box]
yy, xx = np.mgrid[-box:box, -box:box]
d = np.sqrt(xx ** 2 + yy ** 2)
# Keep the photographed disk; replace its surroundings (leaves, cloud) with
# a clean halo in the moon's own colour.
edge = np.clip((R + 1.5 - d) / 3, 0, 1)
halo = .62 * np.exp(-((d - R) / (R * .55)) ** 2) * (d > R - 2) * np.clip((box - 2 - d) / (box - R), 0, 1) ** 1.5
alpha = np.maximum(edge, halo)
halo_rgb = np.array([176, 214, 255])
# Fill the few dark specks (a leaf tip, a cloud edge) inside the disk.
disk = d <= R
lum = patch.mean(axis=2)
surface = np.median(patch[disk & (lum > 140)], axis=0)
patch = np.where((disk & (lum < 135))[..., None], surface, patch)
rgb = np.where((edge > 0)[..., None], np.clip(patch + (255 - patch) * .08, 0, 255), halo_rgb)
moon = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')
moon = moon.crop(moon.getbbox()).resize((240, 240), Image.LANCZOS)
moon.save(OUT / 'night-moon.webp', 'WEBP', quality=90, method=6)
print('night-moon.webp', moon.size)

cloud = Image.open(ROOT / 'backgrounds' / 'day-cloud.webp').convert('RGBA')
cloud = cloud.crop(cloud.getbbox())
c = np.array(cloud).astype(float)
night = np.array([62, 92, 170], dtype=float)  # moonlit navy, as in the midnight scene
lumc = c[:, :, :3].mean(axis=2, keepdims=True) / 255
c[:, :, :3] = night * (.42 + .7 * lumc) + np.array([50, 60, 80]) * lumc ** 3
c[:, :, 3] *= .85
nc = Image.fromarray(np.clip(c, 0, 255).astype(np.uint8), 'RGBA')
nc.thumbnail((900, 900))
nc.save(OUT / 'night-cloud.webp', 'WEBP', quality=86, method=6)
print('night-cloud.webp', nc.size)


def glow_sprite(name, size, core, halo, spikes=False):
    s = size * 4
    yy, xx = np.mgrid[0:s, 0:s] - s / 2 + .5
    r = np.sqrt(xx ** 2 + yy ** 2) / (s / 2)
    a = np.exp(-(r / .12) ** 2) + .55 * np.exp(-(r / .38) ** 2)
    if spikes:  # four soft rays for a twinkling star
        a += .5 * np.exp(-(np.abs(xx) / (s * .012)) ** 2) * np.exp(-(r / .9) ** 2)
        a += .5 * np.exp(-(np.abs(yy) / (s * .012)) ** 2) * np.exp(-(r / .9) ** 2)
    a = np.clip(a, 0, 1)
    t = np.clip(np.exp(-(r / .16) ** 2), 0, 1)[..., None]
    rgb = np.array(halo) * (1 - t) + np.array(core) * t
    im = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA').resize((size, size), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    print(f'{name}.webp', im.size)

glow_sprite('firefly', 64, (255, 255, 225), (190, 255, 110))
glow_sprite('night-star', 48, (255, 255, 255), (200, 215, 255), spikes=True)
