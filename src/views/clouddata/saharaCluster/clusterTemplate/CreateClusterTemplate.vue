<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-steps :active="activeIndex" process-status="process" finish-status="success" align-center> 
      <el-step :title="$t('container.basicInfo')"></el-step>
      <el-step :title="$t('cloudData.NODE_GROUP')"></el-step>
    </el-steps>
    <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne" :row="row" :editTag="editTag"></step-one>
    <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo" :row="row" :editTag="editTag"></step-two>
  </el-dialog>
</template>
<script>
  import StepOne from './CreateStepOne';
  import StepTwo from './CreateStepTwo';
  export default {
    name: "CreateGuide",
    props: ["editTag", "rowData"],
    components: {
      StepOne, StepTwo
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
          this.title = "修改集群模板";
          self.row = self.rowData;
          console.log(self.row)
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
          self.$refs.stepTwo.editShow();
        });
      },
      stepTwoDone(param) {
        let self = this;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
        let createForm = {
          "plugin_name": "ambari",
          "plugin_version": "2.7",
          "name": self.createTemplateForm.clusterName,
          "node_groups": self.createTemplateForm.nodeGroups,
          "description": self.createTemplateForm.description,
          "is_protected": self.createTemplateForm.isProtected,
          "is_public": self.createTemplateForm.ispublic,
          "anti_affinity": self.createTemplateForm.antiaffinity
        };
        if (self.editTag == "add") {
          this.$ajax({
            type:"post",
            url:"api/sahara/v2/"+self.projectId+"/cluster-templates",
            data:JSON.stringify(createForm),
            successMsg:this.$t('container.createRequest'),
            log:{
              description:{
                en:"Create cluster template:" + self.createTemplateForm.name,
                zh_cn:"创建集群模板:" + self.createTemplateForm.name
              },
              target:Vue.logTarget.saharaTemplate
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
          delete createForm.node_groups;
          this.$ajax({
            type:"patch",
            url:"api/sahara/v2/"+self.projectId+"/cluster-templates/" + self.row.id,
            data:JSON.stringify(createForm),
            successMsg:this.$t('container.modifySuccessMsg'),
            log:{
              description:{
                en:"Modify cluster template:" + self.createTemplateForm.name,
                zh_cn:"修改集群模板:" + self.createTemplateForm.name
              },
              target:Vue.logTarget.saharaTemplate
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