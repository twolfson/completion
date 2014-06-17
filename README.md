# completion [![Build status](https://travis-ci.org/twolfson/completion.png?branch=master)](https://travis-ci.org/twolfson/completion)

Completion library for CLI commands

This was built as part of [foundry][], a CLI utility for making releases painless.

[foundry]: https://github.com/twolfson/foundry

```bash
$ git chec|
$ git checkout |

$ git checkout dev/|
dev/hello.world dev/goodbye.moon

$ git chec|dev/
$ git checkout |dev/
```

## Getting Started
Install the module with: `npm install completion`

```js
var Completion = require('completion');
var completion = new Completion({
  name: 'git',
  commands: [{
    name: 'checkout',
    completion: function (info, cb) {
      // For `git checkout dev/|`
      // info.words.value = ['git', 'checkout', 'dev/']
      // info.word.partialLeft = 'dev/'
      var that = this;
      getGitBranches(function (err, allBranches) {
        if (err) {
          return cb(err);
        }

        // Match 'dev/' === 'dev/' (from 'dev/hello')
        var partialLeftWord = info.word.partialLeft;
        var branches = that.resolveLeftWord(partialLeftWord, allBranches);
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

### `new Completion(tree)`
Create a new `completion` instance

- tree `Object` - Outline of program
    - name `String` - Command that is being executed
    - options `Object[]` - Optional array of objects that represent options
        - name `String` - Name of option (e.g. `--help`)
        - completion `Function` - Optional function to complete the remainder of the invocation
            - If no `completion` is specified, we assume this is terminal and stop recursing
            - Details on completion functions can be found below
    - commands `Object[]` - Optional array of new `tree` instances to complete against
        - This cannot exist on the same node as `completion` as they are contradictory
    - completion `Function` - Optional completion function to determine results for a command
        - Details on completion can be found below

#### `command/option completion` functions
`options` and `commands` share a common completion function signature, `function (info, cb)`

- info `Object` - Information about original input
    - Content will be information from [twolfson/line-info][]
    - We provide 2 additional properties
        - words.matchedLeft `String[]` - Words matched from `words.partialLeft` while walking the tree
        - words.remainingLeft `String[]` - Unmatched words that need to be/can be matched against
- cb `Function` - Error-first callback function to return matches via
    - `cb` has a signature of `function (err, results)`

[twolfson/line-info]: https://github.com/twolfson/line-info#lineinfoparams

For options, it is often preferred to remove more words that are matched (e.g. `-m <msg>`). For this, we suggest using the [`matchLeftWord` method][match-left-word].

For completing partial matches, we provide the [`completeLeftWord` method][complete-left-word].

[match-left-word]:
[complete-left-word]:

### `completion.matchLeftWord(info)`
Helper function to shift word from `info.words.remainingLeft` to `info.words.matchedLeft`

- info `Object` - Information passed into `completion` functon

```js
var info = {words: {remainingLeft: ['hello', 'world'], matchedLeft: []}};
info = this.matchLeftWord(info);
info; // {words: {remainingLeft: ['world'], matchedLeft: ['hello']}}
```

### `completion.completeLeftWord(leftWord, words)`
Helper function to find words from `words` that start with `leftWord`

- leftWord `String` - Word to match left content of
    - `leftWord` gets its name from usually coming from `words.partialLeft`
- words `String[]` - Array of words to filter against

Returns:

- matchedWords `String[]` - Matching words from `words` that start with `leftWord`

```js
this.completeLeftWord('hello', ['hello-world', 'hello-there', 'goodbye-moon']);
// ['hello-world', 'hello-there'];
```

### `completion.complete(params, cb)`
Get potential completion matches

- params `Object` - Information similar to that passed in by `bash's` tab completion
    - line `String` - Input to complete against (similar to `COMP_LINE`)
    - cursor `Number` - Index within `line` of the cursor (similar to `COMP_POINT`)
- cb `Function` - Error-first callback function that receives matches
    - `cb` should have a signature of `function (err, results)`

## Examples
An example of `git` would be

```js
var gitCompletion = new Completion({
  git: {
    // `git checkout master`
    checkout: function (info, cb) {
      // Get git branches and find matches
    },
    remote: {
      // `git remote add origin git@github.com:...`
      add: null, // No possible tab completion here
      // `git remote rm origin`
      rm: function (info, cb) {
        // Get git branches and find matches
      }
    }
  }
});

gitCompletion.complete({
  // `git remo|add`
  line: 'git remoadd',
  cursor: 8
}, function (err, results) {
  results; // ['remote']
});

gitCompletion.complete({
  // `git remote |`
  line: 'git remote',
  cursor: 11
}, function (err, results) {
  results; // ['add', 'remove']
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
