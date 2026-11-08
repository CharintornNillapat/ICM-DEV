# 0007: the supersession marker is an insertion, and the shipping task edits only the trailing sentence

**Status:** Accepted.

**Date:** 2026-11-08

## Context

ADR 0006 (D1) says the marker replaces only the leading `Accepted.`. Two cases have no leading `Accepted.` to replace. An ADR superseded in part a second time has a Status line that already starts with a marker, for example ``Superseded in part by 0031 (D3). Implemented in Phase 011 (T040 to T042): code `3c4d5e6`, merged `7f8a9b0`.`` An ADR superseded in part before its phase ships reads `Superseded in part by 0058 (D2). To be implemented in Phase 015 (T070 to T072).`, and its shipping task (ADR 0004, D1 and D4) writes a whole line that starts with `Accepted.`, which erases the marker. A rule that edits only the leading `Accepted.` either finds nothing to replace or overwrites the first marker with the second.

## Decision

- **D1: The marker is inserted, never substituted for existing marker text.** It takes the place of a leading `Accepted.`, or, when the line already starts with a marker, goes directly after the last of them, oldest first. Every other character of the line stays. One superseding ADR adds one marker that lists every decision it replaces, comma separated: `Superseded in part by 0047 (D1, D3).` A later ADR that replaces another decision of the same older ADR adds its own marker by the same insertion rule: ``Superseded in part by 0031 (D3). Superseded in part by 0047 (D1, D4). Implemented in Phase 011 (T040 to T042): code `3c4d5e6`, merged `7f8a9b0`.`` A line that already holds `Superseded by NNNN.` takes no further marker. Stage 03 checks that deleting the inserted marker from the new line, and putting `Accepted.` back if the marker took its place, gives the old line byte for byte.
- **D2: The shipping task changes only the trailing sentence.** `To be implemented in Phase NNN (Txxx).` becomes the `Implemented in Phase NNN (T001 to T003): code <sha>, merged <sha>.` record, and the text before it, `Accepted.` or markers, stays. The spec gives the ADR's Status line as `Before` and `After` blocks written from the line as it stands on the phase branch, and the builder stops if the line does not read as `Before`.
- **D3: This changes ADR 0006's D1 and D2 and ADR 0004's D1 and D4.** The rule's text is updated in `AGENTS.md`, the stage 01, 02 and 03 contracts, `workflow/orchestrator/MASTER.md` and `docs/audit/decisions/0000-template.md`. The bodies of ADR 0004 and ADR 0006 stay as written; their Status lines carry the new marker.

## Alternatives

- **Merge markers into one: `Superseded in part by 0031 (D3), 0047 (D1).` (rejected).** It rewrites existing text, so the old line is no longer recoverable from the new one by deleting a sentence, and the stage 03 check by deletion no longer works.
- **Put the newest marker first (rejected).** It is as checkable, but it reads against the order the supersessions happened.
- **Let the shipping task write the whole line (rejected).** It is what ADR 0004 D1 does today, and it erases markers.

## Consequences

- An ADR superseded twice, or superseded before it ships, keeps every marker and its implementation record.
- Every spec that edits an ADR Status line now carries a `Before` block, which costs a few lines per spec and turns a stale line into a stop instead of an overwrite.
- A superseded ADR that never shipped still reads `Superseded in part by NNNN (Dx). To be implemented in Phase NNN (Txxx)`, which is accurate.

## Not done

- ADRs already superseded under the 0005 or 0006 forms are not rewritten here; none exist in this template.
- No change to the pre-push hook: it already accepts an edit to an existing ADR.
- No rule for a decision replaced in an ADR that already holds `Superseded by NNNN.`: it takes no marker, and the spec says so.

## Release

One pull request, no production touch point, no owner action after the merge.
