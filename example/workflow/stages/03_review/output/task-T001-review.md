# Review T001: keep the base letter of accented Latin letters

## Round 1

### 1. Metadata

- Task: T001
- Date: 2026-10-30
- Round: 1
- Verdict: APPROVED
- Reviewer: reviewer-strict
- Branch: `phase-001-accents` (base `df83222`), Node v24.19.0, Git Bash, `NO_COLOR=1`
- Target files: `docs/audit/decisions/0002-keep-accent-base-letters.md`, `test/slugify.test.js`, `src/slugify.js`, `docs/contexts/slugify.md`, `docs/audit/refactor-log.md` (none git-ignored: `git check-ignore -v` printed nothing for any of them)

### 2. Summary

`slugify` now runs `.normalize('NFD')` and `.replace(/[̀-ͯ]/g, '')` before `.toLowerCase()`, so accented Latin letters keep their base letter (`'Café au lait'` gives `'cafe-au-lait'`). Two tests cover precomposed, stacked and already-decomposed accents. ADR 0002, the context file's Traps line, the refactor-log entry and the ledger row were written as the spec gives them.

### 3. Invariants and parity

- Parity row "exports of `src/slugify.js` / `README.md` usage example and `bin/slugify.js`": holds. The export is still the single `slugify(title)`; `README.md:7` and `README.md:11` (`hello-world`) still match; `bin/slugify.js` unchanged; `node bin/slugify.js 'Café au lait'` prints `cafe-au-lait`; `e2e/cli.test.js` passes.
- Pure function: holds. Only string methods are added; no I/O, no state.
- Slug regex and idempotence: checked on 16 inputs (the spec's cases, `Smørrebrød`, `Straße`, `Hello, World!`, marks-only input, `İstanbul`, a U+1DC0 mark, the `fi` ligature, a full-width letter). Every output matches `/^[a-z0-9]+(-[a-z0-9]+)*$/` or is empty, and `slugify(out) === out`. `Smørrebrød` and `Straße` stay `sm-rrebr-d` and `stra-e`, as the spec's Out of scope requires.
- Source escapes: `od -c src/slugify.js` shows the literal ASCII `̀-ͯ` escapes, no raw combining characters (spec edit 2).
- No dependency, relative `.js` ESM import unchanged, `package.json` untouched.
- Full text of the changed function `slugify` (`src/slugify.js:2-9`) read; JSDoc on line 1 unchanged and still true.
- ADR 0002 is byte-identical to the spec's Edit 1 block; `src/slugify.js:4-5` at `df83222` prints the `.toLowerCase()` and `.replace(/[^a-z0-9]+/g, '-')` lines the ADR cites.

### 4. Gates run

| Command | Result | Log |
|---|---|---|
| `npm run lint` | exit 0 | `workflow/stages/03_review/output/logs/T001-lint.log` |
| `node --test test/slugify.test.js` | 1 file, tests 6, pass 6, fail 0, skipped 0, exit 0 | `workflow/stages/03_review/output/logs/T001-unit-file.log` |
| `npm test` | 1 file, tests 6, pass 6, fail 0, skipped 0, exit 0 | `workflow/stages/03_review/output/logs/T001-unit.log` |
| `npm run test:e2e` (full form; covers the fast form `node --test e2e/cli.test.js`, skipped per step 4) | 1 file, tests 1, pass 1, fail 0, skipped 0, exit 0 | `workflow/stages/03_review/output/logs/T001-e2e.log` |
| Text landed (spec section 7) | six `ok` lines, exit 0 | `workflow/stages/03_review/output/logs/T001-text-landed.log` |
| `git show df83222:src/slugify.js \| sed -n '4,5p'` | the `.toLowerCase()` and `.replace(/[^a-z0-9]+/g, '-')` lines | none |
| Em dash in added lines of `git diff -U0 HEAD` | 0 | none |
| Em dash in ADR, spec, build report, refactor-log, ledger, context file | 0 each | none |
| Red run (spec section 6 recipe: test file copied next to `HEAD:src/slugify.js` under the gitignored logs folder) | tests 6, pass 4, fail 2, exit 1; actual `'caf-au-lait'` vs expected `'cafe-au-lait'`, actual `'ph-vi-t'` vs expected `'pho-viet'` | `workflow/stages/03_review/output/logs/T001-red.log` |

Scope (step 3): `git diff --stat` shows 5 tracked files (`docs/audit/refactor-log.md`, `docs/audit/task-ledger.md`, `docs/contexts/slugify.md`, `src/slugify.js`, `test/slugify.test.js`); `git status --porcelain --untracked-files=all` adds the ADR, the spec and the build report. All are spec targets, bookkeeping, or stage outputs. No unannounced change. `git status --porcelain` was identical before and after the red run.

### 5. Not verified

- Stage 03 step 6.2 stash: not done. `src/slugify.js` is `w/lf` under `core.autocrlf=true`, so it was left out of the stash, and both new tests depend on it. Their red run was reproduced instead with the spec's no-edit recipe (section 6), writing only under the gitignored `workflow/stages/03_review/output/logs/red/`; it shows the same `fail 2` and the same actual/expected pairs as the spec.
- Behaviour on Node 22 (the `engines` floor): only Node v24.19.0 was run. `String.prototype.normalize` and the regex used are long-standing, so no difference is expected.

### 6. Blocking

None.

### 7. Non-blocking

- `workflow/stages/02_build/output/task-T001-build.md`, "Files changed": the `src/slugify.js` bullet shows the regex with raw combining characters (`/[̀-ͯ]/g`) instead of the `̀-ͯ` escapes that are actually in the source. Report text only; the source is correct.
- `docs/audit/task-ledger.md` T001 Gate result and the copied `docs/audit/refactor-log.md` Verified line still read `npm run test:e2e left to the reviewer`. The orchestrator may update both to `npm run test:e2e tests 1 pass 1 fail 0` when it commits.

### 8. Rule candidates

- [generic] On Windows with `core.autocrlf=true`, a stage-03 red run for a `w/lf` source file is reproduced by copying the test next to `git show HEAD:<file>` under a gitignored folder, instead of a stash. This spec spelled the recipe out; the stage file could carry it so each spec need not.
