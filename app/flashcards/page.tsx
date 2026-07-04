import type { Metadata } from "next";
import { FlashcardsApp } from "@/components/flashcards/FlashcardsApp";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Study decks for every corner of Jyotish: planets, houses, signs, nakshatras, dashas and more. Flip each card to reveal its meaning.",
  alternates: { canonical: "/flashcards" },
};

export default function Page() {
  return <FlashcardsApp />;
}
