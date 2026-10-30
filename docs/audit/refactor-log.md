# Refactor log

Append-only, newest entry first. One entry per **shipped phase**, never per commit.

Every entry keeps these headings, even when one is "none":

```
## Phase NNN - <title>: T001-T003 (<date>, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `NNNN`. <the brief, one or two sentences>

**Changed:** <files and what changed>
**Verified:** <gate commands and their results>
**Surprises:** <or none>
**Deliberately not done:** <or none>
```
