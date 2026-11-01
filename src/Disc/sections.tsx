import React from "react";
import { useCurrentFrame } from "remotion";
import { FACES, Stickman, blendFace, type Face, type StickmanProps } from "../Hangry/Stickman";
import { strain, walk, walkBob } from "../Hangry/actions";
import { ez, mix, pop, span } from "../Russia/kit";
import { w } from "./overlays";
import { Brain, Clock, INKCOL as C, INKY as L, Ink, Sheet } from "./hook";

/**
 * Sections 2-7 of "You Were Trained Wrong", in the hand-drawn ink look (muted cream/sage, thin ink, Kalam lettering).
 * Each section is a run of shots switched on spoken words; inside a shot every event is keyed with W(word, n).
 */

const LN = "#2B2620";
const SKY = "#CFDDDC", GRASS = "#A3AE7E", AMBER = "#E2A93B", RUST = "#B5653F", MUST = "#C9A44C", GREY = "#8A847B";
const sw = { stroke: LN, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
type Wf = (word: string, n?: number) => number;
const useScene = (scene: string) => {
  const f = useCurrentFrame();
  const W: Wf = (x, n = 0) => w(scene, x, n);
  return { f, W };
};
/** The shot whose start is the latest one at or before f. */
const pick = (f: number, shots: [number, React.ReactNode][]) => shots.filter(([at]) => f >= at).pop()?.[1] ?? shots[0]![1];

const Txt: React.FC<{ x: number; y: number; size?: number; color?: string; anchor?: "start" | "middle" | "end"; op?: number; rot?: number; children: React.ReactNode }> = ({
  x, y, size = 56, color = LN, anchor = "middle", op = 1, rot = 0, children,
}) => (
  <text x={x} y={y} fontFamily="Kalam" fontWeight={700} fontSize={size} fill={color} textAnchor={anchor} opacity={op}
    transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{children}</text>
);
/** Big hand-lettered card, one or more lines, popping in with t. */
const Card: React.FC<{ t: number; lines: string[]; x?: number; y?: number; size?: number; color?: string; rot?: number }> = ({
  t, lines, x = 960, y = 420, size = 120, color = LN, rot = -2,
}) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t}) rotate(${rot})`}>
      {lines.map((l, i) => <Txt key={i} x={0} y={(i - (lines.length - 1) / 2) * size * 1.1 + size * 0.35} size={size} color={color}>{l}</Txt>)}
    </g>
  );
/** Small paper tag with lettering. */
const Label: React.FC<{ t: number; x: number; y: number; text: string; size?: number; color?: string; fill?: string; rot?: number }> = ({
  t, x, y, text, size = 46, color = LN, fill = C.paper, rot = -3,
}) => {
  if (t <= 0) return null;
  const wd = text.length * size * 0.5 + 60, h = size * 1.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${t})`}>
      <Sheet L={L} x={-wd / 2} y={-h / 2} w={wd} h={h} fill={fill} seed={text.length} />
      <Txt x={0} y={size * 0.33} size={size} color={color}>{text}</Txt>
    </g>
  );
};
const Bubble: React.FC<{ t: number; x: number; y: number; lines: string[]; size?: number; tail?: number }> = ({ t, x, y, lines, size = 48, tail = -1 }) => {
  if (t <= 0) return null;
  const wd = Math.max(...lines.map((l) => l.length)) * size * 0.5 + 80, h = lines.length * size * 1.15 + 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <path d={`M${tail * 30} ${h / 2 - 6} L${tail * 90} ${h / 2 + 60} L${tail * 80} ${h / 2 - 6} Z`} fill={C.paper} {...sw} />
      <ellipse rx={wd / 2} ry={h / 2} fill={C.paper} {...sw} />
      <rect x={tail > 0 ? 26 : -86} y={h / 2 - 16} width={64} height={14} fill={C.paper} />
      {lines.map((l, i) => <Txt key={i} x={0} y={(i - (lines.length - 1) / 2) * size * 1.15 + size * 0.33} size={size}>{l}</Txt>)}
    </g>
  );
};

/** The protagonist (sage shirt) or anyone else: the channel's stickman rig, drawn in ink with a face. */
const Guy: React.FC<{ x: number; y: number; s?: number; f: number; face?: Face; shirt?: string; pose?: Partial<StickmanProps> }> = ({
  x, y, s = 1, f, face = FACES.neutral, shirt = C.hood, pose = {},
}) => (
  <Stickman x={x} y={y} scale={s} frame={f} color={LN} headFill={C.skin} face={face} stroke={6} bob={1.5}
    back={<path d="M82 96 Q100 88 118 96 L124 190 L76 190 Z" fill={shirt} stroke={LN} strokeWidth={4} strokeLinejoin="round" />} {...pose} />
);
const SIT: Partial<StickmanProps> = { legL: -84, legR: -74, armL: -60, armR: -48 };

const Outside: React.FC<{ g?: number; sky?: string }> = ({ g = 820, sky = SKY }) => (
  <g>
    <rect x={-100} y={-100} width={2120} height={1280} fill={sky} />
    <path d={`M-100 ${g} Q480 ${g - 16} 960 ${g} T2020 ${g} V1180 H-100 Z`} fill={GRASS} {...sw} />
  </g>
);
const Room: React.FC<{ g?: number; window?: boolean }> = ({ g = 820, window = true }) => (
  <g>
    <rect x={-100} y={-100} width={2120} height={1280} fill={C.wall} />
    {window ? <g><rect x={1460} y={170} width={260} height={230} fill={SKY} {...sw} /><line x1={1590} y1={170} x2={1590} y2={400} {...sw} /></g> : null}
    <rect x={-100} y={g} width={2120} height={400} fill={C.floor} {...sw} />
  </g>
);
const Desk: React.FC<{ x: number; y: number; wd?: number; g?: number }> = ({ x, y, wd = 480, g = 820 }) => (
  <g>
    <line x1={x + 30} y1={y} x2={x + 30} y2={g} {...sw} strokeWidth={8} />
    <line x1={x + wd - 30} y1={y} x2={x + wd - 30} y2={g} {...sw} strokeWidth={8} />
    <rect x={x} y={y - 14} width={wd} height={28} fill={C.wood} {...sw} />
  </g>
);
const Chair: React.FC<{ x: number; g?: number }> = ({ x, g = 820 }) => (
  <g>
    <rect x={x - 60} y={g - 170} width={130} height={20} fill={C.woodD} {...sw} />
    <line x1={x - 50} y1={g - 150} x2={x - 50} y2={g} {...sw} strokeWidth={7} />
    <line x1={x + 60} y1={g - 150} x2={x + 60} y2={g} {...sw} strokeWidth={7} />
    <line x1={x - 56} y1={g - 170} x2={x - 56} y2={g - 330} {...sw} strokeWidth={7} />
  </g>
);
/** Laptop seen side-on; lid 1 open .. 0 shut. */
const Laptop: React.FC<{ x: number; y: number; lid?: number; glow?: number }> = ({ x, y, lid = 1, glow = 0 }) => (
  <g>
    <rect x={x - 120} y={y - 12} width={240} height={12} fill={GREY} {...sw} />
    <g transform={`rotate(${mix(0, -100, lid)} ${x + 120} ${y - 12})`}>
      <rect x={x - 120} y={y - 22} width={240} height={10} fill={GREY} {...sw} />
    </g>
    {glow > 0 ? <ellipse cx={x - 120} cy={y - 120} rx={160} ry={120} fill="#BFD6E6" opacity={0.35 * glow} /> : null}
  </g>
);
const Phone: React.FC<{ x: number; y: number; k?: number; rot?: number; buzz?: number; f?: number; lit?: number }> = ({ x, y, k = 1, rot = 0, buzz = 0, f = 0, lit = 0 }) => (
  <g transform={`translate(${x + Math.sin(f * 2.4) * 5 * buzz} ${y}) rotate(${rot}) scale(${k})`}>
    <rect x={-34} y={-62} width={68} height={124} rx={12} fill={LN} {...sw} />
    <rect x={-26} y={-50} width={52} height={96} rx={6} fill={lit ? "#E7D9A8" : "#5A5F66"} />
    {buzz > 0 ? [-1, 1].map((s) => <path key={s} d={`M${s * 50} -30 q${s * 12} 30 0 60`} fill="none" {...sw} opacity={0.5 + 0.5 * Math.sin(f)} />) : null}
  </g>
);
const Notebook: React.FC<{ x: number; y: number; k?: number; lines?: number; title?: string }> = ({ x, y, k = 1, lines = 0, title }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-210} y={-150} width={420} height={300} fill="#FBF8F0" {...sw} />
    <line x1={0} y1={-150} x2={0} y2={150} {...sw} />
    {title ? <Txt x={-105} y={-90} size={40}>{title}</Txt> : null}
    {[0, 1, 2, 3, 4].map((i) => {
      const t = Math.max(0, Math.min(1, lines * 5 - i));
      return t > 0 ? <line key={i} x1={-180} y1={-40 + i * 38} x2={-180 + 150 * t} y2={-40 + i * 38} {...sw} strokeWidth={3} /> : null;
    })}
  </g>
);
const Coffee: React.FC<{ x: number; y: number; k?: number; f: number }> = ({ x, y, k = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    {[0, 1].map((i) => <path key={i} d={`M${-14 + i * 28} -70 q${12 * Math.sin(f / 8 + i)} -20 0 -40`} fill="none" {...sw} strokeWidth={3} />)}
    <path d="M-40 -50 L40 -50 L32 30 L-32 30 Z" fill={RUST} {...sw} />
    <path d="M40 -30 q32 0 26 26 q-6 16 -30 12" fill="none" {...sw} />
  </g>
);
/** Grey iron block labelled EFFORT; warm 0..1 fills it amber from inside. */
const EffortBlock: React.FC<{ x: number; y: number; k?: number; warm?: number }> = ({ x, y, k = 1, warm = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    {warm > 0 ? <ellipse rx={260} ry={160} fill={AMBER} opacity={0.3 * warm} /> : null}
    <rect x={-190} y={-110} width={380} height={220} rx={10} fill={GREY} {...sw} />
    <rect x={-190} y={-110} width={380} height={220} rx={10} fill={AMBER} opacity={0.9 * warm} />
    <Txt x={0} y={26} size={86} color={warm > 0.5 ? LN : "#EDE7DA"}>EFFORT</Txt>
  </g>
);
const Tick: React.FC<{ x: number; y: number; t: number; color?: string; k?: number }> = ({ x, y, t, color = "#5E8A4E", k = 1 }) =>
  t <= 0 ? null : <path d={`M${x - 30 * k} ${y} L${x - 8 * k} ${y + 24 * k} L${x + 36 * k} ${y - 30 * k}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />;
const Cross: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 50 }) =>
  t <= 0 ? null : <g stroke={C.red} strokeWidth={12} strokeLinecap="round" opacity={t}><line x1={x - r} y1={y - r} x2={x + r} y2={y + r} /><line x1={x + r} y1={y - r} x2={x - r} y2={y + r} /></g>;
const Stamp: React.FC<{ f: number; at: number; x: number; y: number; text: string; color?: string; size?: number }> = ({ f, at, x, y, text, color = C.red, size = 90 }) =>
  f < at ? null : (
    <g transform={`translate(${x} ${y}) rotate(-10) scale(${mix(2.2, 1, ez(f, at, at + 5))})`}>
      <rect x={-text.length * size * 0.3 - 30} y={-size * 0.7} width={text.length * size * 0.6 + 60} height={size * 1.4} rx={10} fill="none" stroke={color} strokeWidth={9} />
      <text y={size * 0.34} textAnchor="middle" fontFamily="Kalam" fontWeight={700} fontSize={size} fill={color}>{text}</text>
    </g>
  );
const Number: React.FC<{ t: number; n: string; title: string }> = ({ t, n, title }) => (
  <g opacity={t}>
    <circle cx={150} cy={140} r={78} fill={MUST} {...sw} />
    <Txt x={150} y={176} size={110}>{n}</Txt>
    <Txt x={260} y={162} size={62} anchor="start">{title}</Txt>
  </g>
);

/* ═════════════ 2 · guilt ═════════════ */
export const Guilt: React.FC = () => {
  const { f, W } = useScene("guilt");
  const thumbs = [[560, 300], [960, 300], [1360, 300], [560, 560], [960, 560], [1360, 560]];
  const drain = 1 - ez(f, W("willpower"), W("nobody"));
  return (
    <Ink>
      {pick(f, [
        [0, (
          <g>
            <Room />
            <circle cx={1590} cy={mix(380, 230, ez(f, 0, 60))} r={40} fill="#F2D27A" />
            <Desk x={820} y={600} />
            <Laptop x={1000} y={586} glow={1} />
            <Chair x={640} />
            <Guy x={700} y={560} s={1.3} f={f} face={blendFace(FACES.neutral, FACES.sad, ez(f, W("guilt"), W("guilt") + 12))} pose={SIT} />
            <g opacity={pop(f, W("guilt"), 12)} transform={`translate(700 ${300 + Math.sin(f / 10) * 6})`}>
              {[-90, -30, 30, 90].map((dx, i) => <circle key={i} cx={dx} cy={(i % 2) * 20} r={70} fill="#6E6A66" />)}
              <path d="M-120 0 q40 -40 80 0 t80 0 t80 0" fill="none" stroke="#3E3A37" strokeWidth={6} />
            </g>
          </g>
        )],
        [W("tab") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.wall} />
            <rect x={300} y={110} width={1320} height={740} rx={20} fill="#3D3A36" {...sw} />
            <rect x={340} y={150} width={1240} height={660} fill="#EDE7DA" />
            {thumbs.map(([x, y], i) => {
              const big = i === 1 ? ez(f, W("video"), W("video") + 10) : 0;
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${pop(f, W("tab") + i * 3, 8) * (1 + big * 0.25)})`}>
                  <rect x={-170} y={-100} width={340} height={200} fill={i % 2 ? "#D9B9A0" : "#C9D3B8"} {...sw} />
                  <circle cx={-70} cy={0} r={52} fill={C.skin} {...sw} />
                  <ellipse cx={-70} cy={22} rx={20} ry={16 + 6 * Math.sin(f / 3 + i)} fill={LN} />
                  <Txt x={70} y={14} size={36} color={C.red}>{["GRIND!", "NO EXCUSES", "WAKE UP!", "5AM!", "DISCIPLINE", "STOP BEING SOFT"][i]}</Txt>
                </g>
              );
            })}
          </g>
        )],
        [W("plan") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.wood} />
            <Notebook x={960} y={470} k={2} title="NEW PLAN" lines={ez(f, W("plan"), W("handwriting") + 30)} />
          </g>
        )],
        [W("three") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            {[0, 1, 2, 3].map((i) => {
              const x = 390 + i * 380;
              const bad = i === 3 ? ez(f, W("doesn't"), W("doesn't") + 6) : 0;
              return (
                <g key={i}>
                  <rect x={x - 160} y={260} width={320} height={360} fill={i < 3 && f > W("works") ? "#D6E2C4" : "#FBF8F0"} {...sw} />
                  <Txt x={x} y={330} size={48}>{`DAY ${i + 1}`}</Txt>
                  {i < 3 ? <Tick x={x} y={470} t={ez(f, W("three") + i * 8, W("three") + i * 8 + 8)} k={1.6} /> : null}
                  {bad > 0 ? <g><Cross x={x} y={470} t={bad} r={70} /><path d={`M${x - 160} 300 L${x - 40} 420 L${x + 30} 380 L${x + 160} 560`} fill="none" {...sw} /></g> : null}
                </g>
              );
            })}
          </g>
        )],
        [W("same") - 6, (
          <g>
            <Outside />
            <g transform="translate(960 560)">
              <circle r={230} fill="none" {...sw} strokeWidth={10} strokeDasharray="1300 145" />
              <path d="M180 -150 l40 -20 l-4 46" fill="none" {...sw} strokeWidth={10} />
              <g transform={`rotate(${(f - W("same")) * 1.6})`}>
                <Guy x={0} y={-370} s={0.8} f={f} face={FACES.sad} pose={walk(f, 0.2, 0.8)} />
              </g>
            </g>
            <Card t={pop(f, W("wrong"), 10)} lines={["WHAT IS WRONG", "WITH ME?"]} y={180} size={84} color={C.red} />
          </g>
        )],
        [W("willpower") - 4, (
          <g>
            <Outside g={900} />
            <path d="M200 900 L1700 380 L1920 380 L1920 1180 L200 1180 Z" fill={GRASS} {...sw} />
            <g transform="translate(1110 600) rotate(-19)">
              <circle cx={130} cy={-110} r={110} fill={GREY} {...sw} />
              <Guy x={0} y={-150} s={1.1} f={f} face={FACES.worried} pose={strain(f, 1)} />
            </g>
            <g transform={`translate(1000 300)`} opacity={pop(f, W("willpower") + 10, 8)}>
              <rect x={-60} y={-28} width={120} height={56} rx={8} fill="none" {...sw} />
              <rect x={60} y={-12} width={10} height={24} fill={LN} />
              <rect x={-54} y={-22} width={108 * drain} height={44} rx={4} fill={drain > 0.3 ? "#7FA66A" : C.red} />
            </g>
            <Guy x={330} y={720} s={1.1} f={f} face={FACES.angry} shirt="#5E5A55" pose={{ armR: -100, anger: 0.7 }} />
            <path d="M400 640 L470 610 L470 680 Z" fill={LN} />
            <Card t={span(f, W("willpower"), W("soft"))} lines={["WILLPOWER"]} y={200} size={110} />
            <Bubble t={span(f, W("soft"), W("more"))} x={560} y={430} lines={["SOFT!"]} size={60} />
            <Bubble t={span(f, W("more"), W("excuses"))} x={600} y={430} lines={["WANT IT MORE!"]} size={56} />
            <Bubble t={span(f, W("excuses"), W("push"))} x={600} y={430} lines={["NO EXCUSES!"]} size={56} />
            <Bubble t={span(f, W("push"), W("nobody"))} x={580} y={430} lines={["PUSH!"]} size={70} />
          </g>
        )],
        [W("nobody") - 4, (
          <g>
            <Outside g={820} />
            <circle cx={460} cy={680} r={110} fill={GREY} {...sw} />
            <Guy x={300} y={660} s={1.1} f={f} face={FACES.worried} pose={strain(f, 1)} />
            <g transform={`translate(${mix(1900, 1150, ez(f, W("disciplined") - 10, W("barely") + 20))} ${640 + walkBob(f)})`}>
              <Guy x={0} y={0} s={1.1} f={f} face={FACES.happy} shirt={RUST} pose={walk(f)} />
              <line x1={-40} y1={20} x2={-160} y2={120} {...sw} strokeWidth={3} />
              <g transform={`translate(-210 ${140 + Math.abs(Math.sin(f * 0.3)) * -8})`}>
                <ellipse rx={60} ry={28} fill={MUST} {...sw} />
                <circle cx={-62} cy={-24} r={26} fill={MUST} {...sw} />
                {[-36, -10, 22, 44].map((x, i) => <line key={i} x1={x} y1={20} x2={x + Math.sin(f * 0.3 + i) * 10} y2={60} {...sw} />)}
                <path d={`M58 -6 q24 ${-20 + Math.sin(f) * 8} 30 -30`} fill="none" {...sw} />
              </g>
            </g>
            <Label t={pop(f, W("barely"), 9)} x={1150} y={380} text="NO BOULDER" />
          </g>
        )],
      ])}
    </Ink>
  );
};

/* ═════════════ 3 · sensation ═════════════ */
export const Sensation: React.FC = () => {
  const { f, W } = useScene("sensation");
  const people = [360, 660, 960, 1260, 1560];
  const lowIcons = [[-170, -150], [170, -170], [-210, 40], [210, 30], [0, -260]];
  return (
    <Ink>
      {pick(f, [
        [0, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <Card t={pop(f, 0, 12)} lines={["2012"]} y={250} size={170} />
            <g transform={`translate(960 600) scale(${pop(f, W("hofmann"), 10)})`}>
              <rect x={-220} y={-170} width={440} height={340} fill="#FBF8F0" {...sw} />
              <rect x={-60} y={-196} width={120} height={46} rx={8} fill={GREY} {...sw} />
              <Txt x={0} y={-90} size={44}>HOFMANN et al.</Txt>
              {[0, 1, 2].map((i) => <line key={i} x1={-170} y1={-20 + i * 50} x2={140} y2={-20 + i * 50} {...sw} strokeWidth={3} />)}
            </g>
          </g>
        )],
        [W("buzzed") - 4, (
          <g>
            <Outside />
            {people.map((x, i) => {
              const b = f > W("buzzed") + i * 6 ? 1 : 0;
              return (
                <g key={i}>
                  <Guy x={x} y={640} s={0.95} f={f + i * 7} shirt={[C.hood, RUST, MUST, "#7C8F7A", "#A08CB0"][i]} face={b ? FACES.confused : FACES.neutral} pose={{ armR: -40 }} />
                  <Phone x={x + 70} y={600} k={0.6} buzz={b * (f < W("asked") + 20 ? 1 : 0)} f={f} lit={b} />
                </g>
              );
            })}
            <Bubble t={pop(f, W("asked"), 10)} x={960} y={220} lines={["What do you want right now?", "Are you fighting it?"]} size={46} />
          </g>
        )],
        [W("most") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <line x1={960} y1={120} x2={960} y2={880} {...sw} strokeDasharray="14 14" />
            {[0, 1].map((side) => {
              const cx = side ? 1440 : 480;
              return (
                <g key={side}>
                  <Txt x={cx} y={170} size={46}>{side ? "MOST SELF-CONTROL" : "LEAST SELF-CONTROL"}</Txt>
                  <Guy x={cx} y={560} s={1.05} f={f} face={side ? blendFace(FACES.neutral, FACES.happy, ez(f, W("barely"), W("barely") + 10)) : FACES.worried}
                    pose={side ? {} : { lean: Math.sin(f / 5) * 6, armL: 40, armR: -40 }} />
                  {lowIcons.map(([dx, dy], i) => {
                    const gone = side && i > 0 ? ez(f, W("fewer") + i * 3, W("fewer") + i * 3 + 8) : 0;
                    return (
                      <g key={i} opacity={1 - gone} transform={`translate(${cx + dx! * 1.3} ${470 + dy!})`}>
                        {!side ? <line x1={0} y1={0} x2={-dx! * 0.6} y2={-dy! * 0.3 + 60} {...sw} strokeWidth={2} strokeDasharray="6 8" /> : null}
                        <circle r={44} fill={["#E3A4A0", "#BFD6E6", "#D6E2C4", MUST, "#D9B9A0"][i]} {...sw} />
                        <Txt x={0} y={12} size={28}>{["snack", "phone", "bed", "games", "pizza"][i]}</Txt>
                      </g>
                    );
                  })}
                </g>
              );
            })}
            <Label t={pop(f, W("barely"), 9)} x={1440} y={860} text="BARELY IN THE FIGHT" size={40} />
          </g>
        )],
        [W("differently") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <Label t={pop(f, W("eisenberger"), 9)} x={960} y={250} text="ROBERT EISENBERGER · 1992" size={50} />
            <Card t={pop(f, W("industriousness"), 12)} lines={["LEARNED", "INDUSTRIOUSNESS"]} y={560} size={120} color={C.hood} />
          </g>
        )],
        [W("sensation") - 6, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            {f < W("sensation") ? <Txt x={960} y={520} size={130}>EFFORT</Txt> : (
              <g>
                <EffortBlock x={960} y={mix(-200, 520, ez(f, W("sensation"), W("sensation") + 8))} k={1.3} />
                {f > W("sensation") + 8 ? [-1, 1].map((s) => <path key={s} d={`M${960 + s * 280} 700 l${s * 80} 30 M${960 + s * 300} 650 l${s * 90} -10`} {...sw} opacity={1 - ez(f, W("sensation") + 8, W("sensation") + 24)} />) : null}
              </g>
            )}
          </g>
        )],
        [W("chest") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.wall} />
            <Guy x={960} y={640} s={2.6} f={f} face={blendFace(FACES.neutral, FACES.worried, ez(f, W("chest"), W("eyes")))} />
            <g opacity={pop(f, W("chest"), 9)}>
              <rect x={880} y={420} width={160} height={110} rx={8} fill={GREY} {...sw} />
              <Txt x={960} y={492} size={40} color="#EDE7DA">kg</Txt>
            </g>
            {f > W("eyes") ? [-1, 1].map((s) => <path key={s} d={`M${960 + s * 120} ${150 + Math.sin(f / 2) * 3} l${s * 30} -14 l${s * 6} 22 l${s * 30} -14`} fill="none" {...sw} />) : null}
            <Label t={pop(f, W("texture"), 9)} x={1460} y={260} text="a physical feeling" />
          </g>
        )],
        [W("conditioned") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <EffortBlock x={960} y={600} k={1.3} warm={ez(f, W("reward"), W("reward", 1))} />
            {[0, 1, 2, 3].map((i) => {
              const at = W("reward") + i * 18, y = mix(80, 440, ez(f, at, at + 14));
              return f > at && f < at + 16 ? <path key={i} d={`M${900 + i * 40} ${y - 40} q-24 34 0 46 q24 -12 0 -46 Z`} fill={AMBER} {...sw} /> : null;
            })}
            <Label t={pop(f, W("conditioned"), 9)} x={960} y={230} text="CONDITIONED" size={60} />
          </g>
        )],
      ])}
    </Ink>
  );
};

/* ═════════════ 4 · prediction ═════════════ */
const Monkey: React.FC<{ x: number; y: number; f: number; happy: number }> = ({ x, y, f, happy }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 9) * 3})`}>
    <ellipse cx={0} cy={90} rx={90} ry={110} fill={C.woodD} {...sw} />
    {[-1, 1].map((s) => <circle key={s} cx={s * 88} cy={-20} r={30} fill={C.woodD} {...sw} />)}
    <circle cx={0} cy={-20} r={84} fill={C.woodD} {...sw} />
    <ellipse cx={0} cy={0} rx={56} ry={50} fill="#E3C9A8" {...sw} />
    {[-22, 22].map((ex) => <circle key={ex} cx={ex} cy={-12} r={7} fill={LN} />)}
    <path d={`M-20 22 q20 ${10 + 14 * happy} 40 0`} fill="none" {...sw} />
  </g>
);
export const Prediction: React.FC = () => {
  const { f, W } = useScene("prediction");
  const juiceX = 1260, lightX = 660;
  const moving = ez(f, W("moved"), W("backward") + 10);
  const spikeX = mix(juiceX, lightX, moving);
  const period = 70;
  const cycle = Math.max(0, f - W("juice")) % period;
  const spikeH = f < W("juice") ? 0 : moving < 1 ? Math.exp(-((cycle - 30) ** 2) / 40) : 1 - 0.3 * Math.abs(Math.sin(f / 9));
  const graph = (x0: number, x1: number, y: number, px: number, h: number, dip = 0) => (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} {...sw} strokeWidth={3} strokeDasharray="8 10" opacity={0.5} />
      <path d={`M${x0} ${y} L${px - 50} ${y} Q${px - 20} ${y} ${px} ${y - 220 * h} Q${px + 20} ${y} ${px + 50} ${y} L${x1} ${y}`} fill="none" stroke={C.red} strokeWidth={8}
        strokeLinejoin="round" transform={dip ? `translate(0 ${dip * 90})` : undefined} />
    </g>
  );
  return (
    <Ink>
      {pick(f, [
        [0, (
          <g>
            <Outside g={900} />
            <path d="M300 900 L1100 220 L1700 900 Z" fill="#B7B19E" {...sw} />
            <path d="M1010 300 L1100 220 L1190 300 Q1100 280 1010 300 Z" fill="#FBF8F0" {...sw} />
            <g transform="translate(860 470) rotate(-35)">
              <Guy x={0} y={0} s={0.8} f={f} face={FACES.happy} shirt={RUST} pose={{ ...walk(f, 0.12, 0.6), armR: f > W("helicopters") ? -160 + Math.sin(f / 3) * 15 : -30 }} />
            </g>
            <g transform={`translate(${mix(2100, -200, ez(f, W("climb") - 10, W("climb") + 150))} 200)`}>
              <ellipse rx={90} ry={44} fill={MUST} {...sw} />
              <line x1={80} y1={-6} x2={190} y2={-16} {...sw} strokeWidth={8} />
              <line x1={-150 * Math.cos(f)} y1={-60} x2={150 * Math.cos(f)} y2={-60} {...sw} strokeWidth={6} />
              <line x1={0} y1={-44} x2={0} y2={-60} {...sw} />
            </g>
          </g>
        )],
        [W("paradox") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <Card t={pop(f, W("paradox"), 10)} lines={["THE EFFORT", "PARADOX"]} y={380} size={130} />
            <Label t={pop(f, W("adds"), 9)} x={960} y={700} text="effort can ADD value" size={56} fill="#D6E2C4" />
          </g>
        )],
        [W("dopamine") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            {f < W("schultz") ? <Card t={pop(f, W("dopamine"), 10)} lines={["DOPAMINE"]} y={460} size={150} color={C.red} /> : (
              <g>
                <Label t={pop(f, W("schultz"), 9)} x={360} y={110} text="WOLFRAM SCHULTZ · 1990s" size={40} />
                <Monkey x={360} y={420} f={f} happy={f > W("juice") && cycle > 25 && cycle < 50 ? 1 : 0} />
                <g transform={`translate(${lightX} 330)`} opacity={pop(f, W("light"), 8)}>
                  <circle r={56} fill={f > W("light") && (moving > 0 || cycle < 26) ? "#F2D27A" : "#FBF8F0"} {...sw} />
                  <rect x={-24} y={52} width={48} height={34} fill={GREY} {...sw} />
                </g>
                <g transform={`translate(${juiceX} 280)`} opacity={f > W("juice") - 4 ? 1 : 0}>
                  <rect x={-40} y={-80} width={80} height={60} fill={MUST} {...sw} />
                  {cycle > 26 && cycle < 40 ? <path d={`M0 ${-10 + (cycle - 26) * 12} q-16 22 0 30 q16 -8 0 -30 Z`} fill={AMBER} {...sw} /> : null}
                </g>
                <Txt x={lightX} y={940 - 40} size={40} op={0.8}>light</Txt>
                <Txt x={juiceX} y={940 - 40} size={40} op={0.8}>juice</Txt>
                {graph(240, 1700, 820, spikeX, spikeH)}
                {moving > 0 && moving < 1 ? <path d={`M${spikeX + 80} 560 L${spikeX + 200} 560 M${spikeX + 80} 560 l30 -20 M${spikeX + 80} 560 l30 20`} {...sw} strokeWidth={6} /> : null}
              </g>
            )}
          </g>
        )],
        [W("phone") - 6, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.wood} />
            <Phone x={760} y={420} k={2.2} rot={-8} lit={f > W("glass") ? 1 : 0} />
            <g transform={`translate(${mix(1900, 900, ez(f, W("reaches") - 4, W("glass")))} 470)`}>
              <line x1={0} y1={0} x2={600} y2={60} stroke={C.hood} strokeWidth={70} strokeLinecap="round" />
              <circle r={46} fill={C.skin} {...sw} />
            </g>
            {graph(240, 1700, 860, 760, f > W("glass") ? 1 - 0.3 * Math.abs(Math.sin(f / 9)) : 0)}
            <g opacity={pop(f, W("ten") - 20, 8)}>
              <Txt x={1580} y={200} size={90} color={C.red}>{Math.round(10000 * ez(f, W("ten") - 20, W("ten") + 14)).toLocaleString("en-US")}</Txt>
              <Txt x={1580} y={260} size={40}>times</Txt>
            </g>
          </g>
        )],
        [W("notebook") - 6, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.wood} />
            <Notebook x={700} y={420} k={1.4} title="TODAY" />
            <Guy x={1400} y={520} s={1.5} f={f} face={blendFace(FACES.neutral, FACES.worried, ez(f, W("strain"), W("strain") + 10))}
              pose={{ lean: -14 * ez(f, W("flinches"), W("flinches") + 6), armL: 30, armR: -30 }} />
            {graph(240, 1700, 820, 700, 0, -ez(f, W("strain"), W("strain") + 10))}
            <Bubble t={pop(f, W("behind"), 9)} x={1500} y={170} lines={["you're behind."]} size={48} />
          </g>
        )],
        [W("discipline") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <Txt x={960} y={380} size={100}>DISCIPLINE PROBLEM</Txt>
            <line x1={420} y1={350} x2={1500} y2={350} stroke={C.red} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1}
              strokeDashoffset={1 - ez(f, W("discipline") + 4, W("discipline") + 14)} />
            <Card t={pop(f, W("prediction"), 10)} lines={["PREDICTION PROBLEM"]} y={600} size={110} color={C.hood} />
          </g>
        )],
      ])}
    </Ink>
  );
};

/* ═════════════ 5 · flinch ═════════════ */
const SEPIA = "#C9A46A";
export const Flinch: React.FC = () => {
  const { f, W } = useScene("flinch");
  const conf = (at: number) =>
    f < at ? null : Array.from({ length: 26 }, (_, i) => {
      const t = (f - at) / 60, x = 200 + ((i * 137) % 1500), y = -40 + ((t * 600 + i * 53) % 900);
      return <rect key={i} x={x} y={y} width={16} height={10} fill={[C.red, MUST, C.hood, "#A08CB0"][i % 4]} transform={`rotate(${i * 37 + f * 4} ${x} ${y})`} />;
    });
  const groove = ez(f, W("harder"), W("carve") + 20);
  return (
    <Ink>
      {pick(f, [
        [0, (
          <g>
            <Room window={false} />
            <Guy x={960} y={560} s={1.4} f={f} face={FACES.confused} pose={{ armR: -150, headTilt: 8 }} />
            <g opacity={pop(f, W("lazy"), 9)}>
              <Txt x={1400} y={300} size={90}>LAZY</Txt>
              <line x1={1270} y1={270} x2={1530} y2={270} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
            </g>
          </g>
        )],
        [W("report") - 4, (
          <g>
            <Room window={false} />
            <Guy x={960} y={650} s={0.8} f={f} face={FACES.happy} shirt={MUST} pose={{ armR: -160, armL: 20 }} />
            <g transform={`translate(1010 380) scale(${pop(f, W("report"), 8)})`}>
              <rect x={-70} y={-90} width={140} height={180} fill="#FBF8F0" {...sw} />
              <Txt x={0} y={20} size={80} color={C.red}>A+</Txt>
            </g>
            <g transform={`translate(1300 760) scale(${pop(f, W("trophy"), 8)})`}>
              <path d="M-50 -120 h100 v40 q0 60 -50 70 q-50 -10 -50 -70 Z" fill={MUST} {...sw} /><rect x={-14} y={-10} width={28} height={50} fill={MUST} {...sw} />
              <rect x={-50} y={40} width={100} height={26} fill={C.woodD} {...sw} />
            </g>
            <g transform={`translate(620 700) scale(${pop(f, W("finished"), 8)})`}>
              <rect x={-110} y={-150} width={220} height={160} fill="#BFD6E6" {...sw} /><Txt x={0} y={-56} size={36}>PROJECT</Txt>
            </g>
            {[400, 1560].map((x, i) => (
              <Guy key={i} x={x} y={560} s={1.25} f={f} shirt={i ? RUST : "#A08CB0"} face={f > W("celebrated") ? FACES.laugh : FACES.happy}
                pose={f > W("celebrated") ? { armL: 150 + Math.sin(f / 3) * 10, armR: -150 - Math.sin(f / 3) * 10 } : {}} />
            ))}
            {conf(W("celebrated"))}
            <rect x={-100} y={-100} width={2120} height={1280} fill={SEPIA} opacity={0.18} />
          </g>
        )],
        [W("effort") - 4, (
          <g>
            <Room window={false} />
            <rect x={-100} y={-100} width={2120} height={1280} fill="#2B2620" opacity={0.25} />
            <Desk x={800} y={600} />
            <Chair x={680} />
            <Guy x={730} y={600} s={0.85} f={f} face={FACES.sad} shirt={MUST} pose={{ ...SIT, armR: -70 + Math.sin(f / 2) * 14 }} />
            <rect x={900} y={576} width={200} height={10} fill="#FBF8F0" {...sw} />
            <Label t={pop(f, W("weeks"), 9)} x={1040} y={300} text="3 WEEKS" size={60} />
            <Label t={pop(f, W("party"), 9)} x={1450} y={420} text="no party" size={50} color={GREY} />
            <rect x={-100} y={-100} width={2120} height={1280} fill={SEPIA} opacity={0.18} />
          </g>
        )],
        [W("lesson") - 4, (
          <g>
            <Outside />
            <rect x={500} y={460} width={170} height={360} fill={C.wood} {...sw} />
            <Label t={pop(f, W("tax"), 9)} x={585} y={420} text="EFFORT TAX" size={44} />
            <g transform={`rotate(${-70 * ez(f, W("gate"), W("gate") + 12)} 670 620)`}>
              <rect x={670} y={600} width={620} height={36} fill="#FBF8F0" {...sw} />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={720 + i * 140} y={600} width={60} height={36} fill={C.red} />)}
            </g>
            <Guy x={mix(360, 1350, ez(f, W("gate") + 8, W("finish")))} y={640} s={1.05} f={f} face={FACES.neutral} pose={f > W("gate") + 8 && f < W("finish") ? walk(f) : {}} />
            <line x1={1640} y1={520} x2={1640} y2={820} {...sw} strokeWidth={8} />
            <line x1={1820} y1={520} x2={1820} y2={820} {...sw} strokeWidth={8} />
            <path d="M1640 560 Q1730 600 1820 560" fill="none" stroke={C.red} strokeWidth={10} />
            <Txt x={1730} y={500} size={50} op={pop(f, W("finish"), 9)}>clap clap!</Txt>
          </g>
        )],
        [W("hours") - 6, (
          <g>
            <Room />
            <Desk x={820} y={600} />
            <Chair x={640} />
            <Laptop x={1000} y={586} lid={1 - ez(f, W("shut"), W("shut") + 5)} glow={1 - ez(f, W("shut"), W("shut") + 5)} />
            <Guy x={700} y={560} s={1.3} f={f} face={f > W("shut") ? FACES.sad : FACES.worried} pose={{ ...SIT, ...(f < W("shut") ? { armR: -70 + Math.sin(f) * 4 } : {}) }} />
            <Label t={pop(f, W("hours"), 9)} x={1000} y={260} text="2 HOURS" size={56} />
            <Bubble t={pop(f, W("awful"), 9)} x={420} y={240} lines={["That was awful.", "I'm so far behind."]} size={44} tail={1} />
          </g>
        )],
        [W("punishment") - 6, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.room} />
            <rect x={-100} y={800} width={2120} height={400} fill={C.floor} {...sw} />
            <path d={`M-100 ${880} L700 880 Q960 ${880 + 160 * groove} 1220 880 L2020 880`} fill="none" stroke={LN} strokeWidth={6 + 10 * groove} />
            <rect x={1150} y={300} width={300} height={500} fill={GREY} {...sw} />
            {[0, 1, 2].map((i) => <rect key={i} x={1170} y={320 + i * 160} width={260} height={140} fill="#A39D93" {...sw} />)}
            <Brain L={L} x={560} y={540} tilt={0} hand={[300, 40]} lid={0.5} frown={0.6} />
            <g transform="translate(860 470) rotate(-4)">
              <path d="M-150 -100 h110 l20 24 h170 v180 h-300 Z" fill={MUST} {...sw} />
              <Txt x={0} y={30} size={56}>EFFORT</Txt>
            </g>
            <Stamp f={f} at={W("punishment")} x={860} y={500} text="PUNISHMENT" size={64} />
          </g>
        )],
      ])}
    </Ink>
  );
};

/* ═════════════ 6 · rewires ═════════════ */
export const Rewires: React.FC = () => {
  const { f, W } = useScene("rewires");
  const head = (n: string, title: string, at: number) => <Number t={pop(f, at, 8)} n={n} title={title} />;
  return (
    <Ink>
      {pick(f, [
        [0, (
          <g>
            <Outside />
            <g transform={`translate(960 330) scale(${pop(f, W("weather") - 6, 10)})`}>
              {[-80, 0, 80].map((dx, i) => <circle key={i} cx={dx} cy={i === 1 ? -40 : 0} r={80} fill="#FBF8F0" {...sw} />)}
              {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-120 + i * 60} y1={90 + ((f * 6 + i * 30) % 80)} x2={-130 + i * 60} y2={120 + ((f * 6 + i * 30) % 80)} {...sw} stroke="#6B8FB0" />)}
            </g>
            <Txt x={960} y={150} size={64} op={pop(f, W("weather"), 8)}>MOTIVATION = WEATHER</Txt>
            <g opacity={pop(f, W("association"), 9)}>
              <EffortBlock x={600} y={640} k={0.6} />
              <circle cx={1320} cy={640} r={80} fill={AMBER} {...sw} />
              <path d="M1320 585 L1338 625 L1382 628 L1348 656 L1360 698 L1320 674 L1280 698 L1292 656 L1258 628 L1302 625 Z" fill="#FBF8F0" {...sw} />
              {[0, 1, 2].map((i) => <ellipse key={i} cx={840 + i * 120} cy={640} rx={70} ry={34} fill="none" {...sw} strokeWidth={8} />)}
            </g>
            <Card t={pop(f, W("five"), 10)} lines={["5 REWIRES"]} y={860} size={90} color={C.hood} />
          </g>
        )],
        [W("one") - 6, (
          <g>
            <Room window={false} />
            {head("1", "Pay the effort, not the outcome", W("one"))}
            <Desk x={760} y={620} wd={560} />
            <g transform="translate(1040 600)">
              <path d={`M0 0 L${-160 * (1 - ez(f, W("pay"), W("mark")))} -10 L-160 0 Z`} fill="#BFD6E6" {...sw} />
              <rect x={0} y={-10} width={160} height={14} fill="#BFD6E6" {...sw} />
            </g>
            <Guy x={560} y={560} s={1.25} f={f} face={f > W("showed") ? FACES.happy : FACES.neutral} pose={f > W("showed") ? { armR: -160 } : {}} />
            <g transform="translate(1500 470)">
              <rect x={-60} y={-60} width={120} height={120} fill="#FBF8F0" {...sw} />
              <Tick x={0} y={0} t={ez(f, W("tick"), W("tick") + 8)} k={1.4} />
            </g>
            <Bubble t={pop(f, W("showed") - 4, 9)} x={720} y={280} lines={["I showed up."]} size={54} tail={-1} />
            <Label t={pop(f, W("seconds"), 9)} x={1500} y={290} text="within seconds" size={44} />
          </g>
        )],
        [W("two") - 6, (
          <g>
            <Room window={false} />
            {head("2", "Move the reward to the doorway", W("two"))}
            <rect x={760} y={330} width={400} height={490} fill="#6E6A66" {...sw} />
            <rect x={760} y={330} width={400} height={490} fill="none" {...sw} strokeWidth={14} />
            <Txt x={960} y={600} size={50} color="#EDE7DA">HARD THING</Txt>
            <g opacity={pop(f, W("entrance"), 9)}>
              {[640, 1280].map((x) => <g key={x}><line x1={x} y1={820} x2={x} y2={640} {...sw} strokeWidth={10} /><circle cx={x} cy={630} r={14} fill={MUST} {...sw} /></g>)}
              <path d={`M640 650 Q960 ${740 - 80 * ez(f, W("coffee"), W("coffee") + 10)} 1280 650`} fill="none" stroke={C.red} strokeWidth={10} />
            </g>
            <g opacity={pop(f, W("coffee"), 9)}><ellipse cx={700} cy={760} rx={110} ry={60} fill={AMBER} opacity={0.35} /><Coffee x={700} y={800} k={1.3} f={f} /></g>
            <g opacity={pop(f, W("album"), 9)} transform={`translate(1250 ${740 + Math.sin(f / 6) * 10})`}><g><ellipse cx={-20} cy={0} rx={26} ry={20} fill={LN} /><line x1={4} y1={0} x2={4} y2={-110} {...sw} strokeWidth={8} /><path d="M4 -110 q40 10 40 50" fill="none" {...sw} strokeWidth={8} /></g></g>
            <Label t={pop(f, W("anywhere"), 9)} x={960} y={270} text="ONLY HERE" size={54} />
          </g>
        )],
        [W("three") - 6, (
          <g>
            <Outside />
            {head("3", "Shrink the entry until refusing is absurd", W("three"))}
            {(() => {
              const s = mix(1, 0.14, ez(f, W("sentence"), W("sentence") + 12));
              return (
                <g transform={`translate(1200 ${820 - 300 * s}) scale(${s})`}>
                  <path d="M-170 300 Q-200 -280 0 -300 Q200 -280 170 300 Z" fill="#7C6E8F" {...sw} strokeWidth={4 / s} />
                  {[-60, 60].map((ex) => <g key={ex}><circle cx={ex} cy={-120} r={34} fill="#FBF8F0" {...sw} strokeWidth={4 / s} /><circle cx={ex} cy={-110} r={12} fill={LN} /></g>)}
                  <path d="M-80 0 L-50 30 L-20 0 L10 30 L40 0 L70 30" fill="none" {...sw} strokeWidth={6 / s} />
                  <Txt x={0} y={170} size={60 / Math.max(s, 0.4)} color="#EDE7DA">{s > 0.5 ? "CHAPTER" : ""}</Txt>
                </g>
              );
            })()}
            <Label t={pop(f, W("sentence") + 12, 9)} x={1200} y={640} text="ONE SENTENCE" size={44} />
            <Guy x={560} y={640} s={1.2} f={f} face={f > W("sentence") + 8 ? FACES.smug : FACES.shocked} pose={f > W("sentence") + 8 ? {} : { lean: -12, armL: 40, armR: -40 }} />
          </g>
        )],
        [W("four") - 6, (
          <g>
            <Room window={false} />
            {head("4", "Design the room, not your resolve", W("four"))}
            <line x1={960} y1={260} x2={960} y2={900} {...sw} strokeDasharray="14 14" />
            <Txt x={480} y={320} size={56}>2 PM · calm</Txt>
            <Txt x={1440} y={320} size={56}>11 PM · tired</Txt>
            {[0, 1].map((side) => {
              const cx = side ? 1440 : 480;
              return (
                <g key={side}>
                  <rect x={cx + 60} y={560} width={220} height={260} fill={C.wood} {...sw} />
                  <rect x={cx + 80} y={590} width={180} height={80} fill={C.woodD} {...sw} />
                  {side ? <g><rect x={cx + 150} y={610} width={40} height={36} fill={MUST} {...sw} /><path d={`M${cx + 158} 610 v-14 a12 12 0 0 1 24 0 v14`} fill="none" {...sw} /></g> : null}
                  {!side ? <Phone x={cx + 170} y={mix(500, 630, ez(f, W("calm"), W("calm") + 12))} k={0.6} rot={90} /> : null}
                  <Guy x={cx - 120} y={600} s={1.05} f={f} face={side ? blendFace(FACES.neutral, FACES.sad, 0.6, { eyeOpen: 0.45 }) : FACES.happy}
                    pose={side ? { armR: -60 + Math.sin(f / 6) * 10, headTilt: 12, lean: 6 } : { armR: -70 }} />
                </g>
              );
            })}
            <Label t={pop(f, W("phone"), 9)} x={960} y={880} text="phone lives in another room" size={44} />
          </g>
        )],
        [W("five", 1) - 6, (
          <g>
            <Room window={false} />
            {head("5", "Never end on failure", W("five", 1))}
            {(() => {
              const done = ez(f, W("finish"), W("finish") + 12);
              const lift = done > 0 ? 0 : 0.5 + 0.5 * Math.sin(f / 10);
              return (
                <g>
                  <line x1={300} y1={mix(430, 330, lift)} x2={980} y2={mix(430, 330, lift)} {...sw} strokeWidth={12} />
                  {[300, 980].map((x) => <rect key={x} x={x - 26} y={mix(430, 330, lift) - 70} width={52} height={140} rx={8} fill={GREY} {...sw} />)}
                  <Guy x={640} y={600} s={1.3} f={f} face={done ? FACES.happy : blendFace(FACES.neutral, FACES.worried, lift)} pose={{ armL: 140 - lift * 30, armR: -140 + lift * 30 }} />
                </g>
              );
            })()}
            <rect x={1250} y={380} width={300} height={220} fill={MUST} {...sw} />
            <Stamp f={f} at={W("win")} x={1400} y={490} text="WIN" color="#5E8A4E" size={100} />
            <Label t={pop(f, W("remembers"), 9)} x={1400} y={300} text="the ending is what's filed" size={40} />
          </g>
        )],
      ])}
    </Ink>
  );
};

/* ═════════════ 7 · quiet ═════════════ */
export const Quiet: React.FC = () => {
  const { f, W } = useScene("quiet");
  const icons = ["mark it", "doorway", "1 line", "drawer", "WIN"];
  return (
    <Ink>
      {pick(f, [
        [0, (
          <g>
            <Outside />
            <EffortBlock x={960} y={mix(560, 470, 0.5 + 0.5 * Math.sin(f / 12))} k={0.9} />
            <Guy x={960} y={680} s={1.2} f={f} face={FACES.worried} pose={{ armL: 160, armR: -160 }} />
            {[0, 1].map((i) => <path key={i} d={`M${900 + i * 120} ${380 + ((f * 3 + i * 40) % 80)} q-10 16 0 22 q10 -6 0 -22 Z`} fill="#BFD6E6" {...sw} strokeWidth={2} />)}
            <Label t={pop(f, W("hard"), 9)} x={560} y={260} text="still hard" />
            <Label t={pop(f, W("heavy"), 9)} x={1380} y={260} text="still heavy" />
          </g>
        )],
        [W("argument") - 4, (
          <g>
            <Room window={false} />
            <Clock L={L} x={960} y={300} k={0.45} f={f} ring={0} />
            <Guy x={560} y={600} s={1.2} f={f} face={FACES.annoyed} />
            <Brain L={L} x={1380} y={560} tilt={Math.sin(f / 4) * 4} hand={[260, 100]} lid={0.4} frown={0.7} />
            {(() => {
              const fade = 1 - ez(f, W("quiet"), W("quiet") + 20);
              return (
                <g opacity={fade}>
                  <Bubble t={pop(f, W("argument"), 8)} x={700} y={280} lines={["just get up!"]} size={44} tail={-1} />
                  <Bubble t={pop(f, W("argument") + 10, 8)} x={1260} y={260} lines={["five more minutes"]} size={44} tail={1} />
                  <Label t={pop(f, W("vote"), 9)} x={960} y={520} text="daily vote" size={44} />
                </g>
              );
            })()}
          </g>
        )],
        [W("automatic") - 6, (
          <g>
            <Outside g={860} />
            <path d="M700 860 Q1100 700 1300 420 Q1400 280 1620 200" fill="none" stroke={MUST} strokeWidth={46} strokeLinecap="round" opacity={0.7} />
            {(() => {
              const go = ez(f, W("life"), W("life") + 120);
              const x = mix(760, 1150, go), y = mix(760, 560, go);
              return (
                <g>
                  <Guy x={x - 110} y={y} s={1.05} f={f} face={FACES.happy} pose={go > 0 && go < 1 ? walk(f) : { armR: f > W("side") ? -150 : -20 }} />
                  <Brain L={L} x={x + 140} y={y - 40} tilt={0} hand={f > W("side") && go === 0 ? [-120, -120] : [250, 160]} lid={0} frown={-0.8} />
                </g>
              );
            })()}
            <Txt x={960} y={170} size={60} op={pop(f, W("side"), 8)}>same side</Txt>
          </g>
        )],
        [W("discipline") - 4, (
          <g>
            <Room />
            <Clock L={L} x={1500} y={600} k={0.4} f={f} ring={0} />
            <Guy x={900} y={580} s={1.3} f={f} face={FACES.happy} pose={{ armL: 160 + Math.sin(f / 8) * 8, armR: -160 - Math.sin(f / 8) * 8 }} />
            <Card t={pop(f, W("good"), 10)} lines={["a reason to expect", "something good"]} y={200} size={70} />
          </g>
        )],
        [W("comments") - 4, (
          <g>
            <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
            <Txt x={960} y={220} size={70} op={pop(f, W("comments"), 8)}>Which one is your missing piece?</Txt>
            {icons.map((ic, i) => (
              <g key={i} transform={`translate(${360 + i * 300} 460) scale(${pop(f, W("comments") + 6 + i * 4, 8)})`}>
                <circle r={100} fill={[ "#D6E2C4", AMBER, "#C9C3D8", "#BFD6E6", MUST][i]} {...sw} />
                <Txt x={0} y={16} size={44}>{ic}</Txt>
                <Txt x={0} y={170} size={40}>{String(i + 1)}</Txt>
              </g>
            ))}
            <Card t={pop(f, W("broken"), 10)} lines={["not broken. trained wrong."]} y={800} size={60} color={C.hood} />
            <g opacity={pop(f, W("cognalyst"), 10)}>
              <rect x={-100} y={-100} width={2120} height={1280} fill={C.paper} />
              <Txt x={960} y={560} size={150}>COGNALYST</Txt>
            </g>
          </g>
        )],
      ])}
    </Ink>
  );
};

export const SECTIONS: Record<string, React.FC> = { guilt: Guilt, sensation: Sensation, prediction: Prediction, flinch: Flinch, rewires: Rewires, quiet: Quiet };
