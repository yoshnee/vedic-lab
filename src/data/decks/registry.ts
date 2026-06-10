/* ============================================================
   registry.ts — the central deck registry.

   The flashcards grid renders whatever this ordered array holds, so
   adding a deck = create its data file + add one import + one array
   entry here. No component changes. Available decks come first;
   "coming soon" roadmap tiles trail at the end.
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
import { maitri } from "./maitri";
import { avasthas } from "./avasthas";
import { shadbala } from "./shadbala";
import { karakas } from "./karakas";
import { dashas } from "./dashas";
import { yogas } from "./yogas";

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
  maitri,
  avasthas,
  shadbala,
  // coming soon
  karakas,
  dashas,
  yogas,
];
