# `docs/audit/`: index

The working memory of the project: what is planned, what shipped, and why each decision was made. The rules themselves live in `AGENTS.md` and `docs/contexts/`, not here.

## Reading order

1. **`AGENTS.md`'s routing table**: which context file your task needs.
2. **`task-ledger.md`**: what is next.
3. Anything below only when the task calls for it.

## Live files

| File | What it holds | Read it when |
|---|---|---|
| `task-ledger.md` | Tasks, their status, and the Backlog | Always, after the routing table |
| `refactor-log.md` | One entry per shipped phase | Asked what has shipped recently |
| `decisions/NNNN-*.md` | ADRs, one per decision with a live alternative; `0000-template.md` is the layout | A rule or task names the ADR |

## `archive/`: do not read

**Never read a file inside `archive/` unless the user explicitly asks for historical research.** Archived files are never edited. Create the folder when the first live file passes about 150 lines: move the finished phases of the ledger and the log into a new file there with `git mv` or a copy, and leave a one-line pointer behind.

## Update discipline

- **Who writes what.** The reviewer's spec is the plan. An ADR the task needs is a spec target the builder writes first, before any code. The builder keeps the task's ledger row. `refactor-log.md` is written by the task that ships the phase.
- **`task-ledger.md` is the only file edited by every task mid-phase.** Flip a row to `in-progress` when started; fill `Gate result` when it lands and leave `Commit` empty. The owner-approved deploy record fills every task's `Commit` cell once per phase, after the merge. The row goes under the section for the phase in the branch name, created from the template if missing.
- **Every `refactor-log.md` entry has `Surprises` and `Deliberately not done`,** even when they say "none".
- **Keep each live file short.** Past about 150 lines, move finished phases into a new file in `archive/`.
