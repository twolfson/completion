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
  program: 'git',
  commands: [{
    name: 'checkout',
    completion: function (params, cb) {
      // DEV: Start with basic line, lineIndex. Then, move excess to another lib.
      // params = {line, lineIndex, partialWord, partialLine, currentWord, currentWordIndex, words, wordsIndex}
      // TODO: There are 2 parts. 1 is a completion wizard which can predict good matches.
      // TODO: The other is a very thin completion library which we present here
      getGitBranches(function (err, allBranches) {
        if (err) {
          return cb(err);
        }

        var branches = allBranches.filter(function (branch) {
          // DEV: underscore.string makes life easier here
          // TODO: How do we deal with
          /*
          git checkout|world -> git checkout dev/hello.world
          Maybe it goes
          git checkout|world -> git checkout |world -> git checkout dev/hello.|world
          */
          // DEV: This means partialWord isn't the ideal piece. We want both parts of the word (leftPartial, rightPartial).
          // DEV: Maybe we should present a nested objet
          /*
          {
            line: {
              value: 'git checkoutworld',
              index: 12,
              partialLeft: 'git checkout',
              partialRight: 'git world',
            },
            words: {
              value: ['git', 'checkoutworld']
              index: 1,
              partialLeft: ['git', 'checkout'],
              partialRight: ['world']
            },
            word: {
              value: 'checkoutworld'
              index: 8,
              partialLeft: 'checkout',
              partialRight: 'world'
            }
          }
          */
          return _.startsWith(branch, params.partialWord);
        });
        cb(null, branches);
      });
    }
  }]
  // DEV: Each completion action should be a lazy load
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
