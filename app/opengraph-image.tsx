/* ============================================================
   opengraph-image.tsx — the social share card.

   Next.js renders this to a 1200×630 PNG at /opengraph-image and auto-injects
   the <meta property="og:image"> (and, via twitter-image, the Twitter card) for
   every route, resolved absolutely from metadataBase. So linking the site (e.g.
   in iMessage / Slack / X) shows the chart-diamond logo, the wordmark, and the
   tagline.

   Everything pulls from the design system: the brand name + tagline from SITE,
   the colors from the canonical tokens, and the logo is the same North Indian
   chart-diamond mark as Celestial.diamond() — rebuilt here filter-free (a radial
   glow instead of feGaussianBlur) so the OG rasterizer (Satori + resvg) renders
   it crisply. Fonts (Space Grotesk + Space Mono) are pulled from Google at the
   exact glyphs used; if a fetch fails the card still renders in the default face.
   ============================================================ */
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ---- design tokens (mirrors tokens.css / colors.ts — keep in sync) ---- */
const BG = "#081410";
const ACCENT = "#E4C257";
const TEXT = "#ECF3EC";
const TEXT_2 = "#A6BBAB";
const TEXT_3 = "#67806F";
const BORDER = "#274F38";

/* The chart-diamond logo — the square + diagonals + inner diamond holding a
   single gold point of light (Celestial.diamond, rebuilt without the blur
   filter so the OG rasterizer renders it). Embedded as an <img> data URI. */
const LOGO = `
<svg xmlns="http://www.w3.org/2000/svg" width="176" height="176" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF6D8"/>
      <stop offset="42%" stop-color="#F3C85A" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#F3C85A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="30" fill="url(#glow)"/>
  <g fill="none" stroke="${ACCENT}" stroke-linejoin="round" stroke-linecap="round">
    <rect x="9" y="9" width="82" height="82" rx="7" stroke-width="4.4"/>
    <path d="M9 9 L91 91 M91 9 L9 91" stroke-width="2.3" stroke-opacity="0.78"/>
    <path d="M50 9 L91 50 L50 91 L9 50 Z" stroke-width="3.5"/>
  </g>
  <path d="M50 37 L52.6 47.4 L62 50 L52.6 52.6 L50 62 L47.4 52.6 L38 50 L47.4 47.4 Z" fill="#FFF3CE"/>
  <circle cx="50" cy="50" r="3.4" fill="#FFFBEF"/>
</svg>`;
const LOGO_SRC = `data:image/svg+xml,${encodeURIComponent(LOGO)}`;

/* Every glyph any line might use — passed to the Google subsetter so no
   character renders as tofu regardless of how SITE copy is edited. */
const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &.,-/:";

/** Fetch a single weight of a Google font, subset to `text`. Returns the raw
    font bytes, or null if anything fails (the card then falls back to default). */
async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  const url =
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}` +
    `&text=${encodeURIComponent(text)}`;
  try {
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const domain = SITE.liveUrl.replace(/^https?:\/\//, "");
  // Tagline split into two lines on the sentence break (period kept on line 1).
  const [line1, line2 = ""] = SITE.tagline.split(". ");

  const [grotesk600, grotesk400, mono400] = await Promise.all([
    loadFont("Space Grotesk", 600, CHARSET),
    loadFont("Space Grotesk", 400, CHARSET),
    loadFont("Space Mono", 400, CHARSET),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }[] = [];
  if (grotesk600) fonts.push({ name: "Grotesk", data: grotesk600, weight: 600, style: "normal" });
  if (grotesk400) fonts.push({ name: "GroteskLight", data: grotesk400, weight: 400, style: "normal" });
  if (mono400) fonts.push({ name: "Mono", data: mono400, weight: 400, style: "normal" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle at 50% 38%, rgba(228,194,87,0.14) 0%, rgba(8,20,16,0) 56%)`,
          fontFamily: "Grotesk",
          position: "relative",
        }}
      >
        {/* inset frame — echoes the chart-card border */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: `1px solid ${BORDER}`,
            borderRadius: 28,
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} width={176} height={176} alt="" style={{ marginBottom: 30 }} />

        <div
          style={{
            fontFamily: "Grotesk",
            fontWeight: 600,
            fontSize: 76,
            letterSpacing: -2,
            color: TEXT,
            lineHeight: 1,
          }}
        >
          {SITE.name}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 26,
          }}
        >
          <div style={{ fontFamily: "GroteskLight", fontSize: 34, color: ACCENT, lineHeight: 1.2 }}>
            {`${line1}.`}
          </div>
          {line2 && (
            <div
              style={{
                fontFamily: "GroteskLight",
                fontSize: 30,
                color: TEXT_2,
                lineHeight: 1.2,
                marginTop: 6,
              }}
            >
              {line2}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            fontFamily: "Mono",
            fontSize: 20,
            letterSpacing: 3,
            color: TEXT_3,
          }}
        >
          {domain}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
