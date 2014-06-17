var Completion = require('../');
var gitCompletion = new Completion({
  name: 'git',
  options: [{
    // `git --help`, a terminal option
    name: '--help'
  }],
  commands: [{
    // `git checkout master`
    name: 'checkout',
    option: [{
      // `git checkout -b dev/hello`
      name: '-b',
      completion: function (info, cb) {
        // `-b` was matched by `completion` so keep on recursing
        return this.resolveInfo(info, cb);
      }
    }],
    completion: function getGitBranches (info, cb) {
      // Get git branches and find matches
    }
  }, {
    name: 'remote',
    commands: [{
      // `git remote add origin git@github.com:...`
      // No possible completion here
      name: 'add'
    }, {
      // `git remote rm origin`
      name: 'rm',
      completion: function getGitBranches (info, cb) {
        // Get git branches and find matches
      }
    }]
  }]
});

gitCompletion.complete({
  // `git remo|add`
  line: 'git remoadd',
  cursor: 8
}, function (err, results) {
  console.log(results); // ['remote']
});

gitCompletion.complete({
  // `git remote |`
  line: 'git remote ',
  cursor: 11
}, function (err, results) {
  console.log(results); // ['add', 'remove']
});
