/* The 27 Nakshatras — lunar mansions. Scaffolded: canonical names
   seeded in traditional order (Ashwini → Revati), bodies left empty.

   Standard 27-fold scheme (the basis of Vimshottari dasha). The
   intercalary 28th, Abhijit, is intentionally omitted; add it later
   only if a 28-fold treatment is wanted. Nakshatra lords / deities /
   symbols are content to fill against the reference repo, not seeded. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

const NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const nakshatras: Deck = {
  id: "nakshatras",
  title: "The 27 Nakshatras",
  subtitle: "Lunar Mansions",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: NAMES.map((name, i) => ({
    title: name,
    badge: String(i + 1).padStart(2, "0"),
    icon: { kind: "diamond" as const },
    body: "",
  })),
};
