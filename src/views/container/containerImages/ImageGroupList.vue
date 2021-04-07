<template>
  <div>
    <icos-page-header :title="$t('container.containerImage')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="true" />
    <icos-page>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('lang.name')">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="project_id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <!-- <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column> -->
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100" align="left">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('repo_count') >= 0"
        prop="repo_count"
        :label="$t('container.imageCount')"
        show-overflow-tooltip
        align="left"
        min-width="100">
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
          <span>{{dateFormatter(scope.row.creation_time)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('update_time') >= 0"
        prop="update_time"
        :label="$t('lang.modifyTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{dateFormatter(scope.row.update_time)}}</span>
        </template>
      </el-table-column> 
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <!-- <span>当前选中 {{multipleSelection.length}}条</span> -->
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
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-row>
    </div>
    </icos-page>
  </div>
</template>
<script>
  export default {
    name: 'ImageGroupList',
    data () {
      return {
        formInline: {
          name:""
        },
        harborId: this.$route.params.harborId,
        dateFormatter:Vue.tzTimeFormatter,
        createHarborFlag:false,
        updateHarborFlag:false,
        reloadTblFlag:false,
        total: 0,
        columns: [],
        columnsChecked:["name", "repo_count", "creation_time", "update_time"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        queryParam: {
          filed: "",
          dir: ""
        },
        loading: false
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
    methods: {
      async getData(param, isClear = true) {
        let self = this;
        self.loading = true;
        try {
          let ajaxParam = {
            type: 'POST',
            url: "api/cetus/v1/harbor/projects?reqType=https",
            data: JSON.stringify({
              harbor_id:self.harborId
            })
          };
          let ret = await this.$ajax(ajaxParam);
          self.loading = false;
          let dataList = ret;
          // 查询过滤
          self.totalData = self.filterList(dataList, self.formInline);
          self.total = self.totalData.length;
          // 排序
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
        } catch (data) {
          self.loading = false;
        }
        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
      },
      filterList(allData, formInline) {
        let nameFilteredData = [];
        if (formInline.name === '') {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(formInline.name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        return nameFilteredData;
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //排序
      sortChange(column) {
        var self = this;
        var key = column.prop;
        var keyOrder = column.order;
        self.queryParam.key = column.prop;
        self.queryParam.keyOrder = column.order;
        if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getData(this.queryParam, true);
      },
      rowNameClick(rowIndex, rowData) {
        let serverAddr = this.$route.params.server;
        let groupId = rowData.project_id;
        let groupName = rowData.name;
        this.$router.push({
          path:"/container/containerImages/imageGroup/"+ this.harborId+"/"+ serverAddr + "/" + groupId + "/" + groupName + "/imageList"
        });
      },
      onSubmit() {
        if (this.formInline.name.length > 40) {
          this.$message.error(this$t('heat.fortyCharacterMaximum'));
          return;
        }
        this.getData();
      },
      handlePageHeaderBack () {
        this.$router.push({
        path:"/container/containerImages"
      });
      }
    }
  };
</script>

