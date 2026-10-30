# Task T002 build report: cap a slug at 80 characters without splitting a word

Phase 002, branch `phase-002-slug-limit`. Spec: `workflow/stages/01_spec/output/task-T002-spec.md`. Order: `build T002`.

## Files changed (6)

1. `docs/audit/decisions/0003-cap-slug-length.md`: new ADR (edit 1, written first, before any test or code).
2. `test/slugify.test.js`: three tests appended after line 30 (edit 3).
3. `src/slugify.js`: `MAX_LENGTH = 80` and the cut at the last hyphen at or before index 80 (edit 2).
4. `docs/contexts/slugify.md`: one Invariants line for the length rule, after line 11 (edit 4).
5. `docs/audit/refactor-log.md`: Phase 002 entry above Phase 001 (edit 5).
6. `docs/audit/task-ledger.md`: Phase 002 section and T002 row (bookkeeping).

Not changed: `bin/slugify.js`, `e2e/cli.test.js`, `README.md`, `package.json`, `AGENTS.md`, `CLAUDE.md`. Output files other than this report are the stage's own logs and are not counted.

## Order of work

1. Read AGENTS.md, the stage file, the spec, `docs/contexts/slugify.md`, and in full `src/slugify.js`, `test/slugify.test.js`, `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md`.
2. Edit 1: ADR `0003` written.
3. Edit 3: three tests appended. Red run against the unchanged source (fail-then-pass evidence below).
4. Edit 2: `src/slugify.js` changed.
5. Edit 4 and edit 5, then the ledger row (`in-progress`).
6. Gates run once, after all edits.
7. Ledger row set to `done` with the gate result; refactor-log `Verified` copied word for word from that cell.

## Tests added and fail-then-pass evidence

- `caps a long slug at 80 characters at the last hyphen, splitting no word`
- `keeps 80 characters when the cut falls exactly on the limit`
- `cuts a first word longer than 80 characters at 80`

Red run (before edit 2): `node --test test/slugify.test.js` with `NO_COLOR=1`, log `workflow/stages/02_build/output/logs/T002-red.log`.
Counts: `tests 9`, `pass 6`, `fail 3`, exit 1. The three failures are the spec's three, each on its first assertion:
- caps a long slug: actual is the 119-character slug `word0-...-word9-word0-...-word9`, expected the 77-character 13-word slug.
- keeps 80 characters: actual is the 82-character slug ending in `-z`, expected the 80-character `x`*39 `-` `y`*40.
- cuts a first word: actual is 100 `a`, expected 80 `a`.

Green run (after edit 2): `tests 9`, `pass 9`, `fail 0`, see gates below.

## Gates

All run once, after all edits, with `NO_COLOR=1`, from the `example/` folder in Git Bash.

| Gate | Result | Log |
|---|---|---|
| `npm run lint` | exit 0 | `workflow/stages/02_build/output/logs/T002-lint.log` |
| `node --test test/slugify.test.js` | tests 9, pass 9, fail 0 | `workflow/stages/02_build/output/logs/T002-unit-file.log` |
| `npm test` | tests 9, pass 9, fail 0 | `workflow/stages/02_build/output/logs/T002-unit.log` |
| `node --test e2e/cli.test.js` (fast form) | tests 1, pass 1, fail 0 | `workflow/stages/02_build/output/logs/T002-e2e-fast.log` |
| `npm run test:e2e` (full form) | Left to the reviewer | none |

Text-landed check (reads edits 1 to 4 from the spec's fenced blocks): five `ok` lines, exit 0. Edit 1 count 1 in the ADR, edit 2 old text count 0 and new text count 1 in `src/slugify.js`, edit 3 count 1 in the test file, edit 4 count 1 in the context file.

Non-ASCII check: `grep -P '[^\x00-\x7E]' src/slugify.js` finds nothing, so the `̀` and `ͯ` escapes are still escapes.

Docs rows: `git show 6d98d6e:./src/slugify.js | sed -n '3,8p'` prints the six lines from `return String(title)` to `.replace(/^-+|-+$/g, '');`, as the ADR cites.

Em dash (U+2014): added lines of tracked files in `git diff -U0 HEAD` count 0. New or written files count 0: the ADR, the spec, and (checked after writing) this report.

## Notes

- Git printed `LF will be replaced by CRLF` warnings for the five tracked files I edited. This is git's line-ending notice for `core.autocrlf=true`; it does not fail any gate and the files stay LF in the index.
- The spec's reviewer note (stage 03 step 6, the red run that reproduces the failure against `HEAD`) is for the reviewer and is not run here.
- Decision the spec flags for the owner at the pause: a first word longer than 80 is cut at 80 characters (D3, ADR 0003). Built as the spec says.

## Surprises

none.

## Not done

- `npm run test:e2e` (full form): left to the reviewer, as the spec and stage file say.
- No README, `bin/`, `e2e/`, `package.json` or version change (out of scope per the spec).
- No commit, push or merge (orchestrator's job).
