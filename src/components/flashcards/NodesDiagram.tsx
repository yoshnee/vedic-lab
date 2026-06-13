"use client";

/* ============================================================
   NodesDiagram.tsx — "How Rahu & Ketu Form": the interactive orbital
   diagram for the Rahu & Ketu deck. Ported from the design handoff's
   nodes-diagram.jsx (design-reference/flashcards/) — match its output.

   Teaches four ideas:
     1. The nodes are intersection points, not bodies.
     2. They are always exactly opposite (one axis through Earth).
     3. The Moon crosses them routinely (~every 13.6 days) — nothing happens.
     4. Eclipses only occur when the Earth-shadow axis aligns with
        the nodal axis (eclipse seasons, ~twice a year).

   Geometry: true 3D circles on the celestial sphere, projected obliquely.
   Ecliptic in the z=0 plane; lunar path inclined about the node line at
   longitude Ω. Inclination drawn exaggerated (14°) for legibility — true
   value ≈5.1°. Node markers use the shared celestial body art (Rahu's
   eclipse disc, Ketu's comet); NO ☊/☋ glyphs (owner-directed — they
   appear nowhere in the app). Plain SVG + React state, no deps. Playback
   day persists in localStorage.
   ============================================================ */
import { useState, useEffect, useMemo } from "react";
import { body } from "@/celestial/celestial";

const DEG = Math.PI / 180;
const YEAR = 365.25;
const SUN_SPD = 360 / YEAR; /* deg / day */
const MOON_SPD = 360 / 27.32; /* deg / day, sidereal */
const REGR = -360 / (18.6 * YEAR); /* nodal regression, deg / day */
const INCL = 14; /* drawn tilt (exaggerated) */
const S0 = 80, M0 = 150, O0 = 205; /* starting longitudes */
const SEASON_GAP = 16, CROSS_GAP = 10, SYZ_GAP = 8;

const STORE_KEY = "rk-nodes-v1";

function norm(a: number) { a %= 360; return a < 0 ? a + 360 : a; }
function angGap(a: number, b: number) { const d = Math.abs(norm(a - b)); return d > 180 ? 360 - d : d; }

interface P3 { x: number; y: number; z: number; }
interface P2 { X: number; Y: number; d: number; }
interface Geom { cx: number; cy: number; R: number; SQ: number; ZS: number; }

/** Point on a unit circle inclined `incl`° about the node line at Ω. */
function orb(lon: number, incl: number, omega: number): P3 {
  const u = (lon - omega) * DEG, om = omega * DEG;
  const x1 = Math.cos(u), y1 = Math.sin(u) * Math.cos(incl * DEG);
  const z = Math.sin(u) * Math.sin(incl * DEG);
  return {
    x: x1 * Math.cos(om) - y1 * Math.sin(om),
    y: x1 * Math.sin(om) + y1 * Math.cos(om),
    z,
  };
}
/** Oblique projection. Far side (y>0) is up-screen; +z (north) lifts. */
function proj(p: P3, g: Geom): P2 {
  return { X: g.cx + p.x * g.R, Y: g.cy - p.y * g.R * g.SQ - p.z * g.R * g.ZS, d: p.y };
}
/** Ring → two SVG path strings split into back/front halves. */
function ringSegs(incl: number, omega: number, g: Geom) {
  const back: P2[][] = [], front: P2[][] = [];
  let run: P2[] | null = null, runBack = false;
  for (let i = 0; i <= 144; i++) {
    const P = proj(orb(i * 2.5, incl, omega), g);
    const isBack = P.d > 0;
    if (run === null) { run = [P]; runBack = isBack; (isBack ? back : front).push(run); }
    else if (isBack !== runBack) { run.push(P); run = [P]; runBack = isBack; (isBack ? back : front).push(run); }
    else run.push(P);
  }
  const toPath = (rs: P2[][]) =>
    rs.map((s) => "M" + s.map((p) => p.X.toFixed(1) + " " + p.Y.toFixed(1)).join("L")).join("");
  return { back: toPath(back), front: toPath(front) };
}

const STARS: [number, number][] = [[60,40],[150,95],[250,32],[370,60],[520,28],[640,55],[760,90],[820,38],[110,200],[840,210],[70,330],[860,330],[210,470],[480,495],[700,468],[330,30],[590,480],[40,140]];

interface Saved { day?: number; years?: number; regress?: boolean; }

function loadSaved(): Saved {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "") || {}; } catch { return {}; }
}

export function NodesDiagram({ presetDay }: { presetDay?: number }) {
  const g: Geom = { cx: 440, cy: 250, R: 315, SQ: 0.34, ZS: 0.78 };
  // lazy state initializer (not useMemo) — a one-time mount read of a
  // side-effecting source, which the React Compiler can't memoize
  const [saved] = useState<Saved>(loadSaved);
  // a preset frame (the deck cards' teaching states) wins over the saved
  // playback state — deterministic on open; interaction takes over from there
  const [day, setDay] = useState(presetDay ?? (typeof saved.day === "number" ? saved.day : 0));
  const [years, setYears] = useState(presetDay != null ? 0 : saved.years || 0);
  const [playing, setPlaying] = useState(false);
  const [regress, setRegress] = useState(presetDay != null ? false : !!saved.regress);

  useEffect(() => {
    if (!playing) return;
    let raf: number, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      setDay((d) => {
        let nd = d + dt * 12;
        if (nd >= YEAR) { nd -= YEAR; setYears((y) => y + 1); }
        return nd;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* persist (settles 300ms after the last change, i.e. when paused) */
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify({ day, years, regress })); } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [day, years, regress]);

  const tTot = years * YEAR + day;
  const sunLon = norm(S0 + day * SUN_SPD);
  const moonLon = norm(M0 + tTot * MOON_SPD);
  const omega = norm(O0 + (regress ? REGR * tTot : 0));
  const antiLon = norm(sunLon + 180);

  const gapShadow = Math.min(angGap(antiLon, omega), angGap(antiLon, omega + 180));
  const season = gapShadow < SEASON_GAP;
  const moonNodeGap = Math.min(angGap(moonLon, omega), angGap(moonLon, omega + 180));
  const crossing = moonNodeGap < CROSS_GAP;
  const lunarE = season && angGap(moonLon, antiLon) < SYZ_GAP;
  const solarE = season && angGap(moonLon, sunLon) < SYZ_GAP;

  let st: { k: string; dot: string; t: string };
  if (lunarE)      st = { k: "eclipse", dot: "#E2503C", t: "Lunar eclipse: the full Moon passes through the shadow at the node" };
  else if (solarE) st = { k: "eclipse", dot: "#F2C230", t: "Solar eclipse: the new Moon sits on the nodal axis with the Sun" };
  else if (season) st = { k: "season", dot: "#E4C257", t: "Eclipse season: the shadow line has swung onto the nodal axis" };
  else if (crossing) st = { k: "cross", dot: "#C2D2E0", t: "Moon crossing a node: no eclipse; the shadow points elsewhere" };
  else st = { k: "idle", dot: "#67806F", t: "No eclipse: the shadow line is off the nodal axis" };

  const ecl = ringSegs(0, 0, g), lun = ringSegs(INCL, omega, g);
  const sunP = proj(orb(sunLon, 0, 0), g);
  const moonP = proj(orb(moonLon, INCL, omega), g);
  const tipP = proj(orb(antiLon, 0, 0), g);
  const rahuP = proj(orb(omega, 0, 0), g);
  const ketuP = proj(orb(norm(omega + 180), 0, 0), g);
  const hotRahu = angGap(antiLon, omega) <= angGap(antiLon, omega + 180);

  /* shadow cone */
  const dx = tipP.X - g.cx, dy = tipP.Y - g.cy, L = Math.hypot(dx, dy) || 1;
  const px = (-dy / L) * 13, py = (dx / L) * 13;
  const cone =
    (g.cx + px).toFixed(1) + "," + (g.cy + py).toFixed(1) + " " +
    tipP.X.toFixed(1) + "," + tipP.Y.toFixed(1) + " " +
    (g.cx - px).toFixed(1) + "," + (g.cy - py).toFixed(1);

  /* ring labels at max separation, on the back half */
  const labLon = Math.sin(norm(omega + 90) * DEG) > 0 ? norm(omega + 90) : norm(omega - 90);
  const lunLab = proj(orb(labLon, INCL, omega), g);
  const eclLab = proj(orb(labLon, 0, 0), g);
  const lunAbove = lunLab.Y < eclLab.Y;

  /* radial label offsets for Sun / Moon */
  const radial = (P: P2, dist: number) => {
    const ddx = P.X - g.cx, ddy = P.Y - g.cy, l = Math.hypot(ddx, ddy) || 1;
    return { x: P.X + (ddx / l) * dist, y: P.Y + (ddy / l) * dist };
  };
  const sunL = radial(sunP, 34), moonL = radial(moonP, 24);

  const sunMarker = (
    <g key="sun">
      <circle cx={sunP.X} cy={sunP.Y} r="32" fill="url(#rkSunGlow)" />
      <circle cx={sunP.X} cy={sunP.Y} r="13" fill="url(#rkSunG)" />
      <text className="rk-lab rk-lab--sun" x={sunL.x} y={sunL.y} textAnchor="middle" dy="0.35em">Sun</text>
    </g>
  );
  const moonMarker = (
    <g key="moon">
      <circle cx={moonP.X} cy={moonP.Y} r="8" fill={lunarE ? "#C2654A" : "#C2D2E0"} stroke="rgba(0,0,0,.4)" strokeWidth="1" />
      <circle cx={moonP.X - 2.4} cy={moonP.Y - 2.4} r="2.6" fill="#fff" opacity="0.45" />
      <text className="rk-lab" x={moonL.x} y={moonL.y} textAnchor="middle" dy="0.35em">Moon</text>
    </g>
  );
  const behindM: React.ReactNode[] = [], frontM: React.ReactNode[] = [];
  (sunP.d > 0 ? behindM : frontM).push(sunMarker);
  (moonP.d > 0 ? behindM : frontM).push(moonMarker);

  /* node marker art from the shared celestial set (memoized: the markup
     strings carry unique gradient ids) */
  const nodeArt = useMemo(() => ({ rahu: body("rahu", 30), ketu: body("ketu", 30) }), []);

  const nodeMark = (P: P2, hot: boolean, name: "Rahu" | "Ketu", sub: string) => {
    const below = P.d <= 0;
    const art = nodeArt[name.toLowerCase() as "rahu" | "ketu"];
    return (
      <g key={name}>
        {season && hot && <circle className="rk-pulse" cx={P.X} cy={P.Y} r={17} fill="none" stroke="#E4C257" strokeWidth="2" />}
        <g
          transform={"translate(" + (P.X - 15).toFixed(1) + " " + (P.Y - 15).toFixed(1) + ")"}
          dangerouslySetInnerHTML={{ __html: art }}
        />
        <text className="rk-nlab" x={P.X} y={P.Y + (below ? 33 : -37)} textAnchor="middle">{name}</text>
        <text className="rk-nsub" x={P.X} y={P.Y + (below ? 48 : -23)} textAnchor="middle">{sub}</text>
      </g>
    );
  };

  const dayLabel = "Day " + String(Math.floor(day) + 1).padStart(3, "0") + " · Year " + (years + 1);

  return (
    <div className="rk-wrap">
      <svg className="rk-svg" viewBox="0 0 880 520" role="img"
        aria-label="Diagram of the lunar and solar paths crossing at Rahu and Ketu, with Earth's shadow cone pointing away from the Sun.">
        <defs>
          <radialGradient id="rkSunG" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#FFF7DE" /><stop offset="45%" stopColor="#F2C230" /><stop offset="100%" stopColor="#D5851E" />
          </radialGradient>
          <radialGradient id="rkSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#F2C230" stopOpacity="0.35" /><stop offset="100%" stopColor="#F2C230" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rkEarthG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#BFE3FF" /><stop offset="42%" stopColor="#4D8DD6" /><stop offset="100%" stopColor="#1C3A66" />
          </radialGradient>
        </defs>

        {STARS.map((s, i) => (
          <circle key={i} cx={s[0]} cy={s[1]} r={i % 3 === 0 ? 1.4 : 0.9} fill="#ECF3EC" opacity="0.16" />
        ))}

        {/* back halves of the rings */}
        <path d={ecl.back} fill="none" stroke="#E4C257" strokeWidth="1.6" opacity="0.3" />
        <path d={lun.back} fill="none" stroke="#C2D2E0" strokeWidth="1.6" opacity="0.3" />

        {/* the two axes — alignment is the whole lesson */}
        <line x1={rahuP.X} y1={rahuP.Y} x2={ketuP.X} y2={ketuP.Y} stroke="#969CB0"
          strokeWidth="1" strokeDasharray="3 7" opacity={season ? 0.7 : 0.3} />
        <line x1={sunP.X} y1={sunP.Y} x2={tipP.X} y2={tipP.Y} stroke="#F2C230"
          strokeWidth="1" strokeDasharray="3 7" opacity={season ? 0.6 : 0.22} />

        {behindM}

        {/* Earth's shadow cone — always opposite the Sun */}
        <polygon points={cone}
          fill={season ? "rgba(228,194,87,0.12)" : "rgba(5,9,7,0.62)"}
          stroke={season ? "rgba(228,194,87,0.9)" : "rgba(166,187,171,0.3)"}
          strokeWidth={season ? 1.6 : 1} strokeLinejoin="round" />
        <text className="rk-lab" x={g.cx + dx * 0.66 + px * 2.4} y={g.cy + dy * 0.66 + py * 2.4}
          textAnchor="middle" opacity={season ? 1 : 0.75}>{"Earth’s shadow"}</text>

        {/* Earth */}
        <circle cx={g.cx} cy={g.cy} r="19" fill="url(#rkEarthG)" />
        <text className="rk-lab" x={g.cx - (dx / L) * 30} y={g.cy - (dy / L) * 30} textAnchor="middle" dy="0.35em">Earth</text>

        {/* front halves of the rings */}
        <path d={ecl.front} fill="none" stroke="#E4C257" strokeWidth="2" opacity="0.85" />
        <path d={lun.front} fill="none" stroke="#C2D2E0" strokeWidth="2" opacity="0.85" />

        {frontM}

        {nodeMark(rahuP, hotRahu, "Rahu", "north node · ascending")}
        {nodeMark(ketuP, !hotRahu, "Ketu", "south node · descending")}

        {/* ring labels at max separation */}
        <text className="rk-lab rk-lab--sun" x={eclLab.X} y={eclLab.Y + (lunAbove ? 22 : -14)} textAnchor="middle">Solar Path · the ecliptic</text>
        <text className="rk-lab" x={lunLab.X} y={lunLab.Y + (lunAbove ? -14 : 22)} textAnchor="middle">{"Lunar Path · tilt ≈5° (exaggerated)"}</text>
      </svg>

      <div className="rk-status" data-state={st.k}>
        <span className="rk-dot" style={{ background: st.dot, color: st.dot }} />
        <span className="rk-pill">{st.t}</span>
        <span className="rk-gap">{"shadow ↔ node " + String(Math.round(gapShadow)).padStart(2, "0") + "°"}</span>
      </div>

      <div className="rk-controls">
        <button type="button" className="rk-play" onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause the year" : "Play through the year"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <input className="rk-range" type="range" min="0" max="365" step="0.25" value={day}
          aria-label="Day of year"
          onChange={(e) => setDay(parseFloat(e.target.value))} />
        <span className="rk-day">{dayLabel}</span>
        <label className="rk-toggle">
          <input type="checkbox" checked={regress} onChange={(e) => setRegress(e.target.checked)} />
          <i /><span>{"Nodal regression · ≈19°/yr"}</span>
        </label>
        <button type="button" className="rk-reset" onClick={() => { setDay(0); setYears(0); setPlaying(false); }}>Reset</button>
      </div>
    </div>
  );
}
