/* App identity header: chart-diamond logo + wordmark + tagline. */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { SITE } from "@/lib/site";

export function AppHeader() {
  return (
    <header className="app-header">
      <Svg className="app-mark" html={diamond(60, { glow: true })} />
      <h1 className="app-wordmark">{SITE.name}</h1>
      <p className="app-tagline">{SITE.tagline}</p>
    </header>
  );
}
