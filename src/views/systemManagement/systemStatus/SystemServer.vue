<template>
<div>
  <el-form :inline="true" :model="formInline" class="form-inline">
    <el-form-item>
      <el-input v-model="formInline.value" size="small" @blur="blurFun"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search' @click="onQuery" size="small">{{$t('base.query')}}</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div>
  <el-table
    ref="deTable"
    :data="tableData"
    v-loading="loading"
    :element-loading-text="$t('base.loadingData')"
    :default-sort="{prop:'name'}"
    highlight-current-row
    border
    stripe
    style="width: 100%"
    row-key="id"
    @sort-change="sortChange">
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('base.name')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('server') >= 0"
      prop="type"
      :label="$t('base.server')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('region') >= 0"
      prop="region"
      :label="$t('base.field')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('address') >= 0"
      prop="serverAddress"
      align="left"
      :label="$t('base.serverAddress')"
      :show-overflow-tooltip="false"
      min-width="300">
      <template slot-scope="scope">
        <span v-html="formatAddress(scope.row.serverAddress)"></span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="getTableData">
        </el-button>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <el-pagination
          class="right"
          layout="total"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
</div>
</template>
<script>
export default {
  name:"",
  data() {
    return {
      formInline:{
        value:""
      },
      tableData:[],
      loading:false,
      emptyText: Vue.t('base.noData'),
      total: 0,
      columns: [{
        prop: "name",
        label: Vue.t('base.name')
      }, {
        prop: "server",
        label: Vue.t('base.server')
      }, {
        prop: "region",
        label: Vue.t('base.field')
      }, {
        prop: "address",
        label: Vue.t('base.serverAddress')
      }],
      columnsChecked:["name", "server", "region", "address"]
    }
  },
  mounted() {
    //this.getTableData();
  },
  methods: {
    async getTableData() {
      this.loading = true
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/services"
      })
      let oret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/endpoints"
      })
      let pid = this.$cookie.get('pid');
      let dataArr = [];
      let obj = {};
      oret.endpoints.forEach((item, index) => {
        let service = ret.services.find((item1, index1) => {
          return item1.id == item.service_id
        })
        if (service.name) {
          item.name = service.name;
          item.type = service.type;
          item.url = item.url.replace('%(tenant_id)s', pid);
          if (obj[service.name]) {
            if (obj[service.name][item.region]) {
              obj[service.name][item.region][item.interface] = item;
            } else {
              obj[service.name][item.region] = {};
              obj[service.name][item.region][item.interface] = item;
            }
          } else {
            obj[service.name] = {};
            obj[service.name][item.region] = {};
            obj[service.name][item.region][item.interface] = item;
          }
        }
      })
      // ret.services.forEach((item, index) => {
      //   let arr = oret.endpoints.filter((item1, index1) => {
      //     return item1.service_id == item.id;
      //   })
      //   item.region = arr.length>0?arr[0].region:"";
      //   item.serverAddress = [];
      //   for (let i in arr) {
      //     item.serverAddress.push(arr[i].interface+":"+(arr[i].url).replace('%(tenant_id)s', pid));
      //   }
      // });
      for (var key in obj) {
        let item = obj[key];
        for (var key1 in item) {
          let item1 = item[key1];
          let row = {};
          let serverAddress = [];
          for (var key2 in item1) {
            serverAddress.push(item1[key2].interface+":"+item1[key2].url);
            row = item1[key2];
          }
          row.serverAddress = serverAddress;
          dataArr.push(row);
        }
      }
      let data = this.filter(dataArr);
      //过滤region
      let regionId = this.$cookie.get("region_id");
      data = data.filter((item) => {
        return item.id == regionId;
      })
      //排序
      data.sort(this.$sortFormatter(this.sortObj.sortField, this.sortObj.sortOrder))
      this.tableData = data;
      this.total = data.length;
      this.loading = false;
    },
    filter(arr) {
      let carr = [];
      if (this.formInline.value==="") {
        carr = arr;
        return carr;
      } else {
        let value = this.formInline.value;
        let keysArr = ["name", "type", "region"];
        arr.forEach((item) => {
          let flg = false;
          flg = keysArr.some((k) => {
            if (item[k]) {
              return item[k].indexOf(value)>-1
            } else {
              return false
            }
          })
          if (!flg) { //如果仍然是false,判断serverAddress
            flg = item.serverAddress.some((m) => {
              return m.indexOf(value)>-1
            })
          }
          if (flg) {
            carr.push(item);
          }
        })
        return carr;
      }
    },
    formatAddress(arr) {
      return arr.join('<br>');
    },
    onQuery() {
      this.getTableData();
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.sortObj = {
        sortOrder:obj.order,
        sortField:obj.prop
      };
      this.getTableData();
    },
    blurFun() {
      if (this.formInline.value.length>200) {
        this.formInline.value = '';
        this.$notify({
          message:Vue.t('base.ultraLong'),
          type:'warning'
        });
      }
    }
  }
}
</script>
