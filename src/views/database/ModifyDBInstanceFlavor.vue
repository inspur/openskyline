<template>
  <el-dialog :title="$t('db.modifyFlavor')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="editInstanceForm" :model="editInstanceForm" class="me-required-form" :rules="rules" label-width="100px" v-loading="saving">
      <el-form-item :label="$t('db.currentFlavor')" class="" prop="currentFlavor">
        <span>{{editInstanceForm.currentFlavor}}</span>
      </el-form-item>
      <el-form-item :label="$t('db.flavor')" prop="flavor" class="is-required">
        <el-select class="col-12" v-model="editInstanceForm.flavor">
          <el-option v-for="item in flavorOptions" :key="item.id" :label="item.detail" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'ModifyDBInstanceFlavor',
  props:{
    dbInstanceDetail:{
      type:Object,
      default:() => {
        return {};
      }
    }
  },
  data() {
    return {
      editInstanceForm: {
        currentFlavor:"",
        flavor:""
      },
      flavorMap:{},
      flavorOptions:[],
      saving:false,
      dialogVisible: false,
      rules: {
        flavor: [
          {type: 'required', trigger: 'blur change'}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
      self.getFlavorList();
    },
    // 获取实例规格
    async getFlavorList() {
      let self = this;
      try {
        let publicFlavor = await this.$ajax({
          type: 'get',
          url: "api/nova/v2.1/flavors/detail?is_public=true"
        });
        let privateFlavor = await this.$ajax({
          type: 'get',
          url: "api/nova/v2.1/flavors/detail?is_public=false"
        });
        let dataList = [];
        let idList = [];
        publicFlavor.flavors.forEach(function(obj, index) {
          dataList.push(obj);
          idList.push(obj['id']);
        });
        privateFlavor.flavors.forEach(function(obj, index) {
          if (idList.indexOf(obj['id']) == -1) {
            dataList.push(obj);
          }
        });
        let currentDiskSize = 0;
        for (let d = 0; d < dataList.length; d++) {
          let data = dataList[d];
          // 当前规格硬盘大小
          if (self.dbInstanceDetail.flavor.id == data.id) {
            currentDiskSize = data.disk;
          }
        }
        for (let i = 0; i < dataList.length; i++) {
          let data = dataList[i];
          let detail = data.name + ' (' + data.vcpus + this.$t('db.cores') + ', ' +
                      (data.ram / 1024) + 'GB ' + this.$t('db.memory') + ', ' + data.disk + 'GB ' + this.$t('db.hardDisk') + ')';
          if (data.disk >= 10 && data.disk >= currentDiskSize && data.name.indexOf("Bare@") < 0) {
            data.detail = detail;
            self.flavorOptions.push(data);
          }
          self.flavorMap[data.id] = detail;
        }
        // 初始化当前实例规格
        if (self.flavorMap[self.dbInstanceDetail.flavor.id]) {
          self.editInstanceForm.currentFlavor = self.flavorMap[self.dbInstanceDetail.flavor.id];
        }
      } catch (data) {
      }
    },
    handleCancel() {
      this.$emit("handleAddShow", {});
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    handleConfirm() {
      let self = this;
      this.$refs.editInstanceForm.validate((valid) => {
        if (valid) {
          self.saving = true;
          self.$ajax({
            type:"post",
            url:"api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + self.dbInstanceDetail.id + "/action",
            data:JSON.stringify({
              resize:{
                flavorRef:self.editInstanceForm.flavor
              }
            }),
            successMsg:this.$t('db.modifyRequestSuccessMsg'),
            log:{
              description:{
                en:"Modify database instance:" + self.dbInstanceDetail.name + ", change flavor from " +
                  self.editInstanceForm.currentFlavor + " to " + self.flavorMap[self.editInstanceForm.flavor],
                zh_cn:"修改数据库实例 " + self.dbInstanceDetail.name + " 的实例规格，修改前:" +
                  self.editInstanceForm.currentFlavor + " 修改后:" + self.flavorMap[self.editInstanceForm.flavor]
              },
              target:Vue.logTarget.databaseService
            },
            successFun:() => {
              self.saving = false;
              self.$emit("handleAddShow", {});
              self.$emit("refreshData");
            },
            errFun:() => {
              self.saving = false;
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
