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
