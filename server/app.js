const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const log4js = require('log4js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const httpProxy = require('http-proxy');
const _ = require('underscore');
const crypto = require('crypto');
const helmet = require('helmet');
const uuid = require('uuid');

//session
const session = require('express-session');
// const Redis = require('ioredis');
// const RedisStore = require('connect-redis')(session);
var FileStore = require('session-file-store')(session);

//constants
const Consts = require('../constants');

const context = require('./lib/Context').getCurrentContext();
//login state filter
const loginStateFilter = require('./lib/LoginStateFilter')();

const DEFAULT_SESSION_TIMEOUT_SECOND = 60 * 60;
//性能监控工具
// const easyMonitor = require('easy-monitor');

// const server = function (serverApp) {
log4js.configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'warn' },
  },
});

// easyMonitor('icm');

//设置项目部署根目录
let app = express();
// var compress = require('compression');
// app.use(compress());
// app.use(Consts.ROOT_URL, app);
//非/icm开头的路由重定向到/icm/
// app.use('/', function (req, res) {
//   return res.redirect(Consts.ROOT_URL + '/');
// });
//根目录
global.DIR_NAME = __dirname;
global.context = context;
let __DEV__ = process.env.NODE_ENV === 'development';
var ENV = 'dev';
if (__DEV__) {
  ENV = 'dev';
} else {
  ENV = 'prod';
}
app.locals.ENV = ENV;
context.setEnv(ENV);

process.on('uncaughtException', function (err) {
  log4js.getLogger("Global").error(err.stack || err);
  setTimeout(function () {
    process.exit(1);
  }, 100);
});

let VIEW_PATH = __DEV__ ? Consts.DEV_VIEWS : Consts.DIST_VIEWS;
//sever only
// VIEW_PATH = path.join(Consts.SERVER, 'views');
// if (__DEV__) {
app.disable('view cache');
// }
app.enable('trust proxy');
app.set('trust proxy', 1); // trust first proxy
app.disable('x-powered-by');
// view engine setup
app.set('views', VIEW_PATH);
// app.set('view engine', 'jade');
// app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

let nunjucksEnv = nunjucks.configure(VIEW_PATH, {
  autoescape: true,
  express: app,
  watch: __DEV__,
  noCache: __DEV__
});
// json formatting
nunjucksEnv.addFilter('safeJson', function (obj) {
});

// app.set('view engine', 'nunjucks');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../static', 'favicon.ico')));
let httpLogger = log4js.connectLogger(log4js.getLogger("http"), {
  level: 'auto',
  format: (req, res, format) => {
    return format(`:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`);
  }
});
app.use(httpLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
let sessionConf = {
  secret: 'chyingp',  // 用来对session id相关的cookie进行签名
  store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
  saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
  resave: false,  // 是否每次都重新保存会话，建议false
  rolling: true,
  cookie: {
    maxAge: DEFAULT_SESSION_TIMEOUT_SECOND * 1000
  }
};
const serviceObj = context.getResource('serviceAddr.json');
// let redisClient = new Redis(serviceObj.redis);
// sessionConf.store = new RedisStore({
//   client: redisClient
// });
// global.redisClient = redisClient;
app.use(session(sessionConf));
//临时中间件,迎合前端使用
app.use(/^.+\.(jsp|html)$/, function (req, res, next) {
  req.method = "GET";  //GET必须大写！！！no reason
  next();
});
app.use(loginStateFilter);

/**
 *  initialize proxy
 */
var proxyServer = httpProxy.createProxyServer();
context.setResource('proxy', proxyServer);
proxyServer.on("error", function (e) {
  log4js.getLogger("proxy").error(e.message);
});

app.use('/', function (req, res, next) {
  let sessionTimeout = DEFAULT_SESSION_TIMEOUT_SECOND * 1000;
  let now = new Date();
  if ('sessionTimeout' in req.session) {
    try {
      sessionTimeout = parseInt(req.session['sessionTimeout']) * 60 * 1000;
    } catch (e) {
      console.error(e);
    }
  }
  if (!('lastModified' in req.session)) { // session中没有lastModified则认为是一个新的session
    req.session['lastModified'] = now.getTime();
    req.session.save(() => {
      next();
    });
  } else {
    if (req.session['lastModified'] + sessionTimeout < now.getTime()) {
      req.session.regenerate(function () {
        // res.status(401); // 超时，需要重新登录
        // res.end();
        res.redirect('./login.html');
      });
    } else {
      req.session['lastModified'] = now.getTime();
      req.session.save(() => {
        next();
      });
    }
  }
});

// csrf filter
app.use('/', function (req, res, next) {
  let referer = req.headers.referer;
  // req.session.token
  let loginUrl = req.baseUrl ? (req.baseUrl + '/login.html#') : '/login.html#';
  if (typeof (referer) === "undefined") {
    next();
  } else {
    if (referer !== null && referer !== "") {
      let protocol = req.protocol;
      if (protocol === "wss" || protocol === "ws") {
        next();
      }
      let host = req.hostname;
      let originalUrl = protocol + "://" + host;
      if (referer.indexOf(originalUrl) === 0) {
        next();
      } else {
        if (referer.indexOf(`http://${host}`) === 0) {  // 如果是从http跳转过来的，则放行
          next();
        } else if (req.originalUrl.indexOf('://login.html')) {  // 如果是要访问登录页面，则放行
          next();
        } else {
          res.status(406);
          res.redirect(loginUrl);
          return;
        }
      }
    } else {
      next();
    }
  }
});
app.use(helmet());
//内容安全政策（CSP）
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self' 'unsafe-inline' 'unsafe-eval'"],
    styleSrc: ["'self' 'unsafe-inline'"],
    imgSrc: ["'self' data:"],
    connectSrc: ["https: http: wss: ws: data: 'unsafe-inline' 'unsafe-eval'"],
    fontSrc: ["'self' data:"],
    objectSrc: ["'self'"],
    mediaSrc: ["'self'"],
    frameSrc: ["http: https:"]
  }
}));
// XSS filter
//app.use(helmet.xssFilter());
// frame options
app.use(helmet.frameguard({ action: 'sameorigin' }));
// hide X-Powered-By
app.use(helmet.hidePoweredBy({ setTo: 'openskyline' }));
// 安全测试添加响应头设置安全字段
app.use('/', function (req, res, next) {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

//会话续期
app.use('/', function (req, res, next) {
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    if (!req.url.startsWith('/s3-api/rgw')) {
      // 对s3接口调用单独放开head方法，aws sdk业务需要
      res.status(403);
      res.end();
      return;
    }
  }
  if (!req.headers.polling && (req.session.token || req.session.ptoken)) {
    // req.session._garbage = Date.now();
    // req.session.touch();
  }
  next();
});

// CSRF防护
app.use('/', function (req, res, next) {
  // 设置x-csrf-token值，后面用于比较
  if (!req.session.hasOwnProperty('csrfToken')) {
    req.session['csrfToken'] = uuid.v1();
    req.session.save(() => {
      next();
    });
  } else {
    next();
  }
});

app.use('/', function (req, res, next) {
  // 检查POST、DELETE、PUT、PATCH方法的csrfToken
  if (['POST', 'DELETE', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
    if (!req.url.startsWith('/node-api/') && !req.url.startsWith('/s3-api/') && !req.url.startsWith('/storage-api/')) {
      const csrfToken = req.headers['x-csrf-token'];
      if (csrfToken !== req.session['csrfToken']) {
        res.status(401);
        res.end();
      } else {
        next();
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

// const replayAttackChecker = require('./routes/security/replayAttackChecker');
// 验证码请求使用image src的方式，无法增加header字段，只校验api/
// app.use([
//   '/api/',
//   '/custom-api/',
//   '/storage-api/'
// ], replayAttackChecker);

let defaultRouter = express.Router();
defaultRouter.get('/', function (req, res) {
  let indexUrl = req.baseUrl ? (req.baseUrl + '/index.html') : '/index.html';
  res.redirect(indexUrl);
});
app.use('/', defaultRouter);

//路由挂载
var routerFactory = require('./RouterFactory');
routerFactory.mount(context.getResource('routes.json'), app, context);
//未匹配的路由重定向到首页
// app.use('/', function (req, res) {
//   let indexUrl = req.baseUrl ? (req.baseUrl + '/index.html') : '/index.html';
//   res.redirect(indexUrl);
//   return '';
// });

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
// app.use(function (err, req, res) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   // render the error page
//   // res.status(err.status || 500);
//   let status = err.status || 500;
//   let result = {
//     message: err.message,
//     error: {},
//     status: err.status || 500,
//     ret: false
//   };

//   if (/\.json$/.test(req.path)) {
//     res.status(status).send(result);
//   } else {
//     res.status(status).render('error', result);
//   }
// });
// };

module.exports = app;
