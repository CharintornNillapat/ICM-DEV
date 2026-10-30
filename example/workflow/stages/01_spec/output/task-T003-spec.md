# Task T003 spec: README Limits section for the 80-character cap

Phase 002 (branch `phase-002-slug-limit`, cut from `main` at `6d98d6e`). Written by the reviewer, 2026-10-30. Docs only; the phase's last task, so it ships the phase.

## 1. Goal

`README.md` gets a short Limits section saying a slug is at most 80 characters, cut at the last hyphen before the limit, or at 80 when the first word alone is longer. This is the README line T002 left out on purpose (ADR 0003 Not done: "No README example").

## 2. Target files

```
README.md
docs/audit/refactor-log.md
```

Why `docs/audit/refactor-log.md`: T003 is the last task of Phase 002, so it ships the phase. The Phase 002 entry already exists (written by T002); T003 amends it (edit 2), it does not add a second one. Bookkeeping (`docs/audit/task-ledger.md`, `workflow/stages/02_build/output/*`) is allowed as usual. No ADR: a doc-only edit needs none, and ADR 0003 already states the rule.

## 3. Context to read

none. Docs-only change; the rule it states is in `src/slugify.js` and ADR 0003, which the builder need not read beyond the lines cited below.

## 4. Current behaviour

- `README.md:5-12` holds the two usage examples (module, then CLI); `README.md:14` starts `## Run it`. There is no section on length.
- `src/slugify.js:1` is `const MAX_LENGTH = 80;`; `src/slugify.js:11-13` returns a slug of 80 or fewer characters as is, else cuts at `slug.lastIndexOf('-', MAX_LENGTH)` (a hyphen at index 80 counts, so all 80 characters are kept), else at 80 when there is no hyphen.
- `bin/slugify.js:4` prints `slugify` of its joined arguments, so the CLI has the same limit.
- `git ls-files --eol README.md` shows `i/lf w/crlf` (`core.autocrlf` is `true`). The builder edits it as it stands and leaves the working-tree line endings alone.
- `docs/audit/refactor-log.md:18-25` is the Phase 002 entry: header `T002`, **Changed** without `README.md`, **Verified** copied from T002's ledger cell.

## 5. Parity map

- Row "The exports of `src/slugify.js` / The usage example in `README.md` and the CLI in `bin/slugify.js`": touched. The export is unchanged (`slugify(title)`), and the new README text describes behaviour the code and `test/slugify.test.js:32-46` (three cap tests) already hold, so the pair still agrees. No code edit.

## 6. Tests to add

none. Docs only; the change cannot alter behaviour. Stage 02 step 4 and stage 03 step 6 do not apply.

## 7. Gates

Docs-only row: nothing is required, except that the README states a count (80), which is checked against the code. Run in Git Bash from `example/`.

README states 80 and the code holds 80 (must print `ok` twice and exit 0):

```
node -e "const fs=require('fs');const rd=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');const spec=rd('workflow/stages/01_spec/output/task-T003-spec.md');const blk=l=>{const i=spec.indexOf('\n'+l+'\n');if(i<0)throw new Error('no label '+l);return spec.slice(i).match(/\n([\x60~]{3,})[a-z]*\n([\s\S]*?)\n\1\n/)[2]};let bad=0;const t=(n,c)=>{console.log(c?'ok ':'BAD',n);if(!c)bad=1};t('README holds edit 1 text once',rd('README.md').split(blk('Edit 1 new text:')).length-1===1);t('src MAX_LENGTH is 80',/^const MAX_LENGTH = 80;$/m.test(rd('src/slugify.js')));process.exit(bad)"
```

The README line endings are untouched (must print `i/lf    w/crlf` for the README):

```
git ls-files --eol README.md
```

The README sentence is true of the code (must print `77 80 80` then `true`):

```
node --input-type=module -e "import {slugify as s} from './src/slugify.js';const long=Array.from({length:20},(_,i)=>'Word'+(i%10)).join(' ');console.log(s(long).length>0&&s(long).length<=80?s(long).length:0,s('a'.repeat(100)).length,s('a'.repeat(80)+' b').length);console.log(!s(long).endsWith('-')&&long.toLowerCase().replace(/ /g,'-').startsWith(s(long)))"
```

The ledger and refactor-log agree (must print the Phase 002 header with `T002, T003` and a line naming `README.md`):

```
grep -n "Phase 002" docs/audit/refactor-log.md; grep -n "README.md" docs/audit/refactor-log.md | head -3
```

No em dash (U+2014); every count must be 0:

```
node -e "const o=require('child_process').execSync('git diff -U0 HEAD',{encoding:'utf8',maxBuffer:1<<28});console.log(o.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).join('\n').split('\u2014').length-1)"
```

```
node -e "for(const f of process.argv.slice(1))console.log(f,require('fs').readFileSync(f,'utf8').split('\u2014').length-1)" workflow/stages/01_spec/output/task-T003-spec.md
```

The build report and the review are checked the same way by the stage that writes each one. Because no code tier row applies, `npm run lint`, `npm test` and `npm run test:e2e` are not required; the reviewer may run `npm test` as a courtesy, and the result changes no verdict.

## 8. Production touch points

none. No pause after this spec: the Target files are `README.md` and `docs/audit/refactor-log.md`, none on the pause list. The phase's Release is auto-merge eligible only if a changed file is outside `docs/` and `*.md`; `src/slugify.js` and `test/slugify.test.js` (T002) are, but T002 hit the pause list, so the owner merges. Not this spec's call.

## 9. Out of scope

- `src/`, `test/`, `bin/`, `e2e/`, `package.json` (no `version` change), `AGENTS.md`, `docs/contexts/slugify.md` (T002 already added the rule at line 12).
- Any other README section (`Run it`, `The recorded run`), and the README's first paragraph.
- A worked example with output in the Limits section: the sentence is enough.
- Changing the Phase 002 **Deliberately not done** list, other than leaving "no README example" out of it (it names none today).

## Edits

### Edit 1: `README.md`, insert a section after line 12

Insert it between the closing fence of the CLI example (line 12) and `## Run it` (line 14), keeping exactly one blank line before and after it. Nothing else in the file changes.

Edit 1 new text:

```markdown
## Limits

A slug is at most 80 characters. A longer one is cut at its last hyphen at or before the 80th character, so no word is split; if the first word alone is longer than 80 characters, it is cut at 80.
```

### Edit 2: `docs/audit/refactor-log.md`, amend the Phase 002 entry in place

Build the amendments from the T003 commit and ledger, as stage 02's Outputs rules say. Four changes, nothing else in the entry or the file:

1. Header: change `T002` to `T002, T003`; keep the date and the `<sha>` placeholders.
2. Brief: leave as is.
3. **Changed:** add `README.md` (Limits section for the 80-character cap) before the `docs/audit/refactor-log.md` item, and change `(this entry)` so it still reads right with the amendment.
4. **Verified:** keep T002's line word for word and add a second line starting `T003:` that copies T003's Gate result cell from `docs/audit/task-ledger.md` word for word. **Surprises** and **Deliberately not done** stay as they are unless T003's build or review report names a surprise.

### Ledger row

Add row T003 to the Phase 002 table in `docs/audit/task-ledger.md`, right below T002: Task `Add a Limits section to the README for the 80-character cap`, Files `README.md`, `docs/audit/refactor-log.md`, `docs/audit/task-ledger.md`, Status `in-progress` while building then `done`, Commit empty, Gate result filled when it lands (the docs-only row, plus the checks in section 7). No Backlog row is named by the order.
