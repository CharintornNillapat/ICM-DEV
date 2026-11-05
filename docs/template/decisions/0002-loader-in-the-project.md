# 0002: the /master loader lives in the project

**Status:** Accepted.

**Date:** 2026-10-30

## Context

`/master` starts the orchestrator. Its body, `workflow/orchestrator/MASTER.md`, is versioned and read from the checked-out branch, but the loader that starts it was copied by hand to `~/.claude/commands/master.md`, a file of the user's machine, not of the project.

Two things follow. Two projects built from this template on one machine share one `/master`: installing the second overwrites the first. And the loader holds the preflight and the runtime notes, so a change to it cannot land in one commit or be reviewed together with the `MASTER.md` and stage-file change it goes with. The Slugify proof run of this template met the first problem on the author's machine, where the global command named another project.

## Decision

- **D1: The loader is a project command.** `.claude/commands/master.md` holds what `loaders/claude-code.md` held. Claude Code reads it from the project folder, so nothing is copied or installed, and two projects no longer share it.
- **D2: It is versioned like `MASTER.md`.** It is read from the checked-out branch, so a change to it lands with the stage-file change it matches and is reviewed with it.
- **D3: `.claude/commands/` joins the pause list.** A task that edits the loader changes what `/master` says before review, as a task that edits `workflow/orchestrator/` does, so it pauses for the owner, gets the strict reviewer and is merged by the owner.
- **D4: `workflow/orchestrator/loaders/` is removed.** A runtime other than Claude Code ships its own project-level loader file, where that runtime reads project commands, and a row in `runtimes.md`.

## Alternatives

- **Keep the loader global (rejected).** The owner sees what is installed, as with the pre-push hook. It costs the collision above and an unreviewed file that decides what MASTER does. The hook stays a hand copy because git offers no project-level place for it; Claude Code does.
- **Install the loader by symlink or script (not now).** It would still write to a global path, so two projects would still collide.
- **Keep both, a global file and a project file of the same name (rejected).** Which one wins is not something this template has verified.

## Consequences

- Starting a project needs one step fewer: copy the folders, fill the placeholders, install the hook, start a new session.
- The loader follows the branch. A branch that edits it changes the orchestrator's first instructions before review; D3 bounds that exposure the same way it is bounded for `MASTER.md`.
- A session started at the root of this template repository, where the placeholders are unfilled, also sees `/master`. Its first preflight check (`grep -c '[{][{]' AGENTS.md`) stops it.
- The author's stale `~/.claude/commands/master.md` keeps working until it is deleted, and would sit beside the project command with an unverified winner. Deleting it is the owner's step.

## Not done

- No loader for another runtime.
- No edit to any file under `~/.claude/`.
- ADR 0001's Not done line "No tooling to install the loader or the hook" stays as written; it is now true of the hook only.
- The `icm.projectDir` preflight line stays in the loader; a later task removes it.

## Release

One pull request, no production touch point. After the merge the owner deletes `~/.claude/commands/master.md` before the next run that uses the project command.
