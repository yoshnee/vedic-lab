/* The closing call-to-action at the foot of the landing page — one last prompt to
   open the Birth Details popup (the same modal as the hero CTA and the demo). */
export function FinalCTA({ onOpen }: { onOpen: (btn: HTMLButtonElement) => void }) {
  return (
    <section className="final-cta">
      <button type="button" className="final-cta-btn" onClick={(e) => onOpen(e.currentTarget)}>
        Cast your first chart and start studying
      </button>
    </section>
  );
}
