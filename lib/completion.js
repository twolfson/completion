// Load in dependencies
var deepClone = require('clone');
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
  completeInfo: function (_info, cb) {
    // If there is no `remainingLeft` or `matchedLeft` words, add them
    if (!_info.words.remainingLeft || !_info.words.matchedLeft) {
      _info = deepClone(_info);

      if (!_info.words.remainingLeft) {
        _info.words.remainingLeft = _info.words.partialLeft.slice(0);
      }
      if (!_info.words.matchedLeft) {
        _info.words.matchedLeft = [];
      }
    }

    // Jump to the second to last level
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // DEV: Technically, we can replace all of the partialLeft word but that is 20% of cases. Not 80%.
    function resolveCompletions(node, info, callback) {
      // If we have less than 2 remaining left words, return early
      if (info.words.remainingLeft.length < 2) {
        // DEV: `node` can be an object (more commands remaining),
        // DEV: a function (custom complete logic), or something falsy (e.g. no future autocompletes possible)

        // If the second to last node is falsy, callback with nothing
        // ['npm', 'publish', ''] on {npm: {publish: null}} -> [] (nothing to complete)
        var secondToLastNode = node;
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
      // Otherwise, attempt to keep on recursing
      } else {
        // Match the newest left word
        info = deepClone(info);
        var remainingLeftWords = info.words.remainingLeft;
        var leftmostWord = remainingLeftWords.shift();
        info.words.matchedLeft.push(leftmostWord);

        // Find the next node
        var childNode = node[leftmostWord];

        // If there is no new node, exit with no more results
        // DEV: This could be `null` as defined by someone's completion case
        // DEV: or it could be `undefined` if the completion algorithm has not been defined for this command
        if (!childNode) {
          callback(null, []);
        }

        // Otherwise, recurse further
        var childCompletion = new Completion(childNode);
        childCompletion.completeInfo(info, callback);
      }
    }
    resolveCompletions(this.node, _info, cb);
  }
};

module.exports = Completion;
