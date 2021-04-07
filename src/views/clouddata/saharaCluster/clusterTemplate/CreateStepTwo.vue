<template>
  <div>
    <el-form class="me-required-form margin-tb20" :model="createTemplateForm" ref="steptwoForm" :rules=rules label-width="100px">
      <el-form-item :label="$t('cloudData.NODE_GROUP')" class="is-required">
        <el-select class="col-12" v-model="nodeGroupId">
          <el-option v-for="item in nodeGroupOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-button type="primary" icon="fa-plus" size="small" style="padding-bottom:4px" @click="addToTable"></el-button>
      </el-form-item>
      <el-form-item>
        <el-table ref="ngTable" :data="ngData" highlight-current-row border stripe style="width: 100%" row-key="id">
          <el-table-column prop="name" :label="$t('lang.name')" align="left" min-width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="name" :label="$t('storage.number')" align="left" min-width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.count"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="$t('network.operation')" align="left" min-width="50">
            <template slot-scope="scope">
              <el-button @click.native.prevent="deleteRow(scope.row)" type="text" size="small">{{$t('network.remove')}}</el-button>
            </template>
            </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.finish')}}</el-button>
  </div>
 </div>
</template>
<script>
export default {
  name: 'StepThree',
  props: ["editTag", "row"],
  data() {
    return {
      createTemplateForm: {
        nodeGroups: []
      },
      nodeGroupId: "",
      nodeGroupOptions: [],
      ngData: [],
      projectId: this.$cookie.get('pid'),
      rules: {
      }
    }
  },
  mounted() {
  },
  methods: {
    editShow() {
      console.log("1----" + this.editTag)
      if (this.editTag == "edit") {
        this.ngData = this.row.node_groups;
      }
      this.geNodeGroupList();
    },
    async geNodeGroupList() {
      let self = this;
      try {
        let ajaxParam = {
          type: "GET",
          url: "api/sahara/v2/" + self.projectId + "/node-group-templates"
        };
        let ret = await this.$ajax(ajaxParam);
        let dataList = ret.node_group_templates;
        for (let i=0; i<dataList.length; i++) {
          dataList[i]["count"] = 1;
        }
        self.nodeGroupOptions = dataList;
      } catch (res) {}
    },
    addToTable() {
      for (let i=0; i<this.nodeGroupOptions.length; i++) {
        if (this.nodeGroupId == this.nodeGroupOptions[i]["id"]) {
          let hasFlag = false;
          for (let j=0; j<this.ngData.length; j++) {
            if (this.ngData[j]["id"] == this.nodeGroupId) {
              hasFlag = true;
              break;
            }
          }
          if (!hasFlag) {
            this.ngData.push(this.nodeGroupOptions[i]);
          }
        }
      }
    },
    deleteRow(row) {
      for (let i = 0; i < this.ngData.length; i++) {
        let temp = this.ngData[i];
        if (temp["id"] === row["id"]) {
          this.ngData.splice(i, 1);
        }
      }
    },
    nextStep() {
      if (this.ngData.length < 1) {
        this.$message({
          type:"error",
          message:Vue.t('cloudData.SELECT_ONE_GROUP_AT_LEAST')
        });
        return;
      }
      for (let i=0; i<this.ngData.length; i++) {
        this.createTemplateForm.nodeGroups.push({
          "name": this.ngData[i]["name"],
          "count": parseInt(this.ngData[i]["count"]),
          "node_group_template_id": this.ngData[i]["id"]
        })
      }
      this.$refs.steptwoForm.validate((valid) => {
        if (valid) {
          this.$emit("stepTwoDone", this.createTemplateForm);
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}
</script>
