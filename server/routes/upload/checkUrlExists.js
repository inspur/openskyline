module.exports = function(options, context) {
  const router = require('express').Router();
  const URL = require('url');
  const request = require('request');
  const FTPClient = require('ftp');

  router.post('/', function(req, res) {
    const url = req.body.url ? URL.parse(req.body.url) : URL.parse('');
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      const options = {
        method: 'GET',
        url: url.href,
        timeout: 5000
      };
      const reqForUrl = request(options)
      .on('response', function(response) {
        if (response.statusCode === 200) {
          res.json({
            errCode: 0
          });
        } else {
          res.json({
            errCode: 1
          });
        }
        reqForUrl.abort();
      })
      .on('error', function(e) {
        res.json({
          errCode: 1
        });
        reqForUrl.abort();
      });
    } else if (url.protocol === 'ftp:') {
      try {
        const c = new FTPClient();
        c.on('ready', function() {
          c.get(url.path, function(err, stream) {
            if (err) {
              res.json({
                errCode: 1
              });
            } else {
              res.json({
                errCode: 0
              });
            }
            c.end();
          });
        });
        c.connect({
          host: url.hostname,
          port: url.port
        });
      } catch (e) {
        res.json({
          errCode: 1
        });
      }
    } else {
      res.json({
        errCode: 1
      });
    }
  });

  return router;
};
