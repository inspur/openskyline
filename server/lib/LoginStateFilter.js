module.exports = function () {
  //登录拦截器
  // create an auth filter
  const filter = require('express-authfilter').create({
    // private zone, true for white list mode
    deny: [
      '/',
      '/index.html',
      'virtual-resource.html',
      'digitalVisualizationScreen.html',
      '/forceModifyPassword.html'
    ],
    // public zone
    allow: [ //白名单
      '/login.html',
      '/loginWithToken.html',
      '/timeout.html',
      '/__webpack_hmr',
      /^\/static\/[a-z0-9_\-\/.%]+/i,
      '/error.html',
      /^\/login-api\/[a-z0-9_\-\/.%]+/i,
      /^\/api\/[a-z0-9_\-\/.%]+/i,
      /^\/node-api\/[a-z0-9_\-\/.%]+/i,
      /^\/custom-api\/[a-z0-9_\-\/.%]+/i,
      /^\/pim-api\/[a-z0-9_\-\/.%]+/i,
      /^\/s3-api\/[a-z0-9_\-\/.%]+/i,
      /^\/storage-api\/[a-z0-9_\-\/.%]+/i,
      /^\/webSocket\/[a-z0-9_\-\/.%]+/i,
      /^.+\.js/g,
      /^.+\.css/g,
      /^.+\.jpg/g,
      /^.+\.jpeg/g,
      /^.+\.png/g,
      /^.+\.gif/g,
      /^.+\.ico/g,
      /^.+\.woff/g,
      /^.+\.woff2/g,
      /^.+\.ttf/g,
      /^.+\.do/g,
      /^.+\.mp3/g,
      /^.+\.map/g,
      /^.+\.html/g

    ],
    // check user login state
    check: function (req, res) {
      return Boolean(req.session.token);
    },
    // login method
    login: function (req, res) {
      let loginUrl = req.baseUrl ? (req.baseUrl + '/login.html') : '/login.html';
      res.redirect(loginUrl + "?__=" + new Date().getTime());
    }
  });

  return filter;
};
