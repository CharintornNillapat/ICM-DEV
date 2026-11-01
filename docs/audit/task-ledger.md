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

## Backlog

Items not yet in a phase, numbered `B001`, `B002` and so on. The deploy record adds a row for each `[follow-up]` note a review left open. A spec that names a row sets its Status to `done in Phase NNN (<id>)`.

| # | Item | Status |
|---|---|---|
| | | |
