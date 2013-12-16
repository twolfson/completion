function Completion(universe) {
  // TODO: Normalize all `null`s into empty array callbacks
  // Save the universal tree
  this.universe = universe;
}
Completion.prototype = {
  complete: function (params, cb) {
    cb(null, ['publish']);
  }
};

module.exports = Completion;