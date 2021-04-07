<template>
  <el-dialog
    :title="$t('db.createDatabase')"
    :visible.sync="dialogVisible"
    :before-close="handleCancel"
    v-dialogDrag>
    <el-form
      ref="createDatabaseForm" 
      class="me-required-form"
      :model="createDatabaseForm" 
      :rules=rules 
      label-width="100px"
      v-loading="loading">
      <el-form-item :label="$t('lang.name')" prop="dbName" class="is-required">
        <el-input class="col-12" v-model="createDatabaseForm.dbName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('db.characterSet')" prop="characterSet" class="is-required">
        <el-select class="col-12" v-model="createDatabaseForm.characterSet" :disabled="isMongo" filterable allow-create @change="characterSetChange">
          <el-option v-for="item in characterSetOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('db.sortRule')" prop="collection" class="is-required">
        <el-select class="col-12" v-model="createDatabaseForm.collection" :disabled="isMongo" filterable allow-create>
          <el-option v-for="item in collectionOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="confirm" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "CreateDatabase",
    props:{
      dbInstanceDetail:{
        type:Object,
        default:() => {
          return {};
        }
      },
      // 是否是从数据库服务列表发起
      createByService:{
        type:Boolean,
        default:() => {
          return true;
        }
      }
    },
    data() {
      return {
        createDatabaseForm: {
          dbName: '',
          characterSet: 'utf8',
          collection: 'utf8_general_ci'
        },
        isMongo:false,
        dialogVisible: false,
        loading:false,
        saving: false,
        datastoreType:"",
        characterSetOptions:[
          {name: "utf8"},
          {name: "big5"},
          {name: "binary"}
        ],
        collectionOptions:[],
        collectionMaps:{
          "utf8": [
              {name: "utf8_general_ci"}
          ],
          "big5": [
              {name: "big5_chinese_ci"}
          ],
          "binary": [
              {name: "binary"}
          ]
        },
        rules: {
          dbName: [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber'},
            {type:'minSize', value:2},
            {type: 'maxSize', value: 40}
          ],
          characterSet:[
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber'},
            {type: 'maxSize', value: 20}
          ],
          collection:[
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber_NoChinese'},
            {type: 'maxSize', value: 20}
          ]
        }
      }
    },
    mounted() {
      console.log(this.dbInstanceDetail);
       this.initDialog();
    },
    methods: {
      initDialog() {
        this.dialogVisible = true;
        if (this.dbInstanceDetail && this.dbInstanceDetail.datastoreType) {
           this.datastoreType = this.dbInstanceDetail.datastoreType;
        }
        if (this.createByService) {
          // this.databaseType = this.dbInstanceDetail.datastoreType;
          this.changeDatabaseRule(this.dbInstanceDetail.datastoreType);
        } else {
          this.getDatabaseInstanceDetail();
        }
      },
      // 获取数据库实例详情
      async getDatabaseInstanceDetail() {
        let self = this;
        self.loading = true;
        let instanceId = this.$route.params.instanceId;
        await this.$ajax({
          type: 'get',
          url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId,
          successFun:(ret) => {
            self.datastoreType = ret.instance.datastore.type;
            self.changeDatabaseRule(self.datastoreType);
          }
        });
        self.loading = false;
      },
      changeDatabaseRule(databaseType) {
        if (databaseType == "mongodb") {
          this.isMongo = true;
          this.rules.dbName = [
            {type: 'required', trigger: 'blur change'},
            {type:'minSize', value:2},
            {type:'maxSize', value:10},
            {type:'onlyLetterNumber'}
          ];
        } else {
          this.isMongo = false;
          this.rules.dbName = [
            {type: 'required', trigger: 'blur change'},
            {type:'minSize', value:2},
            {type:'maxSize', value:40},
            {type:'onlyLetterNumber'}
          ];
        }
      },
      handleCancel() {
        this.$emit("handleAddShow", {});
      },
      characterSetChange(value) {
        this.createDatabaseForm.collection = "";
        let dataList = this.collectionMaps[value];
        if (dataList && dataList.length > 0) {
            this.collectionOptions = dataList;
        } else {
            this.collectionOptions = [];
        }
      },
      confirm() {
        let self = this;
        this.$refs.createDatabaseForm.validate((valid) => {
          if (valid) {
            self.saving = true;
            let dataBody = {
              name:self.createDatabaseForm.dbName
            };
            if (self.createDatabaseForm.collection) {
              dataBody.collate = self.createDatabaseForm.collection;
            }
            if (self.createDatabaseForm.characterSet) {
              dataBody.character_set = self.createDatabaseForm.characterSet;
            }
            dataBody.type = this.datastoreType;
            // 数据库实例ID
            let instanceId = self.dbInstanceDetail.id;
            if (self.createByService) {
              instanceId = self.dbInstanceDetail.id;
            } else {
              instanceId = self.$route.params.instanceId;
            }
            self.$ajax({
              type:"post",
              url:"api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId + "/databases",
              data:JSON.stringify({
                databases:[dataBody]
              }),
              successMsg:this.$t('db.createSuccess'),
              log:{
                description:{
                  en:"Create database:" + self.createDatabaseForm.dbName,
                  zh_cn:"创建数据库:" + self.createDatabaseForm.dbName
                },
                target:Vue.logTarget.databaseService
              },
              successFun:(result) => {
                if (result && result["code"] == "reserved_database") {
                  self.$message.error(Vue.t('db.reservedKeyMsg', self.createDatabaseForm.dbName));
                }
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