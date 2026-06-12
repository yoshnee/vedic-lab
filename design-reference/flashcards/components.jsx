/* ============================================================
   components.jsx — the reusable flashcard system.
   <FlashApp/> = Landing (deck backs) + Deck overlay (card stack).
   Data-driven: reads window.DECKS. Art from window.Celestial.
   Drop into Next.js by replacing the dangerouslySetInnerHTML SVG
   helpers with the same string output, or importing celestial.js.
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* inline-SVG helper (art comes from celestial.js as markup strings) */
function Svg({ html, className }) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

function CardIcon({ icon, accent, size }) {
  if (!icon) return null;
  let html = '';
  if (icon.kind === 'planet') html = Celestial.body(icon.id, size);
  else if (icon.kind === 'house') html = Celestial.glyph(String(icon.n), accent, size);
  else if (icon.kind === 'diamond') html = Celestial.diamond(size, { glow: true });
  if (!html) return null;
  return <span className="fc-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* -------- a single flashcard (front + back faces) -------- */
function Card({ card, deckAccent, flipped }) {
  const accent = card.accentColor || deckAccent;
  return (
    <div className="fc-card">
      <div className={'fc-inner' + (flipped ? ' is-flipped' : '')} style={{ '--accent': accent }}>
        <div className="fc-face fc-front">
          {card.badge && <span className="fc-badge">{card.badge}</span>}
          <span className="fc-glow" />
          <CardIcon icon={card.icon} accent={accent} size={92} />
          <span className="fc-term">{card.title}</span>
          {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
          <span className="fc-hint">Flip ↻</span>
        </div>
        <div className={'fc-face fc-back' + (card.cloud ? ' fc-back--cloud' : '')}>
          <div className="fc-back-head">
            <span className="fc-back-term">{card.title}</span>
            {card.sanskrit && !card.cloud && <span className="fc-sk">{card.sanskrit}</span>}
          </div>
          {card.cloud && window.SignificationsCloud
            ? React.createElement(window.SignificationsCloud, { data: card.cloud })
            : <p className="fc-body">{card.body}</p>}
          {card.badge && !card.cloud && <span className="fc-badge fc-badge--back">{card.badge}</span>}
        </div>
      </div>
    </div>
  );
}

/* -------- the open deck (modal card stack) -------- */
function Deck({ deck, onClose }) {
  const n = deck.cards.length;
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const dialogRef = useRef(null);
  const cardRef = useRef(null);
  const liveRef = useRef(null);
  const touch = useRef({ x: 0, y: 0, moved: false });

  const go = useCallback((d) => {
    setI((p) => Math.max(0, Math.min(n - 1, p + d)));
    setFlipped(false);
  }, [n]);
  const flip = useCallback(() => setFlipped((f) => !f), []);

  /* keyboard: arrows nav, space/enter flip (unless on a real button), esc close, tab trap */
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); return; }
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        if (e.target.closest && e.target.closest('button')) return; // let buttons activate natively
        e.preventDefault(); flip(); return;
      }
      if (e.key === 'Tab') {
        const f = dialogRef.current.querySelectorAll('button:not([disabled]),[tabindex="0"]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, flip, onClose]);

  /* focus the card on open */
  useEffect(() => { if (cardRef.current) cardRef.current.focus(); }, []);

  /* announce position + face */
  useEffect(() => {
    if (liveRef.current)
      liveRef.current.textContent =
        'Card ' + (i + 1) + ' of ' + n + '. ' + (flipped ? 'Meaning' : 'Term') + ': ' + deck.cards[i].title + '.';
  }, [i, flipped, n, deck]);

  function onTouchStart(e) { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY, moved: false }; }
  function onTouchMove(e) { const t = e.touches[0]; if (Math.abs(t.clientX - touch.current.x) > 10) touch.current.moved = true; }
  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x, dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (!touch.current.moved) flip();
  }

  const card = deck.cards[i];
  const accent = card.accentColor || deck.accent;

  return (
    <div className="fc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fc-dialog" role="dialog" aria-modal="true" aria-label={deck.title + ' flashcards'} ref={dialogRef}>
        <header className="fc-bar">
          <span className="fc-bar-title"><Svg html={Celestial.diamond(22, { glow: true })} /> {deck.title}</span>
          <span className="fc-progress" aria-hidden="true">{String(i + 1).padStart(2, '0')}<span> / {String(n).padStart(2, '0')}</span></span>
          <button className="fc-close" onClick={onClose} aria-label="Close deck">✕</button>
        </header>
        <div className="fc-progbar"><i style={{ width: ((i + 1) / n * 100) + '%', background: accent }} /></div>

        <div className="fc-stage">
          <button className="fc-nav" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous card">‹</button>

          <div className="fc-stack" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <span className="fc-ghost fc-ghost--2" aria-hidden="true" />
            <span className="fc-ghost fc-ghost--1" aria-hidden="true" />
            <div
              className="fc-cardbtn"
              role="button"
              tabIndex={0}
              ref={cardRef}
              aria-pressed={flipped}
              aria-label={card.title + (card.sanskrit ? ', ' + card.sanskrit : '') + '. ' + (flipped ? 'Showing meaning.' : 'Showing term.') + ' Activate to flip.'}
              onClick={flip}
            >
              <Card card={card} deckAccent={deck.accent} flipped={flipped} />
            </div>
          </div>

          <button className="fc-nav" onClick={() => go(1)} disabled={i === n - 1} aria-label="Next card">›</button>
        </div>

        <footer className="fc-foot">
          <button className="fc-mininav" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous card">‹ Prev</button>
          <span className="fc-foot-hint">Tap to flip · ← → to move</span>
          <button className="fc-mininav" onClick={() => go(1)} disabled={i === n - 1} aria-label="Next card">Next ›</button>
        </footer>

        <div className="fc-sr" aria-live="polite" ref={liveRef} />
      </div>
    </div>
  );
}

/* -------- landing: face-down deck backs -------- */
function Landing({ decks, onOpen }) {
  return (
    <div className="fc-landing">
      <header className="fc-landing-head">
        <Svg html={Celestial.diamond(46, { glow: true })} />
        <div>
          <h1>Flashcards</h1>
          <p>Tap a deck to study. Flip each card to reveal its meaning.</p>
        </div>
      </header>
      <div className="fc-decks">
        {decks.map((d) => (
          <button
            key={d.id}
            className="fc-deckback"
            onClick={(e) => onOpen(d, e.currentTarget)}
            aria-label={'Open ' + d.title + ' deck, ' + d.cards.length + ' cards'}
          >
            <span className="fc-deckback-art"><Svg html={Celestial.diamond(120, { glow: true })} /></span>
            <span className="fc-deckback-meta">
              <span className="fc-deckback-kicker">{d.subtitle}</span>
              <span className="fc-deckback-title">{d.title}</span>
              <span className="fc-deckback-count">{d.cards.length} cards</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FlashApp() {
  const [open, setOpen] = useState(null);
  const opener = useRef(null);
  const onOpen = (d, btn) => { opener.current = btn; setOpen(d); };
  const onClose = () => setOpen(null);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open && opener.current) { opener.current.focus(); opener.current = null; }
  }, [open]);
  return (
    <React.Fragment>
      <Landing decks={window.DECKS} onOpen={onOpen} />
      {open && <Deck deck={open} onClose={onClose} />}
    </React.Fragment>
  );
}

/* expose for reuse by the home route */
Object.assign(window, { FCCard: Card, FCDeck: Deck, FCLanding: Landing, FCFlashApp: FlashApp });

/* standalone flashcards page mounts here; home route uses #home-root instead */
if (document.getElementById('root')) {
  ReactDOM.createRoot(document.getElementById('root')).render(<FlashApp />);
}
