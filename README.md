# completion [![Build status](https://travis-ci.org/twolfson/completion.png?branch=master)](https://travis-ci.org/twolfson/completion)

Completion library for words, commands, and sentences

This was built as part of [foundry][], a CLI utility for making releases painless.

[foundry]: https://github.com/twolfson/foundry

```js
// Examples:
// `git chec|` -> `git checkout |`
// `git checkout dev/h|` -> `git checkout dev/hello.world|`
// `git checkout dev/|` -> [`git checkout dev/hello.world`, `git checkout dev/goodbye.moon`]
// `git chec|dev/` -> `git checkout |dev/`
// `git che|cdev/` -> `git checkout |cdev/`
// DEV: More of an edge case
// TODO: Move this into an open issue (prob some trick with a '*' key)
// `git delete-branch a b c ...` -> [`git delete-branch d`, `git delete-branch e`, `git delete-branch f`]
```

## Getting Started
Install the module with: `npm install completion`

```javascript
var Completion = require('completion');
var completion = new Completion({
  'git': {
    'checkout': function (params, cb) {
      // For `git checkout dev/|`
      // params.line = 'git checkout dev'
      // params.cursor = 17
      getGitBranches(function (err, allBranches) {
        if (err) {
          return cb(err);
        }

        var branches = allBranches.filter(function (branch) {
          return params.line.match(branch);
        });
        cb(null, branches);
      });
    }
  }]
});
```

## How it works
In `bash`, my research has shown that we can only fill out letters to the right.

> Although, I am still in disbelief of this.

As a result, for cases like:

```bash
$ git chec|
$ # the answer is simple:
$ git checkout|
```

However, in more complex scenarios:

```bash
$ git chec|world
$ git checkout |world
$ git checkout hello.|world
```

We must check both the value on the left and the value on the right. This library removes half of the worries by dealing with commands and invoking the appropriate completion commands.

You will still be responsible for handling of left/right partials in the autocompleted items.

// TODO: Create that logic in another library

```bash
$ git checkout a|c
[
  'abc', # Checkout `abc` branch
  'aaa' # Checkout `c` file from `aaa` branch
]
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
