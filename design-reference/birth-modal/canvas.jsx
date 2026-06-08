/* ============================================================
   canvas.jsx — lays out the Birth Details modal: a live, drivable
   version (Night & Day) plus every required state in both themes.
   ============================================================ */
const { BirthModalFrame, LiveDemo } = window;
const P = window.GEO_PLACES;
const find = (city) => P.find((p) => p.city === city);

/* per-state seeds */
const SEEDS = {
  empty: {},
  results: { query: 'New', focused: true, searching: false },
  loading: { query: 'Bengal', focused: true, searching: true },
  confirmed: { place: find('Mumbai') },
  manual: { manual: true, manualVals: { label: 'Pokhara', lat: '28.2096', lon: '83.9856', tz: 'Asia/Kathmandu' } },
  errors: { dob: '', tob: '', query: 'Mumba', showErrors: true },
};

/* artboard heights tuned so no state clips (artboards hide overflow) */
const STATES = [
  ['empty', 'Empty', 'Empty', 600],
  ['results', 'Typing · suggestions', 'Typing — suggestions dropdown', 720],
  ['loading', 'Searching · loading', 'Searching — loading', 660],
  ['confirmed', 'Confirmed place', 'Selected & confirmed (lat / lon / timezone)', 620],
  ['manual', 'Manual entry', 'Manual coordinate entry', 780],
  ['errors', 'Validation errors', 'Validation errors', 680],
];
const AB_W = 520;

/* returns an ARRAY of artboards — inlined directly into DCSection so the
   canvas's child-type walk sees DCArtboard elements (a wrapper component
   would hide them). */
function stateBoards(theme) {
  return STATES.map(([key, label, , h]) => (
    <DCArtboard key={theme + '-' + key} id={theme + '-' + key} label={label} width={AB_W} height={h}>
      <BirthModalFrame theme={theme} seed={SEEDS[key]} onClose={() => {}} />
    </DCArtboard>
  ));
}

function Canvas() {
  return (
    <DesignCanvas>
      <DCSection id="live" title="Live · opens from the landing page"
        subtitle="Click the tile to open the real modal — type a city, fill the fields, watch the CTA enable, then generate.">
        <DCArtboard id="live-night" label="Interactive" width={1000} height={800}>
          <LiveDemo theme="night" />
        </DCArtboard>
      </DCSection>

      <DCSection id="night" title="States"
        subtitle="Every state of the place field and validation — Verdant Night.">
        {stateBoards('night')}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Canvas />);
