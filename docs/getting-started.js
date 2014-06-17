var Completion = require('../');
var completion = new Completion({
  name: 'git',
  commands: [{
    name: 'checkout',
    completion: function (info, cb) {
      // For `git checkout dev/|`
      // info.words.value = ['git', 'checkout', 'dev/']
      // info.word.partialLeft = 'dev/'
      getGitBranches(function (err, allBranches) {
        if (err) {
          return cb(err);
        }

        var partialLeftWord = info.word.partialLeft;
        var branches = allBranches.filter(function (branch) {
          // 'chec' === 'chec' (from 'checkout')
          return partialLeftWord === branch.substr(0, partialLeftWord.length);
        });
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
