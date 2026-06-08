/* ============================================================
   panel.jsx — the reusable Planet Detail Panel.
   <PlanetPanel planet={obj} onOpenCard={fn} defaultOpen /> renders a
   header (icon carries dignity + retrograde; optional daśā pills) and
   an expandable, data-driven stack of body rows. New rows are added by
   pushing descriptors onto planet.extraRows — no layout changes.
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;
const C = window.Celestial;

/* inline-SVG helper */
function Art({ html, className, style }) {
  return <span className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

const PNAME = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter',
  venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' };
const SKNAME = { sun: 'Surya', moon: 'Chandra', mars: 'Mangala', mercury: 'Budha', jupiter: 'Guru',
  venus: 'Shukra', saturn: 'Shani', rahu: 'Rahu', ketu: 'Ketu' };

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* a flashcard link — resolves an id against PANEL_FLASHCARDS and pops it */
function FCLink({ id, children, onOpenCard, className }) {
  const card = window.PANEL_FLASHCARDS[id];
  return (
    <button
      type="button"
      className={'fc-link' + (className ? ' ' + className : '')}
      onClick={(e) => { e.stopPropagation(); if (card) onOpenCard(card); }}
      aria-label={'Open flashcard: ' + (card ? card.title : id)}
    >{children}</button>
  );
}

/* small planet chip for aspect / conjunction lists */
function PChip({ pkey, note }) {
  return (
    <span className="pchip" style={{ '--pc': C.colors[pkey] }}>
      <Art html={C.body(pkey, 20, 'neutral')} />
      {PNAME[pkey]}{note && <em>{note}</em>}
    </span>
  );
}

/* ---------- body row dispatcher ---------- */
function PanelRow({ row, onOpenCard }) {
  if (row.type === 'aspectedBy') {
    return (
      <div className="pp-row">
        <div className="pp-row-label">Aspected by</div>
        <div className="pp-row-val">
          {row.items && row.items.length
            ? <span className="pchips">{row.items.map((a, i) => <PChip key={i} pkey={a.planet} note={a.aspect} />)}</span>
            : <span className="none">None</span>}
        </div>
      </div>
    );
  }
  if (row.type === 'conjunct') {
    return (
      <div className="pp-row">
        <div className="pp-row-label">Conjunct with</div>
        <div className="pp-row-val">
          {row.items && row.items.length
            ? <span className="pchips">{row.items.map((p, i) => <PChip key={i} pkey={p} />)}</span>
            : <span className="none">None</span>}
        </div>
      </div>
    );
  }
  if (row.type === 'combust') {
    const on = !!(row.value && row.value.on);
    return (
      <div className="pp-row">
        <div className="pp-row-label">Combust</div>
        <div className="pp-row-val">
          <span className="state" data-on={on}><i />{on ? 'Yes \u2014 combust' : 'No'}</span>
          {row.value && row.value.note && <div className="state-note">{row.value.note}</div>}
        </div>
      </div>
    );
  }
  if (row.type === 'yogas') {
    return (
      <div className="pp-row">
        <div className="pp-row-label">Yogas</div>
        <div className="pp-row-val">
          {row.items && row.items.length
            ? <span className="pchips">{row.items.map((y, i) => <span key={i} className="pchip" style={{ '--pc': 'var(--accent)' }}>{y}</span>)}</span>
            : <span className="pp-placeholder"><i />Not yet computed</span>}
        </div>
      </div>
    );
  }
  if (row.type === 'sadesati') {
    const note = row.note.replace('{moon}', '');
    return (
      <div className="pp-row sade">
        <div className="sade-card">
          <div className="sade-top">
            <span className="lbl">{row.label}</span>
            <span className="sk">{row.sanskrit}</span>
            <span className="phase">Phase {row.phaseIndex + 1} / {row.phases.length}</span>
          </div>
          <div className="sade-track">
            {row.phases.map((ph, i) => (
              <div key={i} className="sade-seg" data-state={i < row.phaseIndex ? 'done' : i === row.phaseIndex ? 'active' : 'pending'}>
                <span className="bar" />
                <span className="cap">{ph}</span>
              </div>
            ))}
          </div>
          <div className="sade-note">
            Transit Saturn is over your natal Moon in{' '}
            <FCLink id={'house-' + row.moonHouse} onOpenCard={onOpenCard}>{row.moonSign}</FCLink>
            {' '}— the peak (janma) phase of the seven-and-a-half-year cycle. Derived from Saturn’s position over time, not the birth snapshot.
          </div>
        </div>
      </div>
    );
  }
  /* generic fallback row */
  return (
    <div className="pp-row">
      <div className="pp-row-label">{row.label || row.type}</div>
      <div className="pp-row-val">{row.text || ''}</div>
    </div>
  );
}

/* ---------- placement summary (sentence + coords, with links) ---------- */
function Placement({ p, onOpenCard }) {
  return (
    <div className="pp-summary">
      <div className="pp-place">
        Ruler of{' '}
        {p.rules.map((h, i) => (
          <React.Fragment key={h}>
            {i > 0 && (i === p.rules.length - 1 ? ' & ' : ', ')}
            <FCLink id={'house-' + h} onOpenCard={onOpenCard}>{ordinal(h)}</FCLink>
          </React.Fragment>
        ))}
        {' '}house <span className="dot">·</span> sits in{' '}
        <FCLink id={'house-' + p.house} onOpenCard={onOpenCard}>{ordinal(p.house)}</FCLink> house.
      </div>
      <div className="pp-coords">
        {p.retro && <span className="deg">℞</span>}
        <span className="deg">{p.degree}</span>
        <span>{p.sign}</span>
        <span className="dot">·</span>
        <FCLink id={p.nakshatra} onOpenCard={onOpenCard}>
          {window.PANEL_FLASHCARDS[p.nakshatra] ? window.PANEL_FLASHCARDS[p.nakshatra].title : p.nakshatra}
        </FCLink>
      </div>
    </div>
  );
}

/* ---------- the panel ---------- */
function PlanetPanel({ planet, onOpenCard, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const p = planet;
  const rows = [
    { type: 'aspectedBy', items: p.aspectedBy },
    { type: 'conjunct', items: p.conjunct },
    { type: 'combust', value: p.combust },
    { type: 'yogas', items: p.yogas }
  ].concat(p.extraRows || []);

  const pills = (p.dasha || []).map((d) =>
    d === 'maha'
      ? <span key={d} className="pp-pill" data-kind="maha">Mahādaśā lord</span>
      : <span key={d} className="pp-pill" data-kind="antar">Antardaśā lord</span>
  );

  return (
    <article className="pp-panel" data-open={open}>
      <button className="pp-header" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="pp-ico"><Art html={C.body(p.key, 46, p.dignity, p.retro)} /></span>
        <span className="pp-id">
          <span className="pp-name">
            <span className="nm">{p.name}</span>
            <span className="sk">{p.sanskrit}</span>
          </span>
          {pills.length > 0 && <span className="pp-pills">{pills}</span>}
        </span>
        <svg className="pp-chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div className="pp-body">
        <div className="pp-body-in">
          <div className="pp-body-pad">
            <Placement p={p} onOpenCard={onOpenCard} />
            <div className="pp-rows">
              {rows.map((row, i) => <PanelRow key={i} row={row} onOpenCard={onOpenCard} />)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   DAŚĀ DRILL-DOWN — nested current-period overview
   ============================================================ */
const CHILD_KEY = { maha: 'antar', antar: 'pratyantar' };
const NEXT_LABEL = { maha: 'Antarda\u015b\u0101', antar: 'Pratyantarda\u015b\u0101' };

function DashaNode({ node, level }) {
  const childKey = CHILD_KEY[level];
  const children = childKey ? node[childKey] : null;
  const hasChildren = !!(children && children.length);
  const [open, setOpen] = useState(!!node.running);
  const running = !!node.running;

  const rowProps = hasChildren
    ? { as: 'button', onClick: () => setOpen((o) => !o) }
    : { as: 'div' };
  const Row = rowProps.as;

  return (
    <div className="dnode" data-open={open}>
      <Row className="drow" data-running={running} data-static={!hasChildren}
        {...(hasChildren ? { onClick: rowProps.onClick, 'aria-expanded': open } : {})}>
        <span className="dico"><Art html={C.body(node.planet, 22, 'neutral')} /></span>
        <span className="dname">{PNAME[node.planet]}</span>
        <span className="dsk">{SKNAME[node.planet]}</span>
        <span className="ddate">{node.from} – {node.to}</span>
        {running && !hasChildren && <span className="dnow">Now</span>}
        {hasChildren && (
          <svg className="dexp" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        )}
      </Row>
      {hasChildren && (
        <div className="dchild">
          <div className="dchild-in">
            <div className="dlvl">
              <div className="dlvl-label">{NEXT_LABEL[level]}</div>
              {children.map((ch, i) => <DashaNode key={i} node={ch} level={childKey} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashaDrill({ data }) {
  const [open, setOpen] = useState(false);
  const chain = data.running;
  return (
    <section className="dasha" data-open={open}>
      <button className="dasha-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="dasha-head-ico"><Art html={C.diamond(34, { glow: true })} /></span>
        <span className="dasha-head-txt">
          <span className="k">Vimśottarī Daśā · running period</span>
          <span className="crumb">
            {chain.map((pk, i) => (
              <React.Fragment key={pk}>
                {i > 0 && <span className="arr">→</span>}
                <i><Art html={C.body(pk, 19, 'neutral')} />{PNAME[pk]}</i>
              </React.Fragment>
            ))}
          </span>
        </span>
        <svg className="dasha-chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div className="dasha-body">
        <div className="dasha-body-in">
          <div className="dasha-levels">
            <div className="dlvl">
              <div className="dlvl-label">Mahādaśā</div>
              {data.maha.map((node, i) => <DashaNode key={i} node={node} level="maha" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   APP
   ============================================================ */
function App() {
  const [card, setCard] = useState(null);
  const openCard = useCallback((c) => setCard(c), []);
  const closeCard = useCallback(() => setCard(null), []);
  const planets = window.PANEL_PLANETS;

  useEffect(() => { document.body.style.overflow = card ? 'hidden' : ''; }, [card]);

  return (
    <div className="pp-app">
      <header className="pp-pagehead">
        <Art className="mk" html={C.diamond(40, { glow: true })} />
        <div>
          <span className="pp-eyebrow">Birth chart · Lagna in Aries</span>
          <h1>Planet Details</h1>
          <p>Tap a planet to expand. House &amp; nakṣatra links open a flashcard.</p>
        </div>
      </header>

      <DashaDrill data={window.PANEL_DASHA} />

      <div className="pp-listhead">
        <span className="t">The Navagraha</span>
        <span className="n">{planets.length} of 9 shown</span>
      </div>
      <div className="pp-list">
        {planets.map((p, i) => (
          <PlanetPanel key={p.key} planet={p} onOpenCard={openCard} defaultOpen={p.key === 'sun' || p.key === 'saturn'} />
        ))}
      </div>

      {card && window.FlashcardPopover && <window.FlashcardPopover card={card} onClose={closeCard} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
