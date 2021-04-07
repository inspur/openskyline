module.exports = function(options, context) {
    const logger = require('log4js').getLogger('DownloadReport');
    const urlApi = require('url');
    const router = require('express').Router();
    //Consts
    const Consts = require('../../constants');
    const request = require('request');
    const uuid = require('uuid');

    router.use('/', function(req, res) {
        /*res.set({
            headers[Consts.KEY_CONTENT_TYPE]: "application/octet-stream"
        });*/
        let traceId = 'req-'+uuid.v1();
        let session = req.session;
        let fields = req.fields;
        let qParam = req.query;
        let taskId = qParam["taskId"];
        let fileNameTemp = qParam["taskName"] + ".xlsx";
        fileNameTemp =encodeURI(fileNameTemp);
        let restUrl = "v1/report/download_excel?task_id=" + taskId;
        if (!restUrl.startsWith('/') ) {
            restUrl = '/' + restUrl;
        }
        let moduleName = restUrl.split('/')[1];
        let host = session[Consts.KEY_SERVICES]["leo"];

        let options = {
            url: urlApi.resolve(host, restUrl),
            //if you expect binary data, you should set encoding: null
            encoding : null, //让body 直接是buffer
            method: Consts.GET,
           // json: true,
          //  body: {},
          //  qs: qsParam,
            headers: {
              [Consts.KEY_CONTENT_TYPE]: 'application/json; charset=utf-8',
              // [Consts.KEY_ACCEPT]: 'application/octet-stream; charset=utf-8',
              'auth-token': session[Consts.KEY_TOKEN],
              'X-Auth-Token': session[Consts.PROJECT_TOKEN],
              'language': session[Consts.KEY_LANGUAGE],
              'X-Openstack-Request-Id': traceId
            }
        };

        request(options).on("response", function(response){
            if(response.statusCode==200){
                res.setHeader(Consts.KEY_CONTENT_TYPE,"application/octet-stream");
                res.attachment(decodeURI(fileNameTemp));
                response.on("data", function(data){
                    res.write(data, "binary");
                 });
                 response.on("end", function(){
                    res.end();
                 });
                 recordLog();
                function recordLog() {
                  let logHost = session[Consts.KEY_SERVICES]['keystone'];
                  let o = {
                    url: logHost + "/v3/inspur/logs",
                    method: Consts.POST,
                    json: true,
                    body: {},
                    qs: {},
                    headers: {
                      [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
                      [Consts.KEY_ACCEPT]: Consts.ACCEPT,
                      'language': session[Consts.KEY_LANGUAGE] || "",
                      'X-Auth-Token':session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || "")
                    }
                  }
                  let date = new Date();
                  let time = date.getTime()+date.getTimezoneOffset()*60*1000;
                  let projectId = req.cookies.pid;
                  let roleType = req.cookies.roleType;
                  o.body = {
                    logs:[{
                      user_name: session[Consts.KEY_USER_NAME],
                      user_id:session[Consts.KEY_USER_ID],
                      region_id:req.cookies.region_id?req.cookies.region_id:"",
                      project_id:projectId?(roleType==0?"":projectId):"",
                      target:"Report",
                      log_level:"info",
                      ip:session[Consts.KEY_IP],
                      create_time:time,
                      description:"Download report: " + qParam["taskName"],
                      language:"en",
                      trace_id: traceId
                    }, {
                      user_name: session[Consts.KEY_USER_NAME],
                      user_id:session[Consts.KEY_USER_ID],
                      region_id:req.cookies.region_id?req.cookies.region_id:"",
                      project_id:projectId?(roleType==0?"":projectId):"",
                      target:"报表",
                      log_level:"信息",
                      ip:session[Consts.KEY_IP],
                      create_time:time,
                      description:"下载报表: " + qParam["taskName"],
                      language:"zh_cn",
                      trace_id: traceId
                    }]
                  }
                  request(o, function () {})
                }
            }else{
                res.json({
                    [Consts.KEY_FLAG]: false,
                    [Consts.KEY_ERRCODE]: response.statusCode,
                    [Consts.KEY_RESDATA]: ''
                });
            }
        });
    });

    return router;
};
