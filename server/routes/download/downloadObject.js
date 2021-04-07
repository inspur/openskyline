module.exports = function(options, context) {
    const logger = require('log4js').getLogger('DownloadObject');
    const urlApi = require('url');
    const router = require('express').Router();
    //Consts
    const Consts = require('../../constants');
    const request = require('request');

    router.get('/', function(req, res) {
        /*res.set({
            headers[Consts.KEY_CONTENT_TYPE]: "application/octet-stream"
        });*/
        let session = req.session;
        let fields = req.fields;
        let qParam = req.query;
        let language = qParam["language"];
        let containerName = qParam["containerName"];
        let fileNameTemp = qParam["objectName"];
        let projectId = qParam["projectId"];
        fileNameTemp =encodeURI(fileNameTemp);
        containerName = encodeURI(containerName);
        projectId = encodeURI(projectId);
        let restUrl = "/swift/v1/" + projectId + "/" + containerName + "/" + fileNameTemp;
        //let restUrl = "/swift/v1/wdq";
        if (!restUrl.startsWith('/') ) {
            restUrl = '/' + restUrl;
        }
        let moduleName = restUrl.split('/')[1];
        let host = session[Consts.KEY_SERVICES][moduleName];

        /*let qsParam = {
            "id": fujianId,
            "ciId": ciid,
            "model": model,
            "ciName": ciName,
        };*/

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
                [Consts.KEY_ACCEPT]: 'application/octet-stream; charset=utf-8',
                'auth-token': session[Consts.KEY_TOKEN],
                'X-Auth-Token': session[Consts.PROJECT_TOKEN],
                'language': session[Consts.KEY_LANGUAGE]
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
            }else{
                res.json({
                    [Consts.KEY_FLAG]: false,
                    [Consts.KEY_ERRCODE]: 'reqTimeout',
                    [Consts.KEY_RESDATA]: ''
                });
            }
        });
    });

    return router;
};
