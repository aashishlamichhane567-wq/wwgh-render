import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { View } from "../Hangry2/kit";
import { Bulb, Calendar, NameCard } from "../Hangry2/props2";
import { blendFace, FACES, Person } from "./cast";
import { C, GROUND, Ground, Punch, R, T, TitleCard, YearBadge, ez, glide, mix, pop, shots, span, wob, type Cam } from "./kit";
import { Flame, Label, MapArrow, MapView, P, Pin, at, along, reg } from "./map";
import {
  Church, Coin, Column, Eagle, Fur, Heart, HoneyPot, Hut, Longship, Menu, MoneyBag, Mug, NoSign, Pine, Say, Scroll, Throne, Water, Yurt, Chain,
} from "./props";
import { w } from "./overlays";

export const useW = (key: string) => (x: string, n = 0) => w(key, x, n);
/** Screen-space stage for figures over a map (identity camera). */
export const Over: React.FC<{ children: React.ReactNode }> = ({ children }) => <View x={960} y={540} s={1}>{children}</View>;

export const RUSSIA_CAM: Cam = at([104, 60], 1.0);

/* ─────────────── 1. Hook: "come and rule over us" ─────────────── */

const Village: React.FC<{ f: number; fire?: number }> = ({ f, fire = 0 }) => (
  <>
    <rect x={-1200} y={-800} width={4400} height={GROUND + 800} fill="#DCE8EC" opacity={0.5} />
    {[-300, 100, 2050, 2300].map((x, i) => <Pine key={x} x={x} ground={GROUND} k={1.3 + 0.2 * (i % 2)} />)}
    <Hut x={170} ground={GROUND} fire={fire} f={f} />
    <Hut x={1500} ground={GROUND} k={0.85} />
    <Ground />
  </>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("hook");
  const said = W("said:"), our = W("\"Our"), order = W("order"), come = W("Come"), they = W("They"), vikings = W("Vikings.");
  const eleven = W("Eleven"), biggest = W("biggest"), zones = W("zones,"), ruled = W("ruled"), vik2 = W("Vikings", 1), mongols = W("Mongols,"), tsars = W("tsars"), comm = W("communists.");
  const entire = W("entire"), go = W("go.");
  if (f < eleven - 4) {
    const cam = shots(f, [
      [0, { x: 820, y: 600, s: 1.3 }],
      [our, { x: 760, y: 560, s: 1.6 }],
      [they, { x: 1150, y: 560, s: 0.95 }],
    ], 14);
    const shipX = mix(2600, 1560, ez(f, they, vikings + 20));
    const squabble = span(f, order, come);
    const wave = f >= come ? 1 : 0;
    const tribeFace = (i: number) =>
      f < said ? blendFace(FACES.neutral, FACES.confused, 0.6, { lookX: Math.sin(f / 14 + i * 2) }) :
      f < come ? (i < 2 ? blendFace(FACES.annoyed, FACES.angry, squabble, { lookX: i === 0 ? 0.8 : -0.8 }) : FACES.worried) :
      f < vikings ? blendFace(FACES.happy, FACES.laugh, 0.5, { lookX: 0.8 }) : blendFace(FACES.shocked, FACES.happy, ez(f, vikings + 10, vikings + 30), { lookX: 1 });
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Village f={f} fire={0} />
          <Water y={GROUND + 40} f={f} />
          {[0, 1, 2].map((i) => (
            <Person key={i} who="tribe" x={560 + i * 190} ground={GROUND} f={f + i * 9} s={1.5} face={tribeFace(i)} flip={i === 1 && f >= order && f < come}
              armL={wave ? 150 + wob(f + i * 4, 18) : i < 2 ? 40 + 50 * squabble * Math.abs(Math.sin(f / 4 + i)) : 25}
              armR={wave ? -150 - wob(f + i * 4, 18) : i < 2 ? -40 - 50 * squabble * Math.abs(Math.sin(f / 4 + i + 1)) : -25}
              lean={f < said ? 3 * Math.sin(f / 14 + i) : 0} />
          ))}
          <Say x={760} y={250} t={span(f, come, vikings + 6)} text={"COME AND\nRULE OVER US!"} size={54} tail={-1} />
          <Longship x={shipX} y={GROUND + 70} f={f} k={1.1} flip />
          <Person who="viking" x={shipX + 30} ground={GROUND - 20} f={f} s={1.4} armR={f >= vikings + 10 ? -140 + wob(f, 15) : -30}
            face={blendFace(FACES.neutral, FACES.smug, ez(f, vikings, vikings + 12), { lookX: -0.8 })} flip />
          <Say x={1560} y={300} t={span(f, vikings + 24, eleven - 4)} text={"OK!"} size={70} tail={1} />
        </View>
        <YearBadge f={f} at={6} year={862} until={eleven - 4} />
      </AbsoluteFill>
    );
  }
  if (f < entire - 6) {
    const cam = glide(f, [[eleven - 4, at(PLACE_N, 3)], [biggest, RUSSIA_CAM]], 40);
    const grow = ez(f, eleven, biggest + 10);
    const kz = ez(f, zones - 20, zones + 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1994" borderOp={0.6} regions={[reg(1994, "Russia", C.red, { t: grow, from: PLACE_N })]}>
          <Label p={[96, 62]} s={cam.s} t={pop(f, biggest)} text="RUSSIA" size={110} dot={false} color="#FFFFFF" halo={C.ink} />
          {Array.from({ length: 10 }, (_, i) => {
            const lon = 40 + i * 15.5;
            const [x] = P("moscow");
            return <line key={i} x1={x + (lon - 37.6) * 16.5 * 0.643} y1={0} x2={x + (lon - 37.6) * 16.5 * 0.643} y2={1200} stroke={C.ink} strokeWidth={2} strokeDasharray="10 8"
              vectorEffect="non-scaling-stroke" opacity={0.7 * ez(f, zones - 20 + i * 3, zones - 10 + i * 3)} />;
          })}
        </MapView>
        <Over>
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i} transform={`translate(${250 + i * 142} 150) scale(${pop(f, zones - 24 + i * 3) * 0.55})`} opacity={kz > 0 ? 1 : 0}>
              <circle r={60} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <line x1={0} y1={0} x2={Math.sin(i * 0.57) * 44} y2={-Math.cos(i * 0.57) * 44} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
              <line x1={0} y1={0} x2={Math.sin(i * 0.52) * 26} y2={-Math.cos(i * 0.52) * 26} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
          {f >= ruled - 6 ? (
            <>
              <rect x={0} y={500} width={1920} height={420} fill={C.bg} opacity={0.8 * ez(f, ruled - 6, ruled + 4)} />
              {([["viking", vik2, "VIKINGS"], ["khan", mongols, "MONGOLS"], ["monomakh", tsars, "TSARS"], ["lenin", comm, "COMMUNISTS"]] as const).map(([who, a, label], i) => (
                <g key={who} opacity={pop(f, a - 4)} transform={`translate(0 ${80 * (1 - pop(f, a - 4))})`}>
                  <Person who={who} x={360 + i * 400} ground={810} f={f + i * 7} s={1.15} face={i === 3 ? FACES.smug : FACES.happy} />
                  <T x={360 + i * 400} y={880} size={46} color={C.red}>{label}</T>
                </g>
              ))}
            </>
          ) : null}
        </Over>
        <Punch f={f} at={zones - 6} until={ruled - 6}>11 TIME ZONES</Punch>
      </AbsoluteFill>
    );
  }
  const z = ez(f, go, go + 20);
  return (
    <AbsoluteFill>
      <MapView cam={{ ...RUSSIA_CAM, s: RUSSIA_CAM.s * (1 + 0.04 * ez(f, entire, go)) }} year="1994" borderOp={0.4} regions={[reg(1994, "Russia", C.red)]} dim={0.35} />
      <AbsoluteFill style={{ opacity: 1 - z, transform: `scale(${1 + 0.6 * z})` }}>
        <TitleCard f={f} at={entire - 6} until={10000} lines={["THE ENTIRE HISTORY", "OF RUSSIA"]} sub="862 – TODAY" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const PLACE_N = [31.27, 58.52] as const;

/* ─────────────── 2. Rurik, Oleg, Kyiv ─────────────── */

const Rus: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("rus");
  const rurik = W("Rurik,"), novgorod = W("Novgorod."), oleg = W("Oleg,"), sailed = W("sailed"), kyiv = W("Kyiv."), kievan = W("Kievan"), ukraine = W("Ukraine.");
  const rich = W("rich"), rowing = W("rowing"), furs = W("furs,"), honey = W("honey"), slaves = W("slaves"), con = W("Constantinople,"), great = W("Great");
  const cam = glide(f, [
    [0, at([31, 57.5], 3.6)],
    [oleg, at([31, 54.5], 3)],
    [kievan, at([34, 54], 2.4)],
    [rowing, at([31, 49], 2.15)],
    [great, at([29.5, 42.5], 3.2)],
  ], 36);
  const ship = ez(f, sailed, kyiv);
  const trade = ez(f, rowing, con + 10);
  const [sx, sy] = f < rowing ? along("novgorod", "kyiv", ship, 0.08) : along("kyiv", "constantinople", trade, -0.12);
  return (
    <AbsoluteFill>
      <MapView cam={cam} year="900" rivers={["Dnieper", "Volga", "Neva"]}
        regions={[
          reg(900, "Byzantine Empire", R.purple, { t: ez(f, con - 6, con + 24), from: [29, 41] }),
          reg(900, "Kyivan Rus", C.red, { t: ez(f, kievan - 4, kievan + 30), from: [30.5, 50.4] }),
          reg(1994, "Ukraine", C.ink, { hatch: true, op: span(f, ukraine - 4, rich - 4) }),
        ]}>
        <MapArrow a="novgorod" b="kyiv" t={ship} s={cam.s} bend={0.08} color={C.red} dash op={1 - ez(f, rowing, rowing + 10)} />
        <MapArrow a="kyiv" b="constantinople" t={trade} s={cam.s} bend={-0.12} color={R.gold} />
        <Label p="novgorod" s={cam.s} t={pop(f, novgorod - 4)} text="NOVGOROD" />
        <Label p="kyiv" s={cam.s} t={pop(f, kyiv - 4)} text="KYIV" dy={44} />
        <Label p="constantinople" s={cam.s} t={pop(f, con - 4)} text="CONSTANTINOPLE" dy={50} />
        <Label p={[31.5, 48.6]} s={cam.s} t={span(f, ukraine - 2, rich - 4)} text="UKRAINE (TODAY)" dot={false} color={C.ink} size={34} />
        <Pin p="novgorod" s={cam.s} k={0.55} t={pop(f, rurik - 4) * (1 - ez(f, sailed, sailed + 12))} dy={-20}>
          <Person who="viking" x={0} ground={0} f={f} s={1} face={FACES.smug} />
        </Pin>
        <Pin p="novgorod" s={cam.s} k={0.9} t={pop(f, rurik)} dx={-170} dy={-150}>
          <NameCard x={0} y={0} name="RURIK" t={span(f, rurik, oleg)} color={C.red} />
        </Pin>
        <g transform={`translate(${sx} ${sy}) scale(${(0.6 * pop(f, sailed - 6)) / cam.s})`} opacity={pop(f, sailed - 6) * (1 - ez(f, great + 20, great + 30))}>
          <Longship x={0} y={0} f={f} k={0.5} flip={false} />
          {f < rowing ? <Person who="viking" x={0} ground={-10} f={f} s={0.7} face={FACES.happy} armR={-120} /> : null}
        </g>
        <Pin p="kyiv" s={cam.s} k={0.9} t={pop(f, oleg)} dx={170} dy={-60}>
          <NameCard x={0} y={0} name="OLEG" t={span(f, oleg, kievan)} color={C.red} />
        </Pin>
        <Pin p={[33.5, 45.8]} s={cam.s} k={0.5} t={pop(f, furs - 4)}><Fur x={-170} y={0} /></Pin>
        <Pin p={[33.5, 45.8]} s={cam.s} k={0.5} t={pop(f, honey - 4)}><HoneyPot x={0} y={0} /></Pin>
        <Pin p={[33.5, 45.8]} s={cam.s} k={0.5} t={pop(f, slaves - 4)}><Chain x={190} y={0} /></Pin>
      </MapView>
      <YearBadge f={f} at={0} year={862} to={882} roll={[oleg, oleg + 20]} />
      <Punch f={f} at={great} until={100000}>MIKLAGARÐ = “THE GREAT CITY”</Punch>
      <TitleCardInline f={f} at={kievan + 6} until={rowing - 6} text="KIEVAN RUS" />
    </AbsoluteFill>
  );
};

/** Small label card under the year badge. */
const TitleCardInline: React.FC<{ f: number; at: number; until: number; text: string }> = ({ f, at: a, until, text }) => {
  const t = span(f, a, until);
  if (t <= 0) return null;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <g transform={`translate(960 150) scale(${t})`}>
        <rect x={-text.length * 26 - 40} y={-62} width={text.length * 52 + 80} height={100} rx={12} fill={C.red} stroke={C.ink} strokeWidth={6} />
        <text x={0} y={16} textAnchor="middle" fontFamily="'Segoe UI', Arial, sans-serif" fontWeight={900} fontSize={70} fill="#FFFFFF">{text}</text>
      </g>
    </svg>
  );
};
export { TitleCardInline };

/* ─────────────── 3. Vladimir picks a religion ─────────────── */

const Faith: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("faith");
  const vladimir = W("Vladimir"), religion = W("religion,"), shopping = W("shopping."), islam = W("Islam"), good = W("good,"), banned = W("banned"), alcohol = W("alcohol.");
  const according = W("According"), drinking = W("\"Drinking"), envoys = W("envoys"), church = W("church"), heaven = W("heaven"), y988 = W("988,"), orthodox = W("Orthodox"), baptized = W("baptized");
  if (f < envoys - 4) {
    const cam = shots(f, [[0, { x: 960, y: 540, s: 1 }], [shopping, { x: 1100, y: 520, s: 1.05 }], [banned, { x: 860, y: 500, s: 1.25 }], [according, { x: 860, y: 520, s: 1.15 }]]);
    const rows: [string, number][] = [["ISLAM", f >= drinking ? -1 : 0], ["JUDAISM", 0], ["CATHOLIC", 0], ["ORTHODOX", 0]];
    const hover = f >= islam && f < drinking ? 1 : 0;
    const face = f < islam ? blendFace(FACES.neutral, FACES.confused, ez(f, religion, religion + 10), { lookX: 0.7 })
      : f < banned ? blendFace(FACES.happy, FACES.laugh, ez(f, good, good + 8), { lookX: 0.7 })
      : f < drinking ? blendFace(FACES.shocked, FACES.shocked, 1, { lookX: -0.3 })
      : blendFace(FACES.laugh, FACES.happy, ez(f, drinking + 30, drinking + 60), { lookX: -0.2 });
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Ground />
          <Person who="prince" x={600} ground={GROUND} f={f} s={1.7} face={face} armR={f >= banned ? -100 + (f >= drinking ? wob(f, 10, 4) : 0) : -20} armL={f >= shopping && f < banned ? 60 : 25} />
          <Menu x={1300} y={300} k={0.95} t={pop(f, religion - 4)} title="PICK A RELIGION" rows={rows} />
          {hover ? <rect x={1300 - 280} y={300 + 95 * 0.95 - 45} width={560} height={80} rx={10} fill={R.gold} opacity={0.35} /> : null}
          <Mug x={745} y={560} k={1} t={pop(f, banned)} rot={f >= drinking ? -20 + wob(f, 6, 4) : 0} />
          <NoSign x={745} y={560} k={0.9} t={span(f, alcohol - 4, drinking)} />
          <NameCard x={600} y={180} name="PRINCE VLADIMIR" t={span(f, vladimir, shopping + 10)} color={C.red} />
          <NameCard x={1300} y={110} name="THE PRIMARY CHRONICLE, c.1113" t={span(f, according, envoys - 6)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < y988 - 4) {
    const walkIn = ez(f, envoys - 4, church + 10);
    const glow = ez(f, church, heaven + 10);
    const cam = shots(f, [[envoys - 4, { x: 900, y: 520, s: 0.95 }], [heaven, { x: 1000, y: 460, s: 1.15 }]], 16);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <rect x={-1200} y={-800} width={4400} height={GROUND + 800} fill={R.gold} opacity={0.12 * glow} />
          <Ground />
          <Church x={1250} ground={GROUND} k={1.5} domes={3} glow={glow} />
          {[0, 1, 2].map((i) => (
            <Person key={i} who="boyar" x={mix(-100, 420, walkIn) + i * 150} ground={GROUND} f={f + i * 11} s={1.3} walking={walkIn < 1}
              face={blendFace(FACES.neutral, FACES.shocked, ez(f, church + i * 4, church + 14 + i * 4), { lookX: 0.6, lookY: -0.6 })}
              armL={walkIn >= 1 ? 60 + 40 * glow : undefined} armR={walkIn >= 1 ? -60 - 40 * glow : undefined} />
          ))}
          <NameCard x={1250} y={80} name="HAGIA SOPHIA, CONSTANTINOPLE" t={span(f, church, heaven + 30)} color={R.purple} />
          <Say x={520} y={250} t={span(f, heaven, y988 - 4)} text={"HEAVEN?\nOR EARTH?"} size={50} tail={-1} />
        </View>
      </AbsoluteFill>
    );
  }
  const cam = shots(f, [[y988 - 4, { x: 960, y: 520, s: 1 }], [baptized, { x: 900, y: 600, s: 1.05 }]], 14);
  return (
    <AbsoluteFill>
      <View {...cam}>
        {f < baptized - 4 ? (
          <>
            <Ground />
            <Person who="prince" x={560} ground={GROUND} f={f} s={1.7} face={FACES.happy} armR={-150} />
            <Menu x={1300} y={260} k={0.95} title="PICK A RELIGION" rows={[["ISLAM", -1], ["JUDAISM", 0], ["CATHOLIC", 0], ["ORTHODOX", f >= orthodox ? 1 : 0]]} />
          </>
        ) : (
          <>
            <rect x={-1200} y={-800} width={4400} height={1500} fill="#DCE8EC" opacity={0.5} />
            <Church x={1500} ground={560} k={0.9} domes={1} />
            <line x1={-1200} y1={560} x2={3200} y2={560} stroke={C.ink} strokeWidth={6} />
            <Person who="prince" x={380} ground={640} f={f} s={1.4} face={FACES.happy} armR={-140} />
            <Person who="priest" x={220} ground={640} f={f + 5} s={1.4} face={FACES.neutral} armR={-120} />
            {Array.from({ length: 14 }, (_, i) => (
              <Person key={i} who="plain" x={640 + (i % 7) * 170 + (i > 6 ? 80 : 0)} ground={840 + (i > 6 ? 140 : 0)} f={f + i * 13} s={1.1}
                face={i % 3 ? FACES.worried : FACES.confused} armL={40 + wob(f + i * 9, 20)} armR={-40 - wob(f + i * 7, 20)} />
            ))}
            <Water y={700} f={f} color="#A9CCD8" />
          </>
        )}
      </View>
      <YearBadge f={f} at={y988 - 4} year={988} />
      <TitleCardInline f={f} at={orthodox} until={baptized - 4} text="ORTHODOX CHRISTIANITY" />
    </AbsoluteFill>
  );
};

/* ─────────────── 4. Split, then the Mongols ─────────────── */

const Swords: React.FC = () => (
  <g>
    <path d="M-60 -60 L50 50 M60 -60 L-50 50" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
    <path d="M-60 -60 L50 50 M60 -60 L-50 50" stroke="#D9DDE1" strokeWidth={12} strokeLinecap="round" />
    <path d="M30 50 L70 30 M-30 50 L-70 30" stroke={R.wood} strokeWidth={14} strokeLinecap="round" />
  </g>
);

const Mongols: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("mongols");
  const split = W("split"), fighting = W("fighting"), mistake = W("mistake,"), y1237 = W("1237,"), mongols = W("Mongols"), arrived = W("arrived.");
  const batu = W("Batu"), burned = W("burned"), y1240 = W("1240"), two = W("two", 1), forty = W("forty"), tribute = W("tribute"), golden = W("Golden");
  const travel = W("travel"), khan = W("Khan", 2), permission = W("permission"), slip = W("slip.");
  if (f < travel - 4) {
    const cam = glide(f, [
      [0, at([33, 54], 2.4)],
      [mistake, at([72, 52], 0.95)],
      [batu, at([40, 53], 2.3)],
      [two, at([48, 52], 1.3)],
      [tribute, at([42, 52], 2)],
    ], 40);
    const parts = ["Principality of Novgorod", "Principality of Vladimir-Suzdal", "Other Rus Principalities", "Principality of Kyiv", "Principality of Galicia-Volhynia"];
    const shades = [C.red, "#B83A2E", "#E8796A", "#9E2A2A", "#F0A090"];
    const horde = ez(f, two - 4, two + 30);
    const fires: [readonly [number, number], number][] = [[[39.7, 54.6], burned], [[40.4, 56.13], burned + 10], [[37.62, 55.75], burned + 20], [[35.9, 56.86], burned + 28], [[30.52, 50.45], y1240]];
    return (
      <AbsoluteFill>
        <MapView cam={cam} year={f < split ? "1100" : f < two ? "1200" : "1279"} borderOp={0.5}
          regions={[
            ...(f < split ? [reg(1100, "Kievan Rus", C.red)] : f < two ? parts.map((n, i) => reg(1200, n, shades[i]!)) : []),
            reg(1200, "Mongol Empire", R.gold, { t: ez(f, y1237 - 10, arrived + 20), from: [102.8, 47.2], op: 1 - horde }),
            ...(f >= two - 4 ? [reg(1279, "Novgorod", R.gold, { hatch: true }), reg(1279, "Ryazan", R.gold, { hatch: true }), reg(1279, "Khanate of the Golden Horde", R.gold, { t: horde, from: [47, 47.4] }), reg(1279, "Great Khanate", "#E9CF7A", { t: horde, from: [102.8, 47.2] })] : []),
          ]}>
          {[[32, 52.5], [36.5, 56], [27, 50]].map((p, i) => (
            <Pin key={i} p={p as [number, number]} s={cam.s} k={0.45} t={span(f, fighting + i * 6, mistake)}><g transform={`rotate(${wob(f + i * 5, 10, 3)})`}><Swords /></g></Pin>
          ))}
          <MapArrow a="karakorum" b={[50, 52]} t={ez(f, y1237, arrived + 10)} s={cam.s} color={R.gold} w={14} bend={-0.1} op={1 - ez(f, burned, burned + 10)} />
          <MapArrow a="karakorum" b={[48, 46]} t={ez(f, y1237 + 8, arrived + 18)} s={cam.s} color={R.gold} w={14} bend={0.1} op={1 - ez(f, burned, burned + 10)} />
          <Label p="karakorum" s={cam.s} t={span(f, mongols - 4, batu)} text="MONGOLS" size={46} />
          {fires.map(([p, a], i) => (
            <Pin key={i} p={p} s={cam.s} k={i === 4 ? 1.2 : 0.8} t={pop(f, a) * (1 - ez(f, two - 6, two + 4))}><Flame f={f + i * 7} /></Pin>
          ))}
          <Label p="kyiv" s={cam.s} t={span(f, y1240 - 4, two)} text="KYIV" dy={50} />
          <Label p="sarai" s={cam.s} t={pop(f, golden - 6)} text="SARAI" dy={50} />
          <Label p={[52, 51]} s={cam.s} t={pop(f, golden)} text="GOLDEN HORDE" size={44} dot={false} />
          {[0, 1, 2, 3, 4].map((i) => {
            const u = ((f - tribute) / 40 + i / 5) % 1;
            if (f < tribute) return null;
            const [x, y] = along("moscow", "sarai", u, 0.15);
            return <g key={i} transform={`translate(${x} ${y}) scale(${0.6 / cam.s})`}><Coin x={0} y={0} /></g>;
          })}
          <MapArrow a="moscow" b="sarai" t={ez(f, tribute - 6, tribute + 10)} s={cam.s} color={R.gold} bend={0.15} dash />
        </MapView>
        <Over>
          <g opacity={span(f, batu - 6, two - 6)} transform={`translate(${-300 * (1 - pop(f, batu - 6))} 0)`}>
            <Person who="khan" x={260} ground={1180} f={f} s={2.2} face={blendFace(FACES.smug, FACES.angry, ez(f, burned, burned + 10), { lookX: 0.7 })} armR={-60 - 60 * ez(f, burned, burned + 10)} />
            <NameCard x={300} y={300} name="BATU KHAN" t={pop(f, batu)} color={R.gold} />
            <T x={300} y={370} size={30} op={pop(f, W("grandson"))}>grandson of Genghis Khan</T>
          </g>
        </Over>
        <YearBadge f={f} at={y1237 - 4} year={1237} to={1240} roll={[y1240 - 10, y1240]} until={two - 4} />
        <Punch f={f} at={forty} until={tribute + 10} color={C.ink}>240 YEARS OF TRIBUTE</Punch>
      </AbsoluteFill>
    );
  }
  const walkIn = ez(f, travel - 4, khan + 6);
  const kneel = ez(f, khan + 6, khan + 18);
  const cam = shots(f, [[travel - 4, { x: 960, y: 540, s: 1 }], [permission, { x: 1100, y: 420, s: 1.25 }]], 14);
  return (
    <AbsoluteFill>
      <View {...cam}>
        <rect x={-1200} y={-800} width={4400} height={GROUND + 800} fill="#F3E3BC" opacity={0.35} />
        <Ground />
        <Yurt x={1450} ground={GROUND} k={1.3} />
        <Throne x={1300} ground={GROUND} k={1.1} />
        <Person who="khan" x={1300} ground={GROUND - 120} f={f} s={1.5} legL={70} legR={50} armR={f >= permission ? -110 : -30}
          face={blendFace(FACES.smug, FACES.annoyed, 0.3, { lookX: -0.8 })} />
        <Person who="prince" x={mix(-150, 820, walkIn)} ground={GROUND + 40 * kneel} f={f} s={1.5} walking={walkIn < 1} lean={14 * kneel} legL={-50 * kneel} legR={10 * kneel}
          armL={60 * kneel} armR={-150 * kneel} face={blendFace(FACES.worried, FACES.worried, 1, { lookX: 0.8, lookY: -0.4 })} />
        <Scroll x={1060} y={360} k={0.95} t={pop(f, permission - 2)} lines={["PERMISSION", "TO RULE", "~ the Khan"]} stamp={pop(f, slip)} rot={-4} />
      </View>
    </AbsoluteFill>
  );
};

/* ─────────────── 5. Moscow, the tax collector ─────────────── */

const Moscow: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("moscow");
  const small = W("small"), moscow = W("Moscow"), brilliant = W("brilliant"), tax = W("tax"), nick = W("nicknamed"), moneybag = W("Moneybag."), rich = W("rich,"), strong = W("strong.");
  const y1480 = W("1480,"), stopped = W("stopped"), ugra = W("Ugra"), stared = W("stared"), weeks = W("weeks."), both = W("both"), home = W("home."), nobody = W("nobody");
  const married = W("married"), niece = W("niece"), eagle = W("eagle,"), third = W("Third", 1);
  if (f < tax - 4) {
    const cam = glide(f, [[0, at([37.6, 55.75], 4.5)], [brilliant, at([37.6, 55.9], 5.5)]], 40);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1300" regions={[reg(1300, "Grand Duchy of Moscow", C.red, { t: ez(f, small, small + 20), from: [37.6, 55.75] }), reg(1300, "Khanate of the Golden Horde", R.gold, { op: 0.5 })]} rivers={["Volga", "Oka"]}>
          <Pin p="moscow" s={cam.s} k={0.35} t={pop(f, W("wooden"))} dy={-10}><Hut x={0} ground={0} k={1} /></Pin>
          <Label p="moscow" s={cam.s} t={pop(f, moscow - 4)} text="MOSCOW" dy={44} />
          <Pin p="moscow" s={cam.s} k={0.9} t={pop(f, brilliant)} dy={-200}><Bulb x={0} y={0} t={1} f={f} /></Pin>
        </MapView>
        <YearBadge f={f} at={4} year={1300} />
      </AbsoluteFill>
    );
  }
  if (f < y1480 - 4) {
    if (f < strong - 4) {
      const pay = (i: number) => ez(f, tax + i * 18, tax + 14 + i * 18);
      const cam = shots(f, [[tax - 4, { x: 960, y: 540, s: 1 }], [nick, { x: 860, y: 480, s: 1.3 }]]);
      const bagK = 1 + 0.8 * ez(f, nick, rich + 20);
      return (
        <AbsoluteFill>
          <View {...cam}>
            <Ground />
            <path d="M560 640 L1040 640 M600 640 L600 840 M1000 640 L1000 840" stroke={C.ink} strokeWidth={9} />
            <rect x={600} y={150} width={420} height={90} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
            <T x={810} y={214} size={50} color={C.red}>TAX OFFICE</T>
            <Person who="monomakh" x={800} ground={GROUND} f={f} s={1.5} face={blendFace(FACES.happy, FACES.smug, ez(f, nick, nick + 20), { lookX: 0.6 })}
              armR={-60 - 60 * ez(f, rich, rich + 10)} />
            <MoneyBag x={900} y={560} k={0.8 * bagK} t={1} sign="₽" />
            {[0, 1, 2].map((i) => (
              <Person key={i} who="prince" x={1250 + i * 190} ground={GROUND} f={f + i * 8} s={1.3} flip
                armL={-30} armR={-100 * (1 - Math.abs(pay(i) - 0.5) * 2)} face={blendFace(FACES.annoyed, FACES.sad, pay(i), { lookX: -0.8 })} />
            ))}
            {[0, 1, 2].map((i) => {
              const u = pay(i);
              if (u <= 0 || u >= 1) return null;
              return <Coin key={i} x={mix(1170 + i * 190, 920, u)} y={mix(560, 520, u) - 120 * Math.sin(Math.PI * u)} k={1.2} />;
            })}
            <Person who="mongol" x={250} ground={GROUND} f={f} s={1.4} face={blendFace(FACES.neutral, FACES.happy, ez(f, W("collector."), W("collector.") + 10), { lookX: 0.8 })} armR={-80} />
            {f >= rich ? Array.from({ length: 10 }, (_, i) => <Coin key={i} x={300 + ((i * 397) % 1300)} y={((f - rich) * 14 + i * 120) % 900} k={1} />) : null}
            <NameCard x={800} y={330} name={"IVAN “MONEYBAG”"} t={pop(f, moneybag - 6)} color={R.gold} />
          </View>
        </AbsoluteFill>
      );
    }
    const cam = glide(f, [[strong - 4, at([38, 56], 4.5)], [strong + 30, at([42, 57], 1.9)]], 50);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1492" regions={[reg(1492, "Golden Horde", R.gold, { op: 0.6 }), reg(1492, "Grand Duchy of Moscow", C.red, { t: ez(f, strong - 4, strong + 50), from: [37.6, 55.75] })]}>
          <Label p="moscow" s={cam.s} t={1} text="MOSCOW" dy={44} />
        </MapView>
        <YearBadge f={f} at={strong - 4} year={1300} to={1480} roll={[strong, strong + 50]} />
      </AbsoluteFill>
    );
  }
  if (f < married - 4) {
    if (f < ugra - 4) {
      const tear = ez(f, stopped, stopped + 14);
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1.05}>
            <Ground />
            <Person who="monomakh" x={700} ground={GROUND} f={f} s={1.7} face={blendFace(FACES.neutral, FACES.smug, tear, { lookX: 0.6 })} armR={-100} armL={100 * tear} />
            <g transform={`translate(${-40 * tear} 0) rotate(${-14 * tear} 1100 400)`}><Scroll x={1100} y={400} k={0.9} lines={["TRIBUTE", "DUE"]} /></g>
            {tear > 0 ? <path d={`M1100 ${270} L1080 330 L1120 390 L1090 460 L1110 530`} stroke={C.bg} strokeWidth={30 * tear} fill="none" /> : null}
            <NameCard x={700} y={180} name="IVAN III" t={pop(f, W("Ivan", 1))} color={C.red} />
          </View>
          <YearBadge f={f} at={0} year={1480} />
        </AbsoluteFill>
      );
    }
    const sit = ez(f, weeks - 10, weeks + 10);
    const leave = ez(f, both, home + 20);
    const cam = shots(f, [[ugra - 4, { x: 960, y: 560, s: 0.95 }], [stared, { x: 960, y: 520, s: 1.2 }], [both, { x: 960, y: 560, s: 0.95 }]], 16);
    const army = (side: 1 | -1, who: "monomakh" | "mongol" | "knight") =>
      Array.from({ length: 4 }, (_, i) => {
        const x0 = 960 - side * (260 + i * 150);
        const x = x0 - side * 900 * leave;
        return (
          <Person key={`${side}${i}`} who={i === 0 ? (side < 0 ? "khan" : "monomakh") : who} x={x} ground={GROUND} f={f + i * 9} s={1.25} flip={side < 0 ? leave < 0.02 : leave > 0.02}
            walking={leave > 0.02 && leave < 1} legL={70 * sit} legR={40 * sit}
            face={blendFace(FACES.annoyed, FACES.neutral, sit, { lookX: leave > 0.02 ? 0 : 1, eyeOpen: mix(0.8, 0.45, sit) })} />
        );
      });
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Ground />
          <rect x={860} y={GROUND - 4} width={200} height={600} fill={R.sea} stroke={C.ink} strokeWidth={5} />
          {army(1, "knight")}
          {army(-1, "mongol")}
          <Calendar x={960} y={300} day={1 + Math.floor(30 * ez(f, stared, weeks + 10))} k={1.1} label="DAY" />
          <NameCard x={960} y={110} name="UGRA RIVER" t={span(f, ugra, stared + 20)} />
        </View>
        <Punch f={f} at={nobody - 4} until={married}>THE BATTLE WHERE NOBODY FOUGHT</Punch>
      </AbsoluteFill>
    );
  }
  if (f < third - 4) {
    const cam = shots(f, [[married - 4, { x: 960, y: 540, s: 1 }], [eagle, { x: 960, y: 420, s: 1.05 }]]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Ground />
          <Person who="monomakh" x={760} ground={GROUND} f={f} s={1.6} face={FACES.happy} armR={-70} />
          <Person who="catherine" x={1150} ground={GROUND} f={f + 6} s={1.5} face={FACES.happy} armL={70} flip />
          <Heart x={960} y={380} k={1.2} t={span(f, married, eagle - 4)} />
          <NameCard x={1150} y={200} name="SOPHIA, NIECE OF THE LAST BYZANTINE EMPEROR" t={span(f, niece, eagle - 4)} color={R.purple} />
          <Eagle x={960} y={300} k={1.1} t={pop(f, eagle - 4)} />
        </View>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={560} s={1}>
        <Ground />
        <Column x={460} ground={GROUND} label="ROME" broken={1} />
        <Column x={960} ground={GROUND} label="CONSTANTINOPLE" broken={1} />
        <g opacity={pop(f, third)}><Column x={1460} ground={GROUND} label="MOSCOW" color="#F4C9C2" /></g>
        <T x={1460} y={330} size={80} color={C.red} op={pop(f, third + 6)}>III</T>
      </View>
    </AbsoluteFill>
  );
};

export const SCENES1: Record<string, React.FC> = { hook: Hook, rus: Rus, faith: Faith, mongols: Mongols, moscow: Moscow };
