---
name: feedback-flag-before-fixing
description: Flag unrelated bugs found while working on something else and ask before fixing, rather than silently fixing or ignoring
metadata:
  type: feedback
---

When a bug or issue is noticed that's outside the current task's scope (found incidentally while reading/editing other code), flag it clearly with enough detail to act on, then ask whether to fix it now — don't silently fix it and don't silently ignore it either.

**Why:** this pattern repeated many times across the project's history (a build-breaking leftover asset reference, a stray broken import, a hardcoded-to-zero results field, an events table that accumulated stale rows on reconversion, a dead unused method) and every time the response was an affirmative "yes please" to the offered fix — a consistently validated judgment call, not a one-off.

**How to apply:** after completing the requested task, if something adjacent looks broken or stale, name the file/line and the concrete symptom, then offer to fix it as a follow-up rather than bundling it into the current change uninvited. See `project_sor2pdfweb_overview.md` for the kind of project this applies to.
