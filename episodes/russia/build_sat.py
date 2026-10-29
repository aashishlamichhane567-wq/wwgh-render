"""Satellite base tiles for the Russia maps, from NASA Blue Marble Next Generation (public domain).

  python build_sat.py world.topo.bathy.200407.3x21600x10800.jpg
  (https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73751/world.topo.bathy.200407.3x21600x10800.jpg)

Blue Marble is plate carree (60 px per degree) and the episode's map projection is linear in lon and lat too,
so a crop of lon -25..215 (wrapping across 180) and lat 82..8 lines up exactly; src/Russia/sat.tsx stretches it
onto the world rectangle. Writes public/sat/l0.jpg (whole map, for wide shots) and public/sat/l1_<col>_<row>.jpg
(native resolution, 8x4 tiles, for close-ups).
"""
import os, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
PPD = 60
LON0, LON1, LAT0, LAT1 = -25, 215, 8, 82
COLS, ROWS = 8, 4
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "sat")

src = Image.open(sys.argv[1]).convert("RGB")
y0, y1 = (90 - LAT1) * PPD, (90 - LAT0) * PPD
east = src.crop(((LON0 + 180) * PPD, y0, 360 * PPD, y1))          # lon -25..180
west = src.crop((0, y0, (LON1 - 180) * PPD, y1))                    # lon -180..35 past the date line -> 180..215
crop = Image.new("RGB", (east.width + west.width, y1 - y0))
crop.paste(east, (0, 0))
crop.paste(west, (east.width, 0))
os.makedirs(OUT, exist_ok=True)

crop.resize((4096, round(4096 * crop.height / crop.width)), Image.LANCZOS).save(os.path.join(OUT, "l0.jpg"), quality=86)
tw, th = crop.width // COLS, crop.height // ROWS
for c in range(COLS):
    for r in range(ROWS):
        crop.crop((c * tw, r * th, (c + 1) * tw, (r + 1) * th)).save(os.path.join(OUT, f"l1_{c}_{r}.jpg"), quality=84)
print("crop", crop.size, "tile", tw, th)
