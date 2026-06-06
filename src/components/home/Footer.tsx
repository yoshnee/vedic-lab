/* Site-wide footer: copyright, AGPL-3.0 source link, live-site link. */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <span className="site-footer-brand">
          <Svg className="site-footer-mark" html={diamond(20, { glow: true })} />
          © {SITE.year} {SITE.owner}
        </span>
        <span className="site-footer-links">
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            Open source under AGPL-3.0
          </a>
          <a href={SITE.liveUrl} target="_blank" rel="noopener noreferrer">
            {SITE.liveUrl.replace(/^https?:\/\//, "")}
          </a>
        </span>
      </div>
    </footer>
  );
}
