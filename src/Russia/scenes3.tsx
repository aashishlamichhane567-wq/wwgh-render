import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { View } from "../Hangry2/kit";
import { NameCard } from "../Hangry2/props2";
import { blendFace, FACES, Person } from "./cast";
import { C, Counter, GROUND, Ground, Punch, R, T, TitleCard, YearBadge, ez, glide, mix, pop, span, wob } from "./kit";
import { Boom, Flame, Label, MapArrow, MapView, MW, Pin, at, proj, reg } from "./map";
import {
  Barbed, Bomb, Boat, Bread, Chain, ClockFace, Derrick, GlassCase, Grave, Kremlin, Mailbox, Month, Nugget, Photo, Say, Scroll, Ship, Snow, Tag, Train, Water, Wheat,
} from "./props";
import { Over, TitleCardInline, useW } from "./scenes1";

/* ─────────────── small set pieces used only here ─────────────── */

const Tent: React.FC<{ x: number; ground: number; k?: number }> = ({ x, ground, k = 1 }) => (
  <g transform={`translate(${x} ${ground}) scale(${k})`}>
    <path d="M-150 0 L0 -200 L150 0 Z" fill="#E8DCC0" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-30 0 L0 -60 L30 0" fill="#4A3220" stroke={C.ink} strokeWidth={5} />
  </g>
);
const Campfire: React.FC<{ x: number; ground: number; f: number }> = ({ x, ground, f }) => (
  <g transform={`translate(${x} ${ground})`}>
    <path d="M-50 -6 L50 -20 M-50 -20 L50 -6" stroke={R.wood} strokeWidth={12} strokeLinecap="round" />
    <g transform="translate(0 -14) scale(1.4)"><Flame f={f} /></g>
  </g>
);
const Duma: React.FC<{ x: number; ground: number; t: number }> = ({ x, ground, t }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${ground}) scale(${t})`}>
      <path d="M-260 -300 L0 -400 L260 -300 Z" fill="#F1E6CF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-260} y={-300} width={520} height={300} fill="#F1E6CF" stroke={C.ink} strokeWidth={6} />
      {[-200, -100, 0, 100, 200].map((dx) => <rect key={dx} x={dx - 18} y={-280} width={36} height={280} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />)}
      <text x={0} y={-320} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={40} fill={C.ink}>DUMA</text>
    </g>
  );
const Reichstag: React.FC<{ x: number; ground: number; flag: number; f: number }> = ({ x, ground, flag, f }) => (
  <g transform={`translate(${x} ${ground})`}>
    <rect x={-420} y={-260} width={840} height={260} fill="#B9B2A4" stroke={C.ink} strokeWidth={6} />
    {[-380, 300].map((dx) => <rect key={dx} x={dx} y={-360} width={80} height={360} fill="#B9B2A4" stroke={C.ink} strokeWidth={6} />)}
    <path d="M-160 -260 Q0 -480 160 -260 Z" fill="#8A8F96" stroke={C.ink} strokeWidth={6} />
    {[-150, -75, 0, 75, 150].map((dx) => <rect key={dx} x={dx - 16} y={-240} width={32} height={200} fill="#9A9284" stroke={C.ink} strokeWidth={3} />)}
    <line x1={0} y1={-400} x2={0} y2={-560} stroke={C.ink} strokeWidth={6} />
    <path d={`M0 ${-560 + 80 * (1 - flag)} q60 ${-8 + 6 * Math.sin(f / 5)} 130 0 l0 70 q-70 ${8 - 6 * Math.sin(f / 5)} -130 0 Z`} fill={C.red} stroke={C.ink} strokeWidth={4} opacity={flag > 0 ? 1 : 0} />
  </g>
);
const Bed: React.FC<{ x: number; ground: number }> = ({ x, ground }) => (
  <g transform={`translate(${x} ${ground})`}>
    <rect x={-200} y={-120} width={400} height={70} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    <path d="M-200 -50 L-200 0 M200 -50 L200 0 M-200 -200 L-200 -50 M200 -150 L200 -50" stroke={R.wood} strokeWidth={14} strokeLinecap="round" />
    <rect x={-190} y={-150} width={90} height={40} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
  </g>
);
const Cake: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <rect x={-70} y={-50} width={140} height={60} fill="#F3C9C2" stroke={C.ink} strokeWidth={5} />
      <path d="M-70 -50 Q-50 -30 -30 -50 Q-10 -30 10 -50 Q30 -30 50 -50 Q60 -40 70 -50" fill="none" stroke="#FFFFFF" strokeWidth={8} />
      <g transform="translate(0 -100)"><circle r={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} /><circle cx={-9} cy={-4} r={5} fill={C.ink} /><circle cx={9} cy={-4} r={5} fill={C.ink} /><path d="M-10 12 L10 12" stroke={C.ink} strokeWidth={4} /></g>
    </g>
  );
const Bullet: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 ? null : <g transform={`translate(${x} ${y}) scale(${t})`}><path d="M-40 -14 L20 -14 Q44 0 20 14 L-40 14 Z" fill={R.gold} stroke={C.ink} strokeWidth={4} /></g>;

/* ─────────────── 11. Napoleon ─────────────── */

const Napoleon: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("napoleon");
  const invaded = W("invaded"), six = W("six"), retreating = W("retreating,"), burned = W("burned"), borodino = W("Borodino,"), seventy = W("seventy");
  const day = W("day."), took = W("took"), empty = W("empty."), burned2 = W("burned", 1), waited = W("waited"), five = W("five"), letter = W("letter"), marched = W("marched");
  const winter = W("winter."), fraction = W("fraction"), two = W("Two");
  if (f < took - 4) {
    if (f < borodino - 4) {
      const cam = glide(f, [[0, at([24, 53], 1.7)], [retreating, at([31, 54], 2)]], 40);
      const adv = ez(f, invaded, borodino);
      return (
        <AbsoluteFill>
          <MapView cam={cam} year="1815" regions={[reg(1815, "Russian Empire", C.red), reg(1815, "France", "#5A78C0"), reg(1815, "Prussia", "#8A8F96", { op: 0.7 }), reg(1815, "Austrian Empire", "#C9B458", { op: 0.7 })]}>
            <MapArrow a="paris" b="neman" t={ez(f, invaded - 10, invaded + 10)} s={cam.s} color="#5A78C0" w={10} bend={0.05} dash />
            <MapArrow a="neman" b="moscow" t={adv} s={cam.s} color="#5A78C0" w={26} bend={-0.05} />
            {[[28, 55], [32, 55], [34.5, 55.3]].map((p, i) => <Pin key={i} p={p as [number, number]} s={cam.s} k={0.9} t={pop(f, burned + i * 6)}><Flame f={f + i * 5} /></Pin>)}
            <Label p="moscow" s={cam.s} t={1} text="MOSCOW" dy={-34} />
            <Label p="paris" s={cam.s} t={1} text="PARIS" dy={50} />
          </MapView>
          <Over>
            <g transform={`translate(${-300 * (1 - pop(f, 0, 14))} 0)`}>
              <Person who="napoleon" x={250} ground={1200} f={f} s={2.2} face={blendFace(FACES.smug, FACES.confused, ez(f, retreating, retreating + 10), { lookX: 0.7 })} armR={-100} />
              <NameCard x={260} y={380} name="NAPOLEON" t={pop(f, 4)} color="#5A78C0" />
            </g>
          </Over>
          <YearBadge f={f} at={0} year={1812} />
          <Punch f={f} at={six} until={retreating}>600,000 MEN</Punch>
        </AbsoluteFill>
      );
    }
    const cam = glide(f, [[borodino - 4, at([35.8, 55.5], 4.5)]], 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1815" regions={[reg(1815, "Russian Empire", C.red)]}>
          <Label p="borodino" s={cam.s} t={pop(f, borodino)} text="BORODINO" dy={70} />
          <Label p="moscow" s={cam.s} t={1} text="MOSCOW" dy={-34} />
          {Array.from({ length: 6 }, (_, i) => <Pin key={i} p={[35.8 + Math.sin(i * 2.3) * 0.5, 55.5 + Math.cos(i * 1.7) * 0.25]} s={cam.s} k={1}><Boom t={((f - borodino - i * 9) % 40) / 24} k={0.8} /></Pin>)}
        </MapView>
        <Over><Counter x={960} y={330} f={f} a={seventy} b={seventy + 30} to={70000} size={130} color={C.red} op={1} /><T x={960} y={410} size={50} op={pop(f, day - 6)}>IN ONE DAY</T></Over>
      </AbsoluteFill>
    );
  }
  if (f < waited - 4) {
    const fire = ez(f, burned2 - 4, burned2 + 20);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1640} fill={C.red} opacity={0.25 * fire} />
          <Ground />
          <Kremlin x={1200} ground={GROUND} k={0.9} />
          {fire > 0 ? [880, 1060, 1340, 1520].map((x, i) => <g key={x} transform={`translate(${x} ${GROUND - 140}) scale(${2 * fire})`}><Flame f={f + i * 4} /></g>) : null}
          <Person who="napoleon" x={mix(-100, 460, ez(f, took - 4, empty))} ground={GROUND} f={f} s={1.7} walking={f < empty} face={f < empty ? FACES.happy : blendFace(FACES.confused, FACES.shocked, fire)} />
          <circle cx={mix(2000, -200, ez(f, empty, empty + 40))} cy={GROUND - 40} r={40} fill="none" stroke="#A08A5A" strokeWidth={6} strokeDasharray="10 6" opacity={span(f, empty, burned2)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < marched - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="napoleon" x={640} ground={GROUND} f={f} s={1.7} legL={70} legR={50} armR={-30} face={blendFace(FACES.neutral, FACES.annoyed, ez(f, letter, letter + 20), { lookX: 0.8 })} />
          <path d="M520 700 L760 700 M540 700 L540 840 M740 700 L740 840" stroke={C.ink} strokeWidth={8} />
          <Mailbox x={1150} ground={GROUND} k={1.2} letter={0} />
          <ClockFace x={1450} y={350} k={1.3} t={pop(f, five - 4)} turns={8 * ez(f, five, letter)} label={`WEEK ${1 + Math.floor(4.9 * ez(f, five, letter))}`} />
          <Say x={1150} y={310} t={span(f, letter, marched)} text="0 NEW LETTERS" size={46} tail={-1} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < two - 4) {
    const cam = glide(f, [[marched - 4, at([30, 54.5], 2.2)]], 30);
    const back = ez(f, marched, fraction + 20);
    const thin = mix(28, 3, ez(f, winter - 10, fraction + 20));
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1815" regions={[reg(1815, "Russian Empire", C.red)]}>
          <MapArrow a="moscow" b="neman" t={back} s={cam.s} color={C.ink} w={thin} bend={-0.05} />
          <Label p="moscow" s={cam.s} t={1} text="MOSCOW" dy={-34} />
          <rect x={-200} y={-200} width={MW + 400} height={2000} fill="#FFFFFF" opacity={0.35 * ez(f, winter - 10, winter + 20)} />
        </MapView>
        <Over><Snow f={f} op={ez(f, winter - 10, winter + 10)} n={90} /></Over>
        <Punch f={f} at={winter - 2} until={two - 4} color="#3E6FB0">❄ WINTER ❄</Punch>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <rect x={-1200} y={-800} width={4400} height={1640} fill="#DCE8EC" opacity={0.4} />
        <Ground />
        <Tent x={1450} ground={GROUND} k={1.2} />
        <Tent x={300} ground={GROUND} k={0.9} />
        <Campfire x={960} ground={GROUND} f={f} />
        {[0, 1, 2].map((i) => <Person key={i} who="cossack" x={680 + i * 280} ground={GROUND} f={f + i * 7} s={1.4} flip={i === 2} face={FACES.laugh} armR={-100 + wob(f + i * 5, 20)} />)}
        <g transform="translate(1700 840)"><line x1={0} y1={0} x2={0} y2={-300} stroke={C.ink} strokeWidth={8} /><rect x={-150} y={-330} width={300} height={90} rx={10} fill="#3E6FB0" stroke={C.ink} strokeWidth={6} /><text x={0} y={-272} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={44} fill="#FFFFFF">PARIS</text></g>
      </View>
      <YearBadge f={f} at={two - 4} year={1814} />
    </AbsoluteFill>
  );
};

/* ─────────────── 12. Serfs, Alaska, the bomb ─────────────── */

const Reform: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("reform");
  const serfs = W("serfs:"), landlord = W("landlord,"), sold = W("sold."), crimean = W("Crimean"), alexander = W("Alexander"), freed = W("freed"), twenty = W("twenty-three"), y1861 = W("1861.");
  const alaska = W("Alaska"), sold2 = W("sold", 1), seven = W("seven"), cents = W("cents"), mocked = W("mocked"), folly = W("Folly\"."), gold = W("gold."), oil = W("oil."), oops = W("Oops.");
  const survived = W("survived"), y1881 = W("1881,"), bomb = W("bomb"), killed = W("killed");
  if (f < alaska - 4) {
    if (f < crimean - 4) {
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <Ground />
            <Person who="landlord" x={420} ground={GROUND} f={f} s={1.7} face={FACES.smug} armR={-60} op={pop(f, landlord - 6)} />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <Person who="serf" x={900 + i * 270} ground={GROUND} f={f + i * 7} s={1.45} flip face={FACES.sad} op={pop(f, serfs - 4 + i * 3)} />
                <Tag x={900 + i * 270 - 30} y={GROUND - 120} k={0.5} t={pop(f, sold - 4 + i * 3)} text="FOR SALE" />
              </g>
            ))}
          </View>
        </AbsoluteFill>
      );
    }
    const free = ez(f, freed, freed + 14);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="alexander2" x={420} ground={GROUND} f={f} s={1.75} face={blendFace(FACES.neutral, FACES.happy, free)} armR={-60 - 80 * free} op={pop(f, alexander - 6)} />
          <NameCard x={420} y={160} name="ALEXANDER II" t={pop(f, alexander)} color={C.red} />
          <NameCard x={960} y={160} name="DEFEAT IN THE CRIMEAN WAR, 1856" t={span(f, crimean - 4, alexander)} />
          {[0, 1, 2].map((i) => {
            const jump = f >= freed ? Math.abs(Math.sin((f - freed) / 6 + i)) * 60 * free : 0;
            return (
              <g key={i}>
                <Person who="serf" x={900 + i * 270} ground={GROUND - jump} f={f + i * 7} s={1.45} flip face={free > 0.5 ? FACES.laugh : FACES.sad} armL={free > 0.5 ? 150 : 25} armR={free > 0.5 ? -150 : -25} />
                <Chain x={900 + i * 270} y={GROUND - 170} k={0.5} broken={free} t={1 - ez(f, freed + 20, freed + 30)} />
              </g>
            );
          })}
          <Counter x={1170} y={360} f={f} a={twenty} b={twenty + 30} to={23000000} size={110} color={C.red} />
          <T x={1170} y={440} size={50} op={pop(f, twenty + 6)}>SERFS FREED</T>
        </View>
        <YearBadge f={f} at={y1861 - 4} year={1861} />
      </AbsoluteFill>
    );
  }
  if (f < survived - 4) {
    const cam = glide(f, [[alaska - 4, at([-156, 62], 2.8)], [oops, at([-160, 63], 2.4)]], 30);
    const xb = proj([-169, 65])[0];
    const sell = ez(f, sold2, sold2 + 20);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1815" regions={[reg(1815, "Russian Empire", C.red), reg(1815, "Russian Empire", "#7FA7D6", { dir: "-x", t: (MW - xb) / MW, op: sell })]}>
          <Label p="alaska" s={cam.s} t={pop(f, alaska)} text="ALASKA" dot={false} size={60} />
          <Pin p={[-150, 59]} s={cam.s} k={1} t={pop(f, gold)}><Nugget x={-80} y={0} k={1.2} /><Nugget x={40} y={30} k={0.8} /></Pin>
          <Pin p={[-149, 69]} s={cam.s} k={0.6} t={pop(f, oil - 4)}><Derrick x={0} ground={0} gush={ez(f, oil, oil + 12)} f={f} /></Pin>
        </MapView>
        <Over>
          <Tag x={1250} y={250} k={1.1} t={pop(f, seven - 4)} text="$7,200,000" />
          <Tag x={1350} y={420} k={0.9} t={pop(f, cents - 4)} text="2¢ / ACRE" color="#FFFFFF" />
          <g opacity={span(f, mocked - 6, oops - 4)}>
            <Person who="uncleSam" x={260} ground={1180} f={f} s={2.1} face={f < gold ? FACES.laugh : FACES.shocked} armR={f < gold ? -40 + wob(f, 20, 3) : -150} />
          </g>
          <g opacity={pop(f, oops - 6)}>
            <Person who="alexander2" x={1650} ground={1180} f={f} s={2.1} flip face={FACES.shocked} armL={150} armR={-150} />
          </g>
        </Over>
        <Punch f={f} at={folly - 6} until={gold}>“SEWARD'S FOLLY”</Punch>
        <Punch f={f} at={oops - 2} until={100000} color={C.red}>OOPS...</Punch>
        <YearBadge f={f} at={alaska - 4} year={1867} />
      </AbsoluteFill>
    );
  }
  const boom = ez(f, bomb, bomb + 10);
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <Ground />
        {f < killed ? (
          <Person who="alexander2" x={760} ground={GROUND} f={f} s={1.75} face={FACES.worried} lean={f < y1881 ? 14 * Math.sin(f / 5) : 0} armR={-60} />
        ) : (
          <Grave x={760} ground={GROUND} k={1.3} t={pop(f, killed)} text="ALEX. II" />
        )}
        {[0, 1, 2].map((i) => <Bomb key={i} x={1200 + i * 200} y={GROUND - 60} k={0.6} f={f} t={span(f, survived + i * 8, y1881)} />)}
        {f >= y1881 && f < bomb + 6 ? <Bomb x={mix(1500, 820, ez(f, y1881, bomb))} y={GROUND - 60 - 200 * Math.sin(Math.PI * ez(f, y1881, bomb))} k={0.8} f={f} /> : null}
        <g transform={`translate(760 ${GROUND - 200})`}><Boom t={boom > 0 && boom < 1 ? boom : 0} k={3} /></g>
      </View>
      <YearBadge f={f} at={y1881 - 4} year={1881} />
    </AbsoluteFill>
  );
};

/* ─────────────── 13. Nicholas II, Japan, Rasputin ─────────────── */

const Nicholas: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("nicholas");
  const nicholas = W("Nicholas"), japan = W("Japan"), sent = W("sent"), world = W("world."), north = W("North"), fire = W("fire"), british = W("British"), japanese = W("Japanese.");
  const reached = W("reached"), destroyed = W("destroyed"), back = W("Back"), fired = W("fired"), marchers = W("marchers,"), revolution = W("revolution"), parliament = W("parliament.");
  const ww = W("World", 1), millions = W("millions"), rasputin = W("Rasputin"), sick = W("sick"), influence = W("influence."), poison = W("poison"), bullets = W("bullets");
  const river = W("river."), autopsy = W("autopsy"), bullets2 = W("bullets.", 1);
  if (f < sent - 4) {
    const cam = glide(f, [[0, at([130, 45], 2.2)]], 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1880" regions={[reg(1880, "Russian Empire", C.red), reg(1880, "Imperial Japan", "#F1C7BF", { t: ez(f, japan - 4, japan + 16), from: [139.7, 35.7] }), reg(1880, "Manchu Empire", "#E7D49B", { op: 0.8 })]}>
          <Label p="tokyo" s={cam.s} t={pop(f, japan - 2)} text="JAPAN" dy={60} />
          <Label p="vladivostok" s={cam.s} t={1} text="VLADIVOSTOK" dy={-30} />
          <Pin p={[124, 42]} s={cam.s} k={0.8} t={pop(f, japan + 6)}><g transform={`rotate(${wob(f, 8, 3)})`}><path d="M-60 -60 L50 50 M60 -60 L-50 50" stroke={C.ink} strokeWidth={22} strokeLinecap="round" /><path d="M-60 -60 L50 50 M60 -60 L-50 50" stroke="#D9DDE1" strokeWidth={12} strokeLinecap="round" /></g></Pin>
        </MapView>
        <Over>
          <Person who="nicholas" x={260} ground={1180} f={f} s={2.2} face={FACES.smug} armR={-80} />
          <NameCard x={270} y={380} name="NICHOLAS II" t={pop(f, nicholas)} color={C.red} />
        </Over>
        <YearBadge f={f} at={0} year={1904} />
      </AbsoluteFill>
    );
  }
  if (f < back - 4) {
    if (f < reached - 4) {
      const sail = (f - sent) * 4;
      const boats = f >= north - 6;
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <rect x={-1200} y={-800} width={4400} height={1500} fill="#E3EEF2" />
            <Water y={700} f={f} />
            {[0, 1, 2].map((i) => <Ship key={i} x={((300 + i * 380 + sail) % 2600) - 300 + (boats ? 0 : 0)} y={700} f={f + i * 9} k={0.75} steam flag="#FFFFFF" />)}
            {boats ? [0, 1, 2].map((i) => <Boat key={i} x={1400 + i * 180} y={720 + (i % 2) * 40} f={f} k={0.8} />) : null}
            {f >= fire ? [0, 1, 2].map((i) => <g key={i} transform={`translate(${1400 + i * 180} 640)`}><Boom t={((f - fire - i * 7) % 30) / 18} k={0.7} /></g>) : null}
            <Person who="admiral" x={((300 + sail) % 2600) - 300} ground={600} f={f} s={0.9} face={FACES.angry} armR={-90} op={pop(f, fire - 10)} />
            <Say x={((300 + sail) % 2600) - 300 + 140} y={300} t={span(f, japanese - 10, reached)} text="JAPANESE!" size={56} tail={-1} />
            <Say x={1500} y={330} t={span(f, british, reached)} text={"WE'RE\nBRITISH!"} size={50} tail={1} />
            <Counter x={960} y={150} f={f} a={sent} b={world + 20} to={33000} suffix=" km" size={80} op={1 - ez(f, north - 6, north)} />
          </View>
        </AbsoluteFill>
      );
    }
    const sink = (i: number) => ez(f, destroyed + i * 8, destroyed + 40 + i * 8);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1500} fill="#E3EEF2" />
          <Water y={700} f={f} />
          {[0, 1, 2].map((i) => <Ship key={i} x={500 + i * 450} y={700} f={f + i * 9} k={0.8} steam sink={sink(i)} />)}
          {f >= destroyed ? [0, 1, 2].map((i) => <g key={i} transform={`translate(${500 + i * 450} 560)`}><Boom t={(f - destroyed - i * 8) / 18} k={1.2} /></g>) : null}
          <NameCard x={960} y={160} name="TSUSHIMA, 1905" t={pop(f, reached)} color={C.red} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < ww - 4) {
    const shot = f >= fired && f < fired + 8 ? 1 : 0;
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1640} fill="#DCE8EC" opacity={0.5} />
          <Ground />
          {f < revolution - 4 ? (
            <>
              {[0, 1, 2, 3].map((i) => <Person key={i} who="worker" x={mix(300, 520, ez(f, back, fired)) + i * 160} ground={GROUND} f={f + i * 6} s={1.3} walking={f < fired} face={f < fired ? FACES.neutral : FACES.shocked} op={pop(f, marchers - 10)} />)}
              <g opacity={pop(f, marchers - 10)}><rect x={mix(300, 520, ez(f, back, fired)) + 60} y={360} width={360} height={90} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} /><text x={mix(300, 520, ez(f, back, fired)) + 240} y={420} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={40}>BREAD & PEACE</text></g>
              {[0, 1, 2].map((i) => <Person key={i} who="guard" x={1400 + i * 150} ground={GROUND} f={f + i * 6} s={1.35} flip face={FACES.angry} armL={-90} />)}
              {f >= fired ? [0, 1, 2].map((i) => <g key={i} transform={`translate(${1330 + i * 150} ${GROUND - 220})`} opacity={1 - ez(f, fired + 10, fired + 40)}><circle r={40 + (f - fired)} fill="#D8D2C6" stroke={C.ink} strokeWidth={3} /></g>) : null}
              <NameCard x={960} y={160} name="BLOODY SUNDAY, 1905" t={pop(f, fired)} color={C.red} />
            </>
          ) : (
            <>
              {[0, 1, 2, 3, 4].map((i) => <Person key={i} who="worker" x={300 + i * 150} ground={GROUND} f={f + i * 6} s={1.25} face={FACES.angry} armR={-160 + wob(f + i * 4, 10)} />)}
              <Duma x={1350} ground={GROUND} t={pop(f, parliament - 6, 14)} />
              <Person who="nicholas" x={1700} ground={GROUND} f={f} s={1.4} flip face={FACES.annoyed} />
            </>
          )}
        </View>
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}><rect width={1920} height={1080} fill={C.red} opacity={0.35 * shot} /></svg>
      </AbsoluteFill>
    );
  }
  if (f < rasputin - 6) {
    const cam = glide(f, [[ww - 4, at([24, 53], 2.4)]], 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1914" regions={[reg(1914, "Russian Empire", C.red), reg(1914, "German Empire", "#8A8F96"), reg(1914, "Austro-Hungarian Empire", "#C9B458")]}>
          {[[[13.4, 52.5], [26, 54]], [[16, 50], [27, 50.5]], [[20, 47], [28, 48.5]]].map(([a, b], i) => (
            <MapArrow key={i} a={a as [number, number]} b={b as [number, number]} t={ez(f, ww + i * 6, ww + 30 + i * 6)} s={cam.s} color="#5B5F66" w={20} bend={0.05} />
          ))}
        </MapView>
        <TitleCard f={f} at={ww} until={millions + 10} lines={["WORLD WAR I"]} sub="1914" />
        <Punch f={f} at={millions + 10} until={rasputin - 6} color={C.red}>MILLIONS OF RUSSIAN CASUALTIES</Punch>
      </AbsoluteFill>
    );
  }
  if (f < poison - 4) {
    const strings = ez(f, influence - 8, influence + 6);
    return (
      <AbsoluteFill>
        <View x={960} y={520} s={1}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill="#3A2A3A" opacity={0.12} />
          <Ground />
          <Bed x={1300} ground={GROUND} />
          <g transform={`rotate(-90 1240 ${GROUND - 160})`}><Person who="michael" x={1240} ground={GROUND - 80} f={f} s={0.8} face={FACES.sad} op={span(f, sick - 6, influence - 8)} /></g>
          <Person who="rasputin" x={700} ground={GROUND} f={f} s={1.85} face={blendFace(FACES.neutral, FACES.smug, ez(f, influence - 10, influence + 10), { lookX: 0.6 })} armR={-120 - 20 * strings} armL={60} />
          {strings > 0 ? (
            <>
              {[0, 1].map((i) => <line key={i} x1={810} y1={GROUND - 420} x2={1200 + i * 260} y2={GROUND - 380} stroke={C.ink} strokeWidth={3} opacity={strings} />)}
              <Person who="nicholas" x={1200} ground={GROUND} f={f} s={1.4} flip face={FACES.confused} armL={70 + wob(f, 20, 4)} armR={-70} op={strings} />
              <Person who="catherine" x={1460} ground={GROUND} f={f + 5} s={1.4} flip face={FACES.worried} armL={70} armR={-70 - wob(f, 20, 4)} op={strings} />
            </>
          ) : null}
          <NameCard x={700} y={160} name="RASPUTIN" t={pop(f, rasputin)} />
        </View>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <rect x={-1200} y={-800} width={4400} height={2400} fill="#3A2A3A" opacity={0.12} />
        <Ground />
        <Cake x={400} y={GROUND - 60} t={pop(f, poison)} />
        <T x={400} y={GROUND + 60} size={36} op={pop(f, poison)}>POISON ✓</T>
        {[0, 1, 2].map((i) => <Bullet key={i} x={760 + i * 40} y={GROUND - 260 + i * 60} t={pop(f, bullets + i * 4)} />)}
        <T x={800} y={GROUND + 60} size={36} op={pop(f, bullets)}>BULLETS ✓</T>
        <g opacity={pop(f, river - 6)}>
          <ellipse cx={1200} cy={GROUND + 10} rx={150} ry={30} fill="#9CC9E8" stroke={C.ink} strokeWidth={5} />
          {f >= river ? [0, 1, 2, 3].map((i) => <circle key={i} cx={1200 + (i - 1.5) * 60} cy={GROUND - 60 * Math.sin(Math.PI * ez(f, river + i * 3, river + 20 + i * 3))} r={14} fill="#9CC9E8" stroke={C.ink} strokeWidth={3} />) : null}
          <T x={1200} y={GROUND + 90} size={36}>FROZEN RIVER ✓</T>
        </g>
        <Scroll x={1550} y={400} k={0.9} t={pop(f, autopsy - 4)} lines={["AUTOPSY:", "MOSTLY", "BULLETS"]} stamp={pop(f, bullets2)} rot={5} />
      </View>
      <YearBadge f={f} at={0} year={1916} />
    </AbsoluteFill>
  );
};

/* ─────────────── 14. 1917 ─────────────── */

const Revolution: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("revolution");
  const bread = W("bread"), soldiers = W("soldiers"), throne = W("throne."), three = W("Three"), week = W("week."), germany = W("Germany"), lenin = W("Lenin");
  const sealed = W("sealed"), chaos = W("chaos."), did = W("did."), october = W("October"), november = W("November,"), calendar = W("calendar.");
  const civil = W("civil"), reds = W("Reds"), whites = W("Whites."), y1918 = W("1918,"), basement = W("basement."), won = W("won,"), y1922 = W("1922,"), soviet = W("Soviet"), lenin2 = W("Lenin", 1), display = W("display");
  if (f < three - 4) {
    const join = ez(f, soldiers, soldiers + 30);
    const fall = ez(f, throne - 6, throne + 8);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <Person who="worker" x={250 + i * 170} ground={GROUND} f={f + i * 6} s={1.3} face={FACES.angry} armR={-150 + wob(f + i * 4, 15, 3)} />
              <Bread x={250 + i * 170 + 70} y={GROUND - 330 + wob(f + i * 4, 10, 3)} k={0.6} t={pop(f, bread - 4 + i * 2)} />
            </g>
          ))}
          {[0, 1].map((i) => <Person key={i} who="guard" x={mix(1150 + i * 160, 950 + i * 140, join)} ground={GROUND} f={f + i * 6} s={1.35} flip={join < 0.5} walking={join > 0 && join < 1} face={join > 0.5 ? FACES.angry : FACES.neutral} />)}
          <Person who="nicholas" x={1600} ground={GROUND} f={f} s={1.6} flip face={fall > 0.2 ? FACES.shocked : FACES.worried} />
          {fall > 0 ? <g transform={`translate(${1600 + 160 * fall} ${GROUND - 330 + 330 * fall}) rotate(${200 * fall})`}><path d="M-32 14 L-34 -22 L-16 -8 L0 -30 L16 -8 L34 -22 L32 14 Z" fill={R.gold} stroke={C.ink} strokeWidth={4} /></g> : null}
        </View>
        <YearBadge f={f} at={0} year={1917} />
      </AbsoluteFill>
    );
  }
  if (f < germany - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <T x={960} y={380} size={90} color={C.red}>ROMANOVS 1613 – 1917</T>
          <T x={960} y={560} size={130} op={pop(f, three)}>304 YEARS</T>
          <T x={960} y={720} size={90} color={C.red} op={pop(f, week - 4)}>→ GONE IN A WEEK</T>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < october - 4) {
    const x = mix(-500, 1500, ez(f, germany - 4, chaos + 20));
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1640} fill="#DCE8EC" opacity={0.4} />
          <Ground />
          <line x1={-1200} y1={GROUND - 2} x2={3200} y2={GROUND - 2} stroke={C.ink} strokeWidth={10} strokeDasharray="40 20" />
          <g transform={`translate(${x - 95} ${GROUND - 120})`}><Person who="lenin" x={0} ground={0} f={f} s={0.5} face={FACES.smug} op={pop(f, lenin - 4)} /></g>
          <Train x={x} ground={GROUND} k={1} f={f} label="SEALED" />
          <NameCard x={960} y={160} name="LENIN" t={span(f, lenin, did)} color={C.red} />
          <T x={330} y={420} size={44} op={span(f, germany, sealed + 20)}>FROM GERMANY ↓</T>
          <Say x={1400} y={300} t={span(f, chaos - 4, did + 4)} text="CHAOS? SURE." size={50} tail={-1} />
          {f >= did ? [0, 1, 2].map((i) => <g key={i} transform={`translate(${700 + i * 300} 500)`}><Boom t={(f - did - i * 4) / 20} k={1.5} /></g>) : null}
        </View>
      </AbsoluteFill>
    );
  }
  if (f < civil - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Month x={620} y={480} k={1.3} name="OCTOBER" crossed={ez(f, calendar - 6, calendar + 10)} />
          <Month x={1300} y={480} k={1.3} t={pop(f, november - 4)} name="NOVEMBER" color="#3E6FB0" />
          <T x={960} y={160} size={64} op={pop(f, october)}>THE OCTOBER REVOLUTION…</T>
          <T x={1300} y={840} size={50} color="#3E6FB0" op={pop(f, november + 4)}>…HAPPENED HERE</T>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < y1918 - 4) {
    const pull = Math.sin(f / 7) * 40;
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <line x1={500 + pull} y1={GROUND - 200} x2={1420 + pull} y2={GROUND - 200} stroke="#A0703F" strokeWidth={12} />
          {[0, 1, 2].map((i) => <Person key={`r${i}`} who="red" x={420 - i * 150 + pull} ground={GROUND} f={f + i * 6} s={1.4} lean={-18} armR={-80} armL={-60} face={FACES.angry} op={pop(f, reds - 4)} />)}
          {[0, 1, 2].map((i) => <Person key={`w${i}`} who="white" x={1500 + i * 150 + pull} ground={GROUND} f={f + i * 6} s={1.4} flip lean={-18} armR={-80} armL={-60} face={FACES.angry} op={pop(f, whites - 4)} />)}
          <T x={300} y={300} size={70} color={C.red} op={pop(f, reds)}>REDS</T>
          <T x={1650} y={300} size={70} color="#8A8F96" op={pop(f, whites)}>WHITES</T>
          <NameCard x={960} y={140} name="CIVIL WAR, 1917–1922" t={pop(f, civil)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < won - 4) {
    const dark = ez(f, basement - 10, basement + 10);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill="#1E1A16" opacity={0.75} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <Person key={i} who={i === 0 ? "nicholas" : i === 1 ? "catherine" : "plain"} x={560 + i * 140} ground={GROUND} f={f + i * 5} s={i < 2 ? 1.3 : 1.0} face={FACES.worried} op={1 - dark} />)}
          <rect x={1650} y={GROUND - 120} width={30} height={80} fill="#F3E9D2" stroke={C.ink} strokeWidth={3} />
          <path d={`M1665 ${GROUND - 120} q-10 -20 0 -40 q10 20 0 40`} fill={R.amber} opacity={1 - dark} />
          <T x={960} y={200} size={46} color="#F3E9D2">YEKATERINBURG, JULY 1918</T>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < lenin2 - 4) {
    const cam = glide(f, [[won - 4, at([95, 58], 0.95)]], 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1920" regions={[reg(1920, "USSR", C.red, { t: ez(f, soviet - 10, soviet + 30), from: [37.6, 55.75] }), reg(1920, "Far Eastern SSR", C.red, { t: ez(f, soviet + 10, soviet + 40), from: [131.9, 43.1] })]}>
          <Label p={[96, 62]} s={cam.s} t={pop(f, soviet + 4)} text="USSR" size={120} dot={false} color="#FFFFFF" halo={C.ink} />
        </MapView>
        <YearBadge f={f} at={y1922 - 4} year={1922} />
        <TitleCardInline f={f} at={soviet} until={lenin2 - 4} text="THE SOVIET UNION" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <rect x={-1200} y={-800} width={4400} height={1640} fill="#E9E0D0" opacity={0.5} />
        <Ground />
        <GlassCase x={960} ground={GROUND} k={1.2}>
          <g transform="rotate(-90 0 -165)"><Person who="lenin" x={0} ground={-165 + 110 * 0.85} f={0} s={0.85} face={{ ...FACES.neutral, eyeOpen: 0.05 }} /></g>
        </GlassCase>
        {[0, 1, 2, 3].map((i) => <Person key={i} who="plain" x={260 + i * 120} ground={GROUND} f={f + i * 7} s={1.1} face={FACES.confused} op={pop(f, display - 8 + i * 3)} />)}
        <NameCard x={960} y={170} name="LENIN'S MAUSOLEUM, RED SQUARE" t={pop(f, display - 4)} color={C.red} />
      </View>
      <YearBadge f={f} at={0} year={1924} until={display} />
      <YearBadge f={f} at={display} year={2026} />
    </AbsoluteFill>
  );
};

/* ─────────────── 15. Stalin and the war ─────────────── */

const Stalin: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("stalin");
  const stalin = W("Stalin,"), steel = W("steel."), forced = W("forced"), giant = W("giant"), famine = W("famine"), ukraine = W("Ukraine."), terror = W("Terror,"), seven = W("seven");
  const gulag = W("Gulag."), photographs = W("photographs."), edited = W("edited"), y1939 = W("1939,"), deal = W("deal"), broke = W("broke"), invaded = W("invaded");
  const leningrad = W("Leningrad"), nine = W("nine"), stalingrad = W("Stalingrad,"), turned = W("turned"), lost = W("lost"), twenty = W("twenty-seven"), may = W("May"), berlin = W("Berlin.");
  if (f < forced - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="stalin" x={640} ground={GROUND} f={f} s={1.9} face={FACES.smug} armR={-40} />
          <NameCard x={640} y={150} name="STALIN" t={pop(f, stalin - 4)} color={C.red} />
          <g opacity={pop(f, steel - 4)} transform="translate(1300 450)">
            <rect x={-260} y={-60} width={520} height={120} fill="#9AA3AB" stroke={C.ink} strokeWidth={6} />
            <rect x={-260} y={-60} width={520} height={30} fill="#C9D0D6" />
            <text x={0} y={22} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={56} fill={C.ink}>“MAN OF STEEL”</text>
          </g>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < terror - 4) {
    if (f < famine - 2) {
      const merge = ez(f, giant - 4, giant + 20);
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <Ground />
            {Array.from({ length: 6 }, (_, i) => {
              const x0 = 200 + i * 260, x = mix(x0, 960 + (i - 2.5) * 120, merge);
              return <rect key={i} x={x - 110 * mix(1, 0.4, merge)} y={GROUND - 120} width={220 * mix(1, 0.4, merge)} height={120} fill="#C9A23A" opacity={0.5} stroke={C.ink} strokeWidth={4} />;
            })}
            <rect x={960 - 760 * merge} y={GROUND - 140} width={1520 * merge} height={140} fill="none" stroke={C.ink} strokeWidth={8} opacity={merge} />
            <T x={960} y={GROUND - 170} size={60} op={merge}>COLLECTIVE FARM</T>
            {[0, 1, 2].map((i) => <Person key={i} who="serf" x={400 + i * 500} ground={GROUND - 120} f={f + i * 5} s={1.2} face={FACES.worried} op={1 - merge} />)}
          </View>
        </AbsoluteFill>
      );
    }
    if (f < ukraine - 6) {
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <rect x={-1200} y={-800} width={4400} height={1640} fill="#5A5566" opacity={0.3} />
            <Ground />
            <Wheat x0={-100} x1={2000} ground={GROUND} wilt={ez(f, famine, famine + 30)} />
          </View>
        </AbsoluteFill>
      );
    }
    const cam = glide(f, [[ukraine - 6, at([31.5, 49], 3.2)]], 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1938" regions={[reg(1938, "USSR", C.red, { op: 0.5 }), reg(1994, "Ukraine", C.ink, { hatch: true })]}>
          <Label p={[31.5, 48.6]} s={cam.s} t={pop(f, ukraine - 4)} text="UKRAINE" dot={false} size={60} />
        </MapView>
        <Punch f={f} at={ukraine} until={terror - 4} color={C.ink}>MILLIONS DEAD, 1932–33</Punch>
      </AbsoluteFill>
    );
  }
  if (f < y1939 - 4) {
    if (f < gulag - 4) {
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <rect x={-1200} y={-800} width={4400} height={2400} fill="#2A2228" opacity={0.25} />
            <Ground />
            {Array.from({ length: 10 }, (_, i) => <Person key={i} who="plain" x={180 + i * 175} ground={GROUND} f={f + i * 5} s={1.2} face={FACES.worried} op={1 - ez(f, seven + i * 5, seven + 10 + i * 5)} />)}
            <Counter x={960} y={330} f={f} a={seven} b={seven + 40} to={700000} size={120} color={C.red} />
            <T x={960} y={410} size={48} op={pop(f, seven + 6)}>SHOT IN TWO YEARS</T>
          </View>
        </AbsoluteFill>
      );
    }
    if (f < edited - 4) {
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <rect x={-1200} y={-800} width={4400} height={1640} fill="#E3EEF2" />
            <rect x={-1200} y={GROUND} width={4400} height={600} fill="#FFFFFF" />
            <Barbed x0={-100} x1={2100} ground={GROUND} h={260} />
            <Snow f={f} op={1} n={60} />
            <T x={960} y={300} size={110} color={C.ink}>GULAG</T>
          </View>
        </AbsoluteFill>
      );
    }
    const erase = ez(f, photographs - 10, photographs + 20);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Photo x={960} y={480} w={900} h={520}>
            {[0, 1, 2, 3].map((i) => <Person key={i} who={i === 1 ? "stalin" : "plain"} x={-330 + i * 220} ground={240} f={i * 9} s={1.3} face={FACES.neutral} op={i === 3 ? 1 - erase : 1} />)}
          </Photo>
          {erase > 0 && erase < 1 ? <rect x={960 + 330 - 120} y={250} width={240 * erase} height={460} fill="#D9D2C2" opacity={0.9} /> : null}
        </View>
      </AbsoluteFill>
    );
  }
  if (f < lost - 4) {
    const cam = glide(f, [[y1939 - 4, at([30, 53], 1.7)], [leningrad, at([34, 55], 1.9)]], 40);
    const inv = ez(f, invaded, invaded + 40);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1938" regions={[reg(1938, "USSR", C.red), reg(1938, "Germany", "#8A8F96"), reg(1938, "Poland", R.pink, { op: 0.6 })]}>
          <Pin p={[24, 53]} s={cam.s} k={1} t={span(f, deal, invaded)}>
            <g transform={`rotate(${-20 * ez(f, broke, broke + 10)})`}><Scroll x={-ez(f, broke, broke + 10) * 60} y={0} k={0.6} lines={["PACT", "1939"]} /></g>
          </Pin>
          {[[[19, 55], [30, 59.5]], [[21, 52], [36, 54.5]], [[22, 49], [40, 48.5]]].map(([a, b], i) => (
            <MapArrow key={i} a={a as [number, number]} b={b as [number, number]} t={inv} s={cam.s} color="#5B5F66" w={22} bend={0.04} />
          ))}
          <Label p="leningrad" s={cam.s} t={pop(f, leningrad - 4)} text="LENINGRAD" dy={-30} />
          <Label p="stalingrad" s={cam.s} t={pop(f, stalingrad - 4)} text="STALINGRAD" dy={56} />
          <Pin p="stalingrad" s={cam.s} k={1} t={1}><Boom t={((f - stalingrad) % 30) / 20} k={0.9} /></Pin>
          {f >= turned ? <MapArrow a={[44, 51]} b={[38, 50]} t={ez(f, turned, turned + 30)} s={cam.s} color={C.red} w={18} bend={0.2} /> : null}
        </MapView>
        <YearBadge f={f} at={y1939 - 4} year={1939} to={1941} roll={[invaded - 20, invaded]} />
        <Punch f={f} at={nine - 4} until={stalingrad - 4}>872 DAYS UNDER SIEGE</Punch>
      </AbsoluteFill>
    );
  }
  if (f < may - 4) {
    const n = Math.floor(270 * ez(f, twenty - 10, twenty + 40));
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          {Array.from({ length: n }, (_, i) => <circle key={i} cx={260 + (i % 30) * 48} cy={300 + Math.floor(i / 30) * 48} r={14} fill={C.red} opacity={0.85} />)}
          <Counter x={960} y={220} f={f} a={twenty} b={twenty + 40} to={27000000} size={110} color={C.ink} />
          <T x={960} y={820} size={46} op={pop(f, twenty + 20)}>SOVIET WAR DEAD — MORE THAN ANY OTHER COUNTRY</T>
        </View>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <rect x={-1200} y={-800} width={4400} height={1640} fill="#E3D9C8" opacity={0.6} />
        <Ground />
        <Reichstag x={960} ground={GROUND} flag={ez(f, berlin - 10, berlin + 10)} f={f} />
      </View>
      <YearBadge f={f} at={may - 4} year={1945} />
    </AbsoluteFill>
  );
};

export const SCENES3: Record<string, React.FC> = { napoleon: Napoleon, reform: Reform, nicholas: Nicholas, revolution: Revolution, stalin: Stalin };
