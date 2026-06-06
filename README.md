# Vedic Astrology Lab

*Learn the science of light — chart, study & explore Jyotish.*

🔗 **Live:** https://studyvedicastrology.kerjasama.dev
📦 **Source:** https://github.com/yoshnee/vedic-lab

Vedic Astrology Lab is a free, browser-based tool for studying Jyotish (Vedic astrology) and generating interactive birth charts. It runs entirely client-side — no backend, no signup.

---

## Features

**Study — flashcard decks**

- Planets (Navagraha), Houses (Bhavas), Signs (Rashis), Nakshatras, Aspects (Drishti), and Shadbala
- Tap a deck to study; flip each card to reveal its meaning. More decks added over time.

**Birth Chart Analyzer**

- Enter a birth date, time, and place to generate an interactive North Indian (D1) chart
- Houses are color-coded by their sign ruler; planet icons show dignity (exalted / debilitated / own sign) and retrograde (R)
- Expandable per-planet panels: nakshatra & lord, dignity, Vimshottari dasha, sade sati, and aspects

---

## Tech

- React / Next.js, deployed on Vercel — fully client-side
- Planetary positions via [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm) (Swiss Ephemeris compiled to WebAssembly)
- Sidereal **Lahiri** ayanamsa; Ketu computed as Rahu + 180°
- Location search via OpenStreetMap **Nominatim**; timezone via **timeapi.io**

---

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
```

> Note: the Swiss Ephemeris WASM needs Cross-Origin Isolation (SharedArrayBuffer). Set COOP/COEP response headers on Vercel, or the engine won't load.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This is required by the underlying Swiss Ephemeris library: any software incorporating Swiss Ephemeris must either be released under the AGPL (or a compatible copyleft license), or use a commercial license from Astrodienst AG.

Because this is a public web service, the complete corresponding source is available in this repository. See [LICENSE](./LICENSE) for the full text.

---

## Credits & references

- [Swiss Ephemeris](https://www.astro.com/swisseph/) by Astrodienst AG — the astronomical engine
- [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm) by prolaxu — Swiss Ephemeris compiled to WebAssembly
- [Hora Prakash](https://github.com/PriyankGahtori/hora-prakash) — reference for calculation methodology
- [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap) — geocoding
- [timeapi.io](https://timeapi.io/) — timezone lookup

---

## Copyright

© 2026 Kerjasama LLC. Licensed under AGPL-3.0.

Swiss Ephemeris © Astrodienst AG — copyright notices preserved as required by the license.
