/* The 27 Nakshatras — lunar mansions. Content from nakshatras_flashcards.md:
   FRONT = span + Vimshottari ruler + general nature (facts), BACK = personality
   traits & significations (points). Each card's icon and accent are its ruling
   planet (the Vimshottari lord), so flipping the deck walks the 9-lord cycle ×3.

   Spans are contiguous 13°20′ arcs from 0° Aries; rulers match the engine's
   validated NAKSHATRAS table (src/core/constants.ts). Standard 27-fold scheme —
   the intercalary 28th (Abhijit) is intentionally omitted; add it later only if
   a 28-fold treatment is wanted.

   "General nature" is the traditional muhurta activity-nature (gentle Mridu /
   swift Kshipra / fixed Sthira / movable Chara / mixed Mishra / fierce Ugra /
   sharp Tikshna) — a starting point to refine later, per the source note. */
import type { Deck } from "./types";
import { PLANET_COLORS, ACCENT } from "@/lib/design/colors";

type Lord = keyof typeof PLANET_COLORS;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const DATA: { name: string; lord: Lord; span: string; nature: string; points: string[] }[] = [
  {
    name: "Ashwini", lord: "ketu", span: "0°00′–13°20′ Aries",
    nature: "Auspicious (swift / Kshipra)",
    points: [
      "Fast-moving, action-oriented; first to initiate ideas and journeys",
      "Pioneering, ambitious, innovative; thrives where spontaneity is needed",
      "Drawn to medicine, therapy, and healing",
      "Values autonomy; dislikes being controlled",
      "Affinity for animals, horses, and motion",
      "Seeks freedom in relationships; partners who respect space and adventure",
    ],
  },
  {
    name: "Bharani", lord: "venus", span: "13°20′–26°40′ Aries",
    nature: "Challenging (fierce / Ugra)",
    points: [
      "Courageous; faces life's profound challenges",
      "Artistic and creative; drawn to taboo and mystery; sensual",
      "Careers in creativity, transformation, caretaking — psychology, midwifery, transformation coaching",
      "Craves depth, intensity, and truth in connection",
      "Embodies creation and dissolution — the birth, death, and rebirth cycle",
      "Navigates life's transformative currents",
    ],
  },
  {
    name: "Krittika", lord: "sun", span: "26°40′ Aries–10°00′ Taurus",
    nature: "Mixed (Mishra)",
    points: [
      "Fiery nature, sharp intellect, protective instinct",
      "Decisive with moral courage; fosters and defends",
      "Careers in law enforcement, military leadership, advocacy, priesthood",
      "Fiercely loyal but can be demanding",
      "A bold spirit that thrives in challenges and transformational roles",
    ],
  },
  {
    name: "Rohini", lord: "moon", span: "10°00′–23°20′ Taurus",
    nature: "Auspicious (fixed / Sthira)",
    points: [
      "Charming, magnetic personality; artistic; sensual",
      "Careers in creative arts, luxury goods, real estate, interior design",
      "Desires stability and loyalty in relationships",
      "Embodies growth, creativity, and nourishment",
      "Seeks beauty and harmony in life",
    ],
  },
  {
    name: "Mrigashira", lord: "mars", span: "23°20′ Taurus–6°40′ Gemini",
    nature: "Auspicious (gentle / Mridu)",
    points: [
      "Curious, playful, gentle, and approachable",
      "Adaptable and intelligent",
      "Careers feeding curiosity and variety — research, travel, journalism, exploration",
      "Seeks partners who match their intellectual curiosity",
      "Restless energy seeking love, knowledge, freedom, and truth",
    ],
  },
  {
    name: "Ardra", lord: "rahu", span: "6°40′–20°00′ Gemini",
    nature: "Challenging (sharp / Tikshna)",
    points: [
      "Intense and passionate; resilient and transformative",
      "Innovative and insightful",
      "Storm symbolism — destruction that clears the way for new growth",
      "Careers in research, discovery, and crisis management",
      "Relationships can be turbulent but spur major personal growth",
      "Transformation through challenge",
    ],
  },
  {
    name: "Punarvasu", lord: "jupiter", span: "20°00′ Gemini–3°20′ Cancer",
    nature: "Auspicious (movable / Chara)",
    points: [
      "Optimistic, resilient, generous, and intellectual",
      "Seeker of harmony and balance; naturally forgiving",
      "Careers in healing, education, counseling, teaching, nurturing roles",
      "Values nurturing, intellectually stimulating relationships",
      "“Light after the storm” — recovery, renewal, regeneration",
    ],
  },
  {
    name: "Pushya", lord: "saturn", span: "3°20′–16°40′ Cancer",
    nature: "Auspicious (swift / Kshipra) — widely considered the most auspicious nakshatra",
    points: [
      "Nurturing and supportive; ethical and wise",
      "Resilient and enduring",
      "Careers in education, healthcare, spiritual leadership, caretaking",
      "Seeks stability and reliability in relationships",
      "The “nourisher of souls” — care, wisdom, nourishment",
    ],
  },
  {
    name: "Ashlesha", lord: "mercury", span: "16°40′–30°00′ Cancer",
    nature: "Challenging (sharp / Tikshna)",
    points: [
      "Deeply intuitive and mysterious; sharp, strategic mind",
      "Vast emotional depth",
      "Careers handling secrets or confidential matters, psychology, spiritual work",
      "Intensely loyal and passionate, but can be possessive",
      "A deep need for connection can turn relationships controlling or overly intense",
    ],
  },
  {
    name: "Magha", lord: "ketu", span: "0°00′–13°20′ Leo",
    nature: "Challenging (fierce / Ugra)",
    points: [
      "Proud, regal, magnanimous; carries a regal demeanor",
      "Spiritually inclined; reveres tradition and customs",
      "Excels in leadership, authority, government, administrative and ancestral/karmic roles",
      "Values loyalty and tradition in relationships",
      "Themes of authority, ancestry, and tradition",
    ],
  },
  {
    name: "Purva Phalguni", lord: "venus", span: "13°20′–26°40′ Leo",
    nature: "Challenging (fierce / Ugra)",
    points: [
      "Charismatic, attractive, socially magnetic",
      "Artistically and creatively gifted; a natural lover of luxury and comfort",
      "Careers in entertainment, arts, design, luxury",
      "Seeks partners who share their love of vibrancy, fun, and romance",
      "Themes of pleasure, relaxation, and enjoyment",
    ],
  },
  {
    name: "Uttara Phalguni", lord: "sun", span: "26°40′ Leo–10°00′ Virgo",
    nature: "Auspicious (fixed / Sthira)",
    points: [
      "Reliable and honorable; natural leadership",
      "Supportive and generous",
      "Excels at managing resources and helping others do so",
      "Dedicated to long-term commitments",
      "Seeks stability and consistency in partnership",
    ],
  },
  {
    name: "Hasta", lord: "moon", span: "10°00′–23°20′ Virgo",
    nature: "Auspicious (swift / Kshipra)",
    points: [
      "Skillful and dexterous; handles intricate, solution-oriented tasks with ease",
      "Cheerful and sociable",
      "Careers needing precision — artisan, surgeon, mechanic",
      "Values communication and practical support",
      "The hands-on partner, ready to solve problems",
    ],
  },
  {
    name: "Chitra", lord: "mars", span: "23°20′ Virgo–6°40′ Libra",
    nature: "Auspicious (gentle / Mridu)",
    points: [
      "Artistic and aesthetic; a keen eye for beauty",
      "Charismatic and attractive; innovative, dynamic, bold",
      "Careers in visual arts, fashion, interior design, architecture",
      "Seeks relationships that appreciate and inspire creativity",
      "The “divine artisan” — shaping environments through design, color, and clarity",
    ],
  },
  {
    name: "Swati", lord: "rahu", span: "6°40′–20°00′ Libra",
    nature: "Auspicious (movable / Chara)",
    points: [
      "Highly independent; intellectual and communicative",
      "Innovative, creative, and adaptable",
      "Careers needing negotiation and adaptability — sales, marketing, public relations",
      "Values freedom and mental stimulation in relationships",
    ],
  },
  {
    name: "Vishakha", lord: "jupiter", span: "20°00′ Libra–3°20′ Scorpio",
    nature: "Mixed (Mishra)",
    points: [
      "Determined, goal-oriented, resourceful, and dynamic",
      "Charismatic leadership",
      "Suited to leadership in public and private sectors — politics, management",
      "Seeks relationships offering growth and dynamism",
      "Loyal, but needs freedom to explore their full potential",
    ],
  },
  {
    name: "Anuradha", lord: "saturn", span: "3°20′–16°40′ Scorpio",
    nature: "Auspicious (gentle / Mridu)",
    points: [
      "Cooperative and loyal; resilient and optimistic",
      "Diplomatic and peaceful",
      "Careers in diplomacy, teamwork, and relationship-building — HR, counseling",
      "Values loyalty; seeks stable partnerships grounded in emotional depth",
    ],
  },
  {
    name: "Jyeshtha", lord: "mercury", span: "16°40′–30°00′ Scorpio",
    nature: "Challenging (sharp / Tikshna)",
    points: [
      "Authoritative and commanding; naturally assumes leadership",
      "Protective and responsible; strategically minded, a sharp thinker",
      "Careers needing leadership and strategy — military, executive, management",
      "Values respect and loyalty",
      "Tends to take the lead, including in the household",
    ],
  },
  {
    name: "Mula", lord: "ketu", span: "0°00′–13°20′ Sagittarius",
    nature: "Challenging (sharp / Tikshna)",
    points: [
      "Intense and insightful; capable of deep focus",
      "Resilient, philosophical, inquisitive; mystical (Ketu's influence)",
      "Seeks what lies beyond the superficial",
      "Careers in psychology, healing, the occult",
      "Seeks depth, honesty, and soul-level connection",
      "“Getting to the root” — fundamental matters and significant transformation",
    ],
  },
  {
    name: "Purva Ashadha", lord: "venus", span: "13°20′–26°40′ Sagittarius",
    nature: "Challenging (fierce / Ugra)",
    points: [
      "Charismatic and persuasive; determined and resolute",
      "Refined and artistic",
      "Careers in art, diplomacy, and fields needing negotiation and charm",
      "Seeks emotionally deep and intellectually stimulating relationships",
      "Themes of purity, victory, and moral integrity",
    ],
  },
  {
    name: "Uttara Ashadha", lord: "sun", span: "26°40′ Sagittarius–10°00′ Capricorn",
    nature: "Auspicious (fixed / Sthira)",
    points: [
      "Determined and unyielding; wise and ethical",
      "Resilient and patient",
      "Drawn to leadership and responsibility",
      "Excels in government, law, and education",
      "Seeks stable, loyal partnerships built on trust and shared values",
    ],
  },
  {
    name: "Shravana", lord: "moon", span: "10°00′–23°20′ Capricorn",
    nature: "Auspicious (movable / Chara)",
    points: [
      "Attentive and wise; scholarly and articulate",
      "Strongly communicative",
      "Careers in teaching, writing, media, counseling",
      "A great listener; a thoughtful partner; a natural mediator and adviser",
      "Emphasizes the power of listening and learning",
    ],
  },
  {
    name: "Dhanishta", lord: "mars", span: "23°20′ Capricorn–6°40′ Aquarius",
    nature: "Auspicious (movable / Chara)",
    points: [
      "Dynamic and charismatic; wealth-oriented and resourceful",
      "Musical and artistic",
      "Careers in finance, management, real estate; also music, dance, and art",
      "Seeks stimulating, independent-yet-loyal partners",
      "Themes of vibrancy and resource management",
    ],
  },
  {
    name: "Shatabhisha", lord: "rahu", span: "6°40′–20°00′ Aquarius",
    nature: "Auspicious / neutral (movable / Chara)",
    points: [
      "Introspective and private; innovative and visionary",
      "A healer and “mystic”; a futuristic thinker",
      "Careers in research, science, technology, and healing",
      "Seeks relationships that respect their need for intellectual stimulation",
      "Prefers private bonds built on mental connection over emotional display",
    ],
  },
  {
    name: "Purva Bhadrapada", lord: "jupiter", span: "20°00′ Aquarius–3°20′ Pisces",
    nature: "Challenging (fierce / Ugra)",
    points: [
      "Deep and philosophical; transformational and visionary",
      "A deep thinker; lover of spirituality, philosophy, science, and metaphysics",
      "Seeks soulful, karmic, and emotionally rich connections",
    ],
  },
  {
    name: "Uttara Bhadrapada", lord: "saturn", span: "3°20′–16°40′ Pisces",
    nature: "Auspicious (fixed / Sthira)",
    points: [
      "Calm and steadfast; rarely shaken",
      "Deeply grounded, reflective, and wise — an “old soul”",
      "Supportive and mature; a natural inclination toward healing",
      "Careers in healthcare, spiritual leadership, counseling",
      "Devoted, anchoring, quietly empowering",
    ],
  },
  {
    name: "Revati", lord: "mercury", span: "16°40′–30°00′ Pisces",
    nature: "Auspicious (gentle / Mridu)",
    points: [
      "Empathetic and compassionate; intuitive and perceptive",
      "Artistic and creative",
      "Shines in roles that nurture or guide — arts, humanitarian work, travel, teaching, hospitality",
      "Emotionally rich",
      "Seeks deep, meaningful relationships allowing emotional and spiritual connection",
    ],
  },
];

export const nakshatras: Deck = {
  id: "nakshatras",
  title: "The 27 Nakshatras",
  subtitle: "Lunar Mansions",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: DATA.map((d, i) => ({
    title: d.name,
    badge: String(i + 1).padStart(2, "0"),
    accentColor: PLANET_COLORS[d.lord],
    icon: { kind: "planet" as const, id: d.lord },
    body: "",
    facts: [
      { label: "Span", value: d.span },
      { label: "Ruler", value: cap(d.lord) },
      { label: "Nature", value: d.nature },
    ],
    points: d.points,
  })),
};
