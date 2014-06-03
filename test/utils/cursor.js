// Load in dependencies
var assert = require('assert');

/**
 * Takes a command and breaks it down to its `completion` parameters
 * 'git ad|README' -> {line: 'git adREADME', cursor: 6}
 */
// TODO: We should break this into another lib
exports.splitAtCursor = function (cmd) {
  var parts = cmd.split('|');
  return {
    cursor: parts[0].length,
    line: parts.join('')
  };
};

// DEV: Internal util test
// TODO: We should break this into another lib
describe('A command', function () {
  var command = 'git ad|README';
  describe('broken down into parameters', function () {
    it('is as expected', function () {
      var actualParams = exports.splitAtCursor(command);
      assert.deepEqual(actualParams, {
        cursor: 6,
        line: 'git adREADME'
      });
    });
  });
});
