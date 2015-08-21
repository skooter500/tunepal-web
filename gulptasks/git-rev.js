var exec = require('child_process').exec;

function _command(cmd, cb) {
  exec(cmd, function(err, stdout, stderr) {
    cb(stdout.split('\n').join(''));
  });
}

module.exports = {
  head: function(cb) {
    _command('git log --no-color --pretty=format:"%H,%ai" HEAD~1..HEAD', function(result) {
      result = result.split(',');
      cb(result[0], result[1]);
    })
  }
};
