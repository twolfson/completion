// Load in dependencies
var assert = require('assert');
var completionUtils = require('./utils/completion');

// Start our tests
describe('A command with terminal options', function () {
  completionUtils.init({
    name: 'git',
    options: [{
      // Do not complete anything new after `help`
      name: '--help'
    }],
    commands: [{
      name: 'checkout',
      completion: function (info, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('completing a terminal option followed by a command', function () {
    completionUtils.completeCommand('git --help chec|');

    it('does not return any matching commands', function () {
      assert.deepEqual(this.results, []);
    });
  });

  describe('completing an option', function () {
    completionUtils.completeCommand('git --he|');

    it('does not return any values', function () {
      assert.deepEqual(this.results, []);
    });
  });
});

describe('A command with non-terminal options', function () {
  completionUtils.init({
    name: 'git',
    commands: [{
      name: 'checkout',
      options: [{
        name: '-b',
        completion: function (info, cb) {
          // The `-b` has already been shifted because we matched `-b`
          // As a result, attempt to complete once again from `git's` context
          this.resolveInfo(info, cb);
        }
      }],
      completion: function (info, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('completing a command\'s values', function () {
    completionUtils.completeCommand('git checkout -b hello|');

    it('returns matching values', function () {
      assert.deepEqual(this.results, ['hello-world', 'hello-there']);
    });
  });
});

describe('A command with non-terminal command options', function () {
  completionUtils.init({
    name: 'git',
    options: [{
      name: '--dry-run',
      completion: function (info, cb) {
        // --dry-run has already been shifted, continue resolving
        this.resolveInfo(info, cb);
      }
    }],
    commands: [{
      name: 'checkout',
      completion: function (info, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('completing a command', function () {
    completionUtils.completeCommand('git --dry-run chec|');

    it('returns a matching command', function () {
      assert.deepEqual(this.results, ['checkout']);
    });
  });
});
