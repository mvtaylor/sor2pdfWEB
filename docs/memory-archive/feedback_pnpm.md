---
name: feedback-pnpm
description: Use pnpm, not npm/npx, for all commands in sor2pdfWEB
metadata:
  type: feedback
---

Use `pnpm` (not `npm`/`npx`) for installs and running `astro` commands in this repo.

**Why:** explicitly corrected mid-session after an `npx astro build` call ("Instead, use pnpm"). The repo had already migrated from npm to pnpm (old `package-lock.json` renamed aside, `pnpm-lock.yaml` is the live lockfile).

**How to apply:** `pnpm install`, `pnpm astro dev --background`, `pnpm astro build`, `pnpm astro check`, `pnpm add <pkg>`, etc. Don't fall back to `npm`/`npx` for this project even if it seems equivalent.
