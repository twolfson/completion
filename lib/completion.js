// Load in dependencies
var deepClone = require('clone');
var lineInfo = require('line-info');

// TODO: In order to make `options` not appear in `object`-based resolutons (e.g. ['-p', 'checkout'])
// allow them to be tagged with a special flag (e.g. `Completion.optional(fn)` -> sets _completionOptional = true)

// Define our completion constructor
function Completion(tree, parentNode) {
  // Save the tree as our node
  this.node = tree;
  this.parentNode = parentNode;
}
Completion.prototype = {
  // Helper functions for working with `info`
  matchLeftWord: function (_info) {
    // Prevent mutation on the original `info`
    var info = deepClone(_info);

    // Move word from `remainingLef` onto `matchedLeft`
    var remainingLeftWords = info.words.remainingLeft;
    var leftmostWord = remainingLeftWords.shift();
    info.words.matchedLeft.push(leftmostWord);

    // Return updated info
    return info;
  },

  // Define completion methods
  complete: function (params, cb) {
    // Collect info
    var info = lineInfo(params);
    return this.completeInfo(info, cb);
  },
  completeInfo: function (info, cb) {
    // If there is no `remainingLeft` or `matchedLeft` words, add them
    if (!info.words.remainingLeft || !info.words.matchedLeft) {
      info = deepClone(info);

      if (!info.words.remainingLeft) {
        info.words.remainingLeft = info.words.partialLeft.slice(0);
      }
      if (!info.words.matchedLeft) {
        info.words.matchedLeft = [];
      }
    }

    // The following is a recursive loop that creates child completion's until we arrive
    // at the second to last word in the left half of the command
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    var node = this.node;

    // If we have less than 2 remaining left words, return early
    if (info.words.remainingLeft.length < 2) {
      // DEV: `node` can be an object (more commands remaining),
      // DEV: a function (custom complete logic), or something falsy (e.g. no future autocompletes possible)

      // If the second to last node is falsy, callback with nothing
      // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
      var secondToLastNode = node;
      if (!secondToLastNode) {
        return cb(null, []);
      // Otherwise, attempt to understand what to do
      } else {
        var partialLeftWord = info.word.partialLeft;
        // If the node is a function, find all possible completions
        // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]
        if (typeof secondToLastNode === 'function') {
          return secondToLastNode.call(this, info, cb);
        // If the node is an objet, find matching commands
        // ['git', 'che'] on {git: {checkout: getGitBranches}} -> ['checkout']
        } else if (typeof secondToLastNode === 'object') {
          var cmds = Object.getOwnPropertyNames(secondToLastNode);
          var matchingCmds = cmds.filter(function (cmd) {
            return partialLeftWord === cmd.substr(0, partialLeftWord.length);
          });
          matchingCmds.sort();
          return cb(null, matchingCmds);
        // Otherwise, we don't know what to do (not an object or fn)
        // so callback with nothing
        } else {
          return cb(null, []);
        }
      }
    // Otherwise, attempt to keep on recursing
    } else {
      // Match the newest left word
      info = this.matchLeftWord(info);

      // Find the next node
      var matchedWord = info.words.matchedLeft[info.words.matchedLeft.length - 1];
      var childNode = node[matchedWord];

      // If there is no new node, exit with no more results
      // DEV: This could be `null` as defined by someone's completion case
      // DEV: or it could be `undefined` if the completion algorithm has not been defined for this command
      if (!childNode) {
        cb(null, []);
      }

      // Otherwise, recurse further
      var childCompletion = new Completion(childNode, this);
      childCompletion.completeInfo(info, cb);
    }
  }
};

module.exports = Completion;
