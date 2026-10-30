# Stage 02: build

## Role and orders

**Read `AGENTS.md` first, in full, before anything else.** Do not assume it was loaded for you.

**Agent:** the builder (`workflow/orchestrator/runtimes.md` names the agent and model behind each role). **Orders:** `build <id> (stage file: workflow/stages/02_build/CONTEXT.md)` and `fix <id> (stage file: workflow/stages/02_build/CONTEXT.md)`, sent by the orchestrator. The reviewer handles `spec <id>: <description> (stage file: <path>)` (stage 01) and `review <id> (stage file: <path>)` (stage 03).

## Inputs

- `workflow/stages/01_spec/output/task-<id>-spec.md`: the spec. Its target-file allowlist is binding.
- The `docs/contexts/*.md` files the spec names.
- On `fix <id>`: `workflow/stages/03_review/output/task-<id>-review.md`.

## Process

1. Read the spec, the named context files, and every target file and its tests **in full** before the first edit.
2. Sub-agents may only read. They never edit files or run commands that write.
3. If the spec lists an ADR, write it first, before any test or code.
4. Tests first: add the spec's tests and run them against the unchanged code; they must fail for the reason the spec gives. When the task only strengthens a test, follow the spec's order inside the test file instead: the red run is the new assertion failing before the test is completed, saved to `output/logs/<id>-red.log` and quoted (the command and its failure lines) in the build report's fail-then-pass evidence. Skip this step when the spec's tests are `none`.
5. Make the change, then run the spec's gates **once**, after all edits. Never edit the source while end-to-end tests run. Save each full-suite run to `workflow/stages/02_build/output/logs/<id>-<suite>.log`.
   - **Logs are UTF-8**, so `grep` can read them. This covers every file you write under `output/logs/`: full-suite runs, the red log and gate output.
   - A gate that checks text landed (a line, phrase or block occurs in a file) reads the expected text from the spec file's fenced code blocks with a script, turning `\r\n` into `\n` in both texts before counting, and never from a copy typed into the command: a retyped check once passed while the edit differed from the spec by one character.
6. Keep the task's row in `docs/audit/task-ledger.md`. The phase is the `NNN` in the branch name `phase-NNN-<slug>`. Put the row under that phase's section, creating the section from the ledger's template if it is missing. Status `in-progress`, then `done` with the gate result. Leave `Commit` empty: the owner-approved deploy record fills every task's `Commit` cell once per phase, after the merge.
7. Write `workflow/stages/02_build/output/task-<id>-build.md`: task id, files changed (with the count), tests added and their fail-then-pass evidence, each gate command with its exact counts and log path, the end-to-end gates `Left to the reviewer`, and anything not done.

### On `fix <id>`

- Fix only the blocking items in the latest round of `task-<id>-review.md`.
- Rerun the spec's gates.
- Recheck every blocking item from all earlier rounds still holds as fixed, and say so in the fix-round section.

## Outputs

Each task has its own build report, `task-<id>-build.md`: a `build <id>` creates it, and each `fix <id>` appends a `## Fix round N` section to the same file. Never edit another task's report.

When the spec lists `docs/audit/refactor-log.md`, build the phase's entry, or this task's part of it, from the commits and the ledger, never from memory. **Changed:** each committed task's `git show --stat <sha>` and this task's `git status --porcelain`, leaving out `workflow/stages/*/output/` files; name no file they do not list. **Verified:** each task's Gate result cell in `docs/audit/task-ledger.md`, copied word for word. **Surprises:** only items a review or build report names. The header keeps its `<sha>` placeholders; the owner's deploy record fills them.

### Allowed writes

- The spec's target files.
- **Bookkeeping files**, always allowed and never a scope violation: `docs/audit/task-ledger.md` and `workflow/stages/02_build/output/*`, which holds the task's build report `task-<id>-build.md` (full-suite logs go in `output/logs/`, which git ignores).
- `docs/audit/refactor-log.md` only when the spec lists it, which it does for the task that ships the phase.
- Nothing else. A change the spec did not foresee means `BLOCKED`, not a wider edit.

## Verify

- **End-to-end tests run in their fast form only.** Run each end-to-end gate that has the fast form (``node --test e2e/<file>.test.js``). A gate in the full form (``npm run test:e2e``) is the reviewer's: do not run it, and list it in the build report under `Left to the reviewer`. When the spec lists a full-form gate with no fast-form partner for the same spec files, run the partner instead. A gate that names its own scope runs as written.

## Never

- Read `docs/audit/archive/`.
- Use MCP write tools or sign in to a live service from the dev server.
- Run anything on `AGENTS.md`'s Stop and ask first list, including `git commit`, `git push` and any merge. Only the orchestrator commits (each APPROVED task, on the phase branch) and pushes (on the owner's push order).
- Edit `AGENTS.md` or `CLAUDE.md`, unless the spec lists them as targets.
- No em dash (U+2014) in any file you write or touch.

## Shell notes

`[generic]` marks a note that helps any project on the same platform (Windows, PowerShell 5.1, Git Bash); `[local]` marks a note that depends on this project's own files, tools or layout.

- [generic] In Windows PowerShell 5.1, `>`, `>>` and `Tee-Object` write UTF-16, so never use them for a log.
- [generic] To save a native command's own UTF-8 bytes from PowerShell, run it through `cmd /c`, which leaves its exit code in `$LASTEXITCODE`: `cmd /c '<command> > workflow\stages\02_build\output\logs\<id>-<suite>.log 2>&1'`. In Git Bash use `tee` and print the command's own exit code: `<command> 2>&1 | tee workflow/stages/02_build/output/logs/<id>-<suite>.log; echo exit=${PIPESTATUS[0]}`.
- [generic] Use `| Out-File -Encoding utf8 <log>` only for a PowerShell cmdlet's own output (for example `Get-FileHash`): PowerShell decodes piped npm, npx, node or git output in the console code page, which garbles non-ASCII text and symbols, and with `2>&1` it wraps each stderr line in an error record. Set `NO_COLOR` for every logged run, `$env:NO_COLOR='1'` before `cmd /c` in the same PowerShell call or `NO_COLOR=1` before the command in Git Bash: a test runner or bundler can write ANSI color codes into a log, which splits a summary line such as `Tests  N passed` so `grep` misses it.

## STATUS line

End every reply with exactly one line, starting with the task id:

- `STATUS: <id> | BUILT | <n> files changed`
- `STATUS: <id> | FIXED | <n> files changed`
- `STATUS: <id> | BLOCKED | <reason>`
