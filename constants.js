/*
 常量
 */
var path = require('path');

var DIR_NAME = __dirname;

exports.DEV = path.join(DIR_NAME, 'dev');
exports.DEV_VIEWS = path.join(DIR_NAME, 'dev/views/');
exports.DIST = path.join(DIR_NAME, 'dist');
exports.DIST_VIEWS = path.join(DIR_NAME, 'dist/views/');
/*
 视图目录
 */
exports.SERVER = path.join(DIR_NAME, 'server');
exports.VIEWS = path.join(DIR_NAME, 'views');
exports.STATIC = '/static';
/*
    对外服务根目录，非编译文件
 */
exports.PUBLIC = '/public';

/*
 程序根目录
 */
exports.ROOT_DIR = DIR_NAME;
/*
 临时编译目录
 */
exports.BUILD_DIR = path.join(DIR_NAME, 'target');

exports.SRC_DIR = path.join(DIR_NAME, 'src');

exports.ARTIFACT_ID = 'inspur-git';

exports.ROOT_URL = '/';

exports.ASSETS = path.join(DIR_NAME, 'src/assets');
exports.LIB = path.join(DIR_NAME, 'static/lib');
