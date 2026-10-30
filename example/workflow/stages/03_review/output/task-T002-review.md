# Task T002 review: cap a slug at 80 characters without splitting a word

## Round 1

### Metadata

- Task: T002 (Phase 002, branch `phase-002-slug-limit`)
- Date: 2026-10-30
- Round: 1
- Verdict: APPROVED
- Target files: `docs/audit/decisions/0003-cap-slug-length.md`, `test/slugify.test.js`, `src/slugify.js`, `docs/contexts/slugify.md`, `docs/audit/refactor-log.md` (plus bookkeeping `docs/audit/task-ledger.md`)

### Summary

`src/slugify.js` now builds the slug as before, then returns it unchanged at 80 characters or fewer, otherwise cuts it at `lastIndexOf('-', 80)`, or at 80 characters when there is no hyphen. The builder added three tests, ADR 0003, one Invariants line in the context file, the Phase 002 refactor-log entry and the ledger section. Every edit matches the spec text exactly (the text-landed gate prints 5 `ok`).

### Invariants and parity

- Parity row "exports of `src/slugify.js` / `README.md` usage and `bin/slugify.js`": holds. The export is still the single `slugify(title)`, and `MAX_LENGTH` is not exported. `README.md:7` and `:11` (`hello-world`) are unchanged and under 80. `bin/slugify.js` is unchanged, and `e2e/cli.test.js` passes.
- Slug regex `/^[a-z0-9]+(-[a-z0-9]+)*$/` or `''`: holds. The cut index is never 0 (there is no leading hyphen after the trim). A cut at a hyphen leaves no trailing hyphen, and a cut at 80 with no hyphen in range is all `[a-z0-9]`. I also ran an ad-hoc fuzz (20000 random titles up to 200 characters, from `ab -_.é9Z`): 0 violations of length <= 80, the regex, or idempotence.
- Pure function: holds. One module constant, no I/O, no state.
- `slugify(slugify(x)) === slugify(x)`: holds. The first new test asserts it, and the fuzz above checks it too.
- Relative ESM imports with `.js`: unchanged.
- No dependency: `package.json` is not touched.
- `src/slugify.js` has no character above U+007E (`grep -P '[^\x00-\x7E]'` finds nothing), so the `̀`/`ͯ` escapes are still escapes.

### Gates run

All gates ran in Git Bash from `example/` with `NO_COLOR=1` on Node v24.19.0.

| Command | Result | Log |
|---|---|---|
| `npm run lint` | exit 0 | `workflow/stages/03_review/output/logs/T002-lint.log` |
| `node --test test/slugify.test.js` | tests 9, suites 0, pass 9, fail 0, cancelled 0, skipped 0, todo 0 | `workflow/stages/03_review/output/logs/T002-unit-file.log` |
| `npm test` | tests 9, suites 0, pass 9, fail 0, cancelled 0, skipped 0, todo 0 | `workflow/stages/03_review/output/logs/T002-unit.log` |
| `npm run test:e2e` (full form, covers `e2e/cli.test.js`, so I skipped the fast form) | tests 1, suites 0, pass 1, fail 0, cancelled 0, skipped 0, todo 0 | `workflow/stages/03_review/output/logs/T002-e2e.log` |
| Red run, spec section 6 command (new test file against `HEAD` module, gitignored copy) | exit 1; tests 9, pass 6, fail 3; failures: 119-char slug vs 77-char, 82-char `...-z` vs 80-char, 100 `a` vs 80 `a` | `workflow/stages/03_review/output/logs/T002-red.log` |
| Text-landed check | 5 `ok`, exit 0 | none |
| `git show 6d98d6e:./src/slugify.js \| sed -n '3,8p'` | the six lines from `return String(title)` to `.replace(/^-+\|-+$/g, '');`, as the ADR cites | none |
| Em dash, added lines in `git diff -U0 HEAD` | 0 | none |
| Em dash, ADR, spec, build report, this review | 0, 0, 0, 0 | none |

Scope: `git diff --stat` and `git status --porcelain` (repo-wide) show only the 5 target files modified or new, the bookkeeping ledger, and the spec and build reports. No file is unannounced. `git check-ignore -v` on all five targets matches nothing (exit 1), so none of them is ignored.

Docs rows: the paths the ADR, the context line and the refactor-log entry cite all exist. The ledger's Gate result cell and the refactor-log `Verified` line are word for word the same. `Deliberately not done` names the option or CLI flag, the ellipsis and the version bump, as the spec requires.

### Not verified

- Step 6.2 stash: skipped, because `src/slugify.js` is `w/lf` under `core.autocrlf=true` and all three new tests depend on it. I reproduced the red run with the spec's alternative instead: it copies the unfixed module from `HEAD` and the new test file under the gitignored `logs/red/`, and edits no tracked file. `git status --porcelain` was identical before and after.

### Blocking

None.

### Non-blocking

- ADR 0003 Status reads "To be implemented in Phase 002 (T002)". The deploy record step may want to flip it to "Implemented" after the merge, if that is the project's habit (ADR 0002 sets the precedent either way).

### Rule candidates

- [generic] On Node 22 or newer, `node --test` summary lines start with `ℹ`, not `#`. A gate or script that greps the counts should match `(tests|pass|fail) [0-9]+$`, not `^# tests`.
