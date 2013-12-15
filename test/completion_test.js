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

// Examples:
// git chec| -> git checkout |
// git checkout dev/h| -> git checkout dev/hello.world|
// git checkout dev/| -> [git checkout dev/hello.world, git checkout dev/goodbye.moon]
// git chec|dev/ -> [git checkout |dev/]
// git che|cdev/ -> [git checkout |cdev/]

describe('A partial command with one completion match', function () {
  before(function () {
    this.command = 'npm pub';
    // DEV: Sometimes completions can be expensive (e.g. `npm install |`), we should make a lookup only when it is cost-effective.
    this.completion = new Completion({
      name: 'npm',
      children: [{
        name: 'publish'
      }]
    });
  });

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
