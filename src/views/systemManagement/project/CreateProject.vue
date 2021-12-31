<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" class="sys-edit-project-dialog">
      <el-tabs v-model="activeName" class="tabs-nopadding" type="border-card" v-loading="loading" :element-loading-text="text" @tab-click="tabClick">
        <el-tab-pane :label="$t('base.projectInformation')" name="first" v-if="!!editInfoFlg">
          <el-form ref="projectForm" :model="projectModel" :rules="rules" class="me-required-form" label-width="100px">
            <el-form-item :label="$t('base.name')" class="is-required" prop="name">
              <el-input auto-complete="off" :disabled="!canModifyName" v-model="projectModel.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('base.desc')" prop="description">
              <el-input type="textarea" v-model="projectModel.description"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="$t('base.projectMembers')" name="second" v-if="!!editMemFlg">
          <div>
            {{$t('base.authorityDescription')}}
            <el-tooltip effect="dark">
              <div slot="content" v-html="message"></div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <div slot="header" class="clearfix">
                  <span>{{$t('base.allUser')}}</span>
                  <el-input v-model="input1" size="small" style="float:right;width:65%;position:relative;top:-4px;" :readonly="selValue1==0" @focus="getDeptFun('input1', 'selValue1')">
                    <el-select v-model="selValue1" slot="prepend" size="small" @change="input1=''" style="width:80px;">
                      <el-option :label="$t('base.accountNumber')" value="1"></el-option>
                      <el-option :label="$t('base.department')" value="0"></el-option>
                    </el-select>
                    <el-button slot="append" icon="search" size="small" @click="lproMemSearch"></el-button>
                  </el-input>
                </div>
                <div style="height: 290px;overflow: auto;">
                  <template v-for="item in projectUsers">
                    <div class="alluser1" :title="item.name" v-if="item.show!==false">
                      <div :style="style2">{{item.name}}</div>
                      <el-button style="position:absolute;right:0px;top:2px;" type="primary" :uid="item.id" icon="plus" size="small" @click="memberPlusFun"></el-button>
                    </div>
                  </template>
                  <div :style="style0" v-if="currentPage*50<total" @click="getMoreUsers"><a>{{$t('base.lookMore')}}</a></div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <div slot="header" class="clearfix">
                  <span>{{$t('base.projectMembers')}}</span>
                  <el-input v-model="input2" size="small" style="float:right;width:65%;position:relative;top:-4px;" :readonly="selValue2==0" @focus="getDeptFun('input2', 'selValue2')">
                    <el-select v-model="selValue2" slot="prepend" size="small" @change="input2=''" style="width:80px;">
                      <el-option :label="$t('base.accountNumber')" value="1"></el-option>
                      <el-option :label="$t('base.department')" value="0"></el-option>
                    </el-select>
                    <el-button slot="append" icon="search" size="small" @click="rproMemSearch"></el-button>
                  </el-input>
                </div>
                <div style="height: 290px;overflow: auto;">
                  <template v-for="item in projectMembers">
                    <div class="alluser1" v-if="item.show!==false">
                      <el-tooltip placement="top">
                        <div slot="content">
                          <span>{{$t('base.haveRoles')}}:</span>
                          <template v-for="role in item.roles"><span>{{role.role_name+";"}}</span></template>
                        </div>
                        <div :style="style3" :title="item.name"><i v-if="item.roles[0].role_type==2" class="el-icon-fa-user" style="margin-right: 5px;"></i>{{item.name}}</div>
                      </el-tooltip>
                      <el-button type="primary" :uid="item.id" icon="minus" size="small" style="position:absolute;right:0px;top:2px;" @click="memberMinusFun"></el-button>
                      <el-button type="primary" :uid="item.id" icon="setting" @click="userSetRole" :title="$t('base.roleSetting')" size="small" style="position:absolute;right:40px;top:2px;"></el-button>
                    </div>
                  </template>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane :label="$t('base.group')" name="third" v-if="!isLdap&&!!editGroupFlg">
          <div>
            {{$t('base.authorityDescription')}}
            <el-tooltip effect="dark">
              <div slot="content" v-html="message"></div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <div slot="header" class="clearfix">
                  <span>{{$t('base.allGroup')}}</span>
                  <el-input v-model="input3" size="small" style="float:right;width:65%;position:relative;top:-4px;">
                    <el-button slot="append" icon="search" size="small" @click="lproGroupSearch"></el-button>
                  </el-input>
                </div>
                <div style="height: 290px;overflow: auto;">
                  <template v-for="item in groups">
                    <div class="alluser1" :title="item.name" v-if="(item.show||item.eshow)&&item.flg!='remove'">
                      <div :style="style2">{{item.name}}</div>
                      <el-button style="position:absolute;right:0px;top:2px;" type="primary" :uid="item.id" icon="plus" size="small" @click="groupPlusFun"></el-button>
                    </div>
                  </template>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <div slot="header" class="clearfix">
                  <span>{{$t('base.group')}}</span>
                  <el-input v-model="input4" size="small" style="float:right;width:65%;position:relative;top:-4px;">
                    <el-button slot="append" icon="search" size="small" @click="rproGroupSearch"></el-button>
                  </el-input>
                </div>
                <div style="height: 290px;overflow: auto;">
                  <template v-for="item in projectGroups">
                    <div class="alluser1" v-if="item.show||item.eshow">
                      <el-tooltip placement="top">
                        <div slot="content">
                          <span>{{$t('base.haveRoles')}}:</span>
                          <template v-for="role in item.roles"><span>{{role.role_name+";"}}</span></template>
                        </div>
                        <div :style="style3" :title="item.name"><i v-if="item.roles[0].role_type==2" class="el-icon-fa-user" style="margin-right: 5px;"></i>{{item.name}}</div>
                      </el-tooltip>
                      <el-button type="primary" :uid="item.id" icon="minus" size="small" style="position:absolute;right:0px;top:2px;" @click="groupMinusFun"></el-button>
                      <el-button type="primary" :uid="item.id" icon="setting" @click="groupSetRole" :title="$t('base.roleSetting')" size="small" style="position:absolute;right:40px;top:2px;"></el-button>
                    </div>
                  </template>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane :label="$t('base.quota')" name="fourth" v-if="!!editQuotaFlg">
          <div style="line-height: 26px;position: relative;top:-5px;" v-if="status==0&&regionList.length>1">{{$t('base.createQuotaPrompt')}}</div>
          <el-radio-group v-model="quotaTemplate" @change="ochangeFun" v-if="status==0" >
            <el-radio :label="1">{{$t('base.smallQuota')}}</el-radio>
            <el-radio :label="2">{{$t('base.mediumQuota')}}</el-radio>
            <el-radio :label="3">{{$t('base.largeQuota')}}</el-radio>
            <el-radio :label="4">{{$t('base.unlimited')}}</el-radio>
          </el-radio-group>

          <!-- <el-button style="margin-left:16px;margin-bottom:4px;" size="mini" type="primary" @click="setQuotaStatus(true)">{{$t('base.quotaSet1')}}</el-button>
          <el-button style="margin-left:16px;margin-bottom:4px;" size="mini" type="primary" @click="setQuotaStatus(false)">{{$t('base.quotaSet2')}}</el-button> -->

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
                  <!-- <el-input-number v-if="!item.flag" auto-complete="off" style="width:410px;" :min="item.min" :max="item.max" v-model="item.value"></el-input-number> -->
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
                    <!-- <el-input-number v-if="!item.flag" auto-complete="off" style="width:410px;" :min="item.min" :max="item.max" v-model="item.value"></el-input-number> -->
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
                    <!-- <el-input-number v-if="!item.flag" auto-complete="off" style="width:410px;" :min="item.min" :max="item.max" v-model="item.value"></el-input-number> -->
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
            <el-collapse-item :title="$t('calcStorLang.objectStorage')" name="5" v-if="service.S3">
              <el-form label-width="190px" ref="s3objStoreForm">
                <template v-for="(item,key) in s3objStoreForm">
                  <el-form-item :label="item.label">
                    <input-number v-if="!item.flag" :min="item.min" :max="item.max" style="width:380px;" :val="item.value" :p="key" @change="objectStoreChangeFun"></input-number>
                    <el-tooltip effect="dark" v-if="!item.flag">
                      <div slot="content">{{$t('base.optionalRange')+':'+item.min+"~"+item.max}}</div>
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
        <el-button :disabled="btnFlg" type="primary" @click="confirmProjectFun">{{$t('base.confirm')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('base.roleSetting')" :visible.sync="roleSettingFlg">
      <el-form ref="roleSetForm" label-width="120px" label-position="left" :model="roleSet" :rules="roleSetRule" v-loading="loadingR">
        <!-- <el-form-item :label="$t('base.roleType')">
          <el-select v-model="roleSet.roleType" style="width:500px;" @change="roleTypeChange" placeholder="">
            <el-option :label="$t('base.projectAdmin')" :value="2"></el-option>
            <el-option :label="$t('base.projectUser')" :value="3"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('base.role')" v-if="roleSet.roleType==2" prop="roleValue1">
          <el-select v-model="roleSet.roleValue1" multiple style="width:500px;" size="small" placeholder="">
            <el-option v-for="item in roleList" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.role')" v-if="roleSet.roleType==3" prop="roleValue2">
          <el-select v-model="roleSet.roleValue2" multiple style="width:500px;" size="small" placeholder="">
            <el-option v-for="item in roleList" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleSettingFlg=false">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="roleSettingFun">{{$t('base.confirm')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('base.roleSetting')" :visible.sync="roleSettingFlg1">
      <el-form ref="roleSetForm1" label-width="120px" label-position="left" :model="roleSet1" :rules="roleSetRule1">
        <el-form-item :label="$t('base.roleType')">
          <el-select v-model="roleSet1.roleType" style="width:500px;" @change="roleTypeChange1" placeholder="">
            <el-option :label="$t('base.projectAdmin')" :value="2"></el-option>
            <el-option :label="$t('base.projectUser')" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.role')" v-if="roleSet1.roleType==2" prop="roleValue1">
          <el-select v-model="roleSet1.roleValue1" style="width:500px;" size="small" placeholder="">
            <el-option v-for="item in roleList1" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.role')" v-if="roleSet1.roleType==3" prop="roleValue2">
          <el-select v-model="roleSet1.roleValue2" style="width:500px;" size="small" placeholder="">
            <el-option v-for="item in roleList1" :key="item.role_id" :value="item.role_id" :label="item.role_name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleSettingFlg1=false">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="roleSettingFun1">{{$t('base.confirm')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('base.selectDepartment')" :visible.sync="getDeptFlg">
      <el-card>
        <ztree
          ref="deZtree"
          :data="treeData"
          :setting="setting"
          style="position: relative; min-height: 300px;max-height: 400px;"
          ></ztree>
        <h2 style="text-align: center; min-height: 300px;" v-if="!treeData || treeData.length<0">{{emptyText}}</h2>
      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button @click="getDeptFlg=false">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmDeptFun">{{$t('base.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import AWS from 'aws-sdk';
const Base64 = require('js-base64').Base64;
import InputNumber from './InputNumber'
export default {
  name:"CreateProject",
  data() {
    return {
      editInfoFlg:Vue.AuthList["m.systemmanage.projectmanage.edit"],
      editMemFlg:Vue.AuthList["m.systemmanage.projectmanage.updateperson"],
      editGroupFlg:Vue.AuthList["m.systemmanage.projectmanage.updategroup"],
      editQuotaFlg:Vue.AuthList["m.systemmanage.projectmanage.updatequota"],
      regionList:Vue.regionList,
      service:Vue.service,
      isLdap:Vue.isLdap,
      text:"",
      loadtext:Vue.t('base.loadingData'),
      savetext:Vue.t('base.sendingData'),
      currentPage:1,
      total:0,
      userId:Vue.userId,
      visible:false,
      status: "0", //代表新增
      treeData:[],
      roleSettingFlg:false,
      roleSettingFlg1:false,
      getDeptFlg:false,
      loading:false,
      loadingR:false,
      projectInfoFlg:false,
      projectMemFlg:false,
      projectGroupFlg:false,
      projectQuotaFlg:false,
      addQuotaFlg:false,
      activeNames:["1", "2", "3", "4", "5"],
      projectUsers:[],
      projectMembers:[],
      groups:[],
      projectGroups:[],
      selValue1:'1',
      selValue2:'1',
      input1:'',
      input2:"",
      input3:"",
      input4:"",
      operateId:"",
      searchKey:"",
      roleSet:{
        roleType:"3",
        roleValue1:[],
        roleValue2:[]
      },
      roleList:[],

      roleSet1:{
        roleType:"2",
        roleValue1:[],
        roleValue2:[]
      },
      roleList1:[],

      activeName:"first",
      title:this.$t('base.createProject'),
      btnFlg:false,
      projectModel: {
        name: "",
        description: ""
      },
      canModifyName: true,
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
      roleSetRule:{
        roleValue1:[{required:true, message:Vue.t('base.selectRole'), trigger:'change', type:'array'}],
        roleValue2:[{required:true, message:Vue.t('base.selectRole'), trigger:'change', type:'array'}]
      },

      roleSetRule1:{
        roleValue1:[{required:true, message:Vue.t('base.selectRole'), trigger:'change'}],
        roleValue2:[{required:true, message:Vue.t('base.selectRole'), trigger:'change'}]
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
          label:this.$t('base.fileStoreNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:this.$t('base.fileStoreSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
        snapshots:{
          label:this.$t('base.fileStorageSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:200,
          h:500
        },
        snapshot_gigabytes:{
          label:this.$t('base.fileStoreSnapshotSizeNum'),
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
          label:this.$t('base.cloudHardDiskNum'),
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
          label:this.$t('base.cloudHardDiskSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:this.$t('base.cloudDiskAndSnapshotSizeNum'),
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
      },
      // S3对象存储配额
      s3objStoreForm: {
        max_buckets:{
          label:this.$t('storage.max_buckets'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        max_objects:{
          label:this.$t('storage.max_objects'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        max_size_kb:{
          label:this.$t('storage.max_capacity'),
          value:10,
          min:0,
          max:99999,
          flag:false,
          l:10,
          m:20,
          h:50
        }
      },
      setting: {
        check : {
          enable : false
        },
        data : {
          simpleData : {
            enable : true
          },
          key:{
            name:"name"
          }
        },
        callback: {
          onClick: this.onTreeNodeClick
        }
      },
      style0:{
        height:'34px',
        lineHeight:'34px',
        position: 'relative',
        textAlign:'center',
        color: '#3372a9',
        cursor: 'pointer'
      },
      style1:{
        height:'34px',
        lineHeight:'34px',
        position: 'relative'
      },
      style2:{
        overflow:'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        paddingRight:'40px'
      },
      style3:{
        overflow:'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        paddingRight:'80px'
      },
      message:[
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription1'),
        '</div>',
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription2'),
        '</div>',
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription3'),
        '</div>',
        '<div style="line-height: 26px;">',
          Vue.t('base.authorityDescription4'),
        '</div>'
      ].join(''),
      quotaStatus:0
    }
  },
  mounted() {
    console.log(Vue.service)
  },
  methods:{
    show(obj, activeName) {
      this.currentPage = 1;
      this.projectUsers = [];
      this.text = this.loadtext;
      this.visible = true;
      this.projectInfoFlg = false;
      this.projectQuotaFlg = false;
      this.projectMemFlg = false;
      this.projectGroupFlg = false;
      this.addQuotaFlg = false;
      this.loading = false;
      this.btnFlg = false;
      this.selValue1 = "1";
      this.selValue2 = '1';
      this.input1 = '';
      this.input2 = "";
      this.input3 = '';
      this.input4 = "";
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
          label:this.$t('base.fileStoreNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:this.$t('base.fileStoreSizeNum'),
          value:1000,
          min:0,
          max:99999999,
          flag:false,
          l:1000,
          m:2000,
          h:5000
        },
        snapshots:{
          label:this.$t('base.fileStorageSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        snapshot_gigabytes:{
          label:this.$t('base.fileStoreSnapshotSizeNum'),
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
      // S3对象存储配额
      this.s3objStoreForm = {
        max_buckets:{
          label:this.$t('storage.max_buckets'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        max_objects:{
          label:this.$t('storage.max_objects'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        max_size_kb:{
          label:this.$t('storage.max_capacity'),
          value:1024,
          min:0,
          max:99999,
          flag:false,
          l:10,
          m:20,
          h:50
        }
      };
      this.storeForm = {
        //卷
        volumes:{
          label:this.$t('base.cloudHardDiskNum'),
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
          label:this.$t('base.cloudHardDiskSnapshotNum'),
          value:10,
          min:0,
          max:99999999,
          flag:false,
          l:10,
          m:20,
          h:50
        },
        gigabytes:{
          label:this.$t('base.cloudDiskAndSnapshotSizeNum'),
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
      if (activeName) {
        this.activeName = activeName;
        this.title = this.$t('base.editProject');
        this.status = "1";//编辑
        this.projectModel = $.extend({}, this.projectModel, obj);
        this.canModifyName = true;
        if (this.projectModel.name === 'admin') {
          this.canModifyName = false;
        }
        this.loadData(activeName);
      } else {
        this.canModifyName = true;
        this.status = "0";//新增
        this.title = this.$t('base.createProject');
        this.activeName = "first";
        this.projectModel = {name:"", description:""};
        if (this.$refs.projectForm) {
          this.$refs.projectForm.resetFields();
        }
        this.ochangeFun(4); //新增的時候配額初始化为无限制
      }
    },
    async loadData(name) {
      if (name=="first") {
        this.projectInfoFlg = true;
      }
      if (name=="second") {
        await this.loadProjectMember();
      }
      if (name == "third") {
        await this.loadProjectGroup();
      }
      if (name == "fourth") {
        await this.loadQuota();
        this.setScrollTop();
      }
    },
    async loadQuota() {
      let pid = this.$cookie.get("pid");
      if (this.service.cinderv2) {
        let storeret = await this.$ajax({
          type: 'get',
          url: "api/cinderv2/v2/"+pid+"/os-quota-sets/"+this.projectModel.id
        })
        let ustoreret = await this.$ajax({
          type: 'get',
          url: "api/cinderv2/v3/"+pid+"/os-quota-sets/"+this.projectModel.id+"?usage=true"
        })
        for (var skey in this.storeForm) {
          if (this.storeForm.hasOwnProperty(skey)) {
            if (storeret.quota_set[skey]==-1) {
              this.storeForm[skey].flag = true;
              this.storeForm[skey].value = ustoreret.quota_set[skey]["in_use"];
            } else {
              this.storeForm[skey].value = storeret.quota_set[skey];
            }
            //this.storeForm[skey].value = storeret.quota_set[skey];
            this.storeForm[skey].min = ustoreret.quota_set[skey]["in_use"];
          }
        }
      }
      if (this.service.neutron) {
        let netret = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/quotas/"+this.projectModel.id
        })
        let unetret = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/quotas/"+this.projectModel.id+"/details.json"
        })
        for (var nkey in this.networkForm) {
          if (this.networkForm.hasOwnProperty(nkey)) {
            if (netret.quota[nkey]==-1) {
              this.networkForm[nkey].flag = true;
              this.networkForm[nkey].value = unetret.quota[nkey]["used"];
            } else {
              this.networkForm[nkey].value = netret.quota[nkey];
            }
            this.networkForm[nkey].min = unetret.quota[nkey]["used"];
          }
        }
      }
      if (this.service.nova) {
        let comret = await this.$ajax({
          type: 'get',
          url: "api/nova/v2/os-quota-sets/"+this.projectModel.id
        })
        let ucomret = await this.$ajax({
          type: 'get',
          url: "api/nova/v2/os-quota-sets/"+this.projectModel.id+"/detail"
        })
        for (var ckey in this.computerForm) {
          if (this.computerForm.hasOwnProperty(ckey)) {
            if (comret.quota_set[ckey]==-1) {
              this.computerForm[ckey].flag = true;
              this.computerForm[ckey].value = ucomret.quota_set[ckey]["in_use"];
            } else {
              this.computerForm[ckey].value = comret.quota_set[ckey];
            }
            //this.computerForm[ckey].value = comret.quota_set[ckey];
            this.computerForm[ckey].min = ucomret.quota_set[ckey]["in_use"];
          }
        }
      }
      if (this.service.manila) {
        let fileStoreRet = await this.$ajax({
          type: 'get',
          url: "api/manila/v2/"+pid+"/quota-sets/"+this.projectModel.id
        })
        let ufileStoreRet = await this.$ajax({
          type: 'get',
          url: "api/manila/v2/"+pid+"/quota-sets/"+this.projectModel.id+"/detail"
        })
        for (var lkey in this.fileStoreForm) {
          if (this.fileStoreForm.hasOwnProperty(lkey)) {
            if (fileStoreRet.quota_set[lkey]==-1) {
              this.fileStoreForm[lkey].flag = true;
              this.fileStoreForm[lkey].value = ufileStoreRet.quota_set[lkey]["in_use"];
            } else {
              this.fileStoreForm[lkey].value = fileStoreRet.quota_set[lkey];
            }
            //this.fileStoreForm[lkey].value = fileStoreRet.quota_set[lkey];
            this.fileStoreForm[lkey].min = ufileStoreRet.quota_set[lkey]["in_use"];
          }
        }
      }
      this.projectQuotaFlg = true;
      // Get对象存储配额
      if (this.service.S3) {
        let self = this;
        let utcDate = new Date();
        utcDate = utcDate.toUTCString().replace("GMT", "+0000");
        let stringToSign = `GET\n\napplication/json\n\nx-amz-date:${utcDate}\n/admin/user`;
        if (!Vue.S3SuperUser || !Vue.S3SuperUser.ak || !Vue.S3SuperUser.sk) {
          throw new Error("please config the ak and sk of S3SuperUser");
        }
        let ak = Vue.S3SuperUser.ak.trim();
        let sk = Vue.S3SuperUser.sk.trim();
        sk = Base64.decode(sk);
        let singnature = AWS.util.crypto.hmac(sk, stringToSign, 'base64', 'sha1');
        let uid = this.projectModel.id + "$" + this.projectModel.id;
        let option = {
          type: 'GET',
          url: `api/S3/admin/user?quota=true&uid=${uid}&quota-type=user`,
          showErrMsg: false,
          headers: {
            "x-amz-date" : utcDate,
            "Authorization" : "AWS " + ak + ":" + singnature,
            'Content-Type': "application/json"
          },
          errFun(res) {
            self.s3objStoreForm.max_buckets.flag = true;
            self.s3objStoreForm.max_objects.flag = true;
            self.s3objStoreForm.max_size_kb.flag = true;
          }
        }
        let s3result = await this.$ajax(option);
        if (s3result) {
          if (s3result["max_buckets"] == -1) {
            this.s3objStoreForm.max_buckets.flag = true;
            this.s3objStoreForm.max_buckets.value = 0;
          } else {
            this.s3objStoreForm.max_buckets.value = s3result["max_buckets"];
          }
          if (s3result["max_objects"] == -1) {
            this.s3objStoreForm.max_objects.flag = true;
            this.s3objStoreForm.max_objects.value = 0;
          } else {
            this.s3objStoreForm.max_objects.value = s3result["max_objects"];
          }
          if (s3result["max_size_kb"] == -1) {
            this.s3objStoreForm.max_size_kb.flag = true;
            this.s3objStoreForm.max_size_kb.value = 0;
          } else {
            this.s3objStoreForm.max_size_kb.value = parseInt(s3result["max_size_kb"]/1024/1024);
          }
        }
      }
    },
    confirmProjectFun() {
      let me = this;
      if (this.$refs.projectForm) {
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
          if (this.status=="0") {
            me.addProject();
          } else {
            me.editProject();
          }
        });
      } else {
        me.editProject();
      }
    },
    async editProject() {
      try {
        this.loading = true;
        this.text = this.savetext;
        this.btnFlg = true;
        if (this.projectInfoFlg&&this.editInfoFlg) {
          let ret = await this.$ajax({
            type: 'patch',
            url: "api/keystone/v3/projects/"+this.projectModel.id,
            data: JSON.stringify({project:this.projectModel}),
            log:{
              description:{
                en:"edit project:"+this.projectModel.name,
                zh_cn:"编辑项目:"+this.projectModel.name
              },
              target:Vue.logTarget.project
            }
          })
        }
        this.$message.success(this.$t('base.editProjectSuc'));
        if (this.projectQuotaFlg&&this.editQuotaFlg) {
          await this.updateQuota(this.projectModel.id);
        }
        if (this.projectMemFlg&&this.editMemFlg) {
          await this.updateMember(this.projectModel.id);
        }
        if (this.projectGroupFlg&&this.editGroupFlg) {
          await this.updateGroup(this.projectModel.id);
        }
        this.loading = false;
        this.btnFlg = false;
        this.visible = false;
        this.$emit('refreshData');
      } catch (data) {
        this.loading = false;
        this.btnFlg = false;
        this.visible = false;
      }
    },
    async addProject() {
      try {
        this.loading = true;
        this.text = this.savetext;
        this.btnFlg = true;
        let obj = {
          project: {
            description: this.projectModel.description,
            domain_id: "default",
            enabled: true,
            is_domain:false,
            name: this.projectModel.name
          }
        };
        //创建项目
        let ret = await this.$ajax({
          type: 'post',
          url: "api/keystone/v3/projects",
          data: JSON.stringify(obj),
          log:{
            description:{
              en:"create project:"+obj.project.name,
              zh_cn:"创建项目:"+obj.project.name
            },
            target:Vue.logTarget.project
          }
        })
        this.$message.success(this.$t('base.createProjectSuc'));
        if (this.editQuotaFlg) {
          await this.updateQuota(ret.project.id, false);
        }
        if (this.projectMemFlg) {
          await this.updateMember(ret.project.id, false);
        }
        if (this.projectGroupFlg) {
          await this.updateGroup(ret.project.id, false);
        }
        //由于leo那边是每个region部署了一套，但是项目那边keystone是所有region共享的
        //所以需要每个region下创建一个默认的审批流程
        for (const key in Vue.regionServices) {
          if (Vue.regionServices.hasOwnProperty(key)) {
            const element = Vue.regionServices[key];
            if (element && element["leo"]) {
              this.addDefaultFlow(ret.project, key);
            }
          }
        }
        this.visible = false;
        this.loading = false;
        this.btnFlg = false;
        this.$emit('refreshData');
      } catch (e) {
        this.loading = false;
        this.btnFlg = false;
        this.visible = false;
        __DEV__ && console.error(e);
      }
    },
    async addDefaultFlow (project, regionId) {
      let self = this;
      let resourceIds= await this.getResourceIdList(regionId);
      let reqdata = {
        "name": project.name+"_default_flow",
        "node_number": 1,
        "auto_approve": true,
        "op_desc": Vue.t('base.project') + ':"' + project.name + '"' + Vue.t('base.CREATE_PROJECT_APPRPVAL_PROGRESS'),
        "creator_role": Vue.roleType,
        "project_ids": project.id,
        "resource_ids": resourceIds,
        "node_info": [{
          "node_rule": "ANYPASS",
          "approvers_ids": Vue.userId
        }]
      };
      try {
        let result = self.$ajax({
          type: "POST",
          url: "api/leo/v1/flow/create_flow",
          data: JSON.stringify(reqdata),
          regionId: regionId,
          showErrMg: false,
          success: function(result) {
            self.loading = false;
          },
          errFun: function() {
          },
          log:{
            description:{
              en:"Create default process:"+project.name+" default flow",
              zh_cn: "创建项目:" + project.name+"的默认审批流程"
            },
            target:Vue.logTarget.process_manage
          },
          errorKey: "NeutronError"
        });
     } catch (res) {
     }
    },
    async getResourceIdList(regionId) {
      let self = this;
      let resultData = [];
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/leo/v1/resource/get_flow_resource",
          regionId: regionId
        });
        let resource = ret.resource || [];
        let temp = "1,";
        for (let i = 0; i < resource.length; i++) {
            temp = temp + resource[i].id + ',';
        }
        temp = temp.substr(0, temp.length-1);
        return temp;
      } catch (data) {
      }
    },
    async updateQuota(id, flag=true) {
      function convert(obj) {
        let o = {};
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key].flag) {
              o[key] = -1;
            } else {
              o[key] = parseInt(obj[key].value);
            }
          }
        }
        return o;
      }
      let me = this;
      //更新计算配额
      if (this.service.nova) {
        let option = {
          type: 'put',
          url: "api/nova/v2/os-quota-sets/"+id,
          data: JSON.stringify({
            quota_set:convert(this.computerForm)
          })
        }
        if (flag) {
          option.log = {
            description:{
              en:"project("+this.projectModel.name+") update quotas",
              zh_cn:"项目("+this.projectModel.name+")修改配额"
            },
            target:Vue.logTarget.project
          }
        }
        if (!flag&&Vue.regionList.length>1) { //如果是新增，且是多个region，需要保存多个region下的配额
          Vue.regionList.forEach(async (region) => {
            if (Vue.regionServices[region.region_id]['nova']) {
              option.regionId = region.region_id;
            }
            await me.$ajax(option);
          })
        } else {
          await this.$ajax(option);
        }
      }
      //更新网络
      if (this.service.neutron) {
        let option = {
          type: 'put',
          url: "api/neutron/v2.0/quotas/"+id,
          data: JSON.stringify({
            quota:convert(this.networkForm)
          })
        }
        if (!flag&&Vue.regionList.length>1) { //如果是新增，且是多个region，需要保存多个region下的配额
          Vue.regionList.forEach(async (region) => {
            if (Vue.regionServices[region.region_id]['neutron']) {
              option.regionId = region.region_id;
            }
            await me.$ajax(option);
          })
        } else {
          await me.$ajax(option);
        }
      }
      //更新存储
      if (this.service.cinderv2) {
        let pid = this.$cookie.get("pid");
        let option = {
          type: 'put',
          url: "api/cinderv2/v2/"+pid+"/os-quota-sets/"+id,
          data: JSON.stringify({
            quota_set:convert(this.storeForm)
          })
        }
        if (!flag&&Vue.regionList.length>1) { //如果是新增，且是多个region，需要保存多个region下的配额
          Vue.regionList.forEach(async (region) => {
            option.regionId = region.region_id;
            if (Vue.regionServices[region.region_id]["cinderv2"]) {
              await me.$ajax(option);
            }
          })
        } else {
          await me.$ajax(option);
        }
      }
      //更新文件存储
      if (this.service.manila) {
        let pid = this.$cookie.get("pid");
        let option = {
          type: 'put',
          url: "api/manila/v2/"+pid+"/quota-sets/"+id,
          data: JSON.stringify({
            quota_set:convert(this.fileStoreForm)
          })
        }
        if (!flag&&Vue.regionList.length>1) { //如果是新增，且是多个region，需要保存多个region下的配额
          Vue.regionList.forEach(async (region) => {
            if (Vue.regionServices[region.region_id]["manila"]) {
              option.regionId = region.region_id;
              await me.$ajax(option);
            }
          })
        } else {
          await me.$ajax(option);
        }
      }
      // 更新对象存储
      if (this.service.S3) {
        this.projectModel.id = id;
        if (flag) {
          // 修改的时候，先检查该项目下有没有用户，没有的话，给他添加当前用户，然后删掉该用户
          me.getUserForS3(id);
        } else {
          // 新建的时候，先查看有没有该项目有没有用户，然后先给他添加一个admin用户，然后删掉该用户
          me.setUserForS3(id);
        }
      }
    },
    async getUserForS3(projectId) {
      let mret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/assignments/projects/"+projectId+"/users",
        showErrMsg: false
      });
      let users = mret.users;
      if (users.length > 0) {
        this.setObjectQuota(true);
      } else {
        this.setUserForS3(projectId);
      }
    },
    // 对象存储，先看看有没有admin
    async setUserForS3(projectId) {
      let self = this;
      let addadminflag = true;
      for (let i=0; i<self.projectMembers.length; i++) {
        let item = self.projectMembers[i];
        if (item.id == Vue.userId) {
          addadminflag = false;
        }
      }
      if (addadminflag) {
        let users = [];
        users.push({
          "user_id": Vue.userId,
          "role_ids":["ProjectAdmin"]
        })
        await this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/assignments/projects/"+projectId,
          showErrMsg: false,
          data: JSON.stringify({
            project_roles:{
              "users":users
            }
          }),
          successFun(res) {
            self.getAkSk(projectId);
          }
        })
      } else {
        self.getAkSk(projectId);
      }
    },
    // 对象存储，如果设置配置，则需要先走一遍查询存储桶的接口
    async getAkSk(projectId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: `api/keystone/v3/users/${Vue.userId}/credentials/OS-EC2`,
          showErrMsg: false
        });
        let credentials = result["credentials"];
        let noAkSK = true;
        for (var i = 0; i < credentials.length; i++) {
          let credential = credentials[i];
          if (Vue.userId === credential["user_id"] && projectId=== credential["tenant_id"]) {
            noAkSK = false;
            let ak = credential["access"];
            let sk = credential["secret"];
            await this.initAWSConfig(ak, sk);
            break;
          }
        };
        if (noAkSK) {
          self.createAkSk(projectId);
        }
      } catch (res) {
      }
    },
    async createAkSk(projectId) {
      let self = this;
      try {
        let body = {
          "tenant_id":projectId
        };
        body = JSON.stringify(body);
        let result = await self.$ajax({
          type: 'POST',
          url: `api/keystone/v3/users/${Vue.userId}/credentials/OS-EC2`,
          data: body,
          showErrMsg: false,
          successFun: function (res, xhr) {
            let credential = res["credential"];
            let ak = credential["access"];
            let sk = credential["secret"];
            self.initAWSConfig(ak, sk);
          }
        });
      } catch (res) {
      }
    },
    async initAWSConfig(ak, sk) {
      let self = this;
      await self.$ajax({
        type: 'post',
        url: 's3-api/cacheAKSK?ak=' + ak + '&sk=' + sk,
        successFun: function (res, xhr) {
          self.loadBucketData();
        }
      });
    },
    loadBucketData() {
      let self = this;
      Vue.s3.listBuckets({
      }, function(err, data) {
        if (err) {
          self.$message.error(Vue.t("lang.queryBucketListFailed"));
        } else {
          self.setObjectQuota(false);
        }
      });
    },
    async setObjectQuota(flg = false) {
      function convert(obj) {
        let o = {};
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key].flag) {
              o[key] = -1;
            } else {
              o[key] = parseInt(obj[key].value);
            }
          }
        }
        return o;
      }
      let me = this;
      let utcDate = new Date();
      utcDate = utcDate.toUTCString().replace("GMT", "+0000");
      let stringToSign = `PUT\n\napplication/json\n\nx-amz-date:${utcDate}\n/admin/user`;
      if (!Vue.S3SuperUser || !Vue.S3SuperUser.ak || !Vue.S3SuperUser.sk) {
        throw new Error("please config the ak and sk of S3SuperUser");
      }
      let ak = Vue.S3SuperUser.ak.trim();
      let sk = Vue.S3SuperUser.sk.trim();
      sk = Base64.decode(sk);
      let singnature = AWS.util.crypto.hmac(sk, stringToSign, 'base64', 'sha1');
      let uid = this.projectModel.id + "$" + this.projectModel.id;
      let s3Obj = convert(this.s3objStoreForm);
      if (s3Obj.max_size_kb != -1) {
        s3Obj.max_size_kb = s3Obj.max_size_kb*1024*1024;
      }
      let option = {
        type: 'PUT',
        url: `api/S3/admin/user?quota=true&uid=${uid}&quota-type=user&max-objects=`+s3Obj.max_objects+`&max-size-kb=`+s3Obj.max_size_kb+`&max-buckets=`+s3Obj.max_buckets+`&enabled=true`,
        regionId: "",
        showErrMsg: false,
        headers: {
          "x-amz-date" : utcDate,
          "Authorization" : "AWS " + ak + ":" + singnature,
          'Content-Type': "application/json"
        },
        successFun: function (res) {
          if (!flg) {
            // 删除前判断下当前新增中有无admin
            let addadminflag = true;
            for (let i=0; i<me.projectMembers.length; i++) {
              let item = me.projectMembers[i];
              if (item.id == Vue.userId) {
                addadminflag = false;
              }
            }
            if (addadminflag) {
              let users = [];
              users.push({
                "user_id": Vue.userId,
                "role_ids":["ProjectAdmin"]
              });
              me.$ajax({
                type: 'delete',
                url: "api/keystone/v3/inspur/assignments/projects/"+me.projectModel.id,
                data: JSON.stringify({
                  project_roles:{
                    "users":users
                  }
                })
              })
            }
          }
        }
      }
      Vue.regionList.forEach(async (region) => {
        if (Vue.regionServices[region.region_id]["S3"]) {
          option.regionId = region.region_id;
          await me.$ajax(option);
        }
      })
    },
    async updateMember(id, flag=true) {
      let users = [];
      // let removeUsers = [];
      for (let i=0; i<this.projectMembers.length; i++) {
        var item = this.projectMembers[i];
        if (item.flg=="add") {
          users.push({
            "type": 'PUT',
            "user_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push({"roleId": item.role_id});
              });
              return arr
            })(item.roles)
          })
        } else if (item.flg=="remove") {
          users.push({
            "type": 'delete',
            "user_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push({"roleId": item.role_id});
              });
              return arr
            })(item.roles)
          })
        } else if (item.editFlg) {
          if (item.addFlg) {
            users.push({
              "type": 'PUT',
              "user_id": item.id,
              "role_ids":(function(roles) {
                let arr = [];
                roles.forEach((item) => {
                  arr.push({"roleId": item.role_id});
                });
                return arr
              })(item.addRoles)
            })
          } else {
            users.push({
              "type": 'delete',
              "user_id": item.id,
              "role_ids":(function(roles) {
                let arr = [];
                roles.forEach((item) => {
                  arr.push({"roleId": item.role_id});
                });
                return arr
              })(item.deleteRoles)
            })
          }
        }
      };
      users.forEach(item => {
        this.$sequence({
          type: item.type,
          url: `api/keystone/v3/projects/${id}/users/${item.user_id}/roles/{roleId}`,
          params: item.role_ids
        })
      })
    },
    async updateGroup(id, flag=true) {
      let groups = [];
      let removeGroups = [];
      for (let i=0; i<this.projectGroups.length; i++) {
        var item = this.projectGroups[i];
        if (item.flg=="add") {
          groups.push({
            "type": 'PUT',
            "group_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push({"roleId":item.role_id});
              });
              return arr
            })(item.roles)
          })
        } else if (item.flg=="remove") {
          groups.push({
            "type": 'DELETE',
            "group_id": item.id,
            "role_ids":(function(roles) {
              let arr = [];
              roles.forEach((item) => {
                arr.push({"roleId":item.role_id});
              });
              return arr
            })(item.roles)
          })
        } else if (item.editFlg) {
          if (item.addFlg) {
            groups.push({
              "type": 'PUT',
              "group_id": item.id,
              "role_ids":(function(roles) {
                let arr = [];
                roles.forEach((item) => {
                  arr.push({"roleId": item.role_id});
                });
                return arr
              })(item.addRoles)
            })
          } else {
            groups.push({
              "type": 'delete',
              "group_id": item.id,
              "role_ids":(function(roles) {
                let arr = [];
                roles.forEach((item) => {
                  arr.push({"roleId": item.role_id});
                });
                return arr
              })(item.deleteRoles)
            })
          }
        }
      };
      groups.forEach(item => {
        this.$sequence({
          type: item.type,
          url: `api/keystone/v3/projects/${id}/groups/${item.group_id}/roles/{roleId}`,
          params: item.role_ids
        })
      })
    },
    async tabClick() {
      if (this.activeName=="first") {
        this.projectInfoFlg = true;
      }
      if (this.activeName == "second" && !this.projectMemFlg) { //第一次点击项目成员，加载成员信息
        await this.loadProjectMember();
      }
      if (this.activeName == "third" && !this.projectGroupFlg) { //第一次点击项目组，加载组信息
        await this.loadProjectGroup();
      }
      if (this.status==1 && this.activeName == "fourth" && !this.projectQuotaFlg) { //第一次点击项目配额，加载成员信息
        await this.loadQuota();
        this.setScrollTop();
      }
      if (this.status==0&&this.activeName == "fourth" && !this.addQuotaFlg) {
        this.setScrollTop();
        this.addQuotaFlg = true;
      }
    },
    setScrollTop() {
      this.$nextTick(() => {
        let elCollapse = document.getElementsByClassName("el-collapse");
        if (elCollapse[0]) {
          elCollapse[0].scrollTop = 0;
        }
        this.addQuotaFlg = true;
      })
    },
    //加载人员数据
    async loadProjectMember() {
      let users;
      if (this.status=="1") { //首先查出所有的成员
        this.loading = true;
        let mret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/users"
        })
        //遍历成员数据，查询角色数据
        users = mret.users;
        let arr = [];
        for (let i=0; i<users.length; i++) {
           let uret = await this.$ajax({
              type: 'get',
              url: `api/keystone/v3/projects/${this.projectModel.id}/users/${users[i].id}/roles`
            })
            if (uret&&uret.roles&&uret.roles.length>0) {
              let newRoles = uret.roles.map(item => ({...item, role_name: item.name, role_id: item.id}));
              users[i].roles = newRoles;
              users[i].isDefault = false;
              users[i].show = true;
              arr.push(users[i]);
            }
        }
        this.loading = false;
        this.projectMembers = arr;  //获取右侧项目成员
      } else {
        this.projectMembers = [];
        users = [];
      }
      this.getLeftProjectMember(users); //查询左侧不在项目中的人员
      this.projectMemFlg = true;
    },
    async getLeftProjectMember(users) {
      this.projectUsers = [...this.filterUserData(users)];
      this.total = this.projectMembers.length;
    },
    //处理左侧获取到的人员数据，第一：和右侧isDefault!=true的人员对比，剔除右侧已添加过的人员；
    //第二：获取第一页人员的时候，添加因为删除右侧isDefault=true的人员
    filterUserData(users) {
      //剔除
      let me = this;
      for (var i=users.length-1; i>=0; i--) {
        let index = this.projectMembers.findIndex((user) => {
          return !user.isDefault&&user.id==users[i].id;
        })
        if (index>-1) { //重复，需要剔除
          users.splice(i, 1);
        }
      }
      //添加右侧删除人员
      if (this.currentPage==1) {
        let key,
          value;
        if (this.selValue1=="1") { //账号查询
          key = 'name';
        } else { //部门查询
          key = 'department_name';
        }
        value = this.input1;
        //获取右侧删除的默认人员
        let deleteUsers = [];
        this.projectMembers.forEach((ritem) => {
          let item = $.extend({}, ritem);
          if (item.flg=='remove'&&item.isDefault) {
            //如果有过滤条件，需要过滤下
            if (item[key] == null || item[key] == undefined) {
              item[key] = "";
            }
            if ((key=="name"&&item[key].indexOf(value)>-1)||(key=="department_name"&&item[key]==value)) {
              item.show = true;
              item.flg = '';
              deleteUsers.push(item);
            }
          }
        })
        users = [...deleteUsers, ...users];
      }
      return users;
    },
    getMoreUsers() {
      this.currentPage = this.currentPage + 1;
      this.getLeftProjectMember();
    },
    async loadProjectGroup() {
      this.loading = true;
      let mret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/groups"
      })
      //遍历数据将角色数据合并到人员下面
      let groups = mret.groups;
      if (this.status=="1") {
        let arr = [];
        for (let i=0; i<groups.length; i++) {
          //遍历组获取角色数据
          let gret = await this.$ajax({
            type: 'get',
            url: `api/keystone/v3/projects/${this.projectModel.id}/groups/${groups[i].id}/roles`
          })
          if (gret&&gret.roles&&gret.roles.length>0) {
            let newRoles = gret.roles.map(item => ({...item, role_name: item.name, role_id: item.id}));
            groups[i].roles = newRoles;
            groups[i].isDefault = false;
            groups[i].show = true;
            arr.push(groups[i]);
          } else {
            groups[i].show = true;
          }
        }
        this.projectGroups = arr;//获取右侧组
      } else {
        this.projectGroups = [];
      }
      this.loading=false;
      //查询左侧不在项目中的组
      for (var i=groups.length-1; i>=0; i--) {
        let index = this.projectGroups.findIndex((group) => {
          return !group.isDefault&&group.id==groups[i].id;
        })
        if (index>-1) { //重复，需要剔除
          groups.splice(i, 1);
        }
      };
      this.groups = groups;
      this.projectGroupFlg = true;
      // this.groups = this.proGroupSearch2(function(arr) {
      //   let list = [];
      //   arr.forEach((item, index) => {
      //     list.push(item);
      //   })
      //   return list;
      // }(uret.groups));
    },
    lproMemSearch() {
      //this.projectUsers = this.proMemSearch1(this.projectUsers);
      this.currentPage = 1;
      this.projectUsers = [];
      this.getLeftProjectMember();
    },
    rproMemSearch() {
      this.projectMembers = this.proMemSearch2(this.projectMembers);
    },
    lproGroupSearch() {
      this.groups = this.proGroupSearch1(this.groups);
    },
    rproGroupSearch() {
      this.projectGroups = this.proGroupSearch2(this.projectGroups);
    },
    memberPlusFun(ele) { //项目成员新增按钮fun
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      //查找删除的人的索引
      let index = this.projectUsers.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let add = Object.assign({}, this.projectUsers[index]);
      if (!add.roles) {
        add.roles = [];
      }
      if (add.roles.length==0) { //如果没有角色，默认一个内置的项目成员的角色
        add.roles.push({
          role_id:"2237edc845b0451a842e92a0c9e81bbd",
          role_name:"member",
          role_type:3
        })
      }
      //查找右侧中是否已有该人员
      let rindex = this.projectMembers.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let radd = Object.assign({}, add);
      if (rindex<0) { //如果不是右侧删除过来的数据
        add.show = false;
        add.flg = "remove"; //表示在左侧被删除了
        Vue.set(this.projectUsers, index, add);
        radd.flg = "add";
        radd.show = true;
        this.projectMembers.unshift(radd);
      } else { //如果有，则肯定是删除的数据
        this.projectUsers.splice(index, 1);
        radd.flg = "";
        radd.show = true;
        Vue.set(this.projectMembers, rindex, radd);
      }
    },
    groupPlusFun(ele) { //项目组新增按钮fun
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      let index = this.groups.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let add = Object.assign({}, this.groups[index]);
      if (!add.roles) {
        add.roles = [];
      }
      if (add.roles.length==0) { //如果没有角色，默认一个内置的项目成员的角色
        add.roles.push({
          role_id:"2237edc845b0451a842e92a0c9e81bbd",
          role_name:"member",
          role_type:3
        })
      }
      //查找右侧中是否已有该组
      let rindex = this.projectGroups.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let radd = Object.assign({}, add);
      radd.eshow = true;
      if (rindex<0) {
        add.show = false;
        add.eshow = false;
        add.flg = "remove"; //表示在左侧被删除了
        Vue.set(this.groups, index, add);
        radd.flg = "add";
        this.projectGroups.unshift(radd);
      } else { //如果有，则肯定是删除的数据
        this.groups.splice(index, 1);
        radd.flg = "";
        Vue.set(this.projectGroups, rindex, radd);
      }
    },
    memberMinusFun(ele) { //项目成员删除按钮
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      //查找删除的人的索引
      let index = this.projectMembers.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let remove = Object.assign({}, this.projectMembers[index]);
      if (!remove.isDefault) { //如果是新增过来的数据
        // this.projectMembers.splice(index, 1); //删除右侧数据
        remove.show = true;
        remove.flg = "";
        let lremove = Object.assign({}, remove);
        lremove.show = false;
        lremove.flg = "remove";
        Vue.set(this.projectMembers, index, lremove);
        let lindex = this.projectUsers.findIndex(function(value, index, arr) {
          return value.id == id;
        })
        if (lindex>-1) { //左侧存在的话
          Vue.set(this.projectUsers, lindex, remove);
        } else { //不存在的话，(不存在的原因是：重新查询过左侧数据),需要添加到左侧
          this.projectUsers.unshift(remove);
        }
      } else { //如果不是新增过来的,是数据库中本来就存在的
        remove.show = false;
        remove.flg = "remove";
        Vue.set(this.projectMembers, index, remove);
        let lremove = Object.assign({}, remove);
        lremove.show = true;
        lremove.flg = "";
        this.projectUsers.unshift(lremove);
      }
    },
    groupMinusFun(ele) { //项目组删除按钮
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      let index = this.projectGroups.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let remove = Object.assign({}, this.projectGroups[index]);
      if (remove.flg=="add") { //如果是新增过来的数据
        this.projectGroups.splice(index, 1);
        remove.eshow = true;
        remove.flg = "";
        let lindex = this.groups.findIndex(function(value, index, arr) {
          return value.id == id;
        })
        Vue.set(this.groups, lindex, remove);
      } else { //如果不是新增过来的
        remove.eshow = false;
        remove.show = false;
        remove.flg = "remove";
        Vue.set(this.projectGroups, index, remove);
        let lremove = Object.assign({}, remove);
        lremove.eshow = true;
        lremove.flg = "";
        this.groups.unshift(lremove);
      }
    },
    proMemSearch2(arr) { //右侧项目成员查询
      let key,
          value;
      if (this.selValue2=="1") { //账号查询
        key = 'name';
      } else { //部门查询
        key = 'department_name';
      }
      value = this.input2;
      arr.forEach((item) => {
        if (item[key] == null || item[key] == undefined) {
          item[key] = "";
        }
        if (item.flg!="remove"&&((key=="name"&&item[key].toLowerCase().indexOf(value.toLowerCase())>-1)||(key=="department_name"&&(value==""||item[key].toLowerCase()==value.toLowerCase())))) {
          item.show = true;
        } else {
          item.show = false;
        }
      });
      return arr;
    },
    proGroupSearch1(arr) { //左侧项目组查询
      let value = this.input3;
      arr.forEach((item) => {
        if (item["name"] == null || item["name"] == undefined) {
          item.group["name"] = "";
        }
        if (item.flg!="remove"&&(item["name"].indexOf(value)>-1)) {
          item.show = true;
        } else {
          item.show = false;
        }
        item.eshow = false;
      });
      return arr;
    },
    proGroupSearch2(arr) { //右侧项目组查询
      let value = this.input4;
      arr.forEach((item) => {
        if (item["name"] == null || item["name"] == undefined) {
          item.group["name"] = "";
        }
        if (item.flg!="remove"&&(item["name"].indexOf(value)>-1)) {
          item.show = true;
        } else {
          item.show = false;
        }
        item.eshow = false;
      });
      return arr;
    },
    userSetRole(ele) {
      this.operateType = "user";
      this.setRole(ele, this.projectMembers);
    },
    groupSetRole(ele) {
      this.operateType = "group";
      this.setRole(ele, this.projectGroups);
    },
    //临时用,以后修改需求再删掉
    groupSetRole1(ele) {
      this.operateType = "group";
      this.setRole1(ele, this.projectGroups);
    },
    //临时用,以后修改需求再删掉
    async setRole1(ele, arr) {
      this.roleSettingFlg1 = true;
      this.roleSet1.roleValue1 = "";
      this.roleSet1.roleValue2 = "";
      this.roleList1 = [];
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      this.operateId = id;
      let index = arr.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let croles = arr[index].roles;
      this.roleSet1.roleType = parseInt(croles[0].role_type);
      //获取角色名称
      let roles = await this.powerFun1();
      if (this.roleSet1.roleType==2) {
        this.roleSet1.roleValue1 = croles[0].role_id;
      } else {
        this.roleSet1.roleValue2 = croles[0].role_id;
      }
      let list = [];
      for (var k=0; k<roles.length; k++) {
        list.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:roles[k].type
        });
      }
      this.roleList1 = this.$convertRoleLanguage(list, "role_name");
    },
    async setRole(ele, arr) {
      this.roleSettingFlg = true;
      this.roleSet.roleValue1 = [];
      this.roleSet.roleValue2 = [];
      this.roleList = [];
      let id;
      if (ele.target.tagName == "I") {
        id = ele.target.parentElement.getAttribute("uid");
      } else {
        id = ele.target.getAttribute("uid");
      }
      this.operateId = id;
      let index = arr.findIndex(function(value, index, arr) {
        return value.id == id;
      })
      let croles = arr[index].roles;
      this.roleSet.roleType = "3"; //现在只有用户角色
      //获取角色名称
      let roles = await this.powerFun();
      for (var i=0; i<croles.length; i++) {
        if (this.roleSet.roleType==2) {
          this.roleSet.roleValue1.push(croles[i].id);
        } else {
          this.roleSet.roleValue2.push(croles[i].id);
        }
      }
      let list = [];
      for (var k=0; k<roles.length; k++) {
        list.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:3
        });
      }
      this.roleList = this.$convertRoleLanguage(list, "role_name");
    },
    async roleTypeChange() {
      let arr = [];
      let roles = await this.powerFun();
      for (var k=0; k<roles.length; k++) {
        arr.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:3
        });
      }
      this.roleList = this.$convertRoleLanguage(arr, "role_name");
    },
    //临时用
    async roleTypeChange1() {
      let arr = [];
      let roles = await this.powerFun1();
      for (var k=0; k<roles.length; k++) {
        arr.push({
          role_id:roles[k].id,
          role_name:roles[k].name,
          role_type:roles[k].type
        });
      }
      this.roleList1 = this.$convertRoleLanguage(arr, "role_name");
    },
    async powerFun() {
      this.loadingR = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/roles?"+ $.param({type:this.roleSet.roleType})
      });
      this.loadingR = false;
      return ret.roles;
    },
    async powerFun1() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/roles?"+ $.param({type:this.roleSet1.roleType})
      });
      return ret.roles;
    },
    roleSettingFun() {
      let me = this;
      if (this.roleSet.roleType==2) {
        this.$refs.roleSetForm.validateField('roleValue1');
        if (this.roleSet.roleValue1.length==0) {
          return;
        }
      } else {
        this.$refs.roleSetForm.validateField('roleValue2');
        if (this.roleSet.roleValue2.length==0) {
          return;
        }
      }
      this.roleSettingFlg = false;
      let croles = [];
      let arr = this.roleSet.roleType==2?this.roleSet.roleValue1:this.roleSet.roleValue2;
      for (var i=0; i<arr.length; i++) {
        let cindex = this.roleList.findIndex(function(value, index) {
          return value.role_id == arr[i];
        })
        if (cindex>-1) {
          croles.push(this.roleList[cindex]);
        }
      }
      if (this.operateType=="user") {
        let index = this.projectMembers.findIndex(function(value, index, arr) {
          return value.id == me.operateId;
        });
        let deleteRoles = [];
        let addRoles = [];
        if (croles.length > this.projectMembers[index].roles.length) { //说明是增加角色，只获取增加的角色
          for (var j=0; j<croles.length; j++) {
            let cindex = this.projectMembers[index].roles.findIndex(function(value) {
              return value.role_id == croles[j].role_id
            })
            if (cindex == -1) {
              addRoles.push(croles[j])
            }
          }
          this.projectMembers[index].addRoles = addRoles;
          this.projectMembers[index].addFlg = true;
        } else {  //说明是删除角色，只获取删除的角色
          let that = this;
          for (var k=0; k<that.projectMembers[index].roles.length; k++) {
            let cindex = croles.findIndex(function(value) {
              return value.role_id == that.projectMembers[index].roles[k].role_id
            })
            if (cindex == -1) {
              deleteRoles.push(that.projectMembers[index].roles[k])
            }
          }
          this.projectMembers[index].deleteRoles = deleteRoles;
          this.projectMembers[index].deleteFlg = true;
        };
        this.projectMembers[index].roles = croles;
        this.projectMembers[index].editFlg = true;
      } else {
        let index = this.projectGroups.findIndex(function(value, index, arr) {
          return value.id == me.operateId;
        });
        let deleteRoles = [];
        let addRoles = [];
        if (croles.length > this.projectGroups[index].roles.length) { //说明是增加角色，只获取增加的角色
          for (var m=0; m<croles.length; m++) {
            let cindex = this.projectGroups[index].roles.findIndex(function(value) {
              return value.role_id == croles[m].role_id
            })
            if (cindex == -1) {
              addRoles.push(croles[m])
            }
          }
          this.projectGroups[index].addRoles = addRoles;
          this.projectGroups[index].addFlg = true;
        } else {
          let that = this;
          for (var n=0; n<that.projectGroups[index].roles.length; n++) {
            let cindex = croles.findIndex(function(value) {
              return value.role_id == that.projectGroups[index].roles[n].role_id
            })
            if (cindex == -1) {
              deleteRoles.push(that.projectGroups[index].roles[n])
            }
          }
          this.projectGroups[index].deleteRoles = deleteRoles;
          this.projectGroups[index].deleteFlg = true;
        }
        this.projectGroups[index].roles = croles;
        this.projectGroups[index].editFlg = true;
      }
    },
    //临时用
    roleSettingFun1() {
      let me = this;
      if (this.roleSet1.roleType==2) {
        this.$refs.roleSetForm1.validateField('roleValue1');
        if (this.roleSet1.roleValue1=="") {
          return;
        }
      } else {
        this.$refs.roleSetForm1.validateField('roleValue2');
        if (this.roleSet1.roleValue2=="") {
          return;
        }
      }
      this.roleSettingFlg1 = false;
      let croles = [];
      let arr = [this.roleSet1.roleType==2?this.roleSet1.roleValue1:this.roleSet1.roleValue2];
      for (var i=0; i<arr.length; i++) {
        let cindex = this.roleList1.findIndex(function(value, index) {
          return value.role_id == arr[i];
        })
        if (cindex>-1) {
          croles.push(this.roleList1[cindex]);
        }
      }
      let index = this.projectGroups.findIndex(function(value, index, arr) {
        return value.id == me.operateId;
      })
      this.projectGroups[index].roles = croles;
      this.projectGroups[index].editFlg = true;
    },
    getDeptFun(val, selVal) {
      this.searchKey = val;
      if (this[selVal]==0) {
        this.getDeptFlg = true;
        this.$nextTick(async () => {
          let ret = await this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/departments"
          })
          var arr = ret.departments;
          arr.forEach(function(item, key) {
            item.pId = item.parent_id?item.parent_id:"default";
            item.icon = './static/img/ztree/department.png';
          });
          arr.unshift({id:"default", name:Vue.t('base.all'), icon:"./static/img/ztree/department.png"});
          this.treeData = arr;
          this.$nextTick(() => {
            let node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
            this.$refs.deZtree.action("expandNode", node);
          })
        });
      }
    },
    confirmDeptFun() {
      var nodes = this.$refs.deZtree.action("getSelectedNodes");
      if (nodes.length==0) {
        this.$message({
          message: Vue.t('base.selectDepartmentWarn'),
          type: "warning"
        });
        return;
      }
      this[this.searchKey] = nodes[0].id=="default"?"":nodes[0].name;
      this[this.searchKey+"id"] = nodes[0].id=="default"?"":nodes[0].id;
      this.getDeptFlg = false;
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
    objectStoreChangeFun(value, key) {
      this.s3objStoreForm[key].value = value;
    },
    ochangeFun(val) {
      let u = val==1?"l":(val==2?"m":(val==3?"h":'nolimit'));
      for (let k in this.computerForm) {
        if (u=='nolimit') {
          this.computerForm[k].flag = true;
        } else {
          this.computerForm[k].flag = false;
          this.computerForm[k].value = this.computerForm[k][u];
        }
      }
      for (let p in this.networkForm) {
        if (u=='nolimit') {
          this.networkForm[p].flag = true;
        } else {
          this.networkForm[p].flag = false;
          this.networkForm[p].value = this.networkForm[p][u];
        }
      }
      for (let q in this.storeForm) {
        if (u=='nolimit') {
          this.storeForm[q].flag = true;
        } else {
          this.storeForm[q].flag = false;
          this.storeForm[q].value = this.storeForm[q][u];
        }
      }
      for (let x in this.fileStoreForm) {
        if (u=='nolimit') {
          this.fileStoreForm[x].flag = true;
        } else {
          this.fileStoreForm[x].flag = false;
          this.fileStoreForm[x].value = this.fileStoreForm[x][u];
        }
      }
      for (let y in this.s3objStoreForm) {
        if (u=='nolimit') {
          this.s3objStoreForm[y].flag = true;
        } else {
          this.s3objStoreForm[y].flag = false;
          this.s3objStoreForm[y].value = this.s3objStoreForm[y][u];
        }
      }
    },
    setQuotaStatus(flg) {
      Object.keys(this.computerForm).forEach((key) => {
        this.computerForm[key].flag = flg;
      })
      Object.keys(this.networkForm).forEach((key) => {
        this.networkForm[key].flag = flg;
      })
      Object.keys(this.storeForm).forEach((key) => {
        this.storeForm[key].flag = flg;
      })
      Object.keys(this.fileStoreForm).forEach((key) => {
        this.fileStoreForm[key].flag = flg;
      })
    }
  },
  components:{
    InputNumber
  }
}
</script>
<style>
  .sys-edit-project-dialog .el-dialog--small{
    min-width:800px;
  }
</style>