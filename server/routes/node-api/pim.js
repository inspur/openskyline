module.exports = function (options, context) {
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');
  const crypto = require('crypto');

  let serviceAddr = context.getResource('serviceAddr.json');
  let encryptAlgorithm = serviceAddr.encryptAlgorithm || 'aes-256-cbc';
  let encryptKey = serviceAddr.encryptKey || '0123456789abcdef0123456789abcdef';
  let encryptIV = serviceAddr.encryptIV || '0123456789abcdef';
  let host = urlApi.format({
    protocol: Consts.HTTP,
    host: serviceAddr['keystone']
  });

  async function getPIMSettings(token) {
    return new Promise((resolve, reject) => {
      let options = {
        url: `${host}/v3/inspur/customparam/pim_params`,
        method: Consts.GET,
        json: true,
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Auth-Token': token
        }
      };
      request(options, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          if (body.params && body.params.length > 0) {
            let params = JSON.parse(body.params[0].value);
            resolve(params);
          } else {
            resolve({});
          }
        }
      });
    });
  }

  async function setPIMSettings(token, settings) {
    return new Promise((resolve, reject) => {
      let options = {
        url: `${host}/v3/inspur/customparam/pim_params`,
        method: Consts.POST,
        json: true,
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Auth-Token': token
        },
        body: {
          param: {
            value: JSON.stringify(settings)
          }
        }
      };
      request(options, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  function encrypt(plainText) {
    let cipher = crypto.createCipheriv(encryptAlgorithm, encryptKey, encryptIV);
    let cipherText = cipher.update(plainText, 'utf8', 'base64');
    cipherText = cipher.final('base64');
    return cipherText;
  }

  function decrypt(cipherText) {
    let decipher = crypto.createDecipheriv(encryptAlgorithm, encryptKey, encryptIV);
    let plainText = decipher.update(cipherText, 'base64', 'utf8');
    plainText = decipher.final('utf8');
    return plainText;
  }

  function btoa(plainText) {
    return Buffer.from(plainText).toString('base64');
  }

  router.get('/settings', async function(req, res) {
    res.header('Cache-Control', 'no-cache');
    try {
      let settings = await getPIMSettings(req.session.ptoken);
      if ('password' in settings) {
        delete settings.password;
      }
      res.json(settings);
    } catch (e) {
      res.status(400);
      res.json(e);
    }
  });

  router.post('/settings', async function (req, res) {
    res.header('Cache-Control', 'no-cache');
    let encryptedPassword = '';
    try {
      if (!req.body.password || req.body.password === '') {
        let existingPIMSettings = await getPIMSettings(req.session.ptoken);
        if (existingPIMSettings.password && existingPIMSettings.password !== '') {
          encryptedPassword = existingPIMSettings.password;
        } else {
          encryptedPassword = '';
        }
      } else {
        encryptedPassword = encrypt(req.body.password);
      }
    } catch (e) {
      encryptedPassword = '';
    }
    req.body.password = encryptedPassword;
    try {
      await setPIMSettings(req.session.ptoken, req.body);
      res.json({});
    } catch (e) {
      res.status(400);
      res.json(e);
    }
  });

  router.post('/login', async function (req, res) {
    res.header('Cache-Control', 'no-cache');
    try {
      let settings = await getPIMSettings(req.session.ptoken);
      let username = settings.username || '';
      let password = settings.password || '';
      let ip = settings.ip || '';
      let apiPort = settings.apiPort || 80;
      password = decrypt(password);
      let options = {
        url: `http://${ip}:${apiPort}/v1/auth/login`,
        method: Consts.POST,
        json: true,
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT
        },
        body: {
          username: username,
          password: btoa(btoa(btoa(btoa(btoa(password)))))
        }
      };
      request(options, function(error, response, body) {
        if (error) {
          res.status(400);
          res.json(body);
        } else {
          res.json(body);
        }
      });
    } catch (e) {
      res.status(400);
      res.json(e);
    }
  });

  return router;
};
