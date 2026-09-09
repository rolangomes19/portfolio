#!/usr/bin/env python3
"""Regenerate the paper edge masks. Run once, commit the PNGs, never call again.
    python3 gen-edges.py
Output: edge-torn-top.png (2400x36), edge-deckle-top.png (2400x36)
Alpha-only strips for CSS mask-image. Tileable: all sine bands sit at integer
frequencies over the width, so mask-repeat: repeat-x joins seamlessly."""
from PIL import Image, ImageFilter
import math, random

W, H = 2400, 36

def profile(kind, seed):
    rnd = random.Random(seed)
    if kind == 'torn':
        bands = [(3, 7.0), (7, 4.0), (17, 2.2), (41, 1.3), (97, 0.7), (211, 0.42)]
        base = 13.0
    else:
        bands = [(2, 8.5), (5, 5.0), (11, 2.4), (23, 1.0)]
        base = 15.0
    ph = [rnd.uniform(0, 2*math.pi) for _ in bands]
    h = [base + sum(a*math.sin(2*math.pi*f*x/W + p) for (f, a), p in zip(bands, ph))
         for x in range(W)]
    if kind == 'torn':
        for _ in range(46):                      # fibre notches, wrapped
            c, wdt, d = rnd.randrange(W), rnd.randrange(2, 7), rnd.uniform(2.5, 7.0)
            for i in range(-wdt, wdt+1):
                t = 1 - abs(i)/(wdt+1)
                h[(c+i) % W] += d*t*t
    return [min(H-1.0, max(1.0, v)) for v in h]

def build(kind, seed, feather):
    h = profile(kind, seed)
    img = Image.new('LA', (W, H), (255, 0)); px = img.load()
    for x in range(W):
        e = h[x]
        for y in range(H):
            a = 255 if y >= e+1 else 0 if y <= e-1 else int(255*(y-(e-1))/2)
            px[x, y] = (255, a)
    if feather:
        img.putalpha(img.split()[1].filter(ImageFilter.GaussianBlur(feather)))
    return img

for kind, seed, feather, name in [('torn', 20260909, 0.6, 'edge-torn-top.png'),
                                  ('deckle', 71351, 1.1, 'edge-deckle-top.png')]:
    build(kind, seed, feather).save(name, optimize=True)
    print('wrote', name)
