/* FlashcardIcon — the single "open a flashcard / deck" mark used everywhere in
   the app. It is the Jyotish diamond (the brand mark), so every flashcard-open
   affordance — the planet-panel launcher, the Reading-Notes deck buttons, the
   flashcard popover header — renders the SAME symbol from ONE source. Change the
   mark here and it updates in every place at once. */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";

export function FlashcardIcon({ size = 16, className }: { size?: number; className?: string }) {
  return <Svg className={className} html={diamond(size, { glow: true })} />;
}
