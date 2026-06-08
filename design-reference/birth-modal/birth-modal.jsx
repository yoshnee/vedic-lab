/* ============================================================
   birth-modal.jsx — Birth Details modal.
   <BirthModal seed onGenerate/> is the reusable popup. <BirthModalFrame
   theme seed/> wraps it in a themed, dimmed backdrop (for the canvas
   state artboards). <LiveDemo theme/> shows it opening from a landing
   tile and "generating" a chart. Exposes window.{BirthModal,
   BirthModalFrame, LiveDemo}.
   ============================================================ */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const C = window.Celestial;

  /* ---------- tiny inline icons ---------- */
  const I = {
    search: <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="8" cy="8" r="5.2" /><path d="M12 12l3.5 3.5" /></svg>,
    pin: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.6c-2.7 0-4.8 2.1-4.8 4.8 0 3.4 4.8 7.9 4.8 7.9s4.8-4.5 4.8-7.9c0-2.7-2.1-4.8-4.8-4.8z" /><circle cx="8" cy="6.4" r="1.8" /></svg>,
    check: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>,
    checkSm: <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.2l2.6 2.6L10 3" /></svg>,
    arrow: <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h11M10 5l4 4-4 4" /></svg>,
    alert: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="7" cy="7" r="5.7" /><path d="M7 4.3v3.3M7 9.6v.01" /></svg>,
    lock: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="6.2" width="8" height="5.4" rx="1.4" /><path d="M4.7 6.2V4.8a2.3 2.3 0 0 1 4.6 0v1.4" /></svg>,
    back: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 7l4 4" /></svg>,
    x: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" /></svg>,
  };

  function Mk({ size, theme }) {
    const html = theme === 'day'
      ? C.diamond(size, { glow: false, stroke: '#B8923A' })
      : C.diamond(size, { glow: true });
    return <span style={{ display: 'flex' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  function highlight(text, q) {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text;
    return <>{text.slice(0, i)}<b>{text.slice(i, i + q.length)}</b>{text.slice(i + q.length)}</>;
  }

  function searchPlaces(q) {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return window.GEO_PLACES.filter((p) =>
      p.city.toLowerCase().includes(s) ||
      (p.region && p.region.toLowerCase().includes(s)) ||
      p.country.toLowerCase().includes(s)
    ).slice(0, 6);
  }

  /* ============================================================
     BirthModal
     ============================================================ */
  function BirthModal({ seed, theme, onClose, onGenerate }) {
    seed = seed || {};
    const [name, setName] = useState(seed.name || '');
    const [dob, setDob] = useState(seed.dob || '');
    const [tob, setTob] = useState(seed.tob || '');
    const [query, setQuery] = useState(seed.query || '');
    const [place, setPlace] = useState(seed.place || null);
    const [manual, setManual] = useState(!!seed.manual);
    const [manualVals, setManualVals] = useState(seed.manualVals || { label: '', lat: '', lon: '', tz: '' });
    const [searching, setSearching] = useState(!!seed.searching);
    const [focused, setFocused] = useState(!!seed.focused);
    const [showErrors, setShowErrors] = useState(!!seed.showErrors);
    const [touched, setTouched] = useState({});
    const [generating, setGenerating] = useState(false);
    const timer = useRef(null);

    const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));

    const onQuery = (v) => {
      setQuery(v); setPlace(null); setFocused(true);
      clearTimeout(timer.current);
      if (v.trim()) { setSearching(true); timer.current = setTimeout(() => setSearching(false), 600); }
      else setSearching(false);
    };
    const pick = (p) => {
      setPlace(p); setQuery(window.GEO_LABEL(p)); setFocused(false); setSearching(false); setManual(false);
      touch('place');
    };
    const changePlace = () => { setPlace(null); setQuery(''); setFocused(true); setManual(false); };

    const manualValid = manual &&
      manualVals.lat !== '' && manualVals.lon !== '' && manualVals.tz !== '' &&
      Math.abs(+manualVals.lat) <= 90 && Math.abs(+manualVals.lon) <= 180;
    const placeResolved = !!place || manualValid;
    const valid = !!dob && !!tob && placeResolved;

    const results = searchPlaces(query);
    const showResults = focused && !place && !manual && query.trim().length > 0;

    const errDob = (showErrors || touched.dob) && !dob;
    const errTime = (showErrors || touched.tob) && !tob;
    const errPlaceMsg = (() => {
      if (place || manualValid) return null;
      if (!(showErrors || touched.place)) return null;
      if (manual) return 'Enter a valid latitude, longitude & timezone';
      if (query.trim()) return 'Choose a place from the list';
      return 'Enter your place of birth';
    })();

    const submit = () => {
      if (!valid) { setShowErrors(true); return; }
      setGenerating(true);
      const payload = {
        name, dob, tob,
        place: place || { ...manualVals, city: manualVals.label || 'Custom location' },
      };
      setTimeout(() => { if (onGenerate) onGenerate(payload); }, 850);
    };

    useEffect(() => () => clearTimeout(timer.current), []);

    return (
      <div className="bd-modal" role="dialog" aria-modal="true" aria-labelledby="bd-title">
        <header className="bd-head">
          <span className="bd-eyebrow"><Mk size={20} theme={theme} /> Birth Chart Analyzer</span>
          {onClose && <button className="bd-close" onClick={onClose} aria-label="Close">{I.x}</button>}
        </header>
        <h2 className="bd-title" id="bd-title">Enter birth details</h2>
        <p className="bd-sub">A few details to cast your chart. We&rsquo;ll resolve your birthplace to exact coordinates.</p>

        <div className="bd-form">
          {/* NAME */}
          <label className="bd-field">
            <span className="bd-label">Your name <span className="opt">— optional</span></span>
            <input className="bd-input" type="text" value={name} placeholder="For labelling the chart"
              onChange={(e) => setName(e.target.value)} />
          </label>

          {/* DATE + TIME */}
          <div className="bd-row2">
            <label className="bd-field">
              <span className="bd-label">Date of birth</span>
              <input className={'bd-input' + (errDob ? ' is-error' : '')} type="date" value={dob}
                onChange={(e) => setDob(e.target.value)} onBlur={() => touch('dob')} aria-invalid={!!errDob} />
              {errDob && <span className="bd-err">{I.alert} Enter your date of birth</span>}
            </label>
            <label className="bd-field">
              <span className="bd-label">Time of birth</span>
              <input className={'bd-input' + (errTime ? ' is-error' : '')} type="time" value={tob}
                onChange={(e) => setTob(e.target.value)} onBlur={() => touch('tob')} aria-invalid={!!errTime} />
              {errTime && <span className="bd-err">{I.alert} Enter your time of birth</span>}
            </label>
          </div>

          {/* PLACE OF BIRTH */}
          <div className="bd-field bd-place">
            <span className="bd-label">Place of birth</span>

            {place ? (
              <div className="bd-confirmed">
                <span className="mark">{I.check}</span>
                <span className="body">
                  <span className="place">{window.GEO_LABEL(place)}</span>
                  <span className="coords">
                    {window.GEO_FMT(place.lat, place.lon)}<br />
                    <span className="tz">{place.tz} · UTC{place.utc}</span>
                  </span>
                </span>
                <button className="change" onClick={changePlace}>Change</button>
              </div>
            ) : manual ? (
              <div className="bd-manual">
                <div className="bd-manual-head">
                  <span className="t">Manual coordinates</span>
                  <button className="bd-manual-back" onClick={() => setManual(false)}>{I.back} Back to search</button>
                </div>
                <div className="bd-manual-grid">
                  <label className="bd-field bd-field--full">
                    <span className="bd-label">City label <span className="opt">— optional</span></span>
                    <input className="bd-input" type="text" value={manualVals.label} placeholder="e.g. Grandmother's village"
                      onChange={(e) => setManualVals((m) => ({ ...m, label: e.target.value }))} />
                  </label>
                  <label className="bd-field">
                    <span className="bd-label">Latitude</span>
                    <input className={'bd-input' + (errPlaceMsg && manualVals.lat === '' ? ' is-error' : '')} type="text" inputMode="decimal"
                      value={manualVals.lat} placeholder="18.9667" onChange={(e) => setManualVals((m) => ({ ...m, lat: e.target.value }))} onBlur={() => touch('place')} />
                  </label>
                  <label className="bd-field">
                    <span className="bd-label">Longitude</span>
                    <input className={'bd-input' + (errPlaceMsg && manualVals.lon === '' ? ' is-error' : '')} type="text" inputMode="decimal"
                      value={manualVals.lon} placeholder="72.8333" onChange={(e) => setManualVals((m) => ({ ...m, lon: e.target.value }))} onBlur={() => touch('place')} />
                  </label>
                  <label className="bd-field bd-field--full">
                    <span className="bd-label">Timezone</span>
                    <select className="bd-select" value={manualVals.tz} onChange={(e) => setManualVals((m) => ({ ...m, tz: e.target.value }))} onBlur={() => touch('place')}>
                      <option value="">Select a timezone…</option>
                      <option value="Asia/Kolkata">Asia/Kolkata · UTC+05:30</option>
                      <option value="Asia/Kathmandu">Asia/Kathmandu · UTC+05:45</option>
                      <option value="Europe/London">Europe/London · UTC+00:00</option>
                      <option value="America/New_York">America/New_York · UTC−05:00</option>
                      <option value="America/Los_Angeles">America/Los_Angeles · UTC−08:00</option>
                      <option value="Asia/Dubai">Asia/Dubai · UTC+04:00</option>
                    </select>
                  </label>
                </div>
                {errPlaceMsg && <span className="bd-err">{I.alert} {errPlaceMsg}</span>}
              </div>
            ) : (
              <>
                <div className="bd-searchwrap">
                  <span className="lead">{I.search}</span>
                  <input className={'bd-input bd-search' + (errPlaceMsg ? ' is-error' : '')} type="text" value={query}
                    placeholder="Search for your birth city…" autoComplete="off"
                    onChange={(e) => onQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => { touch('place'); }}
                    aria-expanded={showResults} role="combobox" aria-autocomplete="list" />
                  <span className="trail">
                    {searching ? <span className="bd-spin" aria-label="Searching" />
                      : query ? <button className="bd-clear" onClick={() => onQuery('')} aria-label="Clear">{I.x}</button> : null}
                  </span>
                </div>

                {showResults && (
                  <div className="bd-suggest" role="listbox">
                    {searching ? (
                      <div className="bd-sug-status"><span className="bd-spin" /> Searching places…</div>
                    ) : results.length ? results.map((p, i) => (
                      <button key={i} className="bd-sug" role="option" onMouseDown={(e) => { e.preventDefault(); pick(p); }}>
                        <span className="pin">{I.pin}</span>
                        <span className="txt">
                          <span className="city">{highlight(p.city, query)}</span>
                          <span className="region">{[p.region, p.country].filter(Boolean).join(', ')}</span>
                        </span>
                      </button>
                    )) : (
                      <div className="bd-sug-status">No matches for “{query.trim()}”.</div>
                    )}
                  </div>
                )}

                {errPlaceMsg && !showResults && <span className="bd-err" style={{ marginTop: 7 }}>{I.alert} {errPlaceMsg}</span>}

                <button className="bd-manual-link" onMouseDown={(e) => { e.preventDefault(); setManual(true); setFocused(false); }}>
                  {I.pin} Can&rsquo;t find your place? Enter coordinates manually
                </button>
              </>
            )}
          </div>
        </div>

        {/* FOOTER / CTA */}
        <div className="bd-foot">
          <button className="bd-cta" disabled={!valid || generating} onClick={submit}>
            {generating ? <><span className="bd-spin" style={{ borderTopColor: 'currentColor' }} /> Casting chart…</>
              : 'Generate chart'}
          </button>
          {!valid ? (
            <p className="bd-footnote">{I.lock} Add date, time &amp; place to generate your chart.</p>
          ) : (
            <p className="bd-footnote">{I.lock} Computed on your device · nothing leaves this browser.</p>
          )}
        </div>
      </div>
    );
  }

  /* ============================================================
     Themed frame (for canvas state artboards)
     ============================================================ */
  function BirthModalFrame({ theme, seed, onClose, onGenerate }) {
    return (
      <div className="bd-scope" data-theme={theme || 'night'} style={{ background: 'var(--bg)', backgroundImage: 'var(--glow)' }}>
        <div className="bd-backdrop">
          <BirthModal seed={seed} theme={theme} onClose={onClose} onGenerate={onGenerate} />
        </div>
      </div>
    );
  }

  /* ============================================================
     Live in-context demo: landing → modal → "chart" placeholder
     ============================================================ */
  function LiveDemo({ theme }) {
    const [open, setOpen] = useState(true);
    const [chart, setChart] = useState(null);

    return (
      <div className="bd-scope" data-theme={theme || 'night'}>
        <div className="bd-stage">
          <div className="bd-land">
            <span className="mk"><Mk size={56} theme={theme} /></span>
            <h1>Vedic Astrology Lab</h1>
            <p className="tag">Learn the science of light</p>
            <button className="bd-tile" onClick={() => { setChart(null); setOpen(true); }} aria-label="Open Birth Chart Analyzer">
              <span style={{ display: 'block' }}>
                <span className="eyebrow">Primary tool</span>
                <h2>Birth Chart Analyzer</h2>
                <p>Enter a birth date, time and place to generate an interactive North Indian chart — planets, houses, nakshatras and daśā.</p>
                <span className="cta">Generate your chart {I.arrow}</span>
              </span>
              <span className="art"><Mk size={150} theme={theme} /></span>
            </button>
          </div>

          {chart && (
            <div className="bd-land" style={{ position: 'absolute', inset: 0, justifyContent: 'center', background: 'var(--bg)' }}>
              <span className="mk"><Mk size={64} theme={theme} /></span>
              <h1 style={{ fontSize: 30 }}>{chart.name ? chart.name + '’s chart' : 'Your chart'}</h1>
              <p className="tag">Chart landing page · {chart.place.city || chart.place.label}</p>
              <button className="bd-tile" style={{ gridTemplateColumns: '1fr', textAlign: 'center', maxWidth: 360 }} onClick={() => { setOpen(true); }}>
                <span>
                  <span className="eyebrow">Generated</span>
                  <h2 style={{ fontSize: 22 }}>Chart ready</h2>
                  <p style={{ margin: 0 }}>The interactive North Indian chart and planet panels open here. Tap to edit birth details.</p>
                </span>
              </button>
            </div>
          )}
        </div>

        {open && (
          <div className="bd-backdrop">
            <BirthModal theme={theme} onClose={() => setOpen(false)}
              onGenerate={(payload) => { setOpen(false); setChart(payload); }} />
          </div>
        )}
      </div>
    );
  }

  Object.assign(window, { BirthModal, BirthModalFrame, LiveDemo });
})();
