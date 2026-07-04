/* A captivating hook that sits between the identity lockup and the Birth Chart
   Workspace: an eye-drawing question (gold, with a slow shimmer sweep + soft glow
   pulse) over a calm sub-hook line. Purely presentational — all motion is CSS
   (see `.selflearn` in app.css), reduced-motion aware, no dependencies. */
export function SelfLearnHook() {
  return (
    <section className="selflearn">
      <h2 className="selflearn-q">
        Are you attempting to <span className="selflearn-nb">self-learn</span> Vedic astrology?
      </h2>
      <p className="selflearn-hook">
        Other tools render a chart and leave you alone.{" "}
        <span className="selflearn-hook-emph">This one helps you study it.</span>
      </p>
    </section>
  );
}
