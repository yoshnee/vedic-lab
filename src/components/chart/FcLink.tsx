"use client";

/* FcLink — an inline word/phrase in the chart that opens its flashcard. It always
   trails the shared FlashcardIcon, so every clickable-to-flashcard word reads the
   same way across the whole birth-chart app (one source, can't drift). */
import type { ReactNode } from "react";
import { FlashcardIcon } from "@/components/flashcards/FlashcardIcon";

export function FcLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="fc-link"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
      <FlashcardIcon size={11} className="fc-link-ico" />
    </button>
  );
}
