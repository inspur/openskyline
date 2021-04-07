<template>
  <div>
    <icos-page-header :title="$t('base.certManage')" />
    <icos-page>
      <div class="operation-panel">
        <operation-panel
          :select-rows="multipleSelection"
          :operation-menus="operationMenus">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
      <el-table
        ref="certsTable"
        :data="certsTableData"
        highlight-current-row
        stripe
        border
        style="width: 100%;"
        row-key="secret_ref"
        @row-click="rowClick"
        @selection-change="handleSelectionChange">
        <el-table-column
          reserve-selection
          type="selection"
          width="55" align="center">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('name') >= 0"
          prop="name"
          :label="$t('lang.name')"
          width="260"
          min-width="260">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('status') >= 0"
          prop="status"
          :label="$t('lang.status')"
          align="left"
          width="160"
          min-width="160">
          <template slot-scope="scope">
            <span>{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('secret_ref') >= 0"
          prop="secret_ref"
          label="Ref"
          align="left"
          min-width="300">
          <template slot-scope="scope">
            <span>{{scope.row.secret_ref}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
            <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </el-col>
        </el-row>
      </div>
      <create-cert ref="addPort" v-if="createCertFlag" @handleAddPortShow="handleAddPortShow" @handelCancelShow="handelCancelShow"></create-cert>
    </icos-page>
  </div>
</template>
<script>
import CreateCert from './CreateCert';
export default {
  name:"CertManage",
  components: {
    CreateCert
  },
  data() {
    return {
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "secret_ref",
        label: 'Ref'
      }],
      columnsChecked: ['name', 'status', 'secret_ref'],
      certsTableData: [],
      pageSize: 10,
      currentPage: 1,
      total: 0,
      createCertFlag: false,
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('base.createCert'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.createCertFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('base.delete'),
        showflg: Vue.roleType + "" != '3',
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.$confirm(Vue.t('base.confirmDeleteCert'), Vue.t('base.prompt'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            beforeClose: (action, instance, done) => {
              if (action === "confirm") {
                instance.confirmButtonLoading = true;
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  let secretRef = row['secret_ref'];
                  let uuid = secretRef.substr(secretRef.lastIndexOf('\/') + 1);
                  self.$ajax({
                    type: "DELETE",
                    url: `api/barbican/v1/secrets/${uuid}`,
                    successMsg: Vue.t('base.deleteCertSuccess') + ":" + row["name"],
                    success: function() {
                      self.getData();
                      instance.confirmButtonLoading = false;
                      self.$refs.certsTable.clearSelection();
                      done();
                    },
                    errFun() {
                      instance.confirmButtonLoading = false;
                      self.$refs.certsTable.clearSelection();
                      done();
                    },
                    log:{
                      description:{
                        en:"Delete Cert:"+ (row["name"]),
                        zh_cn:"删除证书:"+ (row["name"])
                      },
                      target:Vue.logTarget.cert
                    }
                  });
                }
              } else {
                done();
              }
            }
          }).then(() => {
            self.getData();
          });
        }.bind(this)
      }]
    };
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: `api/barbican/v1/secrets?secret_type=opaque&sort=name:asc&offset=${(self.currentPage - 1) * self.pageSize}&limit=${self.pageSize}`
      }).then((data) => {
        self.certsTableData = data.secrets;
        self.total = data.total;
      });
    },
    handleSizeChange(val) {
      const $this = this;
      $this.pageSize = val;
      $this.getData();
    },
    handleCurrentChange(val) {
      const self = this;
      self.currentPage = val;
      self.getData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.certsTable.toggleRowSelection(row);
    },
    handleAddPortShow() {
      this.createCertFlag = false;
      this.getData();
    },
    handelCancelShow() {
      this.createCertFlag = false;
    },
    onRefresh() {
      this.$refs.certsTable.clearSelection();
      this.getData();
    }
  }
}
</script>