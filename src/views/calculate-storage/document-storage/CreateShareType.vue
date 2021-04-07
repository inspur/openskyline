<template>
  <el-dialog :title="$t('storage.createShareStorageType')" :visible.sync="visible" :before-close="hide">
    <span class="cos-9">
    <el-form ref="createShareTypeForm" :model="createShareType" label-width="160px" :rules="rules" class="is-required" label-position="left">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-9" v-model="createShareType.name" auto-complete="off"></el-input>
      </el-form-item>
       <el-form-item :label="$t('storage.bakendStorename')" prop="bakendname" class="is-required" v-if='true'>
        <el-select v-model="createShareType.bakendname" @change="handleChange">
          <el-option v-for="item in backendOptions" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.bakendnameInfo')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <!---------------------------当前写死公有-->
      <el-form-item :label="$t('storage.public')"  class="is-required" prop="isPublic" v-if='true'>
        <el-switch v-model ="createShareType.isPublic" :on-text="$t('storage.yes')" :off-text="$t('storage.no')" disabled></el-switch>
      </el-form-item>
      <!---------------------------支持快照创建文件存储-->
      <el-form-item :label="$t('storage.create_share_from_snapshot_support')" prop="csnapshot" class="is-required" v-if='false'>
        <el-select v-model="createShareType.csnapshot" disabled>
          <el-option v-for="item in typeOptions" :key="item.label" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!---------------------------支持文件快照恢复-->
      <el-form-item :label="$t('storage.revert_to_snapshot_support')" prop="rsnapshot" class="is-required" v-if='false'>
        <el-select v-model="createShareType.rsnapshot" disabled>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!---------------------------支持快照挂载-->
      <el-form-item :label="$t('storage.mount_snapshot_support')" prop="msnapshot" class="is-required" v-if='false'>
        <el-select v-model="createShareType.msnapshot" disabled>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!---------------------------支持创建文件快照-->
      <el-form-item :label="$t('storage.snapshot_support')" prop="ssnapshot" class="is-required" v-if='false'>
        <el-select v-model="createShareType.ssnapshot" disabled>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!---------------------------通用后端驱动-->
      <el-form-item :label="$t('storage.driver_handles_share_servers')" prop="driver" class="is-required" v-if='false'>
        <el-select v-model="createShareType.driver" disabled>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.driverHandlesShareServersConf')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.extraSpecs')" prop="extraSpecs" class="is-required" v-if='false'>
        <el-input class="col-20" v-model="createShareType.extraSpecs" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
    </el-form>
      <el-tag type="success" v-if='createShareType.csnapshot'>{{$t('storage.create_share_from_snapshot_support')}}</el-tag>
      <el-tag type="success" v-if='createShareType.rsnapshot'>{{$t('storage.revert_to_snapshot_support')}}</el-tag>
      <el-tag type="success" v-if='createShareType.msnapshot'>{{$t('storage.mount_snapshot_support')}}</el-tag>
      <el-tag type="success" v-if='createShareType.ssnapshot'>{{$t('storage.snapshot_support')}}</el-tag>
      <el-tag type="success" v-if='createShareType.driver'>{{$t('storage.driver_handles_share_servers')}}</el-tag>
    </span>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"createShareType",
  data() {
    return {
      createShareType:{
        name:"",
        bakendname:"",
        isPublic:true,
        driver:false,
        msnapshot:false,
        rsnapshot:false,
        csnapshot:false,
        ssnapshot:false,
        extraSpecs:""
      },
      visible:false,
      saving: false,
      backendOptions:[],
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumber' }
        ],
        /*extraSpecs: [
          { type: 'required', trigger: 'blur change' }
        ],*/
        bakendname: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_MinusNumber' }
        ],
        driver: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      typeOptions:[{value:true, label:this.$t('storage.true')}, {value:false, label:this.$t('storage.false')}]
    }
  },
  mounted() {
    this.loadBackendOptions();
  },
  methods:{
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$emit("handleShow", {});
    },
    handleChange() {
      let item = this.backendOptions.find((item) => item.value == this.createShareType.bakendname);
      let { share_backend_name : bakendname,
            driver_handles_share_servers : driver,
            mount_snapshot_support : msnapshot,
            revert_to_snapshot_support : rsnapshot,
            create_share_from_snapshot_support : csnapshot,
            snapshot_support : ssnapshot
      } = item;
      this.createShareType ={...this.createShareType, bakendname, driver, msnapshot, rsnapshot, csnapshot, ssnapshot};
    },
    async loadBackendOptions() {
      let self = this;
      let url = "api/manila/v2/" + this.$cookie.get("pid") + "/scheduler-stats/pools/detail";
      let type = "GET";
      try {
        let ret = await this.$ajax({
          url: url,
          type: type
        });
        let result = ret["pools"];
        result.forEach( (item, index) => {
          let label = item.backend;
          let capabilities = item["capabilities"];
          let value = capabilities["share_backend_name"];
          let tempObj = {label, value, ...capabilities};
          this.backendOptions.push(tempObj);
        });
      } catch (data) {
        this.loading = false;
        this.isDisabled = false;
        __DEV__ && console.error(data);
      }
    },
    confirmFun() {
      this.$refs.createShareTypeForm.validate(async(valid) => {
        if (valid) {
          this.createShareTypeFun();
        } else {
          return false;
        }
      });
    },
    async createShareTypeFun() {
      let self = this;
      /*var extraSpecsArray = this.createShareType.extraSpecs.split('\n');
      var extraSpecsObj = {};
      for (var i = 0; i < extraSpecsArray.length; i++) {
        var temp = extraSpecsArray[i];
        var tempArray = temp.split('=');
        var key = '';
        var value = '';
        for (var j = 0; j < tempArray.length; j++) {
          if (0 == j) {
            key = tempArray[j];
          } else {
            if ('' == value) {
              value = tempArray[j];
            } else {
              value = value + "=" + tempArray[j];
            }
          }
        }
        if ('' == key || '' == value) {
          //参数有错误
          this.$message({
            showClose: true,
            message: this.$t('storage.pleaseCheckExtraspecs')+":" + temp,
            type: 'warning'
          });
          return;
        } else {
          extraSpecsObj[key] = value;
        }
      }*/
      let { name, isPublic, bakendname, driver, msnapshot, rsnapshot, csnapshot, ssnapshot } = self.createShareType;
      let body = {
        'share_type': {
          'name': name,
          'share_type_access:is_public': isPublic,
          'extra_specs': {
            'share_backend_name': bakendname,
            'driver_handles_share_servers': driver,
            'mount_snapshot_support': msnapshot,
            'revert_to_snapshot_support': rsnapshot,
            'create_share_from_snapshot_support': csnapshot,
            'snapshot_support': ssnapshot
          }
        }
      };
       /*extraSpecsObj['driver_handles_share_servers'] = self.createShareType.driver;
      var body = {'share_type':{'name':typeName, 'share_type_access:is_public':true, 'extra_specs':extraSpecsObj}};*/
      body = JSON.stringify(body);
      let header = {
        'X-Openstack-Manila-Api-Version': 2.46
      };
      let url = "api/manila/v2/" + this.$cookie.get("pid") + "/types";
      let type = "post";
      let msg = this.$t('storage.addshareStorageTypeSuccess');
      this.saving = true;
      try {
        let ret = await this.$ajax({
          url: url,
            data: body,
            type: type,
            successMsg: msg,
            headers:header,
            log:{
              description:{
                en:"Create share type:" + name,
                  zh_cn:"创建文件存储类型:" + name
                },
                target:Vue.logTarget.storage_share_type
              }
          });
          this.$emit("handleShow", {});
          this.$emit("addData", {});
          this.saving = false;
        } catch (data) {
          this.saving = false;
          __DEV__ && console.error(data);
        }
      }
    }
  }
</script>