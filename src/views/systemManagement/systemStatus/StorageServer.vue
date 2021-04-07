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
    highlight-current-row
    border
    stripe
    style="width: 100%"
    row-key="id"
    :default-sort="{prop:'binary'}"
    @sort-change="sortChange">
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="binary"
      :label="$t('base.name')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('host') >= 0"
      prop="host"
      :label="$t('base.host')"
      align="left"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('usableArea') >= 0"
      prop="zone"
      align="left"
      :label="$t('base.usableArea')"
      sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      align="left"
      :label="$t('base.activationState')"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <el-tag type="success" v-if="scope.row.status=='enabled'">{{$t('base.activation')}}</el-tag>
        <el-tag type="danger" v-if="scope.row.status!='enabled'">{{$t('base.disable')}}</el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status1') >= 0"
      prop="state"
      align="left"
      :label="$t('base.startState')"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <el-tag type="success" v-if="scope.row.state=='up'">{{$t('base.startUp')}}</el-tag>
        <el-tag type="danger" v-if="scope.row.state!='up'">{{$t('base.close')}}</el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('recentUpdate') >= 0"
      prop="updated_at"
      align="left"
      :label="$t('base.recentUpdate')"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.updated_at}}</span>
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
        prop: "host",
        label: Vue.t('base.host')
      }, {
        prop: "usableArea",
        label: Vue.t('base.usableArea')
      }, {
        prop: "status",
        label: Vue.t('base.activationState')
      }, {
        prop: "status1",
        label: Vue.t('base.startState')
      }, {
        prop: "recentUpdate",
        label: Vue.t('base.recentUpdate')
      }],
      columnsChecked:["name", "host", "usableArea", "status", "status1", "recentUpdate"]
    }
  },
  mounted() {
    //this.getTableData();
  },
  methods: {
    async getTableData() {
      this.loading = true
      let pid = this.$cookie.get('pid')
      let ret = await this.$ajax({
        type: 'get',
        url: "api/cinderv2/v2/"+pid+"/os-services"
      })
      let data = this.filter(ret.services);
      //排序
      data.sort(this.$sortFormatter(this.sortObj.sortField, this.sortObj.sortOrder))
      this.tableData = data;
      this.total = data.length;
      this.loading = false;
    },
    filter(arr) {
      let me = this;
      arr.forEach((item) => {
        item.stateFormat = item.state=="up"?this.$t('base.startUp'):this.$t('base.close');
        item.statusFormat = item.status=="enabled"?this.$t('base.activation'):this.$t('base.disable');
        item.updated_at = me.formatTime(item.updated_at);
      })
      let carr = [];
      if (this.formInline.value==="") {
        carr = arr;
        return carr;
      } else {
        let value = this.formInline.value;
        let keysArr = ["binary", "host", "zone", "stateFormat", "statusFormat", "updated_at"];
        arr.forEach((item) => {
          let flg = false;
          flg = keysArr.some((k) => {
            if (item[k]) {
              return item[k].indexOf(value)>-1
            } else {
              return false
            }
          })
          if (flg) {
            carr.push(item);
          }
        })
        return carr;
      }
    },
    onQuery() {
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
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.sortObj = {
        sortOrder:obj.order,
        sortField:obj.prop
      };
      this.getTableData();
    },
    formatTime(dateTime) {
      if (typeof dateTime == "string") {
        dateTime = dateTime.replace('T', ' ');
      }
      let date = this.$stringToDate(dateTime);
      let d = new Date(date.getTime()+8*3600*1000);
      let year = d.getFullYear();
      let month = (d.getMonth()+1)+"";
      let da = d.getDate()+"";
      let hour = d.getHours()+"";
      let miu = d.getMinutes()+"";
      let sec = d.getSeconds()+"";
      return year+"-"+(month.length==1?"0"+month:month)+"-"+(da.length==1?"0"+da:da)+" "+(hour.length==1?"0"+hour:hour)+":"+(miu.length==1?"0"+miu:miu)+":"+(sec.length==1?"0"+sec:sec);
    }
  }
}
</script>