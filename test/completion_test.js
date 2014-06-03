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

function assertExpected() {
  assert.deepEqual(this.actual, this.expected);
}

describe.only('A partial command with one completion match', function () {
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
  before(function () {
    this.params = cursorUtils.splitAtCursor('git ch|');
    this.expected = ['checkout', 'cherry-pick'];
    this.completion = new Completion({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello.world']);
        },
        'cherry-pick': function (params, cb) {
          cb(null, ['maraschino']);
        }
      }
    });
  });

  describe('being completed', function () {
    // completeCommand();
    it('returns all of its matches', assertExpected);
  });
});

describe('A partial command in junction with the item', function () {
  before(function () {
    this.params = cursorUtils.splitAtCursor('git che|world');
    this.expected = ['checkout', 'cherry-pick'];
    this.completion = new Completion({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello.world']);
        },
        'cherry-pick': function (params, cb) {
          cb(null, ['maraschino']);
        }
      }
    });
  });

  describe('being completed', function () {
    // completeCommand();
    it('returns the command\'s match', assertExpected);
  });
});

describe('A terminal command', function () {
  before(function () {
    this.params = cursorUtils.splitAtCursor('npm publish|');
    this.expected = ['publish'];
    this.completion = new Completion({
      npm: {
        publish: null
      }
    });
  });

  describe('being completed', function () {
    // completeCommand();
    it('returns the command (for spacing)', assertExpected);
  });
});

describe('A terminal command with whitespace', function () {
  before(function () {
    this.params = cursorUtils.splitAtCursor('npm publish |');
    this.expected = [];
    this.completion = new Completion({
      npm: {
        publish: null
      }
    });
  });

  describe('being completed', function () {
    // completeCommand();
    it('returns nothing', assertExpected);
  });
});

describe('A terminal command with a completion function', function () {
  before(function () {
    this.params = cursorUtils.splitAtCursor('git checkout hello|');
    this.expected = ['hello-world', 'hello-there'];
    this.completion = new Completion({
      git: {
        checkout: function (params, cb) {
          cb(null, ['hello-world', 'hello-there']);
        }
      }
    });
  });

  describe('being completed', function () {
    // completeCommand();
    it('returns the results of the completion', assertExpected);
  });
});
