// Load in dependencies
var assert = require('assert');
var deepClone = require('clone');
var Completion = require('../');
var cursorUtils = require('./utils/cursor');

// Define set of utilities for `completion`
var completionUtils = {
  completeCommand: function (command) {
    before(function (done) {
      var params = cursorUtils.splitAtCursor(command);
      var that = this;
      this.completion.complete(params, function (err, results) {
        that.results = results;
        done(err);
      });
    });
    after(function () {
      delete this.results;
    });
  },
  init: function (params) {
    before(function initCompletion () {
      this.completion = new Completion(params);
    });
    after(function cleanupCompletion () {
      delete this.completion;
    });
  }
};

describe.only('A partial command with one completion match', function () {
  completionUtils.init({
    name: 'npm',
    commands: [{
      name: 'publish'
    }]
  });

  describe('being completed', function () {
    completionUtils.completeCommand('npm pub|');

    it('returns its match', function () {
      assert.deepEqual(this.results, ['publish']);
    });
  });
});

describe('A partial command with multiple completions', function () {
  completionUtils.init({
    name: 'git',
    commands: [{
      name: 'checkout',
      completion: function (params, cb) {
        cb(null, ['hello.world']);
      }
    }, {
      name: 'cherry-pick',
      completion: function (params, cb) {
        cb(null, ['maraschino']);
      }
    }]
  });

  describe('being completed', function () {
    completionUtils.completeCommand('git ch|');

    it('returns all of its matches', function () {
      assert.deepEqual(this.results, ['checkout', 'cherry-pick']);
    });
  });
});

describe('A partial command in junction with the item', function () {
  completionUtils.init({
    name: 'git',
    commands: [{
      name: 'checkout',
      completion: function (params, cb) {
        cb(null, ['hello.world']);
      }
    }, {
      name: 'cherry-pick',
      completion: function (params, cb) {
        cb(null, ['maraschino']);
      }
    }]
  });

  describe('being completed', function () {
    completionUtils.completeCommand('git che|world');

    it('returns the command\'s match', function () {
      assert.deepEqual(this.results, ['checkout', 'cherry-pick']);
    });
  });
});

describe('A terminal command', function () {
  completionUtils.init({
    name: 'npm',
    commands: [{
      name: 'publish'
    }]
  });

  describe('being completed', function () {
    completionUtils.completeCommand('npm publish|');

    it('returns the command (for spacing)', function () {
      assert.deepEqual(this.results, ['publish']);
    });
  });
});

describe('A terminal command with whitespace', function () {
  completionUtils.init({
    name: 'npm',
    commands: [{
      name: 'publish'
    }]
  });

  describe('being completed', function () {
    completionUtils.completeCommand('npm publish |');

    it('returns nothing', function () {
      assert.deepEqual(this.results, []);
    });
  });
});

describe('A terminal command with a completion function', function () {
  completionUtils.init({
    name: 'git',
    commands: [{
      name: 'checkout',
      completion: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('being completed', function () {
    completionUtils.completeCommand('git checkout hello|');

    it('returns the results of the completion', function () {
      assert.deepEqual(this.results, ['hello-world', 'hello-there']);
    });
  });
});

describe('A command with a completion function', function () {
  completionUtils.init({
    name: 'git',
    commands: [{
      name: 'checkout',
      completion: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('completed after the command has already been used', function () {
    completionUtils.completeCommand('git checkout something else');

    it('does not reply with the commands results', function () {
      assert.deepEqual(this.results, []);
    });
  });
});

describe.skip('A command with terminal options', function () {
  completionUtils.init({
    name: 'git',
    options: [{
      // Do not complete anything new after `help`
      name: '--help'
    }],
    commands: [{
      name: 'checkout',
      completion: function (params, cb) {
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
        completion: function (params, cb) {
          // The `-b` has already been shifted because we matched `-b`
          // As a result, attempt to complete once again from `git's` context
          this.parentNode.complete(params, cb);
        }
      }],
      completion: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('completing a command\'s values', function () {
    completionUtils.completeCommand('git checkout -b hello|');

    it('returns matching values', function () {
      cb(null, ['hello-world', 'hello-there']);
    });
  });
});

describe('A command with non-terminal command options', function () {
  completionUtils.init({
    name: 'git',
    options: [{
      name: '--dry-run',
      completion: function (params, cb) {
        // --dry-run has already been shifted, continue resolving
        this.parentNode.complete(params, cb);
      }
    }],
    commands: [{
      name: 'checkout',
      completion: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }]
  });

  describe('completing a command', function () {
    completionUtils.completeCommand('git --dry-run chec|');

    it('returns a matching command', function () {
      cb(null, ['checkout']);
    });
  });
});
