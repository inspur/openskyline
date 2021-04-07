module.exports = function(options, context) {
  let express = require('express');
  let expressXmlParser = require('express-xml-parser');
  let bodyParser = require('body-parser');
  let router = express.Router();

  const controller = require('./controller');

  let xmlBodyParser = expressXmlParser({
    type: ['application/*'],
    explicitArray: false,
    normalize: false,
    normalizeTags: false,
    trim: true
  });

  router.post('/save-to-glance/:id', controller.saveToGlance);
  router.all('/*', controller.setResType);

    /**
     * 查询上传任务列表 - AWS.S3.listMulitpartUploads
     */
  router.get('/:bucket/', controller.listMultipartUploads);

  /**
   * 查询桶内所有文件上传进度 - 非AWS API.
   */
  router.get('/:bucket/all-file/upload-progress', controller.getAllFileUploadProgress);

    /**
     * 查询已上传分片信息 - AWS.S3.listParts.
     */
  router.get('/:bucket/:fileName', controller.listParts);

    /**
     * 创建分片上传任务 - AWS.S3.createMultipartUpload
     * 完成分片上传 - AWS.S3.completeMultipartUpload.
     */
  router.post('/:bucket/:fileName', xmlBodyParser, controller.createOrCompleteMultipartUpload);

    /**
     * 上传分片数据 - AWS.S3.uploadPart
     * 非分片上传 - AWS.S3.putObject
     */
  router.put('/:bucket/:fileName', controller.uploadPartOrPutObject);

    /**
     * 放弃分片上传任务 - AWS.S3.abortMultipartUpload.
     */
  router.delete('/:bucket/:fileName', controller.abortMultipartUpload);

  router.get('/:bucket/:fileName/concat-progress', controller.getFileConcatProgress);

  return router;
};
