import crypto from 'crypto';
import uuid from 'uuid';

// 加密输入输出字符集
const STR_ENCODE = 'latin1';
// 请求标识加密公钥
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCvLS40rcyrWWVaNDZ3hlVUNnXv
/NgxQ0E58jL9a5rPEY3SmSLMsHP78+hU6dP3hAV0sLE+XlVwuHg6nnpR8rdp5YCF
UZ8gJt3tCnAuqHb7o2gdfF/4h8YI/AacYTvmhuykJ4tcWUuaevV/tY+bvxQUOYWo
MfYUE6d4nXZpJNxiTQIDAQAB
-----END PUBLIC KEY-----`;

/**
 * 生成请求标识信息RSA(identifier_timestamp).
 */
function genReqIdentifier() {
  let ts = Math.floor((new Date()).getTime() / 1000);
  let id = uuid.v4().replace(/-/g, ''); // 去掉连接符节省长度
  let reqId = `${ts}_${id}`;
  // RSA公钥加密加密, base64编码为了web传输
  let encrypted = crypto.publicEncrypt(publicKey, Buffer.from(reqId, STR_ENCODE)).toString('base64');
  return encrypted;
}

module.exports = {
  genReqIdentifier
};
