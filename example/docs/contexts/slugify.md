# Context: slugify

Read this when a task touches `src/slugify.js`, its tests or the CLI.

## What this area does

`slugify(title)` in `src/slugify.js` turns a title into a URL slug. `bin/slugify.js` prints the slug of its arguments. `README.md` shows both.

## Invariants

- A slug matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`, or is the empty string.
- A slug is at most 80 characters (`MAX_LENGTH` in `src/slugify.js`). A longer one is cut at its last hyphen at or before index 80, so no word is split; a first word longer than 80 is cut at 80 characters (ADR 0003).
- `slugify` is pure: same input, same output, no I/O, no state.
- `slugify(slugify(x))` equals `slugify(x)`.

## Traps

- Accented Latin letters keep their base letter: `slugify` decomposes its input with `normalize('NFD')` and drops the marks in U+0300 to U+036F before it lowercases (ADR 0002). A letter with no decomposition, such as `ø`, `ł`, `ß` or `æ`, still turns into a hyphen. Any change to how non-ASCII letters are handled changes the output for every title that has one.

## Tests

- `test/slugify.test.js` covers the module: `node --test test/slugify.test.js`.
- `e2e/cli.test.js` runs the CLI as a child process: `node --test e2e/cli.test.js`.
