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

    function handleResolution(secondToLastNode, callback) {
      // If the second to last node is falsy, callback with nothing
      // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
      if (!secondToLastNode) {
        return callback(null, []);
      // Otherwise, attempt to understand what to do
      } else {
        var partialLeftWord = info.word.partialLeft;
        // If it is a function, find all possible completions
        // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]
        if (typeof secondToLastNode === 'function') {
          return secondToLastNode(info, callback);
        // Otherwise, if it is an objet, find matching commands
        // ['git', 'che'] on {git: {checkout: getGitBranches}} -> ['checkout']
        } else if (typeof secondToLastNode === 'object') {
          var cmds = Object.getOwnPropertyNames(secondToLastNode);
          var matchingCmds = cmds.filter(function (cmd) {
            return partialLeftWord === cmd.substr(0, partialLeftWord.length);
          });
          matchingCmds.sort();
          return callback(null, matchingCmds);
        // Otherwise, we don't know what to do so callback with nothing
        } else {
          return callback(null, []);
        }
      }
    }

    // Jump to the second to last level
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.
    function resolveSecondToLastNode(node, remainingLeftWords, callback) {
      // If we have less than 2 remainingLeftWords, return early
      if (remainingLeftWords.length < 2) {
        // DEV: `node` can be an object (more commands remaining),
        // DEV: a function (custom complete logic), or something falsy (e.g. no future autocompletes possible)
        handleResolution(node, callback);
      // Otherwise, attempt to keep on recursing
      } else {
        // Find the next level
        remainingLeftWords = remainingLeftWords.slice();
        var childNode = node[remainingLeftWords.shift()];

        // If there is no new node, exit with no more results
        // DEV: This could be `null` as defined by someone's completion case
        // DEV: or it could be `undefined` if the completion algorithm has not been defined for this command
        if (!childNode) {
          callback(null, []);
        }

        // Otherwise, recurse further
        resolveSecondToLastNode(childNode, remainingLeftWords, callback);
      }
    }
    resolveSecondToLastNode(this.node, partialLeftWords, cb);
  }
};

module.exports = Completion;
