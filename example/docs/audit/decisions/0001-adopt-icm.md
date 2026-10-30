# 0001: deliver software through the ICM loop

**Status:** Accepted.

**Date:** 2026-10-30

## Context

An agent that specs, builds and reviews in one long session carries the whole task in one context. It grades its own work, loses early decisions as the context fills, and leaves no record of why it did what it did. The Interpretable Context Methodology (Van Clief and McDermott, arXiv:2603.16021) replaces that with folders and markdown: each stage has a contract file, reads only what the contract names, and writes one output file the next stage reads.

The official ICM repository ships content workspaces. This repository applies the same layers to software delivery: spec, build, review.

## Decision

- **D1: Three stages, one contract file each.** `workflow/stages/01_spec/CONTEXT.md`, `02_build/CONTEXT.md` and `03_review/CONTEXT.md` hold the role, inputs, process, outputs, verify steps, prohibitions and the STATUS line of their stage. A stage reads its contract and the files the contract names, nothing else.
- **D2: The output folder is the interface.** A stage writes `task-<id>-spec.md`, `task-<id>-build.md` or `task-<id>-review.md` into its own `output/`. The next stage reads that file, not the previous agent's conversation.
- **D3: One orchestrator, three agents.** MASTER (`workflow/orchestrator/MASTER.md`) routes orders and writes no code. A light reviewer, a strict reviewer and a builder do the work as sub-agents, each starting from an empty context.
- **D4: A cheap builder, strong reviewers.** The builder runs on a cheaper model than the strict reviewer. The reviewer re-runs every gate and the red run, so the builder's report is a claim, never evidence.
- **D5: One pause list.** `AGENTS.md`'s Pause after the spec bullet is the only list of risk paths. The orchestrator pauses for the owner there, picks the strict reviewer there, and withholds auto-merge there.
- **D6: Only the orchestrator writes git history.** It commits each APPROVED task on a phase branch and opens the PR; the pre-push hook refuses everything else it should not push.

## Alternatives

- **One agent, one session (rejected).** Less to set up, and it works for a small change. It cannot show who checked what, and the reviewer shares the builder's blind spots.
- **A framework or CLI to run the loop (not now).** The method's claim is that folders and markdown are enough. Add tooling when a real task shows a step the files cannot carry.
- **Reviewer and builder on the same model (not now).** Simpler, but it removes the cost split. Raise the builder's model in `.claude/agents/builder.md` if its work keeps failing review.

## Consequences

- Every task leaves three files and a ledger row: the audit trail is in git.
- A stage-file or orchestrator change is itself a task. It is on the pause list, so the owner reads it before the build.
- The loop costs more calls than one session on a one-line change; `AGENTS.md` lets typos, copy and doc-only edits skip the process.

## Not done

- No tooling to install the loader or the hook: the owner copies both by hand.
- No archive rule for `output/` folders. They grow by three files a task; decide on archiving per phase when they get in the way.

## Release

One pull request. No production touch point. It changes `AGENTS.md` and `workflow/`, both on the pause list, so the owner merges it.
