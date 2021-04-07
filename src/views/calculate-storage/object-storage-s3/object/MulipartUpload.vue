<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="text-align:left;">
        <span>{{$t('storage.multipartFile')}}</span>
      </div>
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus" style="text-align:left">
      </operation-panel>
      <el-table ref="fragmentTable" :data="tableData" highlight-current-row border stripe style="width: 100%;" row-key="uploadId" 
        :default-sort="{prop: 'createTime', order: 'descending'}" @sort-change="sortChange"  @selection-change="handleSelectionChange" v-loading="loading">
        <el-table-column reserve-selection type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('storage.multipartName')" align="left" min-width="100">
          <template slot-scope="scope">
            <column-hover :type="scope.row.type === 'catalog'?'button':'text'" :content="scope.row.name" :row="scope.row" @clickContent="showDetail" :iconList="iconList"></column-hover>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('uploadId') >= 0" prop="uploadId" align="left" :label="$t('storage.uploadId')" min-width="150">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('createTime') >= 0" prop="createTime" align="left" :label="$t('lang.createTime')" min-width="150">
        </el-table-column>
      </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>   
    </el-card>
    <multipart-info v-if="bucketInfoFlg" :bucketName="bucketName" :selectedRow="selectedRow" @handleBucketInfoShow="handleBucketInfoShow"></multipart-info>
  </div>
</template>
<script>
import MultipartInfo from './MultipartInfo';
import dateTimeFormatter from 'utils/dateTimeFormatter';
export default {
  name: "MultipartUpload",
  props: ["bucketName"],
  components: {
    MultipartInfo
  },
  data() {
    return {
      name: "",
      sortObj: {
        sortOrder: "descending",
        sortField: "createTime"
      },
      multipleSelection: [],
      totalData: [],
      tableData: [],
      loading: false,
      bucketInfoFlg: false,
      selectedRow: "",
      iconList: [{
        icon: "el-icon-fa-info-circle el-icon-fa-lg",
        enabled: true,
        handler: function (row) {
          this.selectedRow = row;
          this.bucketInfoFlg = true;
        }.bind(this)
      }],
      columnsChecked: ["name", "uploadId", "createTime"],
      columns: [{
        prop: "name",
        label: this.$t('storage.multipartName')
      }, {
        prop: "uploadId",
        label: this.$t('storage.uploadId')
      }, {
        prop: "createTime",
        label: this.$t('lang.createTime')
      }],
      operationMenus: [{
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.$confirm(this.$t('storage.idDeleteMulti'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            type:'warning'
          }).then(async ({ value }) => {
            self.deleteMultiparts(selectRows);
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    //   this.getFragmentList();
  },
  methods: {
    getFragmentList() {
      let self = this;
      let params = {
        Bucket: self.bucketName
      };
      self.loading = true;
      self.totalData = self.totalData || [];
      Vue.s3.listMultipartUploads(params, function(err, data) {
        if (err) {
          self.loading = false;
        } else {
          self.loading = false;
          let multiList = [];
          let uploads = data["Uploads"] || [];
          if (uploads.length > 0) {
            for (let i=0; i<uploads.length; i++) {
              let ups = uploads[i];
              let multiObject = {};
              let names = ups["Key"].split("/");
              multiObject["name"] = names[names.length-1];
              multiObject["uploadId"] = ups["UploadId"];
              multiObject["createTime"] = dateTimeFormatter(ups["Initiated"]);
              multiObject["Key"] = ups["Key"];
              multiObject["id"] = ups["UploadId"];
              multiList.push(multiObject);
            }
          }
          multiList.sort(self.$sortFormatter("createTime", "descending"));
          self.totalData = multiList;
        }
      });
    },
    sortChange(column) {
       let key = column.prop;
       let keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          this.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    deleteMultiparts(selectedRows) {
      let self = this;
      self.loading = true;
      let index = 0;
      for (let i=0; i<selectedRows.length; i++) {
        let row = selectedRows[i];
        let params = {
          Bucket: self.bucketName,
          Key: row["Key"],
          UploadId: row["uploadId"]
        };
        Vue.s3.abortMultipartUpload(params, function(err, data) {
          if (err) {
            self.loading = false;
            self.$message({
              message: "删除碎片"+row["name"]+"("+row["uploadId"]+")失败",
              type: "error"
            });
            self.$recordLog({
              target: Vue.logTarget.storage_object_storage,
              level:{
                en:"error",
                zh_cn:"错误"
              },
              description: {
                en:`Delete the fregment in Bucket(${self.bucketName}) success`,
                zh_cn: `删除存储桶(${self.bucketName})内的碎片${row["name"]}(${row["uploadId"]})成功`
              }
            });
          } else {
            self.loading = false;
            index++;
            self.$recordLog({
              target: Vue.logTarget.storage_object_storage,
              level:{
                en:"info",
                zh_cn:"信息"
              },
              description: {
                en:`Delete the fregment in Bucket(${self.bucketName}) success`,
                zh_cn: `删除存储桶(${self.bucketName})内的碎片${row["name"]}(${row["uploadId"]})成功`
              }
            });
            self.getFragmentList();
            self.$refs.fragmentTable.clearSelection();
            if (index == selectedRows.length) {
              self.$message({
                message: Vue.t("base.deleteSuccess"),
                type: "success"
              });
            }
          }
        });
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onRefresh() {
      this.$refs.fragmentTable.clearSelection();
      this.getFragmentList();
    },
    showDetail() {
    //   this.bucketInfoFlg = true;
    },
    handleBucketInfoShow() {
      this.bucketInfoFlg = false;
    }
  }
}
</script>
<style scoped>
</style>