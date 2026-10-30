# Task T003 build report: README Limits section for the 80-character cap

Phase 002, branch `phase-002-slug-limit`. Spec: `workflow/stages/01_spec/output/task-T003-spec.md`. Docs only; no code tier applies.

## Files changed (3)

- `README.md`: new `## Limits` section (spec Edit 1), inserted between the CLI example and `## Run it`. Line endings left as they were (`i/lf w/crlf`).
- `docs/audit/refactor-log.md`: Phase 002 entry amended in place (spec Edit 2): header `T002, T003`; `README.md` added to **Changed**; `(this entry, amended by T003)`; a `T003:` line added under **Verified**, copying the ledger cell. Brief, Surprises and Deliberately not done unchanged.
- `docs/audit/task-ledger.md`: T003 row added under Phase 002, below T002. Status `done`, Commit empty, Gate result filled.

Not changed: `src/`, `test/`, `bin/`, `e2e/`, `package.json`, `AGENTS.md`, `docs/contexts/`. Build report written to `workflow/stages/02_build/output/task-T003-build.md`.

## Tests

None. The spec lists `Tests to add: none` (docs only). No red run, no fail-then-pass evidence.

## Gates (run once, after all edits)

All run from `example/`, Git Bash.

1. Spec gate: README holds the Edit 1 text once; `src/slugify.js` has `const MAX_LENGTH = 80;`. Output: `ok  README holds edit 1 text once`, `ok  src MAX_LENGTH is 80`, exit 0.
2. `git ls-files --eol README.md`: `i/lf    w/crlf  attr/text=auto  README.md`. Matches the spec.
3. Cap sentence check: `77 80 80` then `true`. Matches the spec.
4. Log and ledger agreement: `grep "Phase 002"` finds the header `## Phase 002 - slug-limit: T002, T003 ...`; `grep "README.md"` finds line 22 (the **Changed** line) naming `README.md`.
5. Em dash in added diff lines: `0`.
6. Em dash in the spec file: `0`.

Git printed `LF will be replaced by CRLF` warnings for `docs/audit/refactor-log.md` and `docs/audit/task-ledger.md`. These are the existing `core.autocrlf` behaviour on files the build edits; no line endings were changed by hand.

No `npm run lint`, `npm test` or e2e run: no code tier row applies to docs-only changes (spec section 7). The full-form `npm run test:e2e` is not a gate for this task.

## Left to the reviewer

Nothing. No end-to-end gate in this task.

## Not done

- No ADR (spec: docs-only, ADR 0003 already states the rule).
- Commit cell left empty (owner's deploy record fills it).
- Nothing committed, pushed or merged.
