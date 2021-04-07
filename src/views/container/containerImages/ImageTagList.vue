<template>
  <div>
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <div class="divider clearfix"></div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="name"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
     <!--  <el-table-column type="expand">
        <template slot-scope="scope">
          
        </template>
      </el-table-column> -->
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('pullCmd') >= 0"
        prop="pullCmd"
        :label="$t('container.pullCommand')"
        show-overflow-tooltip
        min-width="130" align="left">
        <template slot-scope="scope">
          <span>{{pullCmdRender(scope.row)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('created') >= 0"
        prop="created"
        :label="$t('container.imageCreateTime')"
        show-overflow-tooltip
        sortable="custom"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{dateFormatter(scope.row.created)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('docker_version') >= 0"
        prop="docker_version"
        :label="$t('container.dockerVersion')"
        show-overflow-tooltip
        align="left"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('architecture') >= 0"
        prop="architecture"
        :label="$t('container.structure')"
        show-overflow-tooltip
        align="left"
        min-width="80">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('os') >= 0"
        prop="os"
        :label="$t('container.os')"
        show-overflow-tooltip
        align="left"
        min-width="80">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="7">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
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
  </div>
</template>
<script>
  export default {
    name: 'ImageTagList',
    props:{
      serverAddr:String,
      harborId:String,
      groupId:String,
      rowImageName:String
    },
    data () {
      return {
        dateFormatter:Vue.tzTimeFormatter,
        total: 0,
        columns: [],
        columnsChecked:["name", "pullCmd", "created", "docker_version", "architecture", "os"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        operationMenus:[{
          icon: "fa-remove",
          name: this.$t('lang.delete'),
          showflg: Vue.roleType == "0",
          readOnly: false,
          multi:false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              this.loading = true;
              this.$ajax({
                type:'POST',
                url: "api/cetus/v1/harbor/delete_tag",
                data: JSON.stringify({
                  harbor_id: this.harborId,
                  repository_name: this.rowImageName,
                  tag_name:selectedRows[0].name
                }),
                log:{
                  description:{
                    en:"Delete container image version:" + selectedRows[0].name,
                    zh_cn:"删除容器镜像版本:" + selectedRows[0].name
                  },
                  target:Vue.logTarget.containerImage
                },
                showErrMsg:false,
                successMsg:this.$t('container.deleteSuccessMsg'),
                successFun:() => {
                  this.loading = false;
                  this.getData();
                  this.$emit("refreshImageList");
                },
                errFun:(xhr, status, msg) => {
                  if (xhr.status == 401 && msg == "Unauthorized") {
                    this.$message.error(this.$t('container.containerImageAuthError'));
                  }
                  this.loading = false;
                  this.getData();
                  this.$emit("refreshImageList");
                }
              });
            }).catch(() => {
            });
          }.bind(this)
        }],
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
      // this.getData();
    },
    methods: {
      async getData(param, isClear = true) {
        let self = this;
        self.loading = true;
        try {
          let ajaxParam = {
            type: 'post',
            url: "api/cetus/v1/harbor/tags",
            data: JSON.stringify({
              "harbor_id": self.harborId,
              "repository_name": self.rowImageName
            })
          };
          let ret = await this.$ajax(ajaxParam);
          self.loading = false;
          let dataList = ret;
          // 查询过滤
          self.totalData = dataList;
          self.total = dataList.length;
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
      pullCmdRender(rowData) {
        let serverAddr = this.serverAddr;
        let serverIp = serverAddr.split(":")[0];
        let cmd = "docker pull " + serverIp + "/" + this.rowImageName + ":" + rowData.name;
        return cmd;
      }
    }
  };
</script>

