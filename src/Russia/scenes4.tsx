import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { View } from "./view";
import { Calendar } from "../Hangry2/props2";
import { blendFace, FACES, Person } from "./cast";
import { C, Counter, GROUND, Ground, Punch, R, T, YearBadge, ez, glide, mix, pop, span, wob, NameCard } from "./kit";
import { Label, MapArrow, MapView, Pin, at, reg } from "./map";
import { Globe, Kremlin, Laika, Longship, Month, MoneyBag, Pizza, Reactor, Rocket, Say, Shelves, Snow, Sputnik, Tag, Tank, TVSet, Wall, Water, Factory } from "./props";
import { Over, RUSSIA_CAM, TitleCardInline, useW } from "./scenes1";

const Button: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <rect x={-70} y={-20} width={140} height={60} rx={10} fill="#5B5F66" stroke={C.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-20} rx={46} ry={20} fill={C.red} stroke={C.ink} strokeWidth={5} />
    </g>
  );
const Machine: React.FC<{ x: number; ground: number; f: number; shake: number }> = ({ x, ground, f, shake }) => (
  <g transform={`translate(${x + shake * 4 * Math.sin(f * 1.7)} ${ground})`}>
    <rect x={-200} y={-300} width={400} height={300} fill="#8A8F96" stroke={C.ink} strokeWidth={6} />
    {[[-110, -200], [60, -150], [-30, -80]].map(([gx, gy], i) => (
      <g key={i} transform={`translate(${gx} ${gy}) rotate(${(i % 2 ? -1 : 1) * f * 3})`}>
        <circle r={40} fill="#C9C2B4" stroke={C.ink} strokeWidth={5} />
        {[0, 60, 120].map((a) => <rect key={a} x={-48} y={-8} width={96} height={16} fill="#C9C2B4" stroke={C.ink} strokeWidth={3} transform={`rotate(${a})`} />)}
      </g>
    ))}
    <text x={0} y={-320} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={56} fill={C.red}>USSR</text>
    {shake > 0.5 ? <path d={`M120 -300 q20 -40 0 -80 q-20 -40 10 -70`} fill="none" stroke="#B9B2A4" strokeWidth={14} strokeLinecap="round" /> : null}
  </g>
);
const Mountains: React.FC = () => (
  <path d="M-200 840 L200 460 L420 640 L700 380 L1000 700 L1300 420 L1600 680 L1900 500 L2200 840 Z" fill="#C9B79A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
);

/* ─────────────── 16. Cold War and space ─────────────── */

const ColdWar: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("coldwar");
  const superpowers = W("superpowers,"), hated = W("hated"), y1957 = W("1957,"), sputnik = W("Sputnik,"), america = W("America"), panicked = W("panicked."), laika = W("Laika.");
  const y1961 = W("1961,"), gagarin = W("Gagarin"), space = W("space."), rocket = W("rocket"), lifted = W("lifted"), poy = W("\"Poyekhali!\""), go = W("go!\"");
  const yearLater = W("year"), missiles = W("missiles"), cuba = W("Cuba"), nuclear = W("nuclear"), stagnation = W("stagnation,"), shelves = W("shelves,"), afghanistan = W("Afghanistan,"), y1986 = W("1986,"), chernobyl = W("Chernobyl.");
  if (f < y1957 - 4) {
    const glare = ez(f, hated, hated + 10);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="uncleSam" x={520} ground={GROUND} f={f} s={1.8} face={blendFace(FACES.neutral, FACES.angry, glare, { lookX: 0.8 })} op={pop(f, superpowers - 6)} />
          <Person who="ushanka" x={1400} ground={GROUND} f={f + 5} s={1.8} flip face={blendFace(FACES.neutral, FACES.angry, glare, { lookX: -0.8 })} op={pop(f, superpowers)} />
          {glare > 0 ? <path d={`M760 ${400 + wob(f, 10, 2)} L900 360 L860 420 L1000 380 L960 440 L1160 ${400 - wob(f, 10, 2)}`} fill="none" stroke={R.gold} strokeWidth={10} strokeLinejoin="round" opacity={f % 6 < 3 ? 1 : 0.4} /> : null}
          <NameCard x={520} y={180} name="USA" t={pop(f, superpowers)} color={R.blue} />
          <NameCard x={1400} y={180} name="USSR" t={pop(f, superpowers + 4)} color={C.red} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < gagarin - 4) {
    const a = (f - y1957) / 40;
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill={R.night} />
          {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={2 + (i % 3)} fill="#FFFFFF" opacity={0.7} />)}
          <Globe x={960} y={560} r={220} spin={f / 200} />
          <Sputnik x={960 + Math.cos(a) * 420} y={560 + Math.sin(a) * 240} k={0.6} t={pop(f, sputnik - 4)} rot={a * 30} />
          {f >= sputnik ? <T x={960 + Math.cos(a) * 420} y={560 + Math.sin(a) * 240 - 90} size={40} color="#FFFFFF" stroke="#1B2547" op={Math.floor(f / 10) % 2 ? 1 : 0}>BEEP</T> : null}
          <Laika x={1500} y={300} k={0.9} t={pop(f, laika - 6)} f={f} />
          <T x={1500} y={460} size={44} color="#FFFFFF" stroke="#1B2547" op={pop(f, laika)}>LAIKA</T>
        </View>
        <Over>
          <g opacity={span(f, america - 6, laika - 6)}>
            <Person who="uncleSam" x={260} ground={1180} f={f} s={2.2} face={FACES.shocked} armL={150 + wob(f, 15, 2)} armR={-150 - wob(f, 15, 2)} />
          </g>
        </Over>
        <YearBadge f={f} at={y1957 - 4} year={1957} />
        <Punch f={f} at={panicked - 2} until={laika - 6} color={R.blue}>AMERICA: PANIC</Punch>
      </AbsoluteFill>
    );
  }
  if (f < yearLater - 4) {
    const lift = ez(f, lifted, go + 30);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill="#DCE8EC" />
          <rect x={-1200} y={-800} width={4400} height={2400} fill={R.night} opacity={lift} />
          <Ground />
          <Rocket x={1250} ground={GROUND} k={1.3} lift={lift} f={f} />
          <Person who="gagarin" x={560} ground={GROUND} f={f} s={1.8} face={FACES.happy} armR={-140} op={1 - ez(f, rocket - 4, rocket + 6)} />
          <NameCard x={560} y={160} name="YURI GAGARIN" t={span(f, gagarin, rocket)} color={C.red} />
          <Say x={1250} y={mix(300, -400, lift)} t={span(f, poy - 4, go + 20)} text="ПОЕХАЛИ!" size={64} tail={1} />
        </View>
        <YearBadge f={f} at={y1961 - 4} year={1961} />
        <Punch f={f} at={go - 4} until={missiles} color={C.red}>“LET'S GO!”</Punch>
        <TitleCardInline f={f} at={space - 6} until={rocket - 2} text="FIRST HUMAN IN SPACE" />
      </AbsoluteFill>
    );
  }
  if (f < stagnation - 4) {
    const sweat = ez(f, nuclear, nuclear + 10);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="uncleSam" x={420} ground={GROUND} f={f} s={1.6} face={blendFace(FACES.angry, FACES.worried, sweat)} armR={-90} />
          <Person who="ushanka" x={1500} ground={GROUND} f={f} s={1.6} flip face={blendFace(FACES.angry, FACES.worried, sweat)} armL={-90} />
          <Button x={620} y={560} t={pop(f, missiles)} />
          <Button x={1300} y={560} t={pop(f, missiles + 4)} />
          <path d="M860 760 L960 400 L1060 760 Z" fill="#E8E2D6" stroke={C.ink} strokeWidth={6} opacity={pop(f, cuba - 4)} />
          <T x={960} y={830} size={50} op={pop(f, cuba)}>MISSILES IN CUBA</T>
          {sweat > 0 ? [0, 1].map((i) => <circle key={i} cx={(i ? 1500 : 420) + 40} cy={GROUND - 330 + ((f * 3) % 60)} r={10} fill="#9CC9E8" stroke={C.ink} strokeWidth={3} />) : null}
        </View>
        <YearBadge f={f} at={yearLater - 4} year={1962} />
      </AbsoluteFill>
    );
  }
  if (f < afghanistan - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="brezhnev" x={500} ground={GROUND} f={f} s={1.7} face={{ ...FACES.neutral, eyeOpen: 0.35 }} headTilt={8 + 4 * Math.sin(f / 20)} />
          <Shelves x={1250} ground={GROUND} k={1.2} stock={mix(0.6, 0.08, ez(f, shelves - 10, shelves + 10))} />
          {[0, 1, 2, 3].map((i) => <Person key={i} who="plain" x={900 + i * 110} ground={GROUND} f={f + i * 7} s={1} face={FACES.annoyed} op={pop(f, shelves + i * 3)} flip />)}
          <T x={500} y={200} size={56} op={pop(f, stagnation - 4)}>STAGNATION</T>
          <T x={620} y={260} size={40} op={pop(f, stagnation + 8)}>z z z</T>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < y1986 - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Mountains />
          <Ground />
          <Tank x={mix(400, 900, ez(f, afghanistan, y1986))} ground={GROUND} k={1.2} f={f} />
          <NameCard x={960} y={150} name="AFGHANISTAN, 1979–1989" t={pop(f, afghanistan)} color={C.red} />
        </View>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <Ground />
        <Reactor x={960} ground={GROUND} k={1.4} glow={ez(f, chernobyl - 4, chernobyl + 20)} f={f} />
        <NameCard x={960} y={140} name="CHERNOBYL" t={pop(f, chernobyl - 2)} color={C.red} />
      </View>
      <YearBadge f={f} at={y1986 - 4} year={1986} />
    </AbsoluteFill>
  );
};

/* ─────────────── 17. Collapse ─────────────── */

const Collapse: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("collapse");
  const gorbachev = W("Gorbachev,"), fix = W("fix"), openness = W("openness"), reform = W("reform."), freely = W("freely,"), out = W("out.");
  const y1989 = W("1989,"), wall = W("Wall"), fell = W("fell."), y1991 = W("1991,"), coup = W("coup,"), yeltsin = W("Yeltsin"), tank = W("tank"), three = W("three"), days = W("days.");
  const christmas = W("Christmas"), resigned = W("resigned,"), split = W("split"), fifteen = W("fifteen"), pizza = W("Pizza"), commercial = W("commercial.");
  if (f < y1989 - 4) {
    if (f < freely - 4) {
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1}>
            <Ground />
            <Machine x={1250} ground={GROUND} f={f} shake={0.6} />
            <Person who="gorby" x={560} ground={GROUND} f={f} s={1.8} face={blendFace(FACES.neutral, FACES.worried, ez(f, fix, fix + 20), { lookX: 0.8 })} armR={-90 + wob(f, 20, 3) * (f >= fix ? 1 : 0)} />
            <NameCard x={560} y={160} name="MIKHAIL GORBACHEV" t={pop(f, gorbachev - 4)} color={C.red} />
            <Tag x={1000} y={170} k={0.8} t={pop(f, openness - 2)} text="GLASNOST = OPENNESS" color="#FFFFFF" />
            <Tag x={1000} y={330} k={0.8} t={pop(f, reform - 4)} text="PERESTROIKA = REFORM" color="#FFFFFF" />
          </View>
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          {Array.from({ length: 7 }, (_, i) => <Person key={i} who="plain" x={200 + i * 250} ground={GROUND} f={f + i * 6} s={1.3} face={FACES.angry} armR={-150 + wob(f + i * 4, 15, 3)} />)}
          {[0, 1, 2].map((i) => <Say key={i} x={380 + i * 580} y={300 + (i % 2) * 70} t={pop(f, out - 6 + i * 4)} text="WE WANT OUT!" size={42} tail={i % 2 ? 1 : -1} />)}
        </View>
      </AbsoluteFill>
    );
  }
  if (f < y1991 - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Wall x={960} ground={GROUND} w={1600} h={350} fall={ez(f, fell - 6, fell + 20)} />
          {f >= fell ? [0, 1, 2].map((i) => <Person key={i} who="plain" x={760 + i * 200} ground={GROUND - 350 * (1 - ez(f, fell + 10, fell + 40))} f={f + i * 5} s={1.2} face={FACES.laugh} armL={150} armR={-150} />) : null}
          <NameCard x={960} y={140} name="BERLIN WALL" t={pop(f, wall - 4)} />
        </View>
        <YearBadge f={f} at={y1989 - 4} year={1989} />
      </AbsoluteFill>
    );
  }
  if (f < christmas - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Tank x={1100} ground={GROUND} k={1.3} f={0} flip />
          <Person who="yeltsin" x={1050} ground={GROUND - 300 * ez(f, tank - 10, tank + 4) - 0} f={f} s={1.6} face={FACES.angry} armR={-160} op={pop(f, yeltsin - 4)} />
          {[0, 1].map((i) => <Person key={i} who="soldier" x={260 + i * 170} ground={GROUND} f={f + i * 5} s={1.3} face={FACES.annoyed} op={pop(f, coup - 4) * (1 - ez(f, three, three + 20))} />)}
          <NameCard x={1050} y={110} name="BORIS YELTSIN" t={pop(f, yeltsin)} color={C.red} />
          <Calendar x={420} y={330} day={1 + Math.floor(2 * ez(f, three, days))} k={1.1} label="DAY" />
        </View>
        <YearBadge f={f} at={y1991 - 4} year={1991} />
      </AbsoluteFill>
    );
  }
  if (f < split - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1640} fill={R.night} opacity={0.3} />
          <Ground />
          <Kremlin x={960} ground={GROUND} k={1.1} flag={C.red} flagT={1 - ez(f, resigned, resigned + 30)} f={f} snow={1} />
          <Snow f={f} op={1} n={60} />
          <NameCard x={960} y={110} name="25 DECEMBER 1991" t={pop(f, christmas)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < pizza - 4) {
    const states = ["Russia", "Ukraine", "Byelarus", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan", "Azerbaijan", "Latvia", "Lithuania", "Estonia", "Moldova", "Georgia", "Armenia"];
    const cols = [C.red, "#F2C14E", "#8FBF8F", "#6FA8DC", "#C9A0DC", "#E6A57E", "#9ED2C6", "#F4B6C2", "#B7C9A8", "#A8C5E2", "#E8D07A", "#7FB3A8", "#D9A5B3", "#B5A3D6", "#F0A868"];
    const brk = ez(f, split - 4, fifteen + 20);
    return (
      <AbsoluteFill>
        <MapView cam={glide(f, [[split - 4, at([62, 52], 1.35)]], 30)} year={brk < 0.3 ? "1960" : "1994"}
          regions={[reg(1960, "USSR", C.red, { op: 1 - brk }), ...states.map((n, i) => reg(1994, n, cols[i]!, { op: ez(f, split + i * 2, split + 10 + i * 2) }))]} />
        <Over><Counter x={960} y={150} f={f} a={fifteen - 6} b={fifteen + 20} from={1} to={15} size={110} color={C.ink} suffix=" COUNTRIES" /></Over>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <TVSet x={960} y={480} k={1.8} t={pop(f, pizza - 4)}>
          <rect x={-190} y={-140} width={380} height={260} fill="#F3E3BC" />
          <g transform="translate(-60 120)"><Person who="gorby" x={0} ground={0} f={f} s={0.9} face={FACES.happy} armR={-110} /></g>
          <Pizza x={70} y={-20} k={0.6} rot={wob(f, 8, 4)} />
        </TVSet>
      </View>
      <YearBadge f={f} at={pizza - 4} year={1997} />
      <Punch f={f} at={commercial} until={100000}>REAL. LOOK IT UP.</Punch>
    </AbsoluteFill>
  );
};

/* ─────────────── 18. The 1990s to today ─────────────── */

const Modern: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("modern");
  const prices = W("Prices"), savings = W("savings"), men = W("men"), nothing = W("nothing.");
  const eve = W("Eve"), resigned = W("resigned"), handed = W("handed"), kgb = W("KGB"), putin = W("Putin."), since = W("since,"), y2014 = W("2014,"), crimea = W("Crimea.");
  const y2022 = W("2022,"), invasion = W("invasion"), ukraine = W("Ukraine,"), europe = W("Europe");
  if (f < eve - 4) {
    const rise = ez(f, prices, prices + 30);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <g opacity={span(f, prices - 6, men - 4)}>
            <path d={`M200 760 L${200 + 600 * rise} ${760 - 500 * rise * rise}`} stroke={C.red} strokeWidth={16} strokeLinecap="round" />
            <T x={300} y={260} size={56} color={C.red}>PRICES ↑</T>
            <MoneyBag x={1300} y={560} k={mix(1.2, 0.3, ez(f, savings, savings + 20))} sign="₽" />
            <T x={1300} y={360} size={56} op={pop(f, savings)}>SAVINGS ↓</T>
          </g>
          <g opacity={pop(f, men - 4)}>
            {[0, 1, 2].map((i) => <Factory key={i} x={1050 + i * 330} ground={GROUND} k={0.9} f={f} />)}
            <Person who="oligarch" x={520} ground={GROUND} f={f} s={1.7} face={FACES.smug} armR={-80} />
            <Tag x={1400} y={260} k={1} t={pop(f, nothing - 4)} text="$1" />
          </g>
        </View>
        <TitleCardInline f={f} at={0} until={prices - 6} text="THE 1990s" />
      </AbsoluteFill>
    );
  }
  if (f < since - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <TVSet x={760} y={480} k={1.6}>
            <rect x={-190} y={-140} width={380} height={260} fill={R.night} />
            <text x={0} y={-90} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={30} fill={R.gold}>31.12.1999</text>
            <g transform="translate(0 120)"><Person who="yeltsin" x={0} ground={0} f={f} s={0.8} face={blendFace(FACES.neutral, FACES.sad, ez(f, resigned, resigned + 10))} /></g>
          </TVSet>
          <Person who="suit" x={1450} ground={GROUND} f={f} s={1.6} flip face={FACES.neutral} op={pop(f, handed - 4)} />
          <NameCard x={1450} y={250} name="VLADIMIR PUTIN" t={pop(f, putin - 6)} />
          <T x={1450} y={320} size={34} op={pop(f, kgb)}>former KGB officer</T>
        </View>
        <YearBadge f={f} at={eve - 4} year={1999} />
      </AbsoluteFill>
    );
  }
  const cam = glide(f, [[since - 4, at([50, 55], 1.4)], [y2014, at([33, 48], 3)]], 40);
  return (
    <AbsoluteFill>
      <MapView cam={cam} year="1994" regions={[reg(1994, "Russia", C.red), reg(1994, "Ukraine", "#F2C14E"), reg(1994, "Byelarus", "#D8CDBB")]}>
        <Pin p="crimea" s={cam.s} k={1} t={pop(f, crimea - 6)}><circle r={80} fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="16 10" /></Pin>
        <Label p="crimea" s={cam.s} t={span(f, crimea - 4, y2022)} text="CRIMEA, 2014" dy={120} dot={false} />
        <Label p={[31.5, 49]} s={cam.s} t={pop(f, ukraine - 4)} text="UKRAINE" dot={false} size={56} />
        {[[[37.5, 51.5], [32, 50.5]], [[39, 48.2], [35.5, 48.2]], [[34, 45.2], [33, 46.8]]].map(([a, b], i) => (
          <MapArrow key={i} a={a as [number, number]} b={b as [number, number]} t={ez(f, invasion + i * 4, invasion + 24 + i * 4)} s={cam.s} color={C.red} w={14} bend={0.05} />
        ))}
      </MapView>
      <YearBadge f={f} at={since - 4} year={2000} to={2014} roll={[since, y2014]} until={y2022 - 4} />
      <YearBadge f={f} at={y2022 - 4} year={2022} />
      <Punch f={f} at={europe - 4} until={100000}>THE BIGGEST WAR IN EUROPE SINCE 1945</Punch>
    </AbsoluteFill>
  );
};

/* ─────────────── 19. The end ─────────────── */

const End: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("end");
  const vikings = W("Vikings,"), mongol = W("Mongol"), sons = W("sons,"), royals = W("royals,"), zones = W("zones,"), month = W("month,"), human = W("human"), pizza = W("pizza");
  const come = W("\"Come"), which = W("Which"), comments = W("comments.");
  if (f < W("started") - 6) {
    if (f < vikings - 4) {
      return <AbsoluteFill><MapView cam={RUSSIA_CAM} year="1994" regions={[reg(1994, "Russia", C.red)]} /></AbsoluteFill>;
    }
    const tiles: [number, React.ReactNode, string][] = [
      [vikings, <Person who="viking" x={0} ground={110} f={f} s={0.9} face={FACES.smug} />, "INVITED VIKINGS"],
      [mongol, <><Person who="mongol" x={-30} ground={110} f={f} s={0.9} face={FACES.happy} /><MoneyBag x={60} y={40} k={0.4} sign="₽" /></>, "MONGOL TAX COLLECTORS"],
      [sons, <><Person who="ivan" x={-30} ground={110} f={f} s={0.9} face={FACES.angry} /><Person who="peter" x={50} ground={110} f={f} s={0.9} face={FACES.angry} /></>, "SONS KILLED: II"],
      [royals, <><Person who="dmitry" x={-40} ground={110} f={f} s={0.8} face={FACES.smug} /><Person who="pugachev" x={50} ground={110} f={f} s={0.8} face={FACES.smug} /></>, "FAKE ROYALS: III"],
      [zones, <>{Array.from({ length: 11 }, (_, i) => <circle key={i} cx={-100 + (i % 6) * 40} cy={-30 + Math.floor(i / 6) * 50} r={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />)}</>, "11 TIME ZONES"],
      [month, <Month x={0} y={10} k={0.45} name="OCTOBER" crossed={1} />, "WRONG-MONTH REVOLUTION"],
      [human, <Person who="gagarin" x={0} ground={110} f={f} s={0.9} face={FACES.happy} />, "FIRST HUMAN IN SPACE"],
      [pizza, <Pizza x={0} y={10} k={0.7} />, "A PIZZA COMMERCIAL"],
    ];
    return (
      <AbsoluteFill>
        <MapView cam={RUSSIA_CAM} year="1994" regions={[reg(1994, "Russia", C.red)]} dim={0.6} />
        <Over>
          {tiles.map(([a, art, label], i) => {
            const x = 270 + (i % 4) * 460, y = 260 + Math.floor(i / 4) * 380;
            const t = pop(f, a - 4);
            return t <= 0 ? null : (
              <g key={i} transform={`translate(${x} ${y}) scale(${t})`}>
                <rect x={-200} y={-150} width={400} height={300} rx={18} fill={C.bg} stroke={C.ink} strokeWidth={6} />
                <g transform="translate(0 -10)">{art}</g>
                <text x={0} y={130} textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={28} fill={C.red}>{label}</text>
              </g>
            );
          })}
        </Over>
      </AbsoluteFill>
    );
  }
  if (f < which - 4) {
    return (
      <AbsoluteFill>
        <View x={1000} y={560} s={1}>
          <rect x={-1200} y={-800} width={4400} height={GROUND + 800} fill="#DCE8EC" opacity={0.5} />
          <Ground />
          <Water y={GROUND + 40} f={f} />
          {[0, 1, 2].map((i) => <Person key={i} who="tribe" x={520 + i * 190} ground={GROUND} f={f + i * 9} s={1.5} face={FACES.happy} armL={150 + wob(f + i * 4, 18)} armR={-150 - wob(f + i * 4, 18)} />)}
          <Say x={720} y={250} t={pop(f, come - 2)} text={"COME AND\nRULE OVER US!"} size={54} tail={-1} />
          <Longship x={1560} y={GROUND + 70} f={f} k={1.1} flip />
          <Person who="viking" x={1590} ground={GROUND - 20} f={f} s={1.4} armR={-140 + wob(f, 15)} face={FACES.smug} flip />
        </View>
        <YearBadge f={f} at={0} year={862} />
      </AbsoluteFill>
    );
  }
  const options = ["JAPAN?", "ROME?", "CHINA?", "THE OTTOMANS?", "BRITAIN?"];
  const typed = options[Math.floor(Math.max(0, f - which) / 40) % options.length]!;
  const chars = Math.min(typed.length, Math.floor(((f - which) % 40) / 3));
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <rect x={360} y={360} width={1200} height={260} rx={24} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
        <circle cx={460} cy={450} r={46} fill={C.red} stroke={C.ink} strokeWidth={5} />
        <text x={540} y={430} fontFamily="'Segoe UI', Arial" fontWeight={800} fontSize={36} fill="#8E877C">Add a comment…</text>
        <text x={540} y={520} fontFamily="'Segoe UI', Arial" fontWeight={900} fontSize={64} fill={C.ink}>{typed.slice(0, chars)}{Math.floor(f / 12) % 2 ? "|" : ""}</text>
        <T x={960} y={250} size={70} op={pop(f, which)}>WHICH COUNTRY NEXT?</T>
        <T x={960} y={760} size={48} color={C.red} op={pop(f, comments)}>TELL ME IN THE COMMENTS ↓</T>
      </View>
    </AbsoluteFill>
  );
};

export const SCENES4: Record<string, React.FC> = { coldwar: ColdWar, collapse: Collapse, modern: Modern, end: End };
