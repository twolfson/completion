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
    function resolveSecondToLastNode(node, remainingLeftWords) {
      // If we have less than 2 remainingLeftWords, return early
      if (remainingLeftWords.length < 2) {
        return node;
      // Otherwise, attempt to keep on recursing
      } else {
        // Find the next level
        remainingLeftWords = remainingLeftWords.slice();
        var childNode = node[remainingLeftWords.shift()];

        // If there is no new node, return early
        // DEV: This could be `null` as defined by someone's completion case
        // DEV: or it could be `undefined` if the completion algorithm has not been defined for this command
        if (!childNode) {
          return childNode;
        }

        // Otherwise, recurse further
        return resolveSecondToLastNode(childNode, remainingLeftWords);
      }
    }
    var secondToLastNode = resolveSecondToLastNode(this.node, partialLeftWords);

    // If there is a key for the final word
    if (secondToLastNode !== undefined) {
      var partialLeftWord = info.word.partialLeft;
      // If it is `null`, treat it as a terminal command and callback with it
      // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
      if (secondToLastNode === null) {
        return cb(null, []);
      // Otherwise, if it is a function, find all possible completions
      // ['git', 'checkout', 'hello'] on {git: {checkout: getGitBranches}} -> ['hello.word' (branch)]
      } else if (typeof secondToLastNode === 'function') {
        return secondToLastNode(info, cb);
      // Otherwise, if it is an objet, find matching commands
      // ['git', 'che'] on {git: {checkout: getGitBranches}} -> ['checkout']
      } else if (typeof secondToLastNode === 'object') {
        var cmds = Object.getOwnPropertyNames(secondToLastNode);
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
