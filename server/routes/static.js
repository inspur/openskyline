const constants = require('../../constants'),
    path = require('path');

module.exports = function( options ){
    var express = require('express');
    var router = express.Router();

    // app.use(staticPath, express.static('./static'));
    let __DEV__ = process.env.NODE_ENV === 'development';
    if (__DEV__) {
        router.use(constants.STATIC, express.static(path.join(constants.DEV, constants.STATIC)));
    } else {
        router.use(constants.STATIC, express.static(path.join(constants.DIST, constants.STATIC)));
    }
    // router.use('/',express.static(constants.WEB_ROOT_DIR));
    router.use('/', express.static(path.join(constants.ROOT_DIR, constants.PUBLIC)));

    return router;
}
