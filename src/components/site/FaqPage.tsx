/* ============================================================
   FaqPage — the FAQ route. Native <details> accordion (no JS state,
   keyboard-accessible). First item open by default. Data-driven.
   ============================================================ */
import { PageHero } from "./PageHero";
import { FAQS, type Faq } from "@/data/faq";

function FaqItem({ item, open }: { item: Faq; open: boolean }) {
  return (
    <details className="faq" open={open}>
      <summary>
        <span className="faq-q">{item.q}</span>
        <span className="faq-mark" aria-hidden="true" />
      </summary>
      <div className="faq-a">
        <p>{item.a}</p>
      </div>
    </details>
  );
}

export function FaqPage() {
  return (
    <main className="page">
      <PageHero
        eyebrow="FAQ"
        title="Questions & answers"
      />

      <div className="faq-list">
        {FAQS.map((f, i) => (
          <FaqItem key={f.q} item={f} open={i === 0} />
        ))}
      </div>
    </main>
  );
}
