/* Rahu & Ketu — the special nodes deck. Content from the owner's
   rahu_ketu_flashcards.md: how the nodes form, the eclipse rule, the six
   house axes they create, and how to read their dignity. Their NATURE
   (Rahu's obsession, Ketu's detachment) lives in the Planets deck — not
   duplicated here (owner-directed). BACK = points. The six AXIS cards carry
   a statement front (no question mark) and FLIP TO THEIR THEME — backTitle
   "Self ↔ Other" etc. — instead of repeating the front (owner-directed).
   The interactive "How Rahu & Ketu Form" component (NodesDiagram, the
   design handoff) opens via the `diagramLink` back buttons on the
   formation card (1, day-0 frame) and the eclipse card (2, day-127
   lunar-eclipse frame) — owner-settled 2026-06: button-only, NOT an
   in-stack card of its own. Em-dashes converted per the owner's
   no-em-dash rule. */
import type { Deck } from "./types";
import { ACCENT, PLANET_COLORS } from "@/lib/design/colors";

/** The diagram view's copy (the design's screen around <NodesDiagram/>),
    shown when a card's diagramLink pulls the component up. */
export const NODES_DIAGRAM = {
  title: "How Rahu & Ketu Form",
  sub: "Two paths cross the sky at two opposite points: the nodes. Press play to run a year: the shadow line sweeps with the Sun, and only when it lands on the nodal axis can an eclipse happen.",
  legend: [
    {
      title: "Crossings, not bodies",
      text: "Rahu and Ketu are the two points where the Lunar Path crosses the Solar Path: pure geometry, no mass. Hence “shadow planets.”",
    },
    {
      title: "Always opposite",
      text: "The nodes are the two ends of one axis through Earth, exactly 180° apart: Rahu crossing north, Ketu crossing south.",
    },
    {
      title: "Crossings are routine",
      text: "The Moon crosses a node about every 13.6 days. On its own, a crossing causes nothing. Watch it happen all year.",
    },
    {
      title: "The eclipse rule",
      text: "Eclipses occur only when the Earth-shadow line swings onto the nodal axis: two eclipse seasons a year.",
    },
  ],
  // (the tilt/regression footnote was removed, owner-directed 2026-06)
};

export const rahuKetu: Deck = {
  id: "rahu-ketu",
  title: "Rahu & Ketu",
  subtitle: "Chaya Grahas",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      // owner-named (2026-06) — was "How do Rahu and Ketu form?"
      title: "In depth on Rahu and Ketu",
      body: "",
      icon: { kind: "conjunction", a: "rahu", b: "ketu" },
      accentColor: PLANET_COLORS.rahu,
      points: [
        "They are the two points where the Moon's path crosses the Sun's path (the ecliptic): not physical bodies, but shadow points (chaya grahas)",
        "Rahu = north / ascending node",
        "Ketu = south / descending node",
        "Always exactly 180° apart",
        "Because they are points, not planets, they act through their dispositor, conjunctions, and nakshatra rather than on their own",
      ],
      diagramLink: { kind: "nodes", frame: "formation", label: "View the diagram" },
    },
    {
      title: "When does an eclipse actually happen?",
      body: "",
      icon: { kind: "planet", id: "rahu" },
      accentColor: PLANET_COLORS.rahu,
      points: [
        "Earth's shadow always points opposite the Sun",
        "An eclipse happens only when the Rahu–Ketu axis lines up with that Sun–shadow axis: just twice a year (eclipse seasons), even though the Moon crosses a node every ~13.6 days",
        "Lunar eclipse: Moon on one node, Sun on the opposite node, shadow falls on the Moon",
        "Solar eclipse: Sun and Moon together on the same node",
        "The nodes are always retrograde: the axis drifts backward ~19°/year, a full circle in 18.6 years",
      ],
      diagramLink: { kind: "nodes", frame: "eclipse", label: "View the eclipse" },
    },
    {
      title: "Rahu–Ketu on the 1/7 axis",
      backTitle: "Self ↔ Other",
      body: "",
      icon: { kind: "chart", house: [1, 7] }, // both ends of the axis
      points: [
        "Identity vs partnership, autonomy vs union, my desire vs our compromise",
        "Rahu 1st / Ketu 7th: intense self-focus; genuine partnership gets neglected or avoided",
        "Ketu 1st / Rahu 7th: obsession with the partner; own identity gets lost",
      ],
    },
    {
      title: "Rahu–Ketu on the 2/8 axis",
      backTitle: "Security ↔ Transformation",
      body: "",
      icon: { kind: "chart", house: [2, 8] }, // both ends of the axis
      points: [
        "My wealth, values and family vs shared resources and the unknown (artha vs moksha)",
        "Rahu 2nd / Ketu 8th: driven to accumulate wealth, status and family legacy; detached from joint assets, others' money and deep change",
        "Rahu 8th / Ketu 2nd: pulled toward the occult, sudden change and inheritance; detached from family wealth, comforts and saving",
        "Shared: financial swings, sudden gains then losses; an afflicted axis makes the reversals sharper",
      ],
    },
    {
      title: "Rahu–Ketu on the 3/9 axis",
      backTitle: "Self-Effort ↔ Higher Wisdom",
      body: "",
      icon: { kind: "chart", house: [3, 9] }, // both ends of the axis
      points: [
        "Communication, courage and worldly skill vs faith, philosophy and meaning (personal effort vs higher guidance)",
        "Rahu 3rd / Ketu 9th: drive to master communication, courage and skills, learning by trial and error; detached from inherited dogma, often skeptical or building their own beliefs",
        "Rahu 9th / Ketu 3rd: pulled toward philosophy, higher learning, faith and foreign lands; past-life ease with skill and courage, but must now trust intuition beyond pure logic",
      ],
    },
    {
      title: "Rahu–Ketu on the 4/10 axis",
      backTitle: "Roots ↔ Reputation",
      body: "",
      icon: { kind: "chart", house: [4, 10] }, // both ends of the axis
      points: [
        "Home and inner peace vs career and public standing (“nest vs name”)",
        "Rahu 4th / Ketu 10th: restless chase for home, real estate and emotional security; detached from ambition and recognition, often behind the scenes; career can feel unstable",
        "Rahu 10th / Ketu 4th: burning hunger for career, status and visibility; cut off from emotional roots, pouring energy into work over nesting; prone to overwork",
      ],
    },
    {
      title: "Rahu–Ketu on the 5/11 axis",
      backTitle: "Heart ↔ Network",
      body: "",
      icon: { kind: "chart", house: [5, 11] }, // both ends of the axis
      points: [
        "Personal creativity, romance and intelligence vs networks, recognition and gains; often understands the crowd better than their own heart",
        "Rahu 11th / Ketu 5th: insatiable hunger for status, wealth and a wide network; never feels “done”; detached from romance, creative vulnerability and children",
        "Rahu 5th / Ketu 11th: drive to be recognized for original intellect and talent; drawn to unconventional romance, speculation and fame; detached from social circles, an inner void amid gains",
        "Shared: great for unconventional creativity; warns against extreme speculation in money or love",
      ],
    },
    {
      title: "Rahu–Ketu on the 6/12 axis",
      backTitle: "Struggle ↔ Surrender",
      body: "",
      icon: { kind: "chart", house: [6, 12] }, // both ends of the axis
      points: [
        "Daily work, health and enemies vs solitude, release and moksha (“doing vs dissolving”)",
        "Rahu 6th / Ketu 12th: strong survival drive, problem-solving and conquering competitors; prone to overwork and hidden rivals; the soul quietly pulls toward retreat and spiritual progress",
        "Rahu 12th / Ketu 6th: drawn to solitude, foreign lands, escape and the mystical; past-life mastery of fighting enemies and daily struggle; the trap is using the 12th to dodge duty",
      ],
    },
    {
      title: "How do you assess the dignity of Rahu and Ketu?",
      body: "",
      icon: { kind: "planet", id: "ketu" },
      accentColor: PLANET_COLORS.ketu,
      points: [
        "The nodes don't own signs, so there's no standard dignity table; judge them through the chain",
        "Node → its dispositor (the sign lord) → that lord's dignity + avasthas + conjunctions",
        "The node can only tap into as much potential as its dispositor can deliver",
        "Add any conjunctions or aspects landing on the node as a secondary read",
        "Advanced / later: rashi drishti (sign aspects on the node), cover with the teacher first",
      ],
    },
  ],
};
