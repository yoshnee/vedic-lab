/* The Four Elements (Tattva) — a concept deck behind the chart's element-balance
   readout: count the nine planets (Rahu & Ketu included) by the element of their
   signs; the predominant element shows the prevailing temperament, and a missing
   element speaks as loudly as an excess. Interpretations are owner-dictated
   (excess/missing per element; fire→pitta is the one dosha link given). This is
   deliberately framed as the MOST BASIC method of evaluating the elements.

   ELEMENT_INFO is the same content in lookup form for the chart UI
   (ElementBalance) — single source, so the readout and the cards can't diverge. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";
import type { Element } from "@/core/constants";

export const ELEMENT_INFO: Record<Element, {
  label: string; sanskrit: string; signs: string; dominant: string; missing: string;
}> = {
  fire: {
    label: "Fire", sanskrit: "Agni", signs: "Aries · Leo · Sagittarius",
    dominant: "action-driven and purposeful — guard against burning out",
    missing: "can read as a lack of purpose or motivation",
  },
  earth: {
    label: "Earth", sanskrit: "Prithvi", signs: "Taurus · Virgo · Capricorn",
    dominant: "focused on earning, building, and stability",
    missing: "wealth can be hard to accumulate and hold",
  },
  air: {
    label: "Air", sanskrit: "Vayu", signs: "Gemini · Libra · Aquarius",
    dominant: "socially inclined and communicative — possibly scattered",
    missing: "can read as inflexibility or isolation",
  },
  water: {
    label: "Water", sanskrit: "Jala", signs: "Cancer · Scorpio · Pisces",
    dominant: "focused on the emotional and intuitive side of life",
    missing: "emotional connection and intuition can be hard to reach",
  },
};

export const elements: Deck = {
  id: "elements",
  title: "The Four Elements",
  subtitle: "Tattva",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "Elemental Balance",
      sanskrit: "Tattva",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Method", value: "Count the 9 planets by sign element" },
        { label: "Fire", value: "Aries · Leo · Sagittarius" },
        { label: "Earth", value: "Taurus · Virgo · Capricorn" },
        { label: "Air", value: "Gemini · Libra · Aquarius" },
        { label: "Water", value: "Cancer · Scorpio · Pisces" },
      ],
      points: [
        "Count all nine planets — Rahu and Ketu included — by the element of the sign each occupies",
        "The predominant element shows the prevailing temperament; the traits color the whole chart",
        "A missing element (no planets at all) speaks as loudly as an excess",
        "This is the most basic method of evaluating the elements — a starting lens, not a verdict",
      ],
    },
    {
      title: "Fire",
      sanskrit: "Agni",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Signs", value: "Aries · Leo · Sagittarius" },
        { label: "In excess", value: "Pitta rises — risk of burnout" },
        { label: "If missing", value: "Lack of purpose or motivation" },
      ],
      points: [
        "Action, drive, initiative — the spark toward life purpose",
        "Many planets in fire can raise pitta — so much action it can burn a person out relatively young",
        "Missing fire: a lack of purpose, or of motivation toward one's life purpose",
      ],
    },
    {
      title: "Earth",
      sanskrit: "Prithvi",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Signs", value: "Taurus · Virgo · Capricorn" },
        { label: "In excess", value: "Strong focus on earning & stability" },
        { label: "If missing", value: "Wealth hard to accumulate" },
      ],
      points: [
        "Practical, grounded, builds and accumulates",
        "A high share of planets in earth signs: very focused on earning and stability",
        "Missing earth: financial issues and difficulty accumulating wealth",
      ],
    },
    {
      title: "Air",
      sanskrit: "Vayu",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Signs", value: "Gemini · Libra · Aquarius" },
        { label: "In excess", value: "Social, communicative — scattered" },
        { label: "If missing", value: "Inflexibility or isolation" },
      ],
      points: [
        "Mental, communicative, connecting",
        "Many planets in air: naturally very social — though possibly scattered, favoring fun over goals",
        "Missing air: inflexibility, difficulty relaxing and enjoying life, or isolation",
      ],
    },
    {
      title: "Water",
      sanskrit: "Jala",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Signs", value: "Cancer · Scorpio · Pisces" },
        { label: "In excess", value: "Emotionally centred life" },
        { label: "If missing", value: "Hard to reach feelings & intuition" },
      ],
      points: [
        "Emotional, intuitive, feeling",
        "Many planets in water: focused on the emotional and heart-centred parts of life",
        "Missing water: emotional issues, difficulty connecting to one's intuition or to others, and potential relationship strain",
      ],
    },
  ],
};
