var fs = require('fs'),
  logger = require('log4js').getLogger('Global');

var currentContext = {
  _resource: {},
  _env: 'prod',
  setEnv: function (env) {
    logger.info('Set Environment ' + env);
    currentContext._env = env;
  },

  setResource: function (name, value) {
    return currentContext._resource[name] = value;
  },

  getResource: function (name) {
    var context = currentContext,
      content;
    if (context._resource[name]) {
      return context._resource[name];
    } else {
      try {

        var fileDefaultName = global.DIR_NAME + '/resources/default/' + name;
        var fileEnvName = global.DIR_NAME + '/resources/' + context._env + '/' + name;

        var fileName = fs.existsSync(fileEnvName) ? fileEnvName : fs.existsSync(fileDefaultName) ? fileDefaultName : '';

        logger.info('Loading resource ' + fileName);

        if (fileName) {
          content = fs.readFileSync(fileName);

          if (/\.json/.test(name)) {
            content = JSON.parse(content);
          }

          context._resource[name] = content;

        } else {
          logger.error('No such resource: ' + fileEnvName);
        }
      } catch (e) {
        logger.error('Error in loading resource: ' + name + ',' + e.message)
      }

      return content;
    }
  }
};

exports.getCurrentContext = function () {
  return currentContext;
};
