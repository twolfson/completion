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

describe('A partial command with one completion match', function () {
  completionUtils.init({
    npm: {
      publish: null
    }
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
    git: {
      checkout: function (params, cb) {
        cb(null, ['hello.world']);
      },
      'cherry-pick': function (params, cb) {
        cb(null, ['maraschino']);
      }
    }
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
    git: {
      checkout: function (params, cb) {
        cb(null, ['hello.world']);
      },
      'cherry-pick': function (params, cb) {
        cb(null, ['maraschino']);
      }
    }
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
    npm: {
      publish: null
    }
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
    npm: {
      publish: null
    }
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
    git: {
      checkout: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }
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
    git: {
      checkout: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }
  });

  describe('completed after the command has already been used', function () {
    completionUtils.completeCommand('git checkout something else');

    it('does not reply with the commands results', function () {
      assert.deepEqual(this.results, []);
    });
  });
});

describe.only('A command with options', function () {
  completionUtils.init({
    git: {
      '-b': Completion.optional(function (params, cb) {
        // The `-b` has already been shifted because we matched `-b`
        // As a result, attempt to complete once again from `git's` context
        this.parentNode.completeInfo(params, cb);
      }),
      checkout: function (params, cb) {
        cb(null, ['hello-world', 'hello-there']);
      }
    }
  });

  describe('being completed with a terminal command', function () {
    completionUtils.completeCommand('git -b chec|');

    it('returns the command without completion options', function () {
      assert.deepEqual(this.results, ['checkout']);
    });
  });

  describe('being completed with a non-terminal command', function () {
    completionUtils.completeCommand('git -b checkout hello|');

    it('returns the command without completion options', function () {
      assert.deepEqual(this.results, ['hello-world', 'hello-there']);
    });
  });

  describe('being completed with a command followed by an option', function () {
    completionUtils.completeCommand('git checkout -b wat|');

    it('returns the command without completion options', function () {
      assert.deepEqual(this.results, []);
    });
  });
});
