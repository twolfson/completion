// Load in dependencies
var lineInfo = require('line-info');

// Define our completion constructor
function Completion(tree) {
  // Save the tree as our root
  this.root = tree;
}
Completion.prototype = {
  getLayer: function (key) {
    return this.root[key];
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

    var remainingLeftmostWord = info.words.remainingLeft[0];
    var layer = this.getLayer(remainingLeftmostWord);

    // Find the left most remaining word and its corresponding subtree
    // // Jump to the second to last level
    // // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.

    // If there is one word left and it is our partial, complete against it
    // DEV: We are attempting to complete the `che` in ['git', 'che'].
    // DEV: Therefore we must complete with partial matches from `git's` context
    console.log(info.words.remainingLeft.length, layer);
    if (info.words.remainingLeft.length === 1) {
      var partialLeftWord = info.word.partialLeft;
      var cmds = Object.getOwnPropertyNames(layer);
      var matchingCmds = cmds.filter(function (cmd) {
        return partialLeftWord === cmd.substr(0, partialLeftWord.length);
      });
      matchingCmds.sort();
      return process.nextTick(function () {
        cb(null, matchingCmds);
      });
    }

    // If there is a layer
    if (layer) {
      // TODO: Save the next remaining word onto matched partial words
      info.words.remainingLeft.shift();
      info.words.matchedLeft.push(remainingLeftmostWord);

      // If the layer is a function, find all possible completions
      // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]
      if (typeof layer === 'function') {
        return layer.call(this, info, cb);
      // Otherwise, if it is an object, find matching commands
      // ['git', 'che'] on {git: {checkout: getGitBranches}} -> ['checkout']
      } else if (typeof layer === 'object') {
        // TODO: Should we maintain parent context?
        // TODO: We should prob rename `root` to `node`

        // TODO: Our subtree should not be aware of the unmatchable values, right
        var subtree = new Completion(layer);
        return subtree.completeInfo(info, cb);
      // Otherwise, callback with nothing
      } else {
        return process.nextTick(function callbackWithNothing () {
          cb(null, []);
        });
      }
    } else {
      // Otherwise, callback with nothing
      // DEV: Terminal commands with `null` will be handled in this case
      // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
      return process.nextTick(function callbackWithNothing () {
        cb(null, []);
      });
    }

    // Callback with nothing
    cb(null, []);
  }
};

module.exports = Completion;
