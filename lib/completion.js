// Load in dependencies
var _ = require('underscore.string');

// Define our completion constructor
function Completion(tree) {
  // Save the tree as our root
  this.root = tree;
}
Completion.prototype = {
  complete: function (params, cb) {
    // Fragment words
    var line = params.line;
    var linePartialLeft = line.slice(0, params.cursor);
    var partialLeftWords = linePartialLeft.split(/\s+/g);

    // TODO: Prepare much more practical text information as noted in README
    // TODO: Break out text info into its own lib

    // Jump to the second to last level
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.
    var layer = this.root;
    var i = 0;
    var lenMinusOne = partialLeftWords.length - 1;
    for (; i < lenMinusOne; i++) {
      layer = layer[partialLeftWords[i]];
      if (!layer) {
        break;
      }
    }

    // If there is a key for the final word
    if (layer !== undefined) {
      var rightmostPartialLeftWord = partialLeftWords[lenMinusOne];
      // If it is `null`, treat it as a terminal command and callback with it
      // ['npm', 'publish'] on {npm: {publish: null}} -> ['publish'] (this makes it space to the next word)
      if (layer === null) {
        return cb(null, [rightmostPartialLeftWord]);
      // Otherwise, if it is a function, find all possible completions
      // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]
      } else if (typeof layer === 'function') {
        return layer(params, cb);
      // Otherwise, if it is an objet, find matching commands
      // ['git', 'che'] on {git: {checkout: getGitBranches}} -> ['checkout']
      } else if (typeof layer === 'object') {
        var cmds = Object.getOwnPropertyNames(layer);
        var matchingCmds = cmds.filter(function (cmd) {
          return _.startsWith(cmd, rightmostPartialLeftWord);
        });
        return cb(null, matchingCmds);
      }
    }

    // Callback with nothing
    cb(null, []);
  }
};

module.exports = Completion;