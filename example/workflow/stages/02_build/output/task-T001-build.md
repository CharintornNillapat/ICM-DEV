# Build report T001: keep the base letter of accented Latin letters

Spec: `workflow/stages/01_spec/output/task-T001-spec.md`. Branch `phase-001-accents`. Nothing committed or pushed.

## Files changed (6)

Target files from the spec (5):

- `docs/audit/decisions/0002-keep-accent-base-letters.md`: new ADR (edit 1, written from the spec's fenced block).
- `test/slugify.test.js`: two tests appended after line 19 (edit 3).
- `src/slugify.js`: `.normalize('NFD')` and `.replace(/[̀-ͯ]/g, '')` inserted before `.toLowerCase()` (edit 2).
- `docs/contexts/slugify.md`: Traps line 22 rewritten (edit 4).
- `docs/audit/refactor-log.md`: Phase 001 entry appended after the template block (edit 5).

Bookkeeping (1):

- `docs/audit/task-ledger.md`: new `## Phase 001 - accents (ADR 0002)` section above Backlog, T001 row. Status `done`, Gate result filled, Commit empty.

Stage outputs (`workflow/stages/02_build/output/`, gitignored logs under `logs/`) are not counted.

## Tests added and fail-then-pass evidence

- `keeps the base letter of accented Latin letters`
- `drops stacked accents and already-decomposed accents`

Red run, before edit 2, on the unchanged `src/slugify.js`:

Command: `NO_COLOR=1 node --test test/slugify.test.js`, log `workflow/stages/02_build/output/logs/T001-red.log`.

```
✖ keeps the base letter of accented Latin letters
  + 'caf-au-lait'
  - 'cafe-au-lait'
✖ drops stacked accents and already-decomposed accents
  + 'ph-vi-t'
  - 'pho-viet'
tests 6 / pass 4 / fail 2 / exit=1
```

Green run, after edits 2 to 4: `tests 6 / pass 6 / fail 0`.

## Gates

Run once after the code and test edits, with `NO_COLOR=1`:

| Gate | Result | Log |
|---|---|---|
| `npm run lint` | exit 0 (`node --check` on both entry files) | `logs/T001-lint.log` |
| `node --test test/slugify.test.js` | tests 6, pass 6, fail 0 | `logs/T001-unit-file.log` |
| `npm test` | tests 6, pass 6, fail 0 | `logs/T001-unit.log` |
| `node --test e2e/cli.test.js` (fast form) | tests 1, pass 1, fail 0 | `logs/T001-e2e-fast.log` |
| Text landed (edits 1 to 4 read from the spec's fenced blocks) | six `ok` lines, exit 0 | `logs/T001-text-landed.log` |
| `git show df83222:src/slugify.js \| sed -n '4,5p'` | prints the `.toLowerCase()` line and the `.replace(/[^a-z0-9]+/g, '-')` line | none |
| Em dash, added lines of `git diff -U0 HEAD` | 0 | none |
| Em dash, new or written files (ADR, refactor-log, ledger, spec) | 0 each | none |

Left to the reviewer: `npm run test:e2e` (full form of the end-to-end gate `e2e/cli.test.js`).

Smoke checks: `node bin/slugify.js 'Café au lait'` prints `cafe-au-lait`. `Crème Brûlée` gives `creme-brulee`, `ÉCOLE Ñandú` gives `ecole-nandu`, `Smørrebrød` gives `sm-rrebr-d` and `Straße` gives `stra-e` (unchanged, per the spec's Out of scope). `Hello, World!` gives `hello-world`.

## Notes

- Order deviation, forced by the spec: edit 5 (refactor-log) was written after the gates, because its Verified cell copies the T001 Gate result from the ledger. The ledger's Gate result text and the refactor-log Verified line are identical, except that the Verified line has no trailing period. The code, test and context files were all edited before any gate ran.
- Git printed `LF will be replaced by CRLF` warnings for the edited text files (`core.autocrlf` plus `text=auto`). These are warnings only. Gates were not affected.
- Not done: nothing in the spec was skipped. The ADR, the context file and the refactor-log describe the behaviour the spec gives, and the tests cover the two spec cases.
