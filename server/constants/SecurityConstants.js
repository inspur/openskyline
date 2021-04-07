module.exports = {
    // 重放攻击检查
    REQ_IDENTIFIER: 'req-identifier'
  , KEY_IDENTIFIER_LIST: 'identifier-list'
  , MAX_TIME_DIFF_SEC: 5 * 60 // 最大时间戳差值
  , MAX_IDENTIFIER_LIFE_SEC: 5 * 60 // 标识最大保存时间
  , KEY_CLIENT_SERVER_TIME_DIFF: 'client-server-time-diff' // 客户端 服务器时间差
};
