# 0003: one repository per project, and the example in its own repository

**Status:** Accepted.

**Date:** 2026-10-30

## Context

This template repository also held `example/`, a filled copy for a tiny Node project, and the loop was run on it in place, as a folder of the template repository. That layout cost three things, all met in the second proof run:

- Claude Code looks up agents in the launch folder only, but walks up the parents for `CLAUDE.md`. A session started in `example/` found the template's root `CLAUDE.md`, which imports the unfilled root `AGENTS.md`, and asked to load a file outside the project. A session at the root registers three agents whose descriptions are still `{{project_name}}`.
- The pre-push hook needed `icm.projectDir` so that the deploy-record allow-list sat under the folder: five lines in the hook, five tests, a preflight line in the loader, a README clause, a `git show HEAD:./<path>` rule for gates and a `**/` in the exclude pattern of a local file.
- GitHub's "Use this template" copies the whole repository, so a user would receive `example/` beside the template, and no user's project is a folder of a larger repository.

## Decision

- **D1: The project is the repository root.** The template assumes `AGENTS.md`, `.claude/` and `workflow/` sit at the top of the repository. A folder of a larger repository is not supported.
- **D2: The worked example lives in its own repository**, `ICM-DEV-example`, a filled copy of this template with its recorded task outputs. `example/` is removed from this repository; its history stays here.
- **D3: `icm.projectDir` is removed.** The hook's allow-list is `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md` and `docs/audit/decisions/NNNN-*.md` at the repository root, as before. A `git config icm.projectDir` left over from an earlier version is ignored, so a deploy record under a folder is refused: the hook fails safe.
- **D4: The loader stops a misplaced project at the start.** Its preflight runs `git rev-parse --show-prefix` and stops if it prints a folder, instead of letting the first deploy-record push fail.

## Alternatives

- **Move the template into `template/` (rejected).** It stops the walk-up, but "Use this template" would still give a nested layout, `icm.projectDir` would stay for the example, and every path in the README would change.
- **Keep the example in this repository (rejected).** It is the cause of the walk-up and of `icm.projectDir`.
- **Keep `icm.projectDir` for monorepos (not now).** Nobody has asked for it; it came only from running the example in place. Add it back with a real user.

## Consequences

- A fix to the template and the matching change to the example are two changes in two repositories, by hand. There is no drift tooling; the example's README names the template commit it was filled from.
- The example repository is a project in the shape every user has, so a run on it also tests the release flow, the `main` rules and auto-merge.
- Until the example repository exists, this repository has no worked example, and the README says so.
- The loop on this repository itself is not run: its `AGENTS.md` is a template.

## Not done

- The example repository is not created here; the owner creates it on GitHub once the template fixes are merged.
- The Slugify example's own findings (placeholder shas in its Phase 001 record, the Status of its early ADRs) are fixed in that repository.
- ADR 0002's Not done line, that the `icm.projectDir` preflight stays in the loader, is overtaken by D4.

## Release

One pull request, no production touch point. The owner's steps for the example repository come after all the template fixes.
