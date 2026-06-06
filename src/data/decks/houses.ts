/* The Twelve Houses — Bhāvas. Content complete (ported verbatim). */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const houses: Deck = {
  id: "houses",
  title: "The Twelve Houses",
  subtitle: "Bhāva",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "1st House",
      sanskrit: "Tanu Bhāva",
      badge: "01",
      icon: { kind: "house", n: 1 },
      body: "The self — body, appearance, vitality, temperament and the overall trajectory of life. The Lagna (ascendant) sits here; it colours the whole chart.",
    },
    {
      title: "2nd House",
      sanskrit: "Dhana Bhāva",
      badge: "02",
      icon: { kind: "house", n: 2 },
      body: "Wealth and resources, speech, the face, family lineage and what one consumes — food, values, accumulated assets.",
    },
    {
      title: "3rd House",
      sanskrit: "Sahaja Bhāva",
      badge: "03",
      icon: { kind: "house", n: 3 },
      body: "Courage, initiative and effort. Younger siblings, short journeys, skills of the hands, and communication.",
    },
    {
      title: "4th House",
      sanskrit: "Sukha Bhāva",
      badge: "04",
      icon: { kind: "house", n: 4 },
      body: "Inner happiness and the heart. Mother, home, land and property, vehicles, and emotional foundations.",
    },
    {
      title: "5th House",
      sanskrit: "Putra Bhāva",
      badge: "05",
      icon: { kind: "house", n: 5 },
      body: "Intelligence, creativity and children. Romance, speculation, and pūrva puṇya — merit carried from past lives.",
    },
    {
      title: "6th House",
      sanskrit: "Ari Bhāva",
      badge: "06",
      icon: { kind: "house", n: 6 },
      body: "Obstacles overcome — enemies, debts, disease and daily service. A house of effort and resilience.",
    },
    {
      title: "7th House",
      sanskrit: "Kalatra Bhāva",
      badge: "07",
      icon: { kind: "house", n: 7 },
      body: "The partner and marriage, business partnerships, contracts and open dealings with others. Directly opposite the self.",
    },
    {
      title: "8th House",
      sanskrit: "Randhra Bhāva",
      badge: "08",
      icon: { kind: "house", n: 8 },
      body: "Transformation, longevity and the hidden. Inheritance and shared resources, crises, research and the occult.",
    },
    {
      title: "9th House",
      sanskrit: "Dharma Bhāva",
      badge: "09",
      icon: { kind: "house", n: 9 },
      body: "Fortune and higher purpose. The guru and father, philosophy, long journeys, pilgrimage and grace (bhāgya).",
    },
    {
      title: "10th House",
      sanskrit: "Karma Bhāva",
      badge: "10",
      icon: { kind: "house", n: 10 },
      body: "Career, status and public action. The most visible angle of the chart — reputation and one’s mark on the world.",
    },
    {
      title: "11th House",
      sanskrit: "Lābha Bhāva",
      badge: "11",
      icon: { kind: "house", n: 11 },
      body: "Gains and income, networks and friends, elder siblings, and the fulfilment of desires and aspirations.",
    },
    {
      title: "12th House",
      sanskrit: "Vyaya Bhāva",
      badge: "12",
      icon: { kind: "house", n: 12 },
      body: "Loss and expenditure, but also release — mokṣa, the bed, foreign lands, retreat, and what is left behind.",
    },
  ],
};
