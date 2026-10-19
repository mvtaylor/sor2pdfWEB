# Lessons learned

Bugs that have actually been root-caused and fixed (or confirmed to be a
non-bug), recorded so the next agent doesn't have to re-diagnose them from
scratch. See `docs/ARCHITECTURE.md` for how the pieces referenced below fit
together.

## Untyped array literals don't infer as tuples

`calculateWithMarkers()` (`render-results.ts`) built `const dataPoints = []`
and pushed `[marker.x, marker.y]` into it, then passed it to
`SorReader.calcAvgSlope(dataPoints: [number, number][])`. TypeScript flagged
`ts(2345)`: `number[]` isn't assignable to the 2-element tuple
`[number, number]`. Without a contextual type, a pushed array literal like
`[marker.x, marker.y]` widens to the general `number[]` — TypeScript doesn't
infer "exactly 2 elements" from it, even though at runtime it always would
be. Fix: annotate the array up front, `const dataPoints: [number, number][]
= []`, so each `.push(...)` is checked against the tuple type instead of
inferred freely.

## `JSON.stringify()` on a `Map` always prints `"{}"`

A debug `console.log` of a computed `Map<string, number>` kept appearing
empty even though the map-building logic was correct. `JSON.stringify()`
doesn't serialize `Map` entries — a `Map` has no own enumerable
string-keyed properties and defines no `toJSON()`, so
`JSON.stringify(new Map([["a", 1]]))` is `"{}"` regardless of contents.
Fix: convert with `Object.fromEntries(map)` before stringifying for
debug output.

## Unnecessary `async` broke chart assignment

`createChart()` in `convert.ts` was declared `async` despite nothing inside
it actually awaiting anything (`new Chart(...)` is synchronous). That meant
it returned `Promise<Chart<...>>`, which failed to assign into a
non-Promise-typed `chart` variable. Fix: drop the needless `async`. General
rule: only mark a function `async` if its body actually needs to `await`
something.

## Chart.js generic type mismatch after that fix

Once `createChart()` returned a plain `Chart<...>` instead of a promise, a
*second*, previously-hidden type error surfaced: the trace data is stored as
`[number, number][]` tuples, but `let chart: Chart<"line">` (with only the
chart-type generic specified) defaults Chart.js's data-point generic to its
standard `(number | Point | null)[]` format. The declared type needs the
data generic spelled out explicitly wherever the chart variable's type is
annotated: `Chart<"line", [number, number][]>`.

## `reflectionLoss_dB === 0` is not how you detect non-reflective events

Early versions of `nonReflectiveEvents()`/`reflectiveEvents()` in
`sor-reader.ts` filtered on whether `reflectionLoss_dB` was exactly `0`.
This reliably returned nothing for "non-reflective" and everything for
"reflective", because real OTDR hardware essentially never measures exactly
`0.000 dB` reflectance, even for genuinely non-reflective splices.

The actual signal is the **first character of the raw 8-char `eventType`
code** (pattern `(subtype)(manual/auto)9999LS`, per the SR-4731 format):
`'0'` = non-reflective (loss/drop/gain), `'1'` = reflective, `'2'` =
multiple reflections. This is now decoded in `decodeEventType()`
(`translation.ts`) and is what `nonReflectiveEvents()`/`reflectiveEvents()`
filter on.

## `astro dev` does not type-check — a field rename broke the chart silently

`DataPointTranslated.attenuation_dB` was renamed to `opticLevel_dB` (to
match the "Optical level (dB)" axis label), but `sor-reader.ts`'s
`tracedata()` still read the old field name. This **is** a real TypeScript
error (`ts(2339)`), but `astro dev` runs on Vite/esbuild, which strips
types without checking them — so the app ran fine in the browser with
`dPoint.attenuation_dB` silently evaluating to `undefined` for every point.
The result: the main chart line never rendered (Chart.js had nothing valid
to plot, and its y-axis fell back to a default `0`–`1` range), while
shift-click annotations still appeared to "work" because they only need a
valid X coordinate to find the nearest point.

Lesson: after renaming a field that flows through several layers
(blocks.ts -> translation.ts -> sor-reader.ts -> convert.ts), run
`pnpm astro check` — don't rely on the dev server staying quiet as a sign
that nothing broke.

## Passing a mutable counter by value across a closure boundary

The "next marker number" was briefly tracked as a plain `let nextMarker`
variable in `Sor2Pdf.astro`, passed **by value** into
`createChart(canvas, sorReader, markers, nextMarker)`. The `onClick`
handler inside `createChart()` captured its own private copy of that
parameter and incremented it on every shift-click; incrementing never
touched the `Sor2Pdf.astro`-scope variable. So "Clear markers" resetting
its own `nextMarker = 1` had no effect on the counter the click handler
was actually using — numbering just kept climbing after a clear.

Fix: dropped the separate counter entirely and derived the marker number
from `markers.length + 1` instead. `markers` is an array (reference type)
shared between both files, so it never has this desync problem — which is
exactly why "clear the markers themselves" already worked correctly before
this fix, while "reset the counter" didn't. General lesson: don't pass a
primitive piece of mutable state across a closure/module boundary if both
sides need to observe updates to it — derive it from already-shared
reference state instead.

## jsOTDR's declared license doesn't match its actual license

`jsOTDR`'s `package.json` says `"license": "ISC"`, but its `LICENSE` file is
GPLv3. This was caught before any code was copied from it. See
`docs/ARCHITECTURE.md` ("Why not just port an existing SOR parser?") for
the resulting decision to write the parser from scratch, using jsOTDR only
as a reference for the SR-4731 format itself.
