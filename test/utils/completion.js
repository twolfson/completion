var Completion = require('../../');
var cursorUtils = require('./cursor');

// Define set of utilities for `completion`
exports.completeCommand = function (command) {
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
};

exports.init = function (params) {
  before(function initCompletion () {
    this.completion = new Completion(params);
  });
  after(function cleanupCompletion () {
    delete this.completion;
  });
};
