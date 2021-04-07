<template>
  <div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'resource_name', order: 'ascending'}"
      row-key="physical_resource_id"
      @sort-change="sortChange">
      <el-table-column
        v-if="columnsChecked.indexOf('resource_name') >= 0"
        prop="resource_name"
        :label="$t('heat.resources')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100">
        <!-- <template slot-scope="scope">
          <el-button @click="resourceNameRender(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template> -->
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('physical_resource_id') >= 0"
        prop="physical_resource_id"
        :label="$t('heat.resourceId')"
        show-overflow-tooltip
        align="left"
        min-width="100">
<!--         <template slot-scope="scope">
  <el-button @click="resourceIdRender(scope.$index, scope.row)" type="text" size="small">{{scope.row.resourceId}}</el-button>
</template> -->
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('resource_type') >= 0"
        prop="resource_type"
        :label="$t('heat.resourceType')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="80">
        <template slot-scope="scope">
          <span v-html="resTypeRender(scope.row.resource_type)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('creation_time') >= 0"
        prop="creation_time"
        :label="$t('lang.createTime')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
           <span>{{tzTimeFormatter(scope.row.creation_time)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('resource_status') >= 0"
        prop="resource_status"
        :label="$t('lang.status')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="80">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.resource_status)">
            <span>{{statusToCH(scope.row.resource_status)}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('resource_status_reason') >= 0"
        prop="resource_status_reason"
        :label="$t('heat.statusReason')"
        show-overflow-tooltip
        min-width="120">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'OrchestrationRes',
    components: {},
    data () {
      return {
        tzTimeFormatter:this.$tzTimeFormatter,
        stackName:this.$route.params.stackName,
        stackId:this.$route.params.stackId,
        statusToCH:this.$resourceStatusFormatter,
        total: 0,
        columns: [],
        totalData:[],
        columnsChecked:["resource_name", "physical_resource_id", "resource_type", "creation_time", "resource_status", "resource_status_reason"],
        tableData: [],
        loading: false,
        queryParam: {
          field: "",
          dir: ""
        },
        resTypeRender: this.$resourceTypeFormatter
      };
    },
    computed: {
    },
    mounted () {
      let table = this.$refs.table;
      table.$children.forEach((item, index) => {
        if (item.label && item.prop) {
          this.columns.push({
            prop: item.prop,
            label: item.label
          });
        }
      });
      this.getData();
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
          // 如果是当前页面切换分类的情况
      }
    },
    methods: {
       async getData(param) {
        let self = this;
        // self.loading = true;
        let data = {};
        data = JSON.stringify(data);
        Object.assign(this.queryParam, param|| {});
        try {
          let ret = await this.$ajax({
            type: 'get',
            url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/" + this.stackName + "/" + this.stackId +"/resources"
          });
          self.loading = false;

          let projects = ret.resources;
          self.tableData = projects;
          self.totalData = projects;
          self.total = projects.length;
          // 排序
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
        } catch (data) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //排序
      sortChange(column) {
        let self = this;
        let key = column.prop;
        let keyOrder = column.order;
        self.queryParam.key = column.prop;
        self.queryParam.keyOrder = column.order;
        if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }
      },
      //刷新
      onRefresh() {
        this.getData();
      },
      resourceNameRender(rowIndex, rowData) {
        this.$router.push({
          path:"/calculate-storage/instances-list"
        });
      },
      resourceIdRender(rowIndex, rowData) {
        this.$router.push({
          path:"/calculate-storage/instances-list"
        });
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "CREATE_COMPLETE" || value === "CHECK_COMPLETE" ||
          value === "ADOPT_COMPLETE" || value === "DELETE_COMPLETE" || value === "INIT_COMPLETE" ||
          value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" || value === "UPDATE_COMPLETE" || value === "SNAPSHOT_COMPLETE") {
          tagType = "success";
        } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
          value === "CHECK_IN_PROGRESS" || value === "ADOPT_IN_PROGRESS" ||
          value === "DELETE_IN_PROGRESS" || value === "INIT_IN_PROGRESS" || value === "RESUME_IN_PROGRESS" ||
          value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" || value === "UPDATE_IN_PROGRESS" || value === "SNAPSHOT_IN_PROGRESS") {
          tagType = "info";
        } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
          value === "CHECK_FAILED" || value === "ADOPT_FAILED" || value === "DELETE_FAILED" ||
          value === "INIT_FAILED" || value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
          value === "SUSPEND_FAILED" || value === "UPDATE_FAILED" || value === "SNAPSHOT_FAILED") {
          tagType = "danger";
        }
        return tagType;
      }
    }
  }
</script>
<style scoped>

</style>
