/* ============================================================
   avastha.ts — planetary "states" (avasthas). A pure labelling layer over
   already-computed placement (degree-in-sign, sign parity, dignity, and the
   *natural* relation to the sign lord). It recomputes no positions.

   Launching with two systems (see the "Planetary States" / Avasthas deck):
     • Baladi    — five 6° "ages" by degree-in-sign. Odd signs run Bala 0–6° →
                   Mrita 24–30°; even signs reverse (Mrita 0–6° → Bala 24–30°).
     • Jagradadi — awake / dreaming / asleep, by dignity, splitting the middle
                   case on the *natural* (naisargika) relation to the sign lord.

   Each entry carries a stable key (`system` / `state`), an English display
   `label` + `systemLabel`, an optional Sanskrit subtitle, and its flashcard
   target — so the panel reads English while the deck keeps the Sanskrit.

   NOTE on strength: the Hora-Prakash reference implements no avastha (verified
   by full-repo grep), so the Baladi numeric `strength` is intentionally OMITTED
   rather than invented. When a sourced value exists, set it here — no contract
   or panel change needed. Add Lajjitadi (etc.) by appending another entry.
   ============================================================ */
import type { Avastha, Dignity } from "./types";

type NaturalRel = "friend" | "neutral" | "enemy" | null;

/** Baladi ages, youngest → oldest: stable key, English label, Sanskrit subtitle. */
const BALADI_AGES: ReadonlyArray<{ state: string; label: string; sanskrit: string }> = [
  { state: "bala", label: "Infant", sanskrit: "Bala" },
  { state: "kumara", label: "Child", sanskrit: "Kumara" },
  { state: "yuva", label: "Adult (prime)", sanskrit: "Yuva" },
  { state: "vriddha", label: "Old", sanskrit: "Vriddha" },
  { state: "mrita", label: "Dead", sanskrit: "Mrita" },
];

/** Baladi avastha from degree-in-sign (0–30) and sign number (1–12). Odd signs run
    youngest→oldest; even signs reverse. (Strength omitted — no Hora Prakash source.) */
function baladi(degreeValue: number, sign: number): Avastha {
  const band = Math.min(4, Math.max(0, Math.floor(degreeValue / 6))); // 0–4, the 6° band
  const odd = sign % 2 === 1; // Aries=1 odd; even signs reverse the order
  const age = BALADI_AGES[odd ? band : 4 - band];
  return {
    system: "baladi",
    systemLabel: "Maturity",
    state: age.state,
    label: age.label,
    sanskrit: age.sanskrit,
    flashcard: { type: "avastha", id: "baladi" },
  };
}

/** Jagradadi avastha. Own / exaltation / mooltrikona → Awake; debilitation or a
    *natural* enemy sign → Asleep; natural friend or neutral sign → Dreaming. */
function jagradadi(dignity: Dignity, inMooltrikona: boolean, naturalToLord: NaturalRel): Avastha {
  let state: string, label: string, sanskrit: string;
  if (dignity === "exalted" || dignity === "own" || inMooltrikona) {
    state = "jagrat"; label = "Awake"; sanskrit = "Jagrat";
  } else if (dignity === "debilitated" || naturalToLord === "enemy") {
    state = "sushupti"; label = "Asleep"; sanskrit = "Sushupti";
  } else {
    state = "swapna"; label = "Dreaming"; sanskrit = "Swapna"; // natural friend / neutral sign
  }
  return {
    system: "jagradadi",
    systemLabel: "Alertness",
    state,
    label,
    sanskrit,
    flashcard: { type: "avastha", id: "jagradadi" },
  };
}

/** Compute the launch set of avasthas for one (non-node) planet. */
export function computeAvasthas(p: {
  degreeValue: number;
  sign: number;
  dignity: Dignity;
  inMooltrikona: boolean;
  naturalToLord: NaturalRel;
}): Avastha[] {
  return [
    baladi(p.degreeValue, p.sign),
    jagradadi(p.dignity, p.inMooltrikona, p.naturalToLord),
  ];
}
