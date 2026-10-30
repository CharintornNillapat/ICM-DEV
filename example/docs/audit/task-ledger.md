# Task ledger

Every task edits this file; only the task that ships a phase also writes `refactor-log.md`. Flip `Status` to `in-progress` when a task starts and fill `Gate result` when it lands. Leave `Commit` empty: the owner-approved deploy record fills every task's `Commit` cell once per phase, after the merge.

Status values: `todo`, `in-progress`, `done`, `dropped` (with a one-line reason).

## Phase template

Copy this block above the Backlog, with the branch's phase number, when the first task of a phase starts. Keep this section.

```
## Phase NNN - <title> (ADR NNNN)

Branch `phase-NNN-<slug>`, cut from `main` at `<sha>`. No production touch point.

| # | Task | Files | Status | Commit | Gate result |
|---|---|---|---|---|---|
| T001 | <one line> | `<path>`, `docs/audit/task-ledger.md` | in-progress | | |
```

## Phase 001 - accents (ADR 0002)

Branch `phase-001-accents`, cut from `main` at `df83222`. No production touch point.

| # | Task | Files | Status | Commit | Gate result |
|---|---|---|---|---|---|
| T001 | Keep the base letter of accented Latin letters | `docs/audit/decisions/0002-keep-accent-base-letters.md`, `test/slugify.test.js`, `src/slugify.js`, `docs/contexts/slugify.md`, `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md` | done | | npm run lint exit 0; node --test test/slugify.test.js tests 6 pass 6 fail 0; npm test tests 6 pass 6 fail 0; node --test e2e/cli.test.js tests 1 pass 1 fail 0; npm run test:e2e left to the reviewer |

## Phase 002 - slug-limit (ADR 0003)

Branch `phase-002-slug-limit`, cut from `main` at `6d98d6e`. No production touch point.

| # | Task | Files | Status | Commit | Gate result |
|---|---|---|---|---|---|
| T002 | Cap a slug at 80 characters, cut at the last hyphen | `docs/audit/decisions/0003-cap-slug-length.md`, `test/slugify.test.js`, `src/slugify.js`, `docs/contexts/slugify.md`, `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md` | done | | npm run lint exit 0; node --test test/slugify.test.js tests 9 pass 9 fail 0; npm test tests 9 pass 9 fail 0; node --test e2e/cli.test.js tests 1 pass 1 fail 0; npm run test:e2e left to the reviewer |
| T003 | Add a Limits section to the README for the 80-character cap | `README.md`, `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md` | done | | docs only, no code tier: README edit 1 text present once and MAX_LENGTH 80 (ok, ok, exit 0); README eol i/lf w/crlf; cap check 77 80 80 and true; log names Phase 002 and README.md; em dash 0 in diff and in spec |

## Backlog

Items not yet in a phase. A spec that names a row sets its Status to `done in Phase NNN (<id>)`.

| # | Item | Status |
|---|---|---|
| | | |
