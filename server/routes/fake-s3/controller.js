const exec = require('child_process').exec;
let concat = require('file-concat-stream');
let fs = require('fs-extra');
let os = require('os');
let js2xmlparser = require("js2xmlparser");
let jsonfile = require('jsonfile');
let path = require('path');
let SparkMD5 = require('spark-md5');
let uuidv4 = require('uuid/v4');
const logger = require('log4js').getLogger('default');

const IMAGE_UPLOAD_DIR = os.tmpdir();
const IMAGE_UPLOAD_FILE_DATA = path.join(IMAGE_UPLOAD_DIR, 'file-data');
const IMAGE_UPLOAD_PART_DATA = path.join(IMAGE_UPLOAD_DIR, 'part-data');

/**
 * 设置响应格式
 */
function setResType(req, resp, next) {
  resp.type('application/xml'); // 设置响应格式为xml, aws-sdk需要
  next();
}

/**
 * 查询已上传分片信息 - AWS.S3.listParts.
 */
function listParts(req, resp) {
  let bucket = req.params.bucket;
  let fileName = req.params.fileName;
  let uploadId = req.query.uploadId;
  let maxParts = req.query['max-parts'];
    // 查询已上传分片 listParts
    // 查询并返回指定uploadId的已上传分片信息
  let partInfo = getPartInfoData(bucket, fileName, uploadId);
  let content = {
    Part: partInfo.Parts
  };
  resp.send(js2xmlparser.parse('listPartsResult', content));
};

/**
 * 获取所有文件的上传进度.
 */
function getAllFileUploadProgress(req, resp) {
  let bucket = req.params.bucket;
  let showDetail = req.query.detail || false;
  let uploads = getBucketUploads(bucket);
  let results = [];
  uploads.forEach((upload) => {
    let fileName = upload.Key;
    let uploadId = upload.UploadId;
    let uploaded = 0;
    let partInfo = getPartInfoData(bucket, fileName, uploadId);
    partInfo.Parts.forEach((part) => {
      uploaded += part.Size;
    });
    results.push({
      Key: fileName,
      Uploaded: uploaded,
      Parts: showDetail ? partInfo.Parts : []
    });
  });
  resp.header('Cache-Control', 'no-cache');
  resp.send(results);
}

/**
 * 创建分片上传任务 - AWS.S3.createMultipartUpload
 * 完成分片上传 - AWS.S3.completeMultipartUpload.
 */
function createOrCompleteMultipartUpload(req, resp) {
  let bucket = req.params.bucket;
  let fileName = req.params.fileName;
  if (req.query && req.query.hasOwnProperty('uploads')) {
        // 创建分片上传任务 - AWS.S3.createMultipartUpload
    let uploadId = uuidv4();
        // 保存上传任务
    addUploadTask(bucket, {
      Key: fileName,
      UploadId: uploadId,
      Initiated: (new Date()).getTime()
    });
    let content = {
      UploadId: uploadId
    };
    resp.send(js2xmlparser.parse('initMultipartUploadResult', content));
  } else {
        // 完成分片上传 - AWS.S3.completeMultipartUpload
    let uploadId = req.query.uploadId;
    let parts = req.body.CompleteMultipartUpload.Part;
    let spark = new SparkMD5();
    let dataPath = path.join(IMAGE_UPLOAD_PART_DATA, uploadId);
    let filePath = path.join(IMAGE_UPLOAD_FILE_DATA, bucket);
    fs.mkdirpSync(filePath);
    let partDataFileList = [];
        // TODO 检查PartNumber的排序
    parts.forEach(part => {
      let partNumber = part.PartNumber;
      partDataFileList.push(path.join(dataPath, partNumber + '.data'));
            // 通过分片etag计算文件etag
      let etag = part.ETag;
      spark.append(etag);
    });
    let fileEtag = spark.end();
        // TODO 分片数据etag校验
        // 合并生成文件 ? 大文件合并的场合会不会影响上传请求
        // 自己实现concat方法, 输出合并进度 单独提供合并进度的接口
        // TODO 有没有快速合并文件的方法、命令。。。
    concatFile(uploadId, partDataFileList, path.join(filePath, fileName), () => {
            // 清除上传信息
      // clearUploadInfo(bucket, uploadId);
    }, err => {
      logger.error('error concat part file', err.stack);
    });
        // 考虑文件合并可能需要较长时间 - 文件合并前提前返回
    resp.header('etag', fileEtag);
    let content = {
      Bucket: bucket,
      Key: fileName,
      ETag: fileEtag
    };
    resp.send(js2xmlparser.parse('completeMultipartUploadResult', content));
  }
}

/**
 * 查询文件合并进度.
 */
function getFileConcatProgress(req, resp) {
  let uploadId = req.query.uploadId;
  resp.type('application/json');
  let concatInfo = concatInfoMap[uploadId];
  resp.send(concatInfo);
}

/**
 * {
 *   'uploadId': {
 *     total: 20,
 *     concat: 10
 *   }
 * }
 */
let concatInfoMap = {};

function concatFile(uploadId, files, target, onSuccess, onError) {
  var writeStream = fs.createWriteStream(target);
  let concatInfo = {
    total: files.length,
    concat: 0
  };
  writeFiles(concatInfo, files.reverse(), writeStream, onSuccess, onError);
  concatInfoMap[uploadId] = concatInfo;
}

function writeFiles(concatInfo, files, writeStream, onSuccess, onError) {
  if (files.length) {
    var currentFile = files.pop();
    var readStream = fs.createReadStream(currentFile);
    readStream.pipe(writeStream, { end: false });
    readStream.on('error', onError);
    readStream.on('end', function onReadEnd() {
      concatInfo.concat++;
      writeFiles(concatInfo, files, writeStream, onSuccess, onError);
    });
  } else {
    writeStream.end();
    onSuccess();
  }
}

/**
 * 放弃分片上传任务 - AWS.S3.abortMultipartUpload.
 */
function abortMultipartUpload(req, resp) {
  let bucket = req.params.bucket;
  let fileName = req.params.fileName;
  let uploadId = req.query.uploadId;
    // 清除上传信息
  clearUploadInfo(bucket, uploadId);
  resp.send('');
}

/**
 * 上传分片数据 - AWS.S3.uploadPart
 * 非分片上传 - AWS.S3.putObject
 */
function uploadPartOrPutObject(req, resp) {
  let bucket = req.params.bucket;
  let fileName = req.params.fileName;
  let uploadId = req.query.uploadId;
  let partNumber = req.query.partNumber;
  let dataEnded = false;

  let size = 0;
  let spark = new SparkMD5.ArrayBuffer();
  if (uploadId && partNumber) {
        // 上传分片 - AWS.S3.uploadPart
    let dataPath = path.join(IMAGE_UPLOAD_PART_DATA, uploadId);
    fs.mkdirpSync(dataPath);
    let dataFilePath = path.join(dataPath, partNumber + '.data');
    let writeStream = fs.createWriteStream(dataFilePath);
    req.pipe(writeStream);
        // req.setTimeout(5000);
    req.on("data", (data) => {
            // 数据写入分片文件
            // writeStream.write(data)
      size += data.length;
      spark.append(data);
    }).on("end", () => {
            // 数据接收完毕
      dataEnded = true;
            // writeStream.close();
      let etag = spark.end();
      resp.header('etag', etag);
      resp.send('');
            // 记录分片完成信息
      let partInfo = {
        PartNumber: partNumber,
        ETag: etag,
        Size: size
      };
            // 保存分片信息
      addPartInfo(bucket, fileName, uploadId, partInfo);
    }).on("close", () => {
      if (!dataEnded) {
                // 连接关闭但数未收完 - 浏览器刷新或其他问题导致数据未发完
        logger.warn(`remove part file(req closed data not complete) ${bucket}-${fileName}-${partNumber}`);
        try {
          writeStream.close();
                    // fs.removeSync(dataFilePath);
        } catch (err) {
          logger.error(`req.close - error remove incomplete part file  ${bucket}-${fileName}-${partNumber}`, err.stack);
        }
      }
    }).on("error", (err) => {
      logger.warn(`error on upload part ${bucket}-${fileName}-${partNumber}`, err.stack);
      try {
        writeStream.close();
                // fs.removeSync(dataFilePath);
      } catch (err) {
        logger.error(`req.error - error remove incomplete part file  ${bucket}-${fileName}-${partNumber}`, err.stack);
      }
      resp.write(e.stack);
      resp.sendStatus(500);
    });
  } else {
        // 小文件直接上传 - AWS.S3.putObject
    let filePath = path.join(IMAGE_UPLOAD_FILE_DATA, bucket);
    fs.mkdirpSync(filePath);
    let writeStream = fs.createWriteStream(path.join(filePath, fileName));
    req.pipe(writeStream);
    req.on("data", (data) => {
            // 数据写入文件
            // writeStream.write(data)
      size += data.length;
      spark.append(data);
    }).on("end", () => {
            // writeStream.close();
      let etag = spark.end();
      resp.header('etag', etag);
      resp.send('');
    }).on("error", (err) => {
      writeStream.close();
      logger.error('error on put object', err.stack);
      resp.write(e.stack);
      resp.sendStatus(500);
    });
  }
}

/**
 * 查询桶上传任务列表 - AWS.S3.listMulitpartUploads
 */
function listMultipartUploads(req, resp) {
  let bucket = req.params.bucket;
  let isListMultipartUploads = req.query.hasOwnProperty('uploads');
  if (isListMultipartUploads) {
        // 获取桶上传任务列表
    let uploads = getBucketUploads(bucket);
    let content = {
      Bucket: bucket,
      Upload: uploads
    };
    resp.send(js2xmlparser.parse('listMultipartUploadsResult', content));
  } else {
        // 非上传相关接口
    resp.send('');
  }
};

/**
* 清除上传信息.
*
* @param {*} bucket
* @param {*} uploadId
*/
function clearUploadInfo(bucket, uploadId) {
    // 清空分片目录
  clearPartDataDirectory(uploadId);
    // 清除桶上传任务信息
  clearUploadTask(bucket, uploadId);
}

// JSON保存格式
let jsonOption = {
  spaces: 2,
  EOL: '\r\n'
};

/**
 * 初始化桶信息任务信息.
 */
function initBucketTaskInfoData(bucket) {
  let bucketTaskInfo = {
    Bucket: bucket,
    Uploads: []
  };
  writeBucketTaskInfo2Disk(bucket, bucketTaskInfo);
  return bucketTaskInfo;
}

/**
* 添加上传任务.
 *
 * 文件结构如下:
 * {
 *   Bucket: 'bucketName1',
 *   Uploads: [{
 *     Key: 'fileName1',
 *     UploadId: 'uploadId1',
 *     Initiated: 'init time'
 *   }, {
 *     Key: 'fileName2',
 *     UploadId: 'uploadId2',
 *     Initiated: 'init time'
 *   }]
 * }
*/
function addUploadTask(bucket, uploadInfo) {
  let bucketTaskInfo = getBucketTaskInfo(bucket);
  bucketTaskInfo.Uploads.push(uploadInfo);
  writeBucketTaskInfo2Disk(bucket, bucketTaskInfo);
}

/**
 * 获取桶任务信息 - 如果不存在则初始化并返回.
 */
function getBucketTaskInfo(bucket) {
  let bucketTaskInfo = readBucketTaskInfoFromDisk(bucket);
  if (!bucketTaskInfo) {
        // 初始化桶信息
    bucketTaskInfo = initBucketTaskInfoData(bucket);
  }
  return bucketTaskInfo;
}

/**
 * 获取桶上传任务列表.
 */
function getBucketUploads(bucket) {
  return getBucketTaskInfo(bucket).Uploads;
}

/**
* 清除桶上传任务信息.
*/
function clearUploadTask(bucket, uploadId) {
    // 上传任务集 - 清除任务信息
  let bucketTaskInfo = getBucketTaskInfo(bucket);
  let uploads = bucketTaskInfo.Uploads || [];
  for (let i = uploads.length - 1; i >= 0; i--) {
    let upload = uploads[i];
    if (upload.UploadId === uploadId) {
      uploads.splice(i);
    }
  }
  if (uploads.length > 0) {
    writeBucketTaskInfo2Disk(bucket, bucketTaskInfo);
  } else {
        // 该桶内无上传任务 - 磁盘删除任务文件
    removeBucketTaskInfoFromDisk(bucket);
  }
}

/**
 * 初始化上传分片信息.
 */
function initPartInfoData(bucket, fileName, uploadId) {
  let partInfoData = {
    Bucket: bucket,
    Key: fileName,
    Parts: []
  };
  writePartInfo2Disk(uploadId, partInfoData);
  return partInfoData;
}

/**
 * 添加分片信息.
 *
 * 文件结构
 * {
 *   Bucket: 'bucketName1',
 *   Key: 'fileName1',
 *   Parts: [{
 *     PartNumber: 1,
 *     ETag: 'etag',
 *     Size: '200'
 *   }, {
 *     PartNumber: 2,
 *     ETag: 'etag',
 *     Size: '201'
 *   }]
 * }
 */
function addPartInfo(bucket, fileName, uploadId, partInfo) {
  let partInfoData = getPartInfoData(bucket, fileName, uploadId);
  partInfoData.Parts.push(partInfo);
  writePartInfo2Disk(uploadId, partInfoData);
}

/**
* 获取上传分片信息 - 如果不存在则初始化并返回.
*/
function getPartInfoData(bucket, fileName, uploadId) {
    // 添加分片上传任务
  let uploads = getBucketUploads(bucket);
    // 检查当前uploadId是否有上传记录 - 无则添加
  let hasRecord = false;
  uploads.forEach((uploadTask) => {
    if (uploadTask.UploadId === uploadId) {
      hasRecord = true;
    }
  });
  if (!hasRecord) {
    let uploadInfo = {
      Key: fileName,
      UploadId: uploadId,
      Initiated: (new Date()).getTime()
    };
        // 保存上传任务
    addUploadTask(bucket, uploadInfo);
  }

  let partInfoData = readPartInfoFromDisk(uploadId);
  if (!partInfoData) {
        // 初始化上传分片信息
    partInfoData = initPartInfoData(bucket, fileName, uploadId);
  }
  return partInfoData;
}

/**
* 清空分片目录.
*/
function clearPartDataDirectory(uploadId) {
  let dataPath = path.join(IMAGE_UPLOAD_PART_DATA, uploadId);
    // 清空文件分片目录
  fs.emptyDir(dataPath).then(() => {
    fs.rmdir(dataPath).catch(err => {
      logger.error('error delete part data directory', err.stack);
    });
  }).catch(err => {
    logger.error('error empty part data directory', err.stack);
  });
    // 删除分片信息文件
  removePartInfoFromDisk(uploadId);
}

/**
 * 磁盘读取桶任务信息.
 */
function readBucketTaskInfoFromDisk(bucket) {
  let bucketTaskInfoFilePath = path.join(IMAGE_UPLOAD_DIR, `${bucket}-task.json`);
  let bucketTaskInfo = null;
  try {
    if (fs.existsSync(bucketTaskInfoFilePath)) {
      bucketTaskInfo = jsonfile.readFileSync(bucketTaskInfoFilePath);
    }
  } catch (err) {
    logger.error('error read bucket task info from disk', err.stack);
  }
  return bucketTaskInfo;
}

/**
 * 保存桶任务信息到磁盘.
 */
function writeBucketTaskInfo2Disk(bucket, bucketTaskInfo) {
  let bucketTaskInfoFilePath = path.join(IMAGE_UPLOAD_DIR, `${bucket}-task.json`);
  try {
    jsonfile.writeFileSync(bucketTaskInfoFilePath, bucketTaskInfo, jsonOption);
  } catch (err) {
    logger.error('error writing bucket task info to disk', err.stack);
  }
}

/**
 * 磁盘删除桶任务信息.
 */
function removeBucketTaskInfoFromDisk(bucket) {
  let bucketTaskInfoPath = path.join(IMAGE_UPLOAD_DIR, `${bucket}-task.json`);
  try {
    fs.removeSync(bucketTaskInfoPath);
  } catch (err) {
    logger.error('error remove bucket info from disk', err.stack);
  }
}

/**
 * 磁盘读取分片信息.
 */
function readPartInfoFromDisk(uploadId) {
  let partInfoFilePath = path.join(IMAGE_UPLOAD_PART_DATA, `${uploadId}.json`);
  let partInfoData = null;
    // 磁盘读取分片信息
  try {
    if (fs.existsSync(partInfoFilePath)) {
      partInfoData = jsonfile.readFileSync(partInfoFilePath);
    }
  } catch (err) {
    logger.error('error read part info from disk', err.stack);
  }
  return partInfoData;
}

/**
 * 保存分片信息到磁盘.
 */
function writePartInfo2Disk(uploadId, partInfoData) {
  let partInfoFilePath = path.join(IMAGE_UPLOAD_PART_DATA, `${uploadId}.json`);
  try {
    jsonfile.writeFileSync(partInfoFilePath, partInfoData, jsonOption);
  } catch (err) {
    logger.error('error writing part info to disk', err.stack);
  }
}

/**
 * 磁盘删除分片信息.
 */
function removePartInfoFromDisk(uploadId) {
  let partInfoFilePath = path.join(IMAGE_UPLOAD_PART_DATA, `${uploadId}.json`);
  try {
    fs.removeSync(partInfoFilePath);
  } catch (err) {
    logger.error('error remove part info from disk', err.stack);
  }
}

/**
* 配置文件、数据目录双向信息校对.
*/
function validConfigData() {
    // TODO 配置文件、数据目录双向信息校对
  logger.info('validConfigData');
    // 这个步骤是必要的-考虑服务端宕机数据文件部分写入的情况 - 比较常见(正在上传ctrl+C关闭服务端城乡)
    // TODO 是否要考虑配置文件部分写入的情况？概率较小暂时可以忽略
}

/**
 * 保存镜像文件的virtual size信息
 */
function saveImageGlanceVirtualSize(req, resp) {
  return new Promise(function(resolve, reject) {
    const Consts = require('../../constants');
    const request = require('request');
    const session = req.session;
    const id = req.params.id;
    const bucketName = req.body.bucketName;
    const fileName = req.body.fileName;
    const platform = os.platform();
    const filePath = `${IMAGE_UPLOAD_FILE_DATA}/${bucketName}/${fileName}`;
    let cmd = '';
    if (platform === 'linux') {
      cmd = 'exec /usr/bin/qemu-img';
    } else if (platform === 'win32') {
      cmd = path.resolve(__dirname, '..\\..\\lib\\qemu-img\\win32\\qemu-img.exe');
    } else if (platform === 'darwin') {
      cmd = 'qemu-img';
    }
    cmd = `${cmd} info ${filePath}`;
    exec(cmd, function (error, stdout, stderr) {
      if (error) {
        logger.error(error);
        resolve();
      } else {
        let reg = /virtual size: .* \((\d*) bytes\)/;
        let matches = stdout.match(reg);
        if (matches === null) {
          logger.error('cmd get qemu-img info cannot match virtual size.');
          resolve();
        } else {
          let endpoint = session[Consts.KEY_SERVICES]['glance'];
          let options = {
            url: `${endpoint}/v2/images/${id}`,
            method: 'patch',
            body: JSON.stringify([{
              "op": "add",
              "path": "/inspur_virtual_size",
              "value": `${matches[1]}`
            }]),
            headers: {
              'Content-Type': 'application/openstack-images-v2.1-json-patch',
              'auth-token': session[Consts.KEY_TOKEN],
              'X-Auth-Token': session[Consts.PROJECT_TOKEN],
              'language': session[Consts.KEY_LANGUAGE]
            }
          };
          request(options, (error, response, body) => {
            console.log('error:', error);
            console.log('body:', body);
            resolve();
          });
        }
      }
    });
  });
}

/**
 * 保存至Glance后端，与s3无关，保存后文件删除
 */
async function saveToGlance(req, resp) {
  const Consts = require('../../constants');
  const request = require('request');
  const session = req.session;
  await saveImageGlanceVirtualSize(req);  // 获取并保存virtual size
  const id = req.params.id;
  const uploadId = req.body.uploadId;
  const bucketName = req.body.bucketName;
  const fileName = req.body.fileName;
  let endpoint = session[Consts.KEY_SERVICES]['glance'];
  let options = {
    url: `${endpoint}/v2/images/${id}/file`,
    method: Consts.PUT,
    headers: {
      'Content-type': 'application/octet-stream',
      'auth-token': session[Consts.KEY_TOKEN],
      'X-Auth-Token': session[Consts.PROJECT_TOKEN],
      'language': session[Consts.KEY_LANGUAGE]
    }
  };
  const filePath = `${IMAGE_UPLOAD_FILE_DATA}/${bucketName}/${fileName}`;
  let readStream = fs.createReadStream(filePath);
  let httpreq = request(options, function(error, response, body) {
    if (!error && (response.statusCode === 200 || response.statusCode === 204)) {
      logger.info(`Save to glance successfully. Image Id: ${id}`);
    } else {
      logger.warn(`Save to glance failed. Image Id: ${id}`);
    }
  });
  readStream.pipe(httpreq);
  readStream.on('end', function() {
    fs.unlink(filePath, function(err) {
      if (err) {
        logger.warn('Unlink ' + filePath + ' Failed');
      } else {
        logger.info('Unlink ' + filePath + ' Success');
      }
    });
    if (uploadId !== undefined) {
      clearUploadInfo(bucketName, uploadId);
    }
  });
  resp.json({
    [Consts.KEY_FLAG]: true
  });
}

validConfigData();
module.exports = {
  setResType,
  listParts,
  createOrCompleteMultipartUpload,
  abortMultipartUpload,
  uploadPartOrPutObject,
  listMultipartUploads,
  getFileConcatProgress,
  getAllFileUploadProgress,
  saveToGlance
};
