/* ============================================================
   flashcard.jsx — single-card popover. When a house or nakshatra
   link in the panel is tapped, the matching flashcard pops to the
   screen (flip to read the meaning). Reuses the app's fc-* card.
   Exposes window.FlashcardPopover.
   ============================================================ */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;

  function Svg({ html, className }) {
    return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  function CardArt({ card }) {
    let html = '';
    const ic = card.icon || {};
    if (ic.kind === 'planet') html = Celestial.body(ic.id, 84, 'neutral');
    else if (ic.kind === 'house') html = Celestial.glyph(String(ic.n), '#E4C257', 84);
    else html = Celestial.diamond(84, { glow: true });
    return <span className="fc-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  function FlashcardPopover({ card, onClose }) {
    const [flipped, setFlipped] = useState(false);
    const cardRef = useRef(null);
    const flip = useCallback(() => setFlipped((f) => !f), []);

    useEffect(() => { if (cardRef.current) cardRef.current.focus(); }, []);
    useEffect(() => {
      function onKey(e) {
        if (e.key === 'Escape') { onClose(); }
        else if (e.key === ' ' || e.key === 'Enter') {
          if (e.target.closest && e.target.closest('.fc-close')) return;
          e.preventDefault(); flip();
        }
      }
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [onClose, flip]);

    if (!card) return null;
    return (
      <div className="fc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="fc-dialog" role="dialog" aria-modal="true" aria-label={card.title + ' flashcard'}>
          <header className="fc-bar">
            <span className="fc-bar-title">
              <Svg html={Celestial.diamond(20, { glow: true })} /> Flashcard
            </span>
            <span className="fc-bar-kind">{card.kind}</span>
            <button className="fc-close" onClick={onClose} aria-label="Close flashcard">✕</button>
          </header>

          <div
            className="fc-cardbtn fc-pop-stack"
            role="button"
            tabIndex={0}
            ref={cardRef}
            aria-pressed={flipped}
            aria-label={card.title + (card.sanskrit ? ', ' + card.sanskrit : '') + '. ' + (flipped ? 'Showing meaning.' : 'Showing term.') + ' Activate to flip.'}
            onClick={flip}
          >
            <div className="fc-card">
              <div className={'fc-inner' + (flipped ? ' is-flipped' : '')}>
                <div className="fc-face fc-front">
                  {card.badge && <span className="fc-badge">{card.badge}</span>}
                  <span className="fc-glow" />
                  <CardArt card={card} />
                  <span className="fc-term">{card.title}</span>
                  {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
                  <span className="fc-hint">Flip ↻</span>
                </div>
                <div className="fc-face fc-back">
                  <div className="fc-back-head">
                    <span className="fc-back-term">{card.title}</span>
                    {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
                  </div>
                  <p className="fc-body">{card.body}</p>
                  {card.badge && <span className="fc-badge fc-badge--back">{card.badge}</span>}
                </div>
              </div>
            </div>
          </div>
          <p className="fc-foot-hint">Tap card to flip · Esc to close</p>
        </div>
      </div>
    );
  }

  window.FlashcardPopover = FlashcardPopover;
})();
