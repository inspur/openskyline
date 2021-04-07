module.exports = function(options, context) {
    const logger = require('log4js').getLogger('GetServiceAddr');
    const router = require('express').Router();
    //constants
    let serviceAddr = context.getResource('serviceAddr.json');

    ///^(\/login\/|\/index\/)*/
    router.all('/', function(req, res) {
        res.json(serviceAddr);
    });


    return router;
};
