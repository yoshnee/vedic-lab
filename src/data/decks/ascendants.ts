/* The Ascendant (Lagna). The concept arc split out of the former
   "Ascendants & Zodiacs" deck (from ascendant_lagna_reference.md): what the
   Lagna is, how to read a rising sign, and the general nature of house lords.
   The twelve rising signs themselves now live in the Zodiacs deck (zodiacs.ts);
   the chart page's ascendant links resolve there. Concept cards use the
   chart / chart-diamond mark. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const ascendants: Deck = {
  id: "ascendants",
  title: "The Ascendant",
  subtitle: "Lagna",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "The Ascendant",
      sanskrit: "Lagna",
      icon: { kind: "chart", house: 1 },
      body: "",
      points: [
        "The zodiac sign rising on the eastern horizon at the exact moment of birth",
        "The filter through which all of life is experienced — it sets the tone for how every planetary energy unfolds",
        "Physical traits — body type, appearance, posture, natural mannerisms",
        "Personality — how you think, feel, and react",
        "Perception — the outlook and “color” you bring to life",
        "Natural strengths, talents, and aptitudes",
        "Vulnerabilities and recurring patterns",
        "Baseline health and vitality",
        "Your outward personality — a social mask and aura that shapes first impressions",
        "Points to the qualities you are meant to develop and refine over time",
      ],
    },
    {
      title: "Reading the Rising Sign",
      sanskrit: "Polarity · Quality · Element",
      icon: { kind: "diamond" },
      body: "",
      points: [
        "Every sign sorts by three filters: polarity, quality, and element",
        "Polarity — odd/male signs are active; even/female signs are receptive",
        "Quality (modality) — Movable (Chara) signs are the place of action",
        "Fixed (Sthira) signs are fixed in nature, with qualities of determination and stability",
        "Dual (Dvisvabhava) signs are changeable in nature and adaptable",
        "Element — Fire is aspirational & creative; Earth stable & grounded; Air mental & communicative; Water sensitive & intuitive",
      ],
    },
    {
      title: "House-Lord Results",
      sanskrit: "General Nature",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Kendra", value: "1 · 4 · 7 · 10" },
        { label: "Trikona", value: "1 · 5 · 9" },
        { label: "Dusthana", value: "6 · 8 · 12" },
        { label: "Maraka", value: "2 · 7" },
        { label: "Disruptive", value: "3 · 6 · 11" },
      ],
      points: [
        "1st lord — generally good; curtailed (even negative) if a natural malefic or also ruling a malefic house",
        "2nd lord — neutral; good for wealth, but a maraka, so it can harm health and longevity",
        "3rd lord — generally inauspicious (3rd = 8th-from-8th); impulsive, ego-driven; good for siblings",
        "4th lord — strong (angular); natural malefics improve, natural benefics can lose shine",
        "5th lord — benefic (a trikona); gives positive results",
        "6th lord — generally negative; disease, injury, and difficulty",
        "7th lord — angular; follows the same rules as the 4th",
        "8th lord — inauspicious; obstacles, opposition, negativity",
        "9th lord — very fortunate (the best trikona); strongly positive",
        "10th lord — angular; follows the same rules as any angle",
        "11th lord — good for income and gains, but disruptive and impulsive for the chart",
        "12th lord — generally inauspicious, often neutral; judge by the other house it rules",
      ],
    },
  ],
};
