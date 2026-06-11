# Vendored Hora Prakash reference (test-only)

Byte-identical copies of the canonical reference implementation, vendored from
**https://github.com/PriyankGahtori/hora-prakash** (`main`, fetched 2026-06-10):

- `src/core/shadbala.js` — the canonical Shadbala (six-fold strength) implementation
- `src/core/divisional.js` — its varga dependency (`calcDivisional`)
- `src/utils/time.js` — its `jdToDate` dependency

The upstream directory shape is replicated so the relative imports inside the files
work unmodified — do **not** edit these files; re-vendor to update.

**Purpose:** the differential parity gate (`../shadbala-parity.test.ts`) runs our
engine (`src/core/shadbala.ts`) and this upstream code on the same charts and asserts
every component agrees within 0.1 virupa. Our port is only trusted because this gate
passes.

**License & copyright:** these files are © the hora-prakash authors
(Priyank Gahtori and contributors) and are redistributed here under the
**AGPL-3.0**, the same license as this repository — see the upstream repo's
LICENSE for the full text. The upstream sources carry no per-file headers; this
notice is the preserved attribution. The files themselves are intentionally NOT
edited (no header insertion) so they stay byte-identical to upstream — that
byte-identity is what gives the parity gate its authority.

These files are used by the Vitest suite only — they live under `__tests__/`
and are never imported by application code, so they do not ship in the client
bundle.
