## Round 1

### Metadata

- Task: T003 (README Limits section for the 80-character cap)
- Date: 2026-10-30
- Round: 1
- Verdict: APPROVED
- Target files: `README.md`, `docs/audit/refactor-log.md` (plus bookkeeping `docs/audit/task-ledger.md`)

### Summary

Docs only. `README.md` gains a `## Limits` section between the CLI example and `## Run it`, with the exact spec text. The Phase 002 refactor-log entry is amended in place (header `T002, T003`, `README.md` in Changed, `T003:` Verified line). The ledger gets row T003. `git check-ignore -v` on both targets printed nothing, so neither is ignored.

### Invariants and parity

- Parity row (`slugify` exports / README example / CLI): touched. Export unchanged; README text matches `src/slugify.js` (`MAX_LENGTH = 80`, `lastIndexOf('-', 80)`). Holds.
- Scope: `git diff --stat` shows 3 files (README, refactor-log, ledger); untracked are the T003 spec and build report. No unannounced change. README eol stays `i/lf w/crlf`.
- Refactor-log edit matches spec Edit 2: header, Changed, Verified updated; Brief, Surprises and Deliberately not done untouched. The `T003:` line matches the ledger Gate result cell word for word.
- No em dash in the added diff lines, the spec or the build report (all 0).

### Gates run

- Spec gate (README holds Edit 1 text once; MAX_LENGTH is 80): `ok`, `ok`, exit 0.
- `git ls-files --eol README.md`: `i/lf    w/crlf`.
- Cap sentence check: `77 80 80`, then `true`.
- Log and ledger agreement: header `Phase 002 - slug-limit: T002, T003` at line 18; `README.md` named at line 22.
- Em dash counts: added diff lines 0; spec 0; build report 0.
- Courtesy `npm test`: exit 0, tests 9, pass 9, fail 0, skipped 0. Log: `workflow/stages/03_review/output/logs/T003-unit.log`.
- Not run: lint and e2e, because no code tier applies (spec section 7).

### Not verified

- Step 6 (stash and red run) does not apply: tests are `none`.
- The em dash check on this review file is done after writing (see below).

### Blocking

None.

### Non-blocking

- `README.md:16` says "at or before the 80th character". The code allows a hyphen at index 80, which is the 81st character (the slug then keeps exactly 80). The result is still at most 80, so the sentence is nearly right; "keeps at most 80 characters" would be exact. The spec dictated the text, so the builder was right to use it.

### Rule candidates

None.
