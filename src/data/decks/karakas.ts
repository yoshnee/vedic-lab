/* Karakas — the Chara Karakas of Jaimini astrology. Full content from
   karakas-flashcards.md (owner-provided): an overview card + the seven
   variable significators in rank order (badges 01-07, like the Shadbala
   deck's balas). FRONT = facts, BACK = points; no em-dashes. All cards use
   the diamond icon deliberately: chara karakas are VARIABLE (assigned by
   degree, differing chart to chart), so a fixed planet icon would mislead. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const karakas: Deck = {
  id: "karakas",
  title: "Karakas",
  subtitle: "Chara Karakas",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "Chara Karakas",
      sanskrit: "Variable Significators",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        {
          label: "What",
          value: "Jaimini's variable significators, assigned dynamically so they differ from one chart to the next",
        },
        {
          label: "Method",
          value: "Rank the planets by the degrees they have travelled within their sign, highest to lowest",
        },
        {
          label: "Layer",
          value: "A soul-level layer on top of the fixed significators, not a replacement",
        },
      ],
      points: [
        "The sequence runs highest degree = Atmakaraka, next = Amatyakaraka, and so on down the list",
        "Rahu and Ketu are always excluded. Only the seven planets from the Sun through Saturn are ranked",
        "Ties in degree are broken by comparing minutes, then seconds",
      ],
    },
    {
      title: "Atmakaraka",
      badge: "01",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The highest degree within its sign" },
        { label: "Means", value: "The soul significator, the king of the chart" },
        {
          label: "Standing",
          value: "The single most important planet in the Jaimini scheme",
        },
        {
          label: "Shows",
          value: "The soul's deepest agenda: the lessons that keep returning until they are learned, and what the native came into this life to work on",
        },
      ],
      points: [
        "The Atmakaraka is treated as a king undergoing purification across lifetimes",
        "A retrograde Atmakaraka points to a lesson carried over and deeply internalized, an unfinished theme from past births that asks for revision and intense self-reflection",
      ],
    },
    {
      title: "Amatyakaraka",
      badge: "02",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The second-highest degree within its sign" },
        { label: "Means", value: "The minister and counsel to the Atmakaraka king" },
        { label: "Signifies", value: "Career · profession · worldly success" },
        {
          label: "Role",
          value: "Where the Atmakaraka is the soul's purpose, the Amatyakaraka is the support and skill that carry that purpose into the world",
        },
      ],
      points: [
        "The king and minister work as a pair",
        "A well-placed Amatyakaraka helps the Atmakaraka fulfil its agenda, shaping profession, reputation, and the means of livelihood",
        "It colours the intellect and the practical capability the native leans on to succeed",
      ],
    },
    {
      title: "Bhratrikaraka",
      badge: "03",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The third-highest degree" },
        { label: "Signifies", value: "Siblings and close companions" },
        { label: "Also", value: "Courage · drive · communication" },
        { label: "In some traditions", value: "The guru or teacher" },
      ],
      points: [
        "It colours the native's bonds with co-borns and the support found in companionship, along with the initiative and effort the native brings to their pursuits",
      ],
    },
    {
      title: "Matrikaraka",
      badge: "04",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The fourth-highest degree" },
        { label: "Signifies", value: "The mother and maternal relatives" },
        { label: "Also", value: "Emotional nourishment · home · comfort" },
      ],
      points: [
        "It shows the specific karmic role the mother plays in this life, and the native's relationship to care, security, and inner contentment",
      ],
    },
    {
      title: "Putrakaraka",
      badge: "05",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The fifth-highest degree" },
        { label: "Signifies", value: "Children and creativity" },
        { label: "Also", value: "Intelligence · students · followers" },
        { label: "Carries", value: "Themes of devotion and merit earned in past lives" },
      ],
      points: [
        "It shapes how the native nurtures and creates, whether through children, creative work, or guiding others, and reflects the fruits of past good action",
      ],
    },
    {
      title: "Gnatikaraka",
      badge: "06",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The sixth-highest degree" },
        { label: "Signifies", value: "Obstacles, rivals, and conflict" },
        { label: "But also", value: "The capacity to fight and overcome" },
        { label: "When strong", value: "The resilience built through resistance" },
      ],
      points: [
        "It is not purely difficult",
        "It points to recurring friction that can either grind the native down or polish them",
        "It is essential in competitive fields such as sport, politics, and business",
      ],
    },
    {
      title: "Darakaraka",
      badge: "07",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Rank", value: "The lowest degree, closing the karaka sequence" },
        { label: "Signifies", value: "The spouse and committed partnership" },
        { label: "Also", value: "What the native seeks in and attracts through relationship" },
        { label: "In some traditions", value: "Business partners and shared wealth" },
      ],
      points: [
        "It is read for the nature of the partner and the patterns of the native's closest unions",
      ],
    },
  ],
};
