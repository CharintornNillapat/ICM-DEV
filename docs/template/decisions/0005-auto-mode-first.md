# 0005: auto mode is the primary mode; GitHub MCP is denied by server; template ADRs move out of the way

**Status:** Superseded in part by 0006 (D1).

**Date:** 2026-11-05

## Context

Proof run 3 measured the loop in manual mode (about 40 permission prompts per task, mostly node, npm and file writes) and again in auto mode, where the permission rules held and the prompts nearly vanished. In auto mode six `mcp__github__*` deny rules did not cover the GitHub plugin's server, `mcp__plugin_github_github`, so its `merge_pull_request` ran. A project copied from this template also carried ADRs 0002 to 0004, which describe this template, into its own `docs/audit/decisions/`, and its placeholder grep hit them.

## Decision

- **D1: Auto mode is the primary mode.** The README's Permissions section describes auto mode; manual mode is one short option, with its measured cost. If auto mode is unavailable, use manual.
- **D2: The GitHub MCP servers are denied by server name.** `mcp__github` and `mcp__plugin_github_github` replace the per-tool deny rules, and the two `mcp__github__*` ask rules are removed. A user whose server has another name adds it.
- **D3: ADRs 0002 to 0004 move to `docs/template/decisions/`.** ADR 0001 stays in `docs/audit/decisions/`. `docs/template/` can be deleted from a project.
- **D4: A new ADR that replaces any decision of an older ADR edits only the older ADR's Status line** to `Superseded in part by NNNN (Dx)`. Stage 03 blocks a task that changes more of the older ADR.
- **D5: Three command rules for agents.** No `cd` prefix, change files with the Edit and Write tools, and write the em dash as `String.fromCharCode(8212)`.

## Alternatives

- **Keep per-tool deny rules for both prefixes (rejected).** It misses every tool a later server version adds.
- **Keep manual mode primary (rejected).** In proof run 3 all 86 manual-mode prompts were approved without review, so they gave no oversight; the guards that held in both modes are the deny rules and the pre-push hook. The owner runs auto mode for all real work.
- **Delete ADRs 0002 to 0004 (rejected).** They record why the template is shaped as it is.

## Consequences

- The classifier's `autoMode` settings are user-level, not project-level, so they apply in every repository the user opens.
- A rename of the GitHub server leaves the deny rule dead until the README step is followed.

## Not done

- The PowerShell rules were not exercised in auto mode.
- No change to the pre-push hook or its allow-list.

## Release

One pull request, no production touch point.
