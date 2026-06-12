/* ============================================================
   shadbalaGroups.ts — the "Shadbala Groupings" content: the seven planets as
   three functional teams that share responsibilities, so a weak planet's
   group-mates can compensate. ALL COPY IS THE OWNER'S, VERBATIM — titles,
   taglines, body lines, and the footer. Do not reword (em-dash and phrasing
   kept exactly as provided). Order is the reading sequence:
   survival → comfort → achievement.
   ============================================================ */
import type { PlanetKey } from "@/core/types";

export interface ShadbalaGroup {
  id: string;
  /** "Group N" eyebrow. */
  label: string;
  /** The planets named in the title, in title order — also the strength rows. */
  planets: PlanetKey[];
  /** The planets as titled, verbatim. */
  title: string;
  tagline: string;
  /** Body copy, verbatim, one paragraph per entry. */
  lines: string[];
}

export const SHADBALA_GROUPS: ShadbalaGroup[] = [
  {
    id: "survival",
    label: "Group 1",
    planets: ["saturn", "mars"],
    title: "Saturn & Mars",
    tagline: "Difficulty and Survival",
    lines: [
      "Mars fixes dangers that are immediate and responds on instinct to prevent a difficulty",
      "Saturn helps deal with unavoidable trouble and gives an individual the ability to persevere and endure.",
    ],
  },
  {
    id: "comfort",
    label: "Group 2",
    planets: ["venus", "moon"],
    title: "Venus & Moon",
    tagline: "Comfort, Joy & Fulfillment",
    lines: [
      "Venus knows what a person needs to thrive and where to go to get it. The Moon deals with emotional satisfaction and ability to discern — this is right, they isn't.",
    ],
  },
  {
    id: "achievement",
    label: "Group 3",
    planets: ["sun", "jupiter", "mercury"],
    title: "Sun, Jupiter & Mercury",
    tagline: "Goals, Ambition, Achievement",
    lines: [
      "Sun tells to whether we are confident, inspired, and have capacity to be steadfast.",
      "Jupiter is our sense of happiness, and pulls us towards what makes us happy. Mercury is the ability to practically manage situations. So even if we are not inspired, we know what the practical thing to do is.",
    ],
  },
];

export const SHADBALA_GROUPS_FOOTER =
  "Take care of survival and trouble, then move towards comfort and fulfillment, finally achieve.";
