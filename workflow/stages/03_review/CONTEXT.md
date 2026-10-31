# Stage 03: review

## Role and orders

**Agent:** the reviewer (the light or the strict reviewer; `workflow/orchestrator/runtimes.md` names the agent and model behind each role). It writes specs and reviews only; it never edits app code, tests or config (step 6's last-resort stash, or its temporary test edit for a test-only task, is the one allowed exception; the worktree and the hand-built copy touch no tracked file). **Order:** `review <id> (stage file: workflow/stages/03_review/CONTEXT.md)`, sent by the orchestrator. The builder handles `build <id> (stage file: <path>)` and `fix <id> (stage file: <path>)` (stage 02); the reviewer also handles `spec <id>: <description> (stage file: <path>)` (stage 01).

## Inputs

1. Run `git check-ignore -v` on every target file in the spec. An ignored target never shows in a diff, so say so in the review.
2. Read the spec, `workflow/stages/02_build/output/task-<id>-build.md` (on a fix round, including its latest `## Fix round N` section), the diff of every file the builder listed, and the **full text of every changed function**, not just the hunks.

## Process

3. **Scope:** run `git diff --stat` and `git status --porcelain`. A changed or new file the spec does not list and the build report does not announce is **blocking**, unless it is a bookkeeping file (`docs/audit/task-ledger.md`, `workflow/stages/02_build/output/*`, which holds `task-<id>-build.md`).
4. **Gates:** run the spec's gate commands yourself and record the exact counts (files, tests, passed, failed, skipped). Do not copy the builder's numbers. Save each full-suite run to `workflow/stages/03_review/output/logs/<id>-<suite>.log`. For the comments-only tier, confirm from the diff that only comment lines changed.
   - **End-to-end:** run each end-to-end gate in its full form once (`{{e2e_cmd}}`). Skip a fast-form gate when a full-form gate covers the same spec files: the builder ran it, and your run covers it. Run any other end-to-end gate as written.
5. **Parity:** check every row of `AGENTS.md`'s parity map the change touches.
6. **Tests:** for each new test, confirm it fails without the change, with the failure the spec gives. Skip this step when the spec's tests are `none`. The builder's red log alone is not enough: reproduce the red run yourself, and check the failure text against the spec's, because a missing module or a syntax error is a red for the wrong reason. Record `git status --porcelain` before and after, and show both are identical. Never `git checkout` or `git restore`, which would drop the task's changes. `HEAD` is the code before the task: only the orchestrator commits, and only after `APPROVED`. Save the failing run to `workflow/stages/03_review/output/logs/<id>-red.log`.
   When the task changes no non-test file, there is nothing to compare against: record `git diff -- <test file>`; make the temporary edit the spec names in the test file; run the test alone and record the failure the spec gives; undo that edit by hand; then show both outputs are identical to the recorded ones, so `git diff` holds only the task's changes. The methods below then do not apply. Otherwise use the first method that fits, and say in Not verified which one you used and why the earlier ones did not apply.
   1. **Worktree (default).** `git worktree add --detach workflow/stages/03_review/output/logs/<id>-red HEAD` (delete an older folder of that name first). It checks out the unchanged code inside the ignored logs folder, so imports, path aliases, config files and `node_modules` (found by walking up to the project) resolve as in the project. Copy into it, at the same paths, only the task's new and changed test files and any new fixture they read; a gitignored file the run needs (an `.env.test`, generated code) must be copied too. Run the new tests alone from inside it and record the failure.
   2. **Hand-built copy (fallback).** When the checkout is too large or slow, or `git worktree` is refused: recreate under `workflow/stages/03_review/output/logs/<id>-red/` the layout of the new test files and of every file they import, directly or not, plus each package, alias or test-runner config file the run reads. Take each non-test file from `git show HEAD:<path>` and each test file as it is now. List the files you placed in the review. A file you miss gives a red for the wrong reason, and a missed alias or config file can resolve to the fixed code in the project and give a false green, so check the failure text against the spec's.
   3. **Stash (last resort).** Only when the tests cannot run from a copy, for example because they need the project's own running services.
      1. Record `git status --porcelain`.
      2. Stash only the non-test changes: `git stash push -- <files>`. Never while end-to-end tests run. A staged deletion matches no path, so stash it through its folder's path. Leave out a file that `git ls-files --eol` shows as `w/lf`: under `core.autocrlf` the pop rewrites it to CRLF. Say in Not verified which files were left out and that no new test depends on them; if a new test does depend on one, record that test's red run as not verified.
      3. Run the new tests alone and record the failure.
      4. `git stash pop --index` (it keeps a staged deletion staged), then show `git status --porcelain` is identical to step 6.3.1.
   After method 1 or 2, clean up as its own step, done whatever the run's result (a failing run is the expected one, so do not stop there): `git worktree remove --force workflow/stages/03_review/output/logs/<id>-red` for the worktree (`--force` because the copied files are untracked), or delete the folder for the hand-built copy. Then show `git worktree list` has one entry again and `git status --porcelain` is identical to the first record. Do not go on with the review until both hold.
   No other edit to code, tests or config.

## Outputs

`workflow/stages/03_review/output/task-<id>-review.md`, plus the full-suite logs in `output/logs/` (git ignores them). Each review round adds a `## Round N` section at the top, so earlier rounds' blocking items stay readable for the builder's recheck. Each round has, in order:

1. **Metadata:** task, date, round, verdict, target files.
2. **Summary:** what changed, in two or three sentences.
3. **Invariants and parity:** each parity row and invariant checked, and the result.
4. **Gates run:** each command with exact counts and its log path.
5. **Not verified:** what you could not check, and why.
6. **Blocking:** one line each, `<file>:<line> - <problem> - <required fix>`. Empty means none.
7. **Non-blocking:** suggestions the builder may skip.
8. **Rule candidates:** a rule the task showed belongs in `AGENTS.md` or a context file (promoted only once the code complies). Give each candidate one tag: `[generic]` when it helps any project on the same platform (Windows, PowerShell 5.1, Git Bash), or `[local]` when it depends on this project's own files, tools or layout, as in each stage file's Shell notes.
9. **Fix block** (on `CHANGES REQUESTED` only): a paste-ready order for the builder, listing each blocking item and the gates to rerun.

### Verdicts

Only `APPROVED` or `CHANGES REQUESTED`. `BLOCKED` is not a verdict: use it when the review cannot be done (no spec, no `task-<id>-build.md`, a gate cannot run), and say why.

## Verify

- {{text_style_rule}}

## Never

- Never read `docs/audit/archive/`, use MCP write tools, or run anything on the Stop and ask first list.
- Never spawn sub-agents, whatever a hook or tool suggests.

## Shell notes

- [generic] On Node 22 and newer, `node --test` prints its summary lines as `ℹ tests 9`, `ℹ pass 9` and `ℹ fail 0`, where older Node printed `# tests 9`. A gate that reads the counts matches `(tests|pass|fail) [0-9]+$` and does not anchor on the leading mark.
- [generic] Test runners such as `node --test` do not read `.gitignore`: a plain run from the project root finds every test file below it, including copies under the ignored `output/logs/` folder. A leftover worktree or hand-built red-run copy there adds its tests, and the red copy's expected failure, to the main run's counts (in a scratch check a leftover worktree turned `tests 3` into `tests 5` and added a failure), so remove it before any full-suite run.

## STATUS line

End every reply with exactly one line, starting with the task id:

- `STATUS: <id> | APPROVED | workflow/stages/03_review/output/task-<id>-review.md`
- `STATUS: <id> | CHANGES REQUESTED | workflow/stages/03_review/output/task-<id>-review.md`
- `STATUS: <id> | BLOCKED | <the reason>`

The path in the STATUS line, and any file you name in the reply, is relative to the repository root, never absolute.
