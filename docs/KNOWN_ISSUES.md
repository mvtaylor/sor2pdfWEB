# Known issues

Small, non-urgent gaps noticed in passing but not fixed in the moment.
Delete an entry once it's actually fixed.

## `calculateWithMarkers()` has a type error (`astro check` currently fails)

`src/lib/render-results.ts:128` builds `dataPoints` as `number[][]` (via
`markers.map(m => [m.x, m.y])`-style construction) and passes it to
`SorReader.calcAvgSlope(dataPoints: [number, number][])`
(`src/lib/otdr/sor-reader.ts`). TypeScript correctly flags this
(`ts(2345)`: `number[]` isn't assignable to the 2-tuple `[number, number]`)
because a generic array literal doesn't statically guarantee exactly two
elements. `astro build`/`astro dev` don't care (no type-checking), but
`pnpm astro check` currently exits non-zero because of this. Needs either
building `dataPoints` as actual tuples, or relaxing
`calcAvgSlope`'s parameter type to `number[][]` with a runtime length
check.

## `Cksum` block is structurally located but never read

The `Map` block correctly records `Cksum`'s byte offset/size, but nothing
parses or validates its contents — `RawBlocks.cksum` and
`TranslatedBlocks.cksum` are both always `null`
(`src/lib/otdr/sor/translation.ts`). There's no corruption/integrity check
on parsed files.

## `findAvgSlope()` is dead code

`SorReader.findAvgSlope()` (`src/lib/otdr/sor-reader.ts`) averages the
`slope_dBPerkm` of all non-reflective events, but nothing calls it — the
"Average slope (dB/km)" field in the report is instead driven by the
marker-based `SorReader.calcAvgSlope()` (a different, static method) via
`calculateWithMarkers()` in `render-results.ts`. Either wire
`findAvgSlope()` into something or remove it.

## Harmless unused-import/variable warnings

`pnpm astro check` reports several `ts(6133)`/`ts(6192)`/`ts(6196)`
warnings that don't block anything but are worth cleaning up eventually:
- `GenParamsTranslated` import and `inputFormEl` variable in
  `src/components/Sor2Pdf.astro`
- `KeyEventsTranslated`/`TraceDataTranslated` imports in
  `src/lib/convert.ts`
- `blockName` enum in `src/lib/otdr/sor/blocks.ts`
- `blockStarters` import in `src/lib/otdr/sor/sor-file.ts`
- unused `prop` loop variable in `src/lib/render-results.ts`

## No way to force "Save as PDF" as the print destination

The "Save to PDF" button in `Sor2Pdf.astro` calls `window.print()`, which
opens the browser's native print dialog — there's no web API that lets a
page pre-select or force a destination (e.g. "Save as PDF" vs. a physical
printer); that's deliberately walled off from page JS. The button does set
`document.title` first so that *if* the user picks "Save as PDF", the
suggested filename is meaningful rather than the page's default title.

## 2-marker cap has no user-facing explanation

`convert.ts`'s chart `onClick` silently ignores shift-clicks once
`markers.length >= 2` (the "average slope between two markers" feature only
needs two points) — there's no visible feedback telling the user why a
third shift-click did nothing.
