#!/usr/bin/env python3
"""Convert position images to WebP (about 70-90% smaller). Run from the repo root:
    pip install pillow
    python3 tools/compress-images.py <folder> [quality]
Writes a .webp next to each .jpg/.jpeg/.png (originals are kept). Then update the
image paths in the data/ files to .webp and run tools/embed-data.py."""
import sys, os
from PIL import Image
root = sys.argv[1] if len(sys.argv) > 1 else 'assets'
q = int(sys.argv[2]) if len(sys.argv) > 2 else 80
saved = n = 0
for d, _, fs in os.walk(root):
    for f in fs:
        if f.lower().endswith(('.jpg', '.jpeg', '.png')) and 'logo' not in d and 'icons' not in d:
            p = os.path.join(d, f); o = os.path.splitext(p)[0] + '.webp'
            im = Image.open(p); im.thumbnail((1400, 1400)); im.save(o, 'WEBP', quality=q, method=6)
            saved += os.path.getsize(p) - os.path.getsize(o); n += 1
print('converted', n, 'files, saved %.1f MB' % (saved / 1e6))
