"use client";

/* FcLink — an inline word/phrase in the chart that opens its flashcard. It always
   trails the shared FlashcardIcon, so every clickable-to-flashcard word reads the
   same way across the whole birth-chart app (one source, can't drift). */
import type { ReactNode } from "react";
import { FlashcardIcon } from "@/components/flashcards/FlashcardIcon";

export function FcLink({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  /** Extra class(es) appended to `fc-link` (e.g. a context-specific style like `eb-name`). */
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className ? `fc-link ${className}` : "fc-link"}
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
