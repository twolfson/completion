var Completion = require('../');
var completion = new Completion({
  name: 'git',
  commands: [{
    name: 'checkout',
    completion: function (info, cb) {
      // For `git checkout dev/|`
      // info.words.value = ['git', 'checkout', 'dev/']
      // info.word.partialLeft = 'dev/'
      var that = this;
      getGitBranches(function (err, allBranches) {
        if (err) {
          return cb(err);
        }

        // Match 'dev/' === 'dev/' (from 'dev/hello')
        var partialLeftWord = info.word.partialLeft;
        var branches = that.matchLeftWord(partialLeftWord, allBranches);
        cb(null, branches);
      });
    }
  }]
});
completion.complete({
  // `git chec|`
  line: 'git chec',
  cursor: 8
}, function (err, results) {
  console.log(results); // ['checkout']
});
