<template>
  <div>
    <el-dialog :title="$t('base.deleteProjectTitle')" :visible="dialogVisible" :before-close="onBeforeClose">
      <div v-if="saving">{{$t('base.deleteProjectPro')}}</div>
      <el-table :data="projectSource" style="width: 100%">
        <el-table-column prop="name" :label="$t('base.name')" min-width="100">
        </el-table-column>
        <el-table-column prop="status" :label="$t('base.status')" min-width="100" align="left">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.status==0">{{$t('base.waitingForDel')}}</el-tag>
            <i v-if="scope.row.status==0" class="el-icon-loading"></i>
            <el-tag type="success" v-if="scope.row.status==1">{{$t('base.deleteSuccess')}}</el-tag>
            <el-tag type="danger" v-if="scope.row.status==2">{{$t('base.deleteFail')}}</el-tag>
            <el-tag type="danger" v-if="scope.row.status==3">{{$t('base.deleteTermination')}}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close()">{{$t('base.close')}}</el-button>
      </div>
   </el-dialog>
  </div>
</template>

<script>
import AWS from 'aws-sdk';
const Base64 = require('js-base64').Base64;

export default {
  name: 'delete-project',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      defalut: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      projectSource: (function (me) {
        let arr = [];
        let i=0;
        //肯定有计算nova模块，不做判断
        arr.push({service:"nova", index:i++, name:Vue.t('base.cloudHost')+"、"+Vue.t('calcStorLang.instanceshot')+"、"+Vue.t('base.privateImage'), status:0})
        if (me.checkService("cinderv2")||me.checkService("manila")||me.checkService("swift")||me.checkService("S3")) {
          let str = '';
          if (me.checkService("cinderv2")) {
            str += " 、"+Vue.t('base.cloudDisk')+"、"+(Vue.service.ironic?(Vue.t('calcStorLang.physicalHost')+"、"):"")+Vue.t('calcStorLang.volumeSnapshot')+"、"+Vue.t('calcStorLang.volumebak');
          }
          if (me.checkService("manila")) {
            str += " 、"+Vue.t('calcStorLang.fileStorage');
          }
          if (me.checkService("swift")||me.checkService("S3")) {
            str += " 、"+Vue.t('calcStorLang.objectStorage');
          }
          arr.push({service:"cinderv2", index:i++, name:str.substring(2), status:0})
        }
        if (me.checkService("senlin")) {
          arr.push({service:"senlin", index:i++, name:Vue.t('scalingService.scalingService'), status:0});
        }
        if (me.checkService("heat")) {
          arr.push({service:"heat", index:i++, name:Vue.t('heat.serviceOrchestration'), status:0});
        }
        if (me.checkService("cetus")) {
          arr.push({service:"cetus", index:i++, name:Vue.t('base.containerManagement'), status:0});
        }
        if (me.checkService("trove")) {
          arr.push({service:"trove", index:i++, name:Vue.t('base.databaseInstance'), status:0});
        }
        if (me.checkService("mistral")) {
          arr.push({service:"mistral", index:i++, name:Vue.t('task.cloudTask'), status:0});
        }
        if (me.checkService("cloudkitty")) {
          arr.push({service:"cloudkitty", index:i++, name:Vue.t('base.billing'), status:0});
        }
        if (me.checkService("leo")) {
          arr.push({service:"leo", index:i++, name:Vue.t('opt.approval')+"、"+Vue.t('opt.workSheet'), status:0});
        }
        if (me.checkService("neutron")) {
          arr.push({service:"neutron", index:i++, name:Vue.t('base.network'), status:0});
        }
        return arr;
      })(this)
    };
  },
  methods: {
    async deleteProject(id, name) {
      this.projectSource.forEach((item) => {
        item.status=0
      })
      //查找admin项目的id
      let projectRet = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects?" + $.param({domain_id:"default", name:"admin"})
      });
      let adminPid = projectRet.projects[0].id;

      this.deleteProjectFlag = true;
      let me = this;
      let activeRegionId = this.$cookie.get('region_id');
      let regions = Vue.regionList;

      //定义各模块删除方法变量
      let funs = {
        //删除计算资源
        nova:function () {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="nova";
          })
          del(0);
          function del(index) {
            let option = {
              type: 'post',
              url: "api/nova/v2.1/servers-inspur/"+id+"/action",
              data:JSON.stringify({"os-delete_project":null}),
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                getServerStatus(index);
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") computer resources",
                zh_cn:"删除项目"+"("+name+")计算资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          //查询删除资源状态
          function getServerStatus(index) {
            let option = {
              type: 'get',
              url: "api/nova/v2.1/"+adminPid+"/servers/detail?all_tenants=True&project_id="+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun(data) {
                if (data.servers.length==0) {
                  getImageStatus(index);
                } else {
                  setTimeout(() => {
                    getServerStatus(index);
                  }, 5000)
                }
              }
            }
            me.$ajax(option)
          }
          function getImageStatus(index) {
            me.$ajax({
              type: 'get',
              url: "api/glance/v2/images?owner="+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun(data) {
                if (data.images.length==0) {
                  if (index==regions.length-1) {
                    me.projectSource[arrIndex].status = 1;
                    next("nova")
                  } else {
                    del(++index);
                  }
                } else {
                  setTimeout(() => {
                    getImageStatus(index);
                  }, 5000)
                }
              }
            })
          }
        },
        //删除储存资源
        cinderv2:function() {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="cinderv2";
          })
          delCloudDisk(0);
          //删除云硬盘
          function delCloudDisk(index) {
            if (!Vue.regionServices[regions[index].region_id]["cinderv2"]) {
              if (index==regions.length-1) {
                deleteBak(0);
              } else {
                delCloudDisk(++index)
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/cinderv2/v3/"+adminPid+"/inspur-volumes/"+id+"/deleteproject",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                getDelCloudDickStatus(index);
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") cloud disk resources"+(Vue.service.ironic?"、cloud phyical resources":""),
                zh_cn:"删除项目"+"("+name+")云硬盘资源"+(Vue.service.ironic?"、云物理机资源":"")
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          function getDelCloudDickStatus(index) {
            me.$ajax({
              type: 'get',
              url: "api/cinderv2/v3/"+adminPid+"/inspur-volumes/"+id+"/delete_over",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun(data) {
                if (data.status=="ok") {
                  if (index==regions.length-1) {
                    deleteBak(0)
                  } else {
                    delCloudDisk(++index)
                  }
                } else {
                  setTimeout(() => {
                    getDelCloudDickStatus(index);
                  }, 5000)
                }
              }
            })
          }
          //删除云硬盘备份
          function deleteBak(index) {
            if (!Vue.regionServices[regions[index].region_id]["cinderv2"]) {
              if (index==regions.length-1) {
                deleteFile(0);
              } else {
                deleteBak(++index)
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/cinderv2/v3/"+adminPid+"/inspur-backups/"+id+"/delete_project",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                getDelBakStatus(index);
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") cloud disk bak resources",
                zh_cn:"删除项目"+"("+name+")云硬盘备份资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          function getDelBakStatus(index) {
            me.$ajax({
              type: 'get',
              url: "api/cinderv2/v3/"+adminPid+"/inspur-backups/"+id+"/delete_over",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun(data) {
                if (data.status=="ok") {
                  if (index==regions.length-1) {
                    deleteFile(0)
                  } else {
                    deleteBak(++index)
                  }
                } else {
                  setTimeout(() => {
                    getDelBakStatus(index);
                  }, 5000)
                }
              }
            })
          }
          //删除文件存储
          function deleteFile(index) {
            if (!Vue.regionServices[regions[index].region_id]["manila"]) {
              if (index==regions.length-1) {
                deleteS3ObjectStorage(0);
              } else {
                deleteFile(++index)
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/manila/v2/"+adminPid+"/shares/"+id+"/deleteproject",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                getDeleteFileStatus(index);
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") file storage resources",
                zh_cn:"删除项目"+"("+name+")文件存储资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          function getDeleteFileStatus(index) {
            me.$ajax({
              type: 'get',
              url: "api/manila/v2/"+adminPid+"/shares/"+id+"/delete_over",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun(data) {
                if (data.status=="ok") {
                  if (index==regions.length-1) {
                    deleteS3ObjectStorage(0)
                  } else {
                    deleteFile(++index)
                  }
                } else {
                  setTimeout(() => {
                    getDeleteFileStatus(index);
                  }, 5000)
                }
              }
            })
          }
          //删除s3对象存储
          function deleteS3ObjectStorage(index) {
            if (!Vue.regionServices[regions[index].region_id]["S3"]) {
              if (index==regions.length-1) {
                deleteObjStorage(0);
              } else {
                deleteS3ObjectStorage(++index);
              }
              return;
            }
            let utcDate = new Date();
            utcDate = utcDate.toUTCString().replace("GMT", "+0000");
            let stringToSign = `DELETE\n\napplication/json;\n\nx-amz-date:${utcDate}\n/admin/user`;
            if (!Vue.S3SuperUser || !Vue.S3SuperUser.ak || !Vue.S3SuperUser.sk) {
              me.projectSource[arrIndex].status = 2;
              me.updateErrStatus();
              throw new Error("please config the ak and sk of S3SuperUser");
            }
            let ak = Vue.S3SuperUser.ak.trim();
            let sk = Vue.S3SuperUser.sk.trim();
            sk = Base64.decode(sk);
            let singnature = AWS.util.crypto.hmac(sk, stringToSign, 'base64', 'sha1');
            let uid = id + "$" + id;
            let option = {
              type: 'delete',
              url: `api/S3/admin/user?uid=${uid}&purge-date=true&background=true`,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              showErrMsg:false,
              headers:{
                "X-Amz-Date" : utcDate,
                "Authorization" : "AWS " + ak + ":" + singnature
              },
              successFun(data) {
                if (index==regions.length-1) {
                  deleteObjStorage(0)
                } else {
                  deleteS3ObjectStorage(++index)
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") object storage(S3) resources",
                zh_cn:"删除项目"+"("+name+")对象存储(S3)资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          //删除swift对象存储
          //定义一个变量记录次数
          let times = 0;
          function deleteObjStorage(index) {
            if (!Vue.regionServices[regions[index].region_id]["swift"]) {
              if (index==regions.length-1) {
                me.projectSource[arrIndex].status = 1;
                next("cinderv2");
              } else {
                deleteObjStorage(++index)
              }
              return;
            }
            //特殊处理，如果第一次调用接口失败，则继续调用第二次，第二次失败，则终止删除
            let option = {
              type: 'delete',
              url: "api/swift/v1/"+adminPid,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              showErrMsg:false,
              storageSpecial:id,
              successFun() {
                times = 0; //考虑到多region重置记录次数
                if (index==regions.length-1) {
                  me.projectSource[arrIndex].status = 1;
                  next("cinderv2");
                } else {
                  deleteObjStorage(++index)
                }
              },
              errFun() {
                if (times==0) {
                  times++;
                  deleteObjStorage(index);
                } else {
                  me.projectSource[arrIndex].status = 2;
                  me.updateErrStatus()
                }
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") object storage resources",
                zh_cn:"删除项目"+"("+name+")对象存储资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        },
        //删除伸缩服务资源
        senlin:function () {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="senlin";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["senlin"]) {
              if (index==regions.length-1) {
                next("senlin");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/senlin/v1/clusters/001/actions",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              data:JSON.stringify({del_in_project_inspur:{project:id}}),
              successFun() {
                if (index==regionList.length-1) {
                  next("senlin");
                  me.projectSource[arrIndex].status = 1;
                } else {
                  del(++index);
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") telescopic service resources",
                zh_cn:"删除项目"+"("+name+")伸缩服务资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        },
        //删除服务编排资源
        heat:function() {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="heat";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["heat"]) {
              if (index==regions.length-1) {
                next("heat");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/heat/v1/"+id+"/template/delete_tenant_id",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              log:{
                description:{
                  en:"delete project"+"("+name+") service orchestration resources",
                  zh_cn:"删除项目"+"("+name+")服务编排资源"
                },
                target:Vue.logTarget.project
              },
              successFun() {
                if (index==regionList.length-1) {
                  me.projectSource[arrIndex].status = 1;
                  next("heat");
                } else {
                  del(++index);
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") service orchestration resources",
                zh_cn:"删除项目"+"("+name+")服务编排资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        },
        //删除容器
        cetus:function () {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="cetus";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["cetus"]) {
              if (index==regions.length-1) {
                next("cetus");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/cetus/v1/magnum/delete_objects_by_project",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              data:JSON.stringify({project_id:id}),
              successFun() {
                getStatus(index);
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") container resources",
                zh_cn:"删除项目"+"("+name+")容器资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          //获取删除后的状态
          function getStatus(index) {
            me.$ajax({
              type: 'post',
              url: "api/cetus/v1/magnum/get_objects_delete_status",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              data:JSON.stringify({project_id:id}),
              successFun(data) {
                if (data.result=="deleted") {
                  if (index==regionList.length-1) {
                    me.projectSource[arrIndex].status = 1;
                    next("cetus");
                  } else {
                    del(++index);
                  }
                } else if (data.result == "deleting") {
                  setTimeout(() => {
                    getStatus(index);
                  }, 5000)
                } else {
                  me.projectSource[arrIndex].status = 2;
                }
              }
            })
          }
        },
        //删除数据库实例
        trove:function () {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="trove";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["trove"]) {
              if (index==regions.length-1) {
                next("trove");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/trove/v1.0/"+adminPid+"/instances/delete_project",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              data:JSON.stringify({project_id:id}),
              successFun() {
                if (index==regionList.length-1) {
                  me.projectSource[arrIndex].status = 1;
                  next("trove")
                } else {
                  del(++index);
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") database instance resources",
                zh_cn:"删除项目"+"("+name+")数据库实例资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        },
        //删除云计划任务资源
        mistral() {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="mistral";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["mistral"]) {
              if (index==regions.length-1) {
                next("mistral");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'post',
              url: "api/mistral/v2/cloud_tasks/delete_project_id",
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              data:JSON.stringify({project_id:id}),
              successFun() {
                if (index==regionList.length-1) {
                  me.projectSource[arrIndex].status = 1;
                  next("mistral");
                } else {
                  del(++index);
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") cloud plan tasks resources",
                zh_cn:"删除项目"+"("+name+")云计划任务资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        },
        cloudkitty() {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="cloudkitty";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["cloudkitty"]) {
              if (index==regions.length-1) {
                next("cloudkitty");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'delete',
              url: "api/cloudkitty/v1/cost?tenant_id="+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                getStatus(index);
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") charging resources",
                zh_cn:"删除项目"+"("+name+")计费资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
          function getStatus(index) {
            me.$ajax({
              type: 'get',
              url: "api/cloudkitty/v1/cost/get_cost_list?tenant_id="+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun(data) {
                if (data.cost_list.length==0) {
                  if (index==regionList.length-1) {
                    me.projectSource[arrIndex].status = 1;
                    next("cloudkitty");
                  } else {
                    del(++index)
                  }
                } else {
                  setTimeout(() => {
                    getStatus(index);
                  }, 5000)
                }
              }
            })
          }
        },
        leo() {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="leo";
          })
          del(0);
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["leo"]) {
              if (index==regions.length-1) {
                next("leo");
                me.projectSource[arrIndex].status = 1;
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'delete',
              url: "api/leo/v1/common/delete_project/"+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                if (index==regionList.length-1) {
                  me.projectSource[arrIndex].status = 1;
                  next("leo");
                } else {
                  del(++index)
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") order resources",
                zh_cn:"删除项目"+"("+name+")审批工单资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        },
        neutron() {
          var arrIndex = me.projectSource.findIndex((item) => {
            return item.service=="neutron";
          })
          deleteLoadBalance(0);
          function deleteLoadBalance(index) {
            if (!Vue.regionServices[regions[index].region_id]["octavia"]) {
              if (index==regions.length-1) {
                del(0);
              } else {
                deleteLoadBalance(++index);
              }
              return;
            }
            let option = {
              type: 'delete',
              url: "api/octavia/v2.0/lbaas/inspurloadbalancers/deleteall/"+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                if (index==regionList.length-1) {
                  del(0);
                } else {
                  deleteLoadBalance(++index);
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            me.$ajax(option)
          }
          function del(index) {
            if (!Vue.regionServices[regions[index].region_id]["neutron"]) {
              if (index==regions.length-1) {
                me.projectSource[arrIndex].status = 1;
                next("neutron");
              } else {
                del(++index);
              }
              return;
            }
            let option = {
              type: 'delete',
              url: "api/neutron/v2.0/inspur/networkresource/"+id,
              regionId:regions[index].region_id==activeRegionId?"":regions[index].region_id,
              successFun() {
                if (index==regionList.length-1) {
                  me.projectSource[arrIndex].status = 1;
                  next("neutron");
                } else {
                  del(++index);
                }
              },
              errFun() {
                me.projectSource[arrIndex].status = 2;
                me.updateErrStatus()
              }
            }
            option.log = {
              description:{
                en:"delete project"+"("+name+") network resources",
                zh_cn:"删除项目"+"("+name+")网络资源"
              },
              target:Vue.logTarget.project
            }
            me.convertLog(option.log, index);
            me.$ajax(option)
          }
        }
      }

      funs["nova"]();

      function next(service) {
        let index = me.projectSource.findIndex((item) => {
          return item.service==service;
        })
        if (me.projectSource[index+1]) {
          funs[me.projectSource[index+1].service]();
        } else {
          delProject();
        }
      }

      function delProject() {
        me.$ajax({
          type: 'DELETE',
          url: "api/keystone/v3/inspur/projects/" + id,
          data: {},
          successMsg:Vue.t('base.deleteSuccess'),
          log:{
            description:{
              en:"delete project"+"("+name+")",
              zh_cn:"删除项目"+"("+name+")"
            },
            target:Vue.logTarget.project
          },
          successFun() {
            me.$emit('finish');
          },
          errFun() {
            me.$emit('error', me.id);
          }
        })
      }
    },
    updateErrStatus() {
      this.projectSource.forEach((item) => {
        if (item.status==0) {
          item.status=3;
        }
      })
      this.$emit('error', this.id);
    },
    checkService(service) {
      let flg = false;
      for (let region in Vue.regionServices) {
        if (Vue.regionServices[region][service]) {
          flg = true;
        }
      }
      return flg;
    },
    convertLog(log, index) {
      if (Vue.regionList.length>1) {
        for (var key in log.description) {
          log.description[key] += "("+Vue.regionList[index].region+")"
        }
      }
    },
    initDialog() {
      const $this = this;
      $this.dialogVisible = true;
    },
    onBeforeClose() {
      const $this = this;
      $this.close();
    },
    close() {
      const $this = this;
      $this.dialogVisible = false;
      $this.$emit('update:show', false);
      $this.$emit('refreshData');
    }
  },
  watch: {
    show(val) {
      const $this = this;
      if (val) {
        $this.dialogVisible = true;
      }
    }
  },
  computed: {
    saving() {
      return this.projectSource.findIndex(item => item.status === 0) !== -1;
    }
  },
  mounted() {
    const $this = this;
    $this.deleteProject($this.id, $this.name);
    $this.dialogVisible = $this.show;
  }
}
</script>

<style>

</style>
