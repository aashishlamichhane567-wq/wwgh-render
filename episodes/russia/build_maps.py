"""Builds src/Russia/maps.json: SVG paths for the Russia episode's maps.

Sources (download into one folder, pass it as the first argument):
  - Natural Earth 50m land, lakes, rivers (public domain): github.com/nvkelso/natural-earth-vector/geojson
  - historical-basemaps world_<year>.geojson (GPL-3.0, A. Ourednik): github.com/aourednik/historical-basemaps
Historical polygons are clipped to Natural Earth land so every year shares one crisp coastline.

Projection: equirectangular, standard parallel 50N, north up. Longitudes west of -25 wrap to +335 so Alaska
sits to the right of Chukotka. World units = pixels at s=1; src/Russia/map.tsx has the same formula as proj().
"""
import json, math, sys
from shapely.geometry import shape, box, mapping, MultiPolygon, Polygon, LineString, MultiLineString
from shapely.ops import unary_union, transform
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from shapely import make_valid

SRC = sys.argv[1]
OUT = sys.argv[2]
LON0, LON1, LAT0, LAT1 = -25.0, 215.0, 8.0, 82.0
K = 16.5
COS = math.cos(math.radians(50))
TOL = 0.12  # world px

def px(lon, lat):
    return ((lon - LON0) * K * COS, (LAT1 - lat) * K)

def wrap(geom):
    """Shift the part of a geometry west of LON0 by +360 (keeps Alaska next to Siberia)."""
    west = geom.intersection(box(-180, -90, LON0, 90))
    east = geom.intersection(box(LON0, -90, 180, 90))
    if west.is_empty:
        return east
    shifted = transform(lambda x, y, z=None: (x + 360, y), west)
    return unary_union([east, shifted])

CLIP = box(LON0, LAT0, LON1, LAT1)

def prep(geom):
    g = wrap(geom).intersection(CLIP)
    return transform(lambda x, y, z=None: px(x, y), g)

def fmt(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")

def path_of(g):
    """SVG path data for polygons or lines."""
    out = []
    def ring(coords, close):
        pts = list(coords)
        if len(pts) < 2:
            return
        out.append("M" + "L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + ("Z" if close else ""))
    def walk(h):
        if h.is_empty:
            return
        t = h.geom_type
        if t == "Polygon":
            ring(h.exterior.coords, True)
            for i in h.interiors:
                ring(i.coords, True)
        elif t in ("MultiPolygon", "GeometryCollection", "MultiLineString"):
            for p in h.geoms:
                walk(p)
        elif t == "LineString":
            ring(h.coords, False)
    walk(g)
    return "".join(out)

def load(name):
    return json.load(open(f"{SRC}/{name}.geojson"))["features"]

def polys(g):
    """Keep only areal parts, drop specks under ~6 px²."""
    parts = [p for p in getattr(g, "geoms", [g]) if p.geom_type in ("Polygon", "MultiPolygon")]
    flat = []
    for p in parts:
        flat += list(getattr(p, "geoms", [p]))
    return MultiPolygon([p for p in flat if p.area > 6])

land = unary_union([prep(shape(f["geometry"]).buffer(0)) for f in load("ne_50m_land")])
land = make_valid(land.simplify(TOL))
lakes = unary_union([prep(shape(f["geometry"]).buffer(0)) for f in load("ne_50m_lakes") if (f["properties"].get("scalerank") or 9) <= 3])
lakes = polys(lakes.simplify(TOL))

RIVERS = {"Volga", "Dnieper", "Don", "Ob", "Irtysh", "Yenisey", "Lena", "Amur", "Neva", "Oka", "Kama", "Ural", "Danube"}
rivers = {}
for f in load("ne_50m_rivers_lake_centerlines"):
    n = f["properties"].get("name_en") or f["properties"].get("name")
    if n in RIVERS:
        g = prep(shape(f["geometry"])).simplify(TOL)
        rivers.setdefault(n, []).append(g)
rivers = {n: path_of(unary_union(gs)) for n, gs in rivers.items()}

# year -> list of polity names (as in historical-basemaps) to export as filled shapes
YEARS = {
    900: ["Kyivan Rus", "Byzantine Empire", "Khazars", "Volga Bulgars"],
    1100: ["Kievan Rus", "Byzantine Empire", "Cuman-Kipchak confederation", "Poland", "Mongols"],
    1200: ["Principality of Novgorod", "Principality of Vladimir-Suzdal", "Other Rus Principalities", "Principality of Kyiv",
           "Principality of Galicia-Volhynia", "Mongol Empire", "Cuman Khanates", "Volga Bulgars"],
    1279: ["Khanate of the Golden Horde", "Novgorod", "Ryazan", "Great Khanate", "Chagatai Khanate", "Ilkhanate"],
    1300: ["Grand Duchy of Moscow", "Khanate of the Golden Horde", "Novgorod", "Ryazan"],
    1492: ["Grand Duchy of Moscow", "Golden Horde", "Khanate of Sibir", "Crimean Khanate", "Poland-Lithuania", "Ottoman Empire", "Sweden"],
    1530: ["Tsardom of Muscovy", "Kazan Khanate", "Astrakhan Khanate", "Khanate of Sibir", "Nogai Horde", "Crimean Khanate", "Poland-Lithuania", "Sweden", "Ottoman Empire"],
    1600: ["Tsardom of Muscovy", "Poland-Lithuania", "Sweden", "Ottoman Empire", "Crimean Khanate"],
    1700: ["Tsardom of Muscovy", "Sweden", "Polish–Lithuanian Commonwealth", "Ottoman Empire", "Manchu Empire"],
    1783: ["Russian Empire", "Sweden", "Poland", "Ottoman Empire", "Prussia", "Austrian Empire"],
    1815: ["Russian Empire", "France", "Ottoman Empire", "Prussia", "Austrian Empire", "Sweden–Norway"],
    1880: ["Russian Empire", "Germany", "Ottoman Empire", "Austria Hungary", "Imperial Japan", "Manchu Empire"],
    1914: ["Russian Empire", "Sakhalin (RU)", "German Empire", "Austro-Hungarian Empire", "Empire of Japan", "Ottoman Empire"],
    1920: ["USSR", "Far Eastern SSR", "Ukraine", "White Russia", "Poland", "Finland", "Latvia", "Lithuania"],
    1938: ["USSR", "Germany", "Poland", "Finland", "Empire of Japan"],
    1945: ["USSR", "Germany (Soviet)", "Poland", "Finland"],
    1960: ["USSR", "East Germany", "West Germany", "Poland", "China", "Mongolia"],
    1994: ["Russia", "Ukraine", "Byelarus", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan", "Azerbaijan",
           "Latvia", "Lithuania", "Estonia", "Moldova", "Georgia", "Armenia", "Poland", "Finland", "China", "Mongolia"],
}

years, borders = {}, {}
for y, names in YEARS.items():
    feats = json.load(open(f"{SRC}/world_{y}.geojson"))["features"]
    got, lines = {}, []
    for f in feats:
        n = f["properties"].get("NAME")
        try:
            g = make_valid(prep(shape(f["geometry"]).buffer(0)))
            g = g.intersection(land)
        except Exception as e:
            print(f"  ! {y}: skipped {n}: {e}", file=sys.stderr)
            continue
        if g.is_empty:
            continue
        if n in names:
            got.setdefault(n, []).append(g)
        if g.area > 40:
            lines.append(g.boundary)
    years[str(y)] = {}
    for n in names:
        if n not in got:
            print(f"  ! {y}: {n} not found", file=sys.stderr)
            continue
        g = polys(unary_union(got[n]).simplify(TOL))
        years[str(y)][n] = path_of(g)
    # Interior borders only: drop the coastline so borders draw as thin lines inland.
    b = unary_union(lines).difference(land.boundary.buffer(1.2)).simplify(TOL * 2)
    borders[str(y)] = path_of(b)
    print(y, {n: len(p) for n, p in years[str(y)].items()}, "borders", len(borders[str(y)]), file=sys.stderr)

W, H = px(LON1, LAT0)
out = {
    "W": round(W), "H": round(H), "K": K, "COS": COS, "LON0": LON0, "LAT1": LAT1,
    "land": path_of(polys(land)), "lakes": path_of(lakes), "rivers": rivers, "years": years, "borders": borders,
}
json.dump(out, open(OUT, "w"), separators=(",", ":"))
print("land", len(out["land"]), "total", len(json.dumps(out)), file=sys.stderr)
