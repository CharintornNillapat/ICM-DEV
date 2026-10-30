# ICM-DEV

A template for delivering software with AI agents through **folders and markdown**: a spec stage, a build stage and a review stage, each with a contract file, each writing one output file the next stage reads. It applies the Interpretable Context Methodology to software delivery.

> Van Clief, J. and McDermott, D. *Interpretable Context Methodology*. arXiv:[2603.16021](https://arxiv.org/abs/2603.16021).

The official ICM repository, [`RinDig/Interpretable-Context-Methodology`](https://github.com/RinDig/Interpretable-Context-Methodology) (MIT), ships content workspaces such as slide decks and animation. This repository carries the same layers into a coding loop. It adds nothing the paper does not already say: no CLI, no installer, no framework.

## The layers

| Paper layer | Here |
|---|---|
| 0 identity | `CLAUDE.md`, which imports `AGENTS.md` |
| 1 routing | `AGENTS.md`: the routing table and the ICM workflow section |
| 2 stage contract | `workflow/stages/*/CONTEXT.md`: role, inputs, process, outputs, verify, never, shell notes, STATUS line |
| 3 reference | `docs/contexts/*.md` and the ADRs in `docs/audit/decisions/` |
| 4 working artifacts | `workflow/stages/*/output/` and the diff |

## The loop

```
you ── task ──> MASTER (orchestrator, writes no code)
                  │  spec  ──> reviewer / reviewer-strict ──> 01_spec/output/task-T001-spec.md
                  │  (pause for you if the spec touches the pause list)
                  │  build ──> builder ───────────────────> 02_build/output/task-T001-build.md
                  │  review ─> reviewer / reviewer-strict ──> 03_review/output/task-T001-review.md
                  └─ APPROVED: commit on the phase branch ... last task: push, open the PR
```

- A **cheap builder and strong reviewers**: the builder (`haiku`) does the volume, the reviewers (`sonnet`, `opus`) re-run every gate and the failing-test-first run themselves. A build report is a claim, never evidence.
- **One pause list**, in `AGENTS.md`. It decides when MASTER stops for you, which reviewer it picks, and when auto-merge is off.
- **Only MASTER writes git history**, on a phase branch, through three allowed command forms. A pre-push hook refuses the rest.

## Use it

1. Copy these files into your repo: `AGENTS.md`, `CLAUDE.md`, `.claude/`, `workflow/`, `docs/`, `scripts/git-hooks/`, `.gitignore` lines, `.gitattributes`.
2. Fill every `{{placeholder}}` (`PLACEHOLDERS.md` lists them). This must print nothing: `grep -rn "[{][{]" . --exclude-dir=.git --exclude=README.md --exclude=PLACEHOLDERS.md`.
3. Put `main` on your remote first, then install the hook. The hook refuses to create `main`, and after it is installed `main` takes only deploy records, so do `git push -u origin main` once before the hook goes in. Then: `cp scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)"`. If the project is a folder of a larger repository, run `git config icm.projectDir <folder>` as well, so the hook looks for the deploy-record files under that folder.
4. Start a **new** Claude Code session in the project folder and run `/master`. It is the project command `.claude/commands/master.md`, so there is nothing to install; if an earlier version of this template told you to copy a loader to `~/.claude/commands/master.md`, delete that file. Claude Code loads `.claude/agents/` when a session starts, so a session that was already open cannot call `reviewer`, `reviewer-strict` or `builder`. Then `phase 1: my-first-phase`, then `task: <one line goal>`.

Needs: Claude Code, `git`, the GitHub CLI `gh` for the release steps, Node 22 or newer for the hook test and the example.

### Permissions

`.claude/settings.json` is read by Claude Code in the project folder. It allows exactly four commands without a prompt (six rules, because the two `gh` forms are listed for both Bash and PowerShell): the push of a phase branch (`ALLOW_GIT_WRITE=1 git push -u origin phase-*`), the push of `main` for the deploy record, `gh pr create --base main --head phase-* ...`, and `gh pr merge ... --auto --merge`. It denies squash, rebase and admin merges, `--no-verify`, a second base or head on `gh pr create`, and the GitHub MCP write tools. Everything else waits on a prompt unless your own settings allow it, including `ALLOW_GIT_WRITE=1 git commit`, `git add`, `git status`, `git diff`, `gh pr view` and `gh api`. The file is not widened for you: adding an allow rule is your call.

## The example

[`example/`](example/) is the same template with every placeholder filled in for a tiny project (a zero-dependency Node `slugify` module with `node --test`). It carries one real task, `T001`, run through spec, build and review: read `example/workflow/stages/*/output/` to see what each stage wrote. See [`example/README.md`](example/README.md) for how that run was made, and what was and was not exercised.

## Layout

```
AGENTS.md, CLAUDE.md          rules (layers 0 and 1)
.claude/agents/               reviewer, reviewer-strict, builder
.claude/commands/master.md    the /master loader (preflight and runtime notes)
.claude/settings.json         permission rules for the unattended git and gh forms
workflow/orchestrator/        MASTER.md, runtimes.md
workflow/stages/              01_spec, 02_build, 03_review: CONTEXT.md and output/
docs/audit/                   ledger, refactor log, ADRs
docs/contexts/                one file per area of the code
scripts/git-hooks/            pre-push guard and its test
```

## License

MIT, see [LICENSE](LICENSE).
