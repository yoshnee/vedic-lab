/* Shadbala — the six sources of planetary strength. Scaffolded:
   the six balas seeded in conventional order, bodies left empty.
   This is a STUDY deck (decoupled from any engine work). Formulas /
   virupa values are computed and must come from the reference repo. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const shadbala: Deck = {
  id: "shadbala",
  title: "Shadbala",
  subtitle: "Six Strengths",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    { title: "Sthana Bala", sanskrit: "Positional", badge: "01", icon: { kind: "diamond" }, body: "" },
    { title: "Dig Bala", sanskrit: "Directional", badge: "02", icon: { kind: "diamond" }, body: "" },
    { title: "Kala Bala", sanskrit: "Temporal", badge: "03", icon: { kind: "diamond" }, body: "" },
    { title: "Cheshta Bala", sanskrit: "Motional", badge: "04", icon: { kind: "diamond" }, body: "" },
    { title: "Naisargika Bala", sanskrit: "Natural", badge: "05", icon: { kind: "diamond" }, body: "" },
    { title: "Drik Bala", sanskrit: "Aspectual", badge: "06", icon: { kind: "diamond" }, body: "" },
  ],
};
