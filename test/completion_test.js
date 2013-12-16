var assert = require('assert');
var Completion = require('../');
var testUtils = require('./utils/index');

// DEV: Internal util test
// TODO: We should break this into another lib
describe('A command', function () {
  before(function () {
    this.command = 'git ad|README';
  });
  describe('broken down into parameters', function () {
    before(function () {
      this.params = testUtils.commandToParams(this.command);
    });
    it('is as expected', function () {
      assert.deepEqual(this.params, {
        cursor: 6,
        line: 'git adREADME'
      });
    });
  });
});

describe('A partial command with one completion match', function () {
  before(function () {
    this.params = testUtils.commandToParams('npm pub|');
    this.expected = ['publish'];
    this.completion = new Completion({
      'npm': {
        'publish': null
      }
    });
  });

  describe('being completed', function () {
    before(function () {
      this.actual = this.completion.complete(this.params);
    });

    it('returns its match', function () {
      assert.deepEqual(this.actual, this.expected);
    });
  });
});

describe.skip('A partial command with multiple completions', function () {
  describe('being completed', function () {
    it('returns all of its matches', function () {

    });
  });
});

describe.skip('A partial command in junction with the item', function () {
  describe('being completed', function () {
    it('returns the command\'s match', function () {

    });
  });
});
