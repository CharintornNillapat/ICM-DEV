# 0002: keep the base letter of accented Latin letters

**Status:** Accepted. To be implemented in Phase 001 (T001).

**Date:** 2026-10-30

## Context

`slugify` lowercases its input and then turns every run of characters outside `[a-z0-9]` into one hyphen (`src/slugify.js:4-5` at `df83222`). `toLowerCase` leaves an accented letter accented, so each one becomes a hyphen: `slugify('Café au lait')` returns `'caf-au-lait'` and `slugify('ÉCOLE Ñandú')` returns `'cole-and'`. The owner wants the base letter kept: `'cafe-au-lait'`.

## Decision

- **D1: Decompose, then drop the combining marks.** `slugify` runs `normalize('NFD')` on its input, which splits a precomposed letter such as `é` into `e` and U+0301, then removes every code point in U+0300 to U+036F (the Combining Diacritical Marks block) before it lowercases. Input that arrives already decomposed gets the same slug.
- **D2: Only letters with a canonical decomposition change.** A letter Unicode does not decompose (`ø`, `ł`, `đ`, `ß`, `æ`, `œ`) still turns into a hyphen, as before.

## Alternatives

- **A hand-written transliteration table (not now).** It would also map `ø` to `o`, `ß` to `ss` and `æ` to `ae`, but it is a table to keep and to argue over per language, and the owner asked only for accents.
- **`normalize('NFKD')` (rejected).** It also folds compatibility forms (the `fi` ligature, superscript digits, full-width letters), which changes slugs the owner did not ask about.
- **Strip every mark with `/\p{M}/gu` (not now).** It would also drop the rarer mark blocks (U+1AB0 to U+1AFF, U+1DC0 to U+1DFF, U+20D0 to U+20FF). No title so far needs them; widen the class when one does.
- **A slug library from npm (rejected).** `AGENTS.md` forbids dependencies.

## Consequences

- Every title with an accented Latin letter gets a new slug (`caf-au-lait` becomes `cafe-au-lait`). This package stores no slugs, but a caller that stored old ones and recomputes them to look them up will miss.
- The slug invariants in `docs/contexts/slugify.md` still hold: the output is still ASCII, so `slugify(slugify(x))` equals `slugify(x)`.

## Not done

- No transliteration of letters without a decomposition (`ø`, `ł`, `đ`, `ß`, `æ`, `œ`).
- No handling of non-Latin scripts; their letters still turn into hyphens.
- No README example and no `version` change in `package.json`.

## Release

One pull request. No production touch point. `src/slugify.js` is a critical path on the pause list, so the owner merges it. No owner action after the merge.
