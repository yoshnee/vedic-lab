/* Yogas — planetary combinations. Full content from yogas-flashcards.md
   (owner-provided): Raja yogas, Parivartana, Pancha Mahapurusha, Dhana yogas,
   Budhaditya, Neecha Bhanga, and the Grahana (eclipse) family. FRONT = facts
   (the core rule), BACK = points (examples and finer detail); no em-dashes,
   matching the source. Card order follows the source's section order. The
   numbered Neecha Bhanga conditions (1-7) are preserved verbatim: these cards
   double as the spec for the yoga computation engine (next phase), so the
   rules must stay exact. Planet-pair yogas use the conjunction icon; the
   Grahana overview uses Rahu's eclipse body. English gloss subtitles were
   removed (owner-directed: the yogas aren't known by those names) — only
   genuinely Sanskrit subtitles remain. The chart's per-planet yoga pills
   link here by card title (flashcardLink.ts → "yoga"). */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

/* The Grahana orb tiers (Purna / Strong / Mild), summarized as ONE front footer
   shared by all four luminary-node cards so they can never drift. This replaced
   the deleted "Grahana Yoga (Overview)" card, which used to hold these tiers. */
const GRAHANA_ORB_FOOTER =
  "Purna (complete) within 5°, the strongest · Strong within 10° · Mild same sign, more than 10° apart";

export const yogas: Deck = {
  id: "yogas",
  title: "Yogas",
  subtitle: "Planetary Combinations",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    // ---- Raja Yoga ----
    {
      title: "Raja Yoga",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Union of", value: "A Kendra lord + a Trikona lord" },
        {
          label: "By",
          value: "Conjunction · mutual aspect · exchange (parivartana)",
        },
        {
          label: "Blends",
          value: "The angular house's drive with the trinal house's grace and intelligence",
        },
        { label: "Rank", value: "Among the most auspicious yogas in a chart" },
        {
          label: "Exchange form",
          value: "A Kendra-Trikona exchange is also called Maha Parivartana Yoga",
        },
      ],
      // The lord-pair examples (illustrations, not the rule itself) — one tab
      // each. No backTitle: the tabbed back opens straight into the tabs, with
      // no heading. The live detector (core/yoga.ts rajaYoga) surfaces a single
      // generic "Raja Yoga" pill, NOT the per-pair tab (owner-directed).
      tabs: [
        {
          label: "1/5",
          bullets: ["Self-initiative with intelligence", "Creative leadership, charisma, inspiring others"],
        },
        {
          label: "1/9",
          bullets: ["Identity with spiritual destiny", "Higher purpose, philosophy, dharma"],
        },
        {
          label: "4/5",
          bullets: ["Emotional grounding through intellect or art", "Education, psychology, counseling"],
        },
        {
          label: "4/9",
          bullets: ["Spiritual grace in the home", "Stable, sometimes sacred domestic life"],
        },
        {
          label: "7/5",
          bullets: ["Entrepreneurship, romantic unions, creative collaborations"],
        },
      ],
    },
    // ---- Parivartana Yogas ----
    {
      title: "Parivartana Yoga",
      hideBackTitle: true,
      icon: { kind: "conjunction", a: "mars", b: "sun" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "Two planets exchange signs, each sitting in the sign the other rules (mutual reception)",
        },
        {
          label: "Creates",
          value: "An energetic bond between the two houses · strong mutual influence",
        },
        {
          label: "Outcome",
          value: "The houses involved decide whether it is fortunate or difficult",
        },
      ],
      points: [
        "Example: Mars in Leo (ruled by the Sun) and the Sun in Scorpio (ruled by Mars)",
        "Auspicious houses, a Kendra with a Trikona: this is Maha Parivartana Yoga (its own card)",
        "A Dusthana with a Kendra or Trikona: begins with struggle or delay, then becomes success through persistence and inner growth",
        "A Dusthana with a Dusthana (e.g. 6th lord in the 8th, 8th lord in the 6th): profound, intense transformation, marked by hard lessons",
      ],
    },
    {
      title: "Maha Parivartana Yoga",
      hideBackTitle: true,
      icon: { kind: "diamond" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "A Kendra lord and a Trikona lord exchange signs",
        },
        { label: "Nature", value: "The auspicious form of Parivartana" },
        {
          label: "Brings",
          value: "A sudden rise in status · material wealth · support from powerful people · karmic rewards from past efforts",
        },
      ],
      points: [
        "See also Raja Yoga: a Kendra-Trikona exchange is at the same time a Raja Yoga, since exchange is one of the three Raja Yoga union modes",
      ],
    },
    // ---- Pancha Mahapurusha Yoga ----
    {
      title: "Pancha Mahapurusha Yoga",
      icon: { kind: "chart", house: 1 },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "A non-luminary in own sign or exaltation, in a Kendra (1, 4, 7, 10)",
        },
        { label: "Mars", value: "Ruchaka" },
        { label: "Mercury", value: "Bhadra" },
        { label: "Jupiter", value: "Hamsa" },
        { label: "Venus", value: "Malavya" },
        { label: "Saturn", value: "Sasa" },
      ],
      // back: one tab per Mahapurusha yoga (no backTitle → opens straight into
      // the tabs). Each tab carries its planet as a bullet + a qualities cloud.
      // The Moon-count caveat stays pinned as a footnote (owner-directed note).
      tabs: [
        {
          label: "Ruchaka",
          bullets: ["Mars"],
          cloud: {
            terms: [
              { label: "Courage", weight: "medium" },
              { label: "Action", weight: "medium" },
              { label: "Boldness", weight: "medium" },
            ],
          },
        },
        {
          label: "Bhadra",
          bullets: ["Mercury"],
          cloud: {
            terms: [
              { label: "Intellect", weight: "medium" },
              { label: "Eloquence", weight: "medium" },
              { label: "Versatility", weight: "medium" },
            ],
          },
        },
        {
          label: "Hamsa",
          bullets: ["Jupiter"],
          cloud: {
            terms: [
              { label: "Wisdom", weight: "medium" },
              { label: "Integrity", weight: "medium" },
              { label: "Spiritual strength", weight: "medium" },
            ],
          },
        },
        {
          label: "Malavya",
          bullets: ["Venus"],
          cloud: {
            terms: [
              { label: "Grace", weight: "medium" },
              { label: "Beauty", weight: "medium" },
              { label: "Material enjoyment", weight: "medium" },
            ],
          },
        },
        {
          label: "Sasa",
          bullets: ["Saturn"],
          cloud: {
            terms: [
              { label: "Discipline", weight: "medium" },
              { label: "Endurance", weight: "medium" },
              { label: "Mastery", weight: "medium" },
            ],
          },
        },
      ],
      tabsFootnote:
        "Assess the Kendras from the Lagna and also from the Moon (Chandra lagna). This chart's automatic detection flags Lagna Kendras only, so check the Moon count yourself.",
    },
    // ---- Dhana Yogas ----
    {
      title: "Gaja Kesari Yoga",
      hideBackTitle: true,
      icon: { kind: "conjunction", a: "jupiter", b: "moon" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "Jupiter conjunct the Moon, or Jupiter in a Kendra from the Moon",
        },
        {
          label: "Counted from",
          value: "The Moon: houses 1, 4, 7, or 10",
        },
        {
          label: "Gives",
          value: "Emotional intelligence · financial stability · societal recognition",
        },
      ],
      points: [
        "Jupiter's benefic strength supports the Moon's mind, lending wisdom and public standing",
      ],
    },
    {
      title: "Venus & Mercury Conjunction",
      hideBackTitle: true,
      sanskrit: "Śukra · Budha",
      icon: { kind: "conjunction", a: "venus", b: "mercury" },
      body: "",
      facts: [
        { label: "Rule", value: "Venus and Mercury joined" },
        { label: "Best in", value: "The 2nd, 5th, 9th, or 11th house" },
        {
          label: "Promotes",
          value: "Success through art, communication, intellect, or commerce",
        },
      ],
      points: [
        "Often points to profitable work in beauty, media, or business",
      ],
    },
    {
      title: "Dhana Yoga (2nd & 11th Lords)",
      hideBackTitle: true,
      icon: { kind: "chart", house: 2 },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "The 2nd and 11th lords in mutual aspect, conjunction, or occupying each other's houses",
        },
        {
          label: "Signals",
          value: "Continuous income · multiple revenue streams · material growth",
        },
      ],
      points: [
        "The classic wealth pairing: the 2nd (accumulated wealth) linked with the 11th (gains and income)",
      ],
    },
    {
      title: "Lakshmi Yoga",
      hideBackTitle: true,
      icon: { kind: "chart", house: 9 },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "The 9th lord in its own sign or exalted, placed in a Kendra or Trikona",
        },
        { label: "Plus", value: "A strong ascendant lord" },
        {
          label: "Brings",
          value: "Wealth through dharma, grace, and karmic merit",
        },
      ],
      points: [
        "Associated with fortune and lasting prosperity earned through righteous action",
      ],
    },
    // ---- Budhaditya Yoga ----
    {
      title: "Budhaditya Yoga",
      hideBackTitle: true,
      sanskrit: "Budha + Āditya",
      icon: { kind: "conjunction", a: "sun", b: "mercury" },
      body: "",
      facts: [
        { label: "Rule", value: "The Sun and Mercury conjunct" },
        {
          label: "Sweet spot",
          value: "6° to 14° apart: close enough to blend, far enough that Mercury escapes combustion",
        },
        {
          label: "Hallmark",
          value: "Discernment: cutting through illusion to align with deeper truths",
        },
        { label: "More auspicious in", value: "A Kendra or Trikona" },
      ],
      points: [
        "Common, in roughly 40% of charts, since Mercury never strays far from the Sun",
        "The truly effective version, where both planets are strong and unafflicted, is much rarer",
      ],
    },
    // ---- Neecha Bhanga Raja Yoga ----
    {
      title: "Neecha Bhanga Raja Yoga",
      hideBackTitle: true,
      icon: { kind: "diamond" },
      body: "",
      facts: [
        {
          label: "Meaning",
          value: "Cancellation of debilitation: a debilitated planet is rescued, and its weakness can turn into strength",
        },
        {
          label: "Rescuers",
          value: "Dispositor (debilitation-sign lord) · exaltation-lord (lord of the sign where the planet exalts)",
        },
      ],
      // the four rules live on the BACK (scrollable) — the front was clipping;
      // the chart's per-rule pills land here via prefix-matched point highlight
      // ("R1:" … "R4:", flashcardLink.ts)
      points: [
        "R1: The debilitation-sign lord sits in a Kendra (1, 4, 7, 10) from the Lagna or the Moon",
        "R2: The exaltation-sign lord sits in a Kendra from the Lagna or the Moon",
        "R3: The debilitated planet is conjunct or aspected by its own sign lord or its exaltation-sign lord",
        "R4: The debilitated planet is in parivartana (exchange) with the lord of the sign it occupies",
        "Cancellation does not guarantee a full Raja Yoga: the rescuer ideally avoids ties to the 6th, 8th, or 12th, and dignity plus dasha decide the real outcome",
      ],
    },
    // ---- Vipreet Raja Yoga ----
    {
      title: "Vipreet Raja Yoga",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Meaning", value: "Strength born from adversity" },
        {
          label: "Rule",
          value: "A dusthana lord (6, 8, 12) occupies a dusthana house",
        },
        { label: "Source", value: "Phaladeepika, Ch. 6" },
      ],
      footnote:
        "Commonly applied condition: the dusthana lord should not conjunct kendra or trikona lords, or the yoga is diluted.",
      // three sub-yogas, one per dusthana lord — the back's three tabs double as
      // the spec for core/yoga.ts vipreetRaja (Harsha / Sarala / Vimala). Each
      // chart pill opens the card flipped to its own tab (flashcardLink.ts).
      tabs: [
        {
          label: "Harsha",
          facts: [{ label: "Formed by", value: "6th lord in the 6th, 8th, or 12th" }],
          cloud: {
            terms: [
              { label: "Victory over enemies", weight: "medium" },
              { label: "Good fortune", weight: "medium" },
              { label: "Strong body", weight: "medium" },
              { label: "Happiness", weight: "medium" },
              { label: "Illustrious friends", weight: "medium" },
              { label: "Fears sin", weight: "medium" },
            ],
          },
        },
        {
          label: "Sarala",
          facts: [{ label: "Formed by", value: "8th lord in the 6th, 8th, or 12th" }],
          cloud: {
            terms: [
              { label: "Long life", weight: "medium" },
              { label: "Fearless", weight: "medium" },
              { label: "Resolute", weight: "medium" },
              { label: "Prosperous", weight: "medium" },
              { label: "Success in undertakings", weight: "medium" },
              { label: "Widely known", weight: "medium" },
            ],
          },
        },
        {
          label: "Vimala",
          facts: [{ label: "Formed by", value: "12th lord in the 6th, 8th, or 12th" }],
          cloud: {
            terms: [
              { label: "Saves much spends little", weight: "medium" },
              { label: "Independent", weight: "medium" },
              { label: "Happy", weight: "medium" },
              { label: "Respected conduct", weight: "medium" },
              { label: "Good to all", weight: "medium" },
            ],
          },
        },
      ],
    },
    // ---- Grahana Yoga (four luminary-node pairs; the orb tiers summarize on
    //      each card front via GRAHANA_ORB_FOOTER, replacing the Overview card) ----
    {
      title: "Grahana: Moon & Rahu",
      hideBackTitle: true,
      icon: { kind: "conjunction", a: "moon", b: "rahu" },
      body: "",
      footnote: GRAHANA_ORB_FOOTER,
      facts: [
        {
          label: "Dynamic",
          value: "The Moon perceives; Rahu blurs perception",
        },
        {
          label: "Struggle",
          value: "Separating their own sense of self from the world outside",
        },
        {
          label: "Nature",
          value: "Out of the ordinary · magnetic · often psychic or intuitive",
        },
        {
          label: "Key",
          value: "Develops the energy well with grounding, or swings to extremes without it",
        },
      ],
      points: [
        "At best: groundbreaking, popular, hypnotic, deeply perceptive",
        "At worst: emotionally unstable, “drunk on their karma,” giving themselves over to chaos",
        "Care: balanced eating, avoiding what poisons the mind, and caution with company, since they readily absorb the qualities of those around them",
        "Rahu shows what they are meant to focus on this life; they reach it only by learning not to swing to extremes, ideally with a balanced presence nearby",
      ],
    },
    {
      title: "Grahana: Moon & Ketu",
      hideBackTitle: true,
      icon: { kind: "conjunction", a: "moon", b: "ketu" },
      body: "",
      footnote: GRAHANA_ORB_FOOTER,
      facts: [
        {
          label: "Dynamic",
          value: "Ketu's paradox: unbounded, yet fixated on minute detail",
        },
        {
          label: "At best",
          value: "Deep spiritual and psychic perception",
        },
        {
          label: "At worst",
          value: "Escapism · over-fixation on the self",
        },
        {
          label: "Nature",
          value: "Very sensitive; takes things personally and seriously",
        },
      ],
      points: [
        "Skilled at “it,” but without external validation for it",
        "Asked to flow with emotions such as grief, loss, or being hurt, yet struggles to express them in a healthy way",
        "The Moon is the capacity to perceive the world, and this person is often “off in another land”",
        "The aim is balance: fully present when present, free to lose themselves in meditation when there",
      ],
    },
    {
      title: "Grahana: Sun & Rahu",
      hideBackTitle: true,
      icon: { kind: "conjunction", a: "sun", b: "rahu" },
      body: "",
      footnote: GRAHANA_ORB_FOOTER,
      facts: [
        {
          label: "Dynamic",
          value: "The Sun's drive to build personality and intelligence meets Rahu, a domain undeveloped in past lives",
        },
        {
          label: "Appears",
          value: "Magnetic, confident, and articulate, as if they already know",
        },
        {
          label: "Shadow",
          value: "May share little of real value while trying to prove their magnetism",
        },
        {
          label: "Meant to",
          value: "Develop genuine individuality and creativity",
        },
      ],
      points: [
        "Inventive and clever; the work is to aim that at helping others rather than self-display",
        "The Sun's need for validation turns into a need to prove it, masking insecurity and overcompensation",
        "They benefit from a guide who has truly developed their own individuality",
        "Sun in Aries (exalted): retains strength; ambitious, pioneering, with unconventional methods",
        "Sun in Libra (debilitated): struggles more; identity confusion and authority issues",
        "Rahu in comfortable signs (Gemini, Virgo, Aquarius): the distorting effect is moderated",
      ],
    },
    {
      title: "Grahana: Sun & Ketu",
      hideBackTitle: true,
      icon: { kind: "conjunction", a: "sun", b: "ketu" },
      body: "",
      footnote: GRAHANA_ORB_FOOTER,
      facts: [
        {
          label: "Dynamic",
          value: "A strong capacity to transcend the ego, moving beyond body and mind",
        },
        {
          label: "Fine line",
          value: "Genuine spiritual realization vs being unmoored",
        },
        {
          label: "Pattern",
          value: "Accomplishes much yet feels something is always missing",
        },
      ],
      points: [
        "They chase a perfection that keeps receding, since karma is infinite and there is always a reason to claim suffering",
        "The work is to ask who the “I” really is: you are not the doer, life flows through you",
        "Looked up to in past lives, they may hold leadership now but draw no satisfaction from it",
        "Attachment to ego and external validation breeds suffering, which is exactly what this placement is built to dissolve",
        "Let go of the doubts",
      ],
    },
  ],
};
