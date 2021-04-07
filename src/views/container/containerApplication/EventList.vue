<template>
  <div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'creation_time', order: 'descending'}"
      row-key="uid"
      @row-click="rowClick"
      @sort-change="sortChange">
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('container.applyEventName')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('event') >= 0"
        prop="event"
        :label="$t('container.applyEvent')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('event_detail') >= 0"
        prop="event_detail"
        :label="$t('container.applyEventDetail')"
        show-overflow-tooltip
        align="left"
        min-width="200">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('creation_time') >= 0"
        prop="creation_time"
        :label="$t('container.time')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span>{{dateFormatter(scope.row.creation_time)}}</span>
        </template>
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
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
    name: 'EventList',
    data () {
      return {
        dateFormatter:Vue.tzTimeFormatter,
        appName:this.$route.params.appName,
        nameSpace:this.$route.params.nameSpace,
        type:this.$route.params.type,
        rancherClusterId:this.$route.params.rancherClusterId,
        appId:"",
        total: 0,
        columns: [],
        columnsChecked:["name", "event", "event_detail", "creation_time"],
        tableData: [],
        totalData:[],
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
      this.getApp();
    },
    methods: {
      async getApp() {
        let self = this;
        try {
          let rcResponse = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_app',
            data:JSON.stringify({
              app_name:self.appName,
              app_type:self.type,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            })
          });
          self.appId = rcResponse.metadata.uid;
          self.getEventList();
        } catch (data) {
        }
      },
      async getEventList() {
        let self = this;
        self.loading = true;
        try {
          let ret = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_events',
            data:JSON.stringify({
              app_name:self.appName,
              app_id:self.appId,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            }),
            successFun:function(response) {
              let dataList = response.items;
              self.totalData = [];
              for (let data of dataList) {
                let obj = {};
                obj.uid = data.metadata.uid;
                obj.name = data.metadata.name;
                obj.event = data.reason;
                obj.event_detail = data.message;
                obj.creation_time = data.metadata.creationTimestamp;
                self.totalData.push(obj);
              }
              self.total = self.totalData.length;
              self.totalData.sort(self.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
            }
          });
          self.loading = false;
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
          self.totalData.sort(self.$sortFormatter(key, keyOrder));
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getEventList();
      }
    }
  };
</script>

