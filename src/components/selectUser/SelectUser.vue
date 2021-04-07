<template>
  <div>
    <el-dialog :title="$t('calcStorLang.instChooseUser')" :visible.sync="visible">
      <el-form :inline="true" :model="formInline" class="form-inline">
        <el-form-item :label="$t('base.accountNumber')">
          <el-input v-model="formInline.name" @blur="blurFun('name')"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search' size="small" @click="onQuery">{{$t('base.query')}}</el-button>
        </el-form-item>
      </el-form>
      <el-table ref="deTable" :data="tableData" v-loading="tableLoading" :element-loading-text="$t('base.loadingData')"
                highlight-current-row style="width: 100%"
                @row-dblclick="confirmFun"
                row-key="id" :default-sort="{prop:'name',order:'ascending'}" @current-change="handleSelectionChange">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('base.accountNumber')" min-width="100">
        </el-table-column>
        <!-- <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
            prop="enabled"
            align="center"
            :label="$t('base.status')"
            min-width="100">
            <template scope="scope">
              <span>{{scope.row.enabled==1?$t('base.enable'):$t('base.disable')}}</span>
            </template>
          </el-table-column> -->
        <!-- <el-table-column v-if="columnsChecked.indexOf('dept') >= 0"
            prop="department_name"
            :label="$t('base.department')"
            min-width="100">
          </el-table-column> -->
        <el-table-column v-if="columnsChecked.indexOf('alias') >= 0" prop="alias" :label="$t('base.fullName')" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('locked') >= 0" prop="lock" align="center" :label="$t('base.locked')" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.lock?$t('base.yes'):$t('base.no')}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="description" :label="$t('lang.desc')" min-width="160">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="10">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('network.columnSelected')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="14">
            <el-pagination class="right" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "project",
  props: ['instProjectId'],
  data() {
    return {
      visible: false,
      proList: [],
      treeData: [],
      tableData: [],
      editId: "",
      desc: "asc",
      field: "name",
      tableLoading: false,
      selProjectFlg: false,
      emptyText: Vue.t('base.noData'),
      formInline: {
        deptName: "",
        role_type: "",
        project_id: "",
        projectName: "",
        name: "",
        alias: "",
        email: "",
        phone: ""
      },
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      columns: [{
        prop: "name",
        label: this.$t('base.accountNumber')
      }, {
        prop: "alias",
        label: this.$t('base.fullName')
      }, {
        prop: "locked",
        label: this.$t('base.locking')
      }, {
        prop: "desc",
        label: this.$t('lang.desc')
      }],
      columnsChecked: ["name", "status", "dept", "alias", "locked", "email", "phone", "desc"]
    }
  },
  mounted() {},
  methods: {
    show() {
      document.getElementsByTagName("body")[0].focus();
      this.visible = true;
      this.currentPage = 1;
      this.formInline = {
        name: "",
        project_id: ""
      }
      this.getTableData();
    },
    onQuery() {
      this.getTableData();
    },
    async getTableData(flg = true) {
      this.tableLoading = true;
      var param = { dir: this.order, field: this.field, limit: this.pageSize, page: this.currentPage, domain_id: "default" };
      if (!this.isLdap) {
        let pid = "default";
        if (pid != "default") {
          param.department = pid;
        }
      }
      if ((Vue.roleType + "") == "0") {
        if (this.instProjectId != null && this.instProjectId != "") {
          param.project_id = this.instProjectId;
        }
      } else {
         param.project_id = this.$cookie.get("pid");
      }
      if (this.formInline.role_type) {
        param.role_type = this.formInline.role_type;
      }
      if (this.formInline.name != "") {
        param["name"] = this.formInline.name;
      }
      if (this.formInline.role_type != 0 && this.formInline.project_id) {
        param.project_id = this.formInline.project_id;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/users?" + $.param(param)
      })
      this.tableData = ret.users;
      this.total = ret.total;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
          this.multipleSelection = [];
        });
      }
      this.tableLoading = false;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData(false);
    },
    handleSelectionChange(val) {
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
      }
    },
    confirmFun() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          message: this.$t('calcStorLang.instChooseUser'),
          type: "warning"
        });
        return;
      }
      this.$emit('getSelUser', this.multipleSelection[0].id, this.multipleSelection[0].name);
      this.multipleSelection = [];
      this.visible = false;
    },
    onRefresh() {
      this.multipleSelection = [];
      this.getTableData();
    },
    blurFun(key) {
      if (this.formInline[key].length > 40) {
        this.formInline[key] = '';
        this.$notify({
          message: this.$t('base.ultraLong'),
          type: 'warning'
        });
      }
    }
  }
}

</script>
