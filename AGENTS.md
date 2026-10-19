# AGENTS.md

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project documentation: Keep documentation and memory in sync (do this every session, not just when asked)

This repo's `docs/` folder is the primary onboarding path for the next
agent that picks up this project - treat it as part of the deliverable,
not an afterthought.

- Whenever you make a change that affects architecture or a newly-confirmed (or newly-disproven)
  piece of knowledge, update the relevant file under `docs/` in the **same
  turn**, not "later":
  - [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - code structure, old
    vs new implementations, how to run/test things.
  - [`docs/LESSONS_LEARNED.md`](docs/LESSONS_LEARNED.md) - add a new bug
    only once it's actually root-caused and fixed (or confirmed to be a
    non-bug), not a running list of hunches.
  - [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) - small, non-urgent
    gaps you notice but decide not to fix in the moment (e.g. while
    focused on something else). Add an entry here instead of letting it
    evaporate at the end of the session; delete the entry once it's
    actually fixed.
  - Don't let these drift into duplicating each other - if a fact belongs
    in one place, link to it from the others instead of copy-pasting.
- If you maintain your own persistent memory (e.g. a memory tool with
  per-repo notes), keep [`docs/memory-archive/`](docs/memory-archive/) in
  sync with it: when you add or materially edit a repo-memory file, copy
  the updated version into `docs/memory-archive/` (and update its
  `README.md` index if you add a new one) so an agent without access to
  your memory tool still has the full picture. `docs/memory-archive/` is
  an explicit point-in-time **snapshot** of memory, not live storage -
  don't let it silently go stale for long.
  - Keep in mind this repo is public, so don't put any private/PII from your memory inside the memory archive.
