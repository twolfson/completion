// Load in dependencies
var lineInfo = require('line-info');

// Define our completion constructor
function Completion(tree) {
  // Save the tree as our node
  this.node = tree;
}
Completion.prototype = {
  complete: function (params, cb) {
    // Collect info
    var info = lineInfo(params);
    return this.completeInfo(info, cb);
  },
  completeInfo: function (info, cb) {
    var partialLeftWords = info.words.partialLeft;

    // Jump to the second to last level
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.
    function retrieveLevel(layer, levels) {
      // If we have less than 2 levels, return early
      if (levels.length < 2) {
        return layer;
      // Otherwise, attempt to keep on recursing
      } else {
        // Find the next level
        var remainingLevels = levels.slice();
        var newLayer = layer[remainingLevels.shift()];

        // If there is no new layer, return early
        // DEV: This could be `null` as defined by someone's completion case
        // DEV: or it could be `undefined` if the completion algorithm has not been defined for this command
        if (!newLayer) {
          return newLayer;
        }

        // Otherwise, recurse further
        return retrieveLevel(newLayer, remainingLevels);
      }
    }
    var layer = retrieveLevel(this.node, partialLeftWords);

    // If there is a key for the final word
    if (layer !== undefined) {
      var partialLeftWord = info.word.partialLeft;
      // If it is `null`, treat it as a terminal command and callback with it
      // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
      if (layer === null) {
        return cb(null, []);
      // Otherwise, if it is a function, find all possible completions
      // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]
      } else if (typeof layer === 'function') {
        return layer(info, cb);
      // Otherwise, if it is an objet, find matching commands
      // ['git', 'che'] on {git: {checkout: getGitBranches}} -> ['checkout']
      } else if (typeof layer === 'object') {
        var cmds = Object.getOwnPropertyNames(layer);
        var matchingCmds = cmds.filter(function (cmd) {
          return partialLeftWord === cmd.substr(0, partialLeftWord.length);
        });
        matchingCmds.sort();
        return cb(null, matchingCmds);
      }
    }

    // Callback with nothing
    cb(null, []);
  }
};

module.exports = Completion;
