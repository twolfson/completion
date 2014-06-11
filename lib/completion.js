// Load in dependencies
var lineInfo = require('line-info');

// Define our completion constructor
function Completion(tree) {
  // Save the tree as our root
  this.root = tree;
}
Completion.prototype = {
  getLayer: function (key) {
    var layer = this.root[key];
    if (layer) {
      // TODO: Should we maintain parent context?
      // TODO: We should prob rename `root` to `node`
      return new Completion(layer);
    } else {
      return null;
    }
  },
  complete: function (params, cb) {
    // Collect info and complete against it
    var info = lineInfo(params);
    return this.completeInfo(info, cb);
  },
  completeInfo: function (info, cb) {
    // TODO: Prepare much more practical text information as noted in README

    // If there are no matched/remaining words defined, define them
    var matchedLeftWords = info.words.matchedLeft;
    if (matchedLeftWords === undefined) {
       matchedLeftWords = info.words.matchedLeft = [];
    }
    var remainingLeftWords = info.words.remainingLeft;
    if (remainingLeftWords === undefined) {
       remainingLeftWords = info.words.remainingLeft = info.words.partialLeft.slice();
    }

    // Find the left most remaining word and its corresponding subtree
    var remainingLeftmostWord = info.words.remainingLeft[0];
    var layer = null;
    if (remainingLeftmostWord === undefined) {
      layer = this.getLayer(remainingLeftmostWord);
    }

    // // Jump to the second to last level
    // // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.

    // If there is a layer
    if (layer) {
      // TODO: Save the next remaining word onto matched partial words

      // If the layer is a function, find all possible completions
      // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]

      // Otherwise, use the layer's completion mechanism
      } else if (typeof layer === 'function') {
        return layer.call(this, info, cb);
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
    // Otherwise, callback with nothing
    // DEV: Terminal commands with `null` will be handled in this case
    // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
    } else {
      return process.nextTick(function callbackWithNothing () {
        cb(null, []);
      });
    }

    // Callback with nothing
    cb(null, []);
  }
};

module.exports = Completion;
