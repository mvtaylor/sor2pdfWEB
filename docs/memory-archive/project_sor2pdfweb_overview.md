---
name: project-sor2pdfweb-overview
description: What sor2pdfWEB is, how it's distributed, and the licensing decision behind its parser
metadata:
  type: project
---

`sor2pdfWEB` is an Astro **component library** that parses `.sor` (Telcordia SR-4731 OTDR) files entirely client-side and renders a printable report (exported to PDF via the browser's own print dialog). It's meant to be imported into a separate "main site" project, not deployed standalone.

**Distribution:** the main site consumes it as a **GitHub git dependency** (`pnpm add github:mvtaylor/sor2pdfWEB`, ideally pinned to a tag, e.g. `#v0.1.0`), not a local/workspace path — chosen explicitly over a monorepo/workspace setup and over a local `file:` path, even though both repos can live on the same machine. The repo is private on GitHub; this required re-resolving the git dependency over HTTPS instead of SSH in the main site's lockfile so CI (which has no SSH key) could fetch it (`pnpm update sor2pdfWEB` re-records the resolution).

**Why the parser is written from scratch:** jsOTDR (https://github.com/sid5432/jsOTDR) was considered as a base, but its actual `LICENSE` file is GPLv3 despite `package.json` claiming ISC. Since this library is meant to be imported into other (potentially differently-licensed) projects, copying jsOTDR's code would have imposed copyleft obligations on downstream consumers. jsOTDR was used only as a reference for the SR-4731 byte-format facts, never copied from. See `docs/ARCHITECTURE.md` and `docs/LESSONS_LEARNED.md` in this repo for the full technical detail — this memory is the "why," those are the "what/how."

**How to apply:** when suggesting dependencies, packaging changes, or referencing other OTDR/SOR tooling for this project, keep both constraints in mind — it ships as a source-importable package (no build step for consumers) and needs to stay license-clean for reuse elsewhere.
