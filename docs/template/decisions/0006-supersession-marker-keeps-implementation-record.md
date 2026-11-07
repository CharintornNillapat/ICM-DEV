# 0006: the supersession marker replaces only the leading "Accepted." and keeps the implementation record

**Status:** Accepted.

**Date:** 2026-11-07

## Context

ADR 0005 (D4) says a new ADR that replaces a decision of an older ADR replaces the older ADR's whole Status line with `Superseded in part by NNNN (Dx)`. The older ADR's Status line usually carries its implementation record (`Implemented in Phase NNN (T001 to T003): code <sha>, merged <sha>.`, set by ADR 0004), so the rule erases the one line that says when and where the decision shipped. FinLife, the project this template was extracted from, hit this and fixed it in its ADR 0118: the marker replaces only the leading `Accepted.`.

## Decision

- **D1: The marker replaces only the leading `Accepted.`** and the rest of the Status line stays. Partial supersession: ``Superseded in part by 0012 (D3). Implemented in Phase 004 (T010): code `abc1234`, merged `def5678`.`` Full supersession uses `Superseded by NNNN.` in the same position.
- **D2: Only the Status line of the older ADR changes.** Stage 03 still checks that `git diff -- <older ADR>` shows that one line, and now also that the text after the marker is unchanged.
- **D3: This changes ADR 0005's D4.** The rule's text is updated in `AGENTS.md`, the stage 01 and stage 03 contracts and `docs/audit/decisions/0000-template.md`. ADR 0005's body stays as written; its Status line carries the new marker form.

## Alternatives

- **Keep replacing the whole line (rejected).** It is what 0005 D4 did, and it drops the implementation record that ADR 0004 requires the shipping task to write.
- **Add a separate `Superseded by` line (rejected).** It would make the older ADR change by more than one line, and break the one-line diff check in stage 03.

## Consequences

- An older ADR keeps its shipped sha and merge record after it is superseded.
- A superseded ADR that never shipped reads `Superseded in part by NNNN (Dx). To be implemented in Phase NNN (Txxx)`, which is accurate.
- ADRs already superseded under the 0005 form are not rewritten here; none exist in this template.

## Not done

- No other rule changed: the shipping task's Status edit (ADR 0004) and the deploy record's fill-only rule stay as they are.
- No change to the pre-push hook: it already accepts an edit to an existing ADR.

## Release

One pull request, no production touch point, no owner action after the merge.
