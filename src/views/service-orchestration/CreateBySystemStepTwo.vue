<template>
  <div>
    <el-row>
      <el-col :span="14">
        <el-form class="margin-tb20 me-required-form" ref="createBySystemForm" :model="createBySystemForm" :rules=rules label-width="150px">
          <el-form-item :label="$t('lang.name')" prop="cus_name" class="is-required">
            <el-input class="col-12" v-model="createBySystemForm.cus_name" auto-complete="off"></el-input>
          </el-form-item>
  
          <template v-for="(item, index) in templateData">
            <el-form-item :label="$t('heat.' + item.label)" v-if="item.type=='string' && !item.isSelect" :prop="item.key" :class="(item.default === 'notrequired') ? '' : 'is-required'" :rules="item.rules">
              <el-input class="col-12" v-model="createBySystemForm[item.key]" v-if="item.label != 'heat_admin_pass'"></el-input>
              <el-input class="col-12 heatpassword" v-if="item.label === 'heat_admin_pass'" v-model="createBySystemForm[item.key]" :type="inputTytpe(item)">
              </el-input>
              <i :class="[item[item.key + 'showPwdFlag'] ? eye : eyeSlash]" style="position: absolute; margin-left: -22px;margin-top: 8px;" v-if="item.label === 'heat_admin_pass'" @click="showPwd(item)"></i>
            </el-form-item>
            <el-form-item :label="$t('heat.' + item.label)" v-if="item.type=='string' && item.isSelect" :prop="item.key" :class="(item.default === 'notrequired') ? '' : 'is-required'" :rules="item.rules">
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].custom_constraint=='glance.image'">
                <el-option v-for="param in param_imageOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
              </el-select>
              <el-select clearable class="col-12" @change="flavorChange(createBySystemForm[item.key])" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.flavor'">
                <el-option v-for="param in param_flavorOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
              </el-select>
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.network'"
              @change="getSubnetList">
                <el-option v-for="param in param_networkOptions" v-if="param.subnets.length>0" :key="param.id" :label="param.name" :value="param.id"></el-option>
              </el-select>
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.publicnetwork'">
                <el-option v-for="param in param_public_networkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
              </el-select>
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.keypair'">
                <el-option v-for="param in param_keypairOptions" :key="param.name" :label="param.name" :value="param.name"></el-option>
              </el-select>
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnet'">
                <el-option v-for="param in param_subnetOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
              </el-select>
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" filterable v-if="item.constraints[0].custom_constraint=='volume.volumetype'">
                <el-option v-for="param in param_volumeTypeOptions" :key="param.id" :label="getSelectOptionName(param.name)" :title="getSelectOptionTitle(param.name)" :value="param.id"></el-option>
              </el-select>
              <el-select clearable class="col-12" v-model="createBySystemForm[item.key]" v-if="item.constraints[0].allowed_values">
                <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="param" :value="param"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('heat.' + item.label)" v-if="item.type=='number'" :prop="item.key" class="is-required"
            :rules="[{type: 'required', trigger: 'blur change'},
            {type:'integer'}]">
              <el-input-number class="col-12" v-model="createBySystemForm[item.key]" :min="item.min" :max="item.max"></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('base.confirmPassword')" v-if="item.key=='vm_pass'" prop="admin_pass_confirm" :class="'is-required'">
              <el-input class="col-12 heatpassword" v-model="createBySystemForm.admin_pass_confirm" :type="inputTytpe(item)">
              </el-input>
              <i :class="[item[item.key + 'showPwdFlag'] ? eye : eyeSlash]" style="position: absolute; margin-left: -22px;margin-top: 8px;" @click="showPwd(item)"></i>
            </el-form-item>
            <el-form-item :label="$t('base.confirmPassword')" v-if="item.key=='server1_pass'" prop="server1_pass_confirm" :class="'is-required'">
              <el-input class="col-12 heatpassword" v-model="createBySystemForm.server1_pass_confirm" :type="inputTytpe(item)">
              </el-input>
              <i :class="[item[item.key + 'showPwdFlag'] ? eye : eyeSlash]" style="position: absolute; margin-left: -22px;margin-top: 8px;" @click="showPwd(item)"></i>
            </el-form-item>
            <el-form-item :label="$t('base.confirmPassword')" v-if="item.key=='server2_pass'" prop="server2_pass_confirm" :class="'is-required'">
              <el-input class="col-12 heatpassword" v-model="createBySystemForm.server2_pass_confirm" :type="inputTytpe(item)">
              </el-input>
              <i :class="[item[item.key + 'showPwdFlag'] ? eye : eyeSlash]" style="position: absolute; margin-left: -22px;margin-top: 8px;" @click="showPwd(item)"></i>
            </el-form-item>
          </template>
          <el-form-item :label="$t('lang.desc')" prop="cus_description">
            <el-input type="textarea" :rows="2" class="col-12" v-model="createBySystemForm.cus_description" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="10">
        <div class="table_panel" v-if="showDetail">
          <table class="table table-content table-hover idatatable">
            <tbody>
              <thead>
                <tr>
                  <th class="idatath"> <el-tag size="mini">{{$t('calcStorLang.resourceSpec')}}</el-tag></th>
                </tr>
              </thead>
              <tr class="odd">
                <th class="idatath">{{$t('lang.name')}}</th>
                <td class="idatatd">{{detailData.name}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('calcStorLang.cpuCore')}}</th>
                <td class="idatatd">{{detailData.vcpus}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('base.memory')}}(GB)</th>
                <td class="idatatd">{{Number(detailData.ram)/1024}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('container.hardDisk')}}(GB)</th>
                <td class="idatatd">{{detailData.disk}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('calcStorLang.isPublic')}}</th>
                <td class="idatatd">{{detailData['os-flavor-access:is_public']?$t('lang.yes'):$t('lang.no')}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-col>
    </el-row>


  <div class="me-form-footer">
    <el-button @click="cancel">{{this.$t("lang.cancel")}}</el-button>
    <el-button @click="prevStep" type="primary">{{this.$t("lang.preStep")}}</el-button>
    <el-button @click="nextStep" type="primary" :disabled="finishFlag">{{this.$t("lang.finish")}}</el-button>
  </div>
  </div>
</template>
<script>
  export default {
    name: "createBySystemStepTwo",
    props:{
      templateDetail:{
        type:Object,
        default:function () {
          return {}
        }
      },
      finishFlag: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        eye: "el-icon-fa-eye",
        eyeSlash: "el-icon-fa-eye-slash",
        showDetail:false,
        detailData: "",
        createBySystemForm: {
          cus_name: '',
          cus_description: '',
          admin_pass_confirm: '',
          server1_pass_confirm: '',
          server2_pass_confirm: ''
        },
        subnetField:'',
        templateData:[],
        templateContent:this.templateDetail,
        loading: false,
        param_imageOptions:[],
        param_flavorOptions:[],
        param_networkOptions:[],
        param_public_networkOptions:[],
        param_keypairOptions:[],
        param_subnetOptions:[],
        param_volumeTypeOptions:[],
        rules: {
          cus_name: [
            {type: 'required', trigger: 'blur change'},
            {type: 'onlyLetterNumberChinese', trigger: "blur change"},
            {type: 'maxSize', value: 40}
          ],
          cus_description: [
            {type: 'maxSize', value: 255}
          ],
          admin_pass_confirm: [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordEquals', context: this, value: "createBySystemForm.vm_pass" }
          ],
          server1_pass_confirm: [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordEquals', context: this, value: "createBySystemForm.server1_pass" }
          ],
          server2_pass_confirm: [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordEquals', context: this, value: "createBySystemForm.server2_pass" }
          ]
        }
      }
    },
    created() {
      this.initTemplateParam();
      this.getImageList();
      this.getFlavorList();
      this.getNetworkList();
      this.getKeypairList();
      this.getVolumeTypeList();
    },
    methods: {
      inputTytpe(item) {
        return item[item.key + "showPwdFlag"] ? "" : "password";
      },
      showPwd(item) {
        item[item.key + "showPwdFlag"] = !item[item.key + "showPwdFlag"];
        this.inputTytpe(item);
      },
      async flavorChange(val) {
        if (val) {
          let result = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/" + val,
            showErrMsg: true,
            successFun: data => {
              this.detailData = data.flavor;
              this.showDetail = true;
            }
          });
        } else {
          this.showDetail = false;
        }
      },
      initTemplateParam() {
        let parameters = this.templateContent.parameters;
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
            if (data.label === "heat_admin_pass") {
              data[key + "showPwdFlag"] = false;
            }

            // 判断是否为下拉框，判断输入框校验规则
            let isSelect = false;
            let validateRules = [{type: 'required', trigger: 'blur change'}];
            if (data.constraints) {
              let constraints = data.constraints;
              for (let i = 0; i < constraints.length; i++) {
                if (constraints[i].custom_constraint || constraints[i].allowed_values) {
                  validateRules = [{type: 'required', trigger: 'blur change'}];
                  isSelect = true;
                  break;
                }

                if (constraints[i].allowed_pattern) {
                  let newReg = new RegExp(constraints[i].allowed_pattern);
                  validateRules.push({pattern:newReg, message: this.$t('heat.' + constraints[i].description)});
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
              data.rules =
                [{type: 'required', trigger: 'blur change'},
                {type:'maxSize', value:100}];
              if (data.type=="number") {
                data.min = 0;
                data.max = 65535;
              }
            }

            if (data.default && data.default === "notrequired") {
              for (let v of data.rules) {
                switch (v.type) {
                  case "required":
                    v.type = "";
                    break;
                  case "minSize":
                    v.value = 0;
                    break;
                }
              }
            }
            data.isSelect = isSelect;
            if (data.description!= "user_data" && data.description!= "meta_data") {
              pData.push(data);
            }
          }
          this.templateData = pData;
          this.createBySystemForm = Object.assign({}, this.createBySystemForm, pName);

          for (let key of Object.keys(this.createBySystemForm)) {
            if (parameters[key] && parameters[key].default && parameters[key].default != 'notrequired') {
              this.createBySystemForm[key] = parameters[key].default;
            }
          }
        }
      },
      async getImageList() {
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
              image["tags"].includes("*") ) {
              continue;
            }
            if ("2" == roleType || "3" == roleType) {
              if ("private" == image['visibility'] && projectId != image['owner']) {
                continue;
              }
            }
            // 只要“可用”状态的镜像
            if ("active" === image['status']) {
              this.param_imageOptions.push(image);
            }
          }
          // this.param_imageOptions = dataList;
        } catch (data) {
        }
      },
      async getFlavorList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=true"
          });
          let dataList = response.flavors;
          var fResults = [];
          for (let s = 0; s < dataList.length; s++) {
           var obj = dataList[s];
           if (obj.name.indexOf("Bare@") >= 0) {
              continue;
           }
           fResults.push(obj);
          }
          this.param_flavorOptions = fResults;
        } catch (data) {
        }
      },
      async getNetworkList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?not-tags=bm_deploy"
          });
          let dataList = response.networks;
          //this.param_networkOptions = dataList;

          // Public network
          if (dataList && dataList.length > 0) {
            let projectid = this.$cookie.get("pid");
            for (let i = 0; i < dataList.length; i++) {
              let publicnetwork = dataList[i];
              if (publicnetwork["router:external"] === true &&
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true )) {
                this.param_public_networkOptions.push(publicnetwork);
              }
              if (
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true ) &&
                publicnetwork["subnets"].length != 0) {
                this.param_networkOptions.push(publicnetwork);
              }
            }
          }
        } catch (data) {
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
        this.createBySystemForm[this.subnetField] = "";
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
      prevStep() {
        this.$emit("prevStep", 0);
      },
      nextStep() {
        this.$refs.createBySystemForm.validate(async (valid) => {
          if (valid) {
            if (this.finishFlag) return;
            this.$emit("stepTwofinishFlag");
            let formData = Object.assign({}, this.createBySystemForm);
            let newFormData = {};
            let data = {};
            let userStr = "";
            let imageId = formData["image"] == null?formData["vm_image"]:formData["image"];
            let userdataMapping = {
              "user_data": "vm_pass",
              "server1_user_data": "server1_pass",
              "server2_user_data": "server2_pass"
            }
            for (let key of Object.keys(formData)) {
              if (key == "cus_name") {
                newFormData.name = formData[key];
              } else if (key == "cus_description") {
                newFormData.description = formData[key];
              } else {
                if (key != 'admin_pass_confirm' && key != 'server1_pass_confirm' && key != 'server2_pass_confirm') {
                  data[key] = formData[key];
                  if (key == 'user_data' || key == 'server1_user_data' || key == 'server2_user_data') {
                    try {
                      let osDistro = "";
                      for (let item of this.param_imageOptions) {
                        if (item.id == imageId) {
                            if (item.os_distro !=null ) {
                              osDistro = item.os_distro;
                              let ret = await this.$ajax({
                                type: 'POST',
                                url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_adminpass_template",
                                data:JSON.stringify({
                                  admin_pass:formData[userdataMapping[key]],
                                  os_distro:osDistro
                                })
                              })
                            data[key] = ret["user_data"]
                          } else {
                            data[key] = '#!/bin/bash \n echo "'+formData[userdataMapping[key]]+'" | passwd --stdin root \n';
                          }
                        }
                      }
                    } catch (data) {
                      data[key] = '#!/bin/bash \n echo "'+formData[userdataMapping[key]]+'" | passwd --stdin root \n';
                    }
                  } else if (key == 'user_data_format') {
                    data["user_data_format"] = "RAW";
                  }
                }
              }
            }
            if (formData['vm_pass']!=null && formData['vm_pass']!="") {
              data["meta_data"] = {"admin_pass":formData['vm_pass']};
            } else {
              data["server1_meta_data"] = {"server1_admin_pass":formData['server1_pass']};
              data["server2_meta_data"] = {"server2_admin_pass":formData['server2_pass']};
            }
            delete data["admin_pass_confirm"];
            delete data["server1_pass_confirm"];
            delete data["server2_pass_confirm"];
            newFormData.parameters = data;
            this.$emit("stepTwoDone", newFormData);
          } else {
            return false;
          }
        });
      },
      cancel() {
        this.$emit("cancel");
      },
      getSelectOptionName(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value.substring(0, 80);
      }
      return value;
      },
      getSelectOptionTitle(value) {
      if (typeof (value) == "undefined" || null == value) {
        return value;
      }
      if (value.length > 80) {
        return value;
      }
      return '';
      }
    }
  }
</script>
<style>
  .heatpassword input{
    padding-right: 35px;
  }
</style>
