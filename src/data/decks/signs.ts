/* The Twelve Signs — Rāshis. Scaffolded: canonical titles seeded,
   bodies left empty to fill in later. Traditional order Aries → Pisces. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const signs: Deck = {
  id: "signs",
  title: "The Twelve Signs",
  subtitle: "Rashi",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    { title: "Aries", sanskrit: "Mesha", badge: "01", icon: { kind: "diamond" }, body: "" },
    { title: "Taurus", sanskrit: "Vrishabha", badge: "02", icon: { kind: "diamond" }, body: "" },
    { title: "Gemini", sanskrit: "Mithuna", badge: "03", icon: { kind: "diamond" }, body: "" },
    { title: "Cancer", sanskrit: "Karka", badge: "04", icon: { kind: "diamond" }, body: "" },
    { title: "Leo", sanskrit: "Simha", badge: "05", icon: { kind: "diamond" }, body: "" },
    { title: "Virgo", sanskrit: "Kanya", badge: "06", icon: { kind: "diamond" }, body: "" },
    { title: "Libra", sanskrit: "Tula", badge: "07", icon: { kind: "diamond" }, body: "" },
    { title: "Scorpio", sanskrit: "Vrishchika", badge: "08", icon: { kind: "diamond" }, body: "" },
    { title: "Sagittarius", sanskrit: "Dhanu", badge: "09", icon: { kind: "diamond" }, body: "" },
    { title: "Capricorn", sanskrit: "Makara", badge: "10", icon: { kind: "diamond" }, body: "" },
    { title: "Aquarius", sanskrit: "Kumbha", badge: "11", icon: { kind: "diamond" }, body: "" },
    { title: "Pisces", sanskrit: "Meena", badge: "12", icon: { kind: "diamond" }, body: "" },
  ],
};
