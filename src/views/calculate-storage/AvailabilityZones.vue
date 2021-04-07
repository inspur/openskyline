<template>
   <div> 
    <!-- <span>可用域(AZ)列表</span> -->
    <el-form class="form-inline">
      <el-form-item>
        <span>{{$t('calcStorLang.azList')}}</span>
      </el-form-item>
      <el-form-item :label="$t('lang.name')">
        <el-input :placeholder="$t('lang.name')" size="small" style="width:163px" v-model="azName"></el-input>
        <el-button type="primary" icon='fa-search' size="small" @click="availablitySearch">{{$t('lang.query')}}</el-button>
      </el-form-item>
      <el-form-item>
      <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" 
        row-key="id" @current-change="handleSelectionChange">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="zoneName" :label="$t('lang.name')" min-width="110">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('hosts') >= 0" prop="description" :label="$t('calcStorLang.host')">
          <template slot-scope="scope">
            <span v-html="hostRender(scope.row.hosts, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('zoneState') >= 0" prop="enabled" :label="$t('lang.enable')" min-width="60">
          <template slot-scope="scope">
            <span v-html="statusRender(scope.row.zoneState.available, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      </el-form-item>
    </el-form>
    <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
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
      <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
  </div>
</div>
</template>
<script>
export default {
  name: 'domain',
  data() {
    return {
      currentPage: 1,
      azName: '',
      azHostList: [],
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "hosts",
        label: Vue.t('calcStorLang.host')
      }, {
        prop: "zoneState",
        label: Vue.t('lang.enable')
      }],
      columnsChecked: ['name', 'hosts', 'zoneState'],
      tableData: [],
      multipleSelection: [],
      operFlag: false,
      totalData:[],
      domainId: ''
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      var self = this;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-availability-zone/detail'
        });
        self.loading = false;
        self.totalData = result['availabilityZoneInfo'];
        self.azHostList = result['availabilityZoneInfo'];
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('calcStorLang.getError'));
      }
    },
    availablitySearch() {
       var self = this;
       var rets = [];
       var name = self.azName;
       this.multipleSelection = [];
       if ( name != "") {
         for (let t = 0; t < self.azHostList.length; t++) {
           var obj = self.azHostList[t];
           if (obj['zoneName'].indexOf(name) >= 0) {
             rets.push(obj);
           }
         }
           self.totalData = rets;
      } else {
        self.getData();
      }
    },
    handleSelectionChange(val) {
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
      }
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      this.multipleSelection = [];
      this.getData();
    },
    hostRender(value, row) {
       if (value != null) {
          var hosts = "";
          for (let h in value) {
            let host = value[h];
            let up = true;
            for (let f in host) {
              if (host[f].available === false) {
                up = false;
              }
            }
             hosts += (h + "(" + (up ? Vue.t('calcStorLang.serverRunning') : Vue.t('calcStorLang.serverDown')) + ")") + "<br>";
          }
          return hosts;
       } else {
          return '--';
       }
    },
    statusRender(value, row) {
      if ( (value + "") == "true") {
          return Vue.t('lang.enable');
      } else {
          return Vue.t('lang.disable');
      }
    }
  }
}
</script>
<style scoped>
</style>