<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.objectStorage')" :show-bottom-border="true" />
    <icos-page>
    <div class="tableCSS">
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="roleType!='0'"/>
      <div class="divider clearfix"></div>
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <el-table ref="objStorTable" :data="tableData" v-loading="loading" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="name" :default-sort="{prop: 'created_at', order: 'descending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column reserve-selection type="selection" align="left" width="55">
        </el-table-column>
        <el-table-column prop="name" :label="$t('lang.name')" align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <column-hover type="button" :content="scope.row.name" :row="scope.row" @clickContent="showDetail" :iconList="iconList"></column-hover>
          </template>
        </el-table-column>
        <el-table-column v-if="false" prop="count" align="left" sortable="custom" :label="$t('lang.objNum')" min-width="100">
          <template slot-scope="scope">
            <span>{{"0"}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="false" prop="size" align="left" sortable="custom" :label="$t('lang.usedStor')" min-width="100">
          <template slot-scope="scope">
            <span>{{"0 KB"}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="false" prop="visibility" align="left" sortable="custom" :label="$t('storage.access')" min-width="100">
          <template slot-scope="scope">
            <span>{{"公有"}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" align="left" sortable="custom" :label="$t('lang.createTime')" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.created_at}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span  v-if="roleType!='0'">{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
          </el-col>
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-row>
      </div>
    </div>
  </icos-page>
    <create-bucket ref="createBucket" @handleAddShow="handleAddShow" @onAddRefresh="onAddRefresh" v-if="createBucketFlg"></create-bucket>
    <bucket-info ref="bucketInfo" v-if="bucketInfoFlg" :bucketName="bucketName" @handleBucketInfoShow="handleBucketInfoShow" @onRefresh="onAddRefresh"></bucket-info>
  </div>
</template>
<script>
import CreateBucket from './CreateBucket';
import BucketInfo from './BucketInfo';

export default {
  name: "BucketList",
  data() {
    return {
      sortObj: {
        sortOrder: "descending",
        sortField: "created_at"
      },
      roleType: Vue.roleType,
      searchBar: {
        conditions: {
          bucketName: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[0-9a-zA-Z_.-]+$/.test(value)) {
                throw new Error(this.$t('validation.bucketNameRule'));
              }
            }
          }
        }
      },
      queryParam: {},
      ak:"",
      sk:"",
      bucketName: "",
      loading: false,
      bucketInfoFlg: false,
      createBucketFlg: false,
      showSettingFlag: false,
      tableData: [],
      totalData: [],
      multipleSelection: [],
      total: 1,
      pageSizes: [10, 20],
      listPara: {
        page: 1,
        pageSize: 10
      },
      iconList: [{
        icon: "el-icon-fa-info-circle el-icon-fa-lg",
        enabled: true,
        handler: function (row) {
          this.bucketName = row.name;
          this.bucketInfoFlg = true;
        }.bind(this)
      }],
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "size",
        label: this.$t('lang.usedStor')
      }, {
        prop: "count",
        label: this.$t('lang.objNum')
      }, {
        prop: "visibility",
        label: this.$t('storage.access')
      }, {
        prop: "created_at",
        label: this.$t('lang.createTime')
      }],
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('lang.createContainer'),
        showflg: (Vue.roleType + "" == "2"),
        readOnly: true,
        handler: function (selectRows) {
          let me = this;
          me.createBucketFlg = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        enable(rowData) {
          return rowData["name"] != "";
        },
        handler: function (selectRows) {
          let self = this;
          self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
          }).then(async ({ value }) => {
            if ("yes" == value.toLowerCase()) {
              let projectId = this.$cookie.get('pid');
              let log = {
                description: {
                  en: "Delete container",
                  zh_cn: "删除存储桶"
                },
                target: Vue.logTarget.storage_object_storage
              };
              const bucket = selectRows[0];
              // 删除桶 - S3
              Vue.s3.deleteBucket({
                Bucket: bucket["name"]
              }, function(err, data) {
                if (err) {
                  self.$recordLog({
                    target: log.target,
                    level: {
                      en:"error",
                      zh_cn:"错误"
                    },
                    description: {
                      en: "Delete bucket" + bucket["name"],
                      zh_cn: "删除存储桶" + bucket["name"]
                    }
                  });
                  let errorMsg = err.toString();
                  if (errorMsg.indexOf("BucketNotEmpty") > -1) {
                    self.$message.error(Vue.t("storage.S3_BUCKET_NOTEMPTY_DELETE_FAILED"));
                    return false;
                  }
                  self.$message.error(Vue.t("lang.deleteBucketFailed"));
                } else {
                  self.$recordLog({
                    target: log.target,
                    level:{
                      en:"info",
                      zh_cn:"信息"
                    },
                    description: {
                      en: "Delete bucket" + bucket["name"],
                      zh_cn: "删除存储桶" + bucket["name"]
                    }
                  });
                  self.$message(Vue.t("lang.sendDeleteSuccess"));
                }
                self.$refs.objStorTable.clearSelection();
                self.loadData();
              });
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }, {
        icon: "fa-cog",
        name: this.$t('lang.setting'),
        showflg: false,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.bucketName = selectRows[0].name;
        }.bind(this)
      }, {
        icon: "fa-cogs",
        name: this.$t('lang.showSetting'),
        showflg: false,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.bucketName = selectRows[0].name;
        }.bind(this)
      }]
    }
  },
  watch: {
    '$route'(to, from) {
      let self = this;
      self.$refs.objStorTable.clearSelection();
    }
  },
  mounted() {
    let self = this;
    self.loading = true;
    self.getAkSk()
  },
  methods: {
    showDetail(row) {
      let containerName = row.name;
      this.$router.push({
        path: '/calculate-storage/object-storage-s3/bucket/'+ containerName +'/objectCatalog'
      });
    },
    toSetting() {
      let containerName = row.name;
      this.$router.push({
        path: '/calculate-storage/object-storage-s3/bucket/'+ containerName +'/bucketSetting'
      });
    },
    async initAWSConfig(ak, sk) {
      let self = this;
      // 暂存ak/sk到session
      await self.$ajax({
        type: 'post',
        url: 's3-api/cacheAKSK?ak=' + ak + '&sk=' + sk,
        successFun: function (res, xhr) {
          self.loadData();
        }
      });
    },
    handleSearch(params) {
      this.queryParam = params;
      this.loadData();
    },
    async loadData() {
      let self = this;
      Vue.s3.listBuckets({

      }, function(err, data) {
        if (err) {
          self.totalData = self.totalData || [];
          self.$message.error(Vue.t("lang.queryBucketListFailed"));
          console.log(err, err.stack);
        } else {
          let buckets = data["Buckets"];
          let resultData = [];
          for (let i = 0; i < buckets.length; i++) {
            const item = buckets[i];
            let name = item["Name"];
            let queryName = self.queryParam.bucketName==undefined?"":self.queryParam.bucketName;
            if (name.indexOf(queryName) >= 0) {
              resultData.push({
                "name": item["Name"],
                "created_at":  Vue.tzTimeFormatter(item["CreationDate"])
              });
            }
          }
          self.totalData = resultData;
          self.loading = false;
        }
      });
    },
    handleBucketInfoShow() {
      this.bucketInfoFlg = false;
    },
    async getAkSk() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: `api/keystone/v3/users/${Vue.userId}/credentials/OS-EC2`,
          showErrMsg: true
        });
        let credentials = result["credentials"];
        let noAkSK = true;
        for (let i = 0; i < credentials.length; i++) {
          let credential = credentials[i];
          if (Vue.userId === credential["user_id"] && this.$cookie.get("pid") === credential["tenant_id"]) {
            noAkSK = false;
            let ak = credential["access"];
            let sk = credential["secret"];
            await this.initAWSConfig(ak, sk);
            break;
          }
        };
        if (noAkSK) {
          self.createAkSk();
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async createAkSk() {
      let self = this;
      try {
        let body = {
          "tenant_id":this.$cookie.get("pid")
        };
        body = JSON.stringify(body);
        let result = await self.$ajax({
          type: 'POST',
          url: `api/keystone/v3/users/${Vue.userId}/credentials/OS-EC2`,
          data: body,
          showErrMsg: true,
          successFun: function (res, xhr) {
            let credential = res["credential"];
            let ak = credential["access"];
            let sk = credential["secret"];
            self.initAWSConfig(ak, sk);
          }
        });
      } catch (res) {
        console.log(res);
        self.loading = false;
      }
    },
    sortChange(column) {
      let self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    handleAddShow() {
      this.createBucketFlg = false;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    onAddRefresh() {
      this.loadData();
    }
  },
  components: {
    CreateBucket,
    BucketInfo
  }
}
</script>
