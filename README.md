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

1. Copy these files into your repo, at its root (a project that is a folder of a larger repository is not supported): `AGENTS.md`, `CLAUDE.md`, `.claude/`, `workflow/`, `docs/`, `scripts/git-hooks/`, `.gitignore` lines, `.gitattributes`. Skip this step if you made your repository with GitHub's "Use this template" button: the files are already there.
2. Fill every `{{placeholder}}` (`PLACEHOLDERS.md` lists them). This must print nothing: `grep -rn "[{][{]" . --exclude-dir=.git --exclude-dir=template --exclude=README.md --exclude=PLACEHOLDERS.md`. Then delete `PLACEHOLDERS.md`, replace `LICENSE` (it names this template's author) with your own, and delete `docs/template/` if you like: it holds this template's own ADRs (0002 to 0005), which say nothing about your project. Your own ADRs go in `docs/audit/decisions/`, after `0001-adopt-icm.md`.
3. Put `main` on your remote first, then install the hook. The hook refuses to create `main`, and after it is installed `main` takes only deploy records, so do `git push -u origin main` once before the hook goes in. Then: `cp scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)"`.
4. Start a **new** Claude Code session in the project folder and run `/master`. It is the project command `.claude/commands/master.md`, so there is nothing to install; if an earlier version of this template told you to copy a loader to `~/.claude/commands/master.md`, delete that file. Claude Code loads `.claude/agents/` when a session starts, so a session that was already open cannot call `reviewer`, `reviewer-strict` or `builder`. Then `phase 1: my-first-phase`, then `task: <one line goal>`.

Needs: Claude Code, `git`, the GitHub CLI `gh` for the release steps, Node 22 or newer for the hook test.

### Permissions

Run the loop in **auto mode**. Since Claude Code v2.1.283 it is the starting mode of an interactive terminal or VS Code session when no setting names a mode ([permission modes](https://code.claude.com/docs/en/permission-modes)); the status bar shows the text `auto mode on` (the glyph before it may render as a box). If auto mode is not available to you, the session starts in manual mode: see the last paragraph of this section.

`.claude/settings.json` is read by Claude Code in the project folder. Its rules, which apply in every mode:

- **Allow**, without a prompt: the push of a phase branch (`ALLOW_GIT_WRITE=1 git push -u origin phase-*`), the push of `main` for the deploy record, `gh pr create --base main --head phase-* ...`, and `gh pr merge ... --auto --merge`. Six rules, because the two `gh` forms are listed for both Bash and PowerShell.
- **Deny**: squash, rebase and admin merges, `--no-verify`, a second base or head on `gh pr create`, another repository, and every tool of the GitHub MCP servers named `github` and `plugin_github_github`. **Check your own GitHub MCP server name** (`/mcp` lists the servers; a tool is called `mcp__<server>__<tool>`). If it is neither of those two, add `"mcp__<server>"` to `permissions.deny`, or its write tools are not blocked: in the proof run the GitHub plugin's `merge_pull_request` reached GitHub because the rules named another server.
- **Ask**: `git merge` and `git rebase` (Bash), and `git push`, `git merge` and `git rebase` in PowerShell.

What a run in auto mode showed (Claude Code v2.1.318, Windows, Git Bash):

- Deny rules block in every mode: twelve denied forms were refused with no prompt and nothing ran. A blocked call leaves no entry under `/permissions` > Recently blocked.
- Ask rules still prompt in auto mode. The prompt for `git rebase` read "Ask rule Bash(git rebase:*) overrides auto mode for this command".
- `gh pr merge --auto --merge` ran with no prompt. The other three allowed forms were checked in manual mode only, and the PowerShell rules were not exercised.
- Everything else is the classifier's call. In the run, `node -e` and two dry-run pushes ran with no prompt. A command you typed in full counts as approved, so the run says little about a command the model chooses itself.
- The pre-push hook applies in every mode, because git runs it. It refused a dry-run push of a ref that is not `phase-*` with "Commits and pushes inside a Claude Code session go only through the orchestrator." To watch it run without pushing: `GIT_TRACE=1 git push --dry-run origin main` (exit 1, nothing pushed; the trace is long, so read the whole output).
- **The classifier's `autoMode` settings are user-level.** It reads them from `~/.claude/settings.json` and never from the project's `.claude/settings.json`, so this repository cannot tighten or loosen them, and what you put there applies in every repository you open.
- The "· summary" lines in the session UI are not evidence: twice a summary named a step that never ran. Check the log or `git` instead.
- Answering No to a permission prompt ends the turn. The agent does not carry on; you send the next instruction.

**Manual mode** (`claude --permission-mode manual`, status bar `manual mode on`) is an option, and the fallback when auto mode is unavailable. The rules above are the same, but everything not allowed waits on a prompt: about 40 per task in the proof run, mostly `node`, `npm` and file writes, and three quarters of them from the sub-agents. Read-only commands such as `git status` and `git diff` do not prompt. The `/master` preflight prompts once or twice (the hook comparison with `cmp`, and `git fetch origin`).

### Troubleshooting

- **`/master` stops and shows you the branch or `git status`.** Step 0 of `workflow/orchestrator/MASTER.md` says: "If the branch is not a `phase-NNN-<slug>` branch, or the tree is not clean, stop and show me." An untracked local file (a scratch note, an editor folder) makes the tree not clean. Keep it out of `git status` without touching `.gitignore`: ``echo '<path>' >> "$(git rev-parse --git-path info/exclude)"``. A pattern with a slash in the middle is anchored at the repository root, so write `**/.claude/x.json` to match that file in a subfolder as well.
- **`/master` says the pre-push guard is missing or out of date.** Check the installed hook: `cmp -s scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)" || echo "hook missing or stale"`. If it prints the message, install it again with the step 3 command: `cp scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)"`.
- **`/master` says `reviewer`, `reviewer-strict` or `builder` is missing.** Quit Claude Code and start a new session in the project folder. Claude Code loads `.claude/agents/` when a session starts.
- **An agent is still missing after a restart.** Its frontmatter is probably invalid YAML, and Claude Code then skips the file without a message. A `description` that holds a colon followed by a space, or that starts with `{`, is the usual cause. The template wraps the three descriptions in double quotes; keep the quotes when you edit them.
- **`/master` says the template is not filled in and points you at `PLACEHOLDERS.md`.** `AGENTS.md` still holds `{{placeholder}}` text. Run the step 2 command: it prints a line for each placeholder left. Fill them and start `/master` again.

## The example

The worked example (Slugify, a tiny Node module with one task run through spec, build and review) is in its own repository: [`ICM-DEV-example`](https://github.com/CharintornNillapat/ICM-DEV-example).

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
docs/template/                this template's own ADRs; delete in your project
scripts/git-hooks/            pre-push guard and its test
```

## License

MIT, see [LICENSE](LICENSE).
