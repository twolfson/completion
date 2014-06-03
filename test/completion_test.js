// Load in dependencies
var assert = require('assert');
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
  before(function () {
    this.params = cursorUtils.splitAtCursor('npm publish |');
    this.expected = [];
    completionUtils.init({
      npm: {
        publish: null
      }
    });
  });

  describe('being completed', function () {
    // completionUtils.completeCommand();
    it.skip('returns nothing', function () {
      // assert.deepEqual(this.results, ['publish']);
    });
  });
});

describe('A terminal command with a completion function', function () {
  before(function () {
    this.params = cursorUtils.splitAtCursor('git checkout hello|');
    this.expected = ['hello-world', 'hello-there'];
    completionUtils.init({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello-world', 'hello-there']);
        }
      }
    });
  });

  describe('being completed', function () {
    // completionUtils.completeCommand();
    it.skip('returns the results of the completion', function () {
      // assert.deepEqual(this.results, ['publish']);
    });
  });
});
