# Task T001 spec: keep the base letter of accented Latin letters

Phase 001 (branch `phase-001-accents`, cut from `main` at `df83222`). Written by the strict reviewer, 2026-10-30.

## 1. Goal

`slugify` keeps the base letter of an accented Latin letter instead of turning it into a hyphen, so `slugify('Café au lait')` returns `'cafe-au-lait'`.

## 2. Target files

```
docs/audit/decisions/0002-keep-accent-base-letters.md
test/slugify.test.js
src/slugify.js
docs/contexts/slugify.md
docs/audit/refactor-log.md
```

Order of work: the ADR first (edit 1), then the tests and their red run (edit 3), then the code (edit 2), then the context file (edit 4), then the refactor-log entry (edit 5). Bookkeeping (`docs/audit/task-ledger.md`, `workflow/stages/02_build/output/*`) is allowed as usual.

Why `docs/audit/refactor-log.md`: T001 touches the critical path, so by `AGENTS.md`'s Batching bullet it is its own phase; it is the phase's only task and so the task that ships it.

## 3. Context to read

- `docs/contexts/slugify.md`: the task changes `src/slugify.js` and its tests. Its Traps bullet (line 22) describes exactly the behaviour this task removes, and its Invariants (lines 11 to 15) must still hold.

## 4. Current behaviour

- `src/slugify.js:3` turns the input into a string; `src/slugify.js:4` lowercases it with `toLowerCase`, which leaves `é` as `é`.
- `src/slugify.js:5` replaces every run of characters outside `[a-z0-9]` with one `-`, so each accented letter becomes a hyphen; `src/slugify.js:6` trims leading and trailing hyphens.
- Measured on `df83222` with Node v24.19.0:
  - `slugify('Café au lait')` is `'caf-au-lait'`
  - `slugify('Crème Brûlée')` is `'cr-me-br-l-e'`
  - `slugify('ÉCOLE Ñandú')` is `'cole-and'`
  - `slugify('Phở Việt')` is `'ph-vi-t'`
  - `slugify('Re\u0301sume\u0301')` (already decomposed input) is `'re-sume'`
  - `slugify('Smørrebrød')` is `'sm-rrebr-d'` and `slugify('Straße')` is `'stra-e'` (these stay so; see Out of scope)
- `bin/slugify.js:4` prints `slugify` of its joined arguments, so the CLI inherits the change with no edit.
- `test/slugify.test.js:5-19` holds four tests, none with a non-ASCII character.
- `docs/contexts/slugify.md:22` (Traps) states the current hyphen behaviour; it is stale once the code changes, so edit 4 rewrites it.

## 5. Parity map

- Row "The exports of `src/slugify.js` / The usage example in `README.md` and the CLI in `bin/slugify.js`": touched but unchanged. The export stays one function, `slugify(title)`, with the same signature; `README.md:7` (`'Hello, World!'` to `'hello-world'`) and `README.md:11` (`hello-world`) still hold; `bin/slugify.js` needs no edit. Guarded by `test/slugify.test.js` and `e2e/cli.test.js`, both in the gates.

## 6. Tests to add

Both go in `test/slugify.test.js`, appended after line 19, separated from the last test by one blank line, the file ending in a single newline (edit 3). They fail today because `src/slugify.js:5` turns each accented letter into a hyphen.

1. `keeps the base letter of accented Latin letters`: precomposed lowercase and uppercase accents (`é`, `è`, `û`, `É`, `Ñ`, `ú`). Fails today on its first assertion: actual `'caf-au-lait'`, expected `'cafe-au-lait'`.
2. `drops stacked accents and already-decomposed accents`: Vietnamese letters with two marks (`ở`, `ệ`) and input that arrives as base letter plus U+0301. Fails today on its first assertion: actual `'ph-vi-t'`, expected `'pho-viet'`.

Red run (stage 02 step 4): after adding the tests and before edit 2, run `node --test test/slugify.test.js` and save it to `workflow/stages/02_build/output/logs/T001-red.log`. It must show `tests 6`, `pass 4`, `fail 2`, with the two actual/expected pairs above. After edit 2 the same command shows `tests 6`, `pass 6`, `fail 0`.

Note for the reviewer (stage 03 step 6): `git ls-files --eol src/slugify.js` shows `w/lf` and `core.autocrlf` is `true`, so step 6.2 leaves `src/slugify.js` out of the stash, and both new tests depend on it. Either record their red run as not verified, as step 6.2 says, or reproduce it with no edit to a tracked file, writing only under the gitignored `workflow/stages/03_review/output/logs/`:

```
mkdir -p workflow/stages/03_review/output/logs/red/src workflow/stages/03_review/output/logs/red/test && git show HEAD:src/slugify.js > workflow/stages/03_review/output/logs/red/src/slugify.js && cp test/slugify.test.js workflow/stages/03_review/output/logs/red/test/slugify.test.js && NO_COLOR=1 node --test workflow/stages/03_review/output/logs/red/test/slugify.test.js 2>&1 | tee workflow/stages/03_review/output/logs/T001-red.log; echo exit=${PIPESTATUS[0]}
```

It runs the new test file against the unfixed module from `HEAD` (the root `package.json` still applies `"type": "module"`) and must show the same `fail 2` as above.

## 7. Gates

Run in Git Bash from the repo root, after all edits, with `NO_COLOR=1`, saving each full-suite run to the stage's `output/logs/T001-<suite>.log` as the stage files say.

From the `src/`, `test/` row, and the critical-path row (red run above):

```
npm run lint
```

```
node --test test/slugify.test.js
```

```
npm test
```

From the code-tier rule (the affected end-to-end spec: the CLI imports `src/slugify.js`), fast form for the builder, then full form for the reviewer:

```
node --test e2e/cli.test.js
```

```
npm run test:e2e
```

Expected: lint exits 0; `node --test test/slugify.test.js` and `npm test` show `tests 6`, `pass 6`, `fail 0`; both end-to-end forms show `tests 1`, `pass 1`, `fail 0`.

Text landed (stage 02 step 5): reads edits 1 to 4 from this spec's fenced blocks and must print six `ok` lines and exit 0.

```
node -e "const fs=require('fs');const rd=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');const spec=rd('workflow/stages/01_spec/output/task-T001-spec.md');const blk=l=>{const i=spec.indexOf('\n'+l+'\n');if(i<0)throw new Error('no label '+l);return spec.slice(i).match(/\n([\x60~]{3,})[a-z]*\n([\s\S]*?)\n\1\n/)[2]};const want=[['Edit 1 new text:','docs/audit/decisions/0002-keep-accent-base-letters.md',1],['Edit 2 old text:','src/slugify.js',0],['Edit 2 new text:','src/slugify.js',1],['Edit 3 new text:','test/slugify.test.js',1],['Edit 4 old text:','docs/contexts/slugify.md',0],['Edit 4 new text:','docs/contexts/slugify.md',1]];let bad=0;for(const [l,f,n] of want){const k=rd(f).split(blk(l)).length-1;console.log(k===n?'ok ':'BAD',l,f,'count='+k,'want='+n);if(k!==n)bad=1}process.exit(bad)"
```

Docs rows (the ADR, the context file and the refactor-log state paths and lines): check each cited path exists and each `file:line` matches. The ADR cites `src/slugify.js:4-5` at `df83222`; this must print the `toLowerCase` line and the `replace(/[^a-z0-9]+/g, '-')` line:

```
git show df83222:src/slugify.js | sed -n '4,5p'
```

No em dash (U+2014), in the added lines of tracked files and in the new or written files; every count must be 0:

```
node -e "const o=require('child_process').execSync('git diff -U0 HEAD',{encoding:'utf8',maxBuffer:1<<28});console.log(o.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).join('\n').split('\u2014').length-1)"
```

```
node -e "for(const f of process.argv.slice(1))console.log(f,require('fs').readFileSync(f,'utf8').split('\u2014').length-1)" docs/audit/decisions/0002-keep-accent-base-letters.md workflow/stages/01_spec/output/task-T001-spec.md
```

The build report and the review are checked the same way by the stage that writes each one, after writing it.

## 8. Production touch points

none. (The orchestrator still pauses after this spec: `src/slugify.js` is a critical path on the pause list. No version bump, no publish.)

## 9. Out of scope

- `bin/slugify.js`, `e2e/cli.test.js`, `README.md`: no edit; the parity row holds unchanged (section 5).
- The JSDoc on `src/slugify.js:1`: it stays as is; it is still true.
- The four existing tests in `test/slugify.test.js:5-19`: not changed.
- Letters with no canonical decomposition (`ø`, `ł`, `đ`, `ß`, `æ`, `œ`): they keep turning into a hyphen. No transliteration table.
- `normalize('NFKD')`, or stripping all marks with `\p{M}`: not used (ADR 0002 Alternatives).
- Non-Latin scripts, and any new option or parameter on `slugify`.
- `package.json` (`version` is a stop-and-ask), `AGENTS.md`, any dependency.

## Edits

### Edit 1: new file `docs/audit/decisions/0002-keep-accent-base-letters.md`

The whole file, ending in a single newline.

Edit 1 new text:

```markdown
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
```

### Edit 2: `src/slugify.js`, lines 3 and 4

Replace this text (it occurs once):

Edit 2 old text:

```js
  return String(title)
    .toLowerCase()
```

with:

Edit 2 new text:

```js
  return String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
```

Keep the escapes `\u0300` and `\u036f` as written (ASCII in the source, no literal combining characters). Lines 1, 2, 5, 6 and 7 stay as they are.

### Edit 3: `test/slugify.test.js`, append after line 19

One blank line after line 19, then this text, then a single final newline. Copy the characters byte for byte (precomposed `é`, `è`, `û`, `É`, `Ñ`, `ú`, `ở`, `ệ`; the `\u0301` escapes stay as escapes).

Edit 3 new text:

```js
test('keeps the base letter of accented Latin letters', () => {
  assert.equal(slugify('Café au lait'), 'cafe-au-lait');
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
  assert.equal(slugify('ÉCOLE Ñandú'), 'ecole-nandu');
});

test('drops stacked accents and already-decomposed accents', () => {
  assert.equal(slugify('Phở Việt'), 'pho-viet');
  assert.equal(slugify('Re\u0301sume\u0301'), 'resume');
});
```

### Edit 4: `docs/contexts/slugify.md`, line 22 (Traps)

Replace this line (it occurs once):

Edit 4 old text:

```markdown
- `String.prototype.toLowerCase` leaves accented letters accented, and the `[^a-z0-9]+` step then turns each one into a hyphen. Any change to how non-ASCII letters are handled changes the output for every title that has one.
```

with:

Edit 4 new text:

```markdown
- Accented Latin letters keep their base letter: `slugify` decomposes its input with `normalize('NFD')` and drops the marks in U+0300 to U+036F before it lowercases (ADR 0002). A letter with no decomposition, such as `ø`, `ł`, `ß` or `æ`, still turns into a hyphen. Any change to how non-ASCII letters are handled changes the output for every title that has one.
```

### Edit 5: `docs/audit/refactor-log.md`, the Phase 001 entry

Add the entry below the template block, newest first, following stage 02's Outputs rules (Changed from `git status --porcelain` leaving out `workflow/stages/*/output/`, Verified copied word for word from T001's Gate result cell, Surprises only from a review or build report, the header keeping its `<sha>` placeholders). Header and brief:

```markdown
## Phase 001 - accents: T001 (2026-10-30, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `0002`. `slugify` keeps the base letter of accented Latin letters instead of turning them into hyphens: `'Café au lait'` becomes `'cafe-au-lait'`.
```

**Deliberately not done** names at least: no transliteration of `ø`, `ł`, `đ`, `ß`, `æ`, `œ`; no non-Latin scripts; no version bump.

### Ledger row

Create the Phase 001 section from the ledger's template, above the Backlog: title `## Phase 001 - accents (ADR 0002)`, branch line ``Branch `phase-001-accents`, cut from `main` at `df83222`. No production touch point.``, and row T001: Task `Keep the base letter of accented Latin letters`, Files the five target files and `docs/audit/task-ledger.md`.
