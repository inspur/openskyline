<template>
  <el-dialog
    :title="$t('task.selectCloudDisk')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false">
    <div class="text-regular module-desc" v-if="this.opt === 'std.create_volume_inc_backups'"><span>{{$t('storage.inBakMustAfterAllBak')}}{{$t('storage.inBakMustAfterAllBak2')}}</span></div>
    <el-form :inline="true" class="form-inline">
      <el-form-item :label="$t('lang.name')" class="" >
        <el-input  size="small" v-model="query_name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="queryserverTable">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table 
       ref="serverTable" 
       :data="serverTableData"
       highlight-current-row
       border
       stripe
       style="width: 100%"
       row-key="id">
      <el-table-column 
        prop="name" 
        :label="$t('lang.name')" 
        align="left" 
        min-width="100">
      </el-table-column>
      <el-table-column 
        prop="status" 
        :label="$t('lang.status')" 
        align="left" 
        min-width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column 
        :label="$t('task.operate')"  
        align="left" 
        min-width="100">
        <template slot-scope="scope">
          <el-button @click.native.prevent="addtoMember(scope.row)" type="text" size="small">{{$t('task.add')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="24">
          <page :totalData="serverTotalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "WorkFlowCreateTriggerTaskVm",
    components: {
    },
    data() {
      return {
        query_name: "",
        serverTableData: [],
        serverTotalData: [],
        rules: {
        },
        activeIndex: 0,
        opt: "",
        flag: false,
        dialogVisible: false
      }
    },
    mounted() {
      // this.getServerList();
    },
    methods: {
      initDialog() {
        var self = this;
        self.dialogVisible = true;
        self.getServerList();
      },
      async getServerList(name="") {
        var self = this;
        var projectId = this.$cookie.get('pid');
        var roleType = Vue.roleType + "";
        let data = {
          with_count: "True"
        };
        if (name) {
          data.name = name;
        }
        data['soft_deleted'] = "False";
        //如果是云硬盘备份 需要过滤掉加密的云硬盘
        if (self.opt === "std.create_volume_backups" || self.opt === "std.create_volume_inc_backups") {
          data.encrypt = "False";
        }
        if ("0" == roleType) {
          data["all_tenants"] = "True";
        }
        if ("3" == roleType) {
          data["user_id"] = Vue.userId;
        }
        let url = "api/cinderv3/v3/" + projectId + "/inspur-volumes/detail?metadata={'store_image_data':'False'}&" + $.param(data);
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: false
          });
          var resultData = result['volumes'];
          var vEntity = '';
          if (name === "") {
            self.serverTotalData = [];
            for (let v = 0; v < resultData.length; v++) {
              if ("" == resultData[v].name || typeof (resultData[v].name) == "undefined" || null == resultData[v].name) {
                resultData[v].name = resultData[v].id;
              }
              if (resultData[v].status == "available" || resultData[v].status == "in-use") {
                if (resultData[v]['storage_type'] =='rbd' && resultData[v]["multiattach"]) {
                } else {
                  self.serverTotalData.push(resultData[v]);
                }
              }
            }
          } else {
            //模糊查询
            self.serverTotalData = [];
            for (let i = 0; i < resultData.length; i++) {
              if ("" == resultData[i].name || typeof (resultData[i].name) == "undefined" || null == resultData[i].name) {
                resultData[i].name = resultData[i].id;
              }
              if (resultData[i].name.indexOf(name) >= 0) {
                if (resultData[i].status == "available" || resultData[i].status == "in-use") {
                  if (resultData[i]['storage_type'] =='rbd' && resultData[i]["multiattach"]) {
                  } else {
                    self.serverTotalData.push(resultData[i]);
                  }
                }
              }
            }
          }
        } catch (res) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.serverTableData = param;
      },
      addtoMember(row) {
        let self = this;
        let resultData = {};
        resultData.resourceId = row["id"];
        resultData.resourceName = row["name"];
        self.$emit("handleAddVolumeShotShow", resultData);
      },
      queryserverTable() {
        this.getServerList(this.query_name);
      },
      statusTagRender(status) {
        if ("available" == status || "reserved" == status) {
           return "success";
        } else if ("deleting" == status) {
           return "gray";
        } else if ("creating" == status || "attaching" == status || "detaching" == status) {
           return "";
        } else if ("error" == status || "error_deleting" == status|| "error_extending" == status || "ERROR" == status || "UNKNOW" == status) {
           return "danger";
        } else if ("in-use" == status || "backing-up" == status || "restoring-backup" == status) {
           return "info";
        } else if ("maintenance" == status) {
           return "warning";
        } else if ("downloading" == status || "uploading" == status ) {
           return "info";
        } else {
          return "";
        }
    },
    statusRender(value, rowData) {
       if ("available" == value) {
         return this.$t('storage.available');
       } else if ("creating" == value) {
         return this.$t('storage.creating');
       } else if ("in-use" == value) {
         return this.$t('storage.inUsing');
       } else if ("reserved" == value) {
         return this.$t('storage.reserved');
       } else if ("attaching" == value) {
         return this.$t('storage.installing');
       } else if ("detaching" == value) {
         return this.$t('storage.uninstaling');
       } else if ("maintenance" == value) {
         return this.$t('storage.migrationing');
       } else if ("deleting" == value) {
         return this.$t('storage.deleting');
       } else if ("error" == value) {
         return this.$t('storage.error');
       } else if ("error_deleting" == value) {
         return this.$t('storage.errorDeleting');
       } else if ("error_extending" == value) {
         return this.$t('storage.extendingError');
       } else if ("backing-up" == value) {
         return this.$t('storage.backUping');
       } else if ("restoring-backup" == value) {
         return this.$t('storage.bakRecoverying');
       } else if ("downloading" == value) {
         return this.$t('storage.downloadImaging');
       } else if ("uploading" == value) {
         return this.$t('storage.uploadImaging');
       } else if ("awaiting-transfer" == value) {
          return this.$t('storage.waitTransfering');
       } else {
          if (value != null) {
            return value;
          } else {
            return '-';
          }
       }
    },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      }
    }
  }
</script>
<style scoped>
</style>