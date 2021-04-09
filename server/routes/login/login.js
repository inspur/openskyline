module.exports = function (options, context) {
  const mysql = require('promise-mysql');
  const logger = require('log4js').getLogger('Login');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');
  const moment = require('moment');
  const crypto = require('crypto');

  let serviceAddr = context.getResource('serviceAddr.json');

  function getShowVerFun(host) {
    return new Promise((resolve, reject) => {
      let o = {
        url: host + "/v3/inspur/system/config/verification",
        method: Consts.GET,
        json: true,
        body: {},
        qs: {},
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT
        }
      };
      request(o, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          if (!body.error) {
            resolve(body.hasOwnProperty('verification_code') && body.verification_code.hasOwnProperty('config_value') && body.verification_code.config_value === 1);
          }
        }
      });
    });
  }

  async function getIPContinuousWrong(ip) {
    try {
      const connection = await mysql.createConnection({
        host: serviceAddr.mysql.host,
        port: serviceAddr.mysql.port,
        user: serviceAddr.mysql.user,
        password: serviceAddr.mysql.password,
        database: serviceAddr.mysql.database
      });
      let result = false;
      let results = await connection.query(`SELECT * FROM login_ip_logs WHERE ip = ?`, [ip]);
      if (results.length > 0) {
        if (results[0].continuous_wrong_numbers > 0) {
          result = true;
        }
      } else {
        result = false;
      }
      await connection.end();
      return result;
    } catch (e) {
      throw e;
    }
  }

  async function setIPContinuousWrongNumber(ip, success) {
    return true;
  }

  function getSessionCount(req) {
    return new Promise((resolve, reject) => {
      req.sessionStore.all((error, obj) => {
        let sessionCount = 0;
        for (let key in obj) {
          let item = obj[key];
          if (typeof item === 'string') {
            item = JSON.parse(item);
          }
          if ('userId' in item) {
            sessionCount += 1;
          }
        }
        resolve(sessionCount);
      });
    });
  }

  function getSystemConfig(host) {
    return new Promise((resolve, reject) => {
      let opt = {
        url: `${host}/v3/inspur/system/config/before-auth`,
        method: Consts.GET,
        json: true,
        body: {},
        qs: {},
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Auth-Token': ''
        }
      };
      request(opt, (error, response, body) => {
        if (body instanceof Array) {
          let systemConfig = {};
          for (let i = 0; i < body.length; i++) {
            systemConfig[body[i][0]] = String(body[i][1]);
          }
          resolve(systemConfig);
        } else {
          resolve({});
        }
      });
    });
  }

  function addCaptchaToSession(req) {
    var p = "123456789";
    var newCaptcha = '';
    for (var i = 0; i < 4; i++) {
      let ran = crypto.randomBytes(1)[0];
      ran = ran.toString().substr(-1) / 10;
      newCaptcha += p.charAt(ran * p.length | 0);
    }
    req.session['verifyCode'] = newCaptcha;
  }

  function loginOrigin({host, authObj, ip, traceId}) {
    return new Promise((resolve, reject) => {
      let opt = {
        url: `${host}/v3/auth/tokens`,
        method: Consts.POST,
        json: true,
        body: authObj,
        qs: {},
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Openstack-Request-Id': traceId,
          "remote-ip": ip
        }
      };
      request(opt, (error, response, body) => {
        if (error) {
          reject(body);
        } else if (body.error) {
          reject(body);
        } else {
          resolve(response);
        }
      });
    });
  }

  function sendSMS({host, token, ip, traceId}) {
    return new Promise((resolve, reject) => {
      let opt = {
        url: `${host}/v3/inspur/auth/sms`,
        method: Consts.POST,
        json: true,
        body: {},
        qs: {},
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Openstack-Request-Id': traceId,
          "remote-ip": ip,
          'X-Auth-Token': token
        }
      };
      request(opt, (error, response, body) => {
        if (error) {
          reject(body);
        } else if (body.error) {
          reject(body);
        } else {
          resolve(response);
        }
      });
    });
  }

  function login({host, authObj, ip, traceId, headers={}}) {
    return new Promise((resolve, reject) => {
      let opt = {
        url: `${host}/v3/inspur/auth/tokens`,
        method: Consts.POST,
        json: true,
        body: authObj,
        qs: {},
        headers: {
          ...headers,
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Openstack-Request-Id': traceId,
          "remote-ip": ip
        }
      };
      request(opt, (error, response, body) => {
        if (error) {
          reject(body);
        } else if (body.error) {
          reject(body);
        } else {
          resolve(response);
        }
      });
    });
  }

  function getSessionConfig({host, token}) {
    return new Promise((resolve, reject) => {
      let opt = {
        url: `${host}/v3/inspur/system/config/session`,
        method: Consts.GET,
        json: true,
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Auth-Token': token
        }
      };
      request(opt, (error, response, body) => {
        if (error) {
          reject(body);
        } if (body.error) {
          reject(body.error);
        } else {
          let config = {
            sessionTimeout: '10',
            multiSession: false
          };
          if ('session_timeout' in body) {
            config.sessionTimeout = body.session_timeout.config_value;
          }
          if ('multi_session' in body) {
            config.multiSession = parseInt(body.multi_session.config_value) === 1;
          }
          resolve(config);
        }
      });
    });
  }

  router.post('/', async function (req, res) {
    let traceId = req.headers['x-openstack-request-id'] || ''; // 获取追踪id
    try {
      if (serviceAddr.twoFactorAuth) {
        let { twoFactorAuthSwitch = false, twoFactorAuthSolution = '' } = serviceAddr.twoFactorAuth;
        if (twoFactorAuthSwitch && twoFactorAuthSolution === 'inspur_cert_v3') {
          let sslClientCN = req.headers['x-ssl-client-cn'] || '';
          let inUserName = req.body.auth.identity.password.user.name || '';
          if (sslClientCN !== inUserName) {
            res.status(401).json({ error: 'user name does not match ssl cn.' });
            return;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    let host = urlApi.format({
      protocol: Consts.HTTP,
      host: serviceAddr['keystone']
    });
    let systemConfig = await getSystemConfig(host);
    let showVerifyCode = false; // await getShowVerFun(host);
    //校验验证码
    let flg = true;
    let showVer = req.cookies.showVerifycode;
    let session = req.session;
    let code = req.body.verifyCode;
    let verifyCode = session["verifyCode"];
    let ip = req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
    const isIPContinuousWrong = false; // await getIPContinuousWrong(ip);
    if (systemConfig.sms_valid === '1' && 'validcode' in req.headers) { // 如果要求短信验证码，且有短信验证码，则认为是已经完成了账号密码验证，此时不需要验证码
      flg = true;
    } else if (showVer || session.showVerifyCode || showVerifyCode || isIPContinuousWrong) { //显示验证码
      if (!verifyCode || typeof verifyCode === 'undefined') { //过期
        flg = false;
      }
      if (!code || typeof code === 'undefined') { //没传递过来验证码
        flg = false;
      }
      if (code !== undefined && verifyCode.toLocaleLowerCase() !== code.toLocaleLowerCase()) {
        flg = false;
      }
    } else { //设置不显示验证码
      if (code) { //这种情况是输错密码导致出现的验证码
        if (verifyCode.toLocaleLowerCase() !== code.toLocaleLowerCase()) {
          flg = false;
        }
      }
    }
    if (!flg) { //失败
      setIPContinuousWrongNumber(ip, false);
      res.json({ error: "verifyCode fail" });
      return;
    }

    let sessionCount = 0; // await getSessionCount(req);
    if ('max_session' in systemConfig) {
      let maxSession = parseInt(systemConfig.max_session);
      if (maxSession !== -1 && sessionCount >= systemConfig.max_session) {
        // 超过最大会话数
        if (/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(systemConfig.max_session_time)) {
          const times = systemConfig.max_session_time.split('-');
          const now = moment();
          const startTime = moment(now);
          startTime.hour(times[0].split(':')[0]);
          startTime.minute(times[0].split(':')[1]);
          const endTime = moment(now);
          endTime.hour(times[1].split(':')[0]);
          endTime.minute(times[1].split(':')[1]);
          if ((startTime.isAfter(endTime) && !now.isBetween(endTime, startTime)) || (startTime.isBefore(endTime) && now.isBetween(startTime, endTime)) || (startTime.isSame(endTime) && now.isSame(startTime))) {
            res.status(401);
            res.json({
              error: {
                code: 401,
                message: 'Fail: max session reached.'
              }
            });
            return;
          }
        }
      }
    }
    addCaptchaToSession(req);
    delete req.body.verifyCode;

    if (ip.split(',').length > 0) {
      ip = ip.split(',')[0];
    }
    req.body.auth.remoteip = ip;
    let date = new Date();
    let time = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
    req.body.auth.create_time = time;

    try {
      if (systemConfig.sms_valid === '1' && !('validcode' in req.headers)) { // 如果要求短信验证码，且请求头中没有该值，则执行发送短信
        let loginOriginRes = await loginOrigin({ host, authObj: req.body, ip, traceId });
        setIPContinuousWrongNumber(ip, true);
        let token = loginOriginRes.headers['x-subject-token'];
        let sendSMSRes = await sendSMS({ host, token, ip, traceId });
        res.json({
          phoneNumber: sendSMSRes.body.toString()
        });
      } else {
        headers = {};
        if (systemConfig.sms_valid === '1') {
          if ('validcode' in req.headers) {
            headers['VALIDCODE'] = req.headers['validcode'];
          }
        }
        let loginRes = await loginOrigin({ host, authObj: req.body, ip, traceId, headers });
        req.session['loginTraceId'] = traceId;
        setIPContinuousWrongNumber(ip, true);
        let resBody = loginRes.body;
        let token = loginRes.headers['x-subject-token'];
        let sessionConfig = {
          multiSession: true
        };// await getSessionConfig({ host, token });
        if (!sessionConfig.multiSession) {
          let dev = process.env.NODE_ENV === 'development';
          if (dev) {
            for (var key in req.sessionStore.sessions) {
              var item = req.sessionStore.sessions[key];
              if (JSON.parse(item).userId === userId) {
                delete req.sessionStore.sessions[key];
              }
            }
          } else {
            req.sessionStore.all(function (error, obj) {
              for (var key in obj) {
                if (obj[key].userId === userId) {
                  req.sessionStore.destroy(key, function () {});
                }
              }
            });
          }
        }
        resBody.ip = ip;
        resBody.tokenId = token;
        resBody.sessionTimeout = sessionConfig.sessionTimeout;
        res.status(200).json(resBody);
      }
    } catch (e) {
      setIPContinuousWrongNumber(ip, false);
      res.status(401).send(e);
    }
  });
  return router;
};
