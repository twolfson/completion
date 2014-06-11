// Load in dependencies
var lineInfo = require('line-info');

// Define our completion constructor
function Completion(tree) {
  // Save the tree as our root
  this.root = tree;
}
Completion.prototype = {
  getSubtree: function (key) {
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
    console.log(params);
    var partialLeftWords = info.words.partialLeft;

    // TODO: Prepare much more practical text information as noted in README
    // TODO: Break out text info into its own lib

    // Jump to the second to last level
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.
    var layer = this.root;
    var i = 0;
    var lenMinusOne = partialLeftWords.length - 1;
    var matchedLeftWords = info.words.matchedLeftWords = [];
    var remainingLeftWords = info.words.remainingLeftWords = partialLeftWords.slice(0);
    for (; i < lenMinusOne; i++) {
      layer = layer[partialLeftWords[i]];
      if (!layer) {
        break;
      } else {
        matchedLeftWords.push(partialLeftWords[i]);
        remainingLeftWords.shift();
      }
    }

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
    }

    // Callback with nothing
    cb(null, []);
  }
};

module.exports = Completion;
