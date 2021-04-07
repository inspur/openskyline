const figlet = require('figlet');

function logo(callback) {
  figlet('skyline', {
    font: 'Big'
  }, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(data);
    callback();
  });
}

module.exports = logo;
