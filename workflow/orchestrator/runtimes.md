# Orchestrator runtimes

Which agent, model, tools and shell play each role of the ICM workflow. The rules live in AGENTS.md, the stage files and workflow/orchestrator/MASTER.md; this file says only who runs them and with what. It is the one file in the repo meant to name the agents and models behind each role. AGENTS.md, the stage files (workflow/stages/*/CONTEXT.md) and workflow/orchestrator/MASTER.md name roles only: the orchestrator, the light reviewer, the strict reviewer and the builder.

## Roles

| Role | Agent | Model |
|---|---|---|
| Orchestrator (MASTER) | The Claude Code main session, started with `/master` | The session's model, not pinned |
| Light reviewer | Project sub-agent `reviewer`, `.claude/agents/reviewer.md` | `sonnet` |
| Strict reviewer | Project sub-agent `reviewer-strict`, `.claude/agents/reviewer-strict.md` | `opus` |
| Builder | Project sub-agent `builder`, `.claude/agents/builder.md` | `haiku` |

The split is deliberate: a cheap builder and strong reviewers. The builder does the volume of the work, and the reviewer re-runs every gate and the red run itself, so the builder's claims are never taken on trust. If the builder's model is too weak for your code, raise it in `builder.md`; keep it at or below the strict reviewer's.

## Loader, tools and shell

| | |
|---|---|
| Loader in the repo | `workflow/orchestrator/loaders/claude-code.md` |
| Installed at (the owner copies it by hand) | `~/.claude/commands/master.md` |
| Instructions | `workflow/orchestrator/MASTER.md`, read from the checked-out branch |
| Agent calls | The Agent tool, `subagent_type` `reviewer`, `reviewer-strict` or `builder`; the final message comes back as the tool result |
| Orchestrator tools | Claude Code's built-in tools (Bash, Read, Grep, Agent and the rest) |
| Shell | Git Bash on Windows: `MSYS_NO_PATHCONV=1` before an argument that starts with `/`, `ALLOW_GIT_WRITE=1` inline on the one git command. On macOS and Linux the same commands run as written |
| GitHub writes | `release` runs `gh pr create` in the exact form `.claude/settings.json` allows and, when eligible, `gh pr merge <n> --auto --merge` |
| Waiting for the merge | `merged` polls `gh pr view` |
| Usage tracking | `usage on` snapshots `npx ccusage@latest session --json` |

## Guards

What stops a wrong command beyond the agents' own instructions.

| Guard | What it does |
|---|---|
| Pre-push hook `.git/hooks/pre-push`, a byte copy of `scripts/git-hooks/pre-push` | Runs on every push. Inside a Claude Code session (`CLAUDECODE=1`) it refuses every push unless `ALLOW_GIT_WRITE=1` is set on that command, and refuses deleting or rewinding any remote branch. Everywhere it lets `main` take only fast-forward, single-parent `docs(deploy): ... [skip ci]` commits that touch the deploy-record files. The preflight compares the copy with `cmp -s` and pushes nothing while it differs. Never `--no-verify` |
| Permission rules in `.claude/settings.json` | Allow the three push and PR forms the orchestrator uses and the auto-merge call; ask on `git merge`, `git rebase` and PowerShell pushes; deny squash, rebase and admin merges, `--no-verify`, a second base or head, another repository, and the GitHub MCP write tools. Rules can match flags, not only a command name |

## Other runtimes

An external CLI agent in a terminal pane (another vendor's coding CLI inside a terminal multiplexer such as tmux) can play the builder: the orchestrator would send it the order text and read its reply instead of calling the Agent tool. This template ships no loader for that, and none of its guards have been tested against one. If you add one, give the new builder the same stage file, the same STATUS line and the same prohibitions, put its loader in `workflow/orchestrator/loaders/`, and add its row to the tables above, because a loader may narrow `MASTER.md` and never widen it.
