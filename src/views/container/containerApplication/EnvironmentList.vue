<template>
  <div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="name"
      @row-click="rowClick">
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('container.key')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('value') >= 0"
        prop="value"
        :label="$t('container.value')"
        show-overflow-tooltip
        align="left"
        min-width="100">
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
    name: 'EnvironmentList',
    data () {
      return {
        appName:this.$route.params.appName,
        nameSpace:this.$route.params.nameSpace,
        type:this.$route.params.type,
        rancherClusterId:this.$route.params.rancherClusterId,
        total: 0,
        columns: [],
        columnsChecked:["name", "value"],
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
      this.getPodList();
    },
    methods: {
      async getPodList() {
        let self = this;
        try {
          self.loading = true;
          let ret = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_pods',
            data:JSON.stringify({
              app_name:self.appName,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            }),
            successFun:function(response) {
              let items = response.items || [];
              let dataList = [];
              for (let item of items) {
                dataList.push(item);
              }
              self.totalData = [];
              for (let data of dataList) {
                if (data.spec.containers[0].env) {
                  self.totalData = data.spec.containers[0].env;
                  break;
                }
              }
              self.total = self.totalData.length;
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
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getPodList();
      }
    }
  };
</script>

