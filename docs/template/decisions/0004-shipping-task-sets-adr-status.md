# 0004: the shipping task sets the ADR Status; the deploy record only fills shas

**Status:** Superseded in part by 0007 (D1, D4).

**Date:** 2026-11-01

## Context

`MASTER.md`'s `merged` step 3 lets the deploy record edit "the phase's ADR" to replace `<sha>` placeholders, and says nothing about the ADR's Status. In the project this template was extracted from, the last eight ADRs (0109 to 0116) show no rule at work: the task that shipped the phase set the Status in two (0109 and 0110, both with `<sha>` left for the deploy record); the deploy record flipped it in one (0112), which goes past step 3; one kept its old wording after the deploy record filled its shas (0111); four were never flipped (0113 to 0116). The proof run of this template left ADR 0003's Status at "To be implemented", following that precedent.

A second gap sits next to it: a review's non-blocking notes are reported once, in the orchestrator's chat, and have no home afterwards. Nothing says to keep them, and the deploy record may not fix them.

## Decision

- **D1: The task that ships the phase sets the ADR Status.** That is the task that writes the `refactor-log.md` entry. Its spec lists the phase's ADR as a target and gives the new Status line as an exact-text edit: ``Accepted. Implemented in Phase NNN (T001 to T003): code `<sha>`, merged `<sha>`.`` The builder keeps the `<sha>` placeholders.
- **D2: The reviewer blocks a shipping task whose ADR Status is not as the spec gave.** Stage 03 step 5 checks it with the parity map.
- **D3: The deploy record only fills in.** It replaces `<sha>` in the log header and the ADR Status, fills the Commit cells, records the merge and the CI and deployment results, and adds Backlog rows (D5). It never rewrites wording. A shipping task that left the Status unflipped is reported and gets a Backlog row; the next phase fixes it.
- **D4: An ADR that spans phases** stays `Accepted. To be implemented in Phase NNN (Txxx)`, naming the next phase that remains. Only the shipping task of its last phase flips it to `Implemented`.
- **D5: Review notes are tagged, and the follow-ups are kept.** The reviewer tags each non-blocking note `follow-up` (a real gap or defect that did not block this task) or `nit` (wording, style, taste). At `merged`, the deploy record adds one Backlog row, `B001`, `B002` and so on, for each `follow-up` note the task's build or fix report does not say it applied. A `nit` stays in the review file.

## Alternatives

- **The deploy record flips the Status (rejected).** It keeps the shipping task smaller, but it puts a claim of completion into the one commit nobody reviews, and it is what the extracted project did once, against its own step 3.
- **Leave the Status alone (rejected).** It is what happened in five of eight ADRs, and it leaves ADRs saying "to be implemented" about shipped work.
- **A Backlog row for every non-blocking note (rejected).** It loses nothing, but it floods the Backlog with taste. The tag costs the reviewer one word per note.
- **Ask the owner which notes to keep at every `merged` (not now).** It adds a question to the one step that is meant to be mechanical.

## Consequences

- A shipping task's spec carries one more target and one more exact-text edit; its review carries one more check.
- The deploy record stays mechanical: every edit it makes is a fill, never a decision.
- An untagged note counts as `follow-up`, so a reviewer that forgets the tag loses nothing.
- ADR Status lines of the extracted project that were never flipped are not fixed here; that project adopts the same rule in its own loop.

## Not done

- No change to the pre-push hook: it already accepts an edit to an existing ADR.
- No script that derives Backlog rows; MASTER reads the reviews.

## Release

One pull request, no production touch point, no owner action after the merge.
