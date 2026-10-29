import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { View } from "../Hangry2/kit";
import { NameCard } from "../Hangry2/props2";
import { Signpost } from "../Wwgh/props";
import { blendFace, FACES, Person, type Who } from "./cast";
import { C, Counter, GROUND, Ground, Punch, R, T, Tally, TitleCard, YearBadge, ez, glide, mix, pop, shots, span, wob } from "./kit";
import { Boom, Label, MapArrow, MapView, Pin, at, reg } from "./map";
import {
  Bars, Cannon, Chess, Eagle, Fur, Grave, Heart, MoneyBag, Petersburg, Photo, Puff, Ruler, Say, Scissors, Scroll, Ship, StBasil, Swamp, Tag, Wheat, Windmill,
} from "./props";
import { TitleCardInline, useW } from "./scenes1";

/* ─────────────── 6. Ivan the Terrible ─────────────── */

const Terrible: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("terrible");
  const crowned = W("crowned"), y1547 = W("1547"), tsar = W("Tsar,"), caesar = W("Caesar."), conquered = W("conquered"), kazan = W("Kazan"), astrakhan = W("Astrakhan,");
  const built = W("built"), basil = W("Basil's"), beloved = W("beloved"), died = W("died,"), terrible = W("Terrible."), secret = W("secret"), black = W("black,"), dog = W("dog");
  const brooms = W("brooms"), sniff = W("sniff"), traitors = W("traitors"), sweep = W("sweep"), rage = W("rage,"), struck = W("struck"), heir = W("heir"), killed = W("killed");
  const years = W("years"), chess = W("chess.");
  if (f < conquered - 4) {
    const cam = shots(f, [[0, { x: 960, y: 540, s: 1 }], [tsar, { x: 960, y: 470, s: 1.1 }]]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Ground />
          <Person who="ivan" x={700} ground={GROUND} f={f} s={1.8} face={blendFace(FACES.neutral, FACES.smug, ez(f, crowned, crowned + 12))} armR={-30} op={1} />
          <NameCard x={700} y={150} name="IVAN IV" t={pop(f, crowned)} color={C.red} />
          <T x={1320} y={330} size={130} color={C.ink} op={pop(f, caesar - 4)}>CAESAR</T>
          <path d="M1320 360 L1320 470" stroke={C.red} strokeWidth={12} opacity={pop(f, caesar + 4)} />
          <T x={1320} y={600} size={170} color={C.red} op={pop(f, tsar - 2)}>TSAR</T>
        </View>
        <YearBadge f={f} at={y1547 - 4} year={1547} />
      </AbsoluteFill>
    );
  }
  if (f < beloved - 4) {
    if (f < built - 4) {
      const cam = glide(f, [[conquered - 4, at([44, 54], 2.3)]], 30);
      return (
        <AbsoluteFill>
          <MapView cam={cam} year="1530" rivers={["Volga"]}
            regions={[
              reg(1530, "Tsardom of Muscovy", C.red),
              reg(1530, "Kazan Khanate", R.gold), reg(1530, "Astrakhan Khanate", R.gold), reg(1530, "Nogai Horde", "#E9CF7A"),
              reg(1530, "Kazan Khanate", C.red, { t: ez(f, kazan - 4, kazan + 24), from: [49.1, 55.8] }),
              reg(1530, "Astrakhan Khanate", C.red, { t: ez(f, astrakhan - 4, astrakhan + 24), from: [48, 46.35] }),
            ]}>
            <Label p="kazan" s={cam.s} t={pop(f, kazan - 4)} text="KAZAN" />
            <Label p="astrakhan" s={cam.s} t={pop(f, astrakhan - 4)} text="ASTRAKHAN" dy={50} />
            <Label p="moscow" s={cam.s} t={1} text="MOSCOW" />
          </MapView>
          <YearBadge f={f} at={0} year={1552} to={1556} roll={[astrakhan - 6, astrakhan + 6]} />
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill>
        <View x={960} y={500} s={1.05}>
          <Ground />
          <StBasil x={960} ground={GROUND} k={1.2} t={pop(f, built - 4, 14)} />
          {f > basil ? Array.from({ length: 8 }, (_, i) => {
            const u = ((f - basil) / 40 + i / 8) % 1;
            return <circle key={i} cx={300 + (i * 211) % 1300} cy={500 - 300 * u} r={10 + 30 * u} fill="none" stroke={[C.red, R.gold, R.blue][i % 3]} strokeWidth={6} opacity={1 - u} />;
          }) : null}
          <NameCard x={960} y={110} name="SAINT BASIL'S CATHEDRAL" t={pop(f, basil - 4)} color={C.red} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < secret - 4) {
    const dark = ez(f, terrible - 10, terrible + 6);
    const cam = shots(f, [[beloved - 4, { x: 900, y: 520, s: 1.1 }], [terrible, { x: 760, y: 480, s: 1.45 }]], 16);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill="#2A1414" opacity={0.55 * dark} />
          <Ground />
          <Person who="ivan" x={700} ground={GROUND} f={f} s={1.8} armR={-60}
            face={f < terrible - 6 ? blendFace(FACES.happy, FACES.sad, ez(f, died, died + 14), { lookX: 0.8 }) : blendFace(FACES.angry, FACES.angry, 1, { lookX: 0.2 })} />
          <Photo x={1200} y={430} w={240} h={300} t={1} k={1}>
            <Person who="catherine" x={0} ground={160} f={f} s={0.9} face={FACES.happy} />
          </Photo>
          <path d="M1020 250 L1120 250 L1070 320 Z" fill={C.ink} opacity={pop(f, died)} />
          <NameCard x={1200} y={680} name="ANASTASIA" t={span(f, beloved, terrible)} />
          {dark > 0.5 ? <path d={`M${1500} -100 L1420 200 L1500 200 L1400 520`} stroke={R.gold} strokeWidth={14} fill="none" opacity={f % 6 < 3 ? 1 : 0.2} /> : null}
        </View>
        <TitleCard f={f} at={terrible} until={secret} lines={["IVAN THE TERRIBLE"]} />
      </AbsoluteFill>
    );
  }
  if (f < rage - 4) {
    const swept = ez(f, sweep, sweep + 20);
    const cam = shots(f, [[secret - 4, { x: 960, y: 540, s: 1 }], [dog, { x: 700, y: 470, s: 1.3 }], [traitors, { x: 1000, y: 540, s: 1 }]]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill="#2A1414" opacity={0.15} />
          <Ground />
          {[0, 1, 2].map((i) => (
            <Person key={i} who="oprichnik" x={380 + i * 200} ground={GROUND} f={f + i * 7} s={1.5} face={blendFace(FACES.annoyed, FACES.smug, ez(f, sniff, sniff + 10), { lookX: 0.8 })}
              armR={i === 0 && f >= sweep ? -60 - 50 * Math.sin((f - sweep) / 3) : -30} />
          ))}
          <g transform={`translate(${380} ${GROUND - 380})`}>
            <g transform={`scale(${pop(f, dog - 2)})`}>
              <path d={`M-50 -30 Q0 -70 50 -30 L90 ${-10 + 6 * Math.sin(f / 2) * (f > sniff ? 1 : 0)} Q100 20 60 20 L-40 30 Q-70 10 -50 -30 Z`} fill="#3A3A3A" stroke={C.ink} strokeWidth={6} />
              <path d="M-40 -40 L-60 -90 L-14 -54 Z" fill="#3A3A3A" stroke={C.ink} strokeWidth={4} />
              <circle cx={10} cy={-20} r={7} fill="#FFFFFF" />
            </g>
          </g>
          <g transform={`translate(780 ${GROUND - 300}) rotate(${f >= sweep ? -30 + 40 * Math.sin((f - sweep) / 3) : -15}) scale(${pop(f, brooms - 2)})`}>
            <line x1={0} y1={-200} x2={0} y2={40} stroke={R.wood} strokeWidth={12} strokeLinecap="round" />
            <path d="M-50 120 L-24 30 L24 30 L50 120 Z" fill="#D9B86A" stroke={C.ink} strokeWidth={5} />
          </g>
          {[0, 1].map((i) => (
            <g key={i} transform={`rotate(${50 * swept} ${1250 + i * 200} ${GROUND})`}>
              <Person who="boyar" x={1250 + i * 200 + 900 * swept} ground={GROUND} f={f + i * 9} s={1.4} flip op={pop(f, traitors - 6 + i * 4)}
                face={blendFace(FACES.worried, FACES.shocked, ez(f, sweep - 6, sweep + 4), { lookX: -0.8 })} />
            </g>
          ))}
          <NameCard x={600} y={110} name="THE OPRICHNIKI" t={span(f, black - 6, sniff)} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < years - 4) {
    const swing = ez(f, struck, struck + 6);
    const fall = ez(f, struck + 4, struck + 16);
    const flash = f >= struck + 4 && f < struck + 10 ? 1 : 0;
    return (
      <AbsoluteFill>
        <View x={960} y={520} s={1.15}>
          <rect x={-1200} y={-800} width={4400} height={2400} fill="#2A1414" opacity={0.3} />
          <Ground />
          <Person who="ivan" x={700} ground={GROUND} f={f} s={1.8} face={FACES.angry} armR={mix(-170, -60, swing)} lean={8 * swing} />
          <g transform={`rotate(${mix(-160, -40, swing)} 700 ${GROUND - 280})`}><line x1={700} y1={GROUND - 280} x2={700} y2={GROUND - 20} stroke="#4A3220" strokeWidth={14} strokeLinecap="round" /></g>
          <g transform={`rotate(${85 * fall} 1150 ${GROUND})`}>
            <Person who="prince" x={1150} ground={GROUND} f={f} s={1.5} flip face={fall > 0.3 ? { ...FACES.sad, eyeOpen: 0.05 } : FACES.shocked} />
          </g>
          <NameCard x={1150} y={300} name="HIS SON AND HEIR" t={span(f, heir - 4, killed + 30)} />
        </View>
        <AbsoluteFill style={{ background: C.red, opacity: flash * 0.5 }} />
        <Tally f={f} at={killed} until={100000} title="SONS KILLED" n={1} />
      </AbsoluteFill>
    );
  }
  const ko = ez(f, chess - 4, chess + 10);
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1.1}>
        <Ground />
        <Chess x={1050} ground={GROUND} k={1.4} pieces={ez(f, years, chess)} tip={ko} />
        <g transform={`rotate(${-70 * ko} 700 ${GROUND})`}>
          <Person who="ivan" x={700} ground={GROUND} f={f} s={1.6} armR={f < chess ? -80 + wob(f, 15, 3) : -20} ko={ko > 0.5} face={FACES.neutral} />
        </g>
      </View>
      <Tally f={f} at={0} until={100000} title="SONS KILLED" n={1} />
      <Punch f={f} at={chess + 6} until={100000}>CHECKMATE.</Punch>
    </AbsoluteFill>
  );
};

/* ─────────────── 7. Siberia ─────────────── */

const Siberia: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("siberia");
  const merchant = W("merchant"), hired = W("hired"), yermak = W("Yermak"), hundred = W("hundred"), cross = W("cross"), urals = W("Urals.");
  const y1582 = W("1582"), capital = W("capital"), sibir = W("Sibir."), furs = W("furs"), pacific = W("Pacific"), sixty = W("sixty");
  if (f < cross - 4) {
    const hand = ez(f, hired, hired + 16);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="merchant" x={480} ground={GROUND} f={f} s={1.6} face={FACES.smug} armR={-80 * hand} />
          <MoneyBag x={mix(560, 860, hand)} y={GROUND - 260} k={0.6} t={pop(f, merchant)} sign="₽" />
          <Person who="cossack" x={1000} ground={GROUND} f={f} s={1.7} flip face={blendFace(FACES.neutral, FACES.happy, hand, { lookX: -0.7 })} armL={-60} />
          {Array.from({ length: 6 }, (_, i) => (
            <Person key={i} who="cossack" x={1250 + i * 110} ground={GROUND - 30 + (i % 2) * 30} f={f + i * 5} s={0.9} flip op={pop(f, hundred - 4 + i * 2)} face={FACES.happy} />
          ))}
          <NameCard x={1000} y={160} name="YERMAK" t={pop(f, yermak)} color={C.red} />
          <NameCard x={480} y={160} name="THE STROGANOVS" t={span(f, merchant, yermak)} />
        </View>
      </AbsoluteFill>
    );
  }
  const cam = glide(f, [[cross - 4, at([62, 58], 2.6)], [furs, at([108, 60], 0.95)]], 50);
  const east = ez(f, furs - 4, pacific + 30);
  return (
    <AbsoluteFill>
      <MapView cam={cam} year={f < furs ? "1600" : "1700"}
        regions={[
          reg(1600, "Tsardom of Muscovy", C.red),
          ...(f < furs ? [reg(1530, "Khanate of Sibir", R.gold), reg(1530, "Khanate of Sibir", C.red, { t: ez(f, capital, sibir + 20), from: [68.4, 58.1] })] : []),
          reg(1700, "Tsardom of Muscovy", C.red, { t: mix(0.33, 1, east), dir: "x" }),
        ]}>
        <MapArrow a={[56.2, 58]} b="isker" t={ez(f, cross, urals + 20)} s={cam.s} color={C.red} bend={-0.15} />
        <Label p="urals" s={cam.s} t={span(f, urals - 6, furs)} text="URAL MOUNTAINS" dot={false} dy={-80} />
        <Label p="isker" s={cam.s} t={pop(f, capital - 4)} text="SIBIR" dy={50} />
        <Label p="okhotsk" s={cam.s} t={pop(f, pacific)} text="PACIFIC OCEAN" dot dy={-24} />
        {f >= furs ? Array.from({ length: 5 }, (_, i) => {
          const u = ((f - furs) / 70 + i / 5) % 1;
          return <Pin key={i} p={[60 + 85 * u * east, 58 + 3 * Math.sin(i * 2)]} s={cam.s} k={0.4} t={1}><Fur x={0} y={0} /></Pin>;
        }) : null}
      </MapView>
      <YearBadge f={f} at={y1582 - 4} year={1582} to={1639} roll={[furs, pacific + 10]} />
      <Punch f={f} at={sixty - 6} until={100000}>URALS → PACIFIC IN UNDER 60 YEARS</Punch>
    </AbsoluteFill>
  );
};

/* ─────────────── 8. The Time of Troubles ─────────────── */

const Troubles: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("troubles");
  const died = W("died"), seven = W("seven"), over = W("over."), time = W("Time"), famine = W("famine."), man = W("man"), claiming = W("claiming"), youngest = W("youngest");
  const polish = W("Polish"), tsar = W("tsar."), killed = W("killed."), legend = W("Legend"), fired = W("fired"), poland = W("Poland."), second = W("second"), poles = W("Poles"), moscow = W("Moscow.");
  const y1612 = W("1612,"), butcher = W("butcher"), prince = W("prince"), threw = W("threw"), y1613 = W("1613,"), michael = W("Michael"), three = W("three");
  if (f < time - 4) {
    const fallen = ez(f, died, died + 14);
    return (
      <AbsoluteFill>
        <View x={960} y={500} s={1}>
          <line x1={140} y1={500} x2={1780} y2={500} stroke={C.ink} strokeWidth={8} opacity={1 - 0.6 * ez(f, over, over + 10)} />
          {Array.from({ length: 9 }, (_, i) => {
            const last = i === 8;
            return (
              <g key={i} transform={`translate(${200 + i * 190} ${500 + (last ? 400 * fallen * fallen : 0)}) rotate(${last ? 120 * fallen : 0})`} opacity={1 - (last ? 0 : 0.6 * ez(f, over, over + 10))}>
                <circle r={60} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
                <path d="M-32 14 L-34 -22 L-16 -8 L0 -30 L16 -8 L34 -22 L32 14 Z" fill={R.gold} stroke={C.ink} strokeWidth={4} />
              </g>
            );
          })}
          <T x={200} y={640} size={40}>862</T>
          <T x={1720} y={640} size={40} op={1 - fallen}>1598</T>
          <T x={960} y={300} size={70} color={C.red}>RURIK DYNASTY</T>
          <Counter x={960} y={850} f={f} a={seven} b={seven + 30} from={0} to={736} suffix=" YEARS" size={80} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < man - 4) {
    const wilt = ez(f, famine - 10, famine + 20);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1700} fill="#5A5566" opacity={0.25} />
          <Ground />
          <Wheat x0={-100} x1={2000} ground={GROUND} wilt={wilt} />
          {[0, 1, 2].map((i) => <Person key={i} who="serf" x={640 + i * 320} ground={GROUND} f={f + i * 9} s={1.4} face={blendFace(FACES.worried, FACES.sad, wilt)} lean={6 * wilt} headTilt={10 * wilt} op={pop(f, famine - 8)} />)}
        </View>
        <TitleCard f={f} at={time} until={famine - 2} lines={["THE TIME", "OF TROUBLES"]} />
      </AbsoluteFill>
    );
  }
  if (f < legend - 4) {
    const fall = ez(f, killed - 2, killed + 12);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1.05}>
          <Ground />
          <g transform={`rotate(${-80 * fall} 760 ${GROUND})`}>
            <Person who="dmitry" x={mix(-200, 760, ez(f, man - 4, claiming))} ground={GROUND} f={f} s={1.7} walking={f < claiming} face={fall > 0.2 ? { ...FACES.shocked, eyeOpen: 0.05 } : FACES.smug} armR={-140} />
          </g>
          <Say x={420} y={300} t={span(f, claiming, polish)} text={"IT'S ME,\nDMITRY!"} size={56} tail={1} />
          <Grave x={1300} ground={GROUND} k={1} t={pop(f, youngest)} text="DMITRY" />
          <T x={1300} y={GROUND - 60} size={30} op={pop(f, youngest)}>1582 – 1591</T>
          <g opacity={pop(f, polish - 4)}><Flag2 x={1600} f={f} /></g>
          <NameCard x={760} y={120} name="FALSE DMITRY" t={span(f, W("False"), killed + 20)} color={C.red} />
        </View>
        <YearBadge f={f} at={tsar - 4} year={1605} until={legend - 4} />
      </AbsoluteFill>
    );
  }
  if (f < second - 4) {
    const shot = ez(f, fired, poland);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Cannon x={420} ground={GROUND} k={1.6} aim={28} />
          <Boom t={(f - fired) / 14} k={1.4} />
          <Puff x={mix(720, 1500, shot)} y={mix(560, 520, shot) - 380 * Math.sin(Math.PI * shot)} k={0.9} op={f >= fired ? 1 - ez(f, poland + 20, poland + 30) : 0} />
          <Signpost x={1550} y={600} text="POLAND" dir={1} color={R.pink} t={pop(f, legend)} k={1} />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < y1612 - 4) {
    if (f < poles - 4) {
      return (
        <AbsoluteFill>
          <View x={960} y={540} s={1.05}>
            <Ground />
            <Person who="dmitry" x={960} ground={GROUND + 300 * (1 - pop(f, second, 10))} f={f} s={1.8} face={FACES.smug} armR={-150} armL={150} />
            <NameCard x={960} y={140} name="FALSE DMITRY II" t={pop(f, second + 4)} color={C.red} />
          </View>
        </AbsoluteFill>
      );
    }
    const cam = glide(f, [[poles - 4, at([30, 54], 2.6)]], 30);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year="1600" regions={[reg(1600, "Tsardom of Muscovy", C.red), reg(1600, "Poland-Lithuania", R.pink), reg(1600, "Sweden", R.blue, { op: 0.6 })]}>
          <MapArrow a="warsaw" b="moscow" t={ez(f, poles, moscow + 10)} s={cam.s} color={R.pink} w={14} bend={-0.1} />
          <Label p="warsaw" s={cam.s} t={1} text="WARSAW" dy={50} />
          <Label p="moscow" s={cam.s} t={1} text="MOSCOW" dy={50} />
          <Pin p="moscow" s={cam.s} k={0.6} t={pop(f, moscow)} dy={-10}><Flag2 x={0} f={f} k={0.8} ground={0} /></Pin>
        </MapView>
        <YearBadge f={f} at={poles - 4} year={1610} />
      </AbsoluteFill>
    );
  }
  if (f < y1613 - 4) {
    const out = ez(f, threw, threw + 24);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          <Person who="butcher" x={480} ground={GROUND} f={f} s={1.6} face={FACES.angry} armR={-120} op={pop(f, butcher - 4)} />
          <Person who="knight" x={760} ground={GROUND} f={f} s={1.6} face={FACES.angry} armR={-140} op={pop(f, prince - 4)} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`rotate(${200 * out} ${1200 + i * 180} ${GROUND - 150})`}>
              <Person who="knight" x={1200 + i * 180 + 1000 * out} ground={GROUND - 400 * Math.sin(Math.PI * Math.min(out, 0.5))} f={f + i * 7} s={1.3} flip face={FACES.shocked} />
            </g>
          ))}
          <NameCard x={480} y={300} name="MININ, A BUTCHER" t={pop(f, butcher)} />
          <NameCard x={820} y={390} name="PRINCE POZHARSKY" t={pop(f, prince)} />
        </View>
        <YearBadge f={f} at={0} year={1612} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={520} s={1.1}>
        <Ground />
        <Person who="michael" x={760} ground={GROUND} f={f} s={1.5} face={blendFace(FACES.worried, FACES.happy, ez(f, three, three + 20))} armR={-30} />
        <NameCard x={760} y={170} name="MICHAEL ROMANOV, 16" t={pop(f, michael)} color={C.red} />
        <Counter x={1350} y={480} f={f} a={three} b={three + 40} from={0} to={304} size={150} color={C.red} />
        <T x={1350} y={570} size={50} op={pop(f, three + 10)}>YEARS OF ROMANOVS</T>
      </View>
      <YearBadge f={f} at={0} year={1613} />
    </AbsoluteFill>
  );
};

/** Polish flag on a pole (white over red). */
const Flag2: React.FC<{ x: number; f: number; k?: number; ground?: number }> = ({ x, f, k = 1, ground = GROUND }) => (
  <g transform={`translate(${x} ${ground}) scale(${k})`}>
    <line x1={0} y1={0} x2={0} y2={-360} stroke={C.ink} strokeWidth={7} />
    <path d={`M0 -360 q70 ${-8 + 6 * Math.sin(f / 6)} 150 0 l0 50 q-80 ${8 - 6 * Math.sin(f / 6)} -150 0 Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
    <path d={`M0 -310 q70 ${-8 + 6 * Math.sin(f / 6)} 150 0 l0 50 q-80 ${8 - 6 * Math.sin(f / 6)} -150 0 Z`} fill={C.red} stroke={C.ink} strokeWidth={4} />
  </g>
);

/* ─────────────── 9. Peter the Great ─────────────── */

const Peter: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("peter");
  const peter = W("Peter,"), two = W("two"), future = W("future:"), holland = W("Holland."), toured = W("toured"), disguise = W("disguise"), mikhailov = W("Mikhailov,"), nobody = W("nobody,"), tall2 = W("tall", 1);
  const worked = W("worked"), home = W("home,"), cut = W("cut"), beards = W("beards."), tax = W("tax."), sweden = W("Sweden"), twenty = W("twenty-one"), lost = W("lost"), rebuilt = W("rebuilt"), crushed = W("crushed");
  const poltava = W("Poltava."), swamp = W("swamp"), built = W("built"), petersburg = W("Petersburg."), y1721 = W("1721,"), emperor = W("Emperor."), empire = W("empire."), also = W("also");
  const arrested = W("arrested"), died = W("died"), second = W("second"), keep = W("Keep", 1);
  if (f < toured - 4) {
    const cam = shots(f, [[0, { x: 960, y: 520, s: 1 }], [future, { x: 1100, y: 500, s: 1 }]]);
    return (
      <AbsoluteFill>
        <View {...cam}>
          <Ground />
          <Person who="peter" x={640} ground={GROUND} f={f} s={2.25} face={blendFace(FACES.neutral, FACES.happy, ez(f, holland, holland + 10), { lookX: 0.6 })} armR={-30} />
          <Person who="plain" x={900} ground={GROUND} f={f + 9} s={1.45} flip face={blendFace(FACES.neutral, FACES.shocked, ez(f, two, two + 10), { lookX: -0.6, lookY: -0.7 })} />
          <Ruler x={440} ground={GROUND} h={204 * 2.25} t={ez(f, two - 2, two + 14)} label="2 m" />
          <NameCard x={640} y={150} name="PETER I" t={pop(f, peter - 4)} color={C.red} />
          <Windmill x={1450} ground={GROUND} k={1.1} f={f} />
          <g opacity={pop(f, holland - 4)}>{[1250, 1320, 1620, 1700].map((x, i) => <g key={x}><line x1={x} y1={GROUND} x2={x} y2={GROUND - 70} stroke="#4F7A52" strokeWidth={6} /><path d={`M${x - 14} ${GROUND - 70} Q${x} ${GROUND - 110} ${x + 14} ${GROUND - 70} Z`} fill={[C.red, R.gold, R.pink, C.red][i]} stroke={C.ink} strokeWidth={3} /></g>)}</g>
          <rect x={1100} y={-200} width={900} height={GROUND + 196} fill={C.bg} opacity={1 - pop(f, holland - 6, 12)} />
          <Ground />
          <T x={1450} y={180} size={64} color={R.blue} op={pop(f, holland - 2)}>HOLLAND</T>
        </View>
      </AbsoluteFill>
    );
  }
  if (f < worked - 4) {
    const bow = ez(f, nobody, nobody + 14);
    return (
      <AbsoluteFill>
        <View x={960} y={520} s={1}>
          <Ground />
          <Windmill x={1700} ground={GROUND} k={0.8} f={f} />
          <Person who="peterDisguise" x={mix(300, 760, ez(f, toured - 4, disguise + 20))} ground={GROUND} f={f} s={2.25} walking={f < disguise + 20} face={FACES.smug} />
          {[0, 1, 2].map((i) => (
            <Person key={i} who="plain" x={1080 + i * 170} ground={GROUND} f={f + i * 6} s={1.35} flip lean={-22 * bow} headTilt={10 * bow}
              face={blendFace(FACES.confused, FACES.worried, bow, { lookX: -0.7, lookY: -0.6 })} />
          ))}
          <NameCard x={760} y={130} name="“PETER MIKHAILOV”" t={pop(f, mikhailov - 6)} />
          <T x={760} y={200} size={34} op={pop(f, mikhailov + 4)}>(a totally regular guy)</T>
          <Ruler x={530} ground={GROUND} h={204 * 2.25} t={ez(f, tall2 - 10, tall2 + 6)} label="STILL 2 m" />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < sweden - 4) {
    if (f < home - 4) {
      const hit = Math.abs(Math.sin(f / 4));
      return (
        <AbsoluteFill>
          <View x={960} y={520} s={1}>
            <Ground />
            <Ship x={1180} y={GROUND - 60} f={0} k={1.3} flag={R.blue} />
            <Person who="peter" x={560} ground={GROUND} f={f} s={2.1} face={FACES.happy} armR={-90 - 60 * hit} />
            <NameCard x={1180} y={120} name="DUTCH SHIPYARD" t={pop(f, worked)} />
          </View>
        </AbsoluteFill>
      );
    }
    const snip = ez(f, cut, beards + 6);
    return (
      <AbsoluteFill>
        <View x={960} y={520} s={1}>
          <Ground />
          <Person who="peter" x={520} ground={GROUND} f={f} s={2.1} face={blendFace(FACES.smug, FACES.laugh, snip)} armR={-100} />
          <Scissors x={760} y={430} k={1.2} open={f >= cut ? Math.abs(Math.sin((f - cut) / 3)) : 0.4} rot={-10} />
          {[0, 1].map((i) => (
            <Person key={i} who={f < beards + 2 ? "boyar" : "boyarShaved"} x={1150 + i * 250} ground={GROUND} f={f + i * 8} s={1.5} flip
              face={blendFace(FACES.worried, FACES.shocked, snip, { lookX: -0.7 })} />
          ))}
          {f >= beards + 2 ? [0, 1].map((i) => {
            const u = ez(f, beards + 2, beards + 22);
            return <path key={i} d={`M${1150 + i * 250 - 30} ${GROUND - 290 + 280 * u} q30 50 60 0 q-30 -20 -60 0 Z`} fill="#5A3E2B" stroke={C.ink} strokeWidth={4} transform={`rotate(${60 * u} ${1150 + i * 250} ${GROUND - 270 + 280 * u})`} />;
          }) : null}
          <Tag x={1120} y={200} k={1} t={pop(f, tax - 4)} text="BEARD TAX" color="#FFF6D8" />
        </View>
      </AbsoluteFill>
    );
  }
  if (f < y1721 - 4) {
    if (f < swamp - 4) {
      const cam = glide(f, [[sweden - 4, at([26, 59], 2.1)], [crushed, at([31, 54], 1.9)]], 40);
      return (
        <AbsoluteFill>
          <MapView cam={cam} year="1700" regions={[reg(1700, "Tsardom of Muscovy", C.red), reg(1700, "Sweden", R.blue, { t: ez(f, sweden - 6, sweden + 16), from: [18, 59.3] }), reg(1700, "Polish–Lithuanian Commonwealth", R.pink, { op: 0.6 })]}>
            <Label p="narva" s={cam.s} t={pop(f, lost - 4)} text="NARVA 1700" dy={-30} />
            <Pin p="narva" s={cam.s} k={0.8} t={span(f, lost, crushed)}><path d="M-40 -40 L40 40 M40 -40 L-40 40" stroke={C.red} strokeWidth={16} strokeLinecap="round" /></Pin>
            <Pin p="poltava" s={cam.s} k={1} t={1}><Boom t={(f - crushed) / 20} k={1} /></Pin>
            <Label p="poltava" s={cam.s} t={pop(f, poltava - 6)} text="POLTAVA 1709" dy={56} />
            <Label p="stockholm" s={cam.s} t={pop(f, sweden)} text="SWEDEN" dy={-30} color={R.blue} />
            {f >= rebuilt ? Array.from({ length: 6 }, (_, i) => <Pin key={i} p={[36 + (i % 3) * 3, 55 - Math.floor(i / 3) * 2.5]} s={cam.s} k={0.28} t={pop(f, rebuilt + i * 3) * (1 - ez(f, crushed, crushed + 10))}><Person who="soldier" x={0} ground={0} f={f + i * 5} s={1} face={FACES.angry} /></Pin>) : null}
          </MapView>
          <Punch f={f} at={twenty} until={lost + 10}>21 YEARS OF WAR</Punch>
        </AbsoluteFill>
      );
    }
    const rise = ez(f, built, petersburg + 10);
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <rect x={-1200} y={-800} width={4400} height={1640} fill="#DCE8EC" opacity={0.5} />
          <Petersburg x={1000} ground={GROUND} k={1.3} rise={rise} />
          <Swamp y={GROUND} f={f} op={1} />
          <line x1={-1200} y1={GROUND} x2={3200} y2={GROUND} stroke={C.ink} strokeWidth={6} />
          <Person who="peter" x={420} ground={GROUND} f={f} s={1.9} face={blendFace(FACES.confused, FACES.happy, rise)} armR={-60 - 80 * rise} />
          <NameCard x={1000} y={110} name="SAINT PETERSBURG" t={pop(f, petersburg - 6)} color={C.red} />
        </View>
        <YearBadge f={f} at={swamp - 4} year={1703} />
      </AbsoluteFill>
    );
  }
  if (f < also - 4) {
    return (
      <AbsoluteFill>
        <View x={960} y={520} s={1}>
          <Ground />
          <Eagle x={960} y={330} k={1.4} t={pop(f, empire - 6)} />
          <Person who="peter" x={960} ground={GROUND} f={f} s={2} face={FACES.smug} armR={-150} armL={150} />
          <g transform={`translate(960 ${GROUND - 204 * 2 - 30 - 300 * (1 - ez(f, emperor - 10, emperor + 6))})`}>
            <path d="M-50 10 L-52 -40 L-26 -18 L0 -54 L26 -18 L52 -40 L50 10 Z" fill={R.gold} stroke={C.ink} strokeWidth={5} />
          </g>
        </View>
        <YearBadge f={f} at={0} year={1721} />
        <TitleCardInline f={f} at={empire - 2} until={also} text="THE RUSSIAN EMPIRE" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <View x={960} y={520} s={1}>
        <rect x={-1200} y={-800} width={4400} height={2400} fill="#2A1414" opacity={0.2} />
        <Ground />
        <Person who="peter" x={560} ground={GROUND} f={f} s={2.1} face={FACES.angry} armR={-110} />
        <Person who="plain" x={1260} ground={GROUND} f={f} s={1.5} flip op={1 - ez(f, died, died + 20)} face={blendFace(FACES.worried, FACES.sad, ez(f, arrested, arrested + 20), { lookX: -0.6 })} />
        <Bars x={1080} y={GROUND - 420} w={360} h={420} t={pop(f, arrested)} />
        <NameCard x={1260} y={260} name="ALEXEI, HIS SON" t={span(f, also, died + 20)} />
      </View>
      <Tally f={f} at={second - 8} until={100000} title="SONS KILLED" n={2} addAt={second} />
      <Punch f={f} at={keep} until={100000} color={C.red}>KEEP COUNT.</Punch>
    </AbsoluteFill>
  );
};

/* ─────────────── 10. Catherine the Great ─────────────── */

const Catherine: React.FC = () => {
  const f = useCurrentFrame();
  const W = useW("catherine");
  const fast = W("Fast"), obsessed = W("obsessed"), prussia = W("Prussia,"), peace = W("peace"), gave = W("gave"), wife = W("wife,"), german = W("German"), plans = W("plans.");
  const guards = W("guards"), overthrew = W("overthrew"), dead = W("dead,"), colic = W("colic."), great = W("Great."), crimea = W("Crimea,"), austria = W("Austria,");
  const carved = W("carved"), disappeared = W("disappeared"), pugachev = W("Pugachev"), claiming = W("claiming"), career = W("career.");
  if (f < W("She", 1) - 4) {
    const give = ez(f, gave, gave + 24);
    const coup = ez(f, overthrew, overthrew + 14);
    const showGrave = f >= dead - 4;
    return (
      <AbsoluteFill>
        <View x={960} y={540} s={1}>
          <Ground />
          {!showGrave ? (
            <>
              <g transform={`rotate(${-80 * coup} 640 ${GROUND}) translate(${-300 * coup} 0)`}>
                <Person who="peter3" x={640} ground={GROUND} f={f} s={1.7} face={f < wife ? blendFace(FACES.happy, FACES.laugh, ez(f, obsessed, obsessed + 10), { lookX: 0.6 }) : FACES.shocked} armR={-120} />
              </g>
              <Heart x={820} y={360} k={1.1} t={span(f, obsessed, wife)} />
              <T x={820} y={470} size={44} color={R.blue} op={span(f, prussia - 4, wife)}>PRUSSIA</T>
              <Person who="swede" x={1450} ground={GROUND} f={f} s={1.6} flip face={blendFace(FACES.confused, FACES.laugh, give, { lookX: -0.7 })} armL={-60} op={pop(f, peace - 6) * (1 - ez(f, wife - 6, wife))} />
              <path d="M-60 -30 L40 -50 L70 10 L10 50 L-50 30 Z" fill={C.red} stroke={C.ink} strokeWidth={5} transform={`translate(${mix(760, 1340, give)} ${GROUND - 300 - 120 * Math.sin(Math.PI * give)})`} opacity={span(f, gave - 4, wife - 4)} />
              <Person who="catherine" x={mix(1500, 1150, ez(f, wife - 4, german + 10))} ground={GROUND} f={f} s={1.6} flip op={pop(f, wife - 4)} face={blendFace(FACES.neutral, FACES.smug, ez(f, plans, plans + 10), { lookX: -0.6 })} />
              {[0, 1].map((i) => <Person key={i} who="guard" x={1400 + i * 170} ground={GROUND} f={f + i * 6} s={1.4} flip op={pop(f, guards - 4 + i * 4)} face={FACES.annoyed} />)}
              <NameCard x={640} y={140} name="PETER III" t={span(f, fast + 10, wife)} color={R.blue} />
              <NameCard x={1150} y={140} name="HIS WIFE" t={span(f, wife, overthrew)} color={C.red} />
            </>
          ) : (
            <>
              <Grave x={700} ground={GROUND} k={1.4} text="PETER III" />
              <Scroll x={1300} y={420} k={1.15} t={pop(f, W("officially") - 4)} lines={["CAUSE OF DEATH:", "HAEMORRHOIDAL", "COLIC"]} stamp={pop(f, colic + 6)} rot={4} />
            </>
          )}
        </View>
        <YearBadge f={f} at={0} year={1721} to={1762} roll={[fast, fast + 30]} />
        {f < fast + 30 ? <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><g opacity={1 - ez(f, fast + 20, fast + 30)} transform="translate(960 540)"><path d="M-120 -80 L0 0 L-120 80 Z M0 -80 L120 0 L0 80 Z" fill={C.ink} /></g></svg> : null}
      </AbsoluteFill>
    );
  }
  if (f < pugachev - 4) {
    if (f < crimea - 6) {
      return (
        <AbsoluteFill>
          <View x={960} y={520} s={1.05}>
            <Ground />
            <Person who="catherine" x={960} ground={GROUND} f={f} s={1.9} face={FACES.smug} armR={-140} />
          </View>
          <TitleCard f={f} at={great - 6} until={crimea - 6} lines={["CATHERINE THE GREAT"]} />
        </AbsoluteFill>
      );
    }
    const cam = glide(f, [[crimea - 6, at([33, 46], 3)], [austria, at([25, 51], 2.3)]], 40);
    const gone = ez(f, disappeared - 4, disappeared + 20);
    return (
      <AbsoluteFill>
        <MapView cam={cam} year={gone < 0.5 ? "1783" : "1815"}
          regions={[
            reg(1783, "Ottoman Empire", R.green, { op: 0.8 }),
            reg(1783, "Russian Empire", C.red),
            reg(1783, "Prussia", "#5A6A7A", { t: ez(f, W("Prussia", 1) - 4, W("Prussia", 1) + 16), from: [13.4, 52.5], op: 1 - gone }),
            reg(1783, "Austrian Empire", "#C9B458", { t: ez(f, austria - 4, austria + 16), from: [16.4, 48.2], op: 1 - gone }),
            reg(1783, "Poland", R.pink, { op: 1 - gone }),
            reg(1815, "Russian Empire", C.red, { op: gone }),
            reg(1815, "Prussia", "#5A6A7A", { op: gone }),
            reg(1815, "Austrian Empire", "#C9B458", { op: gone }),
          ]}>
          <Pin p="crimea" s={cam.s} k={1} t={span(f, crimea - 4, austria)}><circle r={90 + 10 * Math.sin(f / 4)} fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="16 10" /></Pin>
          <Label p="crimea" s={cam.s} t={span(f, crimea - 2, austria)} text="CRIMEA 1783" dy={130} dot={false} />
          <Label p="warsaw" s={cam.s} t={pop(f, carved - 6) * (1 - gone)} text="POLAND" dy={-30} />
          {[0, 1, 2].map((i) => <Pin key={i} p="warsaw" s={cam.s} k={1} t={span(f, carved, disappeared)}><line x1={0} y1={0} x2={Math.cos(i * 2.1) * 160} y2={Math.sin(i * 2.1) * 160} stroke={C.ink} strokeWidth={8} strokeDasharray="14 10" /></Pin>)}
        </MapView>
        <YearBadge f={f} at={crimea - 6} year={1783} to={1795} roll={[carved, disappeared + 10]} />
        <Punch f={f} at={disappeared + 6} until={100000}>POLAND: DELETED</Punch>
      </AbsoluteFill>
    );
  }
  const fakes: [Who, string, number][] = [["dmitry", "FALSE DMITRY", W("career.") - 20], ["dmitry", "FALSE DMITRY II", W("career.") - 14], ["pugachev", "PUGACHEV", pugachev]];
  return (
    <AbsoluteFill>
      <View x={960} y={540} s={1}>
        <Ground />
        {fakes.map(([who, name, a], i) => (
          <g key={i} opacity={i === 2 ? 1 : pop(f, a)}>
            <Person who={who} x={i === 2 ? mix(1100, 1500, ez(f, career - 24, career - 8)) : 400 + i * 400} ground={GROUND} f={f + i * 8} s={1.6} face={FACES.smug} armR={-130} />
            <NameCard x={i === 2 ? mix(1100, 1500, ez(f, career - 24, career - 8)) : 400 + i * 400} y={170} name={name} t={i === 2 ? pop(f, pugachev) : pop(f, a)} color={C.red} />
          </g>
        ))}
        <Say x={720} y={400} t={span(f, claiming, career - 26)} text={"I AM PETER III!"} size={52} tail={1} />
      </View>
      <Tally f={f} at={career - 16} until={100000} title="FAKE ROYALS" n={3} addAt={career - 6} color={R.blue} />
      <Punch f={f} at={career} until={100000}>CAREER: PROFESSIONAL DEAD ROYAL</Punch>
    </AbsoluteFill>
  );
};

export const SCENES2: Record<string, React.FC> = { terrible: Terrible, siberia: Siberia, troubles: Troubles, peter: Peter, catherine: Catherine };
