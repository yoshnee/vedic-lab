"use client";

/* ============================================================
   PlanetPanel.tsx — one collapsible detail panel per planet, matching the
   Claude Design handoff (planet-panel/). The header icon carries dignity +
   retrograde (same art as the chart). Header pills flag MD/AD-lord and the
   Ascendant Lord (which opens the rising-sign card). Body: placement prose →
   aspect/conjunct chips → combust → yogas → open-ended extraRows (Sade Sati
   timeline). Conjunct/combust rows are hidden when empty.
   ============================================================ */
import { useState } from "react";
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import type { PlanetData, PlanetKey, SadePeriod, Maitri, FunctionalNature, Avastha, ShadbalaScore } from "@/core/types";
import { tierOf, type ShadbalaTier } from "@/core/shadbala";
import type { FlashcardType } from "@/lib/flashcardLink";

const PNAME: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

const MAITRI_LABEL: Record<Maitri, string> = {
  adhi_mitra: "Great Friend", mitra: "Friend", sama: "Neutral",
  shatru: "Enemy", adhi_shatru: "Great Enemy", own_sign: "Own Sign",
};

const FN_LETTER: Record<FunctionalNature, string> = {
  benefic: "B", malefic: "M", neutral: "N", yogakaraka: "Y",
};
const FN_TITLE: Record<FunctionalNature, string> = {
  benefic: "Functional benefic", malefic: "Functional malefic",
  neutral: "Functional neutral", yogakaraka: "Yogakaraka",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

type OpenCard = (type: FlashcardType, id?: string | number) => void;

function FcLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="fc-link"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {children}
    </button>
  );
}

/** Small crescent — opens one way for waxing, mirrored for waning. */
function MoonPhaseGlyph({ waxing }: { waxing: boolean }) {
  return (
    <svg
      className="tithi-glyph"
      width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"
      style={waxing ? undefined : { transform: "scaleX(-1)", transformOrigin: "center" }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
    </svg>
  );
}

function PChip({ pkey, note }: { pkey: PlanetKey; note?: string }) {
  return (
    <span className="pchip" style={{ "--pc": `var(--p-${pkey})` } as React.CSSProperties}>
      <Svg html={body(pkey, 20)} />
      {PNAME[pkey]}
      {note && <em>{note}</em>}
    </span>
  );
}

function SadeCard({ period, moonSign, onOpenCard }: { period: SadePeriod; moonSign: string; onOpenCard: OpenCard }) {
  const status =
    period.status === "current"
      ? `Active · ${period.activePhase !== null ? period.phases[period.activePhase]?.name : "in progress"}`
      : period.status === "past"
        ? `Past · ${period.from} – ${period.to}`
        : `Upcoming · ${period.from} – ${period.to}`;
  const segState = (i: number) => {
    if (period.status === "past") return "done";
    if (period.status === "upcoming") return "pending";
    const a = period.activePhase ?? 0;
    return i < a ? "done" : i === a ? "active" : "pending";
  };
  return (
    <div className="sade-card" data-status={period.status}>
      <div className="sade-top">
        <span className="lbl">{period.from} – {period.to}</span>
        <span className="phase">{status}</span>
      </div>
      <div className="sade-track">
        {period.phases.map((ph, i) => (
          <div key={i} className="sade-seg" data-state={segState(i)}>
            <span className="bar" />
            <span className="cap">{ph.name}</span>
            <span className="cap sub">{ph.from}</span>
          </div>
        ))}
      </div>
      {period.status === "current" && (
        <div className="sade-note">
          Transit Saturn is over your natal Moon in{" "}
          <FcLink onClick={() => onOpenCard("sign", moonSign)}>{moonSign}</FcLink> — derived from
          Saturn’s position over time, not the birth snapshot.
        </div>
      )}
    </div>
  );
}

/* The Avasthas drawer — a planet's "states" grouped in one collapsible,
   subordinate row (collapsed by default; the Baladi state shows inline on the
   header). Renders one tappable row per entry → opens that system's flashcard,
   so the family (Baladi, Jagradadi, Lajjitadi, …) grows from the array alone.
   Empty array (e.g. nodes) → renders nothing. */
function AvasthaDrawer({
  items,
  pkey,
  onOpenCard,
}: {
  items: Avastha[];
  pkey: PlanetKey;
  onOpenCard: OpenCard;
}) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;

  return (
    <div className="pp-ava" data-open={open} style={{ "--pc": `var(--p-${pkey})` } as React.CSSProperties}>
      <button type="button" className="pp-ava-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="lbl">Avasthas</span>
        <svg className="pp-ava-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <div className="pp-ava-body" inert={!open || undefined}>
        <div className="pp-ava-in">
          <ul className="pp-ava-list">
            {items.map((a) => (
              <li key={a.system}>
                <button
                  type="button"
                  className="fc-link pp-ava-row"
                  onClick={(e) => { e.stopPropagation(); onOpenCard(a.flashcard.type, a.flashcard.id); }}
                >
                  <span className="sys">{a.systemLabel}</span>
                  <span className="state">{a.label}</span>
                  {a.sanskrit && <span className="sk">{a.sanskrit}</span>}
                  {a.strength != null && <span className="str">{a.strength}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* The Shadbala drawer — the six-fold strength breakdown, a sibling of the
   Avasthas drawer (same collapsible pattern + classes). Collapsed header shows
   the verdict at a glance (rupas + ratio, strong/weak); expanded, one tappable
   row per bala (virupas) plus total/required rows — every row opens its
   Shadbala deck card. Null (nodes) → renders nothing. */
const SHADBALA_ROWS: { id: string; label: string; get: (s: ShadbalaScore) => number }[] = [
  { id: "sthana", label: "Sthana · positional", get: (s) => s.sthana },
  { id: "dig", label: "Dig · directional", get: (s) => s.dig },
  { id: "kala", label: "Kala · temporal", get: (s) => s.kala },
  { id: "chesta", label: "Cheshta · motional", get: (s) => s.chesta },
  { id: "naisargika", label: "Naisargika · natural", get: (s) => s.naisargika },
  { id: "drik", label: "Drik · aspectual", get: (s) => s.drik },
];

const TIER_LABEL: Record<ShadbalaTier, string> = {
  strong: "Strong", adequate: "Adequate", borderline: "Borderline", weak: "Weak",
};

function ShadbalaDrawer({
  sb,
  pkey,
  onOpenCard,
}: {
  sb: ShadbalaScore | null;
  pkey: PlanetKey;
  onOpenCard: OpenCard;
}) {
  const [open, setOpen] = useState(false);
  if (!sb) return null;
  const strong = sb.ratio >= 1;
  const tier = tierOf(sb);
  const rupas = (sb.total / 60).toFixed(2);

  return (
    <div className="pp-ava" data-open={open} style={{ "--pc": `var(--p-${pkey})` } as React.CSSProperties}>
      <button type="button" className="pp-ava-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="lbl">Shadbala</span>
        <span className="pp-sb-sum" data-tier={tier}>
          {rupas} rupas · {TIER_LABEL[tier]}
        </span>
        <svg className="pp-ava-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <div className="pp-ava-body" inert={!open || undefined}>
        <div className="pp-ava-in">
          <ul className="pp-ava-list">
            {SHADBALA_ROWS.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="fc-link pp-ava-row"
                  onClick={(e) => { e.stopPropagation(); onOpenCard("shadbala", r.id); }}
                >
                  <span className="sys">{r.label}</span>
                  <span className="str">{r.get(sb)}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="fc-link pp-ava-row pp-sb-total"
                onClick={(e) => { e.stopPropagation(); onOpenCard("shadbala", "ishta"); }}
              >
                <span className="sys">Ishta Phala</span>
                <span className="str">{sb.ishta}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fc-link pp-ava-row"
                onClick={(e) => { e.stopPropagation(); onOpenCard("shadbala", "kashta"); }}
              >
                <span className="sys">Kashta Phala</span>
                <span className="str">{sb.kashta}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fc-link pp-ava-row pp-sb-total"
                onClick={(e) => { e.stopPropagation(); onOpenCard("shadbala", "total"); }}
              >
                <span className="sys">Total</span>
                <span className="str">{sb.total} virupas · {rupas} rupas</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fc-link pp-ava-row pp-sb-total"
                onClick={(e) => { e.stopPropagation(); onOpenCard("shadbala", "required"); }}
              >
                <span className="sys">Required</span>
                <span className="str" data-strong={strong || undefined}>{sb.required} · {sb.ratio}× {strong ? "(Bal-Yukta)" : "(Balaheena)"}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PlanetPanel({
  planet,
  ascendantSign,
  defaultOpen = false,
  id,
  onOpenCard,
  onOpenDasha,
  vargaLabel,
}: {
  planet: PlanetData;
  ascendantSign: string;
  defaultOpen?: boolean;
  id?: string;
  onOpenCard: OpenCard;
  onOpenDasha?: () => void;
  /** Set when the panel shows a divisional chart's placements (e.g. "Navāṁśa · D9"):
      hides the nakshatra/pada line — a real-longitude concept the varga doesn't have. */
  vargaLabel?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const p = planet;
  const icon = body(p.key, 46, { state: p.dignity, retro: p.retro });

  return (
    <article className="pp-panel" data-open={open} id={id}>
      <div className="pp-header">
        {/* Full-bleed toggle behind the content. Kept a sibling (not an ancestor)
            of the pills so we never nest <button>s — the pills layer above it and
            capture their own clicks; everything else falls through to this. */}
        <button
          type="button"
          className="pp-header-toggle"
          aria-expanded={open}
          aria-label={`${p.name} details`}
          onClick={() => setOpen((o) => !o)}
        />
        <span className="pp-ico"><Svg html={icon} /></span>
        <span className="pp-id">
          <span className="pp-name">
            <span className="nm">{p.name}</span>
          </span>
          {(p.dasha.length > 0 || p.gandanta || p.maitriToDispositor || p.functionalNature) && (
            <span className="pp-pills">
              {p.functionalNature && (
                <button type="button" className="pp-fn" data-fn={p.functionalNature}
                  title={`${FN_TITLE[p.functionalNature]} for ${ascendantSign} ascendant`}
                  aria-label={`${FN_TITLE[p.functionalNature]} for ${ascendantSign} ascendant`}
                  onClick={(e) => { e.stopPropagation(); onOpenCard("ascendant", ascendantSign); }}>
                  {FN_LETTER[p.functionalNature]}
                </button>
              )}
              {p.dasha.includes("maha") && (
                <button type="button" className="pp-pill" data-kind="maha"
                  onClick={(e) => { e.stopPropagation(); onOpenDasha?.(); }}>Mahādaśā lord</button>
              )}
              {p.dasha.includes("antar") && (
                <button type="button" className="pp-pill" data-kind="antar"
                  onClick={(e) => { e.stopPropagation(); onOpenDasha?.(); }}>Antardaśā lord</button>
              )}
              {/* (The "Ascendant Lord" pill was retired — the ChartRuler card
                  above the panels now owns that identity.) */}
              {p.gandanta && (
                <button type="button" className="pp-pill" data-kind="gandanta"
                  data-deep={p.gandantaDeep || undefined}
                  title={`${p.gandantaDistance.toFixed(2)}° from the water→fire junction${p.gandantaDeep ? " — inside the 28°20′→1°40′ true gandanta zone" : ""}`}
                  onClick={(e) => { e.stopPropagation(); onOpenCard("gandanta"); }}>
                  {p.gandantaDeep ? "True Gandanta" : "Gandanta"}
                </button>
              )}
              {p.maitriToDispositor && (
                <button type="button" className="pp-pill" data-kind="maitri"
                  data-maitri={p.maitriToDispositor}
                  title={p.dispositor
                    ? `Toward its dispositor ${PNAME[p.dispositor]} (lord of ${p.signName})`
                    : "In its own sign — its own dispositor"}
                  onClick={(e) => { e.stopPropagation(); onOpenCard("maitri", "panchadha"); }}>
                  {MAITRI_LABEL[p.maitriToDispositor]}
                </button>
              )}
            </span>
          )}
        </span>
        <svg className="pp-chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </div>

      <div className="pp-body">
        <div className="pp-body-in">
          <div className="pp-body-pad">
            <div className="pp-summary">
              <div className="pp-place">
                {p.rules.length > 0 && (
                  <>
                    Ruler of{" "}
                    {p.rules.map((h, i) => (
                      <span key={h}>
                        {i > 0 && (i === p.rules.length - 1 ? " & " : ", ")}
                        <FcLink onClick={() => onOpenCard("house", h)}>{ordinal(h)}</FcLink>
                      </span>
                    ))}
                    {" "}house <span className="dot">·</span>{" "}
                  </>
                )}
                {p.rules.length > 0 ? "sits in " : "Sits in "}
                <FcLink onClick={() => onOpenCard("house", p.house)}>{ordinal(p.house)}</FcLink> house.
              </div>
              <div className="pp-coords">
                {p.retro && <span className="deg">℞</span>}
                <span className="deg">{p.degree}</span>
                <span>{p.signName}</span>
                {vargaLabel ? (
                  <>
                    <span className="dot">·</span>
                    <span className="mutedp">{vargaLabel}</span>
                  </>
                ) : (
                  <>
                    <span className="dot">·</span>
                    <FcLink onClick={() => onOpenCard("nakshatra", p.nakshatra.name)}>
                      {p.nakshatra.name}
                    </FcLink>
                    <span className="dot">·</span>
                    <FcLink onClick={() => onOpenCard("pada", p.pada)}>
                      pada {p.pada} ({p.purushartha})
                    </FcLink>
                  </>
                )}
              </div>
              {p.key === "moon" && p.tithiNumber != null && (
                <div className="pp-tithi">
                  <MoonPhaseGlyph waxing={!!p.waxing} />
                  <span>
                    {p.waxing ? "Waxing" : "Waning"} Moon <span className="dot">·</span>{" "}
                    {ordinal(p.tithiNumber)} tithi
                  </span>
                </div>
              )}
            </div>

            <div className="pp-rows">
              <div className="pp-row">
                <div className="pp-row-label">Aspected by</div>
                <div className="pp-row-val">
                  {p.aspectedBy.length ? (
                    <span className="pchips">
                      {p.aspectedBy.map((a, i) => <PChip key={i} pkey={a.planet} note={a.aspect} />)}
                    </span>
                  ) : (
                    <span className="none">None</span>
                  )}
                </div>
              </div>

              {p.conjunct.length > 0 && (
                <div className="pp-row">
                  <div className="pp-row-label">Conjunct with</div>
                  <div className="pp-row-val">
                    <span className="pchips">{p.conjunct.map((c, i) => <PChip key={i} pkey={c} />)}</span>
                  </div>
                </div>
              )}

              {p.combust.on && (
                <div className="pp-row">
                  <div className="pp-row-label">Combust</div>
                  <div className="pp-row-val">
                    <span className="state" data-on="true"><i />Yes — combust</span>
                    {p.combust.note && <div className="state-note">{p.combust.note}</div>}
                  </div>
                </div>
              )}

              <div className="pp-row">
                <div className="pp-row-label">Yogas</div>
                <div className="pp-row-val">
                  {p.yogas.length ? (
                    <span className="pchips">
                      {p.yogas.map((y, i) => (
                        <span key={i} className="pchip" style={{ "--pc": "var(--accent)" } as React.CSSProperties}>{y}</span>
                      ))}
                    </span>
                  ) : (
                    <span className="pp-placeholder"><i />Not yet computed</span>
                  )}
                </div>
              </div>

              <ShadbalaDrawer sb={p.shadbala ?? null} pkey={p.key} onOpenCard={onOpenCard} />
              <AvasthaDrawer items={p.avasthas ?? []} pkey={p.key} onOpenCard={onOpenCard} />

              {p.extraRows.map((row) =>
                row.type === "sadesati" ? (
                  <div className="pp-row sade" key={row.id}>
                    <div className="sade-head">
                      <span className="lbl">{row.label}</span>
                      <span className="sk">{row.sanskrit} · 7½-year Saturn cycle over the natal Moon</span>
                    </div>
                    {row.periods.length ? (
                      row.periods.map((period, i) => (
                        <SadeCard key={i} period={period} moonSign={row.moonSign} onOpenCard={onOpenCard} />
                      ))
                    ) : (
                      <div className="sade-note">No Sade Sati within the surrounding decades.</div>
                    )}
                  </div>
                ) : (
                  <div className="pp-row" key={row.id}>
                    <div className="pp-row-label">{row.label}</div>
                    <div className="pp-row-val">{row.content}</div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
