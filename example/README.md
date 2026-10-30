# Slugify: the ICM-DEV example

A zero-dependency Node module that turns a title into a URL slug, filled in from the ICM-DEV template. Every `{{placeholder}}` of the root template has a value here (read `AGENTS.md`).

```js
import { slugify } from './src/slugify.js';
slugify('Hello, World!'); // 'hello-world'
```

```
node bin/slugify.js Hello World   # hello-world
```

## Run it

`example/` is a folder of the ICM-DEV repository, not a repository of its own. There are two ways to run the loop on it.

**In place, inside ICM-DEV** (the phase branch and the pull request go to the ICM-DEV remote). Run every command from `example/`:

```
git config icm.projectDir example
cp scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)"
cp workflow/orchestrator/loaders/claude-code.md ~/.claude/commands/master.md
claude
```

`icm.projectDir` tells the hook that the deploy-record files are under `example/docs/audit/`. Start `claude` in `example/`, as a new session, so the agents in `example/.claude/agents/` are the ones it registers. Then `/master`, `phase 2: <slug>`, `task T002: <goal>`. Phase 001 and `T001` are already recorded. The ledger's "cut from `main` at `df83222`" names a commit of the scratch repository the first run used, not one of this repository.

**As a repository of its own:**

```
cp -r example ../slugify-demo && cd ../slugify-demo
git init -b main && git add . && git commit -m "chore: seed"
cp scripts/git-hooks/pre-push "$(git rev-parse --git-path hooks/pre-push)"
npm run lint && npm test && npm run test:e2e
```

Then copy `workflow/orchestrator/loaders/claude-code.md` to `~/.claude/commands/master.md`, start Claude Code there, and run `/master`. The release steps need a remote called `origin` with `main` already pushed.

## The recorded run

Task `T001` ("accented letters keep their base letter") ran once through spec, build and review with the rewritten `workflow/orchestrator/MASTER.md`, in a copy of this folder made as described above, on branch `phase-001-accents`. The ledger row is in `docs/audit/task-ledger.md`, and the three output files are `workflow/stages/01_spec/output/task-T001-spec.md`, `02_build/output/task-T001-build.md` and `03_review/output/task-T001-review.md`. The files the task changed (`src/slugify.js`, its tests, ADR 0002, the context file, the log) are copied in from that run's commit.

What the run was, so you can judge the proof:

- **Real:** the three stage files and `MASTER.md` section 2 to 4 and 6 (commit procedure) were followed in order. The spec went to the strict reviewer, because `src/slugify.js` is a critical path. The build was a failing-test-first run (`tests 6, pass 4, fail 2`) and then green. The review re-ran lint, unit and end-to-end itself, and reproduced the red run itself against `HEAD:src/slugify.js` (the spec's no-stash recipe, because `src/slugify.js` is `w/lf` under `core.autocrlf`). Verdict `APPROVED`, no blocking item. The commit was staged by path.
- **Stand-ins:** Claude Code loads `.claude/agents/` when a session starts, and the session that ran this had started before those files existed. So the three agents were `general-purpose` sub-agents, set to the model each agent file names (`opus` for the strict reviewer, `haiku` for the builder), told to read their agent file and follow everything after its frontmatter. The orchestrator was that same session following `MASTER.md` by hand, not `/master`. Each order also carried a working-directory note, which a real run does not need.
- **Waived:** the pause after the spec. `src/slugify.js` is on the pause list, so `MASTER.md` would have stopped for the owner. The owner's brief for the extraction required this one run to complete, and the run treated that as the go-ahead.
- **Not exercised:** the light reviewer, a `fix` round, `release`, `gh pr create`, auto-merge, `merged` and the deploy record, the `/master` loader's preflight, the permission rules in `.claude/settings.json`, and the pre-push hook on a real push. The hook has its own test, `node --test scripts/git-hooks/pre-push.test.mjs` (18 cases, scratch repositories only).
- **Two non-blocking review notes, left as written:** the build report prints the regex with raw combining characters while the source uses the `\u` escapes; and the ledger's Gate result and the log's Verified line still say the full end-to-end form was left to the reviewer, which the review then ran (1 test, passed).
