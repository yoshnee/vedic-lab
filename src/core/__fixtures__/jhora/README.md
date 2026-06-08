# JHora ground-truth fixtures

23 birth charts computed by **JHora (Jagannatha Hora)** — P.V.R. Narasimha Rao's software — used as
ground truth for the engine tests in `../../__tests__/fixtures.test.ts` (run via `npm test`).

## Source

Vendored from the Hora-Prakash reference repo, `src/core/__fixtures__/jhora-ground-truth/`:
<https://github.com/PriyankGahtori/hora-prakash>

Each file is **trimmed** to what the engine validates — `meta`, `birth`, `_jhora_ayanamsa`,
`planets`, `dasha`. The upstream originals also carry `panchang`, `divisionals` (D1/D9/D60…),
`shadbala`, and `ashtakavarga` (~3.7 MB total vs. ~145 KB trimmed). **Re-vendor the full files** if/when
those engine features land and need ground truth — keep the same `birth`/`planets`/`dasha` shape so the
existing test keeps working.

## Shape

```jsonc
{
  "meta":   { "name": "Mahatma Gandhi", "slug": "Mahatma_Gandhi", ... },
  "birth":  { "dob": "1869-10-02", "tob": "08:40:00", "timezone": "+05:30", "lat": 21.633333, "lon": 69.6 },
  "_jhora_ayanamsa": "22-02-17.46",
  "planets": { "Lagna": {...}, "Sun": { "longitude", "sign", "sign_degree", "nakshatra",
               "nakshatra_lord", "pada", "navamsa_sign", "retrograde" }, ... },
  "dasha":  { "Mercury": { "start": "1854-11-29", "antardashas": { "Mercury": "...", "Ketu": "...", ... } }, ... }
}
```

`planets` also lists upagrahas (Maandi, Gulika, Bhava/Hora/Ghati Lagna) the engine doesn't compute —
the test iterates the engine's own bodies, so the extras are ignored.

## Known extract quirks (handled in the test)

- **Nakshatra name variants** → mapped to our canonical names: `Pushyami→Pushya`, `Shravan→Shravana`,
  `Anu→Anuradha`, `Dhanishtha→Dhanishta`.
- **Empty `nakshatra_lord`** on `"Anu"`-abbreviated entries (an upstream extract gap). The test asserts
  the lord only when present; the nakshatra *name* is always checked, which fixes the lord anyway.
- **Dasha start drift** (linear-vs-JHora method gap, documented in the reference's
  `DASHA_CALCULATION_METHODS.md`): observed maxima across these 23 charts are MD ≤3.90d, AD ≤4.55d.
