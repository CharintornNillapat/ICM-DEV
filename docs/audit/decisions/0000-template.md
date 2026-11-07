# NNNN: <the decision, in a few words>

**Status:** Proposed | Accepted | Superseded by NNNN | Superseded in part by NNNN (Dx). A new ADR that replaces any decision of an older ADR changes only that older ADR's Status line, replacing its leading `Accepted.` with `Superseded in part by NNNN (Dx).` (or `Superseded by NNNN.`) and keeping the implementation record that follows, and leaves the rest of it as written. To be implemented in Phase NNN (T001). The task that ships the phase changes the last sentence to ``Implemented in Phase NNN (T001 to T003): code `<sha>`, merged `<sha>`.``; the deploy record fills the shas. An ADR that spans phases keeps `To be implemented in Phase NNN (Txxx)`, naming the next phase that remains, until its last phase ships.

**Date:** YYYY-MM-DD

## Context

What forces the decision: the problem, the constraint, what already exists. Cite `file:line` for a claim about code.

## Decision

- **D1: <one decision>.** What changes, in the present tense.
- **D2: ...**

## Alternatives

- **<Alternative> (rejected | not now).** What it would give, and why it lost. An ADR with no live alternative is not an ADR: put the rule in `AGENTS.md` instead.

## Consequences

- What gets easier, what gets harder, what the next task must know.

## Not done

- What this decision deliberately leaves out, so no one assumes it was covered.

## Release

How it ships: one pull request, any production touch point, and who does what after the merge (the owner, and when). "None" is a valid answer.
