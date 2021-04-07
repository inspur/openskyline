import crypto from 'crypto';
import uuid from 'uuid';
import { genReqIdentifier } from './reqIdentifier';
;
(function () {
  var vueAjax = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  vueAjax.config = {};
  vueAjax.install = function (Vue) {
    if (vueAjax.installed) {
      return;
    }
    vueAjax.installed = true;
    let defaultOpts = {
      type: '',
      data: {},
      url: '',
      dataType: "json",
      contentType: "application/json;",
      confirmMsg: "", // 执行操作前的确认消息
      cancelFun: null,
      successMsg: "", // 操作执行成功的提示消息
      showErrMsg: true, // 是否显示错误消息
      isStrongConfig: false,
      errorKey: "error",
      errFun: null,
      successFun: null,
      log: null,
      polling: false, //是否是轮询请求
      regionId: "", //regionId
      logout: true, //代表如果返回错误码401就退出登陆
      storageSpecial: "" //这个参数是删除项目是调用对象存储删除的接口专用的，其他接口均不得使用(含泪添加。。)
    };
    Vue.ajax = function (options) {
      const requestId = options.headers && options.headers['X-Openstack-Request-Id'] ? options.headers['X-Openstack-Request-Id'] : genRequestId();
      if (options.url !== "node-api/keystone/recordLog" &&
        options.url !== "node-api/logout" && Vue.pid_roleType && Vue.region &&
        (Vue.pid_roleType !== (this.$cookie.get("pid") + "&" + this.$cookie.get("roleType")) ||
          Vue.region !== this.$cookie.get("region_id"))
      ) {
        document.location.href = "index.html";
        return;
      }
      Vue.Progress.hide();
      Vue.Progress.start();
      let self = this;
      let sid = digest((Vue.userId || "") + (this.$cookie.get("pid") || '') + (Vue.roleType === undefined ? '' : Vue.roleType) + (Vue.roleId === undefined ? '' : Vue.roleId));
      options = $.extend(true, {}, defaultOpts, options, {
        headers: {
          sid: sid,
          'x-csrf-token': Vue.csrfToken,
          'X-Openstack-Request-Id': requestId,
          'Req-Identifier': genReqIdentifier()
        }
      });
      let { confirmMsg, successMsg, showErrMsg, isStrongConfig, params, successFun, errorKey, errFun, errCluTmpFun, log, logout, polling, regionId, storageSpecial, ...ajaxOpts } = options;
      if (polling || regionId || storageSpecial) { //轮询请求
        ajaxOpts.beforeSend = function (xhr) {
          if (polling) {
            xhr.setRequestHeader('polling', "polling");
          }
          if (regionId) {
            xhr.setRequestHeader('regionid', regionId);
          }
          if (storageSpecial) { //这个参数是删除项目是调用对象存储删除的接口专用的，其他接口均不得使用(含泪添加。。)
            xhr.setRequestHeader('PROJECT-DELETE', storageSpecial);
          }
        };
      }
      return new Promise((resolve, reject) => {
        $.ajax(ajaxOpts)
          .done(function (data, status, xhr) {
            //let tokenId = xhr.getResponseHeader("X-Subject-Token") || "";
            Vue.Progress.finish();
            //tokenId && (data.tokenId = tokenId);
            resolve(data);
            successMsg && (self.$message || {}).success(successMsg);
            if (successFun) {
              successFun(data, xhr);
            }
            if (log) { //需要记录日志
              self.$recordLog({
                target: log.target,
                level: {
                  en: "info",
                  zh_cn: "信息"
                },
                description: log.description,
                trace_id: requestId
              });
            }
          })
          .fail(function (xhr, status, msg) {
            if (xhr != null && (xhr.status + "").indexOf("20") >= 0) {
              resolve();
              successMsg && (self.$message || {}).success(successMsg);
              if (successFun) {
                successFun();
              }
              if (log) { //需要记录日志
                self.$recordLog({
                  target: log.target,
                  level: {
                    en: "info",
                    zh_cn: "信息"
                  },
                  description: log.description,
                  trace_id: requestId
                });
              }
            } else {
              let error = ((xhr.responseJSON || {})[errorKey]) || (xhr.responseJSON || {})['conflictingRequest'] || {};
              let code = xhr.status;
              reject(error);

              Vue.Progress.fail();
              var errorText = "";
              var resTextCon = xhr["responseText"] || "";
              if (resTextCon !== "") {
                if (resTextCon.indexOf('{"message":') >= 0 && resTextCon.indexOf('",', resTextCon.indexOf('{"message":') + 11) >= 0) {
                  errorText = resTextCon.substring(resTextCon.indexOf('{"message":') + 13, resTextCon.indexOf('",', resTextCon.indexOf('{"message":') + 11));
                }
              }
              if (log) { //需要记录日志
                self.$recordLog({
                  target: log.target,
                  level: {
                    en: "error",
                    zh_cn: "错误"
                  },
                  description: (function (des, mes) {
                    let mesStr = mes;
                    for (var key in des) {
                      if (!mes) {
                        mesStr = key === "zh_cn" ? "未获取到异常信息" : "No exception information was obtained";
                      }
                      des[key] = des[key] + "(" + mesStr + ")";
                    }
                    return des;
                  })(log.description, error.message || errorText || xhr.responseText),
                  trace_id: requestId
                });
              }
              if (errCluTmpFun) {
                let cluTmpMsg = xhr["responseJSON"]["errors"][0]["detail"];
                self.$errMsg(cluTmpMsg, 403);
              } else {
                if (showErrMsg) {
                  var errorOpMsg = error.message || errorText || xhr.responseText;
                  self.$errMsg(errorOpMsg, code, logout);
                }
              }
              if (errFun) {
                errFun(xhr, status, msg);
              }
            }
          })
          .always(function () {
            // ( self.$message || function() {}).error('dsfdsfd');
          });
      });
    };

    Vue.sequence = function (options) {
      if (Vue.pid_roleType && (Vue.pid_roleType !== this.$cookie.get("pid") + "&" + this.$cookie.get("roleType"))) {
        document.location.href = "index.html";
        return;
      }
      Vue.Progress.hide();
      Vue.Progress.start();
      let self = this;
      let sid = digest((Vue.userId || "") + (this.$cookie.get("pid") || '') + (Vue.roleType === undefined ? '' : Vue.roleType) + (Vue.roleId === undefined ? '' : Vue.roleId));
      options = $.extend(true, {}, defaultOpts, options, {
        headers: {
          sid: sid,
          'x-csrf-token': Vue.csrfToken
        }
      });
      let { confirmMsg, successMsg, showErrMsg, isStrongConfig, errnetFun, errVmFun, errCluTmpFun, successFun, errorKey, errFun, datas, params, paramKeys, logout, log, ...ajaxOpts } = options;
      //let sequence = Promise.resolve();
      let url = ajaxOpts.url;
      let key = url.match(/\{(\S+)\}{1}/) ? url.match(/\{(\S+)\}{1}/)[1] : null;
      let seqdata = options.datas ? JSON.stringify(options.datas) : null;
      // let seqdatasKey = seqdata.match(/\{(\S+)\}{1}/)?seqdata.match(/\{(\S+)\}{1}/)[1] : null;
      var seqList = [];
      var realData = {};
      params.forEach((item, index) => {
        let itemUrl = url;
        // url存在多个传参判断，需要增加paramKeys:["",""]
        let paramKeys = options.paramKeys;
        if (paramKeys && paramKeys.length > 0) {
          for (let index = 0; index < paramKeys.length; index++) {
            let paramKey = paramKeys[index];
            itemUrl = itemUrl.replace("{" + paramKey + "}", item[paramKey] || "");
            realData = seqdata == null ? {} : seqdata.replace("{" + paramKey + "}", item[paramKey] || "");
          }
        } else {
          itemUrl = key == null ? itemUrl : url.replace(/\{(\S+)\}{1}/, item[key]);
          realData = seqdata == null ? {} : seqdata.replace(paramKey, item[paramKey]);
        }
        if (seqdata != null) {
          let dataArrayType = options.datas.type;
          if (dataArrayType != null) {
            var testData = JSON.parse(realData);
            var policyIds = testData['senlin_service_delete']['policy_detach']['policy_ids'];
            if (policyIds !== "") {
              policyIds = policyIds.split(",");
            } else {
              policyIds = [];
            }
            testData['senlin_service_delete']['policy_detach']['policy_ids'] = policyIds;
            delete testData['type'];
            ajaxOpts.data = JSON.stringify(testData);//JSON.parse(realData);
          } else {
            ajaxOpts.data = realData;//JSON.parse(realData);
          }
        }
        ajaxOpts.url = itemUrl;
        seqList.push(new Promise((resolve, reject) => {
          const requestId = genRequestId();
          options.headers['X-Openstack-Request-Id'] = requestId;
          options.headers['Req-Identifier'] = genReqIdentifier();
          $.ajax(ajaxOpts).done(function (data, status, xhr) {
            Vue.Progress.finish();
            resolve(data);
            successMsg && (self.$message || {}).success(successMsg);
            if (successFun) {
              successFun(data);
            }
            if (log) { //需要记录日志
              self.$recordLog({
                target: log.target,
                level: {
                  en: "info",
                  zh_cn: "信息"
                },
                description: (function (des, mes) {
                  for (var key in des) {
                    let desitem = des[key];
                    let arr = desitem.match(/\{[\S]*?\}/g);
                    if (arr && arr.length > 0) {
                      arr.forEach((aitem, index) => {
                        var bak = aitem.replace('{', '').replace('}', '');
                        des[key] = des[key].replace(aitem, item[bak] || "");
                      });
                    }
                    des[key] = des[key] + (item[log.key] ? (":" + item[log.key]) : '');
                  }
                  return des;
                })($.extend({}, log.description)),
                trace_id: requestId
              });
            }
          }).fail(function (xhr, status, msg) {
            if (xhr != null && (xhr.status + "").indexOf("20") >= 0) {
              resolve();
              if (successMsg !== "") {
                self.$message(successMsg);
              }
              if (successFun) {
                successFun();
              }
              if (log) { //需要记录日志
                self.$recordLog({
                  target: log.target,
                  level: {
                    en: "info",
                    zh_cn: "信息"
                  },
                  description: (function (des, mes) {
                    for (var key in des) {
                      let desitem = des[key];
                      let arr = desitem.match(/\{[\S]*?\}/g);
                      if (arr && arr.length > 0) {
                        arr.forEach((aitem, index) => {
                          var bak = aitem.replace('{', '').replace('}', '');
                          des[key] = des[key].replace(aitem, item[bak] || "");
                        });
                      }
                      des[key] = des[key] + (item[log.key] ? (":" + item[log.key]) : '');
                    }
                    return des;
                  })($.extend({}, log.description)),
                  trace_id: requestId
                });
              }
            } else {
              let error = ((xhr.responseJSON || {})[errorKey]) || (xhr.responseJSON)['conflictingRequest'] || {};
              let code = xhr.status;
              resolve({ error: error });
              Vue.Progress.fail();
              var errorText = "";
              var resTextCon = xhr["responseText"] || "";
              if (resTextCon !== "") {
                if (resTextCon.indexOf('{"message":') >= 0 && resTextCon.indexOf('",', resTextCon.indexOf('{"message":') + 11) >= 0) {
                  errorText = resTextCon.substring(resTextCon.indexOf('{"message":') + 13, resTextCon.indexOf('",', resTextCon.indexOf('{"message":') + 11));
                }
              }
              if (errVmFun) {
                let responseJSON = xhr["responseJSON"];
                let messageError = responseJSON["conflictingRequest"];
                let message = messageError["message"];
                message = message.replace(/<br(\s)*\/>/g, "");
                message = message.replace(/[\r\n]/g, "");
                message = message.replace(/\\n/g, "");
                self.$message({
                  message: message,
                  type: "error"
                });
              } else if (errnetFun) {
                let responseJSON = xhr["responseJSON"];
                let messageError = responseJSON["NeutronError"];
                let message = messageError["message"];
                message = message.replace(/<br(\s)*\/>/g, "");
                message = message.replace(/[\r\n]/g, "");
                message = message.replace(/\\n/g, "");
                self.$errMsg(message);
              } else if (errCluTmpFun) {
                let cluTmpMsg = xhr["responseJSON"]["errors"][0]["detail"];
                cluTmpMsg = cluTmpMsg.replace(/<br(\s)*\/>/g, "");
                cluTmpMsg = cluTmpMsg.replace(/[\r\n]/g, "");
                cluTmpMsg = cluTmpMsg.replace(/\\n/g, "");
                self.$errMsg(cluTmpMsg, 403);
              } else {
                if (showErrMsg) {
                  var errorOpMsg = error.message || errorText || xhr.responseText;
                  errorOpMsg = errorOpMsg.replace(/<br(\s)*\/>/g, "");
                  errorOpMsg = errorOpMsg.replace(/[\r\n]/g, "");
                  errorOpMsg = errorOpMsg.replace(/\\n/g, "");
                  self.$errMsg(errorOpMsg, code, logout);
                }
              }
              if (log) { //需要记录日志
                self.$recordLog({
                  target: log.target,
                  level: {
                    en: "error",
                    zh_cn: "错误"
                  },
                  description: (function (des, mes) {
                    if (mes && mes.indexOf('{"message":') >= 0 && mes.indexOf('",', mes.indexOf('{"message":') + 11) >= 0) {
                      mes = mes.substring(mes.indexOf('{"message":') + 13, mes.indexOf('",', mes.indexOf('{"message":') + 11));
                    }
                    for (var key in des) {
                      let mesStr = mes;
                      if (!mes) {
                        mesStr = key === "zh_cn" ? "未获取到异常信息" : "No exception information was obtained";
                      }
                      let desitem = des[key];
                      let arr = desitem.match(/\{[\S]*?\}/g);
                      if (arr && arr.length > 0) {
                        arr.forEach((aitem, index) => {
                          var bak = aitem.replace('{', '').replace('}', '');
                          des[key] = des[key].replace(aitem, item[bak] || "");
                        });
                      }
                      des[key] = des[key] + (item[log.key] ? (":" + item[log.key]) : '') + " (" + mesStr + ")";
                    }
                    return des;
                  })($.extend({}, log.description), error.message || errorText || xhr.responseText),
                  trace_id: requestId
                });
              }
              if (errFun) {
                errFun(xhr, status, msg);
              }
            }
          }).always(function () { });
        }));
      });

      return Promise.all(seqList).then(function (data) {
        Vue.Progress.finish();
        // 上面已经处理了成功消息，此处多余
        // if (successMsg != null && successMsg != "") {
        //    successMsg && (self.$message || {}).success(successMsg);
        // }
        let flg = false;
        if (data && data.length > 0) {
          flg = data.some(function (item, index) {
            if (item) {
              return item.hasOwnProperty('error');
            } else {
              return false;
            }
          });
        }
        if (flg) {
          return Promise.reject(data);
        } else {
          return Promise.resolve(data);
        }
      }, function () {
        Vue.Progress.finish();
        return Promise.reject(data);
      }).catch(function (data) {
        Vue.Progress.fail();
        // (self.$message || {}).error(Vue.t(data.errCode));
        return Promise.reject(data);
      });
    };

    // 4. 添加实例方法
    Vue.prototype.$ajax = function (options) {
      let confirmMsg = options.confirmMsg;
      let cancelFun = options.cancelFun;
      if (!confirmMsg) {
        return Vue.ajax.call(this, options);
      }
      return confirmMsg && this.$confirm(confirmMsg, Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(() => {
        return Vue.ajax.call(this, options);
      }).catch(() => {
        if (confirmMsg && cancelFun) {
          cancelFun();
        }
        return Promise.reject({
          warnMsg: 'confirm dialog canceled'
        });
      });
    };

    // 4. 添加实例方法
    Vue.prototype.$sequence = function (options) {
      let self = this;
      let { confirmMsg, successMsg, showErrMsg, isStrongConfig, params, ...ajaxOpts } = options;
      if (!confirmMsg) {
        return Vue.sequence.call(this, options);
      }
      return confirmMsg && this.$confirm(confirmMsg, Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(() => {
        return Vue.sequence.call(this, options);
      }).catch(() => {
        return Promise.reject({
          warnMsg: 'confirm dialog canceled'
        });
      });
    };
  };

  function digest(data) {
    let d = crypto.createHash('sha256').update(data, 'latin1').digest('base64');
    return d;
  }

  function genRequestId() {
    return 'req-' + uuid.v1();
  }

  if (typeof exports === "object") {
    module.exports = vueAjax;
  } else if (typeof define === "function" && define.amd) {
    define([], function () {
      return vueAjax;
    });
  } else if (window.Vue) {
    window.vueAjax = vueAjax;
    Vue.use(vueAjax);
  }
})();
