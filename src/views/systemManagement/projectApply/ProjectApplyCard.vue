<template>
  <div>
  <el-dialog :title="$t('base.applyProject')" :visible.sync="visible" v-loading="loading">
    <el-tabs v-model="activeName" class="tabs-nopadding" type="border-card">
      <el-tab-pane :label="$t('base.projectInformation')" name="first">
        <el-form ref="projectForm" :model="projectModel" :rules="rules" class="me-required-form" label-width="100px">
          <el-form-item :label="$t('base.name')" class="is-required" prop="name">
            <el-input auto-complete="off" v-model="projectModel.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('base.desc')" prop="description">
            <el-input type="textarea" v-model="projectModel.description"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="$t('base.quota')" name="fourth">
        <el-radio-group v-model="quotaTemplate" @change="ochangeFun">
          <el-radio :label="1">{{$t('base.smallQuota')}}</el-radio>
          <el-radio :label="2">{{$t('base.mediumQuota')}}</el-radio>
          <el-radio :label="3">{{$t('base.largeQuota')}}</el-radio>
          <el-radio :label="4">{{$t('base.unlimited')}}</el-radio>
        </el-radio-group>
        <el-collapse v-model="activeNames" style="max-height:400px;overflow:auto;">
          <el-collapse-item :title="$t('base.computer')" name="1" v-if="service.nova">
            <el-form label-width="190px" label-position="left" ref="computerForm">
            <template v-for="(item,key) in computerForm">
              <el-form-item>
                <span slot="label">
                  {{item.label}}
                  <!-- <el-tooltip effect="dark" v-if="item.concept">//5.7需求，到时候直接放开即可
                    <div slot="content">{{item.concept}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip> -->
                </span>
                <input-number v-if="!item.flag" :min="item.min" :max="item.max" style="width:380px;" :val="item.value" :p="key" @change="comChangeFun"></input-number>
                <el-tooltip effect="dark" v-if="!item.flag">
                  <div slot="content">{{$t('base.optionalRange')+':'+item.min+"~"+"99999999"}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
                <el-checkbox v-model="item.flag">{{$t('base.unlimited')}}</el-checkbox>
              </el-form-item>
            </template>
            </el-form>
          </el-collapse-item>
          <el-collapse-item :title="$t('base.network')" name="2" v-if="service.neutron">
            <el-form label-width="190px" label-position="left" ref="networkForm">
              <template v-for="(item,key) in networkForm">
                <el-form-item :label="item.label">
                  <input-number v-if="!item.flag" :min="item.min" :max="item.max" style="width:380px;" :val="item.value" :p="key" @change="networkChangeFun"></input-number>
                  <el-tooltip effect="dark" v-if="!item.flag">
                    <div slot="content">{{$t('base.optionalRange')+':'+item.min+"~"+"99999999"}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                  <el-checkbox v-model="item.flag">{{$t('base.unlimited')}}</el-checkbox>
                </el-form-item>
              </template>
            </el-form>
          </el-collapse-item>
          <el-collapse-item :title="$t('base.storage')" name="3" v-if="service.cinderv2">
            <el-form label-width="190px" label-position="left" ref="storeForm">
              <template v-for="(item,key) in storeForm">
                <el-form-item :label="item.label">
                  <input-number v-if="!item.flag" :min="item.min" :max="item.max" style="width:380px;" :val="item.value" :p="key" @change="storeChangeFun"></input-number>
                  <el-tooltip effect="dark" v-if="!item.flag">
                    <div slot="content">{{$t('base.optionalRange')+':'+item.min+"~"+"99999999"}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                  <el-checkbox v-model="item.flag">{{$t('base.unlimited')}}</el-checkbox>
                </el-form-item>
              </template>
            </el-form>
          </el-collapse-item>
          <el-collapse-item :title="$t('base.fileStorage')" name="4" v-if="service.manila">
            <el-form label-width="190px" ref="fileStoreForm">
              <template v-for="(item,key) in fileStoreForm">
                <el-form-item :label="item.label">
                  <input-number v-if="!item.flag" :min="item.min" :max="item.max" style="width:380px;" :val="item.value" :p="key" @change="fileStoreChangeFun"></input-number>
                  <el-tooltip effect="dark" v-if="!item.flag">
                    <div slot="content">{{$t('base.optionalRange')+':'+item.min+"~"+"99999999"}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                  <el-checkbox v-model="item.flag">{{$t('base.unlimited')}}</el-checkbox>
                </el-form-item>
              </template>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="btnFlg" @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button :disabled="btnFlg" type="primary" @click="confirmProjectFun">{{$t('base.application')}}</el-button>
    </div>
 </el-dialog>
  </div>
</template>
<script>
import InputNumber from '../project/InputNumber.vue'
export default {
  name:"newProject",
  data() {
    return {
      service:Vue.service,
      loading:false,
      visible:false,
      activeName:"first",
      activeNames:["1", "2", "3", "4"],
      projectModel: {
        name: "",
        description: ""
      },
      btnFlg:false,
      quotaTemplate:4,
      rules: {
        name: [
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "onlyLetter_MinusNumberChinese"}
        ],
        description:[
          {type: 'maxSize', value: 255}
        ]
      },
      computerForm:{
        //元数据条目
        metadata_items:{
          label:this.$t('base.metadataEntryNum'),
          concept:this.$t('base.metadataConcept'),
          value:128,
          min:0,
          max:99999999,
          flag:false,
          l:128,
          m:256,
          h:640
        },
        //vcpu数量
        cores:{
          label:this.$t('base.VCPUQuantityNum'),
          value:20,
          min:0,
          max:99999999,
          flag:false,
          l:20,
          m:40,
          h:100
        },
        //云主机
        instances:{
          label:this.$t('base.cloudHostNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //注入的文件
        injected_files:{
          label:this.$t('base.injectedFileNum'),
          concept:this.$t('base.injectedFilesConcept'),
          value:5,
          min:0,
          max:99999999,
          flag:false,
          l:5,
          m:10,
          h:25
        },
        //注入的文件内容
        injected_file_content_bytes:{
          label:this.$t('base.injectedFileContentNum'),
          concept:this.$t('base.injectedFileContentBytesConcept'),
          value:10240,
          min:0,
          max:99999999,
          flag:false,
          l:10240,
          m:20480,
          h:51200
        },
        //密钥对
        key_pairs:{
          label:this.$t('base.keyPairNum'),
          value:100,
          min:0,
          max:99999999,
          flag:false,
          l:100,
          m:200,
          h:500
        },
        //注入文件路径的长度
        injected_file_path_bytes:{
          label:this.$t('base.injectedFilePathLengthNum'),
          concept:this.$t('base.injectedFilePathBytesConcept'),
          value:255,
          min:0,
          max:99999999,
          flag:false,
          l:255,
          m:512,
          h:1275
        },
        //内存
        ram:{
          label:this.$t('base.memorymbNum'),
          value:51200,
          min:0,
          max:99999999,
          flag:false,
          l:51200,
          m:102400,
          h:256000
        },
        //亲和性策略
        server_groups:{
          label:this.$t('base.serverGroupNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //亲和性策略成员
        server_group_members:{
          label:this.$t('base.serverGroupMemberNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        }
      },
      fileStoreForm:{
        shares:{
          label:Vue.t('base.fileStoreNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:Vue.t('base.fileStoreSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
        snapshots:{
          label:Vue.t('base.fileStorageSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:200,
          h:500
        },
        snapshot_gigabytes:{
          label:Vue.t('base.fileStoreSnapshotSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        }
      },
      networkForm: {
        //安全组
        security_group:{
          label:this.$t('base.securityGroupNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //安全组规则
        security_group_rule:{
          label:this.$t('base.securityGroupRuleNum'),
          value:100,
          min:0,
          max:99999999,
          flag:false,
          l:100,
          m:200,
          h:500
        },
        //浮动ip
        floatingip:{
          label:this.$t('base.floatIPNum'),
          value:50,
          min:0,
          max:99999999,
          flag:false,
          l:50,
          m:100,
          h:250
        },
        //网络
        network:{
          label:this.$t('base.networkNum'),
          value:100,
          min:0,
          max:99999999,
          flag:false,
          l:100,
          m:200,
          h:500
        },
        //路由
        router:{
          label:this.$t('base.routeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
        //端口
        port:{
          label:this.$t('base.portNum'),
          value:500,
          min:0,
          max:99999999,
          flag:false,
          l:500,
          m:1000,
          h:25000
        },
        //子网
        subnet:{
          label:this.$t('base.subnetNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        }
      },
      storeForm:{
        //云硬盘
        volumes:{
          label:Vue.t('base.cloudHardDiskNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //云硬盘快照
        snapshots:{
          label:Vue.t('base.cloudHardDiskSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:Vue.t('base.cloudDiskAndSnapshotSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
         //云硬盘备份
        backups:{
          label:this.$t('base.cloudHardDiskBakNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        backup_gigabytes:{
          label:this.$t('base.cloudDiskAndBakSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        }
      }
    }
  },
  mounted() {
  },
  methods:{
    show(obj, activeName) {
      this.quotaTemplate = 4;
      this.computerForm = {
        //元数据条目
        metadata_items:{
          label:this.$t('base.metadataEntryNum'),
          concept:this.$t('base.metadataConcept'),
          value:128,
          min:0,
          max:99999999,
          flag:false,
          l:128,
          m:256,
          h:640
        },
        //vcpu数量
        cores:{
          label:this.$t('base.VCPUQuantityNum'),
          value:20,
          min:0,
          max:99999999,
          flag:false,
          l:20,
          m:40,
          h:100
        },
        //云主机
        instances:{
          label:this.$t('base.cloudHostNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //注入的文件
        injected_files:{
          label:this.$t('base.injectedFileNum'),
          concept:this.$t('base.injectedFilesConcept'),
          value:5,
          min:0,
          max:99999999,
          flag:false,
          l:5,
          m:10,
          h:25
        },
        //注入的文件内容
        injected_file_content_bytes:{
          label:this.$t('base.injectedFileContentNum'),
          concept:this.$t('base.injectedFileContentBytesConcept'),
          value:10240,
          min:0,
          max:99999999,
          flag:false,
          l:10240,
          m:20480,
          h:51200
        },
        //密钥对
        key_pairs:{
          label:this.$t('base.keyPairNum'),
          value:100,
          min:0,
          max:99999999,
          flag:false,
          l:100,
          m:200,
          h:500
        },
        //注入文件路径的长度
        injected_file_path_bytes:{
          label:this.$t('base.injectedFilePathLengthNum'),
          concept:this.$t('base.injectedFilePathBytesConcept'),
          value:255,
          min:0,
          max:99999999,
          flag:false,
          l:255,
          m:512,
          h:1275
        },
        //内存
        ram:{
          label:this.$t('base.memorymbNum'),
          value:51200,
          min:0,
          max:99999999,
          flag:false,
          l:51200,
          m:102400,
          h:256000
        },
        //亲和性策略
        server_groups:{
          label:this.$t('base.serverGroupNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //亲和性策略成员
        server_group_members:{
          label:this.$t('base.serverGroupMemberNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        }
      };
      this.fileStoreForm = {
        shares:{
          label:Vue.t('base.fileStoreNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:Vue.t('base.fileStoreSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
        snapshots:{
          label:Vue.t('base.fileStorageSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        snapshot_gigabytes:{
          label:Vue.t('base.fileStoreSnapshotSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        }
      };
      this.networkForm = {
        //安全组
        security_group:{
          label:this.$t('base.securityGroupNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //安全组规则
        security_group_rule:{
          label:this.$t('base.securityGroupRuleNum'),
          value:100,
          min:0,
          max:99999999,
          flag:false,
          l:100,
          m:200,
          h:500
        },
        //浮动ip
        floatingip:{
          label:this.$t('base.floatIPNum'),
          value:50,
          min:0,
          max:99999999,
          flag:false,
          l:50,
          m:100,
          h:250
        },
        //网络
        network:{
          label:this.$t('base.networkNum'),
          value:100,
          min:0,
          max:99999999,
          flag:false,
          l:100,
          m:200,
          h:500
        },
        //路由
        router:{
          label:this.$t('base.routeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
        //端口
        port:{
          label:this.$t('base.portNum'),
          value:500,
          min:0,
          max:99999999,
          flag:false,
          l:500,
          m:1000,
          h:2500
        },
        //子网
        subnet:{
          label:this.$t('base.subnetNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        }
      };
      this.storeForm = {
        //卷
        volumes:{
          label:Vue.t('base.cloudHardDiskNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        //卷快照
        snapshots:{
          label:Vue.t('base.cloudHardDiskSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:Vue.t('base.cloudDiskAndSnapshotSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
         //云硬盘备份
        backups:{
          label:this.$t('base.cloudHardDiskBakNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        backup_gigabytes:{
          label:this.$t('base.cloudDiskAndBakSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        }
      }
      this.projectModel = {name:"", description:""};
      if (this.$refs.projectForm) {
        this.$refs.projectForm.resetFields();
      }
      this.ochangeFun(4); //新增的時候配額初始化为无限制
      this.visible = true;
    },
    confirmProjectFun() {
      let me = this;
      this.$refs.projectForm.validate((valid) => {
        if (!valid) {
          if (this.activeName!="first") {
            this.$message({
              message: Vue.t('base.projectNameCheck'),
              type: "warning"
            });
          }
          return false;
        }
        me.applyProject();
      });
    },
    applyProject() {
      function convert(obj) {
        let o = {};
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key].flag) {
              o[key] = -1;
            } else {
              o[key] = obj[key].value;
            }
          }
        }
        return o;
      }
      let me = this;
      me.loading = true;
      let orderData = {
        create:{
          name:this.projectModel.name,
          description:this.projectModel.description
        }
      }
      if (this.service.nova) {
        orderData.compute_quota = convert(this.computerForm);
      }
      if (this.service.neutron) {
        orderData.network_quota = convert(this.networkForm);
      }
      if (this.service.cinderv2) {
        orderData.storage_quota = convert(this.storeForm);
      }
      if (this.service.manila) {
        orderData.file_quota = convert(this.fileStoreForm);
      }
      let option = {
        type: 'post',
        url: "api/leo/v1/order/create_order",

        data: JSON.stringify({
          applicant_id:Vue.userId,
          project_id:this.$cookie.get('pid')||"",
          resource_type:"PROJECT.CREATE",
          op_desc:me.projectModel.description,
          order_data:JSON.stringify(orderData)
        }),
        successMsg:Vue.t('base.applySuccess'),
        successFun() {
          me.visible = false;
          me.loading = false;
          me.$emit("clearSelOption", {});
          me.$emit("loadData", {});
        },
        errFun() {
          me.loading = false;
        },
        log:{
          description:{
            en:"user:"+Vue.userName+"apply project",
            zh_cn:"用户:"+Vue.userName+"申请项目"
          },
          target:Vue.logTarget.project
        }
      }
      this.$ajax(option);
    },
    comChangeFun(value, key) {
      this.computerForm[key].value = value;
    },
    networkChangeFun(value, key) {
      this.networkForm[key].value = value;
    },
    storeChangeFun(value, key) {
      this.storeForm[key].value = value;
    },
    fileStoreChangeFun(value, key) {
      this.fileStoreForm[key].value = value;
    },
    ochangeFun(val) {
      let u = val==1?"l":(val==2?"m":(val==3?"h":'nolimit'));
      for (var k in this.computerForm) {
        if (u=='nolimit') {
          this.computerForm[k].flag = true;
        } else {
          this.computerForm[k].flag = false;
          this.computerForm[k].value = this.computerForm[k][u];
        }
      }
      for (var p in this.networkForm) {
        if (u=='nolimit') {
          this.networkForm[p].flag = true;
        } else {
          this.networkForm[p].flag = false;
          this.networkForm[p].value = this.networkForm[p][u];
        }
      }
      for (var q in this.storeForm) {
        if (u=='nolimit') {
          this.storeForm[q].flag = true;
        } else {
          this.storeForm[q].flag = false;
          this.storeForm[q].value = this.storeForm[q][u];
        }
      }
      for (var x in this.fileStoreForm) {
        if (u=='nolimit') {
          this.fileStoreForm[x].flag = true;
        } else {
          this.fileStoreForm[x].flag = false;
          this.fileStoreForm[x].value = this.fileStoreForm[x][u];
        }
      }
    }
  },
  components:{
    InputNumber
  }
}
</script>