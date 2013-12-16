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

    // Recursively find our level
    // DEV: This does not cover all cases =_=
    // DEV: We need something that invokes all completions but that could be inefficient so we stick to this

    // `git che|c` -> ['git', 'che'] + ['c'] -> git.che (404) -> git.*.filter('che')
    // `git add|E` -> ['git', 'add'] + ['E'] -> git.add -> git.add(params, cb) (`['README']`)
    var layer = this.root;
    var i = 0;
    var len = partialLeftWords.length;
    for (; i < len; i++) {
      // Determine the next layer
      var word = partialLeftWords[i];
      var next = layer[word];

      // If there is one
      if (next !== undefined) {
        // If it is null
        if (next === null) {
          // If it was the last command, save the command
          if (i === len - 1) {
            return cb(null, [word]);
          } else {
          // Otherwise, stop
            break;
          }
        } else if (typeof next === 'function') {
          // Otherwise, invoke the function
          return next(params, cb);
        } else {
        // Otheriwse, we don't know how to handle it so return
          break;
        }
      } else {
        break;
      }
    }

    // Callback with nothing
    cb(null, []);
  }
};

module.exports = Completion;