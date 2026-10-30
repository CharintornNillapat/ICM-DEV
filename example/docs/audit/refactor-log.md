# Refactor log

Append-only, newest entry first. One entry per **shipped phase**, never per commit.

Every entry keeps these headings, even when one is "none":

```
## Phase NNN - <title>: T001-T003 (<date>, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `NNNN`. <the brief, one or two sentences>

**Changed:** <files and what changed>
**Verified:** <gate commands and their results>
**Surprises:** <or none>
**Deliberately not done:** <or none>
```

## Phase 001 - accents: T001 (2026-10-30, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `0002`. `slugify` keeps the base letter of accented Latin letters instead of turning them into hyphens: `'Café au lait'` becomes `'cafe-au-lait'`.

**Changed:** `docs/audit/decisions/0002-keep-accent-base-letters.md` (new ADR); `src/slugify.js` (NFD normalize and drop U+0300 to U+036F before lowercasing); `test/slugify.test.js` (two tests for accented Latin letters); `docs/contexts/slugify.md` (Traps line now states the accent rule); `docs/audit/refactor-log.md` (this entry); `docs/audit/task-ledger.md` (Phase 001 section and T001 row).
**Verified:** npm run lint exit 0; node --test test/slugify.test.js tests 6 pass 6 fail 0; npm test tests 6 pass 6 fail 0; node --test e2e/cli.test.js tests 1 pass 1 fail 0; npm run test:e2e left to the reviewer
**Surprises:** none.
**Deliberately not done:** no transliteration of `ø`, `ł`, `đ`, `ß`, `æ`, `œ`; no non-Latin scripts; no version bump.
