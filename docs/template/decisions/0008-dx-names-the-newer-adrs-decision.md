# 0008: Dx in the supersession marker names the newer ADR's decision

**Status:** Accepted.

**Date:** 2026-11-08

## Context

The marker `Superseded in part by NNNN (Dx).` (ADR 0007, D1) never says which ADR's decisions `Dx` names. FinLife, the project this template was extracted from, defines it as the decisions of the newer ADR NNNN that replace part of the older one, and rejected numbering from the older ADR. PR #10 numbered two Status lines from the older ADR: ADR 0004 read `Superseded in part by 0007 (D1, D4).` and ADR 0006 read `Superseded in part by 0007 (D1, D2).`. Those are 0004's and 0006's own decisions (ADR 0007, D3). By the newer ADR's numbering, ADR 0007 D2 replaces 0004's rule and ADR 0007 D1 replaces 0006's, so the lines now read `Superseded in part by 0007 (D2).` and `Superseded in part by 0007 (D1).`

## Decision

- **D1: `Dx` names the decisions of the newer ADR NNNN that replace part of the older one, numbered as in NNNN, never as in the older ADR.** The rule's text is updated in `AGENTS.md`, the stage 01 and stage 03 contracts and `docs/audit/decisions/0000-template.md`.
- **D2: The two Status lines numbered from the older ADR are corrected.** ADR 0004 and ADR 0006 carry the markers named in Context. Their bodies, and the body of every other ADR, stay as written.

## Alternatives

- **`Dx` naming the older ADR's decision (rejected).** Two numberings would make a marker read two ways: `0007 (D1)` would mean 0007's D1 or the older ADR's D1, and a reader could not tell without opening both.
- **Leave PR #10's lines as they are (rejected).** They name decisions of 0004 and 0006 under a rule that numbers by the newer ADR, so `0007 (D4)` points at a decision 0007 does not have.

## Consequences

- A marker reads one way: open ADR NNNN, find the decisions it lists.
- A spec that gives an `After` block lists the newer ADR's decision numbers, which it writes itself.

## Not done

- ADR 0005's `Superseded in part by 0006 (D1).` is unchanged: 0006 D1 is the decision that replaces part of 0005 D4, so it already follows the rule.
- No change to the pre-push hook: it already accepts an edit to an existing ADR.

## Release

One pull request, no production touch point, no owner action after the merge.
