/* ============================================================
   registry.ts — the central deck registry.

   The flashcards grid renders whatever this ordered array holds, so
   adding a deck = create its data file + add one import + one array
   entry here. No component changes. (Every deck is now available —
   future roadmap tiles would trail at the end with status
   "coming-soon".)
   ============================================================ */
import type { Deck } from "./types";
import { planets } from "./planets";
import { houses } from "./houses";
import { signs } from "./signs";
import { nakshatras } from "./nakshatras";
import { padas } from "./padas";
import { gandanta } from "./gandanta";
import { elements } from "./elements";
import { aspects } from "./aspects";
import { combustion } from "./combustion";
import { conjunctions } from "./conjunctions";
import { retrogression } from "./retrogression";
import { rahuKetu } from "./rahuKetu";
import { maitri } from "./maitri";
import { avasthas } from "./avasthas";
import { shadbala } from "./shadbala";
import { karakas } from "./karakas";
import { dashas } from "./dashas";
import { yogas } from "./yogas";
import { planetaryGroupings } from "./planetaryGroupings";

export const DECKS: Deck[] = [
  // available
  planets,
  houses,
  signs,
  nakshatras,
  padas,
  gandanta,
  elements,
  aspects,
  combustion,
  conjunctions,
  retrogression,
  rahuKetu,
  maitri,
  avasthas,
  shadbala,
  yogas,
  karakas,
  dashas,
  // hidden — never on the landing grid (deck.hidden); resolvable via
  // flashcardLink for the /chart page later
  planetaryGroupings,
];
