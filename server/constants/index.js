const LoginConstants = require('./LoginConstants');
const ResultConstants = require('./ResultConstants');
const SessionConstants = require('./SessionConstants');
const RestConstants = require('./RestConstants');
const SecurityConstants = require('./SecurityConstants');
module.exports =
  Object.assign(
      {},
      LoginConstants,
      ResultConstants,
      SessionConstants,
      RestConstants,
      SecurityConstants
  );
