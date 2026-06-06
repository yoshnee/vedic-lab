/* ============================================================
   home.jsx — the landing (home route).
   App header  →  Birth Chart Analyzer hero  →  Flashcards section.
   Reuses window.FCLanding / window.FCDeck (from components.jsx) and
   window.Celestial. Decks come from window.DECKS (central registry).
   ============================================================ */
const { useState: hUseState, useEffect: hUseEffect, useRef: hUseRef } = React;

function HSvg({ html, className }) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---- app-level identity (distinct from the Flashcards section heading) ---- */
function AppHeader() {
  return (
    <header className="app-header">
      <HSvg className="app-mark" html={Celestial.diamond(60, { glow: true })} />
      <h1 className="app-wordmark">Vedic Astrology Lab</h1>
      <p className="app-tagline">Learn the science of light — chart, study &amp; explore Jyotish</p>
    </header>
  );
}

/* ---- primary tool: prominent, visually distinct from the deck tiles ---- */
function AnalyzerHero({ onOpen }) {
  return (
    <section className="analyzer" aria-labelledby="analyzer-title">
      <button className="analyzer-tile" onClick={onOpen} aria-label="Open the Birth Chart Analyzer — enter birth details">
        <span className="analyzer-copy">
          <span className="analyzer-eyebrow">Primary tool</span>
          <span className="analyzer-title" id="analyzer-title">Birth Chart Analyzer</span>
          <span className="analyzer-desc">Enter a birth date, time and place to generate an interactive North Indian chart — planets, houses, nakshatras and dasha, color-coded and explorable.</span>
          <span className="analyzer-cta">Generate your chart <span aria-hidden="true">→</span></span>
        </span>
        <span className="analyzer-art" aria-hidden="true">
          <HSvg html={Celestial.diamond(220, { glow: true })} />
        </span>
      </button>
    </section>
  );
}

/* ---- stubbed birth-data input modal (engine wired later) ---- */
function BirthDataModal({ onClose }) {
  const ref = hUseRef(null);
  hUseEffect(() => {
    if (ref.current) ref.current.focus();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = ref.current.querySelectorAll('button,input,[tabindex="0"]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="bd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bd-modal" role="dialog" aria-modal="true" aria-labelledby="bd-title" ref={ref} tabIndex={-1}>
        <header className="bd-head">
          <span className="bd-eyebrow"><HSvg html={Celestial.diamond(22, { glow: true })} /> Birth Chart Analyzer</span>
          <button className="bd-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <h2 className="bd-title" id="bd-title">Enter birth details</h2>
        <form className="bd-form" onSubmit={(e) => e.preventDefault()}>
          <label className="bd-field">
            <span>Date of birth</span>
            <input type="date" disabled />
          </label>
          <label className="bd-field">
            <span>Time of birth</span>
            <input type="time" disabled />
          </label>
          <label className="bd-field bd-field--full">
            <span>Place of birth</span>
            <input type="text" placeholder="City, country" disabled />
          </label>
          <button type="submit" className="bd-submit" disabled>Calculate chart</button>
        </form>
        <p className="bd-note">Preview only — the sidereal calculation engine isn’t wired up yet. These inputs will drive the live chart once it’s built.</p>
      </div>
    </div>
  );
}

function HomeApp() {
  const [openDeck, setOpenDeck] = hUseState(null);
  const [analyzer, setAnalyzer] = hUseState(false);
  const opener = hUseRef(null);
  const onOpen = (d, btn) => { opener.current = btn; setOpenDeck(d); };
  const onClose = () => setOpenDeck(null);
  hUseEffect(() => {
    document.body.style.overflow = (openDeck || analyzer) ? 'hidden' : '';
    if (!openDeck && opener.current) { opener.current.focus(); opener.current = null; }
  }, [openDeck, analyzer]);

  return (
    <React.Fragment>
      <AppHeader />
      <main className="home">
        <AnalyzerHero onOpen={() => setAnalyzer(true)} />
        <FCLanding decks={window.DECKS} onOpen={onOpen} />
      </main>
      {openDeck && <FCDeck deck={openDeck} onClose={onClose} />}
      {analyzer && <BirthDataModal onClose={() => setAnalyzer(false)} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('home-root')).render(<HomeApp />);
