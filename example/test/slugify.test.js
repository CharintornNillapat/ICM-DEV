import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.js';

test('lowercases and joins words with hyphens', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('collapses runs of punctuation and spaces into one hyphen', () => {
  assert.equal(slugify('Hello,   World!!'), 'hello-world');
});

test('trims leading and trailing separators', () => {
  assert.equal(slugify('  --Hello--  '), 'hello');
});

test('returns the empty string when nothing is left', () => {
  assert.equal(slugify('!!!'), '');
});

test('keeps the base letter of accented Latin letters', () => {
  assert.equal(slugify('Café au lait'), 'cafe-au-lait');
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
  assert.equal(slugify('ÉCOLE Ñandú'), 'ecole-nandu');
});

test('drops stacked accents and already-decomposed accents', () => {
  assert.equal(slugify('Phở Việt'), 'pho-viet');
  assert.equal(slugify('Re\u0301sume\u0301'), 'resume');
});

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
