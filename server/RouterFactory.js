const walk = require('walk');
const path = require('path');
const _ = require('underscore')._;
const logger = require('log4js').getLogger('RouterFactory');

const scan = function (router, folder, context) {
  const walker = walk.walkSync(path.join(global.DIR_NAME, folder), {
    followLinks: false,
    listeners: {
      file: function (root, stats, next) {
        let name = path.join(path.relative(folder, root), stats.name);
        let controller;
        try {
          controller = require(path.join(root, stats.name));
        } catch (e) {
          logger.error('Fail to load controller: ' + path.join(root, stats.name), e);
          next();
        }

        if (controller.enabled === false) {
          logger.info('Skip controller: ' + name);
          next();
        } else if (controller.routes) {
          _.each(controller.routes, function (item) {
            let methods = _.filter(['all', 'post', 'get'], function (method) {
              if (controller[method]) {
                let args = _.union([item.mapping], controller.middlewares && controller.middlewares() || [], [function (req, res, next) {
                  controller[method](req, res, {
                    html: item.html
                  });
                }]);
                router[method].apply(router, args);
                return true;
              }
              return false;
            });

            logger.info('Initialized controller: %s mapping: %s [ %s ]', name, item.mapping, methods);
          });

          next();
        } else {
          let mapping = controller.mapping || '/' + path.join(path.relative(folder, root), stats.name.replace(/\.js$/, ''));
          let methods = _.filter(['all', 'post', 'get'], function (method) {
            if (controller[method]) {
              let args = _.union([mapping], controller.middlewares && controller.middlewares(router) || [], [function (req, res, next) {
                controller[method](req, res, next);
              }]);
              router[method].apply(router, args);
              return true;
            }
            return false;
          });

          logger.info('Initialized controller: %s mapping: %s [ %s ]', name, mapping, methods);

          next();
        }
      }
    }
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    logger.error(nodeStatsArray)
    next();
  });
  walker.on("end", function () {
    console.log("all done");
  });
};

exports.mount = function (configurations, parentRouter, context) {
  _.each(configurations, function (configuration) {
    let router;
    let name = configuration['name'] || configuration['class'] || configuration['mapping'] || '';
    let filePath = configuration['class'] ? './' + path.join('routes', configuration['class']) : './routes/default';

    try {
      router = require(filePath)(configuration, context);
    } catch (e) {
      logger.error('Fail to load router: ' + filePath, e);
    }

    logger.info('Initialized router: %s mapping: %s', name, (configuration['mapping'] || '/'));

    if (configuration['scan']) {
      scan(router, configuration['scan'], context);
    }

    if (configuration['mapping']) {
      parentRouter.use(configuration['mapping'], router);
    } else {
      parentRouter.use(router);
    }
  });
};
