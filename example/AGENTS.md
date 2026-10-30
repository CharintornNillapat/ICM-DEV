# AGENTS.md

The one rule file for every agent in this repo (`CLAUDE.md` imports it, so a runtime that reads `CLAUDE.md` reads this file too). It wins over any skill's or tool's defaults. Domain detail lives in `docs/contexts/`; read only the file your task needs.

## Project

Slugify is a zero-dependency Node module that turns a title into a URL slug, with a one-command CLI. It is the example project of ICM-DEV: small enough to run the spec, build and review loop on in a few minutes.

- **Stack:** Node 22 or newer, ES modules, `node:test`. No dependencies.

| Path | What it is |
|---|---|
| `src/` | `slugify.js`, the module |
| `bin/` | `slugify.js`, the CLI entry |
| `test/`, `e2e/` | Unit tests of the module; end-to-end tests of the CLI |
| `docs/audit/` | Start at `docs/audit/README.md`: the ledger, the log, the ADRs in `decisions/` |

## Commands

- Dev / build: none (a library) / none
- Lint: `npm run lint`
- Unit tests: `npm test`; one file: `node --test test/<file>.test.js`
- End-to-end tests, full form: `npm run test:e2e`

## Stop and ask first

Do none of these without the owner's explicit go-ahead in this session:

- Any MCP or CLI write tool: deploys, environment variables, projects, branches, issues, PRs. The one exception is the Release bullet in the ICM workflow section (`gh pr create`, `gh pr merge --auto`).
- `git commit`, `git push`, merging, or rewriting history. In the ICM loop, the ICM workflow section is the owner's standing go-ahead for these only: the orchestrator commits each APPROVED task on its phase branch, and once the phase's last task is APPROVED it pushes that branch and opens its pull request (the Release bullet). Merging is the owner's, except the auto-merge case in that bullet.
- Editing `.github/workflows/` or a live dashboard or deployment setting.
- Deleting files you did not create, or adding a dependency.
- Reading or printing `.env` or any secret.
- Publishing the package (`npm publish`) or changing `version` in `package.json`.

## Non-negotiables

- **Pure functions only:** `src/slugify.js` does no I/O and keeps no state.
- **A slug matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`, or is the empty string.**
- **No dependency.** Adding one is a stop-and-ask.
- **Relative ESM imports with the `.js` extension.**
- **No em dash (U+2014) in any file** you write or touch.

## Cross-file parity map

These pairs must change together; nothing in the type checker links them.

| This | Must match | Guarded by |
|---|---|---|
| The exports of `src/slugify.js` | The usage example in `README.md` and the CLI in `bin/slugify.js` | `test/slugify.test.js`, `e2e/cli.test.js` |

## Tiered verification gates

Run every tier that matches a changed path, then report the commands and results. A task's gates are the union of the tier rows for every changed path. An owner's task description may add gates but never remove a tier. A file whose only changed lines are comments takes the comments-only row in place of its folder's row.

| Changed | Run |
|---|---|
| Docs only, including `workflow/` and `docs/contexts/` | Nothing, unless a doc states a count or path: check it against the code |
| Comments only, in any code folder | `npm run lint`; the reviewer confirms from the diff that only comment lines changed |
| `src/`, `test/` | `npm run lint`; `node --test test/<changed files>`; then `npm test` |
| `bin/`, `e2e/` | `npm run lint`; `npm test`; `node --test e2e/<changed files>`, then `npm run test:e2e` |
| `scripts/git-hooks/` | `node --test scripts/git-hooks/pre-push.test.mjs` |
| Any critical path (`src/slugify.js`) | Write the failing test first and run it against the unfixed code |

Before calling a task done, a task whose gates include a code tier (any row above other than docs-only and comments-only) also runs `npm run lint`, `npm test` and the affected end-to-end spec(s). A docs-only or comments-only task runs only its own tier rows. Save full-suite output to a log file: the builder saves to `workflow/stages/02_build/output/logs/` and the reviewer to `workflow/stages/03_review/output/logs/` (both gitignored).

**The end-to-end pair splits by stage.** The builder runs each end-to-end gate in its fast form (`node --test e2e/<file>.test.js`) and leaves the full form (`npm run test:e2e`) to the reviewer, who runs it once. The reviewer still runs every other gate itself, lint and unit included. The split removes no tier: every tier command still runs in the task. Outside the ICM loop, one session runs both forms, the fast one first.

## Domain context routing

| Your task touches | Read |
|---|---|
| `src/slugify.js`, its tests, the CLI | `docs/contexts/slugify.md` |
| A comments-only or docs-only change | No context file |
| Why a rule exists | The ADR it names, `docs/audit/decisions/NNNN-*.md`. With no ADR named, a keyword search of `docs/audit/decisions/`, reading only the ADRs that match |

**Never read `docs/audit/archive/`** unless the user explicitly asks for historical research. It is superseded history.

## Workflow

- A vague request: ask before writing code.
- A new feature or phase, in this order: the spec and plan; the next ADR in `docs/audit/decisions/`, before any code; the task rows in `docs/audit/task-ledger.md`; the code. The task that ships the phase adds one `docs/audit/refactor-log.md` entry (with `Surprises` and `Deliberately not done`).
  - **In the ICM loop:** the reviewer's spec is the plan. An ADR the task needs is a spec target the builder writes first, before any code. The builder keeps the task's ledger row. `refactor-log.md` is written by the task that ships the phase.
  - **Outside the loop:** one session does all of it, in the same order.
- Removing a signature, column or code path: plan its deprecation and migration first.
- Skip the process for typos, copy tweaks and doc-only edits. A comments-only edit counts as doc-only, so it needs no ADR. A phase made only of doc-only tasks still ships with a short `refactor-log.md` entry.
- **Batching:** group small Backlog items into one phase, one task each, so the push, PR, merge and deploy record happen once. An item is small when its spec's Target files hold at most 3 code or test files (docs and bookkeeping excluded), it changes about 60 lines or fewer, it has no migration, and it touches no critical path. Put at most 4 small items in a phase. Anything else is its own phase.
- A rule enters this file or `docs/contexts/` only once the code complies.

## ICM workflow

- **Phase work happens on a branch** `phase-NNN-<slug>`, never on `main`: pushing or merging `main` may deploy. On the owner's phase order, before the first spec of the phase, the orchestrator cuts the branch from an up-to-date `main`. `NNN` is one above the last phase in `docs/audit/task-ledger.md`, and it is the phase number. Work stays on that branch until the owner merges it.
- An orchestrator routes four orders. Each arrives as written below; read the stage file it names:
  - `spec <id>: <description> (stage file: workflow/stages/01_spec/CONTEXT.md)`: reviewer. The spec's Goal comes from the description.
  - `build <id> (stage file: workflow/stages/02_build/CONTEXT.md)` and `fix <id> (stage file: workflow/stages/02_build/CONTEXT.md)`: builder
  - `review <id> (stage file: workflow/stages/03_review/CONTEXT.md)`: reviewer
- Task ids continue the ledger's T-numbers. Each stage writes to its own `output/`: `task-<id>-spec.md`, `task-<id>-build.md` (fix rounds append to it) and `task-<id>-review.md`. Every reply ends with the one STATUS line its stage file defines, starting with the task id: `STATUS: <id> | <state> | <detail>`.
- **Orchestrator prompt:** the orchestrator's instructions are versioned in `workflow/orchestrator/`: `MASTER.md` is the body, read from the checked-out branch; `loaders/` holds one loader per runtime (its preflight and runtime notes), which the owner copies to the runtime's global path by hand; `runtimes.md` names the agent, model, tools, shell and guards behind each role.
- **Pause after the spec:** after `SPEC DONE`, the orchestrator pauses for the owner's go-ahead before sending `build <id>` when the spec's Target files include a critical path (`src/slugify.js`), anything under `bin/`, `.claude/agents/`, `.github/workflows/` or `workflow/orchestrator/` (its `loaders/` folder included), `.claude/settings.json`, `AGENTS.md`, or a `workflow/stages/*/CONTEXT.md` file, or when its Production touch points section lists anything but `none`. Otherwise it sends `build <id>` without asking. Bookkeeping files (`docs/audit/task-ledger.md`, `workflow/stages/*/output/*`) never cause a pause. This bullet is the pause list's one home: the Release bullet and `workflow/orchestrator/MASTER.md` point here and never copy it.
- **Commits:** after an `APPROVED` review, the orchestrator commits that task on the phase branch by itself, with no `commit <id>` order. It stages only that task's files, by path, never with `git add -A` or `git add .`: the spec's Target files the build changed, `docs/audit/task-ledger.md`, and the task's `task-<id>-spec.md`, `task-<id>-build.md` and `task-<id>-review.md`. It leaves any other changed file unstaged and names it to the owner. It never commits on `main` and never skips hooks; if the commit fails, it stops for the owner. It pushes only the phase branch, and only through the Release bullet below.
- **Release:** once the phase's last task is APPROVED and all its gates have passed, the orchestrator pushes the phase branch and runs `gh pr create` (title `phase NNN: <slug>`, body: the task ids and their ledger rows). Then:
  - **Auto-merge:** when no task's Target files and no Production touch point hit the pause list above, and at least one changed file is outside `docs/` and `*.md`, it runs `gh pr merge <n> --auto --merge`, after confirming `gh api repos/{owner}/{repo} --jq .allow_auto_merge` is `true`. GitHub merges when the required checks on `main` pass. It is a merge commit, never `--squash`: the ledger and the deploy record cite the task commits.
  - **Otherwise** (a Target file or Production touch point on the pause list above, a docs-only PR, or auto-merge not enabled) it reports the PR link and the owner merges. A docs-only PR is never auto-merged: its required checks may pass with every step skipped, so they prove nothing about it.
- **Deploy record:** the orchestrator watches the PR with `gh pr view <n> --json state --jq .state`. When it reads `MERGED` it writes the post-merge record in one docs-only `[skip ci]` commit on `main`. A phase whose ADR Release section names an owner action after the merge waits for the owner's `applied` and puts the action's note in that same commit, never a second one.
- **The one exception on `main`:** that deploy record, a docs-only `[skip ci]` commit on `main`, made by the orchestrator or by the owner. Nothing else is committed or pushed to `main`.
- **Unattended pushes:** three commands run without a permission prompt: `ALLOW_GIT_WRITE=1 git push -u origin phase-NNN-<slug>` and `gh pr create --base main --head phase-NNN-<slug> --title "phase NNN: <slug>" --body-file <file>` (Release, in exactly that form and order), and `ALLOW_GIT_WRITE=1 git push origin main` (the deploy record). `.claude/settings.json` denies a `gh pr create` that names a second base or head, or another repository. The guard is the pre-push hook, versioned as `scripts/git-hooks/pre-push`, installed with `cp scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)"` and tested by `node --test scripts/git-hooks/pre-push.test.mjs`. It refuses any push to `main` but a fast-forward of single-parent `docs(deploy): ... [skip ci]` commits that only modify `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md` or an existing ADR, and inside a Claude Code session it refuses every push without `ALLOW_GIT_WRITE=1` and refuses deleting or rewinding any remote branch. Any other push or `gh pr create` matches no allow rule, so it waits on a prompt, and the orchestrator tells the owner before a step that will wait on one. No agent pushes with `--no-verify`.
