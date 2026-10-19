# Architecture

## What this is

`sor2pdfWEB` is an Astro **component library** (not a standalone site): it's
meant to be installed into a separate "main site" project and imported from
there, rather than deployed on its own. See the root `README.md` for the
one-line pitch; this file is about how the code is organized.

It parses `.sor` files (the Telcordia SR-4731 "Standard OTDR Record" binary
format used by fiber-optic OTDR test equipment) entirely in the browser and
renders a printable report — the user prints to PDF via the browser's own
print dialog rather than this project generating a PDF file directly.

## Package shape

- `package.json` declares `exports` pointing straight at `src/index.ts` and
  `src/*` — there is no build/dist step for consumers; the main site's own
  Vite/Astro pipeline compiles this package's `.ts`/`.astro` source directly
  out of `node_modules`.
- `astro` is a `peerDependency` (the consuming site supplies its own), but
  also a `devDependency` here so `astro dev`/`astro build`/`astro check` work
  standalone while developing this package.
- `src/pages/` and `src/layouts/` (if present) exist **only** for local dev
  preview (`astro dev`) and are excluded from the package via the `files`
  field in `package.json` — they are not part of the public API.
- The only thing currently exported from `src/index.ts` is the `Sor2Pdf`
  component.

## Data flow

```
File (.sor)
  -> BinaryReader (src/lib/otdr/binary-reader.ts)
       cursor-based reader over an ArrayBuffer (DataView), not Node fs-based
  -> ParsedSORFile (src/lib/otdr/sor/sor-file.ts)
       reads the Map block, then each data block (GenParams, SupParams,
       FxdParams, KeyEvents, DataPts) in raw units -> RawBlocks
  -> translation.ts (src/lib/otdr/sor/translation.ts)
       converts RawBlocks -> TranslatedBlocks: raw integer units into
       real-world units (meters, dB, Date, etc.)
  -> SorReader (src/lib/otdr/sor-reader.ts)
       public query API over a ParsedSORFile: results(), tracedata(),
       findSpanLength(), reflective/non-reflective event filtering, etc.
  -> render-results.ts + convert.ts
       render-results.ts populates the report's DOM (tables, events list);
       convert.ts builds the Chart.js loss-profile graph and the
       click-to-annotate marker feature
  -> Sor2Pdf.astro
       the single public component: file input, "Create Report" button,
       wires all of the above together, "Save to PDF" triggers window.print()
```

### Why not just port an existing SOR parser?

[jsOTDR](https://github.com/sid5432/jsOTDR) was evaluated as a reference
implementation early on, but ruled out for direct reuse: its `LICENSE` file
is GPLv3 (its `package.json` claims `"ISC"`, which is simply wrong/stale).
Copying its code into this library would pull GPLv3's copyleft obligations
into anything that later imports this library. It's also Node-only (its
`binary-file` dependency wraps `fs.open/read` by file descriptor + path,
which doesn't exist in a browser — there's no equivalent of a filesystem
path for a browser `File`/`ArrayBuffer`).

The parser here (`src/lib/otdr/`) is written from scratch. jsOTDR's source
was consulted only to understand the SR-4731 byte layout itself (block
structure, field order, the `eventType` code format) — facts about a format
aren't copyrightable, only a specific expression of code is.

## SOR block structure

A `.sor` file is a `Map` block (a table of contents: block name, version,
byte size for each block) followed by the blocks themselves, always in this
order: `GenParams`, `SupParams`, `FxdParams`, `KeyEvents`, `DataPts`,
`Cksum`. `src/lib/otdr/sor/blocks.ts` defines the raw (`*Block`) and
translated (`*Translated`) TypeScript shape for each. `Cksum` is **not**
currently parsed/validated — see `docs/KNOWN_ISSUES.md`.

Each `KeyEvent`'s 8-character `eventType` code follows the pattern
`(subtype)(manual/auto)9999LS`. The first character is the authoritative
signal for whether an event is reflective — see
`docs/LESSONS_LEARNED.md` for why you can't infer this from
`reflectionLoss_dB` instead.

## Chart + annotations

`src/lib/convert.ts` builds a Chart.js `"line"` chart of the trace data
(`(distance_m, opticLevel_dB)` pairs) using `chartjs-plugin-annotation` for
user-placed "marker" annotations (shift-click on the chart). The `markers`
array lives in `Sor2Pdf.astro`'s script scope and is passed **by reference**
into `createChart()`/`clearMarkers()` in `convert.ts`, so both sides observe
the same state — this matters; see the `nextMarker` entry in
`docs/LESSONS_LEARNED.md` for what goes wrong if you instead pass a
primitive counter across that boundary.

Placing exactly two markers enables "Calculate results", which computes the
average slope (dB/km) between them via `SorReader.calcAvgSlope()`.

## How to run things

```
pnpm install
pnpm astro dev --background   # per AGENTS.md; manage with `astro dev stop` / `status` / `logs`
pnpm astro build
pnpm astro check               # type-check — NOT run automatically by `astro dev`, see LESSONS_LEARNED
```

There is no automated test suite yet. Manual verification during
development has been done by loading a real `.sor` sample file through the
UI. For debugging canvas/Chart.js rendering issues specifically (where
`astro check`/`astro build` passing doesn't tell you whether something
visually renders), a disposable Playwright script driving a headless
Chromium against the local dev server (screenshotting the page, reading
`console`/`pageerror` events) proved effective and is worth reaching for
again rather than guessing from source alone — Playwright + a cached
Chromium build were already available on the dev machine via
`npx playwright install chromium`.
