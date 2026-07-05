"use client";

/* ============================================================
   TabbedCardBack.tsx — a reusable tabbed flashcard-back face
   (ported from design-reference: "Tabbed Card Back").

   A row of 2–6 clickable tabs over a content panel. Each panel is a
   small heading of key facts (label → value, an optional color dot),
   a short bullet list, and — where it applies — one tag pill. The
   crown (heading + Sanskrit) is OPTIONAL: the back never repeats the
   front title, so it shows only when the card sets a distinct `backTitle`
   (an answer/theme). Otherwise the back opens straight into the
   intro/tabs. The .fc-back face already supplies the outer card shell,
   so this only lays out the interior. Styles: app.css "TABBED CARD BACK".

   Accessibility (WAI-ARIA tabs pattern): role tablist/tab/tabpanel,
   one active tab at a time, roving tabindex, ←/→ move between tabs.
   Arrow keys and clicks stop propagation so the deck's card-nav /
   flip handlers don't also fire while a tab is focused. Pure UI + a
   little local state; no deps beyond React.
   ============================================================ */
import { useRef, useState, useId, type CSSProperties, type KeyboardEvent } from "react";
import type { CardTab } from "@/data/decks/types";
import { SignificationsCloud } from "./SignificationsCloud";

export function TabbedCardBack({
  title,
  sanskrit,
  intro,
  footnote,
  tabs,
  initialTab = 0,
}: {
  /** The back heading. Pass ONLY a distinct `backTitle` — omit it to skip the
      crown so the back doesn't just repeat the front title. */
  title?: string;
  sanskrit?: string;
  /** An always-visible lede shown above the tab row (stays put as you switch
      tabs) — e.g. a framing note that applies to every facet. */
  intro?: string;
  /** An always-visible footnote pinned below the tab body (stays put as you
      switch tabs) — e.g. a cross-deck pointer. */
  footnote?: string;
  tabs: CardTab[];
  /** Tab to open on (deep-link targets — a chart pill opening its sub-yoga's
      tab). Only honoured on mount / while the same card is pinned; paging to a
      new card resets to tab 0 (see below). */
  initialTab?: number;
}) {
  const [active, setActive] = useState(initialTab);
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);

  // The Deck reuses this component instance as you page between cards (only
  // the `tabs` prop changes), so reset to the first tab whenever a new card's
  // tabs arrive — a new card should open on tab 1, just as it opens unflipped.
  // (React's "adjust state during render on prop change" pattern.)
  const [prevTabs, setPrevTabs] = useState(tabs);
  if (tabs !== prevTabs) {
    setPrevTabs(tabs);
    setActive(0);
  }

  // Guard against a shrinking `tabs` prop leaving `active` out of range.
  const current = Math.min(active, tabs.length - 1);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    // arrows move BETWEEN tabs here — keep the deck's card-nav from firing too.
    // The Deck's keydown listener is a native listener on `document`, the SAME
    // node React delegates events at (Next.js App Router hydrates at document),
    // so stopPropagation (ancestor nodes only) won't reach it — we need
    // stopImmediatePropagation on the native event to stop that same-node listener.
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const next = (i + d + tabs.length) % tabs.length;
    setActive(next);
    // roving tabindex: focus follows selection
    (tablistRef.current?.children[next] as HTMLElement | undefined)?.focus();
  }

  return (
    <>
      {title && (
        <div className="tcard-crown">
          <span className="t">{title}</span>
          {sanskrit && <span className="sk">{sanskrit}</span>}
        </div>
      )}

      {intro && <p className="tcard-intro">{intro}</p>}

      <div
        className="tcard-tabs"
        role="tablist"
        aria-label={title ? `${title} facets` : "Card facets"}
        ref={tablistRef}
      >
        {tabs.map((t, i) => (
          <button
            key={i}
            type="button"
            className="tcard-tab"
            role="tab"
            id={`${baseId}-t${i}`}
            aria-controls={`${baseId}-p${i}`}
            aria-selected={i === current}
            tabIndex={i === current ? 0 : -1}
            // stop the click bubbling to the card button (which would flip the card)
            onClick={(e) => { e.stopPropagation(); setActive(i); }}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tcard-body">
        {tabs.map((t, i) => {
          const hasFacts = !!t.facts?.length;
          const hasHead = hasFacts || !!t.tag;
          return (
            <div
              key={i}
              className="tcard-panel"
              role="tabpanel"
              id={`${baseId}-p${i}`}
              aria-labelledby={`${baseId}-t${i}`}
              hidden={i !== current}
            >
              {hasHead && (
                <div className="tcard-head">
                  {hasFacts && (
                    <div className="tcard-facts">
                      {t.facts!.map((f, k) => (
                        <div className="tcard-fact" key={k}>
                          <span className="k">{f.label}</span>
                          <span className="v">
                            {f.dot && <i style={{ "--dot": f.dot } as CSSProperties} />}
                            {f.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {t.tag && <span className="tcard-tag">{t.tag}</span>}
                </div>
              )}
              {!!t.bullets?.length && (
                <ul className="tcard-bullets">
                  {t.bullets.map((b, k) => <li key={k}>{b}</li>)}
                </ul>
              )}
              {t.cloud && (
                <div className="tcard-cloud">
                  <SignificationsCloud data={t.cloud} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {footnote && <p className="tcard-fn">{footnote}</p>}
    </>
  );
}
