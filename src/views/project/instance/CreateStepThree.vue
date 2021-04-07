<template>
  <el-form class="margin-tb20"  label-position="left" :model="projectCreateForm" :rules=rules ref="projectCreateForm" label-width="150px">
    <el-form-item label="选择源" prop="netmask" class="is-required">
      <el-input class="col-8" v-model="projectCreateForm.netmask"></el-input>
    </el-form-item>
    <el-form-item label="列表" prop="ipPoolTable">
      <el-table
        ref="acTable"
        :data="tableData"
        v-loading="loading"
        :element-loading-text="$t('lang.defaultLoadingMsg')"
        highlight-current-row
        border
        stripe
        :default-sort = "{prop: 'name', order: 'ascending'}"
        row-key="id">
        <el-table-column
          reserve-selection
          fixed="left"
          type="selection"
          align="center"
          width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
          prop="name"
          label="名称"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('netNum') >= 0"
          prop="netNum"
          show-overflow-tooltip
          align="left"
          label="大小"
          min-width="70">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('netmask') >= 0"
          prop="netmask"
          align="left"
          label="类型"
          show-overflow-tooltip
          min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('vlan') >= 0"
          prop="vlan"
          align="left"
          label="可见性"
          show-overflow-tooltip
          min-width="50">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>当前选中 {{multipleSelection.length}}条</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>请选择列</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <el-pagination
          class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
    </el-form-item>
    <el-form-item>
      <el-button @click="prevStep" type="primary" >上一步</el-button>
      <el-button @click="nextStep" type="primary" >下一步</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'StepTwo',
  data() {
    return {
      activeIndex: 1,
      projectCreateForm: {
        netmask: '',
        ipPoolTable: []
      },
      show: '',
      dialogVisible: false,
      rules: {
        netmask: [
          {type: 'required', trigger: 'blur change'}
        ],
        vlan: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'min', value: 0},
          {type: 'max', value: 4000}
        ]
      },
      currentPage: 1,
      showBorder: true,
      pageSizes: [5, 10, 20],
      pageSize: 5,
      total: 0,
      columns: [{
        prop: "name",
        label: "名称"
      }, {
        prop: "netNum",
        label: "镜像名称"
      }, {
        prop: "netmask",
        label: "IP 地址"
      }, {
        prop: "vlan",
        label: "实例类型"
      }],
      columnsChecked: ['name', 'netNum', 'netmask', 'vlan'],
      tableData: [],
      multipleSelection: [],
      queryParam: {
        "page": 1,
        "pageSize": 5,
        field: "",
        dir: ""
      },
      loading: false
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.projectCreateForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.tableData = this.init(this.currentPage);
  },
  methods: {
    init(page=1) {
      let data = [];
      for (let i = 0; i < 5; i++) {
        data.push({
          id: "id" + page + ( i + 1 ),
          name: '实例名称' + page + (i + 1),
          netNum: "2017-08-09",
          netmask: '100.2.12.' + i,
          shop: 'gdddd',
          vlan: '1'
        })
      }
      return data;
    },
    nextStep() {
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          this.$emit("stepThreeDone", {});
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevThreeStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.init({
        page: this.currentPage,
        pageSize: val
      });
    },
    //分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.init({
        page: val
      });
    },
    onRefresh() {
      this.init();
    }
  }
}
</script>
<style scoped>
</style>