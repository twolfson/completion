# completion [![Build status](https://travis-ci.org/twolfson/completion.png?branch=master)](https://travis-ci.org/twolfson/completion)

Completion library for words, commands, and sentences

This was built as part of [foundry][], a CLI utility for making releases painless.

[foundry]: https://github.com/twolfson/foundry

```js
'git chec|' -> ['git checkout |']
'git checkout dev/|' -> ['dev/hello.world', 'git checkout dev/goodbye.moon']
'git chec|dev/' -> ['git checkout |dev/']
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
completion.complete({
  // `git chec|`
  line: 'git chec',
  cursor: 8
}, function (err, results) {
  results; // ['checkout']
});
```

## How it works
In `bash`, tab completion will override the the left half of the current word.

As a result, for cases like:

```bash
$ git chec|
$ # We want
$ git checkout| # requires ['checkout'] to be returned
```

Unfortunately, while we can deal with commands, we cannot predict the values of those.

You will still be responsible for handling of right partials in the autocompleted items.

```bash
$ git checkout a|c
[
  'abc', # `git checkout abc` - Checkout `abc` branch
  'aaa' # `git checkout aaa c` - Chekckout `c` file from `aaa` branch
]
```

## Documentation
`completion` exposes the `Completion` constructor via its `module.exports`

### new Completion(tree)
Create a new `completion` instance

- tree `Object` - Outline of program
    -


## Examples
An example of `git` would be

```js
new Completion({
  git: {
    // `git checkout master`
    checkout: function (params, cb) {
      // Get git branches and find matches
    },
    remote: {
      // `git remote add origin git@github.com:...`
      add: null, // No possible tab completion here
      // `git remote rm origin`
      rm: function (params, cb) {
        // Get git branches and find matches
      }
    }
  }
});
```

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
