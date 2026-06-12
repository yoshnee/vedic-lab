/* ============================================================
   significations.jsx — <SignificationsCloud/>
   Weighted word-cloud back face for house flashcards.

   Data contract (one object per house, on the card as `cloud:`):
     {
       terms : { label, weight }[]     — weight: 'big' | 'medium' | 'small'
     }

   Layout: plain flexbox wrap, centered. Terms are sorted big →
   medium → small so heavy terms gravitate to the top/center band;
   no rotation, no packing — this is a study aid, readability first.
   Sizing of terms is editorial (a memorization aid), not canonical;
   a muted footnote says so.

   Next.js: copy as a client component; styles live in styles.css
   under "SIGNIFICATIONS CLOUD". No deps beyond React.
   ============================================================ */
function SignificationsCloud({ data }) {
  var tier = { big: 0, medium: 1, small: 2 };
  var terms = data.terms.slice().sort(function (a, b) { return tier[a.weight] - tier[b.weight]; });
  return (
    <div className="sig-cloud">
      <div className="sig-terms" role="list" aria-label="Significations, sized by emphasis">
        {terms.map(function (t) {
          return (
            <span key={t.label} role="listitem" className={'sig-term sig-term--' + t.weight}>
              {t.label}
            </span>
          );
        })}
      </div>
      <p
        className="sig-note"
        title="Term sizing reflects editorial emphasis to aid study — it is not a canonical hierarchy."
      >
        sizing is editorial, not canonical
      </p>
    </div>
  );
}

window.SignificationsCloud = SignificationsCloud;
