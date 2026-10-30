# Context: example

One context file per area of the code. A stage reads it only when `AGENTS.md`'s routing table sends the task here, so keep it to what a builder or reviewer must know that the code does not say: the invariants, the traps, where the tests live, and which ADR explains each rule.

## What this area does

<Two or three sentences.>

## Invariants

- <A rule the code must keep, with `file:line` of the code that enforces it and the test that guards it.>

## Traps

- <A mistake an agent made here before, and the one-line way to avoid it.>

## Tests

- <Where they live, how to run one, what each file covers.>
