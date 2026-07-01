/* Vargas (Divisional Charts) — the Saptavarga set, the seven classical varga
   charts ordered by division number (D1 · D2 · D3 · D7 · D9 · D12 · D30).
   FRONT is Sanskrit-primary (the chart's Sanskrit name as the title, the
   D-number as the mono subtitle), BACK is a plain-text significance blurb.

   These cards are intentionally THIN for now — the backs are prose `body`
   placeholders that will expand into the weighted "wordsmith" Significations
   Cloud later (same path the Houses/Planets backs took), once more study is
   done. Content is owner-provided, verbatim. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const vargas: Deck = {
  id: "vargas",
  title: "Vargas",
  subtitle: "Divisional Charts",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "Rasi",
      sanskrit: "D1",
      icon: { kind: "diamond" },
      body: "The whole life. Body, personality, and overall promise. The foundation every other chart refines.",
    },
    {
      title: "Hora",
      sanskrit: "D2",
      icon: { kind: "diamond" },
      body: "Wealth and resources, financial flow and earning capacity. Unlike other vargas, only the Sun and Moon own signs here. Every planet lands in Leo (Sun's hora) or Cancer (Moon's hora). Read it as a binary, which luminary's hora a planet falls in, not as a 12 house chart.",
    },
    {
      title: "Drekkana",
      sanskrit: "D3",
      icon: { kind: "diamond" },
      body: "Siblings and courage. Co-borns especially younger, drive, initiative, vitality.",
    },
    {
      title: "Saptamsa",
      sanskrit: "D7",
      icon: { kind: "diamond" },
      body: "Children and progeny. Fertility, and the prospects and condition of offspring.",
    },
    {
      title: "Navamsa",
      sanskrit: "D9",
      icon: { kind: "diamond" },
      body: "Spouse, marriage, and dharma. The microscope that confirms or weakens a planet's D1 strength.",
    },
    {
      title: "Dwadasamsa",
      sanskrit: "D12",
      icon: { kind: "diamond" },
      body: "Parents and lineage. Ancestry, inherited traits, the parental line.",
    },
    {
      title: "Trimsamsa",
      sanskrit: "D30",
      icon: { kind: "diamond" },
      body: "Misfortune and adversity. Health vulnerabilities, suffering, inner struggle.",
    },
  ],
};
