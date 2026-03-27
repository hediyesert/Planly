#!/usr/bin/env python3
"""Beyaz kenarları kırpar, köşeleri yuvarlat (oval hissi). Repo kökünden: PYTHONPATH=scripts/.pillow python3 scripts/process-logo.py"""
import os
from PIL import Image, ImageChops, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "frontend/src/assets/planly-mark.png")
DST = SRC


def trim_white(im: Image.Image, tol: int = 18) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size

    def near_white(x, y):
        r, g, b, a = px[x, y]
        if a < 12:
            return True
        return r >= 255 - tol and g >= 255 - tol and b >= 255 - tol

    min_x, min_y = w, h
    max_x, max_y = -1, -1
    for y in range(h):
        for x in range(w):
            if not near_white(x, y):
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
    if max_x < min_x:
        return im
    return im.crop((min_x, min_y, max_x + 1, max_y + 1))


def oval_round_mask(size: tuple, ratio: float = 0.34) -> Image.Image:
    w, h = size
    r = max(8, int(min(w, h) * ratio))
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=255)
    return mask


def apply_rounded_alpha(im: Image.Image, mask: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    bands = im.split()
    alpha = bands[3]
    new_alpha = ImageChops.multiply(alpha, mask)
    im.putalpha(new_alpha)
    return im


def main():
    base = Image.open(SRC)
    trimmed = trim_white(base)
    mask = oval_round_mask(trimmed.size, ratio=0.38)
    out = apply_rounded_alpha(trimmed, mask)
    out.save(DST, "PNG", optimize=True)
    print("OK", DST, out.size)


if __name__ == "__main__":
    main()
