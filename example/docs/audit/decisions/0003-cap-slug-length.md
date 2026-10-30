# 0003: cap a slug at 80 characters without splitting a word

**Status:** Accepted. To be implemented in Phase 002 (T002).

**Date:** 2026-10-30

## Context

`slugify` returns its slug at any length (`src/slugify.js:3-8` at `6d98d6e`): a 300-character title gives a slug of about 300 characters. The owner wants at most 80 characters, cut at the last hyphen before the limit so no word is split.

## Decision

- **D1: At most 80 characters.** After the slug is built, a slug of 80 characters or fewer is returned as is. The limit is the module constant `MAX_LENGTH = 80`, not exported and not an option.
- **D2: Cut at the last hyphen at or before index 80.** A longer slug keeps everything before its last hyphen found by `lastIndexOf('-', 80)`. A hyphen at index 80 counts: the first 80 characters are then whole words, and all 80 are kept.
- **D3: A first word longer than 80 is cut at 80.** With no hyphen to cut at, the slug is cut at 80 characters. This is the one case that splits a word; "at most 80" wins over "no split".

## Alternatives

- **Return a too-long first word whole (rejected).** It splits nothing but breaks the 80-character guarantee, which is the point of the change.
- **Return `''` when the first word is too long (rejected).** It keeps both rules but throws away the whole title for one long word.
- **A `maxLength` option (not now).** No caller needs another limit; add a parameter when one does.

## Consequences

- Every title whose slug was over 80 characters gets a shorter slug. This package stores no slugs, but a caller that stored old ones and recomputes them to look them up will miss.
- The slug invariants in `docs/contexts/slugify.md` still hold: a cut at a hyphen or inside a run of letters and digits leaves a valid slug of at most 80 characters, so `slugify(slugify(x))` equals `slugify(x)`.

## Not done

- No option or CLI flag to change the limit.
- No ellipsis or marker on a cut slug.
- No README example and no `version` change in `package.json`.

## Release

One pull request. No production touch point. `src/slugify.js` is a critical path on the pause list, so the owner merges it. No owner action after the merge.
