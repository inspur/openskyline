<template>
  <el-dialog
    :title="$t('heat.modifyTemplate')"
    :visible.sync="dialogVisible">
    <el-form
      ref="editTemplateForm"
      :model="editTemplateForm"
      :rules=rules
      v-loading="loading"
      label-width="150px" class="me-required-form">
      <el-form-item :label="$t('lang.name')" prop="cus_name" class="is-required">
        <el-input class="col-12" v-model="editTemplateForm.cus_name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="cus_description">
        <el-input type="textarea" :row="2" class="col-12" v-model="editTemplateForm.cus_description" auto-complete="off"></el-input>
      </el-form-item>

      <!--<template v-for="(item, index) in templateData">
        <el-form-item :label="$t('heat.' + item.label)" v-if="item.type=='string' && !item.constraints[0].visible && item.isSelect" :prop="item.key" class="is-required"
        :rules="item.rules">
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='glance.image'">
            <el-option v-for="param in param_imageOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.flavor'">
            <el-option v-for="param in param_flavorOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.network'"
          @change="getSubnetList">
            <el-option v-for="param in param_networkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnetwork'">
                  <el-option v-for="param in param_subnetworkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.publicnetwork'">
            <el-option v-for="param in param_public_networkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.keypair'">
            <el-option v-for="param in param_keypairOptions" :key="param.name" :label="param.name" :value="param.name"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnet'">
            <el-option v-for="param in param_subnetOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].custom_constraint=='volume.volumetype'">
            <el-option v-for="param in param_volumeTypeOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].allowed_values && !item.constraints[0].transform && !item.constraints[0].visible">
            <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="param" :value="param"></el-option>
          </el-select>
          <el-select class="col-12" v-model="editTemplateForm[item.key]" v-if="item.constraints[0].allowed_values && item.constraints[0].transform && !item.constraints[0].visible">
            <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="$t('heat.' + param)" :value="param"></el-option>
          </el-select>
          <el-tooltip placement="right-start" v-if="item.description">
            <div slot="content">{{$t('heat.' + item.description)}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('heat.' + item.label)" v-if="(item.type=='string' && !item.isSelect) || (item.type=='number' && 'true' == item.constraints[0].input)" :prop="item.key" class="is-required"
        :rules="item.rules">
          <el-input class="col-12" v-if="item.key.indexOf('description') != -1" v-model="editTemplateForm[item.key]" type="textarea" :row="2" auto-complete="off"></el-input>
          <el-input class="col-12" v-if="item.key.indexOf('description') == -1" v-model="editTemplateForm[item.key]"></el-input>
          <el-tooltip placement="right-start" v-if="item.description">
            <div slot="content">{{$t('heat.' + item.description)}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('heat.' + item.label)" v-if="(item.type=='number') && (!item.constraints[0].input)" :prop="item.key" class="is-required"
        :rules="[{type: 'required', trigger: 'blur change'},
        {type:'integer'}]">
          <el-input-number class="col-12" v-model="editTemplateForm[item.key]" :min="item.min" :max="item.max"></el-input-number>
          <el-tooltip placement="right-start" v-if="item.description">
            <div slot="content">{{$t('heat.' + item.description)}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </template>-->
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible=false">{{$t('lang.cancel')}}</el-button>
      <el-button @click="confirm" type="primary" >{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import yaml from "js-yaml";
  export default {
    name: "EditTemplate",
    props:{
      selectedRowData:{
        type:Object,
        default:function () {
          return {}
        }
      }
    },
    data() {
      return {
        dialogVisible: false,
        editTemplateForm: {
          cus_name: '',
          cus_description: ''
        },
        networkField:'',
        subnetField:'',
        loading: false,
        templateData:[],
        param_flavorOptions:[],
        param_imageOptions:[],
        param_networkOptions:[],
        param_subnetworkOptions:[],
        param_public_networkOptions:[],
        param_keypairOptions:[],
        param_subnetOptions:[],
        param_volumeTypeOptions:[],
        rules: {
          cus_name: [
            {type: 'required', trigger: 'blur change'},
            {type: 'onlyLetterNumberChinese', trigger:"blur change"},
            {type: 'maxSize', value: 40}
          ],
          cus_description: [
            {type: 'maxSize', value: 255}
          ]
        }
      }
    },
    methods: {
      show(id, name) {
        this.dialogVisible = true;
        this.initEditTemplateForm();
        //this.getImageList();
        this.getFlavorList();
        this.getNetworkList();
        this.getSubnetWorkList();
        this.getKeypairList();
        this.getVolumeTypeList();
      },
      hide() {
        this.dialogVisible = false;
      },
      async initEditTemplateForm () {
        var self = this;
        self.loading = true;
        let rowData = {};
        let templateContent = {};
        try {
          let response = await this.$ajax({
            type:"get",
            //url:"api/heat/v1/" + this.$cookie.get("pid") + "/template/get_stack_template_detail/" + this.selectedRowData.id
            url:"api/heat/v1/" + this.selectedRowData.tenant + "/template/get_stack_template_detail/" + this.selectedRowData.id
          });
          self.loading = false;
          rowData = response.templatedetail.stacktemplate;
          try {
            if (rowData.template_yaml) {
              templateContent = yaml.safeLoad(rowData.template_yaml);
            } else {
              templateContent = yaml.safeLoad(rowData.template);
            }
          } catch (e) {
            this.$message.error(this.$t('heat.templateFormatterError'));
          }

          console.log(templateContent);
          let parameters = templateContent.parameters;
          let pName = {};
          let pData = [];
          if (parameters) {
            for (let key of Object.keys(parameters)) {
              let data = {};
              pName[key] = '';
              data = Object.assign({}, parameters[key]);
              if (!parameters[key].label) {
                data.label = key;
              }
              data.key = key;
              if (data.constraints && data.constraints[0].custom_constraint == "neutron.subnet") {
                this.subnetField = data.key;
              }
              if (data.constraints && data.constraints[0].custom_constraint == "neutron.network") {
                this.networkField = data.key;
              }

              // 判断是否为下拉框，判断输入框校验规则
              let isSelect = false;
              let validateRules = [{type: 'required', trigger: 'blur change'}];
              if (data.constraints) {
                let constraints = data.constraints;
                for (let i = 0; i < constraints.length; i++) {
                  validateRules = [{type: 'required', trigger: 'blur change'}];
                  if (constraints[i].custom_constraint || constraints[i].allowed_values) {
                    validateRules = [{type: 'required', trigger: 'blur change'}];
                    isSelect = true;
                    break;
                  }
                  if (constraints[i].allowed_pattern) {
                    // let reg = constraints[i].allowed_pattern.substring(1, constraints[i].allowed_pattern.length-1);
                    // let newReg = new RegExp(reg);
                    let newReg = new RegExp(constraints[i].allowed_pattern);
                    validateRules.push({pattern:newReg, message:this.$t('heat.' + constraints[i].description)});
                  }
                  if (constraints[i].length && constraints[i].length.max) {
                    validateRules.push({type:"maxSize", value:constraints[i].length.max});
                  }
                  if (constraints[i].length && constraints[i].length.min) {
                    validateRules.push({type:"minSize", value:constraints[i].length.min});
                  }
                }

                data.rules = validateRules;

                if (data.type=="number") {
                  data.min = data.constraints[0].range.min;
                  data.max = data.constraints[0].range.max;
                }
              } else {
                data.rules = [{type: 'required', trigger: 'blur change'},
                {type:'maxSize', value:100}];
                if (data.type=="number") {
                  data.min = 0;
                  data.max = 65535;
                }
              }
              data.isSelect = isSelect;
              pData.push(data);
            }
            // console.log(pData);
            this.templateData = pData;
            this.editTemplateForm = Object.assign({}, this.editTemplateForm, pName);
          }

          let paramData = rowData.parameters;
          // 存在子网情况下加载子网列表
          if (this.subnetField) {
            this.getSubnetList(paramData[this.networkField]);
          }
          // 初始化页面数据
          for (let key of Object.keys(this.editTemplateForm)) {
            this.editTemplateForm[key] = paramData[key];
          }
          this.editTemplateForm.cus_name = rowData.name;
          this.editTemplateForm.cus_description = rowData.description;
        } catch (data) {
          self.loading = false;
        }
      },
/*      async getImageList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999"
          });
          let dataList = response.images;

          let roleType = Vue.roleType;
          let projectId = this.$cookie.get('pid');
          this.param_imageOptions = [];
          for (let i = 0; i < dataList.length; i++) {
            let image = dataList[i];
            if ("snapshot" == image['image_type'] || typeof (image['block_device_mapping']) != "undefined" ||
              image["name"].indexOf("Bare@") >= 0) {
              continue;
            }
            if ("2" == roleType || "3" == roleType) {
              if ("private" == image['visibility'] && projectId != image['owner']) {
                continue;
              }
            }
            this.param_imageOptions.push(image);
          }
          // this.param_imageOptions = dataList;
        } catch (data) {
        }
      },*/
      async getFlavorList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=true"
          });
          let dataList = response.flavors;
          this.param_flavorOptions = dataList;
        } catch (data) {
        }
      },
      async getNetworkList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks"
          });
          let dataList = response.networks;
          this.param_networkOptions = dataList;

          // Public network
          if (dataList && dataList.length > 0) {
            let projectid = this.$cookie.get("pid");
            this.param_public_networkOptions = [];
            for (let i = 0; i < dataList.length; i++) {
              let publicnetwork = dataList[i];
              if (publicnetwork["router:external"] === true &&
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true )) {
                this.param_public_networkOptions.push(publicnetwork);
              }
            }
          }
        } catch (data) {
        }
      },
      async getSubnetWorkList() {
        let projectId = this.$cookie.get("pid");
      let self = this;
      try {
        self.param_subnetworkOptions = [];
        let resultData = await self.$ajax({
          type: 'post',
          data:JSON.stringify({'project_id':projectId}),
          url: "api/neutron/v2.0/inspur/networkextension/get_subnets_by_project_id"
        });
        let sublist = [];
        for (let i=0; i<resultData.length; i++) { //后台要求只显示IPV4的子网
          if (resultData[i].ip_version == 4) {
            sublist.push(resultData[i]);
          }
        }
        self.param_subnetworkOptions = sublist;
      } catch (res) {
      }
     },
      async getKeypairList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/os-keypairs"
          });
          let dataList = response.keypairs;
          this.param_keypairOptions = dataList;
        } catch (data) {
        }
      },
      async getSubnetList(netId) {
        if (!this.subnetField) {
          return;
        }
        this.editTemplateForm[this.subnetField] = "";
        if (netId) {
          try {
            let response = await this.$ajax({
              type: 'get',
              url: "api/neutron/v2.0/subnets?network_id=" + netId
            });
            let dataList = response.subnets;
            this.param_subnetOptions = dataList;
          } catch (data) {
          }
        }
      },
      async getVolumeTypeList() {
        let projectId = this.$cookie.get("pid");
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/cinderv3/v3/" + projectId + "/types"
          });
          let dataList = response.volume_types;
          this.param_volumeTypeOptions = dataList;
        } catch (data) {
        }
      },
      confirm() {
        let self = this;
        self.$refs.editTemplateForm.validate((valid) => {
          if (valid) {
            let rowData = self.selectedRowData;
            let formData = Object.assign({}, self.editTemplateForm);
            let newFormData = {};
            let data = {};
            for (let key of Object.keys(formData)) {
              if (key == "cus_name") {
                newFormData.name = formData[key];
              } else if (key == "cus_description") {
                newFormData.description = formData[key];
              } else {
                data[key] = formData[key];
              }
            }
            //newFormData.parameters = data;
            //newFormData.parameters.pool_asd_protocol = newFormData.parameters.listener_sda_protocol;
            newFormData.id = rowData.id;

            this.$ajax({
              type:"post",
              url:"api/heat/v1/" + rowData.tenant + "/template/update",
              data:JSON.stringify(newFormData),
              successMsg:Vue.t('storage.updateSuccess'),
              log:{
                description:{
                  en:"Modify heat template:" + newFormData.name,
                  zh_cn:"修改编排模板:" + newFormData.name
                },
                target:Vue.logTarget.heatTemplate
              },
              successFun:() => {
                self.hide();
                this.$emit("refreshData");
              }
            });
          } else {
            return false;
          }
        });
      }
    }
  }
</script>
<style scoped>

</style>
