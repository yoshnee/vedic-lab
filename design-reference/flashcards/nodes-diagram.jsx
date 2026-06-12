/* ============================================================
   nodes-diagram.jsx — <NodesDiagram/>
   "How Rahu & Ketu Form" — interactive study diagram.

   Teaches four ideas:
     1. The nodes are intersection points, not bodies.
     2. They are always exactly opposite (one axis through Earth).
     3. The Moon crosses them routinely (~every 13.6 days) — nothing happens.
     4. Eclipses only occur when the Earth-shadow axis aligns with
        the nodal axis (eclipse seasons, ~twice a year).

   Geometry: true 3D circles on the celestial sphere, projected
   obliquely. Ecliptic in the z=0 plane; lunar path inclined about
   the node line at longitude Ω. Inclination drawn exaggerated
   (14°) for legibility — true value ≈5.1°.

   Plain SVG + React state, no deps. Playback day persists in
   localStorage. Exposes window.NodesDiagram.
   ============================================================ */
(function () {
  var DEG = Math.PI / 180;
  var YEAR = 365.25;
  var SUN_SPD = 360 / YEAR;          /* deg / day */
  var MOON_SPD = 360 / 27.32;        /* deg / day, sidereal */
  var REGR = -360 / (18.6 * YEAR);   /* nodal regression, deg / day */
  var INCL = 14;                     /* drawn tilt (exaggerated) */
  var S0 = 80, M0 = 150, O0 = 205;   /* starting longitudes */
  var SEASON_GAP = 16, CROSS_GAP = 10, SYZ_GAP = 8;

  function norm(a) { a %= 360; return a < 0 ? a + 360 : a; }
  function angGap(a, b) { var d = Math.abs(norm(a - b)); return d > 180 ? 360 - d : d; }

  /* Point on a unit circle inclined `incl`° about the node line at Ω. */
  function orb(lon, incl, omega) {
    var u = (lon - omega) * DEG, om = omega * DEG;
    var x1 = Math.cos(u), y1 = Math.sin(u) * Math.cos(incl * DEG);
    var z = Math.sin(u) * Math.sin(incl * DEG);
    return {
      x: x1 * Math.cos(om) - y1 * Math.sin(om),
      y: x1 * Math.sin(om) + y1 * Math.cos(om),
      z: z
    };
  }
  /* Oblique projection. Far side (y>0) is up-screen; +z (north) lifts. */
  function proj(p, g) {
    return { X: g.cx + p.x * g.R, Y: g.cy - p.y * g.R * g.SQ - p.z * g.R * g.ZS, d: p.y };
  }
  /* Ring → two SVG path strings split into back/front halves. */
  function ringSegs(incl, omega, g) {
    var back = [], front = [], run = null, runBack = null;
    for (var i = 0; i <= 144; i++) {
      var P = proj(orb(i * 2.5, incl, omega), g);
      var isBack = P.d > 0;
      if (run === null) { run = [P]; runBack = isBack; (isBack ? back : front).push(run); }
      else if (isBack !== runBack) { run.push(P); run = [P]; runBack = isBack; (isBack ? back : front).push(run); }
      else run.push(P);
    }
    function toPath(rs) {
      return rs.map(function (s) {
        return 'M' + s.map(function (p) { return p.X.toFixed(1) + ' ' + p.Y.toFixed(1); }).join('L');
      }).join('');
    }
    return { back: toPath(back), front: toPath(front) };
  }

  var STARS = [[60,40],[150,95],[250,32],[370,60],[520,28],[640,55],[760,90],[820,38],[110,200],[840,210],[70,330],[860,330],[210,470],[480,495],[700,468],[330,30],[590,480],[40,140]];

  function NodesDiagram() {
    var g = { cx: 440, cy: 250, R: 315, SQ: 0.34, ZS: 0.78 };
    var saved = React.useMemo(function () {
      try { return JSON.parse(localStorage.getItem('rk-nodes-v1')) || {}; } catch (e) { return {}; }
    }, []);
    var _d = React.useState(typeof saved.day === 'number' ? saved.day : 0);
    var day = _d[0], setDay = _d[1];
    var _y = React.useState(saved.years || 0);
    var years = _y[0], setYears = _y[1];
    var _p = React.useState(false);
    var playing = _p[0], setPlaying = _p[1];
    var _r = React.useState(!!saved.regress);
    var regress = _r[0], setRegress = _r[1];

    React.useEffect(function () {
      if (!playing) return;
      var raf, last = performance.now();
      var tick = function (now) {
        var dt = Math.min(0.1, (now - last) / 1000); last = now;
        setDay(function (d) {
          var nd = d + dt * 12;
          if (nd >= YEAR) { nd -= YEAR; setYears(function (y) { return y + 1; }); }
          return nd;
        });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return function () { cancelAnimationFrame(raf); };
    }, [playing]);

    /* persist (settles 300ms after the last change, i.e. when paused) */
    React.useEffect(function () {
      var id = setTimeout(function () {
        try { localStorage.setItem('rk-nodes-v1', JSON.stringify({ day: day, years: years, regress: regress })); } catch (e) {}
      }, 300);
      return function () { clearTimeout(id); };
    }, [day, years, regress]);

    var tTot = years * YEAR + day;
    var sunLon = norm(S0 + day * SUN_SPD);
    var moonLon = norm(M0 + tTot * MOON_SPD);
    var omega = norm(O0 + (regress ? REGR * tTot : 0));
    var antiLon = norm(sunLon + 180);

    var gapShadow = Math.min(angGap(antiLon, omega), angGap(antiLon, omega + 180));
    var season = gapShadow < SEASON_GAP;
    var moonNodeGap = Math.min(angGap(moonLon, omega), angGap(moonLon, omega + 180));
    var crossing = moonNodeGap < CROSS_GAP;
    var lunarE = season && angGap(moonLon, antiLon) < SYZ_GAP;
    var solarE = season && angGap(moonLon, sunLon) < SYZ_GAP;

    var st;
    if (lunarE)      st = { k: 'eclipse', dot: '#E2503C', t: 'Lunar eclipse — the full Moon passes through the shadow at the node' };
    else if (solarE) st = { k: 'eclipse', dot: '#F2C230', t: 'Solar eclipse — the new Moon sits on the nodal axis with the Sun' };
    else if (season) st = { k: 'season', dot: '#E4C257', t: 'Eclipse season — the shadow line has swung onto the nodal axis' };
    else if (crossing) st = { k: 'cross', dot: '#C2D2E0', t: 'Moon crossing a node — no eclipse; the shadow points elsewhere' };
    else st = { k: 'idle', dot: '#67806F', t: 'No eclipse — the shadow line is off the nodal axis' };

    var ecl = ringSegs(0, 0, g), lun = ringSegs(INCL, omega, g);
    var sunP = proj(orb(sunLon, 0, 0), g);
    var moonP = proj(orb(moonLon, INCL, omega), g);
    var tipP = proj(orb(antiLon, 0, 0), g);
    var rahuP = proj(orb(omega, 0, 0), g);
    var ketuP = proj(orb(norm(omega + 180), 0, 0), g);
    var hotRahu = angGap(antiLon, omega) <= angGap(antiLon, omega + 180);

    /* shadow cone */
    var dx = tipP.X - g.cx, dy = tipP.Y - g.cy, L = Math.hypot(dx, dy) || 1;
    var px = -dy / L * 13, py = dx / L * 13;
    var cone = (g.cx + px).toFixed(1) + ',' + (g.cy + py).toFixed(1) + ' '
      + tipP.X.toFixed(1) + ',' + tipP.Y.toFixed(1) + ' '
      + (g.cx - px).toFixed(1) + ',' + (g.cy - py).toFixed(1);

    /* ring labels at max separation, on the back half */
    var labLon = Math.sin(norm(omega + 90) * DEG) > 0 ? norm(omega + 90) : norm(omega - 90);
    var lunLab = proj(orb(labLon, INCL, omega), g);
    var eclLab = proj(orb(labLon, 0, 0), g);
    var lunAbove = lunLab.Y < eclLab.Y;

    /* radial label offsets for Sun / Moon */
    function radial(P, dist) {
      var ddx = P.X - g.cx, ddy = P.Y - g.cy, l = Math.hypot(ddx, ddy) || 1;
      return { x: P.X + ddx / l * dist, y: P.Y + ddy / l * dist };
    }
    var sunL = radial(sunP, 34), moonL = radial(moonP, 24);

    function sunMarker() {
      return (
        <g key="sun">
          <circle cx={sunP.X} cy={sunP.Y} r="32" fill="url(#rkSunGlow)"></circle>
          <circle cx={sunP.X} cy={sunP.Y} r="13" fill="url(#rkSunG)"></circle>
          <text className="rk-lab rk-lab--sun" x={sunL.x} y={sunL.y} textAnchor="middle" dy="0.35em">Sun</text>
        </g>
      );
    }
    function moonMarker() {
      return (
        <g key="moon">
          <circle cx={moonP.X} cy={moonP.Y} r="8" fill={lunarE ? '#C2654A' : '#C2D2E0'} stroke="rgba(0,0,0,.4)" strokeWidth="1"></circle>
          <circle cx={moonP.X - 2.4} cy={moonP.Y - 2.4} r="2.6" fill="#fff" opacity="0.45"></circle>
          <text className="rk-lab" x={moonL.x} y={moonL.y} textAnchor="middle" dy="0.35em">Moon</text>
        </g>
      );
    }
    var behindM = [], frontM = [];
    (sunP.d > 0 ? behindM : frontM).push(sunMarker());
    (moonP.d > 0 ? behindM : frontM).push(moonMarker());

    /* node marker art from the shared celestial set (memoized: the
       markup strings carry unique gradient ids) */
    var nodeArt = React.useMemo(function () {
      return window.Celestial
        ? { rahu: window.Celestial.body('rahu', 30), ketu: window.Celestial.body('ketu', 30) }
        : null;
    }, []);

    function nodeMark(P, hot, glyph, name, sub, color) {
      var below = P.d <= 0;
      var art = nodeArt && nodeArt[name.toLowerCase()];
      return (
        <g key={name}>
          {season && hot && <circle className="rk-pulse" cx={P.X} cy={P.Y} r={art ? 17 : 13} fill="none" stroke="#E4C257" strokeWidth="2"></circle>}
          {art
            ? <g transform={'translate(' + (P.X - 15).toFixed(1) + ' ' + (P.Y - 15).toFixed(1) + ')'}
                dangerouslySetInnerHTML={{ __html: art }}></g>
            : <g>
                <circle cx={P.X} cy={P.Y} r="7" fill="#0C1C15" stroke={color} strokeWidth="2"></circle>
                <circle cx={P.X} cy={P.Y} r="2.4" fill={color}></circle>
              </g>}
          <text className="rk-nlab" x={P.X} y={P.Y + (below ? 33 : -37)} textAnchor="middle">{name}</text>
          <text className="rk-nsub" x={P.X} y={P.Y + (below ? 48 : -23)} textAnchor="middle">{sub}</text>
        </g>
      );
    }

    var dayLabel = 'Day ' + String(Math.floor(day) + 1).padStart(3, '0') + ' · Year ' + (years + 1);

    return (
      <div className="rk-wrap">
        <svg className="rk-svg" viewBox="0 0 880 520" role="img"
          aria-label="Diagram of the lunar and solar paths crossing at Rahu and Ketu, with Earth's shadow cone pointing away from the Sun.">
          <defs>
            <radialGradient id="rkSunG" cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#FFF7DE"></stop><stop offset="45%" stopColor="#F2C230"></stop><stop offset="100%" stopColor="#D5851E"></stop>
            </radialGradient>
            <radialGradient id="rkSunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="30%" stopColor="#F2C230" stopOpacity="0.35"></stop><stop offset="100%" stopColor="#F2C230" stopOpacity="0"></stop>
            </radialGradient>
            <radialGradient id="rkEarthG" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#BFE3FF"></stop><stop offset="42%" stopColor="#4D8DD6"></stop><stop offset="100%" stopColor="#1C3A66"></stop>
            </radialGradient>
          </defs>

          {STARS.map(function (s, i) {
            return <circle key={i} cx={s[0]} cy={s[1]} r={i % 3 === 0 ? 1.4 : 0.9} fill="#ECF3EC" opacity="0.16"></circle>;
          })}

          {/* back halves of the rings */}
          <path d={ecl.back} fill="none" stroke="#E4C257" strokeWidth="1.6" opacity="0.3"></path>
          <path d={lun.back} fill="none" stroke="#C2D2E0" strokeWidth="1.6" opacity="0.3"></path>

          {/* the two axes — alignment is the whole lesson */}
          <line x1={rahuP.X} y1={rahuP.Y} x2={ketuP.X} y2={ketuP.Y} stroke="#969CB0"
            strokeWidth="1" strokeDasharray="3 7" opacity={season ? 0.7 : 0.3}></line>
          <line x1={sunP.X} y1={sunP.Y} x2={tipP.X} y2={tipP.Y} stroke="#F2C230"
            strokeWidth="1" strokeDasharray="3 7" opacity={season ? 0.6 : 0.22}></line>

          {behindM}

          {/* Earth's shadow cone — always opposite the Sun */}
          <polygon points={cone}
            fill={season ? 'rgba(228,194,87,0.12)' : 'rgba(5,9,7,0.62)'}
            stroke={season ? 'rgba(228,194,87,0.9)' : 'rgba(166,187,171,0.3)'}
            strokeWidth={season ? 1.6 : 1} strokeLinejoin="round"></polygon>
          <text className="rk-lab" x={g.cx + dx * 0.66 + px * 2.4} y={g.cy + dy * 0.66 + py * 2.4}
            textAnchor="middle" opacity={season ? 1 : 0.75}>{'Earth\u2019s shadow'}</text>

          {/* Earth */}
          <circle cx={g.cx} cy={g.cy} r="19" fill="url(#rkEarthG)"></circle>
          <text className="rk-lab" x={g.cx - dx / L * 30} y={g.cy - dy / L * 30} textAnchor="middle" dy="0.35em">Earth</text>

          {/* front halves of the rings */}
          <path d={ecl.front} fill="none" stroke="#E4C257" strokeWidth="2" opacity="0.85"></path>
          <path d={lun.front} fill="none" stroke="#C2D2E0" strokeWidth="2" opacity="0.85"></path>

          {frontM}

          {nodeMark(rahuP, hotRahu, '\u260A', 'Rahu', 'north node \u00B7 ascending', '#969CB0')}
          {nodeMark(ketuP, !hotRahu, '\u260B', 'Ketu', 'south node \u00B7 descending', '#AC9B79')}

          {/* ring labels at max separation */}
          <text className="rk-lab rk-lab--sun" x={eclLab.X} y={eclLab.Y + (lunAbove ? 22 : -14)} textAnchor="middle">Solar Path — the ecliptic</text>
          <text className="rk-lab" x={lunLab.X} y={lunLab.Y + (lunAbove ? -14 : 22)} textAnchor="middle">{'Lunar Path \u00B7 tilt \u22485\u00B0 (exaggerated)'}</text>
        </svg>

        <div className="rk-status" data-state={st.k}>
          <span className="rk-dot" style={{ background: st.dot, color: st.dot }}></span>
          <span className="rk-pill">{st.t}</span>
          <span className="rk-gap">{'shadow \u2194 node ' + String(Math.round(gapShadow)).padStart(2, '0') + '\u00B0'}</span>
        </div>

        <div className="rk-controls">
          <button className="rk-play" onClick={function () { setPlaying(!playing); }}
            aria-label={playing ? 'Pause the year' : 'Play through the year'}>
            {playing ? '\u275A\u275A' : '\u25B6'}
          </button>
          <input className="rk-range" type="range" min="0" max="365" step="0.25" value={day}
            aria-label="Day of year"
            onChange={function (e) { setDay(parseFloat(e.target.value)); }}></input>
          <span className="rk-day">{dayLabel}</span>
          <label className="rk-toggle">
            <input type="checkbox" checked={regress} onChange={function (e) { setRegress(e.target.checked); }}></input>
            <i></i><span>{'Nodal regression \u00B7 \u224819\u00B0/yr'}</span>
          </label>
          <button className="rk-reset" onClick={function () { setDay(0); setYears(0); setPlaying(false); }}>Reset</button>
        </div>
      </div>
    );
  }

  window.NodesDiagram = NodesDiagram;
})();
