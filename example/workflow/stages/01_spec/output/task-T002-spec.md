# Task T002 spec: cap a slug at 80 characters without splitting a word

Phase 002 (branch `phase-002-slug-limit`, cut from `main` at `6d98d6e`). Written by the reviewer, 2026-10-30.

## 1. Goal

`slugify` returns at most 80 characters. A longer slug is cut at its last hyphen at or before the limit, so no word is split.

**Decision taken for the owner (check it at the pause):** the order does not say what happens when the first word alone is longer than 80 characters, so there is no hyphen to cut at. This spec keeps the hard guarantee, "at most 80", and cuts that word at 80 characters (`slugify('a'.repeat(100))` is `'a'.repeat(80)`). The other readings (return the whole word and break the limit, or return `''`) are listed in ADR 0003 Alternatives. If the owner wants one of them, change the spec before `build T002`.

**Boundary, stated so the builder makes no call:** when the character right after the first 80 is a hyphen, the first 80 characters are whole words and are kept as they are (80 characters, not fewer).

## 2. Target files

```
docs/audit/decisions/0003-cap-slug-length.md
test/slugify.test.js
src/slugify.js
docs/contexts/slugify.md
docs/audit/refactor-log.md
```

Order of work: the ADR first (edit 1), then the tests and their red run (edit 3), then the code (edit 2), then the context file (edit 4), then the refactor-log entry (edit 5). Bookkeeping (`docs/audit/task-ledger.md`, `workflow/stages/02_build/output/*`) is allowed as usual.

Why `docs/audit/refactor-log.md`: T002 touches the critical path, so by `AGENTS.md`'s Batching bullet it is its own phase; it is the phase's only task and so the task that ships it.

## 3. Context to read

- `docs/contexts/slugify.md`: the task changes `src/slugify.js` and its tests. Its Invariants (lines 11 to 13) must still hold, and edit 4 adds the length rule to them.

## 4. Current behaviour

- `src/slugify.js:3-8` builds the slug in one chain: `String`, `normalize('NFD')`, drop U+0300 to U+036F, `toLowerCase`, every run outside `[a-z0-9]` to one `-`, trim leading and trailing hyphens. Nothing limits the length; the chain's result is returned as is.
- `src/slugify.js:1` (JSDoc) says nothing about length.
- Measured on `6d98d6e` with Node v24.19.0:
  - `slugify(Array.from({ length: 20 }, (_, i) => 'Word' + (i % 10)).join(' '))` is 119 characters, `'word0-word1-...-word9'` twice over.
  - `slugify('x'.repeat(39) + ' ' + 'y'.repeat(40) + ' z')` is 82 characters, ending in `-z` (its index 80 is a hyphen).
  - `slugify('a'.repeat(80))` is 80 characters (stays so).
  - `slugify('a'.repeat(100))` is 100 characters.
- `bin/slugify.js:4` prints `slugify` of its joined arguments, so the CLI inherits the cap with no edit.
- `test/slugify.test.js:5-30` holds six tests, none with a slug over 11 characters.
- `git ls-files --eol` shows `src/slugify.js`, `test/slugify.test.js` and `docs/contexts/slugify.md` as `i/lf w/lf`; `core.autocrlf` is `true`.

## 5. Parity map

- Row "The exports of `src/slugify.js` / The usage example in `README.md` and the CLI in `bin/slugify.js`": touched but unchanged. The export stays one function, `slugify(title)`, with the same signature (the new `MAX_LENGTH` constant is not exported); `README.md:7` (`'hello-world'`) and `README.md:11` (`hello-world`) are under 80 characters and still hold; `bin/slugify.js` needs no edit. Guarded by `test/slugify.test.js` and `e2e/cli.test.js`, both in the gates.

## 6. Tests to add

All three go in `test/slugify.test.js`, appended after line 30, separated from the last test by one blank line, the file ending in a single newline (edit 3). They fail today because `src/slugify.js:3-8` returns the slug at any length.

1. `caps a long slug at 80 characters at the last hyphen, splitting no word`: twenty 5-character words; the cut lands on the hyphen at index 77, so 13 whole words (77 characters) are kept, and the result is its own slug. Fails today on its first assertion: actual is the 119-character slug.
2. `keeps 80 characters when the cut falls exactly on the limit`: the hyphen at index 80 is the cut, so the result is 80 characters (catches a search that starts at index 79 and would return only the 39 `x`). Fails today on its first assertion: actual is the 82-character slug ending in `-z`. Its second assertion (`'a'.repeat(80)` unchanged) passes today and guards the `<= 80` test.
3. `cuts a first word longer than 80 characters at 80`: no hyphen to cut at. Fails today: actual is 100 `a`, expected 80.

Red run (stage 02 step 4): after adding the tests and before edit 2, run `node --test test/slugify.test.js` and save it to `workflow/stages/02_build/output/logs/T002-red.log`. It must show `tests 9`, `pass 6`, `fail 3`, with the three failures above. After edit 2 the same command shows `tests 9`, `pass 9`, `fail 0`.

Note for the reviewer (stage 03 step 6): `src/slugify.js` is `w/lf` and `core.autocrlf` is `true`, so step 6.2 leaves it out of the stash, and all three new tests depend on it. Either record their red run as not verified, as step 6.2 says, or reproduce it with no edit to a tracked file, writing only under the gitignored `workflow/stages/03_review/output/logs/`:

```
mkdir -p workflow/stages/03_review/output/logs/red/src workflow/stages/03_review/output/logs/red/test && git show HEAD:./src/slugify.js > workflow/stages/03_review/output/logs/red/src/slugify.js && cp test/slugify.test.js workflow/stages/03_review/output/logs/red/test/slugify.test.js && NO_COLOR=1 node --test workflow/stages/03_review/output/logs/red/test/slugify.test.js 2>&1 | tee workflow/stages/03_review/output/logs/T002-red.log; echo exit=${PIPESTATUS[0]}
```

It runs the new test file against the unfixed module from `HEAD` (the root `package.json` still applies `"type": "module"`) and must show the same `fail 3` as above.

## 7. Gates

Run in Git Bash from the project folder (`example/`, which is a subfolder of the git repository, so a `git show <rev>:` path is written `./<path>`), after all edits, with `NO_COLOR=1`, saving each full-suite run to the stage's `output/logs/T002-<suite>.log` as the stage files say.

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

Expected: lint exits 0; `node --test test/slugify.test.js` and `npm test` show `tests 9`, `pass 9`, `fail 0`; both end-to-end forms show `tests 1`, `pass 1`, `fail 0`.

Text landed (stage 02 step 5): reads edits 1 to 4 from this spec's fenced blocks and must print five `ok` lines and exit 0.

```
node -e "const fs=require('fs');const rd=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');const spec=rd('workflow/stages/01_spec/output/task-T002-spec.md');const blk=l=>{const i=spec.indexOf('\n'+l+'\n');if(i<0)throw new Error('no label '+l);return spec.slice(i).match(/\n([\x60~]{3,})[a-z]*\n([\s\S]*?)\n\1\n/)[2]};const want=[['Edit 1 new text:','docs/audit/decisions/0003-cap-slug-length.md',1],['Edit 2 old text:','src/slugify.js',0],['Edit 2 new text:','src/slugify.js',1],['Edit 3 new text:','test/slugify.test.js',1],['Edit 4 new text:','docs/contexts/slugify.md',1]];let bad=0;for(const [l,f,n] of want){const k=rd(f).split(blk(l)).length-1;console.log(k===n?'ok ':'BAD',l,f,'count='+k,'want='+n);if(k!==n)bad=1}process.exit(bad)"
```

Docs rows (the ADR, the context file and the refactor-log state paths and lines): check each cited path exists and each `file:line` matches. The ADR cites `src/slugify.js:3-8` at `6d98d6e`; this must print the six lines from `return String(title)` to the trim `replace(/^-+|-+$/g, '')`:

```
git show 6d98d6e:./src/slugify.js | sed -n '3,8p'
```

No em dash (U+2014), in the added lines of tracked files and in the new or written files; every count must be 0:

```
node -e "const o=require('child_process').execSync('git diff -U0 HEAD',{encoding:'utf8',maxBuffer:1<<28});console.log(o.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).join('\n').split('\u2014').length-1)"
```

```
node -e "for(const f of process.argv.slice(1))console.log(f,require('fs').readFileSync(f,'utf8').split('\u2014').length-1)" docs/audit/decisions/0003-cap-slug-length.md workflow/stages/01_spec/output/task-T002-spec.md
```

The build report and the review are checked the same way by the stage that writes each one, after writing it.

## 8. Production touch points

none. (The orchestrator still pauses after this spec: `src/slugify.js` is a critical path on the pause list. No version bump, no publish.)

## 9. Out of scope

- `bin/slugify.js`, `e2e/cli.test.js`, `README.md`: no edit; the parity row holds unchanged (section 5). No CLI flag for the limit.
- Any option or second parameter on `slugify` to change the limit, and exporting `MAX_LENGTH`.
- The six existing tests in `test/slugify.test.js:5-30`: not changed.
- The accent handling (`src/slugify.js:4-5`, ADR 0002): not changed.
- Counting in bytes or code points: the slug is ASCII, so characters, bytes and code points are the same count.
- `package.json` (`version` is a stop-and-ask), `AGENTS.md`, any dependency.

## Edits

### Edit 1: new file `docs/audit/decisions/0003-cap-slug-length.md`

The whole file, ending in a single newline.

Edit 1 new text:

```markdown
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
```

### Edit 2: `src/slugify.js`, the whole file

Replace the whole file (lines 1 to 9; this text occurs once):

Edit 2 old text:

```js
/** Turn a title into a URL slug: lowercase ASCII letters and digits joined by single hyphens. */
export function slugify(title) {
  return String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

with this text, the file ending in a single newline:

Edit 2 new text:

```js
const MAX_LENGTH = 80;

/** Turn a title into a URL slug: lowercase ASCII letters and digits joined by single hyphens, at most 80 characters, cut at a hyphen. */
export function slugify(title) {
  const slug = String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= MAX_LENGTH) return slug;
  const cut = slug.lastIndexOf('-', MAX_LENGTH);
  return cut === -1 ? slug.slice(0, MAX_LENGTH) : slug.slice(0, cut);
}
```

Keep the escapes `\u0300` and `\u036f` as written (ASCII in the source). Writing this spec, a file tool turned those escapes into literal combining characters; check afterwards that `src/slugify.js` holds no character above U+007E, or the text-landed gate fails. `lastIndexOf('-', MAX_LENGTH)` searches from index 80 down, so a hyphen at index 80 is found (D2); a cut index is never 0, because the trim leaves no leading hyphen.

### Edit 3: `test/slugify.test.js`, append after line 30

One blank line after line 30, then this text, then a single final newline.

Edit 3 new text:

```js
test('caps a long slug at 80 characters at the last hyphen, splitting no word', () => {
  const title = Array.from({ length: 20 }, (_, i) => `Word${i % 10}`).join(' ');
  const slug = slugify(title);
  assert.equal(slug, 'word0-word1-word2-word3-word4-word5-word6-word7-word8-word9-word0-word1-word2');
  assert.equal(slugify(slug), slug);
});

test('keeps 80 characters when the cut falls exactly on the limit', () => {
  assert.equal(slugify(`${'x'.repeat(39)} ${'y'.repeat(40)} z`), `${'x'.repeat(39)}-${'y'.repeat(40)}`);
  assert.equal(slugify('a'.repeat(80)), 'a'.repeat(80));
});

test('cuts a first word longer than 80 characters at 80', () => {
  assert.equal(slugify('a'.repeat(100)), 'a'.repeat(80));
});
```

### Edit 4: `docs/contexts/slugify.md`, insert after line 11 (Invariants)

Insert this line as a new line 12, right after the line ``- A slug matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`, or is the empty string.``; the other Invariants lines stay as they are.

Edit 4 new text:

```markdown
- A slug is at most 80 characters (`MAX_LENGTH` in `src/slugify.js`). A longer one is cut at its last hyphen at or before index 80, so no word is split; a first word longer than 80 is cut at 80 characters (ADR 0003).
```

### Edit 5: `docs/audit/refactor-log.md`, the Phase 002 entry

Add the entry above the Phase 001 entry and below the template block, newest first, following stage 02's Outputs rules (Changed from `git status --porcelain` leaving out `workflow/stages/*/output/`, Verified copied word for word from T002's Gate result cell, Surprises only from a review or build report, the header keeping its `<sha>` placeholders). Header and brief:

```markdown
## Phase 002 - slug-limit: T002 (2026-10-30, code `<sha>`, docs `<sha>`, merged `<sha>`)

ADR `0003`. `slugify` returns at most 80 characters, cut at the last hyphen at or before the limit so no word is split; a first word longer than 80 is cut at 80.
```

**Deliberately not done** names at least: no option or CLI flag for the limit; no ellipsis on a cut slug; no version bump.

### Ledger row

Create the Phase 002 section from the ledger's template, above the Backlog and below the Phase 001 section: title `## Phase 002 - slug-limit (ADR 0003)`, branch line ``Branch `phase-002-slug-limit`, cut from `main` at `6d98d6e`. No production touch point.``, and row T002: Task `Cap a slug at 80 characters, cut at the last hyphen`, Files the five target files and `docs/audit/task-ledger.md`.
