<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-steps :active="activeIndex" process-status="process" finish-status="success" align-center> 
      <el-step :title="$t('container.basicInfo')"></el-step>
      <el-step :title="$t('cloudData.SELECT_NODE_GROUP_PROCESS')"></el-step>
      <el-step :title="$t('cloudData.SELECT_SECURITY_GROUP')"></el-step>
    </el-steps>
    <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne" :row="row" :editTag="editTag"></step-one>
    <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo" :row="row" :editTag="editTag"></step-two>
    <step-three @prevStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree" :row="row" :editTag="editTag"></step-three>
  </el-dialog>
</template>
<script>
  import StepOne from './CreateStepOne';
  import StepTwo from './CreateStepTwo';
  import StepThree from './CreateStepThree';
  export default {
    name: "CreateGuide",
    props: ["editTag", "rowData"],
    components: {
      StepOne, StepTwo, StepThree
    },
    data() {
      return {
        activeIndex: 0,
        dialogVisible: false,
        createTemplateForm:{},
        projectId: this.$cookie.get('pid'),
        row: {},
        title: Vue.t('cloudData.CREATE_NODE_GROUP_TEMPLATE')
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      initDialog() {
        let self = this;
        self.dialogVisible = true;
        if (self.editTag == "edit") {
          this.title = Vue.t('cloudData.Edit_NODE_GROUP_TEMPLATE');
          self.row = self.rowData;
        }
      },
      prevStep(activeIndex) {
        this.activeIndex = activeIndex;
        Vue.scrollToHeader();
      },
      stepOneDone(param) {
        let self = this;
        this.activeIndex = 1;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
        this.$nextTick(() => {
          this.$refs.stepTwo.editShow();
        });
      },
      stepTwoDone(param) {
        let self = this;
        this.activeIndex = 2;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
        this.$nextTick(() => {
          this.$refs.stepThree.editShow();
        });
      },
      stepThreeDone(param) {
        let self = this;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
        console.log(self.createTemplateForm)
        let createForm = {
          "plugin_name": "ambari",
          "plugin_version": "2.7",
          "name": self.createTemplateForm.name,
          "node_processes": self.createTemplateForm.processList,
          "flavor_id": self.createTemplateForm.vmType,
          "floating_ip_pool": self.createTemplateForm.floatingIps,
          "availability_zone": self.createTemplateForm.availabilityZone,
          "auto_security_group": self.createTemplateForm.autoSafe,
          // "image_id": self.createTemplateForm.basicImage,
          "use_autoconfig": self.createTemplateForm.autoConfig,
          "is_public": self.createTemplateForm.ispublic,
          "is_proxy_gateway": self.createTemplateForm.gatewayProxy,
          "is_protected": self.createTemplateForm.isprotected,
          "description": self.createTemplateForm.description
        };
        if (self.createTemplateForm.autoSafe == false) {
          createForm["security_groups"] = self.createTemplateForm.safeList
        }
        if (self.createTemplateForm.basicImage!= '') {
          createForm["image_id"] = self.createTemplateForm.basicImage
        }
        if (self.createTemplateForm.storagePosition == "2") {
          createForm["volumes_per_node"] = parseInt(this.createTemplateForm.storageNum);
          createForm["volumes_size"] = parseInt(this.createTemplateForm.storageSize);
          createForm["volume_type"] = this.createTemplateForm.volumeType;
          createForm["volumes_availability_zone"] = this.createTemplateForm.volumeDomain;
          createForm["volume_local_to_instance"] = this.createTemplateForm.volumeToLocal;
        }
        if (self.editTag == "add") {
          self.$ajax({
            type:"post",
            url:"api/sahara/v2/"+self.projectId+"/node-group-templates",
            data:JSON.stringify(createForm),
            successMsg:this.$t('container.createRequest'),
            log:{
              description:{
                en:"Create node group template:" + self.createTemplateForm.name,
                zh_cn:"创建节点组模板:" + self.createTemplateForm.name
              },
              target:Vue.logTarget.saharaNodeGroup
            },
            successFun:() => {
              this.$emit("handleAddShow", {});
              this.$emit("refreshData");
            },
            errFun:() => {
              this.$emit("handleAddShow", {})
            }
          });
        } else {
          self.$ajax({
            type:"patch",
            url:"api/sahara/v2/"+self.projectId+"/node-group-templates/" + self.row.id,
            data:JSON.stringify(createForm),
            successMsg:this.$t('container.modifySuccessMsg'),
            log:{
              description:{
                en:"Modify node group template:" + self.createTemplateForm.name,
                zh_cn:"修改节点组模板:" + self.createTemplateForm.name
              },
              target:Vue.logTarget.saharaNodeGroup
            },
            successFun:() => {
              this.$emit("handleAddShow", {});
              this.$emit("refreshData");
            },
            errFun:() => {
              this.$emit("handleAddShow", {})
            }
          });
        }
      },
      handleClose() {
        this.$emit("handleAddShow", {});
      },
      cancel() {
        this.$emit("handleAddShow", {});
      }
    }
  }
</script>
<style scoped>

</style>