import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ramp, walk } from "../Hangry/actions";
import { FACES, blendFace, type Face } from "../Hangry/Stickman";
import { AiClip } from "../AiClip";
import { C, Fig, Paper, View, ez, mix, snap } from "../Hangry2/kit";
import { Bar, Calendar, LivingRoom, NameCard, Phone, T } from "../Hangry2/props2";
import { SCENES } from "./timing";
import { Captions, Punches, w } from "./overlays";
import {
  Beer, Bottle, Cage, Chalkboard, Chimp, Clock, Crates, Dial, Dna, Dolphin, Elephant, Enzyme, FLOOR, FallenFruit, FurTest, Glass,
  LeafSponge, MarulaTree, MoodLine, NightForest, NightWindow, Palm, PartyIcons, Puffer, RaffiaPalm, Rat, RatPark, Scent, Sea,
  Signpost, Treeshrew,
} from "./props";

/**
 * "Why Animals Get Drunk Too" (wwgh), script v2. Sam is the thread: a Friday drink, stuck by March.
 * Every event is keyed to a spoken word via w(scene, word). Accents: amber = the substance / the craving,
 * red = pain, teal = calm and insight. AI clips (public/ai/wwgh) lie over the drawn shot and dissolve into it;
 * until a clip exists, the drawing shows.
 */

type Cam = { x: number; y: number; s: number };
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), s: mix(a.s, b.s, t) });
/** Camera plan: each [frame, cam] entry is reached AT that frame via a d-frame whip. */
const shots = (f: number, list: [number, Cam][], d = 10): Cam =>
  list.slice(1).reduce((c, [at, n]) => mixCam(c, n, snap(ramp(f, at - d, at))), list[0]![1]);
const pop = (f: number, at: number, d = 9) => (f < at ? 0 : snap(ramp(f, at, at + d)));
const wobble = (f: number, amp: number) => amp * Math.sin(f / 5);
const S = 1.7; // Sam's scale: >= 35% of frame height in wide shots
const headY = (ground: number, s = S) => ground - 204 * s;

const Sam: React.FC<{ x: number; ground?: number; f: number; face: Face; flip?: boolean; s?: number; armL?: number; armR?: number; legL?: number; legR?: number; lean?: number; headTilt?: number; walking?: boolean }> = ({
  x, ground = FLOOR, f, face, flip, s = S, armL, armR, legL, legR, lean, headTilt, walking,
}) => (
  <Fig x={x} ground={ground} scale={s} frame={f} bob={walking ? 0 : 1.2} flip={flip} {...(walking ? walk(f, 0.18, 1) : {})}
    {...(walking ? {} : { armL, armR, legL, legR, lean, headTilt })} face={face} />
);

/** A plain kitchen table with Sam's glass, for the Tuesday shots. */
const Kitchen: React.FC<{ glow: number }> = ({ glow }) => (
  <>
    <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
    <rect x={1150} y={250} width={260} height={220} rx={8} fill="#DCE3EA" stroke={C.ink} strokeWidth={7} />
    <line x1={1280} y1={250} x2={1280} y2={470} stroke={C.ink} strokeWidth={5} />
    <path d="M620 640 L1180 640 M660 640 L660 820 M1140 640 L1140 820" stroke={C.ink} strokeWidth={9} />
    <ellipse cx={980} cy={596} rx={70 * glow} ry={40 * glow} fill={C.amber} opacity={0.25 * glow} />
    <g transform="translate(980 596)"><Glass /></g>
  </>
);

/* ─────────────── 1. Hook: the treeshrew ─────────────── */

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("hook", x, n);
  const every = W("Every"), two = W("two"), nectar = W("nectar"), beer = W("beer."), scientists = W("Scientists"), fur = W("fur.");
  const heavy = W("heavy"), never = W("never");
  const cam = shots(f, [
    [0, { x: 960, y: 520, s: 1 }],
    [every, { x: 930, y: 560, s: 2.1 }],
    [two, { x: 820, y: 460, s: 1.4 }],
    [beer, { x: 1080, y: 520, s: 1.5 }],
    [scientists, { x: 1320, y: 440, s: 1.7 }],
    [never, { x: 960, y: 520, s: 1.1 }],
  ]);
  const lick = f >= nectar && f < scientists ? Math.abs(Math.sin((f - nectar) / 5)) : 0;
  const stroll = ez(f, never, never + 60);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <NightForest />
        <Palm x={1000} ground={FLOOR} f={f} ferment={ez(f, nectar, nectar + 12)} glow={1 + 0.3 * Math.sin(f / 8)} />
        <line x1={1000} y1={FLOOR - 20} x2={1700} y2={FLOOR - 20} stroke={C.ink} strokeWidth={8} opacity={stroll} />
        <Treeshrew x={mix(890, 1500, stroll)} y={mix(550, FLOOR - 50, ez(f, never, never + 12))} k={1.1} f={f} lick={lick} hop={stroll > 0 ? 6 * Math.abs(Math.sin(f / 4)) : 0} />
        <Clock x={660} y={300} turns={2 * ez(f, two, nectar)} t={pop(f, two - 4) * (1 - ez(f, beer - 6, beer))} />
        <Beer x={1230} y={FLOOR} t={pop(f, beer)} />
        <FurTest x={1400} y={400} t={pop(f, scientists) * (1 - ez(f, never - 6, never))} v={mix(0.1, 0.92, ez(f, fur, heavy + 8))} />
      </View>
      <AiClip src="ai/wwgh/a1_treeshrew_1080.mp4" to={Math.min(every + 8, 145)} />
    </AbsoluteFill>
  );
};

/* ─────────────── 2. Meet Sam ─────────────── */

const SamScene: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("sam", x, n);
  const meet = W("Sam"), two = W("two"), friday = W("Friday,"), long = W("long."), march = W("March,"), tuesday = W("Tuesday"), without = W("without");
  if (f < march - 4) {
    const walkT = ez(f, 0, meet + 20);
    const walking = f < meet + 20;
    const slump = ez(f, long - 6, long + 8);
    const x = mix(1560, 520, walkT);
    const cam = shots(f, [
      [0, { x: 1000, y: 560, s: 0.95 }],
      [two, { x: 700, y: 560, s: 1.6 }],
      [long, { x: 640, y: headY(FLOOR) + 40, s: 2.5 }],
    ]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <LivingRoom lamp={0.6 + 0.4 * ez(f, friday, friday + 20)} />
          <NightWindow x={1000} y={300} />
          <path d="M760 700 L920 700 M780 700 L780 820 M900 700 L900 820" stroke={C.ink} strokeWidth={7} />
          <g transform={`translate(810 660) scale(${pop(f, two)})`}><Glass /></g>
          <g transform={`translate(870 660) scale(${pop(f, two + 5)})`}><Glass fill={1 - ez(f, long, long + 30)} /></g>
          <Sam x={x} ground={FLOOR - 30 * slump} f={f} flip walking={walking}
            armL={mix(20, 55, slump)} armR={mix(-20, -130, slump)} legL={22 * slump} legR={-22 * slump} headTilt={8 * slump}
            face={blendFace(FACES.neutral, FACES.happy, ez(f, friday, long + 10), { lookX: -0.4 })} />
          <NameCard x={x} y={headY(FLOOR) - 90} name="SAM" t={pop(f, meet) * (1 - ez(f, two - 6, two))} color={C.teal} />
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [
    [march - 4, { x: 1400, y: 380, s: 1.9 }],
    [tuesday, { x: 900, y: 560, s: 1.4 }],
    [without, { x: 900, y: 520, s: 2.3 }],
  ]);
  const flips = Math.floor(8 * ez(f, march - 4, march + 14));
  return (
    <AbsoluteFill>
      <View {...cam}>
        <Kitchen glow={ez(f, without, without + 10)} />
        <Calendar x={1400} y={380} day={f < tuesday ? 1 + flips * 4 : 18} k={1.1} label={f < tuesday ? "MARCH" : "TUESDAY"} />
        <Sam x={780} ground={FLOOR} f={f} armL={20} armR={-70 - 20 * ez(f, without, without + 10)} lean={4}
          face={blendFace(FACES.sad, FACES.worried, ez(f, tuesday, without), { lookX: 0.8, lookY: 0.3 })} />
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 3. The promise ─────────────── */

const PromiseScene: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("promise", x, n);
  const same = W("Same"), stories = W("stories."), know = W("know"), stuck = W("stuck"), didnt = W("didn't.");
  const cam = shots(f, [
    [0, { x: 960, y: 540, s: 1 }],
    [stuck, { x: 520, y: 600, s: 1.8 }],
    [didnt, { x: 1400, y: 540, s: 1.6 }],
  ]);
  const goo = ez(f, stuck, stuck + 14);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <line x1={960} y1={120} x2={960} y2={120 + 800 * ez(f, stories - 8, stories + 8)} stroke={C.ink} strokeWidth={8} />
        <line x1={-400} y1={FLOOR} x2={900} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={520} cy={FLOOR} rx={200 * goo} ry={30 * goo} fill={C.amber} opacity={0.7} />
        <Sam x={520} f={f} armR={-80} armL={20}
          face={blendFace(FACES.neutral, FACES.worried, ez(f, stuck, stuck + 12), { lookX: 0.5 })} />
        <g transform={`translate(${620} ${headY(FLOOR) + 150}) scale(${pop(f, same)})`}><Glass /></g>
        <rect x={1000} y={-400} width={1400} height={1400} fill="#2B3350" opacity={0.1} />
        <Palm x={1450} ground={FLOOR} f={f} />
        <Treeshrew x={1340} y={550} k={1.1} f={f} lick={Math.abs(Math.sin(f / 5))} hop={f > didnt ? 30 * Math.abs(Math.sin((f - didnt) / 5)) * (1 - ez(f, didnt + 30, didnt + 50)) : 0} />
        <T x={960} y={110} size={90} op={pop(f, know)} color={C.red}>?</T>
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 4. The escape theory ─────────────── */

const Desk: React.FC<{ x: number; f: number; write: number; i: number }> = ({ x, f, write, i }) => (
  <g>
    <Fig x={x} ground={FLOOR + 10} scale={1.25} frame={f + i * 13} bob={1} armR={-60 - 25 * write * Math.abs(Math.sin((f + i * 7) / 3))} armL={40}
      face={blendFace(FACES.neutral, FACES.worried, write * 0.5, { lookY: 0.6 })} />
    <path d={`M${x - 110} 800 L${x + 110} 800 M${x - 90} 800 L${x - 90} 900 M${x + 90} 800 L${x + 90} 900`} stroke={C.ink} strokeWidth={8} />
    <rect x={x - 40} y={786} width={70} height={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={3} />
  </g>
);

const Cloud: React.FC<{ k: number; op: number; f: number; rain: number }> = ({ k, op, f, rain }) => (
  <g transform={`translate(560 ${230 + 6 * Math.sin(f / 10)}) scale(${k})`} opacity={op}>
    <path d="M-110 20 q-30 -60 30 -70 q20 -50 80 -20 q60 -30 80 30 q50 10 20 60 Z" fill="#5A5566" stroke={C.ink} strokeWidth={6} />
    {[-60, 0, 60].map((dx, i) => <line key={i} x1={dx} y1={50} x2={dx - 10} y2={90 + 10 * Math.sin(f / 4 + i)} stroke="#5A5566" strokeWidth={5} opacity={rain} />)}
  </g>
);

const Escape: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("escape", x, n);
  const escape = W("escape."), hurts = W("hurts,"), lasts = W("lasts."), y2015 = W("2015,"), asked = W("asked"), sadness = W("Sadness");
  const five = W("five"), hatred = W("Hatred,"), joy = W("Joy"), numb = W("numb"), whole = W("whole"), animals = W("animals"), rent = W("rent.");
  if (f < y2015 - 4) {
    const cam = shots(f, [[0, { x: 700, y: 560, s: 1.4 }], [hurts, { x: 560, y: 470, s: 3 }]], 14);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <LivingRoom lamp={0.7} />
          <Signpost x={1000} y={560} text="ESCAPE" dir={1} color={C.red} t={pop(f, escape)} k={0.9} />
          <Sam x={530} ground={FLOOR - 30} f={f} armL={55} armR={-55} legL={22} legR={-22} headTilt={10}
            face={blendFace(FACES.sad, FACES.worried, ez(f, lasts, lasts + 12), { lookY: -0.6 })} />
          <Cloud k={ez(f, hurts, hurts + 14)} op={0.9} f={f} rain={ez(f, lasts, lasts + 10)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < numb - 4) {
    const cam = shots(f, [
      [y2015, { x: 1000, y: 620, s: 1.05 }],
      [asked, { x: 900, y: 640, s: 2.2 }],
      [sadness, { x: 900, y: 460, s: 1.7 }],
      [hatred, { x: 1110, y: 520, s: 1.9 }],
      [joy, { x: 1340, y: 520, s: 1.7 }],
    ], 12);
    const base = 690, H = 380;
    return (
      <AbsoluteFill>
        <View {...cam}>
          <line x1={-800} y1={FLOOR + 80} x2={2800} y2={FLOOR + 80} stroke={C.ink} strokeWidth={6} />
          <Chalkboard />
          <Bar x={800} base={base} v={1.25 * ez(f, sadness, five + 6)} h={H} color={C.red} label="" />
          <Bar x={1110} base={base} v={0.625 * ez(f, hatred, hatred + 14)} h={H} color="#B5503F" label="" />
          <Bar x={1420} base={base} v={0.375 * ez(f, joy, joy + 14)} h={H} color={C.teal} label="" />
          {([["SADNESS", 800, sadness], ["HATRED", 1110, hatred], ["JOY", 1420, joy]] as const).map(([t, x, at]) => (
            <T key={t} x={x} y={base - 16} size={34} color="#EDE6D6" op={ez(f, at, at + 8)}>{t}</T>
          ))}
          <T x={800} y={base - H * 1.25 - 20} size={54} color={C.red} op={ez(f, five, five + 8)}>5 days</T>
          <T x={1110} y={base - H * 0.625 - 20} size={48} op={ez(f, hatred + 8, hatred + 16)}>2.5</T>
          <T x={1420} y={base - H * 0.375 - 20} size={48} op={ez(f, joy + 8, joy + 16)}>1.5</T>
          <g opacity={1 - ez(f, sadness - 12, sadness)}>
            {[640, 900, 1160, 1420].map((x, i) => <Desk key={x} x={x} f={f} write={ez(f, asked, asked + 10)} i={i} />)}
          </g>
          <NameCard x={330} y={300} name="Verduyn, 2015" t={pop(f, y2015)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < whole + 6) {
    const cam = shots(f, [[numb - 4, { x: 600, y: 480, s: 2.4 }], [whole, { x: 700, y: 540, s: 1.6 }]], 12);
    const numbed = ez(f, numb, numb + 20);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <LivingRoom lamp={0.7} />
          <Sam x={530} ground={FLOOR - 30} f={f} armL={55} armR={-120} legL={22} legR={-22}
            face={blendFace(FACES.worried, FACES.neutral, numbed, { eyeOpen: mix(1, 0.55, numbed) })} />
          <g transform={`translate(${640} ${headY(FLOOR - 30) + 170})`}><Glass /></g>
          <Cloud k={1 - 0.7 * numbed} op={0.9 - 0.6 * numbed} f={f} rain={1 - numbed} />
          <T x={1100} y={420} size={140} color={C.red} op={pop(f, whole - 6)} rot={8}>?</T>
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [[whole + 6, { x: 960, y: 540, s: 1 }], [rent, { x: 1300, y: 520, s: 1.8 }]], 12);
  const bill = pop(f, rent - 4);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
        <g opacity={pop(f, animals)}><Chimp x={420} ground={FLOOR} f={f} face={FACES.happy} /></g>
        <g opacity={pop(f, animals + 6)}><Dolphin x={860} y={640} k={0.9} f={f} rot={-10} /></g>
        <g opacity={pop(f, animals + 12)}>
          <Palm x={1400} ground={FLOOR} f={f} />
          <Treeshrew x={1290} y={550} k={1.1} f={f} lick={Math.abs(Math.sin(f / 5))} />
        </g>
        {bill > 0 ? (
          <g transform={`translate(${mix(1700, 1200, bill)} ${mix(200, 420, bill)}) rotate(${-12 + wobble(f, 4)})`}>
            <rect x={-80} y={-60} width={160} height={120} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
            <T x={0} y={-10} size={36} color={C.red}>RENT</T>
            <T x={0} y={34} size={26}>DUE</T>
          </g>
        ) : null}
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 5. Chimps and palm wine ─────────────── */

const Chimps: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("chimps", x, n);
  const guinea = W("Guinea,"), climb = W("climb"), raid = W("raid"), fold = W("fold"), soak = W("soak"), p69 = W("6.9");
  const climbT = ez(f, climb, raid + 10);
  const g = mix(FLOOR, FLOOR - 400, climbT);
  const cam = shots(f, [
    [0, { x: 960, y: 520, s: 0.95 }],
    [climb, { x: 980, y: 560, s: 1.4 }],
    [raid, { x: 1040, y: 420, s: 2.2 }],
    [fold, { x: 980, y: 380, s: 2.8 }],
    [p69, { x: 1000, y: 460, s: 1.5 }],
  ]);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <rect x={-800} y={-400} width={3600} height={1900} fill="#DDEBD8" opacity={0.35} />
        <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
        <RaffiaPalm x={1000} ground={FLOOR} f={f} />
        <Chimp x={950} ground={g} f={f} lean={f < raid ? -6 : 10} armL={f < raid ? 160 + wobble(f, 12) : 40}
          armR={f < raid ? -160 - wobble(f, 12) : -100 + 20 * Math.sin(f / 6) * ez(f, soak, soak + 6)}
          face={blendFace(FACES.neutral, FACES.happy, ez(f, soak, soak + 12), { lookX: 0.6, lookY: -0.3 })} />
        <LeafSponge x={1040} y={g - 250} t={pop(f, fold)} wet={ez(f, soak, soak + 6)} f={f} />
        <NameCard x={420} y={180} name="GUINEA, WEST AFRICA" t={pop(f, guinea) * (1 - ez(f, climb + 20, climb + 30))} />
      </View>
      <AiClip src="ai/wwgh/a2_chimp_1080.mp4" to={Math.min(raid, 145)} />
    </AbsoluteFill>
  );
};

/* ─────────────── 6. Dolphins and the pufferfish ─────────────── */

const Dolphins: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("dolphins", x, n);
  const passing = W("passing"), floating = W("floating"), defence = W("defence"), high = W("high?"), reiss = W("Reiss"), doubts = W("doubts"), sober = W("sober,");
  if (f < reiss - 4) {
    const rise = ez(f, floating, floating + 20);
    const pass = f >= passing && f < floating ? Math.sin((f - passing) / 12) : 0;
    const cam = shots(f, [
      [0, { x: 960, y: 560, s: 1 }],
      [passing, { x: 960, y: 620, s: 1.5 }],
      [floating, { x: 960, y: 420, s: 1.3 }],
      [defence, { x: 960, y: 560, s: 2.6 }],
      [high, { x: 960, y: 480, s: 1.4 }],
    ]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Sea f={f} />
          <Dolphin x={680} y={mix(640, 420, rise)} k={0.9} f={f} rot={mix(0, -8, rise)} />
          <Dolphin x={1240} y={mix(640, 420, rise)} k={0.9} f={f + 20} flip rot={mix(0, 8, rise)} />
          <g opacity={0.35 * rise}>
            <Dolphin x={680} y={320} k={0.9} f={f} rot={8} />
            <Dolphin x={1240} y={320} k={0.9} f={f + 20} flip rot={-8} />
          </g>
          <Puffer x={960 + 170 * pass} y={mix(640, 560, rise)} puff={0.6 + 0.4 * ez(f, defence, defence + 10)} toxin={ez(f, defence + 6, defence + 16)} />
          <T x={960} y={260} size={120} color={C.amber} op={pop(f, high)}>?</T>
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [[reiss - 4, { x: 700, y: 520, s: 1.5 }], [sober, { x: 1200, y: 520, s: 1.9 }]], 12);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <Sea f={f} y={560} />
        <path d="M300 560 L900 560 M360 560 L360 900 M840 560 L840 900" stroke={C.ink} strokeWidth={9} />
        <Fig x={600} ground={560} scale={1.5} frame={f} bob={1} armL={60} armR={-60} lean={-3}
          face={blendFace(FACES.neutral, FACES.smug, ez(f, doubts, doubts + 12), { lookX: 0.6 })} />
        <NameCard x={600} y={130} name="Diana Reiss" t={pop(f, reiss)} />
        <Dolphin x={1180} y={640} k={0.9} f={f} rot={-12} />
        <g transform={`translate(1420 ${520 + 4 * Math.sin(f / 9)}) scale(${pop(f, sober)})`}>
          <rect x={-50} y={-80} width={100} height={140} rx={40} fill="#E6EEF3" stroke={C.ink} strokeWidth={6} />
          <path d="M0 60 L0 130" stroke={C.ink} strokeWidth={10} />
        </g>
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 7. Elephants ─────────────── */

const Elephants: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("elephants", x, n);
  const mess = W("mess."), y2006 = W("2006"), ten = W("10"), beer = W("beer"), y2020 = W("2020,"), gene = W("gene"), light = W("lightweights");
  const cam = shots(f, [
    [0, { x: 960, y: 520, s: 1 }],
    [y2006, { x: 1150, y: 520, s: 1.3 }],
    [ten, { x: 1420, y: 440, s: 1.2 }],
    [y2020, { x: 960, y: 540, s: 1.1 }],
    [gene, { x: 960, y: 520, s: 1.7 }],
    [light, { x: 1100, y: 580, s: 1.3 }],
  ]);
  if (f >= y2020 - 4 && f < light - 4) {
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Dna x={960} y={540} t={pop(f, y2020)} snap={ez(f, gene, gene + 12)} f={f} />
          <NameCard x={500} y={200} name="Janiak, 2020" t={pop(f, y2020 + 4)} />
        </View>
      </AbsoluteFill>
    );
  }
  const crates = f >= light - 4 ? 0 : 9 * ez(f, ten, beer + 8);
  const sway = f >= light ? 5 * Math.sin((f - light) / 7) : 0;
  return (
    <AbsoluteFill>
      <View {...cam}>
        <rect x={-800} y={-400} width={3600} height={1900} fill="#F1DDB8" opacity={0.3} />
        <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
        <MarulaTree x={560} ground={FLOOR} />
        <Elephant x={1060} ground={FLOOR} k={1} trunk={ez(f, mess, mess + 20)} sway={sway} />
        <Crates x={1550} ground={FLOOR} n={crates} />
        <NameCard x={1150} y={140} name="Morris et al., 2006" t={pop(f, y2006) * (1 - ez(f, ten + 30, ten + 40))} />
        {f >= light ? <Beer x={1380} y={FLOOR} t={pop(f, light + 6)} k={0.8} /> : null}
      </View>
      <AiClip src="ai/wwgh/a4_elephant_1080.mp4" to={Math.min(mess + 10, 145)} />
    </AbsoluteFill>
  );
};

/* ─────────────── 8. Ten million years ago ─────────────── */

const FunDoor: React.FC<{ x: number; open: number; label: string; color: string }> = ({ x, open, label, color }) => {
  const wd = mix(200, 30, open);
  return (
    <g>
      <rect x={x} y={380} width={210} height={FLOOR - 380} fill="#2B2620" stroke={C.ink} strokeWidth={8} />
      <path d={`M${x} 380 L${x + wd} ${380 + 26 * open} L${x + wd} ${FLOOR - 26 * open} L${x} ${FLOOR} Z`} fill={C.bg} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {open < 0.6 ? (
        <g opacity={1 - open / 0.6}>
          <rect x={x + wd / 2 - 70} y={470} width={140} height={60} rx={10} fill={color} stroke={C.ink} strokeWidth={5} />
          <T x={x + wd / 2} y={512} size={38} color="#FFFFFF">{label}</T>
        </g>
      ) : null}
    </g>
  );
};

const Ancestors: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("ancestors", x, n);
  const older = W("older"), ten = W("10"), ground = W("ground,"), fallen = W("fallen"), carrigan = W("Carrigan's"), mutation = W("mutation");
  const forty = W("40"), smell = W("smell"), free = W("Free"), first = W("first"), signal = W("signal."), fun = W("Fun"), door = W("door.");
  if (f < carrigan - 4) {
    const down = ez(f, ten + 10, ground + 10);
    const cam = shots(f, [
      [0, { x: 960, y: 480, s: 1 }],
      [ten, { x: 800, y: 420, s: 1.3 }],
      [ground, { x: 900, y: 620, s: 1.6 }],
      [fallen, { x: 1150, y: 720, s: 2.3 }],
    ]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <rect x={-800} y={-400} width={3600} height={1900} fill="#DDEBD8" opacity={0.35} />
          <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
          <path d="M700 820 L720 150 M720 300 L500 200 M720 250 L950 150" stroke={C.ink} strokeWidth={14} strokeLinecap="round" fill="none" />
          <ellipse cx={700} cy={150} rx={320} ry={110} fill="#A9C79B" stroke={C.ink} strokeWidth={7} opacity={0.9} />
          <Chimp x={mix(640, 900, down)} ground={mix(260, FLOOR, down)} s={1.2} f={f} armL={f < ground ? 150 : 30} armR={f < ground ? -150 : -40}
            face={blendFace(FACES.neutral, FACES.happy, ez(f, fallen, fallen + 20), { lookX: 0.7, lookY: 0.4 })} />
          <FallenFruit x={1150} ground={FLOOR} f={f} ferment={ez(f, fallen, fallen + 20)} />
          <NameCard x={1300} y={170} name="10 MILLION YEARS AGO" t={pop(f, ten) * (1 - ez(f, ground, ground + 10))} />
          <T x={960} y={120} size={60} color={C.red} op={pop(f, older) * (1 - ez(f, ten - 6, ten))}>older than pain</T>
        </View>
        <Sequence from={Math.max(0, fallen - 4)}>
          <AiClip src="ai/wwgh/a5_fruit_1080.mp4" to={Math.min(carrigan - fallen, 145)} />
        </Sequence>
      </AbsoluteFill>
    );
  }
  if (f < smell - 4) {
    const cam = shots(f, [[carrigan - 4, { x: 960, y: 520, s: 1.1 }], [mutation, { x: 960, y: 500, s: 1.8 }], [forty, { x: 960, y: 520, s: 1.3 }]], 12);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Enzyme x={960} y={520} t={pop(f, carrigan)} swap={ez(f, mutation, mutation + 12)} turns={3 * ez(f, forty, forty + 40)} />
          <NameCard x={960} y={200} name="Carrigan et al., 2015" t={pop(f, carrigan + 4)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < first - 4) {
    const cam = shots(f, [[smell - 4, { x: 1000, y: 560, s: 1.9 }], [free, { x: 980, y: 600, s: 1.5 }]], 12);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <rect x={-800} y={-400} width={3600} height={1900} fill="#DDEBD8" opacity={0.35} />
          <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
          <FallenFruit x={1150} ground={FLOOR} f={f} ferment={1} />
          <Scent x={1150} y={720} t={ez(f, smell, smell + 10)} f={f} />
          <Chimp x={900} ground={FLOOR} s={1.4} f={f} lean={24} armR={f < free ? -40 : -110}
            face={f < free ? blendFace(FACES.neutral, FACES.shocked, ez(f, smell, smell + 10), { lookX: 0.8 }) : FACES.laugh} />
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [[first - 4, { x: 700, y: 540, s: 1.6 }], [signal, { x: 760, y: 560, s: 1.2 }], [fun, { x: 1100, y: 580, s: 1.3 }]], 12);
  const open = ez(f, fun, door + 10);
  const walkIn = ez(f, door, door + 40);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <LivingRoom lamp={1} />
        <FunDoor x={1300} open={open} label="FUN" color={C.teal} />
        <g opacity={0.25 * ez(f, signal, signal + 10) * (1 - ez(f, fun, fun + 10))}><Chimp x={560} ground={FLOOR} s={2.1} f={f} /></g>
        <Sam x={mix(620, 1400, walkIn)} f={f} walking={f >= door && walkIn < 1} armR={-130} armL={20}
          face={blendFace(FACES.neutral, FACES.happy, ez(f, first, first + 12), { lookX: 0.4 })} />
        {walkIn < 0.5 ? <g transform={`translate(${mix(620, 1400, walkIn) + 110} ${headY(FLOOR) + 170})`}><Glass /></g> : null}
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 9. Wanting vs liking ─────────────── */

const Wanting: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("wanting", x, n);
  const tues = W("Tuesdays."), berridge = W("Berridge"), liking = W("Liking"), wanting = W("Wanting"), dopamine = W("Dopamine");
  const repeated = W("repeated"), grow = W("grow"), flat = W("flat.");
  if (f < berridge - 4) {
    const cam = shots(f, [[0, { x: 1000, y: 540, s: 1.1 }], [tues, { x: 860, y: 480, s: 2.4 }]], 12);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Kitchen glow={0.6} />
          <Calendar x={1400} y={360} day={18} label="TUESDAY" />
          <Sam x={780} f={f} armL={20} armR={-80} face={blendFace(FACES.neutral, FACES.sad, ez(f, 0, tues), { lookX: 0.7, lookY: 0.3 })} />
        </View>
      </AbsoluteFill>
    );
  }
  const doses = [repeated, repeated + 18, repeated + 36, grow, grow + 16];
  const hits = doses.filter((d) => f >= d).length;
  const want = mix(0.3, 0.97, hits / doses.length) + (hits ? 0.03 * Math.sin(f / 4) : 0);
  const like = 0.55 - 0.08 * ez(f, flat - 10, flat + 10);
  const cam = shots(f, [
    [berridge - 4, { x: 960, y: 560, s: 1.05 }],
    [liking, { x: 600, y: 540, s: 1.6 }],
    [wanting, { x: 1320, y: 540, s: 1.6 }],
    [dopamine, { x: 960, y: 560, s: 1.05 }],
    [flat, { x: 600, y: 540, s: 1.5 }],
  ]);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <path d="M300 700 Q300 250 960 250 Q1620 250 1620 700" fill="#EDE3D2" stroke={C.ink} strokeWidth={8} />
        <g opacity={pop(f, liking)}><Dial x={600} y={620} v={like} label="LIKING" color={C.teal} /></g>
        <g opacity={pop(f, wanting)}><Dial x={1320} y={620} v={want} label="WANTING" color={C.amber} /></g>
        {f >= dopamine ? Array.from({ length: 6 }, (_, i) => {
          const t = ((f - dopamine) / 30 + i / 6) % 1;
          return <circle key={i} cx={mix(960, 1320, t)} cy={320 + 280 * t + 20 * Math.sin(i + f / 6)} r={12} fill={C.amber} stroke={C.ink} strokeWidth={3} opacity={1 - t} />;
        }) : null}
        <T x={960} y={330} size={40} op={pop(f, dopamine)} color={C.amber}>dopamine</T>
        <NameCard x={960} y={170} name="Berridge & Robinson" t={pop(f, berridge) * (1 - ez(f, liking + 30, liking + 40))} />
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 10. The low gets deeper ─────────────── */

const Low: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("low", x, n);
  const koob = W("Koob's"), high = W("high"), low = W("low."), again = W("again"), deeper = W("deeper."), march = W("March,"), good = W("good."), normal = W("normal.");
  const X0 = 300, Y0 = 520, WD = 1300;
  const p = f < again ? 0.25 * ez(f, high, low + 20) : mix(0.25, 1, ez(f, again, deeper + 20));
  const lift = ez(f, good, normal + 6);
  const cam = shots(f, [
    [0, { x: 960, y: 520, s: 1 }],
    [high, { x: 520, y: 480, s: 1.8 }],
    [again, { x: 960, y: 560, s: 1.05 }],
    [march, { x: 1450, y: 600, s: 1.7 }],
    [normal, { x: 1400, y: 540, s: 1.4 }],
  ]);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <line x1={X0} y1={Y0} x2={X0 + WD} y2={Y0} stroke={C.teal} strokeWidth={6} strokeDasharray="24 16" />
        <T x={X0 - 20} y={Y0 + 14} size={34} anchor="end" color={C.teal}>NORMAL</T>
        <line x1={X0} y1={200} x2={X0} y2={940} stroke={C.ink} strokeWidth={6} />
        <T x={X0 - 20} y={240} size={30} anchor="end">HIGH</T>
        <T x={X0 - 20} y={920} size={30} anchor="end">LOW</T>
        <MoodLine x={X0} y={Y0} w={WD} p={p} doses={f < again ? 1 : 4} sink={f < again ? 0 : 1} />
        <NameCard x={960} y={130} name="George Koob" t={pop(f, koob) * (1 - ez(f, high + 20, high + 30))} />
        {f >= march - 4 ? (
          <Sam x={1560} ground={mix(1000, Y0 + 20, lift)} f={f} s={1.1} armR={-120} armL={20}
            face={blendFace(FACES.sad, FACES.neutral, lift, { lookX: -0.4 })} />
        ) : null}
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 11. Rat Park ─────────────── */

const RatParkScene: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("ratpark", x, n);
  const setting = W("setting"), alexander = W("Alexander"), alone = W("alone"), morphine = W("morphine"), park = W("park.");
  const later = W("later"), argue = W("argue"), lonely = W("lonely"), matter = W("matter.");
  if (f < lonely - 4) {
    const cam = shots(f, [
      [0, { x: 960, y: 540, s: 1 }],
      [alone, { x: 520, y: 540, s: 1.8 }],
      [morphine, { x: 560, y: 560, s: 2.2 }],
      [park, { x: 1320, y: 560, s: 1.4 }],
      [later, { x: 960, y: 540, s: 1 }],
      [argue, { x: 960, y: 620, s: 1.3 }],
    ]);
    const crack = ez(f, later, later + 14);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
          <g opacity={pop(f, setting)}>
            <Cage x={330} y={400} w={380} h={300} />
            <Rat x={500} y={690} k={0.9} f={f} />
            <Bottle x={660} y={520} drained={ez(f, morphine, morphine + 60)} />
          </g>
          <g opacity={pop(f, park - 20)}>
            <RatPark x={1330} y={620} f={f} />
            <Bottle x={1700} y={420} drained={0.12 * ez(f, morphine, morphine + 60)} />
          </g>
          <NameCard x={960} y={150} name="Bruce Alexander, 1970s" t={pop(f, alexander) * (1 - ez(f, park, park + 10))} />
          {crack > 0 ? <path d={`M200 300 l120 60 l-40 60 l160 40 l-60 80 l200 40 l-80 60 l${400 * crack} ${40 * crack}`} fill="none" stroke={C.red} strokeWidth={10} strokeLinejoin="round" opacity={crack} /> : null}
          {f >= argue ? (
            <>
              <Fig x={760} ground={FLOOR} scale={1.1} frame={f} bob={1} armL={120 + wobble(f, 30)} armR={-40} face={FACES.annoyed} />
              <Fig x={1160} ground={FLOOR} scale={1.1} frame={f + 9} bob={1} flip armR={-120 - wobble(f + 5, 30)} armL={40} face={FACES.confused} />
            </>
          ) : null}
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [[lonely - 4, { x: 900, y: 540, s: 1.2 }], [matter, { x: 820, y: 480, s: 2.2 }]], 12);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <Kitchen glow={0.8} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={300 + i * 200} y1={0} x2={260 + i * 200} y2={1080} stroke={C.ink} strokeWidth={30} opacity={0.08} />)}
        <Sam x={780} f={f} armL={20} armR={-80} face={blendFace(FACES.sad, FACES.worried, ez(f, matter, matter + 10), { lookX: -0.6 })} />
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 12. The answer ─────────────── */

const End: React.FC = () => {
  const f = useCurrentFrame();
  const W = (x: string, n = 0) => w("end", x, n);
  const both = W("Both,"), fun2 = W("Fun"), esc2 = W("Escape"), shrew = W("treeshrew's"), want = W("want."), phone = W("phone"), next = W("next");
  const everyone = W("Everyone"), sleep = W("Sleep,"), food = W("food,"), parties = W("parties."), tell = W("Tell");
  if (f < shrew - 4) {
    const open = ez(f, fun2, fun2 + 12) * (1 - ez(f, esc2, esc2 + 12));
    const walkIn = ez(f, fun2 + 4, esc2);
    const cam = shots(f, [[0, { x: 960, y: 540, s: 1 }], [fun2, { x: 1250, y: 580, s: 1.4 }], [esc2, { x: 1400, y: 560, s: 2 }]], 12);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
          <g opacity={1 - ez(f, fun2 - 6, fun2)}>
            <Signpost x={880} y={600} text="ESCAPE" dir={-1} color={C.red} t={1} k={1 + 0.06 * Math.sin(f / 4) * ez(f, both, both + 6)} />
            <Signpost x={1040} y={660} text="FUN" dir={1} color={C.teal} t={1} k={1 + 0.06 * Math.sin(f / 4 + 1) * ez(f, both, both + 6)} />
          </g>
          <g opacity={ez(f, fun2 - 6, fun2)}>
            <FunDoor x={1300} open={open} label={f < esc2 ? "FUN" : "ESCAPE"} color={f < esc2 ? C.teal : C.red} />
            {walkIn < 0.98 ? <Sam x={mix(900, 1400, walkIn)} f={f} walking={walkIn > 0} face={FACES.happy} /> : null}
          </g>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < phone - 4) {
    const cam = shots(f, [[shrew - 4, { x: 1400, y: 520, s: 1.6 }], [want, { x: 560, y: 520, s: 1.7 }]], 12);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Kitchen glow={ez(f, want, want + 10)} />
          <rect x={960} y={-400} width={1600} height={1900} fill={C.bg} />
          <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
          <line x1={960} y1={100} x2={960} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
          <Palm x={1450} ground={FLOOR} f={f} />
          <Treeshrew x={1340} y={550} k={1.1} f={f} lick={Math.abs(Math.sin(f / 5))} />
          <Sam x={560} f={f} armR={-90} face={blendFace(FACES.neutral, FACES.worried, ez(f, want, want + 10), { lookX: 0.8 })} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < everyone - 4) {
    const cam = shots(f, [[phone - 4, { x: 960, y: 520, s: 1.3 }], [next, { x: 960, y: 540, s: 1 }]], 12);
    const pulse = f > phone ? (Math.sin(f / 5) + 1) / 2 : 0;
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Phone x={960} y={520} k={1.8}>
            <g transform="translate(90 200) scale(0.42)"><Dial x={0} y={0} v={0.6 + 0.35 * pulse} label="WANTING" color={C.amber} /></g>
          </Phone>
          <T x={960} y={960} size={50} op={pop(f, next)} color={C.teal}>NEXT VIDEO</T>
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [[everyone - 4, { x: 960, y: 520, s: 1.2 }], [tell, { x: 960, y: 540, s: 1 }]], 12);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <PartyIcons x={960} y={480} t={[pop(f, sleep), pop(f, food), pop(f, parties)]} />
        <T x={960} y={760} size={64} op={pop(f, tell)}>fun or escape?</T>
      </View>
    </AbsoluteFill>
  );
};

const SCENE: Record<string, React.FC> = {
  hook: Hook, sam: SamScene, promise: PromiseScene, escape: Escape, chimps: Chimps, dolphins: Dolphins, elephants: Elephants,
  ancestors: Ancestors, wanting: Wanting, low: Low, ratpark: RatParkScene, end: End,
};

export const WwghVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {Object.entries(SCENES).map(([key, sc]) => {
      const Comp = SCENE[key]!;
      return (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          <Paper><Comp /></Paper>
          <Punches scene={key} />
          <Captions scene={key} />
          <Sequence from={sc.lead}>
            <Audio src={staticFile(`vo_wwgh/${key}.wav`)} />
          </Sequence>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
