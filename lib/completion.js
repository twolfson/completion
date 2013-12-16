function Completion(tree) {
  // TODO: Normalize all `null`s into empty array callbacks
  // Save the tree as our root
  this.root = tree;
}
Completion.prototype = {
  complete: function (params, cb) {
    // Fragment words
    var line = params.line;
    var linePartialLeft = line.slice(0, params.cursor);
    var partialLeftWords = linePartialLeft.split(/\s+/g);

    // Jump to the second to last level
    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git checkout |world` -> ['git', 'checkout'] + ['world'] -> git.checkout(params, cb) (`['world']`)
    // TODO: Verify we can test this
    // TODO: Verify this would actually work... (it might just autocomplete `add` normally
    // `git add|E` -> ['git', 'add'] + ['E'] -> git.add -> git.add(params, cb) (`['README']`)

    // DEV: Just ran some command via foundry.
    // It turns out that bash completion will replace partialLeft word with the phrase
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
    // layer = `{'checkout': getGitBranches}`
    // partialLeftWords = ['git', 'checkout']
    var lastLayer = layer[partialLeftWords[lenMinusOne]];
    if (lastLayer !== undefined) {
      // If it is `null`, treat it as a terminal command and callback with it
      if (lastLayer === null) {

      }
    // Otherwise, callback with nothing
    } else {
      cb(null, []);
    }
  }
};

module.exports = Completion;