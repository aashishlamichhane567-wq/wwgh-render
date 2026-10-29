import React, { useId } from "react";
import M from "./maps.json";
import { C, FONT, R, ez, mix, type Cam } from "./kit";

/**
 * The map world: Natural Earth land + historical-basemaps borders (episodes/russia/build_maps.py), in world px.
 * Strokes use non-scaling-stroke so lines stay the same weight at every zoom; labels divide by the camera scale.
 */

type Maps = { W: number; H: number; K: number; COS: number; LON0: number; LAT1: number; land: string; lakes: string;
  rivers: Record<string, string>; years: Record<string, Record<string, string>>; borders: Record<string, string> };
const MAP = M as unknown as Maps;
export const MW = MAP.W;
export const MH = MAP.H;

export type LL = readonly [number, number];
/** lon/lat -> world px (same formula as build_maps.py). */
export const proj = ([lon, lat]: LL): [number, number] => {
  const l = lon < MAP.LON0 ? lon + 360 : lon;
  return [(l - MAP.LON0) * MAP.K * MAP.COS, (MAP.LAT1 - lat) * MAP.K];
};
/** A camera centred on lon/lat at scale s. */
export const at = (ll: LL, s: number): Cam => {
  const [x, y] = proj(ll);
  return { x, y, s };
};

export const PLACE = {
  novgorod: [31.27, 58.52], kyiv: [30.52, 50.45], constantinople: [28.98, 41.01], moscow: [37.62, 55.75],
  vladimir: [40.4, 56.13], ryazan: [39.7, 54.6], sarai: [47.0, 47.4], karakorum: [102.8, 47.2], kazan: [49.1, 55.8],
  astrakhan: [48.0, 46.35], ugra: [35.6, 54.6], isker: [68.4, 58.1], okhotsk: [143.2, 59.4], urals: [59.5, 58.5],
  warsaw: [21.0, 52.23], stockholm: [18.07, 59.33], narva: [28.19, 59.38], poltava: [34.55, 49.59], petersburg: [30.32, 59.94],
  crimea: [34.1, 45.1], paris: [2.35, 48.86], neman: [23.9, 54.9], borodino: [35.82, 55.52], berlin: [13.4, 52.52],
  sitka: [-135.3, 57.05], alaska: [-152, 64], tsushima: [129.3, 34.4], tokyo: [139.7, 35.7], vladivostok: [131.9, 43.1],
  zurich: [8.54, 47.37], ekaterinburg: [60.6, 56.84], leningrad: [30.32, 59.94], stalingrad: [44.5, 48.7], kolyma: [150.8, 62.7],
  chernobyl: [30.1, 51.39], baikonur: [63.3, 45.6], afghanistan: [67.7, 34.5], vorkuta: [64.0, 67.5], magadan: [150.8, 59.56],
  sevastopol: [33.52, 44.6], ukraine: [31.5, 49.0], siberia: [100, 62], dutch: [4.9, 52.37], tobolsk: [68.25, 58.2],
} as const satisfies Record<string, LL>;
export type Place = keyof typeof PLACE;
export const P = (p: Place) => proj(PLACE[p]);

/** Polity fill colours (one meaning each across the episode). */
export const POLITY: Record<string, string> = {
  rus: R.red, mongol: R.gold, byz: R.purple, sweden: R.blue, poland: R.pink, ottoman: R.green, other: "#D8CDBB",
  france: "#5A78C0", germany: "#8A8F96", japan: "#F1C7BF", china: "#E7D49B", usa: "#7FA7D6",
};

type Region = { y: string; n: string; color: string; op?: number; t?: number; from?: LL; dir?: "x" | "-x" | "y"; hatch?: boolean };

const RegionShape: React.FC<{ r: Region; s: number }> = ({ r, s }) => {
  const id = useId().replace(/:/g, "");
  const d = MAP.years[r.y]?.[r.n];
  if (!d) throw new Error(`map: no ${r.n} in ${r.y}`);
  const t = r.t ?? 1;
  if (t <= 0 || (r.op ?? 1) <= 0) return null;
  let clip: React.ReactNode = null;
  if (t < 1) {
    if (r.dir) {
      const w = MW * t;
      clip = r.dir === "x" ? <rect x={-200} y={-200} width={w + 200} height={MH + 400} /> : r.dir === "-x" ? <rect x={MW - w} y={-200} width={w + 200} height={MH + 400} /> : <rect x={-200} y={-200} width={MW + 400} height={MH * t + 200} />;
    } else {
      const [cx, cy] = proj(r.from ?? [40, 55]);
      clip = <circle cx={cx} cy={cy} r={mix(0, 2600, t * t)} />;
    }
  }
  return (
    <g opacity={r.op ?? 1}>
      {clip ? <clipPath id={id}>{clip}</clipPath> : null}
      {r.hatch ? (
        <defs>
          <pattern id={`${id}h`} width={14 / s} height={14 / s} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={14 / s} height={14 / s} fill={r.color} opacity={0.35} />
            <line x1={0} y1={0} x2={0} y2={14 / s} stroke={r.color} strokeWidth={6 / s} />
          </pattern>
        </defs>
      ) : null}
      <path d={d} clipPath={clip ? `url(#${id})` : undefined} fill={r.hatch ? `url(#${id}h)` : r.color} fillRule="evenodd"
        stroke={C.ink} strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </g>
  );
};

/**
 * The map, seen through `cam`. `regions` draw under the lakes and coastline; children draw on top in world px
 * (use the label helpers below, which stay a constant size on screen).
 */
export const MapView: React.FC<{ cam: Cam; year?: string; borderOp?: number; regions?: Region[]; rivers?: string[]; children?: React.ReactNode; dim?: number }> = ({
  cam, year, borderOp = 1, regions = [], rivers = [], children, dim = 0,
}) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: R.sea }}>
    <g transform={`translate(${960 - cam.s * cam.x} ${540 - cam.s * cam.y}) scale(${cam.s})`}>
      <path d={MAP.land} fill={R.land} />
      {Object.entries(MAP.rivers).map(([n, d]) => (
        <path key={n} d={d} fill="none" stroke={R.river} strokeWidth={rivers.includes(n) ? 4 : 1.4} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      ))}
      {year ? <path d={MAP.borders[year]} fill="none" stroke="#B9AE9A" strokeWidth={1.3} vectorEffect="non-scaling-stroke" opacity={borderOp} /> : null}
      {regions.map((r, i) => <RegionShape key={`${r.y}${r.n}${i}`} r={r} s={cam.s} />)}
      <path d={MAP.lakes} fill={R.sea} stroke={C.ink} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={MAP.land} fill="none" stroke={C.ink} strokeWidth={2.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {dim > 0 ? <rect x={-2000} y={-2000} width={MW + 4000} height={MH + 4000} fill={C.bg} opacity={dim} /> : null}
      {children}
    </g>
  </svg>
);

/** Fade/regrow helper: region `n` of year `y`, coloured, with entrance t. */
export const reg = (y: string | number, n: string, color: string, extra: Partial<Region> = {}): Region => ({ y: String(y), n, color, ...extra });

/** Constant-on-screen label with an optional dot, at a place or lon/lat. */
export const Label: React.FC<{ p: Place | LL; s: number; t: number; text: string; size?: number; color?: string; halo?: string; dx?: number; dy?: number; dot?: boolean; anchor?: "start" | "middle" | "end" }> = ({
  p, s, t, text, size = 38, color = C.ink, halo = C.bg, dx = 0, dy = -22, dot = true, anchor = "middle",
}) => {
  if (t <= 0) return null;
  const [x, y] = typeof p === "string" ? P(p) : proj(p);
  const k = 1 / s;
  return (
    <g transform={`translate(${x} ${y}) scale(${k * t})`}>
      {dot ? <circle r={10} fill={color === C.ink ? C.red : color} stroke={C.ink} strokeWidth={4} /> : null}
      <text x={dx} y={dy} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} stroke={halo} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">
        {text}
      </text>
    </g>
  );
};

/** Anything drawn at a place at constant screen size (icons, small figures). `k` = screen scale. */
export const Pin: React.FC<{ p: Place | LL; s: number; k?: number; t?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ p, s, k = 1, t = 1, dx = 0, dy = 0, children }) => {
  if (t <= 0) return null;
  const [x, y] = typeof p === "string" ? P(p) : proj(p);
  return <g transform={`translate(${x} ${y}) scale(${(k * t) / s}) translate(${dx} ${dy})`}>{children}</g>;
};

/** Curved arrow between places that draws on with t (0..1); `bend` bows it sideways; width in screen px. */
export const MapArrow: React.FC<{ a: Place | LL; b: Place | LL; t: number; s: number; color?: string; w?: number; bend?: number; op?: number; dash?: boolean }> = ({
  a, b, t, s, color = C.red, w = 9, bend = 0.2, op = 1, dash,
}) => {
  if (t <= 0 || op <= 0) return null;
  const [x1, y1] = typeof a === "string" ? P(a) : proj(a);
  const [x2, y2] = typeof b === "string" ? P(b) : proj(b);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const pt = (u: number) => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2];
  const m = Math.max(2, Math.round(40 * t));
  const pts = Array.from({ length: m + 1 }, (_, i) => pt((i / m) * t));
  const [ex, ey] = pt(t);
  const [px, py] = pt(Math.max(0, t - 0.02));
  const ang = Math.atan2(ey - py, ex - px);
  const hw = (w * 2.4) / s, hl = (w * 3.2) / s;
  const head = `${ex + Math.cos(ang) * hl * 0.5},${ey + Math.sin(ang) * hl * 0.5} ${ex - Math.cos(ang) * hl * 0.5 - Math.sin(ang) * hw},${ey - Math.sin(ang) * hl * 0.5 + Math.cos(ang) * hw} ${ex - Math.cos(ang) * hl * 0.5 + Math.sin(ang) * hw},${ey - Math.sin(ang) * hl * 0.5 - Math.cos(ang) * hw}`;
  return (
    <g opacity={op}>
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={C.ink} strokeWidth={(w + 5) / s} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={color} strokeWidth={w / s} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={dash ? `${18 / s} ${12 / s}` : undefined} />
      <polygon points={head} fill={color} stroke={C.ink} strokeWidth={3 / s} strokeLinejoin="round" />
    </g>
  );
};

/** Point along the same curve MapArrow draws (for things travelling on it). */
export const along = (a: Place | LL, b: Place | LL, u: number, bend = 0.2): [number, number] => {
  const [x1, y1] = typeof a === "string" ? P(a) : proj(a);
  const [x2, y2] = typeof b === "string" ? P(b) : proj(b);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  return [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2];
};

/** Fire icon (screen units, origin at base). */
export const Flame: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => (
  <g transform={`scale(${k})`}>
    {[-14, 0, 14].map((dx, i) => {
      const h = 34 + Math.sin(f * 0.5 + i * 2.1) * 8 + (i === 1 ? 22 : 0);
      return <path key={i} d={`M${dx - 13} 0 Q${dx - 15} ${-h * 0.6} ${dx + Math.sin(f * 0.4 + i) * 5} ${-h} Q${dx + 15} ${-h * 0.6} ${dx + 13} 0 Z`} fill={i === 1 ? R.amber : C.red} stroke={C.ink} strokeWidth={3} />;
    })}
  </g>
);

/** Explosion burst (screen units). */
export const Boom: React.FC<{ t: number; k?: number; color?: string }> = ({ t, k = 1, color = R.amber }) => {
  if (t <= 0 || t >= 1) return null;
  const r = 30 + 70 * t;
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const rr = i % 2 ? r * 0.55 : r;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return <polygon points={pts} transform={`scale(${k})`} fill={color} stroke={C.ink} strokeWidth={5} opacity={1 - ez(t, 0.6, 1)} />;
};
