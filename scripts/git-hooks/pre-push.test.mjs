import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The pre-push guard. scripts/git-hooks/pre-push is the source of the untracked
// .git/hooks/pre-push. Each test installs the versioned copy as the hook of a
// scratch clone and pushes to a local bare repository, never to the real origin.
// Run: node --test scripts/git-hooks/pre-push.test.mjs

const HOOK = fileURLToPath(new URL('./pre-push', import.meta.url));
const DEPLOY = 'docs(deploy): record phase 1 release and post-merge checks [skip ci]';
const RECORD_FILES = [
  'docs/audit/refactor-log.md',
  'docs/audit/task-ledger.md',
  'docs/audit/decisions/0001-seed.md',
];
const AGENT = { CLAUDECODE: '1' };
const ORCHESTRATOR = { CLAUDECODE: '1', ALLOW_GIT_WRITE: '1' };
const GUARD = 'pre-push guard:';
const AGENT_REFUSAL = 'Commits and pushes inside a Claude Code session go only through the orchestrator.';

let root = '';
let remote = '';
let work = '';
let seed = '';
let edits = 0;

function git(args, extra = {}, cwd = work) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('GIT_') || key === 'CLAUDECODE' || key === 'ALLOW_GIT_WRITE') delete env[key];
  }
  return spawnSync('git', args, { cwd, env: { ...env, ...extra }, encoding: 'utf8' });
}

function run(args, cwd = work) {
  const result = git(args, {}, cwd);
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function commit(files, message) {
  for (const file of files) {
    mkdirSync(dirname(join(work, file)), { recursive: true });
    writeFileSync(join(work, file), `edit ${++edits}\n`);
  }
  run(['add', '--', ...files]);
  run(['commit', '-q', '-m', message]);
  return run(['rev-parse', 'HEAD']);
}

const push = (args, extra = {}) => git(['push', '-q', ...args], extra);
const remoteRef = (ref) => git(['rev-parse', '-q', '--verify', `refs/heads/${ref}`], {}, remote).stdout.trim();

function expectRefused(result, message = GUARD) {
  assert.notEqual(result.status, 0);
  assert.ok(result.stderr.includes(message), `stderr lacks "${message}": ${result.stderr}`);
}

beforeEach(() => {
  edits = 0;
  root = mkdtempSync(join(tmpdir(), 'pre-push-guard-'));
  remote = join(root, 'remote.git');
  work = join(root, 'work');
  const hooks = join(root, 'hooks');
  mkdirSync(hooks);
  run(['init', '-q', '--bare', '-b', 'main', remote], root);
  run(['init', '-q', '-b', 'main', work], root);
  run(['config', 'user.name', 'Guard Test']);
  run(['config', 'user.email', 'guard@example.invalid']);
  run(['config', 'commit.gpgsign', 'false']);
  run(['config', 'core.hooksPath', hooks]);
  seed = commit([...RECORD_FILES, 'docs/audit/README.md', 'src/app.js'], 'chore: seed');
  run(['remote', 'add', 'origin', remote]);
  run(['push', '-q', 'origin', 'main']);
  copyFileSync(HOOK, join(hooks, 'pre-push'));
  chmodSync(join(hooks, 'pre-push'), 0o755);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true, maxRetries: 3 });
});

describe('refs/heads/main takes only deploy records', () => {
  test('refuses a deploy-record message on a commit that touches a code file', () => {
    commit(['src/app.js'], DEPLOY);
    expectRefused(push(['origin', 'main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('accepts a deploy record that modifies only the files the merged procedure edits', () => {
    const head = commit(RECORD_FILES, DEPLOY);
    assert.equal(push(['origin', 'main']).status, 0);
    assert.equal(remoteRef('main'), head);
  });

  for (const [name, message] of [
    ['without the docs(deploy) prefix', 'docs: record phase 1 release and post-merge checks [skip ci]'],
    ['without the [skip ci] suffix', 'docs(deploy): record phase 1 release and post-merge checks'],
  ]) {
    test(`refuses a subject ${name}`, () => {
      commit(['docs/audit/task-ledger.md'], message);
      expectRefused(push(['origin', 'main']));
      assert.equal(remoteRef('main'), seed);
    });
  }

  test('refuses a range that holds a code commit after a valid deploy record', () => {
    commit(['docs/audit/task-ledger.md'], DEPLOY);
    commit(['src/app.js'], 'fix: a code change');
    expectRefused(push(['origin', 'main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('refuses a deploy record that touches another docs file', () => {
    commit(['docs/audit/task-ledger.md', 'docs/audit/README.md'], DEPLOY);
    expectRefused(push(['origin', 'main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('refuses a deploy record that adds a new ADR', () => {
    commit(['docs/audit/decisions/0002-new.md'], DEPLOY);
    expectRefused(push(['origin', 'main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('refuses a merge commit even when both sides are deploy records', () => {
    run(['switch', '-q', '-c', 'side']);
    commit(['docs/audit/task-ledger.md'], DEPLOY);
    run(['switch', '-q', 'main']);
    commit(['docs/audit/refactor-log.md'], DEPLOY);
    run(['merge', '-q', '--no-ff', '-m', DEPLOY, 'side']);
    expectRefused(push(['origin', 'main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('refuses a force push that rewrites main', () => {
    const first = commit(['docs/audit/task-ledger.md'], DEPLOY);
    assert.equal(push(['origin', 'main']).status, 0);
    run(['reset', '-q', '--hard', seed]);
    commit(['docs/audit/refactor-log.md'], DEPLOY);
    expectRefused(push(['--force', 'origin', 'main']));
    assert.equal(remoteRef('main'), first);
  });

  test('refuses deleting main', () => {
    expectRefused(push(['origin', '--delete', 'main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('refuses a code commit pushed to main from another branch', () => {
    run(['switch', '-q', '-c', 'feature']);
    commit(['src/app.js'], 'feat: a code change');
    expectRefused(push(['origin', 'feature:main']));
    assert.equal(remoteRef('main'), seed);
  });

  test('leaves a push to another branch alone outside a Claude Code session', () => {
    run(['switch', '-q', '-c', 'phase-1-test']);
    const head = commit(['src/app.js'], 'feat: a code change');
    assert.equal(push(['-u', 'origin', 'phase-1-test']).status, 0);
    assert.equal(remoteRef('phase-1-test'), head);
  });
});

describe('inside a Claude Code session', () => {
  test('refuses every push without ALLOW_GIT_WRITE=1', () => {
    run(['switch', '-q', '-c', 'phase-1-test']);
    commit(['src/app.js'], 'feat: a code change');
    expectRefused(push(['-u', 'origin', 'phase-1-test'], AGENT), AGENT_REFUSAL);
    assert.equal(remoteRef('phase-1-test'), '');
  });

  test('accepts the phase-branch push of the release procedure', () => {
    run(['switch', '-q', '-c', 'phase-1-test']);
    const head = commit(['src/app.js'], 'feat: a code change');
    assert.equal(push(['-u', 'origin', 'phase-1-test'], ORCHESTRATOR).status, 0);
    assert.equal(remoteRef('phase-1-test'), head);
  });

  test('does not open main to a code commit when ALLOW_GIT_WRITE=1 is set', () => {
    commit(['src/app.js'], DEPLOY);
    expectRefused(push(['origin', 'main'], ORCHESTRATOR));
    assert.equal(remoteRef('main'), seed);
  });

  test('accepts the deploy-record push of the merged procedure', () => {
    const head = commit(RECORD_FILES, DEPLOY);
    assert.equal(push(['origin', 'main'], ORCHESTRATOR).status, 0);
    assert.equal(remoteRef('main'), head);
  });

  test('refuses a force push to a phase branch', () => {
    run(['switch', '-q', '-c', 'phase-1-test']);
    const first = commit(['src/app.js'], 'feat: a code change');
    assert.equal(push(['-u', 'origin', 'phase-1-test'], ORCHESTRATOR).status, 0);
    run(['reset', '-q', '--hard', seed]);
    commit(['src/app.js'], 'feat: another code change');
    expectRefused(push(['--force', 'origin', 'phase-1-test'], ORCHESTRATOR));
    assert.equal(remoteRef('phase-1-test'), first);
  });

  test('refuses deleting a remote branch', () => {
    run(['switch', '-q', '-c', 'phase-1-test']);
    const head = commit(['src/app.js'], 'feat: a code change');
    assert.equal(push(['-u', 'origin', 'phase-1-test'], ORCHESTRATOR).status, 0);
    expectRefused(push(['origin', '--delete', 'phase-1-test'], ORCHESTRATOR));
    assert.equal(remoteRef('phase-1-test'), head);
  });
});
