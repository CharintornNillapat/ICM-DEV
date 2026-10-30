import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/slugify.js', import.meta.url));

test('the CLI prints the slug of its arguments', () => {
  const result = spawnSync(process.execPath, [CLI, 'Hello', 'World'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'hello-world\n');
});
