const path = require('path');
const { exec } = require('child_process');

const packageJson = require(path.join(__dirname, '../', 'package.json'));

exec(`tar -cvzf openskyline-${packageJson.version}.tar.gz server/ dist/ static/ constants.js`, function(error, stdout, stderr){
  if(error) {
      console.error('error: ' + error);
      return;
  }
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
});