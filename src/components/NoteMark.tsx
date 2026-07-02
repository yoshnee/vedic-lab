/* NoteMark — a miniature of our reading-notes sticky note (see StickyNote / .sn):
   dark card, gold top edge, a gold diamond dot + title, a couple of "written"
   lines with a blinking caret. Two sizes: a tiny "chip" (the AnalyzerHero moment
   row + the reading-notes launcher affordance) and a larger "demo" (the hero's
   third beat). Styles live in app.css under ".az-note". Purely decorative. */
export function NoteMark({ variant }: { variant: "chip" | "demo" }) {
  return (
    <span className={"az-note az-note--" + variant} aria-hidden="true">
      <span className="az-note-head">
        <i className="az-note-dot" />
        {variant === "demo" && <span className="az-note-title">Dashas</span>}
      </span>
      <span className="az-note-body">
        <i />
        <i />
        <i className="az-note-cursor" />
      </span>
    </span>
  );
}
