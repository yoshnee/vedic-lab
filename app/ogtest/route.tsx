import { ImageResponse } from "next/og";

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="176" height="176" viewBox="0 0 100 100"><defs><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF6D8"/><stop offset="42%" stop-color="#F3C85A" stop-opacity="0.5"/><stop offset="100%" stop-color="#F3C85A" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="30" fill="url(#glow)"/><g fill="none" stroke="#E4C257" stroke-linejoin="round" stroke-linecap="round"><rect x="9" y="9" width="82" height="82" rx="7" stroke-width="4.4"/><path d="M9 9 L91 91 M91 9 L9 91" stroke-width="2.3" stroke-opacity="0.78"/><path d="M50 9 L91 50 L50 91 L9 50 Z" stroke-width="3.5"/></g><path d="M50 37 L52.6 47.4 L62 50 L52.6 52.6 L50 62 L47.4 52.6 L38 50 L47.4 47.4 Z" fill="#FFF3CE"/><circle cx="50" cy="50" r="3.4" fill="#FFFBEF"/></svg>`;

export async function GET() {
  const url = new URL("http://x");
  const which = "all"; // placeholder
  void which; void url;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#081410" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml,${encodeURIComponent(LOGO)}`} width={176} height={176} alt="" />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
