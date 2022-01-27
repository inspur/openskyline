<template>
  <div>
    <el-form ref="editInstanceForm">
      <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loading" :element-loading-text="$t('calcStorLang.dataLoading')" @current-change="handleSelectionChange">
        <el-table-column type="expand" align="left" width="55">
          <template slot-scope="scope">
            <instance-detail :InstanceId="scope.row.id" :projectMaps="projectMaps" :userMaps="userMaps" :flavorMaps="flavorMaps" style="width:600px"></instance-detail>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" min-width="50">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('id') >= 0" prop="id" label="ID" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" :label="$t('lang.status')" align="left">
          <template slot-scope="scope">
            <instance-status :status="scope.row.status" />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5" style="text-align: left;">
          <el-button type="text" icon="fa-refresh" @click="onRefresh" />
        </el-col>
        <el-col :span="19">
          <el-pagination
            class="right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import InstanceStatus from '../../instance/InstanceStatus';
import InstanceDetail from './InstanceDetail';
export default {
  name: 'InstanceList',
  props: ["hostname", "pageCount"],
  components: { InstanceDetail, InstanceStatus },
  data() {
    return {
      loading: false,
      columnsChecked: ['name', 'id', 'status'],
      InstanceId:"",
      columns: [{
        prop: "name",
        label: this.$t('lang.name')
      }, {
        prop: "id",
        label: "ID"
      }, {
        prop: "status",
        label: this.$t('lang.status')
      }],
      currentPage: 1,
      total: 0,
      pageSize: 5,
      totalData:[],
      tableData: [],
      multipleSelection: [],
      userMaps: new Map(),
      projectMaps: new Map(),
      flavorMaps: new Map(),
      vmListMap: new Map(),
      dialogVisible: false
    }
  },
  watch: {
    hostname: {
      immediate: false,
      handler: function(rows, oldVal) {
        var self = this;
        self.getData();
      }
    }
  },
  mounted() {
    var self = this;
    Promise.all([self.loadProjectList(), self.loadUserList(), self.loadFlavorList()]).then(function(result) {
      self.getData();
    });
  },
  methods: {
    async getData() {
      var self = this;
      let data = [];
      self.multipleSelection = [];
      self.loading = true;
      try {
        let params = {
          soft_deleted: true,
          all_tenants: 1,
          'not-tags': encodeURIComponent('@'),
          limit: 999999,
          host: this.hostname
        };
        const paramsStr = Object.keys(params).map(key => {
          return `${key}=${params[key]}`;
        }).join('&');
        let result = await self.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers/detail?${paramsStr}`
        });
        let servers = result.servers;
        self.totalData = servers;
        self.total = servers.length;
        self.refreshData();
        self.loading = false;
      } catch (res) {
        self.loading = false;
        __DEV__ && console.error(res);
      }
    },
    async loadProjectList() {
      var self = this;
      var url = "api/keystone/v3/projects?domain_id=default";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        var list = result['projects'];
        for (var p = 0; p < list.length; p++) {
          var obj = list[p];
          self.projectMaps.set(obj.id, obj.name);
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadUserList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/keystone/v3/users?dir=asc&field=name'
        });
        var list = result['users'];
        for (var u = 0; u < list.length; u++) {
          var obj = list[u];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadFlavorList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/flavors'
        });
        var list = result['flavors'];
        for (var u = 0; u < list.length; u++) {
          var obj = list[u];
          self.flavorMaps.set(obj.id, obj.name);
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      this.multipleSelection = [];
      this.getData();
    },
    handleSelectionChange(val) {
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.refreshData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refreshData();
    },
    refreshData() {
      let self = this;
      let list = self.tablePageInation(self.totalData);
      self.getCurrentData(list);
    },
    tablePageInation(data) {
      let self = this;
      let array = [];
      this.total = data.length;
      let startNum = 0;
      let endNum = 0;
      startNum = (this.currentPage - 1) * this.pageSize;
      if (this.currentPage * this.pageSize < this.total) {
        endNum = this.currentPage * this.pageSize;
      } else {
        endNum = this.total;
      }
      array = data.slice(startNum, endNum);
      return array;
    }
  }
}

</script>
<style scoped>


</style>
