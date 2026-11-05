"""Split ornaments into animatable parts ("rigs").

Run after build-ornaments.py:  python scripts/build-rigs.py   (Pillow + numpy)

For each ornament the leaves (green) and blossoms (white/pink/violet/blue)
are separated from the stems by colour, cut into connected pieces, and saved
into one parts atlas per ornament. What remains (stems, gold, pearls) is the
static base. Each part records its pivot: for a leaf, where it meets the
stem; for a blossom, its centre. Big blossoms are split again into outer
petals and an inner core so the heart of the flower can move on its own.

Output: public/assets/ornaments/rig/<name>-base.webp, <name>-parts.webp and
public/assets/ornaments/rigs.json.
"""
import json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ORN = Path(__file__).resolve().parent.parent / 'public' / 'assets' / 'ornaments'
OUT = ORN / 'rig'
OUT.mkdir(exist_ok=True)

# name -> max number of moving parts (the largest pieces are kept).
RIGS = {
    'corner-top-left': 22, 'corner-top-right': 18, 'corner-bottom-left': 18, 'corner-bottom-right': 22,
    'divider-floral-01': 34, 'divider-floral-02': 40, 'divider-floral-03': 30, 'divider-floral-04': 36,
    'seam-vine-01': 60, 'seam-vine-02': 60, 'seam-vine-03': 60, 'navbar-garland': 26,
    'wrap-vine-01': 30, 'wrap-vine-02': 30, 'wrap-vine-03': 30,
}


def morph(mask, size, grow):
    im = Image.fromarray((mask * 255).astype(np.uint8))
    im = im.filter(ImageFilter.MaxFilter(size) if grow else ImageFilter.MinFilter(size))
    return np.array(im) > 127


def components(mask, min_area):
    """4-connected labelling; returns a list of (ys, xs) arrays."""
    seen = np.zeros_like(mask, dtype=bool)
    h, w = mask.shape
    out = []
    for y0, x0 in zip(*np.nonzero(mask)):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        ys, xs = [], []
        while q:
            y, x = q.popleft()
            ys.append(y); xs.append(x)
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if len(ys) >= min_area:
            out.append((np.array(ys), np.array(xs)))
    return out


def rig(name, limit):
    src = Image.open(ORN / f'{name}.webp').convert('RGBA')
    rgba = np.array(src)
    alpha = rgba[:, :, 3]
    hsv = np.array(src.convert('RGB').convert('HSV')).astype(int)
    hue, sat, val = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    solid = alpha > 90
    leaf = solid & (hue >= 40) & (hue <= 110) & (sat > 55)
    bloom = solid & ~leaf & (((sat < 48) & (val > 200)) | (((hue > 150) | (hue < 16)) & (sat > 38) & (val > 120)))

    parts = []
    for kind, mask in (('leaf', leaf), ('bloom', bloom)):
        core = morph(morph(mask, 3, False), 3, False)  # cut the thin stems
        for ys, xs in components(core, 30):
            piece = np.zeros_like(mask)
            piece[ys, xs] = True
            piece = morph(piece, 7, True) & mask  # grow back to the true edge
            parts.append((kind, piece))

    parts.sort(key=lambda p: -p[1].sum())
    parts = parts[:limit]

    taken = np.zeros(alpha.shape, dtype=bool)
    final = []
    for kind, piece in parts:
        piece &= ~taken
        area = int(piece.sum())
        if area < 30:
            continue
        taken |= piece
        if kind == 'bloom' and area > 1500:  # inner petals move on their own
            ys, xs = np.nonzero(piece)
            cy, cx = ys.mean(), xs.mean()
            r = np.sqrt(area / np.pi) * .45
            yy, xx = np.mgrid[0:piece.shape[0], 0:piece.shape[1]]
            inner = piece & ((yy - cy) ** 2 + (xx - cx) ** 2 < r * r)
            final += [('petals', piece & ~inner, (cy, cx)), ('heart', inner, (cy, cx))]
        else:
            final.append((kind, piece, None))

    # What stays behind is the static base: stems, gold, pearls.
    base = rgba.copy()
    base[:, :, 3][taken] = 0
    stem = (alpha > 60) & ~taken
    records, crops = [], []
    for k, pm, centre in final:
        ys, xs = np.nonzero(pm)
        if len(ys) < 20:
            continue
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        if k == 'leaf':
            # Pivot on the leaf pixel nearest to where it joins the stem.
            ry, rx = np.nonzero(morph(pm, 5, True) & stem)
            if len(ry):
                ty, tx = ry.mean(), rx.mean()
                j = np.argmin((ys - ty) ** 2 + (xs - tx) ** 2)
                py, px = ys[j], xs[j]
            else:
                py, px = ys.mean(), xs.mean()
        else:
            py, px = centre if centre else (ys.mean(), xs.mean())
        crop = np.zeros((y1 - y0, x1 - x0, 4), dtype=np.uint8)
        sub = pm[y0:y1, x0:x1]
        crop[sub] = rgba[y0:y1, x0:x1][sub]
        crops.append(Image.fromarray(crop))
        records.append([int(x0), int(y0), int(x1 - x0), int(y1 - y0), k,
                        round(float((px - x0) / (x1 - x0)) * 100, 1), round(float((py - y0) / (y1 - y0)) * 100, 1)])

    # Shelf-pack the crops into one atlas.
    order = sorted(range(len(crops)), key=lambda i: -crops[i].height)
    width = 1024 if src.width > 600 else 512
    x = y = shelf = 0
    pos = [None] * len(crops)
    for i in order:
        c = crops[i]
        if x + c.width + 2 > width:
            x, y, shelf = 0, y + shelf + 2, 0
        pos[i] = (x, y)
        x += c.width + 2
        shelf = max(shelf, c.height)
    atlas = Image.new('RGBA', (width, max(1, y + shelf)), (0, 0, 0, 0))
    for i, c in enumerate(crops):
        atlas.paste(c, pos[i])
        records[i] += list(pos[i])

    Image.fromarray(base).save(OUT / f'{name}-base.webp', 'WEBP', quality=88, method=6)
    atlas.save(OUT / f'{name}-parts.webp', 'WEBP', quality=88, method=6)
    print(f'{name}: {len(records)} parts, atlas {atlas.size}')
    # [x, y, w, h, kind, pivotX%, pivotY%, atlasX, atlasY]
    return {'w': src.width, 'h': src.height, 'aw': atlas.width, 'ah': atlas.height, 'parts': records}


data = {}
for name, limit in RIGS.items():
    if (ORN / f'{name}.webp').exists():
        data[name] = rig(name, limit)
(ORN / 'rigs.json').write_text(json.dumps(data, separators=(',', ':')))
print('rigs.json', round((ORN / 'rigs.json').stat().st_size / 1024, 1), 'KB')
