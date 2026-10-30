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

## Phase 002 - slug-limit: T002, T003 (2026-10-30, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `0003`. `slugify` returns at most 80 characters, cut at the last hyphen at or before the limit so no word is split; a first word longer than 80 is cut at 80.

**Changed:** `docs/audit/decisions/0003-cap-slug-length.md` (new ADR); `src/slugify.js` (MAX_LENGTH 80, cut at the last hyphen at or before index 80 after the slug is built); `test/slugify.test.js` (three tests for the 80-character cap); `docs/contexts/slugify.md` (Invariants line for the length rule); `README.md` (Limits section for the 80-character cap, T003); `docs/audit/refactor-log.md` (this entry, amended by T003); `docs/audit/task-ledger.md` (Phase 002 section and T002 and T003 rows).
**Verified:** npm run lint exit 0; node --test test/slugify.test.js tests 9 pass 9 fail 0; npm test tests 9 pass 9 fail 0; node --test e2e/cli.test.js tests 1 pass 1 fail 0; npm run test:e2e left to the reviewer
T003: docs only, no code tier: README edit 1 text present once and MAX_LENGTH 80 (ok, ok, exit 0); README eol i/lf w/crlf; cap check 77 80 80 and true; log names Phase 002 and README.md; em dash 0 in diff and in spec
**Surprises:** none.
**Deliberately not done:** no option or CLI flag for the limit; no ellipsis or marker on a cut slug; no version bump; no `MAX_LENGTH` export.

## Phase 001 - accents: T001 (2026-10-30, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `0002`. `slugify` keeps the base letter of accented Latin letters instead of turning them into hyphens: `'Café au lait'` becomes `'cafe-au-lait'`.

**Changed:** `docs/audit/decisions/0002-keep-accent-base-letters.md` (new ADR); `src/slugify.js` (NFD normalize and drop U+0300 to U+036F before lowercasing); `test/slugify.test.js` (two tests for accented Latin letters); `docs/contexts/slugify.md` (Traps line now states the accent rule); `docs/audit/refactor-log.md` (this entry); `docs/audit/task-ledger.md` (Phase 001 section and T001 row).
**Verified:** npm run lint exit 0; node --test test/slugify.test.js tests 6 pass 6 fail 0; npm test tests 6 pass 6 fail 0; node --test e2e/cli.test.js tests 1 pass 1 fail 0; npm run test:e2e left to the reviewer
**Surprises:** none.
**Deliberately not done:** no transliteration of `ø`, `ł`, `đ`, `ß`, `æ`, `œ`; no non-Latin scripts; no version bump.
