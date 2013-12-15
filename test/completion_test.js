var assert = require('assert');
var Completion = require('../');
var testUtils = require('./utils/index');

// DEV: Internal util test
// TODO: We should break this into another lib
describe('A command', function () {
  before(function () {
    this.cmd = 'git ad|README';
  });

  describe('broken down into parameters', function () {
    before(function () {
      this.params = testUtils.cmdToParams(this.cmd);
    });

    it('is as expected', function () {
      assert.deepEqual(this.params, {
        cursor: 6,
        line: 'git adREADME'
      });
    });
  });
});

describe.skip('A partial command with one completion match', function () {
  describe('being completed', function () {
    it('returns its match', function () {

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
