/**
 * 安全基线需求.
 * 48286 鉴权及访问控制
 * 外部接口采用时间戳、随机数等方案，防止常见重放攻击。（常见重放类攻击主要包括各类网络管理协议的身份鉴别信息重放攻击等）
 */
const logger = require('log4js').getLogger('Replay-Attack-Checker');
const Consts = require('../../constants');
const crypto = require('crypto');

module.exports = function(req, res, next) {
  let reqIdentifier = getReqIdentifier(req);
  if (reqIdentifier !== '') {
    let decryptedReqIdentifier = '';
    try {
      // base64解码
      let reqIdentifierBuffer = Buffer.from(reqIdentifier, 'base64');
      // RSA私钥解密
      decryptedReqIdentifier = crypto.privateDecrypt(privateKey, reqIdentifierBuffer).toString(STR_ENCODE);
    } catch (error) {
      // 请求标识解密失败的场景
      logger.warn('Replay attack error', error.stack);
      replayAttackDetected(req, res, 'invalide req idnetifier - decode & decrypt');
    }
    if (decryptedReqIdentifier) {
      let seperatorIndex = decryptedReqIdentifier.indexOf('_');
      if (seperatorIndex > -1) {
        let ts = Number.parseInt(decryptedReqIdentifier.substring(0, seperatorIndex));
        let identifier = decryptedReqIdentifier.substring(seperatorIndex + 1);
        if (ts && identifier) {
          if (!isMaxTimeDiffExceeded(req, ts) &&
              !isIdentifierUsed(req, identifier)) {
            cacheIdentifier(req, identifier, () => {
              next();
            });
          } else {
            if (isIdentifierUsed(req, identifier)) {
              replayAttackDetected(req, res, `identifier used: ${identifier}`);
            } else {
              replayAttackDetected(req, res, 'max time diff exceeded');
            }
          }
        } else {
          replayAttackDetected(req, res, 'invalid req identifier - no ts identifier');
        }
      } else {
        replayAttackDetected(req, res, 'invalid req identifier - no seperator');
      }
    } else {
      replayAttackDetected(req, res, 'invalide req idnetifier - decode & decrypt');
    }
  } else {
    replayAttackDetected(req, res, 'req identifier not found');
  }
};

/**
 * 获取请求标识.
 */
function getReqIdentifier(req) {
  let reqIdentifier = req.query['reqIdentifier'] || req.headers[Consts.REQ_IDENTIFIER] || '';
  return reqIdentifier;
}

/**
 * 检测到重放攻击.
 */
function replayAttackDetected(req, res, msg) {
  logger.warn('Replay attack detected', req.url);
  logger.warn(msg);
  res.status(403);
  res.write('Replay attack detected', req.url);
  res.end();
}

/**
 * 初始化客户端服务器时间差.
 * 引入客户端服务器时间差（服务器当前时间与第一个合法请求时间戳的差值）
 * 避免时区等问题
 */
function initClientServerTimeDiff(req, ts) {
  let session = req.session;
  if (session[Consts.KEY_CLIENT_SERVER_TIME_DIFF] === undefined) {
    let diff = getServerTimeStamp() - ts;
    logger.warn('init replay attack client server time diff', diff);
    session[Consts.KEY_CLIENT_SERVER_TIME_DIFF] = diff;
  }
}

/**
 * 判断时间戳是否超过允许时间差.
 */
function isMaxTimeDiffExceeded(req, ts) {
  let session = req.session;
  let diff = session[Consts.KEY_CLIENT_SERVER_TIME_DIFF];
  if (diff === undefined) {
    initClientServerTimeDiff(req, ts);
    return false;
  }
  let serverTs = getServerTimeStamp();
  return Math.abs(serverTs - diff - ts) > Consts.MAX_TIME_DIFF_SEC;
}

/**
 * 判断请求标识是否在MAX_IDENTIFIER_LIFE_SEC时间内使用过.
 */
function isIdentifierUsed(req, identifier) {
  let identifierList = getIdentifierList(req);
  let hasUsed = false;
  for (let i = 0; i < identifierList.length; i++ ) {
    let item = identifierList[i];
    if (item.id === identifier) {
      hasUsed = true;
      break;
    }
  }
  return hasUsed;
}

let identifierListCache = [];
let lastSaveSessionTime = (new Date()).getTime();
let saveSessionInterval = 500; // ms

/**
 * 缓存请求标识
 * 为解决频繁存session存在的保存丢失问题，先在内存中缓存，定期保存到session.
 * 多节点部署场景下保存到session后及实现多节点的数据拉通
 */
function cacheIdentifier(req, identifier, callback) {
  let serverTs = getServerTimeStamp();
  identifierListCache.push({
    id: identifier,
    ts: serverTs
  });
  // logger.info('req.url', req.url);
  // logger.info('identifier', identifier);
  // logger.info('identifierListCache', identifierListCache);
  saveIdentifierListToSession(req, callback);
}

/**
 * 读取请求标识列表 - session+缓存. 
 */
function getIdentifierList(req) {
  return getIdentifierListFromSession(req).concat(identifierListCache);
}

/**
 * 从session读取请求标识列表.
 */
function getIdentifierListFromSession(req) {
  let session = req.session;
  if (!session[Consts.KEY_IDENTIFIER_LIST]) {
    session[Consts.KEY_IDENTIFIER_LIST] = [];
  }
  let identifierList = session[Consts.KEY_IDENTIFIER_LIST];
  return identifierList.map((item) => {
    return item;
  });
}

/**
 * 保存请求标识列表到session.
 */
function saveIdentifierListToSession(req, callback) {
  let curTime = (new Date()).getTime();
  if (curTime - lastSaveSessionTime > saveSessionInterval) {
    let serverTs = getServerTimeStamp();
    let identifierList = req.session[Consts.KEY_IDENTIFIER_LIST] || [];
    // 过滤掉超期的请求标识
    identifierList = identifierList.filter((item) => {
      return serverTs - item.ts < Consts.MAX_IDENTIFIER_LIFE_SEC;
    });
    identifierList = identifierList.concat(identifierListCache);
    req.session[Consts.KEY_IDENTIFIER_LIST] = identifierList;
    req.session.save(() => {
      identifierListCache = [];
      lastSaveSessionTime = curTime;
      // logger.info('save session', identifierList);
      callback();
    });
  } else {
    callback();
  }
}

/**
 * 获取当前服务器时间戳.
 */
function getServerTimeStamp() {
  let ts = Math.floor((new Date()).getTime() / 1000);
  return ts;
}

// 加密输入输出字符集
const STR_ENCODE = 'latin1';
// 请求标识解密私钥
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCvLS40rcyrWWVaNDZ3hlVUNnXv/NgxQ0E58jL9a5rPEY3SmSLM
sHP78+hU6dP3hAV0sLE+XlVwuHg6nnpR8rdp5YCFUZ8gJt3tCnAuqHb7o2gdfF/4
h8YI/AacYTvmhuykJ4tcWUuaevV/tY+bvxQUOYWoMfYUE6d4nXZpJNxiTQIDAQAB
AoGAQ33iyYUU0AfXVtO7EH3/Ljz1X4tJOGGzJcI9BwqIULNwsu0xTS/G4BHvN5gH
hNumxni1MVRjEtTf7aXVdvFO3Khf5YyqQ0aALHt/5GS7enyWvMjUvr+gzNOgMHqv
D7Un8Q58162gWSs0e4l/OVlZ6IrjTzcJq9aG312WrhS6zQECQQDkHYpFZyJaNyLt
O7V4j09sHlRCo5WxBNMsO5NgUTQ+w74Wkxhxg2pr/Ovd3GLWsAaaZjSx73tpLgxa
59JPXJzhAkEAxJcDRktq50f2ldnGQSmFUtUjMzDsb7Xe4P+IJzmhtpKkbK9JLDek
wioWRBL7qirkjVdavPMpcXzzxJ1at83m7QJAevE0yWzpRcf7ifIpPt22B2ZdMUEq
9ynLikZdioaZas5iT5ZdkSgrniHFGWCi4GQkWuiEs/WHBMvtmrzgSyd14QJAQQ0P
YlVWXI2thMx5E9rfaRdp/Gh19EkkJSOpNAGYB0fi7Kvb9Ku88xrmH0SAzkA/PJ3p
Qpjb39fO+gJvoF6byQJAbg26o0oKugr7X3/1Y7HrTvXhoLJYrKY6vOnsIv81Hkgw
E/PoEmvFykFcWpqW8ew8QCLjCA7iBeXCgF6Xdmjb/g==
-----END RSA PRIVATE KEY-----`;
