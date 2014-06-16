// Load in dependencies
var deepClone = require('clone');
var lineInfo = require('line-info');

// TODO: In order to make `options` not appear in `object`-based resolutons (e.g. ['-p', 'checkout'])
// allow them to be tagged with a special flag (e.g. `Completion.optional(fn)` -> sets _completionOptional = true)

/*
{
  name: 'npm',
  options: [{
    name: '--help'
  }],
  commands: [{
    name: 'publish',
    options: [{
      name: '--force',
      completion: function () {
        // noop
      }
    }]
  }]
}
*/

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

        // If there is completion logic, use it
        // ['git', 'checkout', 'hello'] on {name: git, commands: [{name: checkout, completion: getBranches}]}
          // -> ['hello.word' (branch)]
        if (secondToLastNode.completion) {
          return secondToLastNode.completion.call(this, info, cb);
        // If there are more commands, match them
        // ['git', 'che'] on {name: git, commands: [{name: checkout, completion: getBranches}]}
          // -> ['checkout']
        } else if (secondToLastNode.commands) {
          var cmds = secondToLastNode.commands.map(function getCommandName (commandNode) {
            return commandNode.name;
          });
          var matchingCmds = cmds.filter(function (cmd) {
            return partialLeftWord === cmd.substr(0, partialLeftWord.length);
          });
          matchingCmds.sort();
          return cb(null, matchingCmds);
        // Otherwise, this is a terminal command so callback with nothing
        } else {
          return cb(null, []);
        }
      }
    // Otherwise, attempt to keep on recursing
    } else {
      // Match the newest left word
      info = this.matchLeftWord(info);
      var wordToMatch = info.words.matchedLeft[info.words.matchedLeft.length - 1];

      // TODO: If the next word is an option
        // If there is a completion action, use it

        // Otherwise, exit with no results

      // Otherwise, if the next word is a command
      // TODO: Use `for` loop
      var commandNodes = node.commands || [];
      var matchedCommandNode = commandNodes.filter(function matchCommand (commandNode) {
        return commandNode.name === wordToMatch;
      })[0];
      if (matchedCommandNode) {
        // Recurse further
        var childCompletion = new Completion(matchedCommandNode, this);
        return childCompletion.completeInfo(info, cb);
      }

      // Otherwise, there are no more matches and exit with no results
      cb(null, []);
    }
  }
};

module.exports = Completion;
