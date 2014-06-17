// Load in dependencies
var assert = require('assert');
var completionUtils = require('./utils/completion');

// Start our tests
describe('A partial command with one completion match', function () {
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
      completion: function (info, cb) {
        cb(null, ['hello.world']);
      }
    }, {
      name: 'cherry-pick',
      completion: function (info, cb) {
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
      completion: function (info, cb) {
        cb(null, ['hello.world']);
      }
    }, {
      name: 'cherry-pick',
      completion: function (info, cb) {
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
      completion: function (info, cb) {
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
      completion: function (info, cb) {
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

describe('A many level command', function () {
  completionUtils.init({
    name: 'git',
    commands: [{
      name: 'remote',
      commands: [{
        name: 'add'
      }]
    }]
  });

  describe('when completing an incomplete command', function () {
    completionUtils.completeCommand('git remote a|');

    it('returns the expected command', function () {
      assert.deepEqual(this.results, ['add']);
    });
  });
});
