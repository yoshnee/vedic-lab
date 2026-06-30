# Vendored Hora Prakash reference (HISTORICAL — no longer a test gate)

Copies of the canonical reference implementation, vendored from
**https://github.com/PriyankGahtori/hora-prakash** (`main`, fetched 2026-06-10):

- `src/core/shadbala.js` — the canonical Shadbala (six-fold strength) implementation
- `src/core/divisional.js` — its varga dependency (`calcDivisional`)
- `src/utils/time.js` — its `jdToDate` dependency

The upstream directory shape is replicated so the relative imports inside the files
resolve unmodified.

**Status:** these files were once driven by a differential **parity gate** that ran
our engine (`src/core/shadbala.ts`) and this upstream code on the same charts and
asserted every component agreed within 0.1 virupa. **That gate has been retired.**
The engine has since been re-anchored to classical BPHS and now deliberately
diverges from this upstream on five documented points (Moon Cheshta source,
luminary Ayana in Kala, the Saptavargaja varga set, Ojayugma summation, Mercury
Ayana), so byte-parity no longer holds. The engine is now guarded instead by a
fixed-expectations regression snapshot (`../shadbala-regression.test.ts`).

These files are now **retained only for provenance / historical comparison**.
**Nothing in the test or build path imports them.** All three (`shadbala.js`,
`divisional.js`, `time.js`) are left **byte-identical to upstream** — no header
insertion — so they stay a pristine baseline for any future re-vendor or
comparison. The historical framing lives here in this README, not in the files.

**License & copyright:** these files are © the hora-prakash authors
(Priyank Gahtori and contributors) and are redistributed here under the
**AGPL-3.0**, the same license as this repository — see the upstream repo's
LICENSE for the full text. The upstream sources carried no per-file headers;
this README is the preserved attribution.

Because nothing imports them, they are not part of the Vitest suite and do not
ship in the client bundle.
