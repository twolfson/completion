/**
 * Takes a command and breaks it down to its `completion` parameters
 * 'git ad|README' -> {line: 'git adREADME', cursor: 6}
 */
// TODO: We should break this into another lib
exports.commandToParams = function (cmd) {
  var parts = cmd.split('|');
  return {
    cursor: parts[0].length,
    line: parts.join('')
  };
};