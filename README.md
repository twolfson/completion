# completion [![Build status](https://travis-ci.org/twolfson/completion.png?branch=master)](https://travis-ci.org/twolfson/completion)

Completion library for words, commands, and sentences

This was built as part of [foundry][], a CLI utility for making releases painless.

[foundry]: https://github.com/twolfson/foundry

```js
// Examples:
// `git chec|` -> `git checkout |`
// `git checkout dev/h|` -> `git checkout dev/hello.world|`
// `git checkout dev/|` -> [`git checkout dev/hello.world`, `git checkout dev/goodbye.moon`]
// `git chec|dev/` -> `[git checkout |dev/]`
// `git che|cdev/` -> `[git checkout |cdev/]`
// DEV: More of an edge case
// `git delete-branch a b c ...` -> [`git delete-branch d`, `git delete-branch e`, `git delete-branch f`]
```

Ideas:

```js
var completion = new Completion({
  name:
  // DEV: There is values (e.g. branch, files) vs commands (e.g. `npm publish`)
  // but should we make a strong distinction?
  // DEV: branches can be chained forever but commands cannot (or maybe I am being short sighted)
  // DEV: The future is impossible to predict, code for what we know now. Solve for 80/20
});
```

## Getting Started
Install the module with: `npm install completion`

```javascript
var completion = require('completion');
completion.awesome(); // "awesome"
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Unlicense
As of Dec 15 2013, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
